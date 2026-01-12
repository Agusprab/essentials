import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const status = process.env.NEXT_PUBLIC_STATUS_APP || 'OFFLINE';
  return NextResponse.json({ status });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !['ONLINE', 'OFFLINE'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be ONLINE or OFFLINE' }, { status: 400 });
    }

    // Path to .env file
    const envPath = path.join(process.cwd(), '.env');

    // Read current .env content
    const envContent = await fs.readFile(envPath, 'utf-8');

    // Replace the NEXT_PUBLIC_STATUS_APP line
    const updatedContent = envContent.replace(
      /export NEXT_PUBLIC_STATUS_APP="[^"]*"/,
      `export NEXT_PUBLIC_STATUS_APP="${status}"`
    );

    // Write back to .env
    await fs.writeFile(envPath, updatedContent, 'utf-8');

    // Note: In production, env vars won't reload automatically. You may need to restart the app.
    return NextResponse.json({ message: `Status updated to ${status}`, status });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}