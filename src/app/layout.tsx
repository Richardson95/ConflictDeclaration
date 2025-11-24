import type { Metadata, Viewport } from 'next';

import '@/lib/styles/globals.css';
import { Provider } from '@/components/ui/provider';
import { Toaster } from '@/components/ui';

type RootLayoutProps = {
  children: React.ReactNode;
};

const APP_NAME = 'Conflict Check Portal';

export const metadata: Metadata = {
  title: { default: APP_NAME, template: '%s | Conflict Check Portal' },
  description: 'InfraCredit Conflict Check Portal',
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Conflict Check Portal',
    description: 'InfraCredit Conflict Check Portal',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFFFFF',
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Provider>
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
};

export default RootLayout;
