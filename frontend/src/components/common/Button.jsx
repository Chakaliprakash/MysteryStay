import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A66B]/50';

  const variants = {
    primary: 'bg-[#C6A66B] hover:bg-[#B5955A] text-[#14251F] font-semibold shadow-luxury-gold',
    navy: 'bg-[#14251F] hover:bg-[#1A2F27] text-[#F8F6F0] font-medium shadow-luxury',
    secondary: 'bg-[#EFECE4] hover:bg-[#E4DFD5] text-[#14251F]',
    outline: 'border border-[#14251F]/20 hover:border-[#14251F] text-[#14251F] bg-transparent',
    ghost: 'text-[#14251F] hover:bg-[#14251F]/5 bg-transparent',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
