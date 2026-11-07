import React from 'react';
import { Lock, Star, Sparkles, ShieldCheck, Tag } from 'lucide-react';

export const Badge = ({
  variant = 'mystery',
  children,
  className = '',
  icon = true
}) => {
  const styles = {
    mystery: 'bg-[#14251F] text-[#F8F6F0] border border-[#C6A66B]/30',
    discount: 'bg-[#0D8A5E] text-white font-semibold',
    gold: 'bg-[#F4EEDA] text-[#8C6D32] border border-[#C6A66B]/40 font-semibold',
    verified: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    neutral: 'bg-[#EFECE4] text-[#5A626A]'
  };

  const icons = {
    mystery: Lock,
    discount: Tag,
    gold: Star,
    verified: ShieldCheck,
    neutral: Sparkles
  };

  const SelectedIcon = icons[variant];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full shadow-sm ${styles[variant] || styles.neutral} ${className}`}>
      {icon && SelectedIcon && <SelectedIcon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
};

export default Badge;
