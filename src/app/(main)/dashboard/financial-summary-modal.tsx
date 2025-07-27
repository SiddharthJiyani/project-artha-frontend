"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  getFinancialSummary,
  type FinancialSummaryOutput,
} from "@/ai/flows/financial-summary";
import {
  Loader,
  Wand2,
  Percent,
  CheckCircle,
  AlertCircle,
  BarChart,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";

interface FinancialSummaryModalProps {
  data: any;
}

export default function FinancialSummaryModal({
  data,
}: FinancialSummaryModalProps) {
  const [summary, setSummary] = useState<FinancialSummaryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async (financialData: any) => {
    if (!financialData) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No financial data available for analysis.",
      });
      return;
    }

    setIsLoading(true);
    setSummary(null);

    try {
      console.log("Generating financial summary with data:", {
        hasNetWorth: !!financialData?.netWorthResponse,
        hasMfData: !!financialData?.mfSchemeAnalytics,
        hasAccountData: !!financialData?.accountDetailsBulkResponse,
      });

      const result = await getFinancialSummary(financialData);
      console.log("Financial summary generated successfully:", result);
      setSummary(result);

      toast({
        title: "Success",
        description: "AI financial summary generated successfully!",
      });
    } catch (error) {
      console.error("Failed to generate summary:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate financial summary. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && setSummary(null)}>
      <DialogTrigger asChild>
        <Button
          onClick={() => handleGenerateSummary(data)}
          className="bg-gradient-to-r from-primary to-purple-600 text-white glow-primary">
          <Wand2 className="mr-2 h-4 w-4" />
          Get AI Financial Summary
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            Your AI Financial Summary
          </DialogTitle>
          <DialogDescription>
            Artha has analyzed your financial data to provide insights and
            recommendations.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Artha is analyzing your finances...
            </p>
            <p className="text-sm text-muted-foreground/80">
              Processing financial data...
            </p>
          </div>
        )}
        {summary && (
          <div className="space-y-6 py-4">
            {/* Overall Health */}
            <div className="p-6 border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-100 to-green-100/80 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              <h3 className="font-semibold flex items-center gap-2 text-emerald-800 mb-3">
                <CheckCircle className="h-5 w-5 text-emerald-700" />
                Overall Financial Health
              </h3>
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="text-sm text-emerald-900 leading-relaxed mb-2 font-medium">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc ml-6 text-emerald-900 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal ml-6 text-emerald-900 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-emerald-950">{children}</strong>
                  ),
                }}>
                {summary.overallHealth}
              </ReactMarkdown>
            </div>

            {/* Key Concerns */}
            <div className="p-6 border-l-4 border-red-500 bg-gradient-to-r from-red-100 to-rose-100/80 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              <h3 className="font-semibold flex items-center gap-2 text-red-800 mb-3">
                <AlertCircle className="h-5 w-5 text-red-700" />
                Key Concerns
              </h3>
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="text-sm text-red-900 leading-relaxed mb-2 font-medium">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc ml-6 text-red-900 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal ml-6 text-red-900 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-red-950">{children}</strong>
                  ),
                }}>
                {summary.keyConcerns}
              </ReactMarkdown>
            </div>

            {/* Actionable Recommendations */}
            <div className="p-6 border-l-4 border-blue-500 bg-gradient-to-r from-blue-100 to-sky-100/80 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
              <h3 className="font-semibold flex items-center gap-2 text-blue-800 mb-3">
                <BarChart className="h-5 w-5 text-blue-700" />
                Actionable Recommendations
              </h3>
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-line mb-2 font-medium">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc ml-6 text-blue-900 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal ml-6 text-blue-900 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-blue-950">{children}</strong>
                  ),
                }}>
                {summary.actionableRecommendations}
              </ReactMarkdown>
            </div>

            {/* Confidence Level */}
            <div className="flex justify-end pt-4">
              <Badge 
                variant="secondary" 
                className="text-sm bg-slate-200/80 text-slate-800 border-slate-300 px-4 py-2 shadow-sm font-medium"
              >
                <Percent className="mr-2 h-4 w-4 text-slate-700" />
                Confidence: {summary.confidenceLevel}
              </Badge>
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
