// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { input } = await req.json();
  
  if (!input) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=' + process.env.GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: input }] }] })
  });

  const data = await response.json();
  return NextResponse.json({ output: data.candidates?.[0]?.content?.parts?.[0]?.text || '' });
}
