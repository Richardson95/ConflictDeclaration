// Assessment for a single counterparty
export interface IAssessment {
  counterpartyId: string;
  hasConflict: boolean;
  notes: string;
}

// Request body for submitting a declaration
export interface IDeclarationFormData {
  userId: string;
  year: number;
  policyAccepted: boolean;
  assessments: IAssessment[];
}

// Declaration response from API
export interface IDeclaration {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  departmentName: string;
  year: number;
  submittedAt: string;
  status: number;
  statusName: string;
  totalCounterparties: number;
  conflictCount: number;
  asssessmentDtos: IAssessment[] | null;
  createdAt: string;
}

export interface IDeclarationHistory {
  id: string;
  year: number;
  status: number;
  statusName: string;
  submittedAt: string;
  totalCounterparties: number;
  conflictCount: number;
}

// Counterparty in history response
export interface IHistoryCounterparty {
  serialNumber: number;
  counterparty: string | { id: string; name: string; description: string; createdAt: string };
  sector: string;
  hasConflict: boolean;
}

// Declaration with counterparties for history
export interface IDeclarationWithCounterparties {
  serialNumber: number;
  declarationId: string;
  userId: string;
  userFullName: string;
  year: number;
  submittedAt: string;
  counterparties: IHistoryCounterparty[];
}

// History response
export interface IDeclarationHistoryResponse {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  result: IDeclarationWithCounterparties[];
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
