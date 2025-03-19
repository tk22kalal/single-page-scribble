
import React from 'react';
import { GoogleAdSense } from './GoogleAdSense';

export const NativeAd: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <GoogleAdSense
      client="ca-pub-5920367457745298"
      slot="7380932456" // Replace with your actual Native ad slot
      format="fluid"
      responsive={true}
      className={`my-4 ${className || ''}`}
      style={{ display: 'block', minHeight: '250px' }}
    />
  );
};
