import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat, unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        // Get max age in hours from request (default: 24 hours)
        const body = await request.json().catch(() => ({}));
        const maxAgeHours = body.maxAgeHours || 24;
        const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        
        // Get all files in uploads directory
        const files = await readdir(uploadsDir);
        
        let deletedCount = 0;
        let errorCount = 0;
        const deletedFiles: string[] = [];
        
        const now = Date.now();

        for (const filename of files) {
            // Skip .gitkeep file
            if (filename === '.gitkeep') continue;
            
            try {
                const filepath = path.join(uploadsDir, filename);
                const fileStat = await stat(filepath);
                
                // Check if file is older than max age
                const fileAge = now - fileStat.mtimeMs;
                
                if (fileAge > maxAgeMs) {
                    await unlink(filepath);
                    deletedFiles.push(filename);
                    deletedCount++;
                    console.log(`🗑️  Deleted old audio file: ${filename} (age: ${Math.round(fileAge / 3600000)}h)`);
                }
            } catch (error) {
                console.error(`❌ Error processing file ${filename}:`, error);
                errorCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Cleanup completed`,
            deletedCount,
            errorCount,
            deletedFiles,
            maxAgeHours
        });
    } catch (error) {
        console.error('❌ Error in cleanup:', error);
        return NextResponse.json(
            { success: false, error: 'Error during cleanup' },
            { status: 500 }
        );
    }
}
