import { useState, useCallback } from 'react';

export const useTypewriterAnimation = () => {
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [currentStepText, setCurrentStepText] = useState<string>("");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  const [allThinkingSteps, setAllThinkingSteps] = useState<string[]>([]);

  const startTypewriterAnimation = useCallback(async (
    steps: string[], 
    onComplete?: () => void
  ) => {
    console.log('Starting typewriter animation with steps:', steps);
    
    for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
      const step = steps[stepIndex];
      setCurrentStepIndex(stepIndex);
      setIsTyping(true);
      setCurrentStepText("");
      
      // Type out the current step character by character
      for (let charIndex = 0; charIndex <= step.length; charIndex++) {
        await new Promise(resolve => setTimeout(resolve, 30)); // 30ms per character
        setCurrentStepText(step.substring(0, charIndex));
      }
      
      // Step completed, add to completed steps
      setThinkingSteps(prev => [...prev, step]);
      setIsTyping(false);
      
      // Pause between steps
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // All thinking complete
    console.log('Typewriter animation complete');
    setIsTyping(false);
    setCurrentStepText("");
    
    // Wait a moment then execute completion callback
    setTimeout(() => {
      onComplete?.();
    }, 1000);
  }, []);

  const resetAnimation = useCallback(() => {
    setThinkingSteps([]);
    setCurrentStepText("");
    setCurrentStepIndex(0);
    setIsTyping(false);
    setAllThinkingSteps([]);
  }, []);

  return {
    thinkingSteps,
    currentStepText,
    currentStepIndex,
    isTyping,
    allThinkingSteps,
    setAllThinkingSteps,
    startTypewriterAnimation,
    resetAnimation,
  };
};
