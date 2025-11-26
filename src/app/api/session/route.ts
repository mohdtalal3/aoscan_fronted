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

        if (session.user_email && session.user_data) {
            return NextResponse.json({
                authenticated: true,
                user_email: session.user_email,
                user_data: session.user_data,
            });
        } else {
            return NextResponse.json({
                authenticated: false,
            });
        }
    } catch (error) {
        console.error('❌ Session check error:', error);
        return NextResponse.json({
            authenticated: false,
        });
    }
}
