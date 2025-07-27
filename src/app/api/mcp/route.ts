// src/app/api/mcp/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sessionId = request.headers.get('mcp-session-id');
    
    console.log('Proxying MCP request:', {
      hasSessionId: !!sessionId,
      sessionId: sessionId ? sessionId.substring(0, 20) + '...' : 'none',
      bodyLength: body.length
    });

    // Forward the request to the Go server
    const response = await fetch('https://artha-mcp-server.onrender.com/mcp/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId && { 'Mcp-Session-Id': sessionId }),
      },
      body: body,
    });

    console.log('Go server response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Go server error:', errorText);
      return new Response(errorText, { 
        status: response.status,
        statusText: response.statusText 
      });
    }

    const data = await response.text();
    
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('MCP Proxy Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, mcp-session-id',
    },
  });
}
