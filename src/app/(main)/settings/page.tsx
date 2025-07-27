
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Eye, Lock, User, Palette, AlertCircle } from 'lucide-react';
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import FiMcpLogin from "@/components/FiMcpLogin";

const NavButton = ({ icon, label, active, onClick }: { icon: React.ElementType, label: string, active: boolean, onClick: () => void }) => {
    const Icon = icon;
    return (
        <Button variant={active ? "secondary" : "ghost"} onClick={onClick} className="w-full justify-start gap-2">
            <Icon className="h-4 w-4" />
            {label}
        </Button>
    )
}


export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { isAuthenticated, login } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
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
                            Please log in to access your settings
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
                <h1 className="text-3xl font-bold font-headline">Settings</h1>
                <p className="text-muted-foreground">Manage your account, preferences, and privacy.</p>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <Card className="p-2 shadow-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                        <NavButton icon={User} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                        <NavButton icon={Palette} label="Appearance" active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} />
                        <NavButton icon={Bell} label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
                        <NavButton icon={Lock} label="Privacy" active={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')} />
                    </Card>
                </div>
                <div className="lg:col-span-3">
                    {activeTab === 'profile' && (
                        <Card className="shadow-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle>Profile Management</CardTitle>
                                <CardDescription>Update your personal information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                     <Avatar className="h-16 w-16">
                                        <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <Button variant="outline">Upload new photo</Button>
                                </div>
                                 <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" defaultValue="User" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" defaultValue="user@example.com" disabled />
                                    </div>
                                </div>
                                <Button>Save Changes</Button>
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === 'appearance' && (
                         <Card className="shadow-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                             <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>Customize the look and feel of the application.</CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
                                    <div>
                                        <Label htmlFor="dark-mode" className="font-semibold">Dark Mode</Label>
                                        <p className="text-sm text-muted-foreground">Toggle between light and dark themes.</p>
                                    </div>
                                    <Switch
                                        id="dark-mode"
                                        checked={theme === 'dark'}
                                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === 'notifications' && (
                        <Card className="shadow-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Choose which alerts you want to receive.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
                                    <div>
                                        <Label htmlFor="anomaly-alerts" className="font-semibold">Anomaly Alerts</Label>
                                        <p className="text-sm text-muted-foreground">Get notified about unusual spending or potential fraud.</p>
                                    </div>
                                    <Switch id="anomaly-alerts" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
                                    <div>
                                        <Label htmlFor="recommendation-alerts" className="font-semibold">Recommendation Alerts</Label>
                                         <p className="text-sm text-muted-foreground">Receive new personalized recommendations.</p>
                                    </div>
                                    <Switch id="recommendation-alerts" defaultChecked />
                                </div>
                                 <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
                                    <div>
                                        <Label htmlFor="market-updates" className="font-semibold">Market Updates</Label>
                                         <p className="text-sm text-muted-foreground">Weekly summaries of market performance.</p>
                                    </div>
                                    <Switch id="market-updates" />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                     {activeTab === 'privacy' && (
                        <Card className="shadow-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle>Privacy</CardTitle>
                                <CardDescription>Manage your data and privacy settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
                                    <div>
                                        <Label htmlFor="data-sharing" className="font-semibold">Data Sharing</Label>
                                        <p className="text-sm text-muted-foreground">Allow Artha to use anonymized data to improve its models.</p>
                                    </div>
                                    <Switch id="data-sharing" defaultChecked />
                                </div>
                                <Button variant="destructive">Delete My Account</Button>
                            </CardContent>
                        </Card>
                     )}
                </div>
            </div>
        </div>
    )
}

    