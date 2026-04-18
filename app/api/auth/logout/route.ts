import { NextResponse } from 'next/server';

export async function POST() {
  // Logout is handled client-side by removing the token
  // Server-side we just return success
  return NextResponse.json({
    message: 'Logged out successfully',
  });
}
