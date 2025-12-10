'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { useState, useEffect } from 'react';

import customTheme from '@/lib/styles/theme';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/lib/redux/store';

import { ColorModeProvider } from './color-mode';
import { msalConfig } from '@/authConfig';
import { setMsalInstance } from '@/lib/utils/msalTokenHelper';
import { AuthInitializer } from '@/components/AuthInitializer';

// Initialize MSAL instance outside component to avoid recreating
let msalInstance: PublicClientApplication | null = null;

export function Provider(props: React.PropsWithChildren) {
  const [instance, setInstance] = useState<PublicClientApplication | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only initialize MSAL on client side
    if (typeof window !== 'undefined' && !msalInstance) {
      msalInstance = new PublicClientApplication(msalConfig);

      // Initialize MSAL and handle any redirects
      msalInstance.initialize().then(() => {
        return msalInstance!.handleRedirectPromise();
      }).then(() => {
        setMsalInstance(msalInstance!); // Set global instance for token helper
        setInstance(msalInstance);
        setIsInitialized(true);
      }).catch((error) => {
        console.error('MSAL initialization error:', error);
        setIsInitialized(true); // Still set to true to avoid infinite loading
      });
    } else if (msalInstance) {
      setMsalInstance(msalInstance); // Set global instance for token helper
      setInstance(msalInstance);
      setIsInitialized(true);
    }
  }, []);

  // Show loading while MSAL initializes
  if (!isInitialized || !instance) {
    return (
      <ChakraProvider value={customTheme}>
        <ReduxProvider store={store}>
          <ColorModeProvider>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              fontSize: '16px',
              color: '#666'
            }}>
              Initializing...
            </div>
          </ColorModeProvider>
        </ReduxProvider>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider value={customTheme}>
      <ReduxProvider store={store}>
        <ColorModeProvider>
          <MsalProvider instance={instance}>
            <AuthInitializer>
              {props.children}
            </AuthInitializer>
          </MsalProvider>
        </ColorModeProvider>
      </ReduxProvider>
    </ChakraProvider>
  );
}
