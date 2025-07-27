'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  TrendingUp, 
  Calculator, 
  DollarSign, 
  Calendar,
  Percent,
  ArrowRight,
  PiggyBank,
  AlertCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import FiMcpLogin from '@/components/FiMcpLogin';

interface CalculationResult {
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
  monthlyBreakdown: Array<{
    month: number;
    balance: number;
    contribution: number;
    interest: number;
  }>;
}

export default function InvestmentCalculatorPage() {
  const { isAuthenticated, login } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [initialAmount, setInitialAmount] = useState<string>('10000');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('500');
  const [annualReturn, setAnnualReturn] = useState<number[]>([7]);
  const [timeHorizon, setTimeHorizon] = useState<number[]>([10]);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateInvestment = () => {
    const principal = parseFloat(initialAmount) || 0;
    const monthly = parseFloat(monthlyContribution) || 0;
    const rate = annualReturn[0] / 100 / 12; // Monthly rate
    const months = timeHorizon[0] * 12;

    let balance = principal;
    const breakdown = [];
    let totalContributions = principal;

    for (let month = 1; month <= months; month++) {
      const monthlyInterest = balance * rate;
      balance += monthlyInterest + monthly;
      totalContributions += monthly;

      breakdown.push({
        month,
        balance,
        contribution: monthly,
        interest: monthlyInterest,
      });
    }

    const totalInterest = balance - totalContributions;

    setResult({
      futureValue: balance,
      totalContributions,
      totalInterest,
      monthlyBreakdown: breakdown,
    });
  };

  useEffect(() => {
    calculateInvestment();
  }, [initialAmount, monthlyContribution, annualReturn, timeHorizon]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const interestPercentage = result 
    ? ((result.totalInterest / result.totalContributions) * 100)
    : 0;

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
              Please log in to use the investment calculator
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Calculator className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investment Calculator</h1>
          <p className="text-muted-foreground">Calculate your investment growth with compound interest</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PiggyBank className="h-5 w-5" />
                <span>Investment Parameters</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Initial Investment */}
              <div className="space-y-2">
                <Label htmlFor="initial-amount" className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Initial Investment</span>
                </Label>
                <Input
                  id="initial-amount"
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  placeholder="10000"
                  className="text-lg"
                />
              </div>

              {/* Monthly Contribution */}
              <div className="space-y-2">
                <Label htmlFor="monthly-contribution" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Monthly Contribution</span>
                </Label>
                <Input
                  id="monthly-contribution"
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  placeholder="500"
                  className="text-lg"
                />
              </div>

              {/* Annual Return */}
              <div className="space-y-3">
                <Label className="flex items-center space-x-2">
                  <Percent className="h-4 w-4" />
                  <span>Expected Annual Return: {annualReturn[0]}%</span>
                </Label>
                <Slider
                  value={annualReturn}
                  onValueChange={setAnnualReturn}
                  max={15}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1%</span>
                  <span>15%</span>
                </div>
              </div>

              {/* Time Horizon */}
              <div className="space-y-3">
                <Label className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Time Horizon: {timeHorizon[0]} years</span>
                </Label>
                <Slider
                  value={timeHorizon}
                  onValueChange={setTimeHorizon}
                  max={40}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 year</span>
                  <span>40 years</span>
                </div>
              </div>

              <Button 
                onClick={calculateInvestment} 
                className="w-full"
                size="lg"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Recalculate
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Future Value</p>
                    <p className="text-2xl font-bold text-success">
                      {result ? formatCurrency(result.futureValue) : '$0'}
                    </p>
                  </div>
                  <div className="p-2 bg-success/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
                    <p className="text-2xl font-bold text-primary">
                      {result ? formatCurrency(result.totalContributions) : '$0'}
                    </p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Interest Earned</p>
                    <p className="text-2xl font-bold text-accent">
                      {result ? formatCurrency(result.totalInterest) : '$0'}
                    </p>
                  </div>
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Percent className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Growth Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Growth Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Investment vs Interest Growth</span>
                    <span>{interestPercentage.toFixed(1)}% growth from compound interest</span>
                  </div>
                  <Progress 
                    value={Math.min(interestPercentage, 100)} 
                    className="h-3"
                  />
                </div>

                {/* Breakdown Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-primary rounded"></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Your Contributions</p>
                      <p className="font-semibold">
                        {result ? formatCurrency(result.totalContributions) : '$0'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-success rounded"></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Compound Interest</p>
                      <p className="font-semibold">
                        {result ? formatCurrency(result.totalInterest) : '$0'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="bg-secondary/50 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold mb-2">Key Insights:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center space-x-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>
                        Monthly investment of {formatCurrency(parseFloat(monthlyContribution) || 0)} 
                        for {timeHorizon[0]} years
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>
                        Compound interest will generate {result ? formatCurrency(result.totalInterest) : '$0'} 
                        in additional wealth
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>
                        Your money will grow by {interestPercentage.toFixed(1)}% through compound interest
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
