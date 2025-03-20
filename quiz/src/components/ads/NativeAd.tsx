
import React from 'react';
import { GoogleAdSense } from './GoogleAdSense';

export const NativeAd: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <GoogleAdSense
      client="ca-pub-5920367457745298"
      slot="7007303613" // Using Square Ad slot for Native placement
      format="auto"
      responsive={true}
      className={`my-4 ${className || ''}`}
      style={{ display: 'block', minHeight: '250px' }}
    />
  );
};
