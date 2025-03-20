
import React from 'react';
import { GoogleAdSense } from './GoogleAdSense';

export const MultiplexVerticalAd: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <GoogleAdSense
      client="ca-pub-5920367457745298"
      slot="5852475363"
      format="autorelaxed"
      responsive={true}
      className={`my-4 ${className || ''}`}
      style={{ display: 'block', minHeight: '600px' }}
    />
  );
};
