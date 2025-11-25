export interface IDeclaration {
  _id: string;
  employeeId: string;
  year: number;
  answers: Record<string, string>;
  policyAgreed: boolean;
  status: 'Completed' | 'Pending';
  submittedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDeclarationFormData {
  employeeId: string;
  year: number;
  answers: Record<string, string>;
  policyAgreed: boolean;
}

export interface IDeclarationHistory {
  _id: string;
  year: number;
  status: 'Completed' | 'Pending';
  submittedDate?: string;
  hasConflicts: boolean;
  conflictCount: number;
}

export interface IConflictCheck {
  checkId: string;
  counterpartyId: string;
  counterpartyName: string;
  checkedBy: string;
  checkedAt: string;
  hasConflict: boolean;
  conflictedEmployees?: string[];
}
