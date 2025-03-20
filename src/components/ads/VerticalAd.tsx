
import React from 'react';
import { GoogleAdSense } from './GoogleAdSense';

export const VerticalAd: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <GoogleAdSense
      client="ca-pub-5920367457745298"
      slot="7689829898"
      format="auto"
      responsive={true}
      className={`my-4 ${className || ''}`}
      style={{ display: 'block', minHeight: '280px' }}
    />
  );
};
