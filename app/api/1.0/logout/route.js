import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the JWT cookie
    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    response.cookies.set('_Host-sessionJWT', '', { maxAge: -1, path: '/', httpOnly: true, secure: true, sameSite: 'strict' });

    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Failed to log out' }, { status: 500 });
  }
}