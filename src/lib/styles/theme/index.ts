import { createSystem, defaultConfig } from '@chakra-ui/react';

import { fonts } from './fonts';

const customTheme = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts,
      colors: {
        brand: {
          100: { value: '#227CBF' },
        },
        gray: {
          100: { value: '#F9FAFB' },
          200: { value: '#6B7280' },
          300: { value: '#6E7C8F' },
        },
        text: {
          100: { value: '#1C1E27' },
          200: { value: '#30345E' },
          300: { value: '#1C1C28' },
        },
        border: {
          100: { value: '#E5E7EB' },
        },
      },
      fontSizes: {
        sm: { value: '12px' },
        md: { value: '14px' },
        lg: { value: '16px' },
        xl: { value: '18px' },
        '2xl': { value: '20px' },
        '3xl': { value: '24px' },
        '4xl': { value: '32px' },
        '5xl': { value: '40px' },
        '6xl': { value: '48px' },
        '7xl': { value: '56px' },
        '8xl': { value: '64px' },
        '9xl': { value: '72px' },
      },
    },
  },
});

export default customTheme;
