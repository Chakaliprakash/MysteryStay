import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  bordered = true,
  padding = 'p-6',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl ${
        bordered ? 'border border-[#E4DFD5]' : ''
      } ${
        hoverEffect ? 'luxury-card-hover' : 'shadow-luxury'
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
