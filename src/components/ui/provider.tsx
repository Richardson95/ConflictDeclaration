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

// Initialize MSAL instance outside component to avoid recreating
let msalInstance: PublicClientApplication | null = null;

export function Provider(props: React.PropsWithChildren) {
  const [instance, setInstance] = useState<PublicClientApplication | null>(null);

  useEffect(() => {
    // Only initialize MSAL on client side
    if (typeof window !== 'undefined' && !msalInstance) {
      msalInstance = new PublicClientApplication(msalConfig);
      setInstance(msalInstance);
    } else if (msalInstance) {
      setInstance(msalInstance);
    }
  }, []);

  // Render without MSAL until client-side initialization is complete
  if (!instance) {
    return (
      <ChakraProvider value={customTheme}>
        <ReduxProvider store={store}>
          <ColorModeProvider>
            {props.children}
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
            {props.children}
          </MsalProvider>
        </ColorModeProvider>
      </ReduxProvider>
    </ChakraProvider>
  );
}
