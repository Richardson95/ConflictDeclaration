// User role constants matching backend ERole enum
export enum UserRole {
  Employee = 1,
  ITAdmin = 4,
  Leadership = 5,
  ComplianceTeam = 6,
  RiskAndCompliance = 7,
}

// Helper function to check if user has admin access
export const hasAdminAccess = (role?: number): boolean => {
  return role === UserRole.ITAdmin || role === UserRole.RiskAndCompliance || role === UserRole.Leadership || role === UserRole.ComplianceTeam;
};

// Helper function to check if user has Leadership role
export const isLeadership = (role?: number): boolean => {
  return role === UserRole.Leadership;
};

// Helper function to check if user is IT Admin specifically
export const isITAdmin = (role?: number): boolean => {
  return role === UserRole.ITAdmin;
};

// Helper function to check if user can view counterparty conflict details (Risk and Compliance only)
export const canViewConflictDetails = (role?: number): boolean => {
  return role === UserRole.RiskAndCompliance;
};

// Helper function to get role name
export const getRoleName = (role?: number): string => {
  switch (role) {
    case UserRole.Employee:
      return 'Employee';
    case UserRole.ITAdmin:
      return 'IT Admin';
    case UserRole.Leadership:
      return 'Leadership';
    case UserRole.ComplianceTeam:
      return 'Compliance Team';
    case UserRole.RiskAndCompliance:
      return 'Risk and Compliance';
    default:
      return 'Unknown';
  }
};
