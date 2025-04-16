
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Trash2, Settings, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { FormQuestion, QuestionType } from '../../types/form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

interface FormEditorProps {
  questions: FormQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<FormQuestion[]>>;
  formTitle: string;
  setFormTitle: React.Dispatch<React.SetStateAction<string>>;
  formDescription: string;
  setFormDescription: React.Dispatch<React.SetStateAction<string>>;
}

export const FormEditor: React.FC<FormEditorProps> = ({
  questions,
  setQuestions,
  formTitle,
  setFormTitle,
  formDescription,
  setFormDescription
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const addQuestion = (type: QuestionType) => {
    const newQuestion: FormQuestion = {
      id: crypto.randomUUID(),
      type,
      question: '',
      options: type === 'choice' ? [''] : undefined,
      required: false
    };
    
    setQuestions([...questions, newQuestion]);
    setExpandedQuestion(newQuestion.id);
  };

  const updateQuestion = (id: string, updates: Partial<FormQuestion>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const duplicateQuestion = (id: string) => {
    const questionToDuplicate = questions.find(q => q.id === id);
    if (questionToDuplicate) {
      const duplicatedQuestion = {
        ...questionToDuplicate,
        id: crypto.randomUUID(),
        question: `${questionToDuplicate.question} (Copy)`
      };
      setQuestions([...questions, duplicatedQuestion]);
    }
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: [...(q.options || []), '']
        };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...(q.options || [])];
        newOptions[optionIndex] = value;
        return {
          ...q,
          options: newOptions
        };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...(q.options || [])];
        newOptions.splice(optionIndex, 1);
        return {
          ...q,
          options: newOptions
        };
      }
      return q;
    }));
  };

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    setQuestions(newQuestions);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Form Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="form-title">Form Title</Label>
              <Input
                id="form-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter form title"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="form-description">Form Description</Label>
              <Textarea
                id="form-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter form description"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Questions</h2>
        {questions.length === 0 ? (
          <div className="text-center p-8 border border-dashed rounded-lg">
            <p className="text-gray-500 mb-4">No questions yet. Add your first question below.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="border rounded-lg overflow-hidden"
              >
                <div 
                  className={`p-4 flex items-center justify-between cursor-pointer ${
                    expandedQuestion === question.id ? 'bg-gray-50' : 'bg-white'
                  }`}
                  onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500 font-medium">{index + 1}.</span>
                    <span className="font-medium truncate max-w-md">
                      {question.question || `Untitled ${question.type} question`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveQuestion(question.id, 'up');
                      }}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveQuestion(question.id, 'down');
                      }}
                      disabled={index === questions.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateQuestion(question.id);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuestion(question.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    {expandedQuestion === question.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {expandedQuestion === question.id && (
                  <div className="p-4 border-t">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`question-type-${question.id}`}>Question Type</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value: QuestionType) => updateQuestion(question.id, { type: value })}
                        >
                          <SelectTrigger id={`question-type-${question.id}`} className="mt-1">
                            <SelectValue placeholder="Select question type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="choice">Multiple Choice</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="rating">Rating</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`question-text-${question.id}`}>Question Text</Label>
                        <Input
                          id={`question-text-${question.id}`}
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                          placeholder="Enter your question"
                          className="mt-1"
                        />
                      </div>

                      {question.type === 'choice' && (
                        <div className="space-y-2">
                          <Label>Options</Label>
                          {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(question.id, optionIndex)}
                                disabled={question.options?.length === 1}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(question.id)}
                            className="mt-2"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`required-${question.id}`}
                          checked={question.required || false}
                          onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
                        />
                        <Label htmlFor={`required-${question.id}`}>Required</Label>
                      </div>

                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="conditional-logic">
                          <AccordionTrigger className="py-2">
                            <div className="flex items-center">
                              <Settings className="h-4 w-4 mr-2" />
                              Conditional Logic
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2">
                              <Select
                                value={question.conditionalLogic?.questionId || "none"}
                                onValueChange={(value) => {
                                  if (value === "none") {
                                    updateQuestion(question.id, { conditionalLogic: undefined });
                                    return;
                                  }
                                  
                                  updateQuestion(question.id, {
                                    conditionalLogic: {
                                      questionId: value,
                                      operator: question.conditionalLogic?.operator || 'equals',
                                      value: question.conditionalLogic?.value || ''
                                    }
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a question" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No condition</SelectItem>
                                  {questions
                                    .filter(q => q.id !== question.id)
                                    .map(q => (
                                      <SelectItem key={q.id} value={q.id}>
                                        {q.question || `Question ${questions.findIndex(item => item.id === q.id) + 1}`}
                                      </SelectItem>
                                    ))
                                  }
                                </SelectContent>
                              </Select>

                              {question.conditionalLogic?.questionId && (
                                <>
                                  <Select
                                    value={question.conditionalLogic.operator}
                                    onValueChange={(value: 'equals' | 'contains' | 'not_equals') => {
                                      updateQuestion(question.id, {
                                        conditionalLogic: {
                                          ...question.conditionalLogic!,
                                          operator: value
                                        }
                                      });
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select operator" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="equals">Equals</SelectItem>
                                      <SelectItem value="contains">Contains</SelectItem>
                                      <SelectItem value="not_equals">Not equals</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <Input
                                    value={question.conditionalLogic.value}
                                    onChange={(e) => {
                                      updateQuestion(question.id, {
                                        conditionalLogic: {
                                          ...question.conditionalLogic!,
                                          value: e.target.value
                                        }
                                      });
                                    }}
                                    placeholder="Enter value"
                                  />
                                </>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => addQuestion('text')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Text Question
        </Button>
        <Button onClick={() => addQuestion('choice')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Choice Question
        </Button>
        <Button onClick={() => addQuestion('email')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Email Question
        </Button>
        <Button onClick={() => addQuestion('number')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Number Question
        </Button>
        <Button onClick={() => addQuestion('rating')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Rating Question
        </Button>
        <Button onClick={() => addQuestion('date')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Date Question
        </Button>
      </div>
    </div>
  );
};