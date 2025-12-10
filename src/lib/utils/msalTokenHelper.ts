import { PublicClientApplication } from '@azure/msal-browser';
import { loginRequest } from '@/authConfig';
import Cookies from 'js-cookie';

let msalInstance: PublicClientApplication | null = null;

export const setMsalInstance = (instance: PublicClientApplication) => {
  msalInstance = instance;
};

export const getMsalInstance = () => msalInstance;

export const acquireFreshToken = async (): Promise<string | null> => {
  // First, try to get token from cookie
  const cookieToken = Cookies.get('token');

  if (!msalInstance) {
    // If MSAL isn't ready yet but we have a cookie token, use it
    if (cookieToken) {
      return cookieToken;
    }
    console.warn('MSAL instance not initialized and no token in cookies');
    return null;
  }

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    // No MSAL accounts, but if we have a cookie token, use it
    if (cookieToken) {
      return cookieToken;
    }
    console.warn('No active account found');
    return null;
  }

  const activeAccount = msalInstance.getActiveAccount() || accounts[0];

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: activeAccount,
      forceRefresh: false,
    });

    // Update the cookie with fresh token (7 days expiration)
    Cookies.set('token', response.accessToken, { expires: 7 });

    // Try to extract and store refresh token from MSAL cache
    try {
      const tokenCache = msalInstance.getTokenCache();
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        const account = accounts[0];
        // Get the refresh token from cache (MSAL stores it internally)
        // Note: MSAL doesn't expose refresh tokens directly for security reasons
        // They're managed internally and used automatically by acquireTokenSilent
      }
    } catch (cacheError) {
      // Refresh token extraction not critical - MSAL handles it internally
      console.debug('Could not extract refresh token from MSAL cache');
    }

    return response.accessToken;
  } catch (error) {
    console.error('Error acquiring token silently:', error);

    // If silent acquisition fails, try to get from cookie as fallback
    return cookieToken || null;
  }
};
