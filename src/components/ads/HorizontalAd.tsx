
import React from 'react';
import { GoogleAdSense } from './GoogleAdSense';

export const HorizontalAd: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <GoogleAdSense
      client="ca-pub-5920367457745298"
      slot="6240477852"
      className={`my-4 ${className || ''}`}
      style={{ display: 'block', minHeight: '90px' }}
    />
  );
};
