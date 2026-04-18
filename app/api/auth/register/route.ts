import { NextRequest, NextResponse } from 'next/server';
import { prisma, hashPassword, generateVerificationToken, getUserByEmail } from '@/lib/auth';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = generateVerificationToken();

    // Auto-verify in development mode (no email verification needed)
    const isDev = process.env.NODE_ENV === 'development';
    const isVerified = isDev || !resend;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        verificationToken,
        isVerified,
      },
    });

    // Send verification email (if RESEND_API_KEY is configured)
    if (resend) {
      try {
        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${verificationToken}`;
        await resend.emails.send({
          from: 'Hashtagger <noreply@hashtagger.ai>',
          to: email,
          subject: 'Verify your Hashtagger account',
          html: `
            <h1>Welcome to Hashtagger!</h1>
            <p>Please verify your email by clicking the button below:</p>
            <a href="${verifyUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Verify Email</a>
            <p>Or copy this link: ${verifyUrl}</p>
            <p>This link expires in 24 hours.</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }
    }

    return NextResponse.json({
      message: 'User created. Please check your email to verify your account.',
      userId: user.id,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
