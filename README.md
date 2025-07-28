# 🌟 Artha - Your AI-Powered Financial Advisor

> **Artha** (Sanskrit: अर्थ) meaning "wealth" or "purpose" - Your intelligent financial companion that understands your unique story, culture, and goals.

![Artha Dashboard](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-11.10.0-orange?style=for-the-badge&logo=firebase)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)


### 🚀 **Deployed URL**

You can access the live platform here:  
[**Deployed Url**](https://project-artha-frontend.vercel.app/)

### 🎥 **Video Demo**

For a quick walkthrough of the platform, check out the video demo:  
[**Video Demo**](https://drive.google.com/file/d/1rsh74J-axeJjIHHxS-evJQ8r7AcT9QGC/view?usp=drive_link)



### 🔐 **Login Credentials**  
To test the platform, use the following credentials:

- **Username**: `1313131313`
- **One-Time Password (OTP)**: `123456`



## 🚀 Overview

Artha is an advanced AI-powered financial advisory platform that goes beyond generic advice. Built with cutting-edge technology including Google's Genkit AI framework, Firebase, and a sophisticated multi-agent system, Artha provides personalized financial guidance that understands cultural nuances and individual circumstances.

### ✨ Key Features

- **🧠 Multi-Agent AI System**: Leveraging Google Genkit for intelligent financial analysis
- **📊 Comprehensive Dashboard**: Real-time financial overview with interactive charts
- **💬 Intelligent Chat Interface**: AI-powered financial conversations with thinking animations
- **🔍 Anomaly Detection**: Smart alerts for unusual financial patterns
- **📈 Portfolio Management**: Track investments, stocks, and financial goals
- **🎯 Personalized Recommendations**: Culturally-aware financial advice
- **📱 Responsive Design**: Beautiful UI with Radix UI components and Tailwind CSS
- **🔐 Secure Authentication**: Firebase Auth integration
- **📋 Financial Reports**: Generate comprehensive financial summaries

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- **Next.js 15.3.3** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations
- **Chart.js & Recharts** - Data visualization

**Backend & AI:**
- **Google Genkit** - AI framework for intelligent flows
- **Firebase** - Authentication, database, and hosting
- **Google Generative AI** - LLM integration
- **Model Context Protocol (MCP)** - AI agent communication

**UI/UX:**
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form management
- **React Markdown** - Rich text rendering
- **HTML2Canvas & jsPDF** - Report generation

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** (v18 or later)
- **npm** or **yarn** or **pnpm**
- **Firebase CLI** (optional, for deployment)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/SiddharthJiyani/project-artha-frontend.git
cd project-artha-frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google AI Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Additional API Keys
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

### 4. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Storage
3. Add your Firebase configuration to `.env.local`

## 🚀 Development

### Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

### Available Scripts

```bash
# Development with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run typecheck

# Start Genkit AI development
npm run genkit:dev

# Watch mode for Genkit
npm run genkit:watch
```

## 🎨 Design System

### Color Palette

- **Primary**: Deep Indigo-Violet (`#5A4FCF`) - Wisdom and trust
- **Secondary**: Vibrant Teal-Aqua (`#00CBA8`) - Clarity and growth
- **Neutral**: Soft warm grays (`#F5F7FA`, `#E0E4EB`, `#6B7280`)
- **Highlight**: Subtle Goldenrod (`#FFD700`) - Cultural richness

### Typography

- **Font Family**: Inter (Grotesque sans-serif)
- **Design**: Modern, clean, and highly readable

## 📱 Features Breakdown

### 🏠 Landing Page
- Animated "Trail of Light" explaining Artha's concepts
- Feature showcase with tier-based agent system
- Cultural awareness highlights

### 📊 Dashboard
- Net worth overview with sparkline charts
- Monthly income tracking
- Credit score monitoring
- Interactive financial trend charts

### 💬 AI Chat Interface
- Multi-agent thinking process visualization
- Context-aware financial conversations
- Real-time AI responses with loading states

### 📈 Portfolio Management
- Investment tracking
- Stock analysis
- Goal setting and monitoring

### 📋 Reports & Analytics
- AI-generated financial summaries
- Anomaly detection alerts
- Exportable reports (PDF format)

## 🔧 Configuration

### Tailwind CSS

The project uses a custom Tailwind configuration with:
- Custom color scheme
- Animation utilities
- Component-specific styling

### Next.js Configuration

- App Router architecture
- TypeScript strict mode
- Optimized build configuration

## 🚀 Deployment

### Vercel (Recommended)

1. **Set Environment Variables** in Vercel Dashboard:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

2. **Deploy**: Push to main branch for automatic deployment

3. **Verify**: Check that all routes work (not just `/`)

> **Note**: See `DEPLOYMENT_FIX.md` for detailed troubleshooting if you encounter build issues.

### Firebase Hosting

```bash
npm run build
firebase deploy
```

### Docker

```bash
docker build -t artha-frontend .
docker run -p 3000:3000 artha-frontend
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/            # Main application routes
│   │   ├── dashboard/     # Financial dashboard
│   │   ├── chat/          # AI chat interface
│   │   ├── portfolio/     # Investment portfolio
│   │   └── ...
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Radix)
│   └── ...
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── ai/                   # Genkit AI flows and configurations
└── contexts/             # React context providers
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Genkit** for AI framework
- **Radix UI** for accessible components
- **Tailwind CSS** for styling system
- **Next.js** team for the amazing framework


---

*Artha - Where AI meets personal finance, and wisdom meets wealth.*
