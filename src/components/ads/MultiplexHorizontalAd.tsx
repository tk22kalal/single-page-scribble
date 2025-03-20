
import React from 'react';
import { GoogleAdSense } from './GoogleAdSense';

export const MultiplexHorizontalAd: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <GoogleAdSense
      client="ca-pub-5920367457745298"
      slot="9828708383"
      format="autorelaxed"
      responsive={true}
      className={`my-4 ${className || ''}`}
      style={{ display: 'block', minHeight: '250px' }}
    />
  );
};
