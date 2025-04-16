
export type QuestionType = 'text' | 'choice' | 'email' | 'number' | 'rating' | 'date';

export interface FormQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  required?: boolean;
  conditionalLogic?: {
    questionId: string;
    operator: 'equals' | 'contains' | 'not_equals';
    value: string;
  };
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  questions: FormQuestion[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontColor: string;
    backgroundColor: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FormResponse {
  id?: string;
  formId: string;
  answers: {
    questionId: string;
    value: string | string[];
  }[];
  createdAt?: Date;
}