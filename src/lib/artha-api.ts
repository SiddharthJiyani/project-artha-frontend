// src/lib/artha-api.ts
interface ArthaApiRequest {
  user_id: string;
  session_id: string;
  query: string;
}

interface ArthaApiResponse {
  status: string;
  message: string;
}

class ArthaApiService {
  private readonly baseUrl = 'https://adityachaudhary2913-agent-artha.hf.space';
  private readonly endpoint = '/start/';

  /**
   * Send message to Artha API - the response will come through Firebase
   * @param userId - Phone number of the user
   * @param sessionId - Session ID (new or existing)
   * @param query - User's query
   * @returns Promise<ArthaApiResponse>
   */
  async sendMessage(
    userId: string, 
    sessionId: string, 
    query: string
  ): Promise<ArthaApiResponse> {
    try {
      console.log('Sending message to Artha API:', {
        userId,
        sessionId,
        query: query.substring(0, 100) + (query.length > 100 ? '...' : '')
      });

      const requestBody: ArthaApiRequest = {
        user_id: userId,
        session_id: sessionId,
        query: query
      };

      const response = await fetch(`${this.baseUrl}${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Artha API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data: ArthaApiResponse = await response.json();
      
      console.log('Artha API response:', data);

      return data;

    } catch (error) {
      console.error('Failed to send message to Artha API:', error);
      throw error;
    }
  }

  /**
   * Generate a new session ID
   * @returns string - New session ID
   */
  generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Check if session ID is valid format
   * @param sessionId - Session ID to validate
   * @returns boolean
   */
  isValidSessionId(sessionId: string): boolean {
    return sessionId.startsWith('session_') && sessionId.length > 20;
  }
}

// Export singleton instance
export const arthaApi = new ArthaApiService();
export type { ArthaApiRequest, ArthaApiResponse };
