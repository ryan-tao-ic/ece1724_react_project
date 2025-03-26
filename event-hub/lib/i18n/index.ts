import commonEn from '@/locales/en/common.json';

// Define types for our translations
export type TranslationKey = string;

// Simple translation function
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  // Split the key by dots to navigate the nested structure
  const keys = key.split('.');
  
  // Start with the common English translations
  let value: any = commonEn;
  
  // Navigate through the nested structure
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // If the key doesn't exist, return the key itself as a fallback
      return key;
    }
  }
  
  // If we found a string, return it
  if (typeof value === 'string') {
    // Replace parameters in the string if any
    if (params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
      }, value);
    }
    return value;
  }
  
  // If we didn't find a string, return the key as a fallback
  return key;
}

// Export the translation function as the default export
export default t; 