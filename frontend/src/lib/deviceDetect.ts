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
