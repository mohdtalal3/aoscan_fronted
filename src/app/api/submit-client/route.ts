import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Get backend URL from env
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';

        console.log(`Proxying request to: ${backendUrl}/submit-client`);

        // Forward request to backend
        const response = await fetch(`${backendUrl}/submit-client`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        // Handle non-JSON responses or errors
        if (!response.ok) {
            const text = await response.text();
            console.error('Backend error:', response.status, text);
            return NextResponse.json(
                { success: false, message: `Backend error: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to connect to backend server' },
            { status: 500 }
        );
    }
}
