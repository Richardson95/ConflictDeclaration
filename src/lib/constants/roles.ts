// User role constants matching backend ERole enum
export enum UserRole {
  Employee = 1,
  Admin = 3,
  ITAdmin = 4,
  Operations = 5,
  Compliance = 6,
}

// Helper function to check if user has admin access
export const hasAdminAccess = (role?: number): boolean => {
  return role === UserRole.Admin || role === UserRole.ITAdmin;
};

// Helper function to check if user is IT Admin specifically
export const isITAdmin = (role?: number): boolean => {
  return role === UserRole.ITAdmin;
};

// Helper function to check if user is Admin specifically
export const isAdmin = (role?: number): boolean => {
  return role === UserRole.Admin;
};

// Helper function to get role name
export const getRoleName = (role?: number): string => {
  switch (role) {
    case UserRole.Employee:
      return 'Employee';
    case UserRole.Admin:
      return 'Admin';
    case UserRole.ITAdmin:
      return 'IT Admin';
    case UserRole.Operations:
      return 'Operations';
    case UserRole.Compliance:
      return 'Compliance';
    default:
      return 'Unknown';
  }
};
