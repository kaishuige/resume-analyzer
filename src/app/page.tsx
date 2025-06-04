"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThinkingSteps } from '@/components/thinking-steps';
import { AnalysisResults } from '@/components/analysis-results';
import { ResumeAnalyzer, ResumeAnalysisResult } from '@/lib/resume-analyzer';
import { ThinkingStep, SequentialThinkingContext } from '@/lib/sequential-thinking';
import { Upload, FileCheck, AlertCircle, X, Sparkles } from 'lucide-react';

interface FileInfo {
  name: string;
  size: string;
  pages?: number;
  title?: string;
  author?: string;
  creator?: string;
}

export default function Home() {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<FileInfo | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Handle PDF file upload via API
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    console.log('Starting file upload:', file.name, file.size, file.type);

    // Reset previous state
    setUploadError(null);
    setUploadedFileInfo(null);
    setResumeText('');
    setIsUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading to API...');

      // Upload to API
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status, response.statusText);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);

      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please check if the server is running correctly.');
      }

      const result = await response.json();
      console.log('API response:', result);

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Upload failed');
      }

      // Set extracted text and file info
      setResumeText(result.text);
      setUploadedFileInfo(result.fileInfo);
      setUploadError(null);
      
      console.log('Upload successful, text length:', result.text?.length);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      setUploadedFileInfo(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  // Remove uploaded file and all related analysis data
  const handleRemoveFile = () => {
    setUploadedFileInfo(null);
    setResumeText('');
    setUploadError(null);
    // Clear all analysis related states
    setAnalysisResult(null);
    setThinkingSteps([]);
    setCurrentStepIndex(0);
    setIsAnalyzing(false);
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Handle resume analysis
  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      alert('Please upload a PDF resume first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setThinkingSteps([]);
    setCurrentStepIndex(0);

    // Create analyzer instance with step update callback
    const analyzer = new ResumeAnalyzer(
      undefined,
      (step: ThinkingStep, context: SequentialThinkingContext) => {
        setThinkingSteps([...context.steps]);
        setCurrentStepIndex(context.currentStepIndex);
      }
    );

    try {
      const result = await analyzer.analyzeResume(resumeText);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Resume Analysis
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Generation DINQ Card</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform your resume into a powerful professional profile with intelligent AI analysis and insights
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Show upload section only when no analysis result */}
          {!analysisResult && (
            <>
              {/* Upload Section */}
              {!uploadedFileInfo ? (
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Upload your recent resume or CV
                      </h2>
                      <p className="text-gray-500">
                        Upload your most up-to-date resume<br />
                        File types: DOC, DOCX, PDF, TXT
                      </p>
                    </div>
                    
                    <div 
                      className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
                        dragActive 
                          ? 'border-blue-400 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Upload className="w-10 h-10 text-gray-400" />
                        </div>
                        
                        <div className="mb-8">
                          <label className="inline-flex items-center px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl cursor-pointer transition-colors font-medium">
                            <Upload className="w-5 h-5 mr-2" />
                            Upload
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.txt"
                              onChange={handleFileInputChange}
                              className="hidden"
                              disabled={isUploading}
                            />
                          </label>
                        </div>
                        
                        <p className="text-sm text-gray-400">
                          or drag and drop your file here
                        </p>
                      </div>
                    </div>

                    {/* Upload status */}
                    {isUploading && (
                      <div className="flex items-center justify-center gap-3 mt-8 p-4 bg-blue-50 rounded-xl">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-blue-700 font-medium">Processing your file...</span>
                      </div>
                    )}

                    {/* Upload error */}
                    {uploadError && (
                      <div className="flex items-start gap-3 mt-8 p-4 bg-red-50 rounded-xl border border-red-100">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-red-700 font-medium">Upload failed</p>
                          <p className="text-sm text-red-600 mt-1">{uploadError}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                /* File Uploaded State */
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Upload your recent resume or CV
                      </h2>
                      <p className="text-gray-500">
                        Upload your most up-to-date resume<br />
                        File types: DOC, DOCX, PDF, TXT
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FileCheck className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{uploadedFileInfo.name}</h3>
                            <p className="text-sm text-gray-500">
                              {uploadedFileInfo.size} • {uploadedFileInfo.pages} pages
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Generation Profile button */}
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                          Generating Profile...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-3" />
                          Generation Profile
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Analysis Process */}
              {thinkingSteps.length > 0 && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                  <ThinkingSteps
                    steps={thinkingSteps}
                    currentStepIndex={currentStepIndex}
                    isProcessing={isAnalyzing}
                  />
                </div>
              )}
            </>
          )}

          {/* Analysis Results - Full screen when available */}
          {analysisResult && (
            <div className="space-y-6">
              {/* Header with back button */}
              <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-lg font-semibold text-green-700">Analysis Complete</span>
                  <span className="text-sm text-gray-500">- Professional profile generated</span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRemoveFile}
                  className="text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300 rounded-lg"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Analyze Another Resume
                </Button>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
                <AnalysisResults result={analysisResult} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
