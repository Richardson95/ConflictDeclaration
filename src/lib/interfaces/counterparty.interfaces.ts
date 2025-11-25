export interface ICounterparty {
  _id: string;
  name: string;
  sector: string;
  conflicts: number;
  hasConflict: boolean;
  employees: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ICounterpartyFilters {
  sector?: string;
  hasConflict?: boolean;
  searchTerm?: string;
  year?: number;
}

export interface IConflictCheckRequest {
  counterpartyId: string;
  year: number;
}

export interface IConflictCheckResponse {
  checkId: string;
  counterpartyName: string;
  hasConflict: boolean;
  conflictedEmployees: IConflictedEmployee[];
  checkedBy: string;
  checkedAt: string;
}

export interface IConflictedEmployee {
  _id: string;
  fullName: string;
  department: string;
}
