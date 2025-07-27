
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, Home, PiggyBank, GraduationCap, Plus, MoreHorizontal, Target, TrendingUp, Lightbulb, BadgePercent, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const goals = [
  {
    icon: Shield,
    title: "Emergency Fund",
    category: "Safety",
    progress: 75,
    current: "₹4.5L",
    target: "₹6.0L",
    deadline: "Dec 2024",
  },
  {
    icon: Home,
    title: "House Down Payment",
    category: "Property",
    progress: 45,
    current: "₹9.0L",
    target: "₹20.0L",
    deadline: "Jun 2025",
  },
  {
    icon: PiggyBank,
    title: "Retirement Fund",
    category: "Retirement",
    progress: 32,
    current: "₹1.6Cr",
    target: "₹5.0Cr",
    deadline: "2045",
  },
  {
    icon: GraduationCap,
    title: "Child Education",
    category: "Education",
    progress: 26.7,
    current: "₹8.0L",
    target: "₹30.0L",
    deadline: "2030",
  },
];

const recommendations = [
    {
        icon: CheckCircle,
        title: "On Track",
        description: "Your emergency fund is 75% complete. You're ahead of schedule!",
        variant: "bg-success/10 text-success border-success/20"
    },
    {
        icon: TrendingUp,
        title: "Smart Tip",
        description: "Consider step-up SIPs for long-term goals to account for salary increases.",
        variant: "bg-info/10 text-info border-info/20"
    },
    {
        icon: Lightbulb,
        title: "Needs Attention",
        description: "Increase house down payment savings by ₹15,000/month to meet deadline.",
        variant: "bg-warning/10 text-warning border-warning/20"
    },
    {
        icon: BadgePercent,
        title: "Tax Benefit",
        description: "Your retirement contributions qualify for 80C deduction. Save ₹46,800 in taxes.",
        variant: "bg-accent/10 text-accent border-accent/20"
    }
]

export default function GoalsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Financial Goals</h1>
          <p className="text-muted-foreground">
            Track progress towards your financial objectives
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add New Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal, index) => (
          <Card key={index} className="shadow-sm bg-card/80 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <goal.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <Badge variant="secondary">{goal.category}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-semibold">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2"/>
              </div>

              <div className="flex justify-between">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="text-lg font-bold">{goal.current}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Target</p>
                  <p className="text-lg font-bold">{goal.target}</p>
                </div>
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                 <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-semibold">{goal.deadline}</p>
                 </div>
                 <Button variant="outline">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm bg-card/80 backdrop-blur-xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Target className="text-primary"/>
                Goal Insights & Recommendations
            </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
                <div key={index} className={`p-4 rounded-lg border flex items-start gap-4 ${rec.variant}`}>
                    <rec.icon className="h-6 w-6 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold">{rec.title}</h4>
                        <p className="text-sm">{rec.description}</p>
                    </div>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

    