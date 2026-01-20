export interface ICounterparty {
  id: string;
  name: string;
  sectorId: string;
  sectorName: string;
  conflictCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface ICounterpartyFilters {
  sector?: string;
  hasConflict?: boolean;
  searchTerm?: string;
  year?: number;
}

export interface IConflictCheckRequest {
  counterpartyId: string;
}

export interface IUserDeclaration {
  userId: string;
  userFullName: string;
  declarationId: string;
}

export interface IConflictCheckResponse {
  id?: string;
  referenceNumber?: string;
  hasConflict: boolean;
  message: string;
  checkedByFullName: string;
  checkedAt: string;
  counterparty: {
    id: string;
    name: string;
  };
  userDeclarations?: IUserDeclaration[];
}
