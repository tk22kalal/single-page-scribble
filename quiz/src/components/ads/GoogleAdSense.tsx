
import React, { useEffect, useRef } from 'react';

interface GoogleAdSenseProps {
  client: string;
  slot: string;
  format?: string;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({
  client,
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  style = {},
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // Check if window and adsbygoogle exist
      if (typeof window !== 'undefined' && adRef.current) {
        // Push the ad to adsbygoogle
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        console.log('Ad pushed to adsbygoogle');
      }
    } catch (error) {
      console.error('Error rendering AdSense ad:', error);
    }
  }, []);

  return (
    <div className={className} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};
