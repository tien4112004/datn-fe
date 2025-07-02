import CryptoJS from 'crypto-js';

const CRYPTO_KEY = 'pptist';

/**
 * Encrypt
 * @param msg String to encrypt
 */
export const encrypt = (msg: string) => {
  return CryptoJS.AES.encrypt(msg, CRYPTO_KEY).toString();
};

/**
 * Decrypt
 * @param ciphertext String to decrypt
 */
export const decrypt = (ciphertext: string) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, CRYPTO_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
