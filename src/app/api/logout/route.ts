import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(
            cookieStore,
            sessionOptions
        );

        // Clear session
        session.destroy();

        return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
        console.error('❌ Logout error:', error);
        return NextResponse.redirect(new URL('/', request.url));
    }
}
