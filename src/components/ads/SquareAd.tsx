
import React from 'react';
import { GoogleAdSense } from './GoogleAdSense';

export const SquareAd: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <GoogleAdSense
      client="ca-pub-5920367457745298"
      slot="7007303613"
      className={`my-4 ${className || ''}`}
    />
  );
};
