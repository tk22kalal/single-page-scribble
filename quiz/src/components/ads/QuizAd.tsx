
import React from 'react';
import { GoogleAdSense } from './GoogleAdSense';

export const QuizAd: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <GoogleAdSense
      client="ca-pub-5920367457745298"
      slot="9876543210" // Replace with your actual ad slot for quiz section
      format="fluid"
      responsive={true}
      className={`my-4 ${className || ''}`}
      style={{ display: 'block', minHeight: '100px' }}
    />
  );
};
