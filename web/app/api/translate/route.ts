import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, source_language = 'en', target_language } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!target_language) {
      return NextResponse.json(
        { error: 'target_language is required' },
        { status: 400 }
      );
    }

    if (source_language === target_language) {
      return NextResponse.json({
        source_text: text,
        translated_text: text,
        source_language,
        target_language,
      });
    }

    // Attempt to proxy to FastAPI backend if available
    try {
      const backendRes = await fetch('http://localhost:8000/api/v1/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          source_language,
          target_language,
        }),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      // Backend not running / reachable; proceed with fallback
    }

    // Default return
    return NextResponse.json({
      source_text: text,
      translated_text: text,
      source_language,
      target_language,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Translation error' },
      { status: 500 }
    );
  }
}
