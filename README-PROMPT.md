# Prompt to Build "Artha" - A Personal Finance AI App

This document provides a detailed specification to build the "Artha" web application using React.js and Tailwind CSS.

---

### **1. Core Concept & Style Guidelines**

**App Name:** Artha

**Tagline:** Your Financial Brain. That Actually Knows You.

**Core Idea:** An AI-powered financial assistant that provides personalized, culturally-aware, and behavior-driven financial advice. It moves beyond generic recommendations by understanding user habits, biases, and life events.

**Style Guidelines:**
*   **Primary Color:** Deep Indigo-Violet (`#5A4FCF`) - For wisdom and trust.
*   **Secondary Color:** Vibrant Teal-Aqua (`#00CBA8`) - For clarity and positive indicators.
*   **Neutral Palette:** Soft, warm grays (`#F5F7FA`, `#E0E4EB`, `#6B7280` in light mode; dark mode equivalents are darker shades of gray).
*   **Highlight Color:** Subtle Goldenrod (`#FFD700`) - Used sparingly for special callouts (e.g., Diwali-related recommendations).
*   **Fonts:** `Inter` for all body and headline text.
*   **Overall Feel:** Modern, clean, professional, and trustworthy. Use rounded corners (`rounded-xl` for cards), subtle shadows (`shadow-sm`), and a clean layout with ample whitespace.
*   **Animations:**
    *   **Page Transitions:** Implement a gentle fade-in/fade-out animation when navigating between pages.
    *   **Micro-interactions:** Add smooth hover effects on buttons and interactive elements.

---

### **2. Application Structure & Pages**

The application is a single-page app (SPA) with a main layout containing a sidebar and a header.

**Main Layout:**
*   **Sidebar (Left):** A collapsed, icon-only navigation bar. On hover, tooltips appear revealing the page name (e.g., "Dashboard", "AI Chat"). The active page icon should have a highlighted background.
*   **Header:** Displays breadcrumbs for navigation (e.g., Home > Dashboard) and a user avatar with a dropdown menu for profile/settings links.
*   **Content Area:** Where the page content is rendered with the fade transition effect.

**Pages to Implement:**

**a. Landing Page (`/`)**
*   **Header:** A simple header with the "Artha" logo and a primary call-to-action (CTA) button "Experience Artha".
*   **Hero Section:** Large, bold headline: "Your Financial Brain. That Actually Knows You." with a descriptive paragraph below. Include a primary CTA button.
*   **3-Tier AI Architecture Section:** Display three feature cards side-by-side, detailing the "Foundation," "Intelligence," and "Strategic" tiers of AI agents. Each card should list the specific agents within it (e.g., Core Financial Advisor, Risk Profiling).
*   **Human-Centric Intelligence Section:** Two prominent cards explaining "Cultural Fluency" and "Behavioral Mastery," with descriptions and example text.
*   **Footer:** A simple footer with a copyright notice.

**b. Dashboard (`/dashboard`)**
*   **Overview Cards:** A row of four cards displaying key metrics: "Net Worth," "Monthly Income," "Credit Score," and "Monthly EMI." Each card has an icon, title, value, and a percentage change from the last month.
*   **Main Chart Card:** A large card containing an `AreaChart` for "Spending Trends." This card also has a header with a primary CTA button: "Get Financial Summary."
    *   **Financial Summary Modal:** Clicking the CTA opens a modal. Initially, it shows a loading spinner with "Artha is thinking...". After a simulated delay, it displays the AI-generated summary divided into three sections: "Overall Health," "Key Concerns," and "Actionable Recommendations," each with a corresponding icon and colored border.
*   **Anomaly Alerts Card:** A card that lists proactive alerts (e.g., "Unusual Spending Spike," "Idle Savings Opportunity"). Each alert has an icon, title, amount, and description.
*   **Personalized Recommendations Card:** Lists actionable insights (e.g., "Diwali Budget Planning"). Each item has an icon, title, description, and a "See Details" button.

