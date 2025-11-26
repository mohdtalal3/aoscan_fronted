import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

export async function getGoogleSheetsClient() {
    try {
        const credsJson = process.env.CREDENTIALS_JSON;
        if (!credsJson) {
            throw new Error('CREDENTIALS_JSON not found in environment');
        }

        const creds = JSON.parse(credsJson);
        const auth = new google.auth.GoogleAuth({
            credentials: creds,
            scopes: SCOPES,
        });

        const sheets = google.sheets({ version: 'v4', auth });
        return sheets;
    } catch (error) {
        console.error('❌ Error initializing Google Sheets:', error);
        return null;
    }
}

export async function verifyEmailInSheet(email: string): Promise<{
    success: boolean;
    message: string;
    user_data?: {
        name: string;
        email: string;
        date: string;
    };
}> {
    try {
        const sheets = await getGoogleSheetsClient();
        if (!sheets) {
            return {
                success: false,
                message: 'Error connecting to database',
            };
        }

        const spreadsheetId = process.env.SPREADSHEET_ID;
        if (!spreadsheetId) {
            return {
                success: false,
                message: 'Spreadsheet ID not configured',
            };
        }

        // Get all values from the sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Sheet1', // Adjust if your sheet has a different name
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return {
                success: false,
                message: 'No data found in spreadsheet',
            };
        }

        // First row is headers
        const headers = rows[0].map((h: string) => h.toLowerCase().trim());
        const emailIndex = headers.indexOf('email');
        const nameIndex = headers.indexOf('name');
        const dateIndex = headers.indexOf('date');
        const expireIndex = headers.indexOf('expire');

        if (emailIndex === -1) {
            return {
                success: false,
                message: 'Email column not found in spreadsheet',
            };
        }

        // Search for matching email in data rows
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const rowEmail = row[emailIndex]?.toString().trim().toLowerCase();

            if (rowEmail === email.trim().toLowerCase()) {
                // Check expiration status
                const expireStatus = row[expireIndex]?.toString().trim().toUpperCase();

                if (expireStatus === 'TRUE') {
                    return {
                        success: false,
                        message: 'Your access has expired. Please contact support to renew.',
                    };
                } else if (expireStatus === 'FALSE') {
                    return {
                        success: true,
                        message: 'Access granted',
                        user_data: {
                            name: row[nameIndex]?.toString() || 'User',
                            email: row[emailIndex]?.toString() || '',
                            date: row[dateIndex]?.toString() || '',
                        },
                    };
                } else {
                    return {
                        success: false,
                        message: 'Invalid expiration status in database',
                    };
                }
            }
        }

        // Email not found
        return {
            success: false,
            message: 'Email not found. Please check your email or contact support.',
        };
    } catch (error) {
        console.error('❌ Error verifying email:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'An error occurred',
        };
    }
}
