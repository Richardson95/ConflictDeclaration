export interface IEmployee {
  _id: string;
  fullName: string;
  department: string;
  status: 'Completed' | 'Pending';
  completedDate?: string;
}

export interface IEmployeeFilters {
  status: string;
  department: string;
  searchTerm: string;
}
