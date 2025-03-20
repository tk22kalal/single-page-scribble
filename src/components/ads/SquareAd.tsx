
import React from 'react';
import { GoogleAdSense } from './GoogleAdSense';

export const SquareAd: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <GoogleAdSense
      client="ca-pub-5920367457745298"
      slot="7007303613"
      format="auto"
      responsive={true}
      className={`my-4 ${className || ''}`}
      style={{ display: 'block', minHeight: '250px' }}
    />
  );
};
