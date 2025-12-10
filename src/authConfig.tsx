import { LogLevel } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: '9dae18a6-567d-4555-9dce-2c50a3ad3ecf',
    authority:
      'https://login.microsoftonline.com/3d1d815e-5346-4244-9f7b-62b78fb742b1',
    redirectUri: 'http://localhost:3000',
    // redirectUri: 'https://ta-eta-wine.vercel.app',
  },
  cache: {
    cacheLocation: 'localStorage', // Changed from sessionStorage to persist across sessions
    storeAuthStateInCookie: true, // Store state in cookie for better persistence
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: any, containsPii: any) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          default:
            break;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: ['api://aba68f74-198c-4271-bbb1-8331688b4a09/Grant.API.Access', 'offline_access'],
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};
