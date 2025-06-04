/**
 * Multi-step reasoning tool - Sequential Thinking
 * Based on Model Context Protocol sequential thinking server implementation
 */

export interface ThinkingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: unknown;
  error?: string;
  timestamp: Date;
}

export interface SequentialThinkingContext {
  steps: ThinkingStep[];
  currentStepIndex: number;
  isProcessing: boolean;
  metadata: Record<string, unknown>;
}

export class SequentialThinking {
  private context: SequentialThinkingContext;
  private onStepUpdate?: (step: ThinkingStep, context: SequentialThinkingContext) => void;

  constructor(
    steps: Omit<ThinkingStep, 'id' | 'status' | 'timestamp'>[],
    onStepUpdate?: (step: ThinkingStep, context: SequentialThinkingContext) => void
  ) {
    this.context = {
      steps: steps.map((step, index) => ({
        ...step,
        id: `step-${index}`,
        status: 'pending' as const,
        timestamp: new Date(),
      })),
      currentStepIndex: 0,
      isProcessing: false,
      metadata: {},
    };
    this.onStepUpdate = onStepUpdate;
  }

  public async executeStep(
    stepId: string,
    executor: (step: ThinkingStep, context: SequentialThinkingContext) => Promise<unknown>
  ): Promise<void> {
    const step = this.context.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step with id ${stepId} not found`);
    }

    step.status = 'processing';
    step.timestamp = new Date();
    this.context.isProcessing = true;
    this.onStepUpdate?.(step, this.context);

    try {
      const result = await executor(step, this.context);
      step.result = result;
      step.status = 'completed';
      step.timestamp = new Date();
      
      // Automatically move to the next step
      if (this.context.currentStepIndex < this.context.steps.length - 1) {
        this.context.currentStepIndex++;
      }
    } catch (error) {
      step.error = error instanceof Error ? error.message : String(error);
      step.status = 'error';
      step.timestamp = new Date();
    } finally {
      this.context.isProcessing = false;
      this.onStepUpdate?.(step, this.context);
    }
  }

  public async executeAll(
    executors: Record<string, (step: ThinkingStep, context: SequentialThinkingContext) => Promise<unknown>>
  ): Promise<void> {
    for (const step of this.context.steps) {
      if (step.status === 'completed') continue;
      
      const executor = executors[step.id] || executors['default'];
      if (!executor) {
        throw new Error(`No executor found for step ${step.id}`);
      }

      await this.executeStep(step.id, executor);
      
      if (step.status === 'error') {
        break; // Stop executing subsequent steps
      }
    }
  }

  public getContext(): SequentialThinkingContext {
    return { ...this.context };
  }

  public getCurrentStep(): ThinkingStep | null {
    return this.context.steps[this.context.currentStepIndex] || null;
  }

  public getStepResult(stepId: string): unknown {
    const step = this.context.steps.find(s => s.id === stepId);
    return step?.result;
  }

  public updateMetadata(key: string, value: unknown): void {
    this.context.metadata[key] = value;
  }

  public getMetadata(key?: string): unknown {
    return key ? this.context.metadata[key] : this.context.metadata;
  }
}

// Predefined thinking steps for resume analysis
export const createResumeAnalysisSteps = () => [
  {
    title: "Parse Resume Content",
    description: "Extract and structure basic information, skills, experience from the resume"
  },
  {
    title: "Generate Professional Profile",
    description: "Create AI-tagged professional profile with industry classification and experience summary"
  },
  {
    title: "Skills Assessment", 
    description: "Analyze technical and soft skills proficiency and expertise areas"
  },
  {
    title: "Experience Evaluation",
    description: "Evaluate work experience relevance, career trajectory and key achievements"
  },
  {
    title: "Education Assessment",
    description: "Extract educational background including institutions, degrees and specializations"
  },
  {
    title: "Generate Highlights",
    description: "Generate comprehensive positive highlights and key strengths summary"
  }
]; 
