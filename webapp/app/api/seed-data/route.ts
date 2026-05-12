import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

let cachedSeedData: string | null = null;

export async function GET() {
  try {
    if (!cachedSeedData) {
      const dataPath = path.join(process.cwd(), 'lib', 'data.json');
      cachedSeedData = fs.readFileSync(dataPath, 'utf-8');
    }

    return new NextResponse(cachedSeedData, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error reading seed data:', error);
    return NextResponse.json({ error: 'Failed to load seed data' }, { status: 500 });
  }
}
