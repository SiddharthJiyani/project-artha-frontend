
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Landmark, BarChart, AreaChart as AreaChartIcon, AlertCircle } from "lucide-react";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, CartesianGrid } from 'recharts';
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import FiMcpLogin from "@/components/FiMcpLogin";

const behavioralData = [
  { subject: 'Risk Aversion', A: 80, fullMark: 100 },
  { subject: 'Loss Aversion', A: 90, fullMark: 100 },
  { subject: 'Herding Behavior', A: 45, fullMark: 100 },
  { subject: 'Anchoring Bias', A: 60, fullMark: 100 },
  { subject: 'Recency Bias', A: 75, fullMark: 100 },
];

const spendingData = [
    { name: 'Week 1', stress: 2, spending: 300 },
    { name: 'Week 2', stress: 3, spending: 250 },
    { name: 'Week 3', stress: 7, spending: 800 },
    { name: 'Week 4', stress: 4, spending: 400 },
];

const regionalData = [
    { name: 'Pune', yield: 4.5, appreciation: 12 },
    { name: 'Mumbai', yield: 3.2, appreciation: 8 },
    { name: 'Bangalore', yield: 4.8, appreciation: 14 },
    { name: 'Chennai', yield: 4.1, appreciation: 9 },
];

export default function InsightsPage() {
    const { isAuthenticated, login } = useAuth();
    const [showLogin, setShowLogin] = useState(false);

    const handleLoginSuccess = (sessionId: string, phoneNumber: string) => {
        login(sessionId, phoneNumber);
        setShowLogin(false);
    };

    if (!isAuthenticated) {
        return (
            <>
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <AlertCircle className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Authentication Required</h2>
                        <p className="text-muted-foreground mb-4">
                            Please log in to view your financial insights
                        </p>
                        <Button onClick={() => setShowLogin(true)}>
                            Login with Fi MCP
                        </Button>
                    </div>
                </div>
                {showLogin && (
                    <FiMcpLogin
                        onLoginSuccess={handleLoginSuccess}
                        onClose={() => setShowLogin(false)}
                    />
                )}
            </>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Financial Insights</h1>
                <p className="text-muted-foreground">Deep dive into your financial behavior and market opportunities.</p>
            </div>

      <Card className="shadow-sm bg-card/80 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-primary"/> Behavioral Insights</CardTitle>
                    <CardDescription>Understanding your financial psychology is key to better decision-making.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-semibold">Your Financial Biases</h3>
                        <p className="text-sm text-muted-foreground">This chart maps your tendencies towards common financial biases. Awareness is the first step to overcoming them.</p>
                         <div className="p-4 rounded-md bg-background/50 border">
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={behavioralData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis />
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}/>
                                    <Radar name="Your Bias" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold">Emotional Spending Trends</h3>
                         <p className="text-sm text-muted-foreground">We've correlated your weekly spending with mock stress level data to identify patterns. Notice the spike in spending during high-stress weeks.</p>
                         <div className="p-4 rounded-md bg-background/50 border">
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={spendingData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" label={{ value: 'Spending', angle: -90, position: 'insideLeft' }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" label={{ value: 'Stress Level', angle: 90, position: 'insideRight' }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}/>
                                    <Legend />
                                    <Area yAxisId="left" type="monotone" dataKey="spending" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                                    <Area yAxisId="right" type="monotone" dataKey="stress" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>

      <Card className="shadow-sm bg-card/80 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Landmark className="text-accent"/> Regional Investment Insights</CardTitle>
                    <CardDescription>Comparing real estate investment potential across major Indian cities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-4 rounded-md bg-background/50 border">
                        <ResponsiveContainer width="100%" height={400}>
                             <RechartsBarChart data={regionalData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }} />
                                <Legend />
                                <Bar dataKey="yield" name="Rental Yield (%)" fill="hsl(var(--primary))" />
                                <Bar dataKey="appreciation" name="Appreciation (%)" fill="hsl(var(--accent))" />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                     <p className="text-sm text-muted-foreground mt-4">
                        <strong>Insight:</strong> Pune real estate currently shows a stronger balance of rental yield and appreciation compared to Mumbai, making it a compelling area for investment focus. Bangalore leads in appreciation but has a slightly higher entry cost.
                     </p>
                </CardContent>
            </Card>
        </div>
    )
}

    