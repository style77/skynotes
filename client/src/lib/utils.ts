import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const humanFriendlySize = (size: number, unit?: string) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let l = 0, n = size || 0;

  const unitIndex = unit ? units.indexOf(unit.toUpperCase()) : -1;

  if (unitIndex !== -1) {
    n = n / Math.pow(1024, unitIndex);
    return (n.toFixed(n >= 10 || unitIndex < 1 ? 0 : 1) + ' ' + units[unitIndex]);
  } else {
    while (n >= 1024 && ++l) n = n / 1024;
    return (n.toFixed(n >= 10 || l < 1 ? 0 : 1) + ' ' + units[l]);
  }
}

export const getOS = () => {
  const os = ['Windows', 'Linux', 'Mac'];
  return os.find(v => ((global as any).window?.navigator.platform.indexOf(v) >= 0))  // eslint-disable-line
}