
/**
 * Utility functions for Google AdMob integration
 */

// Check if running in a mobile app environment
export const isMobileApp = (): boolean => {
  return window.location.href.includes('capacitor://') || 
         window.location.href.includes('app://') ||
         document.URL.includes('app://') ||
         navigator.userAgent.includes('Median');
};

// Initialize AdMob
export const initializeAdMob = (): void => {
  if (isMobileApp() && window.admob && window.admobAppId) {
    try {
      window.admob.initialize(window.admobAppId);
      console.log('AdMob initialized with ID:', window.admobAppId);
    } catch (error) {
      console.error('Error initializing AdMob:', error);
    }
  }
};

// Create and show banner ad
export const showBannerAd = (): void => {
  if (isMobileApp() && window.admob) {
    try {
      window.admob.createBannerView({
        adSize: window.admob.AD_SIZE.SMART_BANNER,
        adId: 'ca-app-pub-5920367457745298/1075487452', // Banner ad unit ID
        position: 8, // Bottom position
        autoShow: true
      });
      console.log('Banner ad displayed');
    } catch (error) {
      console.error('Error showing banner ad:', error);
    }
  }
};

// Show interstitial ad
export const showInterstitialAd = (): void => {
  if (isMobileApp() && window.admob) {
    try {
      window.admob.prepareInterstitial({
        adId: 'ca-app-pub-5920367457745298/6136242451', // Interstitial ad unit ID
        autoShow: true
      });
      console.log('Interstitial ad displayed');
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
    }
  }
};

// Show rewarded video ad
export const showRewardedAd = (): void => {
  if (isMobileApp() && window.admob && window.admob.prepareRewardVideoAd) {
    try {
      window.admob.prepareRewardVideoAd({
        adId: 'ca-app-pub-5920367457745298/4823161085', // Rewarded ad unit ID
        autoShow: true
      });
      console.log('Rewarded ad displayed');
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
    }
  }
};

// Hide banner ad
export const hideBannerAd = (): void => {
  if (isMobileApp() && window.admob) {
    try {
      window.admob.showBannerAd(false);
      console.log('Banner ad hidden');
    } catch (error) {
      console.error('Error hiding banner ad:', error);
    }
  }
};
