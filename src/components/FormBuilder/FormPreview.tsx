
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FormQuestion } from '../../types/form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { GradientBackground } from '../ui/gradient-background';

interface FormPreviewProps {
  questions: FormQuestion[];
  formTitle: string;
  formDescription: string;
  primaryColor: string;
  secondaryColor: string;
  onSubmit: (answers: { questionId: string; value: string | string[] }[]) => void;
}

export const FormPreview: React.FC<FormPreviewProps> = ({
  questions,
  formTitle,
  formDescription,
  primaryColor,
  secondaryColor,
  onSubmit
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({});
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [visibleQuestions, setVisibleQuestions] = useState<FormQuestion[]>([]);

  useEffect(() => {
    // Filter questions based on conditional logic
    const filteredQuestions = questions.filter(question => {
      if (!question.conditionalLogic) return true;
      
      const { questionId, operator, value } = question.conditionalLogic;
      const answer = answers[questionId];
      
      if (!answer) return false;
      
      switch (operator) {
        case 'equals':
          return answer === value;
        case 'contains':
          return typeof answer === 'string' && answer.includes(value);
        case 'not_equals':
          return answer !== value;
        default:
          return true;
      }
    });
    
    setVisibleQuestions(filteredQuestions);
  }, [questions, answers]);

  const currentQuestion = visibleQuestions[currentQuestionIndex];
  
  const handleNext = () => {
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setDirection('next');
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit the form
      const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value
      }));
      onSubmit(formattedAnswers);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setDirection('prev');
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const isLastQuestion = currentQuestionIndex === visibleQuestions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const variants = {
    enter: (direction: 'next' | 'prev') => ({
      x: direction === 'next' ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: 'next' | 'prev') => ({
      x: direction === 'next' ? -1000 : 1000,
      opacity: 0
    })
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    const questionId = currentQuestion.id;
    const value = answers[questionId] || '';

    switch (currentQuestion.type) {
      case 'text':
        return (
          <Textarea
            value={value as string}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full text-lg p-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg border-none focus:ring-2 focus:ring-opacity-50"
            style={{ minHeight: '120px', focusRingColor: primaryColor }}
          />
        );
      case 'email':
        return (
          <Input
            type="email"
            value={value as string}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            placeholder="Enter your email address..."
            className="w-full text-lg p-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg border-none focus:ring-2 focus:ring-opacity-50"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value as string}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            placeholder="Enter a number..."
            className="w-full text-lg p-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg border-none focus:ring-2 focus:ring-opacity-50"
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value as string}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            className="w-full text-lg p-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg border-none focus:ring-2 focus:ring-opacity-50"
          />
        );
      case 'rating':
        return (
          <div className="flex justify-center space-x-4 my-6">
            {[1, 2, 3, 4, 5].map((rating) => (
              <motion.button
                key={rating}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswerChange(questionId, rating.toString())}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-colors ${
                  value === rating.toString()
                    ? 'bg-opacity-100 text-white'
                    : 'bg-white bg-opacity-80 text-gray-700 hover:bg-opacity-90'
                }`}
                style={{
                  backgroundColor: value === rating.toString() ? primaryColor : undefined
                }}
              >
                {rating}
              </motion.button>
            ))}
          </div>
        );
      case 'choice':
        return (
          <RadioGroup
            value={value as string}
            onValueChange={(value) => handleAnswerChange(questionId, value)}
            className="space-y-3 mt-6"
          >
            {currentQuestion.options?.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center"
              >
                <div className="w-full">
                  <Label
                    htmlFor={`option-${questionId}-${index}`}
                    className="w-full p-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg flex items-center cursor-pointer transition-all hover:bg-opacity-100"
                  >
                    <RadioGroupItem
                      id={`option-${questionId}-${index}`}
                      value={option}
                      className="mr-3"
                    />
                    <span className="text-lg">{option}</span>
                  </Label>
                </div>
              </motion.div>
            ))}
          </RadioGroup>
        );
      default:
        return null;
    }
  };

  const isQuestionAnswered = () => {
    if (!currentQuestion) return false;
    
    const answer = answers[currentQuestion.id];
    
    if (currentQuestion.required) {
      return answer !== undefined && answer !== '';
    }
    
    return true;
  };

  // Show welcome screen if no questions
  if (visibleQuestions.length === 0) {
    return (
      <GradientBackground primaryColor={primaryColor} secondaryColor={secondaryColor}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full text-center text-white"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">No questions yet</h1>
            <p className="text-xl md:text-2xl opacity-90">
              Add some questions to your form to see the preview.
            </p>
          </motion.div>
        </div>
      </GradientBackground>
    );
  }

  // Show welcome screen if at start
  if (currentQuestionIndex === 0 && formTitle) {
    return (
      <GradientBackground primaryColor={primaryColor} secondaryColor={secondaryColor}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full text-center text-white"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{formTitle}</h1>
            {formDescription && (
              <p className="text-xl md:text-2xl opacity-90 mb-10">{formDescription}</p>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="px-8 py-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg text-white text-xl font-medium hover:bg-opacity-30 transition-all"
            >
              Start
            </motion.button>
          </motion.div>
        </div>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground primaryColor={primaryColor} secondaryColor={secondaryColor}>
      <div className="min-h-screen flex flex-col">
        {/* Progress bar */}
        <div className="w-full h-1 bg-white bg-opacity-20">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentQuestionIndex + 1) / visibleQuestions.length) * 100}%`
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentQuestionIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="w-full"
              >
                {currentQuestion && (
                  <div className="space-y-6">
                    <motion.h2
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl md:text-4xl font-bold text-white mb-6"
                    >
                      {currentQuestion.question}
                      {currentQuestion.required && (
                        <span className="text-red-400 ml-1">*</span>
                      )}
                    </motion.h2>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {renderQuestionInput()}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-10">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={isFirstQuestion}
                className={`${
                  isFirstQuestion ? 'opacity-0' : 'opacity-100'
                } bg-white bg-opacity-20 backdrop-blur-sm text-white border-white border-opacity-30 hover:bg-opacity-30`}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={currentQuestion?.required && !isQuestionAnswered()}
                className="bg-white text-gray-800 hover:bg-opacity-90"
              >
                {isLastQuestion ? 'Submit' : 'Next'}
                {!isLastQuestion && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
};