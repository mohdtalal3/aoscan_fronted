import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';

export async function POST(request: NextRequest) {
    try {
        // Get the session and destroy it
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
        
        // Clear session data
        session.destroy();
        
        return NextResponse.json({
            success: true,
            message: 'Session cleared'
        });
    } catch (error) {
        console.error('Error clearing session:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to clear session' },
            { status: 500 }
        );
    }
}
