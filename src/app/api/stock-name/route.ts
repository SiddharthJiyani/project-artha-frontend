// src/app/api/stock-name/route.ts
import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const stockNameCache = new Map<string, string>();

// Only “real” mappings here; placeholders starting with “Unknown” will be
// treated as unmapped and trigger a Gemini lookup.
const STOCK_MAPPINGS: Record<string, string> = {
  'INE040A01034': 'HDFC Bank Limited',
  'INE043D01016': 'IDFC Limited',
  'INE916P01025': 'Triveni Enterprises Limited',
  // Below entries are placeholders and will be ignored for direct return:
  'INE0BWS23018': 'Altius Telecom Infrastructure Ltd.',
  'INF204KB14I5': 'UTI Mutual Fund',
  'INE0CCU25019': 'Unknown Stock A',
  'INE0FDU25010': 'Brookfield India Real Estate Trust ',
  'INE0GGX23010': ' Powergrid Infrastructure Investment Trust ',
  'INF204KB14I2': ' Nippon India ETF Nifty 50 BeES',
};

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export async function POST(request: Request) {
  let isin: string;

  try {
    const body = await request.json();
    isin = (body.isin ?? '').trim();
    if (!isin) {
      return NextResponse.json(
        { error: 'ISIN is required' },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // 1) Cached?
  if (stockNameCache.has(isin)) {
    return NextResponse.json({
      stockName: stockNameCache.get(isin)!
    });
  }

  // 2) Predefined mapping?  Only use it if it's NOT an “Unknown…” placeholder
  const mapped = STOCK_MAPPINGS[isin];
  if (mapped && !/^Unknown/i.test(mapped)) {
    stockNameCache.set(isin, mapped);
    return NextResponse.json({ stockName: mapped });
  }

  // 3) No GEMINI key?  Fallback immediately
  if (!GEMINI_API_KEY) {
    const fallback = mapped || `Stock ${isin.slice(-6)}`;
    stockNameCache.set(isin, fallback);
    return NextResponse.json({ stockName: fallback });
  }

  // 4) Hit Gemini
  try {
    const prompt = `What is the exact company name for the Indian stock with ISIN code: ${isin}? Provide only the company name without any additional text.`;
    const resp = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    if (!resp.ok) throw new Error(`API ${resp.status}`);
    const data: GeminiResponse = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      // cleanup
      const cleaned = text
        .replace(/^(The company name.*?is:\s*)/i, '')
        .replace(/^(Company name:\s*)/i, '')
        .replace(/\.$/, '')
        .replace(/^["']|["']$/g, '')
        .trim();
      if (
        cleaned.length > 2 &&
        !/sorry|cannot/i.test(cleaned)
      ) {
        stockNameCache.set(isin, cleaned);
        return NextResponse.json({ stockName: cleaned });
      }
    }
  } catch (err) {
    console.error('Gemini lookup failed', err);
  }

  // 5) Final fallback to mapping (even if “Unknown…”) or generic
  const final = mapped || `Stock ${isin.slice(-6)}`;
  stockNameCache.set(isin, final);
  return NextResponse.json({ stockName: final });
}
