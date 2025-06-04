"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThinkingStep } from '@/lib/sequential-thinking';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface ThinkingStepsProps {
  steps: ThinkingStep[];
  currentStepIndex: number;
  isProcessing: boolean;
}

// Language-aware status text
const getStatusText = (status: string, language: 'en' | 'zh') => {
  const texts = {
    en: {
      pending: 'Pending',
      running: 'Processing',
      completed: 'Completed',
      failed: 'Failed'
    },
    zh: {
      pending: '等待中',
      running: '处理中',
      completed: '已完成',
      failed: '失败'
    }
  };
  
  return texts[language][status as keyof typeof texts[typeof language]] || status;
};

// Detect language from step description
const detectLanguage = (text: string): 'en' | 'zh' => {
  const chineseChars = text.match(/[\u4e00-\u9fff]/g);
  return chineseChars && chineseChars.length > 0 ? 'zh' : 'en';
};

export function ThinkingSteps({ steps, currentStepIndex, isProcessing }: ThinkingStepsProps) {
  if (steps.length === 0) return null;

  // Detect language from first step
  const language = steps.length > 0 ? detectLanguage(steps[0].description) : 'en';
  
  const getStepIcon = (step: ThinkingStep, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (step.status === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    } else if (index === currentStepIndex && isProcessing) {
      return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    } else {
      return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStepStatus = (step: ThinkingStep, index: number) => {
    if (step.status === 'completed') {
      return 'bg-green-100 text-green-800';
    } else if (step.status === 'error') {
      return 'bg-red-100 text-red-800';
    } else if (index === currentStepIndex && isProcessing) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className={`w-5 h-5 ${isProcessing ? 'animate-spin text-blue-600' : 'text-gray-400'}`} />
          <h3 className="font-medium text-gray-900">
            {language === 'zh' ? '分析进度' : 'Analysis Progress'}
          </h3>
        </div>
        
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                index === currentStepIndex && isProcessing
                  ? 'bg-blue-50 border border-blue-200'
                  : step.status === 'completed'
                  ? 'bg-green-50'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex-shrink-0">
                {getStepIcon(step, index)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {step.description}
                  </p>
                  <Badge variant="outline" className={getStepStatus(step, index)}>
                    {getStatusText(step.status, language)}
                  </Badge>
                </div>
                
                {step.status === 'completed' && (
                  <div className="mt-1 text-xs text-gray-600">
                    {language === 'zh' ? '完成时间: ' : 'Completed: '}
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {isProcessing && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {language === 'zh' 
                ? `正在执行步骤 ${currentStepIndex + 1} / ${steps.length}...` 
                : `Processing step ${currentStepIndex + 1} of ${steps.length}...`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
