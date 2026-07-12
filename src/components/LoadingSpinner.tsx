import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  return (
    <div className={`spinner-wrapper spinner-wrapper--${size}`}>
      <div className="spinner" />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}
