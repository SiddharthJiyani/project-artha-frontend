
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Flame,
  BrainCircuit,
  ShieldCheck,
  LineChart,
  Target,
  Users,
  Building2,
  Gift,
  HandCoins,
  Scale,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    tier: 'Foundation Tier',
    color: 'text-accent',
    agents: [
      {
        icon: <LineChart className="h-8 w-8" />,
        name: 'Core Financial Advisor',
        description: 'Integrates all your financial data for a holistic view.',
      },
      {
        icon: <ShieldCheck className="h-8 w-8" />,
        name: 'Trust & Transparency',
        description: 'Ensures every insight is explainable and verifiable.',
      },
    ],
  },
  {
    tier: 'Intelligence Tier',
    color: 'text-primary',
    agents: [
      {
        icon: <Target className="h-8 w-8" />,
        name: 'Risk Profiling',
        description: 'Understands your true risk tolerance beyond questionnaires.',
      },
      {
        icon: <Sparkles className="h-8 w-8" />,
        name: 'Anomaly Detection',
        description: 'Catches unusual spending and potential fraud proactively.',
      },
      {
        icon: <Building2 className="h-8 w-8" />,
        name: 'Regional Investment',
        description: 'Finds opportunities based on hyper-local data.',
      },
    ],
  },
  {
    tier: 'Strategic Tier',
    color: 'text-yellow-500',
    agents: [
      {
        icon: <Scale className="h-8 w-8" />,
        name: 'Debt Management',
        description: 'Creates optimized strategies for becoming debt-free.',
      },
      {
        icon: <Users className="h-8 w-8" />,
        name: 'Wealth Transfer',
        description: 'Plans for your family’s future and inheritance.',
      },
      {
        icon: <Gift className="h-8 w-8" />,
        name: 'Cultural Events',
        description: 'Budgets for events like Diwali with cultural intelligence.',
      },
      {
        icon: <HandCoins className="h-8 w-8" />,
        name: 'Illiquid Asset',
        description: 'Advises on assets like real estate and gold.',
      },
    ],
  },
];

const behavioralPoints = [
  {
    icon: <Flame className="h-10 w-10 text-yellow-500" />,
    title: 'Cultural Fluency',
    description: "Artha understands nuances like planning for Diwali, managing family expectations, and the importance of gold, making your financial plan truly yours.",
    example: 'Example: "Allocate ₹15,000 for Diwali gifts and travel."',
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-primary" />,
    title: 'Behavioral Mastery',
    description: "We identify your cognitive biases—like panic selling during market dips or chasing trends—and provide personalized coaching to help you make smarter decisions.",
    example: 'Insight: "You tend to panic-sell when the market drops 10%."',
  },
  
];

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
            <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary"
            >
                <path
                d="M16 3C8.82 3 3 8.82 3 16C3 23.18 8.82 29 16 29C23.18 29 29 23.18 29 16C29 8.82 23.18 3 16 3ZM16 26.5C10.2025 26.5 5.5 21.7975 5.5 16C5.5 10.2025 10.2025 5.5 16 5.5C21.7975 5.5 26.5 10.2025 26.5 16C26.5 21.7975 21.7975 26.5 16 26.5Z"
                fill="currentColor"
                />
                <path
                d="M16 8.5C11.86 8.5 8.5 11.86 8.5 16C8.5 20.14 11.86 23.5 16 23.5C20.14 23.5 23.5 20.14 23.5 16C23.5 11.86 20.14 8.5 16 8.5ZM16 21C13.24 21 11 18.76 11 16C11 13.24 13.24 11 16 11C18.76 11 21 13.24 21 16C21 18.76 18.76 21 16 21Z"
                fill="currentColor"
                />
            </svg>
            <span className="text-xl font-bold font-headline">Artha</span>
        </div>
        <Button asChild>
          <Link href="/dashboard">Experience Artha</Link>
        </Button>
      </header>

      <main className="pt-24">
        <section className="text-center px-4 py-20">
          <h1 className="text-5xl md:text-7xl font-extrabold font-headline bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground">
            Your Financial Brain.
            <br/>
            That actually knows you.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Beyond generic advice. Artha understands your unique financial story,
            behavioral biases, and cultural nuances to guide you to true wealth.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild className="shadow-lg shadow-white/50 glow-primary">
                <Link href="/dashboard">
                    Explore Your Dashboard
                    <ArrowRight className="ml-2" />
                </Link>
            </Button>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-headline">The Breakthrough: A 3-Tier AI Architecture</h2>
            <p className="mt-4 max-w-3xl mx-auto text-muted-foreground">
              Artha isn't one AI, but a team of 10 specialized agents working together.
              This multi-layered approach delivers financial advice with unparalleled depth and personalization.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((tier) => (
              <Card key={tier.tier} className="bg-card/80 backdrop-blur-sm border-dashed">
                <CardHeader>
                  <CardTitle className={`text-2xl font-bold font-headline ${tier.color}`}>{tier.tier}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {tier.agents.map((agent) => (
                    <div key={agent.name} className="flex gap-4">
                      <div className={`${tier.color} mt-1`}>{agent.icon}</div>
                      <div>
                        <h4 className="font-semibold">{agent.name}</h4>
                        <p className="text-sm text-muted-foreground">{agent.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-20 px-4 bg-secondary/30">
           <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-headline">More Than Numbers: Human-Centric Intelligence</h2>
            <p className="mt-4 max-w-3xl mx-auto text-muted-foreground">
              Your financial life isn't a spreadsheet. It's a story of your habits, culture, and goals.
            </p>
          </div>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            {behavioralPoints.map((point) => (
              <Card key={point.title} className="bg-card/80 backdrop-blur-sm shadow-lg">
                 <CardHeader className="flex flex-row items-center gap-4">
                    {point.icon}
                    <CardTitle className="text-2xl font-bold font-headline">{point.title}</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p className="text-muted-foreground">{point.description}</p>
                    <p className="mt-4 text-sm font-semibold text-primary bg-primary/10 p-3 rounded-md border border-primary/20">{point.example}</p>
                 </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        <section className="text-center px-4 py-24">
            <h2 className="text-4xl font-bold font-headline">Ready for Smarter Financial Guidance?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Stop guessing. Start knowing. Let Artha build a financial future that's uniquely yours.
            </p>
            <div className="mt-8">
                <Button size="lg" asChild className="shadow-lg shadow-white/50 glow-primary">
                    <Link href="/dashboard">
                        Explore Your Dashboard
                        <ArrowRight className="ml-2" />
                    </Link>
                </Button>
            </div>
        </section>
      </main>

      <footer className="text-center py-8 border-t">
        <p className="text-muted-foreground">&copy; {new Date().getFullYear()} Artha. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
