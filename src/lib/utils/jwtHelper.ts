import Cookies from 'js-cookie';

// Decode JWT token and extract claims
export const decodeJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Get userId from JWT token
export const getUserIdFromToken = (): string | null => {
  const token = Cookies.get('token');
  if (!token) {
    console.log('No token found in cookies');
    return null;
  }

  const decoded = decodeJwt(token);
  if (!decoded) {
    console.log('Failed to decode token');
    return null;
  }

  // Log all claims to see what's available
  console.log('JWT Token Claims:', decoded);

  // Try different possible claim names for userId
  // Common claims: sub, userId, nameid, uid, user_id, oid (object id)
  const userId =
    decoded.userId ||
    decoded.user_id ||
    decoded.uid ||
    decoded.oid ||
    decoded.nameid ||
    decoded.sub ||
    decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
    decoded['http://schemas.microsoft.com/identity/claims/objectidentifier'] ||
    null;

  console.log('Extracted userId:', userId);

  return userId;
};

// Get user email from JWT token
export const getUserEmailFromToken = (): string | null => {
  const token = Cookies.get('token');
  if (!token) return null;

  const decoded = decodeJwt(token);
  if (!decoded) return null;

  return (
    decoded.email ||
    decoded.upn ||
    decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
    null
  );
};

// Get all user claims from token
export const getUserClaimsFromToken = (): Record<string, any> | null => {
  const token = Cookies.get('token');
  if (!token) return null;

  return decodeJwt(token);
};
