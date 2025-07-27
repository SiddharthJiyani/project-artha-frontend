// types/auth.ts

/**
 * Represents the authentication state within the React application.
 */
export interface AuthState {
    sessionId: string | null;
    isAuthenticated: boolean;
    phoneNumber: string | null;
}
  
/**
 * Defines the shape of the response from our Next.js login API route.
 */
export interface LoginResponse {
    success: boolean;
    sessionId?: string; // The session ID confirmed by the backend.
    error?: string; // A user-friendly error message.
    
    // Fields specific to the MCP flow
    loginRequired?: boolean; // True if the user needs to complete steps on another page.
    loginUrl?: string; // The URL the user should be redirected to.
}

/**
 * Represents the structure of a request to call a tool via the MCP backend.
 */
export interface ToolCallRequest {
    sessionId: string;
    toolName: string;
    params?: Record<string, any>;
}
  
/**
 * Defines the response from a tool call.
 */
export interface ToolCallResponse {
    success: boolean;
    data?: any; // The data returned by the tool.
    error?: string;
    loginRequired?: boolean; // If the session is invalid, the backend can prompt for re-login.
    loginUrl?: string;
}

/**
 * A specific error structure when the MCP flow requires login.
 */
export interface MCPLoginRequiredResponse {
    status: 'login_required';
    login_url: string;
    message: string;
}
