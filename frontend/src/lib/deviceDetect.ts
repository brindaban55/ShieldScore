export interface DeviceInfo {
  isMobile: boolean;
  isTouch: boolean;
  isCoarsePointer: boolean;
  viewportWidth: number;
  os: 'ios' | 'android' | 'windows' | 'mac' | 'linux' | 'other';
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTouch: false,
      isCoarsePointer: false,
      viewportWidth: 1200,
      os: 'other',
    };
  }

  const isTouch = navigator.maxTouchPoints > 0;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const viewportWidth = window.innerWidth;
  const isMobile = (isTouch && isCoarsePointer && viewportWidth < 768) || viewportWidth < 768;

  let os: DeviceInfo['os'] = 'other';
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) os = 'ios';
  else if (/android/.test(ua)) os = 'android';
  else if (/win/.test(ua)) os = 'windows';
  else if (/mac/.test(ua)) os = 'mac';
  else if (/linux/.test(ua)) os = 'linux';

  return {
    isMobile,
    isTouch,
    isCoarsePointer,
    viewportWidth,
    os,
  };
}

export interface MobileWalletLinks {
  oneAmDeepLink: string;
  oneAmAppStore: string;
  oneAmPlayStore: string;
  recommendedStoreUrl: string;
}

export function getMobileWalletLinks(dappUrl?: string): MobileWalletLinks {
  const targetUrl = dappUrl || (typeof window !== 'undefined' ? window.location.href : 'https://shieldscore.vercel.app');
  const encodedUrl = encodeURIComponent(targetUrl);
  const device = detectDevice();

  const oneAmAppStore = 'https://apps.apple.com/app/1am-wallet/id6479963283';
  const oneAmPlayStore = 'https://play.google.com/store/apps/details?id=xyz.oneam.wallet';
  const oneAmDeepLink = `https://1am.xyz/dapp?url=${encodedUrl}`;

  const recommendedStoreUrl = device.os === 'ios' ? oneAmAppStore : oneAmPlayStore;

  return {
    oneAmDeepLink,
    oneAmAppStore,
    oneAmPlayStore,
    recommendedStoreUrl,
  };
}
