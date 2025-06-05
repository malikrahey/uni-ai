export type PlanType = 'crash-course' | 'course' | 'full-degree';
export type StartingLevel = 'beginner' | 'some-experience' | 'intermediate' | 'advanced';
export type DesiredLevel = 'functional' | 'proficient' | 'expert' | 'professional';
export type WizardStep = 1 | 2 | 3 | 4;

export interface PlanTypeOption {
  id: PlanType;
  title: string;
  description: string;
  duration: string;
  intensity: string;
  timeCommitment: string;
  icon: string;
  recommended: string;
  features: string[];
}

export interface CourseCreationForm {
  // Step 1: Plan Type
  planType?: PlanType;
  
  // Step 2: Subject Selection
  subject?: string;
  category?: string;
  customTopic?: string;
  
  // Step 3: Knowledge Assessment
  startingLevel?: StartingLevel;
  desiredLevel?: DesiredLevel;
  
  // Generated/Computed
  estimatedDuration?: string;
  suggestedSchedule?: string;
  prerequisites?: string[];
}

export interface WizardStepProps {
  formData: CourseCreationForm;
  onUpdate: (data: Partial<CourseCreationForm>) => void;
  onNext: () => void;
  onBack: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
}

export interface CourseCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  popularTopics: string[];
  difficulty: 'beginner-friendly' | 'intermediate' | 'advanced';
} 