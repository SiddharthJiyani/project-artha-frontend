// src/app/api/health/route.ts
export async function GET() {
  try {
    // Check if the Go server is running
    const response = await fetch('http://localhost:8080/health', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Go server health check failed: ${response.status}`);
    }

    const data = await response.json();
    
    return Response.json({
      frontend: 'healthy',
      backend: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    return Response.json(
      { 
        frontend: 'healthy',
        backend: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 503 }
    );
  }
}
