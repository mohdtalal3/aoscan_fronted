import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { verifyEmailInSheet } from '@/lib/googleSheets';
import { sessionOptions, SessionData } from '@/lib/session';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { success: false, message: 'Please enter your email' },
                { status: 400 }
            );
        }

        // Verify email in Google Sheets
        const result = await verifyEmailInSheet(email);

        if (result.success && result.user_data) {
            // Get session
            const cookieStore = await cookies();
            const session = await getIronSession<SessionData>(
                cookieStore,
                sessionOptions
            );

            // Store user data in session
            session.user_email = email;
            session.user_data = result.user_data;
            await session.save();

            return NextResponse.json(
                {
                    success: true,
                    message: result.message,
                    user_data: result.user_data,
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: result.message,
                },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        return NextResponse.json(
            { success: false, message: 'An error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
