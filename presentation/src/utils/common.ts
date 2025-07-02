import { padStart } from 'lodash';

/**
 * Pad the number with leading zeros
 * @param digit Number
 * @param len Number of digits
 */
export const fillDigit = (digit: number, len: number) => {
  return padStart('' + digit, len, '0');
};

/**
 * Determine device type
 */
export const isPC = () => {
  return !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|Mobile|BlackBerry|Symbian|Windows Phone)/i);
};

/**
 * Determine if string is a valid URL
 */
export const isValidURL = (url: string) => {
  return /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/[\w-./?%&=]*)?$/i.test(url);
};
