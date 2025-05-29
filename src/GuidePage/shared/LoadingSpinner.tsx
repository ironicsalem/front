import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'amber' | 'blue' | 'gray' | 'white';
  text?: string;
  textPosition?: 'right' | 'bottom';
  className?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'amber',
  text,
  textPosition = 'right',
  className = '',
  fullScreen = false
}) => {
  // Size configurations
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-16 h-16'
  };

  // Color configurations
  const colorClasses = {
    amber: 'border-amber-500 border-t-transparent',
    blue: 'border-blue-500 border-t-transparent',
    gray: 'border-gray-500 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  // Text color based on spinner color
  const textColorClasses = {
    amber: 'text-amber-700',
    blue: 'text-blue-700',
    gray: 'text-gray-700',
    white: 'text-white'
  };

  const spinnerElement = (
    <div
      className={`
        ${sizeClasses[size]} 
        border-4 
        ${colorClasses[color]} 
        rounded-full 
        animate-spin
      `}
      role="status"
      aria-label="Loading"
    />
  );

  const textElement = text && (
    <span className={`font-medium ${textColorClasses[color]}`}>
      {text}
    </span>
  );

  const content = (
    <div
      className={`
        flex items-center 
        ${textPosition === 'bottom' ? 'flex-col space-y-3' : 'space-x-3'}
        ${className}
      `}
    >
      {spinnerElement}
      {textElement}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Specific loading components for common use cases
export const CenteredSpinner: React.FC<Omit<LoadingSpinnerProps, 'fullScreen'>> = (props) => (
  <div className="flex justify-center py-12">
    <LoadingSpinner {...props} />
  </div>
);

export const InlineSpinner: React.FC<Omit<LoadingSpinnerProps, 'fullScreen' | 'textPosition'>> = (props) => (
  <LoadingSpinner {...props} size="small" textPosition="right" />
);

export const FullScreenSpinner: React.FC<Omit<LoadingSpinnerProps, 'fullScreen'>> = (props) => (
  <LoadingSpinner {...props} fullScreen />
);

export default LoadingSpinner;