**c. AI Chat (`/chat`)**
*   **Layout:** A full-height chat interface within a card.
*   **Header:** Displays the Artha avatar, name, and status ("Your Financial Brain").
*   **Message Area:** A scrollable area displaying the conversation. User messages are right-aligned with a primary color background. AI messages are left-aligned with a secondary color background.
*   **Thinking Animation:** When the AI is "thinking," display a special message bubble. It should say "Artha is thinking..." and show an animated sequence of the steps it's taking (e.g., "Analyzing financial data...", "Consulting risk factors..."). Each step should appear with a small, animated loader icon next to it.
*   **Input Area:**
    *   A `Textarea` for user input, styled as a rounded pill.
    *   A prominent "Send" button.
    *   Below the message area, show 2-3 AI-generated quick reply "Suggestion" buttons.

**d. Portfolio (`/portfolio`)**
*   **Header:** Page title and description.
*   **Main Content (2-column layout):**
    *   **Left Column:**
        *   **Performance Chart Card:** A `LineChart` showing portfolio value over time.
        *   **Holdings Table:** A table listing individual investments with columns for Investment Name, Type (as a badge), Current Value, Returns (%), and Allocation (%).
    *   **Right Column:**
        *   **Total Value Card:** A simple card showing the total portfolio value and year-to-date returns.
        *   **Asset Allocation Card:** A card showing the allocation mix (e.g., Equity, Debt). Use a stacked progress bar to visually represent the allocation percentages, with a key below.

**e. Goals (`/goals`)**
*   **Header:** Page title and an "Add New Goal" button.
*   **Goals Grid (2-column):** A grid of cards, each representing a financial goal (e.g., "Emergency Fund," "House Down Payment").
    *   **Goal Card:** Each card should contain an icon, title, category (as a badge), a progress bar, current vs. target amount, and a deadline.
*   **Recommendations Card:** A card at the bottom titled "Goal Insights & Recommendations" that displays a grid of AI-powered tips (e.g., "On Track," "Smart Tip," "Needs Attention"). Each tip has a distinct color, icon, and title.

**f. Insights (`/insights`)**
*   **Behavioral Insights Card:** Contains two charts side-by-side.
    *   **Financial Biases Chart:** A `RadarChart` to visualize user biases (e.g., Risk Aversion, Herding Behavior).
    *   **Emotional Spending Chart:** An `AreaChart` correlating spending with stress levels.
*   **Regional Investment Insights Card:** A `BarChart` comparing real estate investment potential (Rental Yield vs. Appreciation) across different cities. Include a text summary of the insight below the chart.

**g. Map (`/map`)**
*   **Layout (2-column):**
    *   **Left (Large Column):** A placeholder for an interactive map, currently showing a static image with an overlay stating "Interactive Map Coming Soon."
    *   **Right (Small Column):**
        *   **Data Layers Card:** Checkboxes to toggle map data layers (e.g., Residential, Commercial).
        *   **Hyperlocal Opportunities Card:** A scrollable list of AI-generated investment opportunities in specific locations.

**h. Settings (`/settings`)**
*   **Layout (2-column):**
    *   **Left Column:** A navigation card with buttons for different settings sections: "Profile," "Appearance," "Notifications," and "Privacy."
    *   **Right Column:** A card that displays the content for the active section.
        *   **Profile:** Fields to update user name and photo.
        *   **Appearance:** A toggle switch for Light/Dark mode.
        *   **Notifications & Privacy:** Various toggle switches for different preferences.

---

### **3. Key Components & Logic**

*   **UI Library:** The design is based on **ShadCN UI** components. You will need to create React + Tailwind versions of these components: `Button`, `Card`, `Avatar`, `Input`, `Textarea`, `Progress`, `Badge`, `Tooltip`, `Dialog` (for modals), `Switch`, `Table`, `Tabs`, `Separator`, `Checkbox`, etc.
*   **Charts:** Use a charting library like **Recharts**. Ensure all charts are responsive and styled to match the app's theme (light/dark mode).
*   **State Management:** Use React hooks (`useState`, `useEffect`, `useContext`) for managing component state.
*   **AI Integration (Simulation):** For the React/Tailwind build, you can simulate the AI responses. When a user action would call an AI flow (like sending a chat message or generating a financial summary), use `setTimeout` to simulate the network delay and return a hardcoded JSON object that matches the expected output structure. This will allow you to build the full UI and user experience.
