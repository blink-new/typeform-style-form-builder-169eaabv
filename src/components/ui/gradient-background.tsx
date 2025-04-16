
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface GradientBackgroundProps {
  primaryColor: string;
  secondaryColor: string;
  children: React.ReactNode;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  primaryColor,
  secondaryColor,
  children
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <motion.div 
      className="min-h-screen w-full relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, ${primaryColor}, ${secondaryColor})`,
        }}
        animate={{
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, ${primaryColor}, ${secondaryColor})`,
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {children}
    </motion.div>
  );
};