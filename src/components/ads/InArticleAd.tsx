
import React from 'react';
import { GoogleAdSense } from './GoogleAdSense';

export const InArticleAd: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <GoogleAdSense
      client="ca-pub-5920367457745298"
      slot="5678912345" // Replace with your actual In-article ad slot
      format="fluid"
      responsive={true}
      className={`my-4 ${className || ''}`}
      style={{ display: 'block', textAlign: 'center' }}
    />
  );
};
