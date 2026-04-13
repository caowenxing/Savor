import React from 'react';

/**
 * Savor Logo Image Component
 */
export const SavorLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 48,
  className = '',
}) => {
  return (
    <img
      src="https://i.imgur.com/C9uMIq8.jpeg"
      alt="Savor Logo"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'cover', borderRadius: '12px' }}
    />
  );
};

export default SavorLogo;
