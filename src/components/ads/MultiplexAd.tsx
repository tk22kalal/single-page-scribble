
import React from 'react';
import { GoogleAdSense } from './GoogleAdSense';

export const MultiplexAd: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <GoogleAdSense
      client="ca-pub-5920367457745298"
      slot="4567123890" // Replace with your actual Multiplex ad slot
      format="autorelaxed"
      responsive={true}
      className={`my-4 ${className || ''}`}
      style={{ display: 'block', minHeight: '250px' }}
    />
  );
};
