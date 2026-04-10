import React from 'react';
import { cn } from '../../lib/utils';
import './ui.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "apple-btn",
          `apple-btn-${variant}`,
          `apple-btn-${size}`,
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
