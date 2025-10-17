import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileText, X, Brain, Lightbulb, Target, Award } from "lucide-react";
import type { Project, AnalysisData } from "@shared/schema";
import { htmlExportService } from "@/services/htmlExportService";

interface AIInsightsReportPreviewProps {
  open: boolean;
  onClose: () => void;
  project: Project;
}

export default function AIInsightsReportPreview({
  open,
  onClose,
  project,
}: AIInsightsReportPreviewProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingDOC, setIsExportingDOC] = useState(false);

  const analysisData = project.analysisData as AnalysisData | null;
  const aiInsights = analysisData?.aiAnalysis;

  const handlePDFExport = async () => {
    setIsExportingPDF(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
      const filename = `${project.name.replace(/\s+/g, '-')}-AI-Insights-${timestamp}.pdf`;
      await htmlExportService.exportToPDF('ai-insights-report-content', filename);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleDOCExport = async () => {
    setIsExportingDOC(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
      const filename = `${project.name.replace(/\s+/g, '-')}-AI-Insights-${timestamp}.docx`;
      await htmlExportService.exportToDOCX('ai-insights-report-content', filename);
    } catch (error) {
      console.error('DOC export failed:', error);
      alert('DOC export failed. Please try again.');
    } finally {
      setIsExportingDOC(false);
    }
  };

  if (!aiInsights) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>AI Insights Report</DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No AI insights available for this project.</p>
            <p className="text-sm text-gray-500 mt-2">AI analysis may not have been performed yet.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              AI Insights Report
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDOCExport}
                disabled={isExportingDOC}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
                data-testid="button-save-ai-insights-docx"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isExportingDOC ? 'Saving...' : 'Save as DOCX'}
              </Button>
              <Button
                onClick={handlePDFExport}
                disabled={isExportingPDF}
                className="bg-red-600 hover:bg-red-700"
                size="sm"
                data-testid="button-save-ai-insights-pdf"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExportingPDF ? 'Saving...' : 'Save as PDF'}
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                data-testid="button-close-ai-insights-report"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div id="ai-insights-report-content" className="max-w-5xl mx-auto space-y-8 py-4">
            {/* Header */}
            <div className="text-center border-b pb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Insights & Analysis Report</h1>
              <p className="text-lg text-gray-600">{project.name}</p>
              <p className="text-sm text-gray-500 mt-2">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {/* Project Overview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-700 leading-relaxed">{aiInsights.projectOverview}</p>
              </div>
            </div>

            {/* Architecture Insights */}
            {aiInsights.architectureInsights && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Architecture Insights</h2>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{aiInsights.architectureInsights}</p>
                </div>
              </div>
            )}

            {/* Quality Score */}
            {aiInsights.qualityScore && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Award className="w-5 h-5 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Quality Assessment</h2>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-green-600">{aiInsights.qualityScore}/10</div>
                      <div className="text-sm text-gray-600 mt-2">Overall Quality Score</div>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-green-600 h-4 rounded-full" 
                          style={{ width: `${(aiInsights.qualityScore / 10) * 100}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        This score reflects the overall quality of the codebase based on architecture, 
                        maintainability, and best practices.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {aiInsights.suggestions && aiInsights.suggestions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <h2 className="text-2xl font-bold text-gray-900">AI Recommendations</h2>
                </div>
                <div className="space-y-3">
                  {aiInsights.suggestions.map((suggestion: string, index: number) => (
                    <div key={index} className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                      <div className="flex items-start gap-3">
                        <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 leading-relaxed flex-1">{suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Module-Level Insights */}
            {aiInsights.moduleInsights && aiInsights.moduleInsights.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Module-Level Insights</h2>
                </div>
                <div className="space-y-4">
                  {aiInsights.moduleInsights.map((insight: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{insight.className}</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Role: </span>
                          <span className="text-gray-600">{insight.role}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Responsibilities: </span>
                          <span className="text-gray-600">{insight.responsibilities}</span>
                        </div>
                        {insight.improvements && (
                          <div className="mt-3 pt-3 border-t">
                            <span className="font-medium text-gray-700">Improvement Opportunities: </span>
                            <p className="text-gray-600 mt-1">{insight.improvements}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 pt-8 border-t">
              <p>Generated by Zengent AI - Enterprise Application Intelligence Platform</p>
              <p className="mt-1">Powered by Advanced AI Analysis</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
