# Artha App - Fi-MCP Authentication Documentation

This document explains how the Fi-MCP (Mobile Connect Protocol) authentication system is integrated into this Next.js application and how you can get it working with the real Go middleware.

## Overview

The authentication flow is based on a **popup window** that directs the user to the Go middleware to authenticate. The communication between the popup and the main application is handled securely using the `window.postMessage` API.

1.  **The Next.js Front-End (Client-Side)**: This is what has been implemented. It includes the UI (a login dialog that opens a popup) and a React context (`AuthContext`) that listens for a success message from the popup.
2.  **The Go Middleware (Server-Side)**: This is the secure backend from the `epiFi/fi-mcp-dev` repository. **You must run this server yourself separately.** This application's front-end is designed to interact with it.

The flow works as follows:
```
1. User clicks "Log In" in the Next.js app.
2. The app opens a popup window pointing to the Go server's login page (e.g., https://artha-mcp-server.onrender.com/mockWebPage?sessionId=...).
3. The Next.js app now actively listens for a message from this popup.
4. User interacts with the Go server's page in the popup, enters a valid test phone number, and submits.
5. The Go server authenticates the user, associates the phone number with the session ID, and redirects the popup to a `login_successful.html` page.
6. The `login_successful.html` page contains a script that uses `window.opener.postMessage(...)` to send a success message back to the main Next.js application window.
7. The Next.js app's listener receives this message, verifies it, closes the popup, stores the successful session ID, and updates the UI to a logged-in state.
```

## How to Use It

### Step 1: Run the Go Middleware

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/epiFi/fi-mcp-dev.git
    ```
2.  **Follow its Setup Instructions**: Navigate into the cloned directory and follow the `README.md` file within that project to install dependencies and start the Go server.
3.  **Ensure it's Running**: The Go server should be running on `https://artha-mcp-server.onrender.com`.

### Step 2: Start the Next.js App

Run the development server for this project as usual:

```bash
npm run dev
```

### Step 3: Test the Login Flow

1.  Open the Artha app in your browser (`http://localhost:9002`).
2.  Click the user icon in the top-right and select "Log In".
3.  A popup window will appear, loading `https://artha-mcp-server.onrender.com/mockWebPage?sessionId=...`.
4.  In the popup, enter one of the valid test phone numbers from the Fi-MCP documentation (e.g., `8000000000`) and click "Submit".
5.  The popup page will show "Login Successful!". The main application window will detect the success message, close the popup automatically, and update to show you as logged in.
6.  You can now test authenticated functionality, like making API calls from the dashboard.
