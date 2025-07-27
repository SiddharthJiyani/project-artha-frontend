// src/lib/gemini-api.ts

export async function fetchStockName(isin: string): Promise<string> {
  try {
    const response = await fetch('/api/stock-name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isin })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.stockName || `Stock ${isin.slice(-6)}`;
  } catch (error) {
    console.error('Error fetching stock name:', error);
    return `Stock ${isin.slice(-6)}`; // Return last 6 chars as fallback
  }
}
