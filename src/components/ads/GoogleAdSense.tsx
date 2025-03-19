
import React, { useEffect, useRef } from 'react';

interface GoogleAdSenseProps {
  client: string;
  slot: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
  layout?: string;
  layoutKey?: string;
}

export const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({
  client,
  slot,
  format = 'auto',
  responsive = true,
  style,
  className,
  layout,
  layoutKey,
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run this on the client side
    if (typeof window === 'undefined') return;

    try {
      // Add AdSense script if it doesn't exist
      const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
      
      if (!existingScript) {
        const adScript = document.createElement('script');
        adScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
        adScript.async = true;
        adScript.crossOrigin = 'anonymous';
        document.head.appendChild(adScript);
      }

      // Push the ad
      if (adRef.current) {
        const ads = adRef.current.querySelectorAll('ins.adsbygoogle');
        if (ads.length > 0) {
          // Initialize adsbygoogle if it doesn't exist
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      }
    } catch (error) {
      console.error('Error loading AdSense ads:', error);
    }
  }, [client]);

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={style || { display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        data-ad-layout={layout}
        data-ad-layout-key={layoutKey}
      />
    </div>
  );
};
