import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hoverable = false, className = '', ...props }) => {
  return (
    <div
      className={`bg-surface border border-border-color rounded-xl p-5 text-text-main shadow-sm transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
