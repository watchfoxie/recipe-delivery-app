import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ children, className = '', hoverable = false, padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };
  
  return (
    <div 
      className={`
        bg-white rounded-[1.25rem] shadow-rustic overflow-hidden
        ${hoverable ? 'transition-shadow duration-200 hover:shadow-rustic-lg cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
