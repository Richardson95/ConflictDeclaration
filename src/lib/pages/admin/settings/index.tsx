'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Select as ChakraSelect,
  createListCollection,
  Image,
} from '@chakra-ui/react';
import { Button } from '@/components/ui';
import AdminLayout from '@/lib/layout/AdminLayout';

// Mock data for employees in settings
const baseEmployees = [
  { firstName: 'Segun', lastName: 'Arinze', email: 's.arinze@gmail.com', department: 'Finance', role: 'Lead Transactor', isActive: true },
  { firstName: 'Segun', lastName: 'Arinze', email: 's.arinze@gmail.com', department: 'Compliance', role: 'Lead Transactor', isActive: true },
  { firstName: 'Segun', lastName: 'Arinze', email: 's.arinze@gmail.com', department: 'Origination & Structuring', role: 'Lead Transactor', isActive: false },
  { firstName: 'Segun', lastName: 'Arinze', email: 's.arinze@gmail.com', department: 'Compliance', role: 'Lead Transactor', isActive: true },
];

const mockEmployees = Array.from({ length: 512 }, (_, i) => ({
  _id: (i + 1).toString(),
  firstName: baseEmployees[i % baseEmployees.length].firstName,
  lastName: baseEmployees[i % baseEmployees.length].lastName,
  email: baseEmployees[i % baseEmployees.length].email,
  department: baseEmployees[i % baseEmployees.length].department,
  role: baseEmployees[i % baseEmployees.length].role,
  isActive: baseEmployees[i % baseEmployees.length].isActive,
}));

// Mock data for roles
const baseRoles = [
  { name: 'Compliance', description: 'Compliance' },
  { name: 'Operations', description: 'Operations' },
  { name: 'IT Admin', description: 'IT Admin' },
  { name: 'Employee', description: 'Employee' },
];

const mockRoles = Array.from({ length: 512 }, (_, i) => ({
  _id: (i + 1).toString(),
  name: baseRoles[i % baseRoles.length].name,
  description: baseRoles[i % baseRoles.length].description,
}));

// Mock data for departments
const baseDepartments = [
  { name: 'Credit Risk', description: 'Admin User' },
  { name: 'ESG & DI', description: 'ESG & DI' },
  { name: 'Information Technology & Digital Service', description: 'Information Technology & Digital Service' },
];

const mockDepartments = Array.from({ length: 512 }, (_, i) => ({
  _id: (i + 1).toString(),
  name: baseDepartments[i % baseDepartments.length].name,
  description: baseDepartments[i % baseDepartments.length].description,
}));

// Mock data for counterparties
const baseCounterparties = [
  { name: 'Access Bank', description: 'Access Bank', sector: 'Banking' },
  { name: 'Deloitte', description: 'Deloitte', sector: 'Technology' },
  { name: 'KPMG', description: 'KPMG', sector: 'Professional Services' },
];

const mockCounterparties = Array.from({ length: 512 }, (_, i) => ({
  _id: (i + 1).toString(),
  name: baseCounterparties[i % baseCounterparties.length].name,
  description: baseCounterparties[i % baseCounterparties.length].description,
  sector: baseCounterparties[i % baseCounterparties.length].sector,
}));

// Mock data for sectors
const baseSectors = [
  { name: 'Banking', description: 'Banking' },
  { name: 'Technology', description: 'Technology' },
  { name: 'Professional Services', description: 'Professional Services' },
];

const mockSectors = Array.from({ length: 512 }, (_, i) => ({
  _id: (i + 1).toString(),
  name: baseSectors[i % baseSectors.length].name,
  description: baseSectors[i % baseSectors.length].description,
}));

// Mock data for activity log
const baseActivityLogs = [
  { fullName: 'Segun Arinze', email: 's.arinze@gmail.com', dateTime: '24th June, 2025', action: 'Declared Conflict' },
  { fullName: 'Chamara Eze', email: 'c.eze@gmail.com', dateTime: '24th June, 2025', action: 'Checked for conflict declaration on Access Bank' },
];

const mockActivityLogs = Array.from({ length: 512 }, (_, i) => ({
  _id: (i + 1).toString(),
  fullName: baseActivityLogs[i % baseActivityLogs.length].fullName,
  email: baseActivityLogs[i % baseActivityLogs.length].email,
  dateTime: baseActivityLogs[i % baseActivityLogs.length].dateTime,
  action: baseActivityLogs[i % baseActivityLogs.length].action,
}));

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('Employees');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [employees, setEmployees] = useState(mockEmployees);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    role: '',
  });

  // Roles state
  const [roles, setRoles] = useState(mockRoles);
  const [rolesCurrentPage, setRolesCurrentPage] = useState(1);
  const [rolesItemsPerPage, setRolesItemsPerPage] = useState(10);
  const [rolesSearchQuery, setRolesSearchQuery] = useState('');
  const [showDeleteRoleModal, setShowDeleteRoleModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<string | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
  });
  const [editRole, setEditRole] = useState({
    name: '',
    description: '',
  });

  // Departments state
  const [departments, setDepartments] = useState(mockDepartments);
  const [departmentsCurrentPage, setDepartmentsCurrentPage] = useState(1);
  const [departmentsItemsPerPage, setDepartmentsItemsPerPage] = useState(10);
  const [departmentsSearchQuery, setDepartmentsSearchQuery] = useState('');
  const [showDeleteDepartmentModal, setShowDeleteDepartmentModal] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<string | null>(null);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
  });
  const [editDepartment, setEditDepartment] = useState({
    name: '',
    description: '',
  });

  // Counterparties state
  const [counterparties, setCounterparties] = useState(mockCounterparties);
  const [counterpartiesCurrentPage, setCounterpartiesCurrentPage] = useState(1);
  const [counterpartiesItemsPerPage, setCounterpartiesItemsPerPage] = useState(10);
  const [counterpartiesSearchQuery, setCounterpartiesSearchQuery] = useState('');
  const [showDeleteCounterpartyModal, setShowDeleteCounterpartyModal] = useState(false);
  const [counterpartyToDelete, setCounterpartyToDelete] = useState<string | null>(null);
  const [showAddCounterpartyModal, setShowAddCounterpartyModal] = useState(false);
  const [showEditCounterpartyModal, setShowEditCounterpartyModal] = useState(false);
  const [counterpartyToEdit, setCounterpartyToEdit] = useState<string | null>(null);
  const [newCounterparty, setNewCounterparty] = useState({
    name: '',
    description: '',
    sector: '',
  });
  const [editCounterparty, setEditCounterparty] = useState({
    name: '',
    description: '',
    sector: '',
  });

  // Sectors state
  const [sectors, setSectors] = useState(mockSectors);
  const [sectorsCurrentPage, setSectorsCurrentPage] = useState(1);
  const [sectorsItemsPerPage, setSectorsItemsPerPage] = useState(10);
  const [sectorsSearchQuery, setSectorsSearchQuery] = useState('');
  const [showDeleteSectorModal, setShowDeleteSectorModal] = useState(false);
  const [sectorToDelete, setSectorToDelete] = useState<string | null>(null);
  const [showAddSectorModal, setShowAddSectorModal] = useState(false);
  const [showEditSectorModal, setShowEditSectorModal] = useState(false);
  const [sectorToEdit, setSectorToEdit] = useState<string | null>(null);
  const [newSector, setNewSector] = useState({
    name: '',
    description: '',
  });
  const [editSector, setEditSector] = useState({
    name: '',
    description: '',
  });

  // Activity Log state
  const [activityLogs] = useState(mockActivityLogs);
  const [activityLogsCurrentPage, setActivityLogsCurrentPage] = useState(1);
  const [activityLogsItemsPerPage, setActivityLogsItemsPerPage] = useState(10);
  const [activityLogsSearchQuery] = useState('');

  const tabs = ['Employees', 'Roles', 'Departments', 'Counterparties', 'Sectors', 'Activity log'];

  // Filter options
  const departmentOptions = [
    ...Array.from(new Set(employees.map((item) => item.department))).map(
      (dept) => ({
        label: dept,
        value: dept,
      })
    ),
  ];

  const roleOptions = [
    { label: 'Lead Transactor', value: 'Lead Transactor' },
  ];

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  const departmentCollection = createListCollection({
    items: departmentOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const roleCollection = createListCollection({
    items: roleOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const statusCollection = createListCollection({
    items: statusOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const sectorOptions = [
    { label: 'Banking', value: 'Banking' },
    { label: 'Technology', value: 'Technology' },
    { label: 'Professional Services', value: 'Professional Services' },
  ];

  const sectorCollection = createListCollection({
    items: sectorOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const itemsPerPageOptions = [10, 20, 50, 100].map((num) => ({
    label: num.toString(),
    value: num.toString(),
  }));

  const itemsPerPageCollection = createListCollection({
    items: itemsPerPageOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  // Filter data
  const filteredData = useMemo(() => {
    return employees.filter((item) => {
      const matchesSearch =
        item.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = !selectedDepartment || item.department === selectedDepartment;
      const matchesRole = !selectedRole || item.role === selectedRole;
      const matchesStatus =
        !selectedStatus ||
        (selectedStatus === 'active' && item.isActive) ||
        (selectedStatus === 'inactive' && !item.isActive);

      return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
    });
  }, [employees, searchQuery, selectedDepartment, selectedRole, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Generate page numbers
  const renderPageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  const handleToggleStatus = (employeeId: string) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp._id === employeeId ? { ...emp, isActive: !emp.isActive } : emp
      )
    );
  };

  const handleEdit = (employeeId: string) => {
    console.log('Edit employee:', employeeId);
    // Navigate to edit page or open edit modal
    // For now, just log the action
  };

  const handleDelete = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      setEmployees((prev) => prev.filter((emp) => emp._id !== employeeToDelete));
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
  };

  const handleAddEmployee = () => {
    if (newEmployee.firstName && newEmployee.lastName && newEmployee.email && newEmployee.department && newEmployee.role) {
      const employee = {
        _id: (employees.length + 1).toString(),
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        email: newEmployee.email,
        department: newEmployee.department,
        role: newEmployee.role,
        isActive: true,
      };
      setEmployees((prev) => [...prev, employee]);
      setShowAddModal(false);
      setNewEmployee({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        role: '',
      });
    }
  };

  const cancelAddEmployee = () => {
    setShowAddModal(false);
    setNewEmployee({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      role: '',
    });
  };

  // Roles handlers
  const handleEditRole = (roleId: string) => {
    const role = roles.find((r) => r._id === roleId);
    if (role) {
      setRoleToEdit(roleId);
      setEditRole({
        name: role.name,
        description: role.description,
      });
      setShowEditRoleModal(true);
    }
  };

  const handleDeleteRole = (roleId: string) => {
    setRoleToDelete(roleId);
    setShowDeleteRoleModal(true);
  };

  const confirmDeleteRole = () => {
    if (roleToDelete) {
      setRoles((prev) => prev.filter((role) => role._id !== roleToDelete));
      setShowDeleteRoleModal(false);
      setRoleToDelete(null);
    }
  };

  const cancelDeleteRole = () => {
    setShowDeleteRoleModal(false);
    setRoleToDelete(null);
  };

  const handleAddRole = () => {
    if (newRole.name && newRole.description) {
      const role = {
        _id: (roles.length + 1).toString(),
        name: newRole.name,
        description: newRole.description,
      };
      setRoles((prev) => [...prev, role]);
      setShowAddRoleModal(false);
      setNewRole({
        name: '',
        description: '',
      });
    }
  };

  const cancelAddRole = () => {
    setShowAddRoleModal(false);
    setNewRole({
      name: '',
      description: '',
    });
  };

  const handleUpdateRole = () => {
    if (roleToEdit && editRole.name && editRole.description) {
      setRoles((prev) =>
        prev.map((role) =>
          role._id === roleToEdit
            ? { ...role, name: editRole.name, description: editRole.description }
            : role
        )
      );
      setShowEditRoleModal(false);
      setRoleToEdit(null);
      setEditRole({
        name: '',
        description: '',
      });
    }
  };

  const cancelEditRole = () => {
    setShowEditRoleModal(false);
    setRoleToEdit(null);
    setEditRole({
      name: '',
      description: '',
    });
  };

  // Departments handlers
  const handleEditDepartment = (departmentId: string) => {
    const department = departments.find((d) => d._id === departmentId);
    if (department) {
      setDepartmentToEdit(departmentId);
      setEditDepartment({
        name: department.name,
        description: department.description,
      });
      setShowEditDepartmentModal(true);
    }
  };

  const handleDeleteDepartment = (departmentId: string) => {
    setDepartmentToDelete(departmentId);
    setShowDeleteDepartmentModal(true);
  };

  const confirmDeleteDepartment = () => {
    if (departmentToDelete) {
      setDepartments((prev) => prev.filter((dept) => dept._id !== departmentToDelete));
      setShowDeleteDepartmentModal(false);
      setDepartmentToDelete(null);
    }
  };

  const cancelDeleteDepartment = () => {
    setShowDeleteDepartmentModal(false);
    setDepartmentToDelete(null);
  };

  const handleAddDepartment = () => {
    if (newDepartment.name && newDepartment.description) {
      const department = {
        _id: (departments.length + 1).toString(),
        name: newDepartment.name,
        description: newDepartment.description,
      };
      setDepartments((prev) => [...prev, department]);
      setShowAddDepartmentModal(false);
      setNewDepartment({
        name: '',
        description: '',
      });
    }
  };

  const cancelAddDepartment = () => {
    setShowAddDepartmentModal(false);
    setNewDepartment({
      name: '',
      description: '',
    });
  };

  const handleUpdateDepartment = () => {
    if (departmentToEdit && editDepartment.name && editDepartment.description) {
      setDepartments((prev) =>
        prev.map((dept) =>
          dept._id === departmentToEdit
            ? { ...dept, name: editDepartment.name, description: editDepartment.description }
            : dept
        )
      );
      setShowEditDepartmentModal(false);
      setDepartmentToEdit(null);
      setEditDepartment({
        name: '',
        description: '',
      });
    }
  };

  const cancelEditDepartment = () => {
    setShowEditDepartmentModal(false);
    setDepartmentToEdit(null);
    setEditDepartment({
      name: '',
      description: '',
    });
  };

  // Counterparties handlers
  const handleEditCounterparty = (counterpartyId: string) => {
    const counterparty = counterparties.find((c) => c._id === counterpartyId);
    if (counterparty) {
      setCounterpartyToEdit(counterpartyId);
      setEditCounterparty({
        name: counterparty.name,
        description: counterparty.description,
        sector: counterparty.sector,
      });
      setShowEditCounterpartyModal(true);
    }
  };

  const handleDeleteCounterparty = (counterpartyId: string) => {
    setCounterpartyToDelete(counterpartyId);
    setShowDeleteCounterpartyModal(true);
  };

  const confirmDeleteCounterparty = () => {
    if (counterpartyToDelete) {
      setCounterparties((prev) => prev.filter((cp) => cp._id !== counterpartyToDelete));
      setShowDeleteCounterpartyModal(false);
      setCounterpartyToDelete(null);
    }
  };

  const cancelDeleteCounterparty = () => {
    setShowDeleteCounterpartyModal(false);
    setCounterpartyToDelete(null);
  };

  const handleAddCounterparty = () => {
    if (newCounterparty.name && newCounterparty.description && newCounterparty.sector) {
      const counterparty = {
        _id: (counterparties.length + 1).toString(),
        name: newCounterparty.name,
        description: newCounterparty.description,
        sector: newCounterparty.sector,
      };
      setCounterparties((prev) => [...prev, counterparty]);
      setShowAddCounterpartyModal(false);
      setNewCounterparty({
        name: '',
        description: '',
        sector: '',
      });
    }
  };

  const cancelAddCounterparty = () => {
    setShowAddCounterpartyModal(false);
    setNewCounterparty({
      name: '',
      description: '',
      sector: '',
    });
  };

  const handleUpdateCounterparty = () => {
    if (counterpartyToEdit && editCounterparty.name && editCounterparty.description && editCounterparty.sector) {
      setCounterparties((prev) =>
        prev.map((cp) =>
          cp._id === counterpartyToEdit
            ? { ...cp, name: editCounterparty.name, description: editCounterparty.description, sector: editCounterparty.sector }
            : cp
        )
      );
      setShowEditCounterpartyModal(false);
      setCounterpartyToEdit(null);
      setEditCounterparty({
        name: '',
        description: '',
        sector: '',
      });
    }
  };

  const cancelEditCounterparty = () => {
    setShowEditCounterpartyModal(false);
    setCounterpartyToEdit(null);
    setEditCounterparty({
      name: '',
      description: '',
      sector: '',
    });
  };

  // Sectors handlers
  const handleEditSector = (sectorId: string) => {
    const sector = sectors.find((s) => s._id === sectorId);
    if (sector) {
      setSectorToEdit(sectorId);
      setEditSector({
        name: sector.name,
        description: sector.description,
      });
      setShowEditSectorModal(true);
    }
  };

  const handleDeleteSector = (sectorId: string) => {
    setSectorToDelete(sectorId);
    setShowDeleteSectorModal(true);
  };

  const confirmDeleteSector = () => {
    if (sectorToDelete) {
      setSectors((prev) => prev.filter((s) => s._id !== sectorToDelete));
      setShowDeleteSectorModal(false);
      setSectorToDelete(null);
    }
  };

  const cancelDeleteSector = () => {
    setShowDeleteSectorModal(false);
    setSectorToDelete(null);
  };

  const handleAddSector = () => {
    if (newSector.name && newSector.description) {
      const sector = {
        _id: (sectors.length + 1).toString(),
        name: newSector.name,
        description: newSector.description,
      };
      setSectors((prev) => [...prev, sector]);
      setShowAddSectorModal(false);
      setNewSector({
        name: '',
        description: '',
      });
    }
  };

  const cancelAddSector = () => {
    setShowAddSectorModal(false);
    setNewSector({
      name: '',
      description: '',
    });
  };

  const handleUpdateSector = () => {
    if (sectorToEdit && editSector.name && editSector.description) {
      setSectors((prev) =>
        prev.map((s) =>
          s._id === sectorToEdit
            ? { ...s, name: editSector.name, description: editSector.description }
            : s
        )
      );
      setShowEditSectorModal(false);
      setSectorToEdit(null);
      setEditSector({
        name: '',
        description: '',
      });
    }
  };

  const cancelEditSector = () => {
    setShowEditSectorModal(false);
    setSectorToEdit(null);
    setEditSector({
      name: '',
      description: '',
    });
  };

  // Filter and paginate roles
  const filteredRoles = useMemo(() => {
    return roles.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(rolesSearchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(rolesSearchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [roles, rolesSearchQuery]);

  const rolesTotalPages = Math.ceil(filteredRoles.length / rolesItemsPerPage);
  const rolesStartIndex = (rolesCurrentPage - 1) * rolesItemsPerPage;
  const paginatedRoles = filteredRoles.slice(rolesStartIndex, rolesStartIndex + rolesItemsPerPage);

  const renderRolesPageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (rolesTotalPages <= 10) {
      for (let i = 1; i <= rolesTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (rolesCurrentPage > 3) pages.push('...');
      for (
        let i = Math.max(2, rolesCurrentPage - 1);
        i <= Math.min(rolesTotalPages - 1, rolesCurrentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (rolesCurrentPage < rolesTotalPages - 2) pages.push('...');
      pages.push(rolesTotalPages);
    }
    return pages;
  }, [rolesCurrentPage, rolesTotalPages]);

  // Filter and paginate departments
  const filteredDepartments = useMemo(() => {
    return departments.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(departmentsSearchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(departmentsSearchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [departments, departmentsSearchQuery]);

  const departmentsTotalPages = Math.ceil(filteredDepartments.length / departmentsItemsPerPage);
  const departmentsStartIndex = (departmentsCurrentPage - 1) * departmentsItemsPerPage;
  const paginatedDepartments = filteredDepartments.slice(departmentsStartIndex, departmentsStartIndex + departmentsItemsPerPage);

  const renderDepartmentsPageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (departmentsTotalPages <= 10) {
      for (let i = 1; i <= departmentsTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (departmentsCurrentPage > 3) pages.push('...');
      for (
        let i = Math.max(2, departmentsCurrentPage - 1);
        i <= Math.min(departmentsTotalPages - 1, departmentsCurrentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (departmentsCurrentPage < departmentsTotalPages - 2) pages.push('...');
      pages.push(departmentsTotalPages);
    }
    return pages;
  }, [departmentsCurrentPage, departmentsTotalPages]);

  // Filter and paginate counterparties
  const filteredCounterparties = useMemo(() => {
    return counterparties.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(counterpartiesSearchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(counterpartiesSearchQuery.toLowerCase()) ||
        item.sector.toLowerCase().includes(counterpartiesSearchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [counterparties, counterpartiesSearchQuery]);

  const counterpartiesTotalPages = Math.ceil(filteredCounterparties.length / counterpartiesItemsPerPage);
  const counterpartiesStartIndex = (counterpartiesCurrentPage - 1) * counterpartiesItemsPerPage;
  const paginatedCounterparties = filteredCounterparties.slice(counterpartiesStartIndex, counterpartiesStartIndex + counterpartiesItemsPerPage);

  const renderCounterpartiesPageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (counterpartiesTotalPages <= 10) {
      for (let i = 1; i <= counterpartiesTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (counterpartiesCurrentPage > 3) pages.push('...');
      for (
        let i = Math.max(2, counterpartiesCurrentPage - 1);
        i <= Math.min(counterpartiesTotalPages - 1, counterpartiesCurrentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (counterpartiesCurrentPage < counterpartiesTotalPages - 2) pages.push('...');
      pages.push(counterpartiesTotalPages);
    }
    return pages;
  }, [counterpartiesCurrentPage, counterpartiesTotalPages]);

  // Filter and paginate sectors
  const filteredSectors = useMemo(() => {
    return sectors.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(sectorsSearchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(sectorsSearchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [sectors, sectorsSearchQuery]);

  const sectorsTotalPages = Math.ceil(filteredSectors.length / sectorsItemsPerPage);
  const sectorsStartIndex = (sectorsCurrentPage - 1) * sectorsItemsPerPage;
  const paginatedSectors = filteredSectors.slice(sectorsStartIndex, sectorsStartIndex + sectorsItemsPerPage);

  const renderSectorsPageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (sectorsTotalPages <= 10) {
      for (let i = 1; i <= sectorsTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (sectorsCurrentPage > 3) pages.push('...');
      for (
        let i = Math.max(2, sectorsCurrentPage - 1);
        i <= Math.min(sectorsTotalPages - 1, sectorsCurrentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (sectorsCurrentPage < sectorsTotalPages - 2) pages.push('...');
      pages.push(sectorsTotalPages);
    }
    return pages;
  }, [sectorsCurrentPage, sectorsTotalPages]);

  // Filter and paginate activity logs
  const filteredActivityLogs = useMemo(() => {
    return activityLogs.filter((item) => {
      const matchesSearch =
        item.fullName.toLowerCase().includes(activityLogsSearchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(activityLogsSearchQuery.toLowerCase()) ||
        item.action.toLowerCase().includes(activityLogsSearchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [activityLogs, activityLogsSearchQuery]);

  const activityLogsTotalPages = Math.ceil(filteredActivityLogs.length / activityLogsItemsPerPage);
  const activityLogsStartIndex = (activityLogsCurrentPage - 1) * activityLogsItemsPerPage;
  const paginatedActivityLogs = filteredActivityLogs.slice(activityLogsStartIndex, activityLogsStartIndex + activityLogsItemsPerPage);

  const renderActivityLogsPageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (activityLogsTotalPages <= 10) {
      for (let i = 1; i <= activityLogsTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (activityLogsCurrentPage > 3) pages.push('...');
      for (
        let i = Math.max(2, activityLogsCurrentPage - 1);
        i <= Math.min(activityLogsTotalPages - 1, activityLogsCurrentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (activityLogsCurrentPage < activityLogsTotalPages - 2) pages.push('...');
      pages.push(activityLogsTotalPages);
    }
    return pages;
  }, [activityLogsCurrentPage, activityLogsTotalPages]);

  return (
    <AdminLayout>
      <Box px={{ base: 4, md: 6 }} py={6}>
        {/* Header */}
        <HStack justify="space-between" mb={6}>
          <Text fontSize="24px" fontWeight="600" color="#2C3E50">
            Settings
          </Text>

          {activeTab === 'Employees' && (
            <Button
              bg="#1B3242"
              color="white"
              fontSize="14px"
              fontWeight="500"
              px={6}
              h="40px"
              borderRadius="8px"
              _hover={{ bg: '#0F1F2D' }}
              onClick={() => setShowAddModal(true)}
            >
              Add Employee
            </Button>
          )}

          {activeTab === 'Roles' && (
            <Button
              bg="#1B3242"
              color="white"
              fontSize="14px"
              fontWeight="500"
              px={6}
              h="40px"
              borderRadius="8px"
              _hover={{ bg: '#0F1F2D' }}
              onClick={() => setShowAddRoleModal(true)}
            >
              Add Role
            </Button>
          )}

          {activeTab === 'Departments' && (
            <Button
              bg="#1B3242"
              color="white"
              fontSize="14px"
              fontWeight="500"
              px={6}
              h="40px"
              borderRadius="8px"
              _hover={{ bg: '#0F1F2D' }}
              onClick={() => setShowAddDepartmentModal(true)}
            >
              Add Department
            </Button>
          )}

          {activeTab === 'Counterparties' && (
            <Button
              bg="#1B3242"
              color="white"
              fontSize="14px"
              fontWeight="500"
              px={6}
              h="40px"
              borderRadius="8px"
              _hover={{ bg: '#0F1F2D' }}
              onClick={() => setShowAddCounterpartyModal(true)}
            >
              Add Counterparty
            </Button>
          )}

          {activeTab === 'Sectors' && (
            <Button
              bg="#1B3242"
              color="white"
              fontSize="14px"
              fontWeight="500"
              px={6}
              h="40px"
              borderRadius="8px"
              _hover={{ bg: '#0F1F2D' }}
              onClick={() => setShowAddSectorModal(true)}
            >
              Add Sector
            </Button>
          )}
        </HStack>

        {/* Tabs */}
        <HStack gap={0} mb={6} borderBottom="1px solid #E6E7EC" overflowX="auto">
          {tabs.map((tab) => (
            <Box
              key={tab}
              px={6}
              py={3}
              cursor="pointer"
              borderBottom="2px solid"
              borderColor={activeTab === tab ? '#227CBF' : 'transparent'}
              color={activeTab === tab ? '#227CBF' : '#666'}
              fontSize="14px"
              fontWeight={activeTab === tab ? '600' : '400'}
              onClick={() => setActiveTab(tab)}
              _hover={{ color: '#227CBF' }}
              transition="all 0.2s"
              whiteSpace="nowrap"
            >
              {tab}
            </Box>
          ))}
        </HStack>

        {/* Content based on active tab */}
        {activeTab === 'Employees' && (
          <Box bg="white" borderRadius="12px" p={6}>
            {/* Filters */}
            <HStack gap={3} mb={6} flexWrap="wrap" align="center">
              {/* Department Filter */}
              <Box minW="140px" maxW="180px">
                <ChakraSelect.Root
                  collection={departmentCollection}
                  size="sm"
                  value={[selectedDepartment]}
                  onValueChange={(e) => setSelectedDepartment(e.value[0])}
                >
                  <ChakraSelect.Trigger
                    bg="white"
                    borderColor="#D1D5DB"
                    _hover={{ borderColor: '#9CA3AF' }}
                    borderRadius="6px"
                    height="40px"
                  >
                    <ChakraSelect.ValueText placeholder="Department" />
                    <ChakraSelect.Indicator />
                  </ChakraSelect.Trigger>
                  <ChakraSelect.Content
                    bg="white"
                    borderRadius="8px"
                    boxShadow="lg"
                    zIndex={1500}
                    position="absolute"
                  >
                    {departmentOptions.map((option) => (
                      <ChakraSelect.Item key={option.value} item={option}>
                        {option.label}
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Root>
              </Box>

              {/* Role Filter */}
              <Box minW="140px" maxW="180px">
                <ChakraSelect.Root
                  collection={roleCollection}
                  size="sm"
                  value={[selectedRole]}
                  onValueChange={(e) => setSelectedRole(e.value[0])}
                >
                  <ChakraSelect.Trigger
                    bg="white"
                    borderColor="#D1D5DB"
                    _hover={{ borderColor: '#9CA3AF' }}
                    borderRadius="6px"
                    height="40px"
                  >
                    <ChakraSelect.ValueText placeholder="Role" />
                    <ChakraSelect.Indicator />
                  </ChakraSelect.Trigger>
                  <ChakraSelect.Content
                    bg="white"
                    borderRadius="8px"
                    boxShadow="lg"
                    zIndex={1500}
                    position="absolute"
                  >
                    {roleOptions.map((option) => (
                      <ChakraSelect.Item key={option.value} item={option}>
                        {option.label}
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Root>
              </Box>

              {/* Status Filter */}
              <Box minW="140px" maxW="180px">
                <ChakraSelect.Root
                  collection={statusCollection}
                  size="sm"
                  value={[selectedStatus]}
                  onValueChange={(e) => setSelectedStatus(e.value[0])}
                >
                  <ChakraSelect.Trigger
                    bg="white"
                    borderColor="#D1D5DB"
                    _hover={{ borderColor: '#9CA3AF' }}
                    borderRadius="6px"
                    height="40px"
                  >
                    <ChakraSelect.ValueText placeholder="Status" />
                    <ChakraSelect.Indicator />
                  </ChakraSelect.Trigger>
                  <ChakraSelect.Content
                    bg="white"
                    borderRadius="8px"
                    boxShadow="lg"
                    zIndex={1500}
                    position="absolute"
                  >
                    {statusOptions.map((option) => (
                      <ChakraSelect.Item key={option.value} item={option}>
                        {option.label}
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Root>
              </Box>

              {/* Search */}
              <Box minW="200px" flex="1" maxW="400px">
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="sm"
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="40px"
                />
              </Box>
            </HStack>

            {/* Table */}
            <Box overflowX="auto">
              {/* Table Header */}
              <Box
                bg="#E2EEFE"
                borderRadius="8px"
                px={4}
                py={3}
                mb={2}
                display={{ base: 'none', md: 'block' }}
              >
                <HStack>
                  <Box flex="1">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      First Name
                    </Text>
                  </Box>
                  <Box flex="1">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Last Name
                    </Text>
                  </Box>
                  <Box flex="1.5">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Email Address
                    </Text>
                  </Box>
                  <Box flex="1">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Department
                    </Text>
                  </Box>
                  <Box flex="1">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Role
                    </Text>
                  </Box>
                  <Box w="100px" textAlign="center">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Status
                    </Text>
                  </Box>
                  <Box w="100px" textAlign="center">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Actions
                    </Text>
                  </Box>
                </HStack>
              </Box>

              {/* Table Body - Desktop */}
              <VStack gap={2} display={{ base: 'none', md: 'flex' }}>
                {paginatedData.map((item, index) => (
                  <Box
                    key={item._id}
                    bg={index % 2 === 0 ? 'white' : '#F9FAFB'}
                    borderRadius="8px"
                    px={4}
                    py={3}
                    w="100%"
                    _hover={{ bg: '#F5F7FA' }}
                    transition="background 0.2s"
                  >
                    <HStack>
                      <Box flex="1">
                        <Text fontSize="13px" color="#333">
                          {item.firstName}
                        </Text>
                      </Box>
                      <Box flex="1">
                        <Text fontSize="13px" color="#333">
                          {item.lastName}
                        </Text>
                      </Box>
                      <Box flex="1.5">
                        <Text fontSize="13px" color="#333">
                          {item.email}
                        </Text>
                      </Box>
                      <Box flex="1">
                        <Text fontSize="13px" color="#333">
                          {item.department}
                        </Text>
                      </Box>
                      <Box flex="1">
                        <Text fontSize="13px" color="#333">
                          {item.role}
                        </Text>
                      </Box>
                      <Box w="100px" display="flex" justifyContent="center">
                        <Box
                          as="button"
                          w="40px"
                          h="22px"
                          borderRadius="11px"
                          bg={item.isActive ? '#47B65C' : '#D1D5DB'}
                          position="relative"
                          transition="background 0.2s"
                          onClick={() => handleToggleStatus(item._id)}
                          cursor="pointer"
                        >
                          <Box
                            w="18px"
                            h="18px"
                            borderRadius="50%"
                            bg="white"
                            position="absolute"
                            top="2px"
                            left={item.isActive ? '20px' : '2px'}
                            transition="left 0.2s"
                          />
                        </Box>
                      </Box>
                      <Box w="100px">
                        <HStack gap={2} justify="center">
                          <Box
                            as="button"
                            cursor="pointer"
                            onClick={() => handleEdit(item._id)}
                            _hover={{ opacity: 0.7 }}
                            transition="opacity 0.2s"
                          >
                            <Image src="/edit-icon.png" alt="Edit" w="16px" h="16px" style={{ imageRendering: 'crisp-edges' }} />
                          </Box>
                          <Box
                            as="button"
                            cursor="pointer"
                            onClick={() => handleDelete(item._id)}
                            _hover={{ opacity: 0.7 }}
                            transition="opacity 0.2s"
                          >
                            <Image src="/delete-icon.png" alt="Delete" w="16px" h="16px" style={{ imageRendering: 'crisp-edges' }} />
                          </Box>
                        </HStack>
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </VStack>

              {/* Table Body - Mobile Cards */}
              <VStack gap={3} display={{ base: 'flex', md: 'none' }}>
                {paginatedData.map((item) => (
                  <Box
                    key={item._id}
                    bg="white"
                    borderRadius="8px"
                    p={4}
                    w="100%"
                    boxShadow="sm"
                  >
                    <VStack align="stretch" gap={2}>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          First Name:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.firstName}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Last Name:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.lastName}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Email:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.email}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Department:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.department}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Role:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.role}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Status:
                        </Text>
                        <Box
                          as="button"
                          w="40px"
                          h="22px"
                          borderRadius="11px"
                          bg={item.isActive ? '#47B65C' : '#D1D5DB'}
                          position="relative"
                          transition="background 0.2s"
                          onClick={() => handleToggleStatus(item._id)}
                          cursor="pointer"
                        >
                          <Box
                            w="18px"
                            h="18px"
                            borderRadius="50%"
                            bg="white"
                            position="absolute"
                            top="2px"
                            left={item.isActive ? '20px' : '2px'}
                            transition="left 0.2s"
                          />
                        </Box>
                      </HStack>
                      <HStack justify="flex-end" gap={3} mt={2}>
                        <Box
                          as="button"
                          cursor="pointer"
                          onClick={() => handleEdit(item._id)}
                          _hover={{ opacity: 0.7 }}
                          transition="opacity 0.2s"
                        >
                          <Image src="/edit-icon.png" alt="Edit" w="18px" h="18px" style={{ imageRendering: 'crisp-edges' }} />
                        </Box>
                        <Box
                          as="button"
                          cursor="pointer"
                          onClick={() => handleDelete(item._id)}
                          _hover={{ opacity: 0.7 }}
                          transition="opacity 0.2s"
                        >
                          <Image src="/delete-icon.png" alt="Delete" w="18px" h="18px" style={{ imageRendering: 'crisp-edges' }} />
                        </Box>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Pagination */}
            <HStack justify="space-between" mt={6} flexWrap="wrap" gap={4}>
              {/* Items per page */}
              <HStack gap={2}>
                <Text fontSize="13px" color="#666">
                  Showing
                </Text>
                <ChakraSelect.Root
                  collection={itemsPerPageCollection}
                  size="sm"
                  value={[itemsPerPage.toString()]}
                  onValueChange={(e) => {
                    setItemsPerPage(Number(e.value[0]));
                    setCurrentPage(1);
                  }}
                  width="80px"
                >
                  <ChakraSelect.Trigger
                    bg="white"
                    borderColor="#E6E7EC"
                    borderRadius="6px"
                  >
                    <ChakraSelect.ValueText />
                  </ChakraSelect.Trigger>
                  <ChakraSelect.Content bg="white" borderRadius="8px">
                    {itemsPerPageOptions.map((option) => (
                      <ChakraSelect.Item key={option.value} item={option}>
                        {option.label}
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Root>
                <Text fontSize="13px" color="#666">
                  out of {filteredData.length}
                </Text>
              </HStack>

              {/* Page numbers */}
              <HStack gap={1}>
                {/* Previous button */}
                <Box
                  as="button"
                  w="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="6px"
                  bg="white"
                  border="1px solid #E6E7EC"
                  cursor={currentPage === 1 ? 'not-allowed' : 'pointer'}
                  opacity={currentPage === 1 ? 0.5 : 1}
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  _hover={{
                    bg: currentPage === 1 ? 'white' : '#F5F5F5',
                  }}
                >
                  <Text fontSize="18px">&lt;</Text>
                </Box>

                {/* Page numbers */}
                {renderPageNumbers.map((page, index) => (
                  <Box
                    key={index}
                    as="button"
                    minW="32px"
                    h="32px"
                    px={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="6px"
                    bg={page === currentPage ? '#227CBF' : 'white'}
                    color={page === currentPage ? 'white' : '#333'}
                    border="1px solid"
                    borderColor={page === currentPage ? '#227CBF' : '#E6E7EC'}
                    cursor={page === '...' ? 'default' : 'pointer'}
                    fontSize="13px"
                    fontWeight={page === currentPage ? '600' : '400'}
                    onClick={() =>
                      typeof page === 'number' && setCurrentPage(page)
                    }
                    _hover={{
                      bg: page === '...' ? 'white' : page === currentPage ? '#227CBF' : '#F5F5F5',
                    }}
                  >
                    {page}
                  </Box>
                ))}

                {/* Next button */}
                <Box
                  as="button"
                  w="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="6px"
                  bg="white"
                  border="1px solid #E6E7EC"
                  cursor={currentPage === totalPages ? 'not-allowed' : 'pointer'}
                  opacity={currentPage === totalPages ? 0.5 : 1}
                  onClick={() =>
                    currentPage < totalPages && setCurrentPage(currentPage + 1)
                  }
                  _hover={{
                    bg: currentPage === totalPages ? 'white' : '#F5F5F5',
                  }}
                >
                  <Text fontSize="18px">&gt;</Text>
                </Box>
              </HStack>
            </HStack>
          </Box>
        )}

        {/* Roles Tab */}
        {activeTab === 'Roles' && (
          <Box bg="white" borderRadius="12px" p={6}>
            {/* Search */}
            <HStack gap={3} mb={6} flexWrap="wrap" align="center">
              <Box minW="200px" flex="1" maxW="400px">
                <Input
                  placeholder="Search"
                  value={rolesSearchQuery}
                  onChange={(e) => setRolesSearchQuery(e.target.value)}
                  size="sm"
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="40px"
                />
              </Box>
            </HStack>

            {/* Table */}
            <Box overflowX="auto">
              {/* Table Header */}
              <Box
                bg="#E2EEFE"
                borderRadius="8px"
                px={4}
                py={3}
                mb={2}
                display={{ base: 'none', md: 'block' }}
              >
                <HStack>
                  <Box flex="1">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Role
                    </Text>
                  </Box>
                  <Box flex="2" display="flex" justifyContent="center" pr={20}>
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Role Description
                    </Text>
                  </Box>
                  <Box w="100px" textAlign="center">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Actions
                    </Text>
                  </Box>
                </HStack>
              </Box>

              {/* Table Body - Desktop */}
              <VStack gap={2} display={{ base: 'none', md: 'flex' }}>
                {paginatedRoles.map((item, index) => (
                  <Box
                    key={item._id}
                    bg={index % 2 === 0 ? 'white' : '#F9FAFB'}
                    borderRadius="8px"
                    px={4}
                    py={3}
                    w="100%"
                    _hover={{ bg: '#F5F7FA' }}
                    transition="background 0.2s"
                  >
                    <HStack>
                      <Box flex="1">
                        <Text fontSize="13px" color="#333">
                          {item.name}
                        </Text>
                      </Box>
                      <Box flex="2" display="flex" justifyContent="center" pr={20}>
                        <Text fontSize="13px" color="#333">
                          {item.description}
                        </Text>
                      </Box>
                      <Box w="100px">
                        <HStack gap={2} justify="center">
                          <Box
                            as="button"
                            cursor="pointer"
                            onClick={() => handleEditRole(item._id)}
                            _hover={{ opacity: 0.7 }}
                            transition="opacity 0.2s"
                          >
                            <Image src="/edit-icon.png" alt="Edit" w="16px" h="16px" style={{ imageRendering: 'crisp-edges' }} />
                          </Box>
                          <Box
                            as="button"
                            cursor="pointer"
                            onClick={() => handleDeleteRole(item._id)}
                            _hover={{ opacity: 0.7 }}
                            transition="opacity 0.2s"
                          >
                            <Image src="/delete-icon.png" alt="Delete" w="16px" h="16px" style={{ imageRendering: 'crisp-edges' }} />
                          </Box>
                        </HStack>
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </VStack>

              {/* Table Body - Mobile Cards */}
              <VStack gap={3} display={{ base: 'flex', md: 'none' }}>
                {paginatedRoles.map((item) => (
                  <Box
                    key={item._id}
                    bg="white"
                    borderRadius="8px"
                    p={4}
                    w="100%"
                    boxShadow="sm"
                  >
                    <VStack align="stretch" gap={2}>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Role:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.name}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Description:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.description}
                        </Text>
                      </HStack>
                      <HStack justify="flex-end" gap={3} mt={2}>
                        <Box
                          as="button"
                          cursor="pointer"
                          onClick={() => handleEditRole(item._id)}
                          _hover={{ opacity: 0.7 }}
                          transition="opacity 0.2s"
                        >
                          <Image src="/edit-icon.png" alt="Edit" w="18px" h="18px" style={{ imageRendering: 'crisp-edges' }} />
                        </Box>
                        <Box
                          as="button"
                          cursor="pointer"
                          onClick={() => handleDeleteRole(item._id)}
                          _hover={{ opacity: 0.7 }}
                          transition="opacity 0.2s"
                        >
                          <Image src="/delete-icon.png" alt="Delete" w="18px" h="18px" style={{ imageRendering: 'crisp-edges' }} />
                        </Box>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Pagination */}
            <HStack justify="space-between" mt={6} flexWrap="wrap" gap={4}>
              {/* Items per page */}
              <HStack gap={2}>
                <Text fontSize="13px" color="#666">
                  Showing
                </Text>
                <ChakraSelect.Root
                  collection={itemsPerPageCollection}
                  size="sm"
                  value={[rolesItemsPerPage.toString()]}
                  onValueChange={(e) => {
                    setRolesItemsPerPage(Number(e.value[0]));
                    setRolesCurrentPage(1);
                  }}
                  width="80px"
                >
                  <ChakraSelect.Trigger
                    bg="white"
                    borderColor="#E6E7EC"
                    borderRadius="6px"
                  >
                    <ChakraSelect.ValueText />
                  </ChakraSelect.Trigger>
                  <ChakraSelect.Content bg="white" borderRadius="8px">
                    {itemsPerPageOptions.map((option) => (
                      <ChakraSelect.Item key={option.value} item={option}>
                        {option.label}
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Root>
                <Text fontSize="13px" color="#666">
                  out of {filteredRoles.length}
                </Text>
              </HStack>

              {/* Page numbers */}
              <HStack gap={1}>
                {/* Previous button */}
                <Box
                  as="button"
                  w="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="6px"
                  bg="white"
                  border="1px solid #E6E7EC"
                  cursor={rolesCurrentPage === 1 ? 'not-allowed' : 'pointer'}
                  opacity={rolesCurrentPage === 1 ? 0.5 : 1}
                  onClick={() => rolesCurrentPage > 1 && setRolesCurrentPage(rolesCurrentPage - 1)}
                  _hover={{
                    bg: rolesCurrentPage === 1 ? 'white' : '#F5F5F5',
                  }}
                >
                  <Text fontSize="18px">&lt;</Text>
                </Box>

                {/* Page numbers */}
                {renderRolesPageNumbers.map((page, index) => (
                  <Box
                    key={index}
                    as="button"
                    minW="32px"
                    h="32px"
                    px={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="6px"
                    bg={page === rolesCurrentPage ? '#227CBF' : 'white'}
                    color={page === rolesCurrentPage ? 'white' : '#333'}
                    border="1px solid"
                    borderColor={page === rolesCurrentPage ? '#227CBF' : '#E6E7EC'}
                    cursor={page === '...' ? 'default' : 'pointer'}
                    fontSize="13px"
                    fontWeight={page === rolesCurrentPage ? '600' : '400'}
                    onClick={() =>
                      typeof page === 'number' && setRolesCurrentPage(page)
                    }
                    _hover={{
                      bg: page === '...' ? 'white' : page === rolesCurrentPage ? '#227CBF' : '#F5F5F5',
                    }}
                  >
                    {page}
                  </Box>
                ))}

                {/* Next button */}
                <Box
                  as="button"
                  w="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="6px"
                  bg="white"
                  border="1px solid #E6E7EC"
                  cursor={rolesCurrentPage === rolesTotalPages ? 'not-allowed' : 'pointer'}
                  opacity={rolesCurrentPage === rolesTotalPages ? 0.5 : 1}
                  onClick={() =>
                    rolesCurrentPage < rolesTotalPages && setRolesCurrentPage(rolesCurrentPage + 1)
                  }
                  _hover={{
                    bg: rolesCurrentPage === rolesTotalPages ? 'white' : '#F5F5F5',
                  }}
                >
                  <Text fontSize="18px">&gt;</Text>
                </Box>
              </HStack>
            </HStack>
          </Box>
        )}

        {/* Departments Tab */}
        {activeTab === 'Departments' && (
          <Box bg="white" borderRadius="12px" p={6}>
            {/* Search */}
            <HStack gap={3} mb={6} flexWrap="wrap" align="center">
              <Box minW="200px" flex="1" maxW="400px">
                <Input
                  placeholder="Search"
                  value={departmentsSearchQuery}
                  onChange={(e) => setDepartmentsSearchQuery(e.target.value)}
                  size="sm"
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="40px"
                />
              </Box>
            </HStack>

            {/* Table */}
            <Box overflowX="auto">
              {/* Table Header */}
              <Box
                bg="#E2EEFE"
                borderRadius="8px"
                px={4}
                py={3}
                mb={2}
                display={{ base: 'none', md: 'block' }}
              >
                <HStack>
                  <Box flex="1">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Department
                    </Text>
                  </Box>
                  <Box flex="2" display="flex" justifyContent="center" pr={20}>
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Department Description
                    </Text>
                  </Box>
                  <Box w="100px" textAlign="center">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Actions
                    </Text>
                  </Box>
                </HStack>
              </Box>

              {/* Table Body - Desktop */}
              <VStack gap={2} display={{ base: 'none', md: 'flex' }}>
                {paginatedDepartments.map((item, index) => (
                  <Box
                    key={item._id}
                    bg={index % 2 === 0 ? 'white' : '#F9FAFB'}
                    borderRadius="8px"
                    px={4}
                    py={3}
                    w="100%"
                    _hover={{ bg: '#F5F7FA' }}
                    transition="background 0.2s"
                  >
                    <HStack>
                      <Box flex="1">
                        <Text fontSize="13px" color="#333">
                          {item.name}
                        </Text>
                      </Box>
                      <Box flex="2" display="flex" justifyContent="center" pr={20}>
                        <Text fontSize="13px" color="#333">
                          {item.description}
                        </Text>
                      </Box>
                      <Box w="100px">
                        <HStack gap={2} justify="center">
                          <Box
                            as="button"
                            cursor="pointer"
                            onClick={() => handleEditDepartment(item._id)}
                            _hover={{ opacity: 0.7 }}
                            transition="opacity 0.2s"
                          >
                            <Image src="/edit-icon.png" alt="Edit" w="16px" h="16px" style={{ imageRendering: 'crisp-edges' }} />
                          </Box>
                          <Box
                            as="button"
                            cursor="pointer"
                            onClick={() => handleDeleteDepartment(item._id)}
                            _hover={{ opacity: 0.7 }}
                            transition="opacity 0.2s"
                          >
                            <Image src="/delete-icon.png" alt="Delete" w="16px" h="16px" style={{ imageRendering: 'crisp-edges' }} />
                          </Box>
                        </HStack>
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </VStack>

              {/* Table Body - Mobile Cards */}
              <VStack gap={3} display={{ base: 'flex', md: 'none' }}>
                {paginatedDepartments.map((item) => (
                  <Box
                    key={item._id}
                    bg="white"
                    borderRadius="8px"
                    p={4}
                    w="100%"
                    boxShadow="sm"
                  >
                    <VStack align="stretch" gap={2}>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Department:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.name}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Description:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.description}
                        </Text>
                      </HStack>
                      <HStack justify="flex-end" gap={3} mt={2}>
                        <Box
                          as="button"
                          cursor="pointer"
                          onClick={() => handleEditDepartment(item._id)}
                          _hover={{ opacity: 0.7 }}
                          transition="opacity 0.2s"
                        >
                          <Image src="/edit-icon.png" alt="Edit" w="18px" h="18px" style={{ imageRendering: 'crisp-edges' }} />
                        </Box>
                        <Box
                          as="button"
                          cursor="pointer"
                          onClick={() => handleDeleteDepartment(item._id)}
                          _hover={{ opacity: 0.7 }}
                          transition="opacity 0.2s"
                        >
                          <Image src="/delete-icon.png" alt="Delete" w="18px" h="18px" style={{ imageRendering: 'crisp-edges' }} />
                        </Box>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Pagination */}
            <HStack justify="space-between" mt={6} flexWrap="wrap" gap={4}>
              {/* Items per page */}
              <HStack gap={2}>
                <Text fontSize="13px" color="#666">
                  Showing
                </Text>
                <ChakraSelect.Root
                  collection={itemsPerPageCollection}
                  size="sm"
                  value={[departmentsItemsPerPage.toString()]}
                  onValueChange={(e) => {
                    setDepartmentsItemsPerPage(Number(e.value[0]));
                    setDepartmentsCurrentPage(1);
                  }}
                  width="80px"
                >
                  <ChakraSelect.Trigger
                    bg="white"
                    borderColor="#E6E7EC"
                    borderRadius="6px"
                  >
                    <ChakraSelect.ValueText />
                  </ChakraSelect.Trigger>
                  <ChakraSelect.Content bg="white" borderRadius="8px">
                    {itemsPerPageOptions.map((option) => (
                      <ChakraSelect.Item key={option.value} item={option}>
                        {option.label}
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Root>
                <Text fontSize="13px" color="#666">
                  out of {filteredDepartments.length}
                </Text>
              </HStack>

              {/* Page numbers */}
              <HStack gap={1}>
                {/* Previous button */}
                <Box
                  as="button"
                  w="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="6px"
                  bg="white"
                  border="1px solid #E6E7EC"
                  cursor={departmentsCurrentPage === 1 ? 'not-allowed' : 'pointer'}
                  opacity={departmentsCurrentPage === 1 ? 0.5 : 1}
                  onClick={() => departmentsCurrentPage > 1 && setDepartmentsCurrentPage(departmentsCurrentPage - 1)}
                  _hover={{
                    bg: departmentsCurrentPage === 1 ? 'white' : '#F5F5F5',
                  }}
                >
                  <Text fontSize="18px">&lt;</Text>
                </Box>

                {/* Page numbers */}
                {renderDepartmentsPageNumbers.map((page, index) => (
                  <Box
                    key={index}
                    as="button"
                    minW="32px"
                    h="32px"
                    px={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="6px"
                    bg={page === departmentsCurrentPage ? '#227CBF' : 'white'}
                    color={page === departmentsCurrentPage ? 'white' : '#333'}
                    border="1px solid"
                    borderColor={page === departmentsCurrentPage ? '#227CBF' : '#E6E7EC'}
                    cursor={page === '...' ? 'default' : 'pointer'}
                    fontSize="13px"
                    fontWeight={page === departmentsCurrentPage ? '600' : '400'}
                    onClick={() =>
                      typeof page === 'number' && setDepartmentsCurrentPage(page)
                    }
                    _hover={{
                      bg: page === '...' ? 'white' : page === departmentsCurrentPage ? '#227CBF' : '#F5F5F5',
                    }}
                  >
                    {page}
                  </Box>
                ))}

                {/* Next button */}
                <Box
                  as="button"
                  w="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="6px"
                  bg="white"
                  border="1px solid #E6E7EC"
                  cursor={departmentsCurrentPage === departmentsTotalPages ? 'not-allowed' : 'pointer'}
                  opacity={departmentsCurrentPage === departmentsTotalPages ? 0.5 : 1}
                  onClick={() =>
                    departmentsCurrentPage < departmentsTotalPages && setDepartmentsCurrentPage(departmentsCurrentPage + 1)
                  }
                  _hover={{
                    bg: departmentsCurrentPage === departmentsTotalPages ? 'white' : '#F5F5F5',
                  }}
                >
                  <Text fontSize="18px">&gt;</Text>
                </Box>
              </HStack>
            </HStack>
          </Box>
        )}

        {/* Counterparties Tab */}
        {activeTab === 'Counterparties' && (
          <Box bg="white" borderRadius="12px" p={6}>
            {/* Search */}
            <HStack gap={3} mb={6} flexWrap="wrap" align="center">
              <Box minW="200px" flex="1" maxW="400px">
                <Input
                  placeholder="Search"
                  value={counterpartiesSearchQuery}
                  onChange={(e) => setCounterpartiesSearchQuery(e.target.value)}
                  size="sm"
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="40px"
                />
              </Box>
            </HStack>

            {/* Table */}
            <Box overflowX="auto">
              {/* Table Header */}
              <Box
                bg="#E2EEFE"
                borderRadius="8px"
                px={4}
                py={3}
                mb={2}
                display={{ base: 'none', md: 'block' }}
              >
                <HStack>
                  <Box flex="1">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Counterparty
                    </Text>
                  </Box>
                  <Box flex="2" display="flex" justifyContent="center">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Counterparty Description
                    </Text>
                  </Box>
                  <Box flex="1" display="flex" justifyContent="center">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Sector
                    </Text>
                  </Box>
                  <Box w="100px" textAlign="center">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Actions
                    </Text>
                  </Box>
                </HStack>
              </Box>

              {/* Table Body - Desktop */}
              <VStack gap={2} display={{ base: 'none', md: 'flex' }}>
                {paginatedCounterparties.map((item, index) => (
                  <Box
                    key={item._id}
                    bg={index % 2 === 0 ? 'white' : '#F9FAFB'}
                    borderRadius="8px"
                    px={4}
                    py={3}
                    w="100%"
                    _hover={{ bg: '#F5F7FA' }}
                    transition="background 0.2s"
                  >
                    <HStack>
                      <Box flex="1">
                        <Text fontSize="13px" color="#333">
                          {item.name}
                        </Text>
                      </Box>
                      <Box flex="2" display="flex" justifyContent="center">
                        <Text fontSize="13px" color="#333">
                          {item.description}
                        </Text>
                      </Box>
                      <Box flex="1" display="flex" justifyContent="center">
                        <Text fontSize="13px" color="#333">
                          {item.sector}
                        </Text>
                      </Box>
                      <Box w="100px">
                        <HStack gap={2} justify="center">
                          <Box
                            as="button"
                            cursor="pointer"
                            onClick={() => handleEditCounterparty(item._id)}
                            _hover={{ opacity: 0.7 }}
                            transition="opacity 0.2s"
                          >
                            <Image src="/edit-icon.png" alt="Edit" w="16px" h="16px" style={{ imageRendering: 'crisp-edges' }} />
                          </Box>
                          <Box
                            as="button"
                            cursor="pointer"
                            onClick={() => handleDeleteCounterparty(item._id)}
                            _hover={{ opacity: 0.7 }}
                            transition="opacity 0.2s"
                          >
                            <Image src="/delete-icon.png" alt="Delete" w="16px" h="16px" style={{ imageRendering: 'crisp-edges' }} />
                          </Box>
                        </HStack>
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </VStack>

              {/* Table Body - Mobile Cards */}
              <VStack gap={3} display={{ base: 'flex', md: 'none' }}>
                {paginatedCounterparties.map((item) => (
                  <Box
                    key={item._id}
                    bg="white"
                    borderRadius="8px"
                    p={4}
                    w="100%"
                    boxShadow="sm"
                  >
                    <VStack align="stretch" gap={2}>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Counterparty:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.name}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Description:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.description}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Sector:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.sector}
                        </Text>
                      </HStack>
                      <HStack justify="flex-end" gap={3} mt={2}>
                        <Box
                          as="button"
                          cursor="pointer"
                          onClick={() => handleEditCounterparty(item._id)}
                          _hover={{ opacity: 0.7 }}
                          transition="opacity 0.2s"
                        >
                          <Image src="/edit-icon.png" alt="Edit" w="18px" h="18px" style={{ imageRendering: 'crisp-edges' }} />
                        </Box>
                        <Box
                          as="button"
                          cursor="pointer"
                          onClick={() => handleDeleteCounterparty(item._id)}
                          _hover={{ opacity: 0.7 }}
                          transition="opacity 0.2s"
                        >
                          <Image src="/delete-icon.png" alt="Delete" w="18px" h="18px" style={{ imageRendering: 'crisp-edges' }} />
                        </Box>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Pagination */}
            <HStack justify="space-between" mt={6} flexWrap="wrap" gap={4}>
              {/* Items per page */}
              <HStack gap={2}>
                <Text fontSize="13px" color="#666">
                  Showing
                </Text>
                <ChakraSelect.Root
                  collection={itemsPerPageCollection}
                  size="sm"
                  value={[counterpartiesItemsPerPage.toString()]}
                  onValueChange={(e) => {
                    setCounterpartiesItemsPerPage(Number(e.value[0]));
                    setCounterpartiesCurrentPage(1);
                  }}
                  width="80px"
                >
                  <ChakraSelect.Trigger
                    bg="white"
                    borderColor="#E6E7EC"
                    borderRadius="6px"
                  >
                    <ChakraSelect.ValueText />
                  </ChakraSelect.Trigger>
                  <ChakraSelect.Content bg="white" borderRadius="8px">
                    {itemsPerPageOptions.map((option) => (
                      <ChakraSelect.Item key={option.value} item={option}>
                        {option.label}
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Root>
                <Text fontSize="13px" color="#666">
                  out of {filteredCounterparties.length}
                </Text>
              </HStack>

              {/* Page numbers */}
              <HStack gap={1}>
                {/* Previous button */}
                <Box
                  as="button"
                  w="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="6px"
                  bg="white"
                  border="1px solid #E6E7EC"
                  cursor={counterpartiesCurrentPage === 1 ? 'not-allowed' : 'pointer'}
                  opacity={counterpartiesCurrentPage === 1 ? 0.5 : 1}
                  onClick={() => counterpartiesCurrentPage > 1 && setCounterpartiesCurrentPage(counterpartiesCurrentPage - 1)}
                  _hover={{
                    bg: counterpartiesCurrentPage === 1 ? 'white' : '#F5F5F5',
                  }}
                >
                  <Text fontSize="18px">&lt;</Text>
                </Box>

                {/* Page numbers */}
                {renderCounterpartiesPageNumbers.map((page, index) => (
                  <Box
                    key={index}
                    as="button"
                    minW="32px"
                    h="32px"
                    px={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="6px"
                    bg={page === counterpartiesCurrentPage ? '#227CBF' : 'white'}
                    color={page === counterpartiesCurrentPage ? 'white' : '#333'}
                    border="1px solid"
                    borderColor={page === counterpartiesCurrentPage ? '#227CBF' : '#E6E7EC'}
                    cursor={page === '...' ? 'default' : 'pointer'}
                    fontSize="13px"
                    fontWeight={page === counterpartiesCurrentPage ? '600' : '400'}
                    onClick={() =>
                      typeof page === 'number' && setCounterpartiesCurrentPage(page)
                    }
                    _hover={{
                      bg: page === '...' ? 'white' : page === counterpartiesCurrentPage ? '#227CBF' : '#F5F5F5',
                    }}
                  >
                    {page}
                  </Box>
                ))}

                {/* Next button */}
                <Box
                  as="button"
                  w="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="6px"
                  bg="white"
                  border="1px solid #E6E7EC"
                  cursor={counterpartiesCurrentPage === counterpartiesTotalPages ? 'not-allowed' : 'pointer'}
                  opacity={counterpartiesCurrentPage === counterpartiesTotalPages ? 0.5 : 1}
                  onClick={() =>
                    counterpartiesCurrentPage < counterpartiesTotalPages && setCounterpartiesCurrentPage(counterpartiesCurrentPage + 1)
                  }
                  _hover={{
                    bg: counterpartiesCurrentPage === counterpartiesTotalPages ? 'white' : '#F5F5F5',
                  }}
                >
                  <Text fontSize="18px">&gt;</Text>
                </Box>
              </HStack>
            </HStack>
          </Box>
        )}

        {/* Sectors Tab */}
        {activeTab === 'Sectors' && (
          <Box bg="white" borderRadius="12px" p={6}>
            {/* Search */}
            <HStack gap={3} mb={6} flexWrap="wrap" align="center">
              <Box minW="200px" flex="1" maxW="400px">
                <Input
                  placeholder="Search"
                  value={sectorsSearchQuery}
                  onChange={(e) => setSectorsSearchQuery(e.target.value)}
                  size="sm"
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="40px"
                />
              </Box>
            </HStack>

            {/* Table */}
            <Box overflowX="auto">
              {/* Table Header */}
              <Box
                bg="#E2EEFE"
                borderRadius="8px"
                px={4}
                py={3}
                mb={2}
                display={{ base: 'none', md: 'block' }}
              >
                <HStack>
                  <Box flex="1">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Sector
                    </Text>
                  </Box>
                  <Box flex="2" display="flex" justifyContent="center" pr={20}>
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Sector Description
                    </Text>
                  </Box>
                  <Box w="100px" textAlign="center">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Actions
                    </Text>
                  </Box>
                </HStack>
              </Box>

              {/* Table Body - Desktop */}
              <VStack gap={2} display={{ base: 'none', md: 'flex' }}>
                {paginatedSectors.map((item, index) => (
                  <Box
                    key={item._id}
                    bg={index % 2 === 0 ? 'white' : '#F9FAFB'}
                    borderRadius="8px"
                    px={4}
                    py={3}
                    w="100%"
                    _hover={{ bg: '#F5F7FA' }}
                    transition="background 0.2s"
                  >
                    <HStack>
                      <Box flex="1">
                        <Text fontSize="13px" color="#333">
                          {item.name}
                        </Text>
                      </Box>
                      <Box flex="2" display="flex" justifyContent="center" pr={20}>
                        <Text fontSize="13px" color="#333">
                          {item.description}
                        </Text>
                      </Box>
                      <Box w="100px">
                        <HStack gap={2} justify="center">
                          <Box
                            as="button"
                            cursor="pointer"
                            onClick={() => handleEditSector(item._id)}
                            _hover={{ opacity: 0.7 }}
                            transition="opacity 0.2s"
                          >
                            <Image src="/edit-icon.png" alt="Edit" w="16px" h="16px" style={{ imageRendering: 'crisp-edges' }} />
                          </Box>
                          <Box
                            as="button"
                            cursor="pointer"
                            onClick={() => handleDeleteSector(item._id)}
                            _hover={{ opacity: 0.7 }}
                            transition="opacity 0.2s"
                          >
                            <Image src="/delete-icon.png" alt="Delete" w="16px" h="16px" style={{ imageRendering: 'crisp-edges' }} />
                          </Box>
                        </HStack>
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </VStack>

              {/* Table Body - Mobile Cards */}
              <VStack gap={3} display={{ base: 'flex', md: 'none' }}>
                {paginatedSectors.map((item) => (
                  <Box
                    key={item._id}
                    bg="white"
                    borderRadius="8px"
                    p={4}
                    w="100%"
                    boxShadow="sm"
                  >
                    <VStack align="stretch" gap={2}>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Sector:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.name}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Description:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.description}
                        </Text>
                      </HStack>
                      <HStack justify="flex-end" gap={3} mt={2}>
                        <Box
                          as="button"
                          cursor="pointer"
                          onClick={() => handleEditSector(item._id)}
                          _hover={{ opacity: 0.7 }}
                          transition="opacity 0.2s"
                        >
                          <Image src="/edit-icon.png" alt="Edit" w="18px" h="18px" style={{ imageRendering: 'crisp-edges' }} />
                        </Box>
                        <Box
                          as="button"
                          cursor="pointer"
                          onClick={() => handleDeleteSector(item._id)}
                          _hover={{ opacity: 0.7 }}
                          transition="opacity 0.2s"
                        >
                          <Image src="/delete-icon.png" alt="Delete" w="18px" h="18px" style={{ imageRendering: 'crisp-edges' }} />
                        </Box>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Pagination */}
            <HStack justify="space-between" mt={6} flexWrap="wrap" gap={4}>
              {/* Items per page */}
              <HStack gap={2}>
                <Text fontSize="13px" color="#666">
                  Showing
                </Text>
                <ChakraSelect.Root
                  collection={itemsPerPageCollection}
                  size="sm"
                  value={[sectorsItemsPerPage.toString()]}
                  onValueChange={(e) => {
                    setSectorsItemsPerPage(Number(e.value[0]));
                    setSectorsCurrentPage(1);
                  }}
                  width="80px"
                >
                  <ChakraSelect.Trigger
                    bg="white"
                    borderColor="#E6E7EC"
                    borderRadius="6px"
                  >
                    <ChakraSelect.ValueText />
                  </ChakraSelect.Trigger>
                  <ChakraSelect.Content bg="white" borderRadius="8px">
                    {itemsPerPageOptions.map((option) => (
                      <ChakraSelect.Item key={option.value} item={option}>
                        {option.label}
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Root>
                <Text fontSize="13px" color="#666">
                  out of {filteredSectors.length}
                </Text>
              </HStack>

              {/* Page numbers */}
              <HStack gap={1}>
                {/* Previous button */}
                <Box
                  as="button"
                  w="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="6px"
                  bg="white"
                  border="1px solid #E6E7EC"
                  cursor={sectorsCurrentPage === 1 ? 'not-allowed' : 'pointer'}
                  opacity={sectorsCurrentPage === 1 ? 0.5 : 1}
                  onClick={() => sectorsCurrentPage > 1 && setSectorsCurrentPage(sectorsCurrentPage - 1)}
                  _hover={{
                    bg: sectorsCurrentPage === 1 ? 'white' : '#F5F5F5',
                  }}
                >
                  <Text fontSize="18px">&lt;</Text>
                </Box>

                {/* Page numbers */}
                {renderSectorsPageNumbers.map((page, index) => (
                  <Box
                    key={index}
                    as="button"
                    minW="32px"
                    h="32px"
                    px={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="6px"
                    bg={page === sectorsCurrentPage ? '#227CBF' : 'white'}
                    color={page === sectorsCurrentPage ? 'white' : '#333'}
                    border="1px solid"
                    borderColor={page === sectorsCurrentPage ? '#227CBF' : '#E6E7EC'}
                    cursor={page === '...' ? 'default' : 'pointer'}
                    fontSize="13px"
                    fontWeight={page === sectorsCurrentPage ? '600' : '400'}
                    onClick={() =>
                      typeof page === 'number' && setSectorsCurrentPage(page)
                    }
                    _hover={{
                      bg: page === '...' ? 'white' : page === sectorsCurrentPage ? '#227CBF' : '#F5F5F5',
                    }}
                  >
                    {page}
                  </Box>
                ))}

                {/* Next button */}
                <Box
                  as="button"
                  w="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="6px"
                  bg="white"
                  border="1px solid #E6E7EC"
                  cursor={sectorsCurrentPage === sectorsTotalPages ? 'not-allowed' : 'pointer'}
                  opacity={sectorsCurrentPage === sectorsTotalPages ? 0.5 : 1}
                  onClick={() =>
                    sectorsCurrentPage < sectorsTotalPages && setSectorsCurrentPage(sectorsCurrentPage + 1)
                  }
                  _hover={{
                    bg: sectorsCurrentPage === sectorsTotalPages ? 'white' : '#F5F5F5',
                  }}
                >
                  <Text fontSize="18px">&gt;</Text>
                </Box>
              </HStack>
            </HStack>
          </Box>
        )}

        {/* Activity Log Tab */}
        {activeTab === 'Activity log' && (
          <Box bg="white" borderRadius="12px" p={6}>
            {/* Table */}
            <Box overflowX="auto">
              {/* Table Header */}
              <Box
                bg="#E2EEFE"
                borderRadius="8px"
                px={4}
                py={3}
                mb={2}
                display={{ base: 'none', md: 'block' }}
              >
                <HStack>
                  <Box flex="1">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Full Name
                    </Text>
                  </Box>
                  <Box flex="1">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Email Address
                    </Text>
                  </Box>
                  <Box flex="1">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Date/Time
                    </Text>
                  </Box>
                  <Box flex="2">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Actions
                    </Text>
                  </Box>
                </HStack>
              </Box>

              {/* Table Body - Desktop */}
              <VStack gap={2} display={{ base: 'none', md: 'flex' }}>
                {paginatedActivityLogs.map((item, index) => (
                  <Box
                    key={item._id}
                    bg={index % 2 === 0 ? 'white' : '#F9FAFB'}
                    borderRadius="8px"
                    px={4}
                    py={3}
                    w="100%"
                    _hover={{ bg: '#F5F7FA' }}
                    transition="background 0.2s"
                  >
                    <HStack>
                      <Box flex="1">
                        <Text fontSize="13px" color="#333">
                          {item.fullName}
                        </Text>
                      </Box>
                      <Box flex="1">
                        <Text fontSize="13px" color="#333">
                          {item.email}
                        </Text>
                      </Box>
                      <Box flex="1">
                        <Text fontSize="13px" color="#333">
                          {item.dateTime}
                        </Text>
                      </Box>
                      <Box flex="2">
                        <Text fontSize="13px" color="#333">
                          {item.action}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </VStack>

              {/* Table Body - Mobile Cards */}
              <VStack gap={3} display={{ base: 'flex', md: 'none' }}>
                {paginatedActivityLogs.map((item) => (
                  <Box
                    key={item._id}
                    bg="white"
                    borderRadius="8px"
                    p={4}
                    w="100%"
                    boxShadow="sm"
                  >
                    <VStack align="stretch" gap={2}>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Full Name:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.fullName}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Email:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.email}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Date/Time:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.dateTime}
                        </Text>
                      </HStack>
                      <Box>
                        <Text fontSize="12px" fontWeight="600" color="#666" mb={1}>
                          Actions:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.action}
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Pagination */}
            <HStack justify="space-between" mt={6} flexWrap="wrap" gap={4}>
              {/* Items per page */}
              <HStack gap={2}>
                <Text fontSize="13px" color="#666">
                  Showing
                </Text>
                <ChakraSelect.Root
                  collection={itemsPerPageCollection}
                  size="sm"
                  value={[activityLogsItemsPerPage.toString()]}
                  onValueChange={(e) => {
                    setActivityLogsItemsPerPage(Number(e.value[0]));
                    setActivityLogsCurrentPage(1);
                  }}
                  width="80px"
                >
                  <ChakraSelect.Trigger
                    bg="white"
                    borderColor="#E6E7EC"
                    borderRadius="6px"
                  >
                    <ChakraSelect.ValueText />
                  </ChakraSelect.Trigger>
                  <ChakraSelect.Content bg="white" borderRadius="8px">
                    {itemsPerPageOptions.map((option) => (
                      <ChakraSelect.Item key={option.value} item={option}>
                        {option.label}
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Root>
                <Text fontSize="13px" color="#666">
                  out of {filteredActivityLogs.length}
                </Text>
              </HStack>

              {/* Page numbers */}
              <HStack gap={1}>
                {/* Previous button */}
                <Box
                  as="button"
                  w="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="6px"
                  bg="white"
                  border="1px solid #E6E7EC"
                  cursor={activityLogsCurrentPage === 1 ? 'not-allowed' : 'pointer'}
                  opacity={activityLogsCurrentPage === 1 ? 0.5 : 1}
                  onClick={() => activityLogsCurrentPage > 1 && setActivityLogsCurrentPage(activityLogsCurrentPage - 1)}
                  _hover={{
                    bg: activityLogsCurrentPage === 1 ? 'white' : '#F5F5F5',
                  }}
                >
                  <Text fontSize="18px">&lt;</Text>
                </Box>

                {/* Page numbers */}
                {renderActivityLogsPageNumbers.map((page, index) => (
                  <Box
                    key={index}
                    as="button"
                    minW="32px"
                    h="32px"
                    px={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="6px"
                    bg={page === activityLogsCurrentPage ? '#227CBF' : 'white'}
                    color={page === activityLogsCurrentPage ? 'white' : '#333'}
                    border="1px solid"
                    borderColor={page === activityLogsCurrentPage ? '#227CBF' : '#E6E7EC'}
                    cursor={page === '...' ? 'default' : 'pointer'}
                    fontSize="13px"
                    fontWeight={page === activityLogsCurrentPage ? '600' : '400'}
                    onClick={() =>
                      typeof page === 'number' && setActivityLogsCurrentPage(page)
                    }
                    _hover={{
                      bg: page === '...' ? 'white' : page === activityLogsCurrentPage ? '#227CBF' : '#F5F5F5',
                    }}
                  >
                    {page}
                  </Box>
                ))}

                {/* Next button */}
                <Box
                  as="button"
                  w="32px"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="6px"
                  bg="white"
                  border="1px solid #E6E7EC"
                  cursor={activityLogsCurrentPage === activityLogsTotalPages ? 'not-allowed' : 'pointer'}
                  opacity={activityLogsCurrentPage === activityLogsTotalPages ? 0.5 : 1}
                  onClick={() =>
                    activityLogsCurrentPage < activityLogsTotalPages && setActivityLogsCurrentPage(activityLogsCurrentPage + 1)
                  }
                  _hover={{
                    bg: activityLogsCurrentPage === activityLogsTotalPages ? 'white' : '#F5F5F5',
                  }}
                >
                  <Text fontSize="18px">&gt;</Text>
                </Box>
              </HStack>
            </HStack>
          </Box>
        )}
      </Box>

      {/* Add Employee Modal */}
      {showAddModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="9999"
          onClick={cancelAddEmployee}
        >
          <Box
            bg="white"
            borderRadius="12px"
            p={5}
            maxW="440px"
            w="90%"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={3} align="stretch">
              {/* Header with close button */}
              <HStack justify="space-between" mb={1}>
                <Text fontSize="18px" fontWeight="600" color="#333">
                  Add Employee
                </Text>
                <Box
                  as="button"
                  onClick={cancelAddEmployee}
                  cursor="pointer"
                  color="#666"
                  _hover={{ color: '#333' }}
                  fontSize="22px"
                  lineHeight="1"
                >
                  ×
                </Box>
              </HStack>

              <Text fontSize="13px" color="#666" mb={1}>
                Add a new employee to the investment assessment system.
              </Text>

              {/* First Name */}
              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  First Name
                </Text>
                <Input
                  placeholder="Type"
                  value={newEmployee.firstName}
                  onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="38px"
                  fontSize="14px"
                />
              </Box>

              {/* Last Name */}
              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Last Name
                </Text>
                <Input
                  placeholder="Type"
                  value={newEmployee.lastName}
                  onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="38px"
                  fontSize="14px"
                />
              </Box>

              {/* Email Address */}
              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Email Address
                </Text>
                <Input
                  placeholder="Type"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="38px"
                  fontSize="14px"
                />
              </Box>

              {/* Department */}
              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Department
                </Text>
                <ChakraSelect.Root
                  collection={departmentCollection}
                  size="sm"
                  value={[newEmployee.department]}
                  onValueChange={(e) => setNewEmployee({ ...newEmployee, department: e.value[0] })}
                >
                  <ChakraSelect.Trigger
                    bg="white"
                    borderColor="#D1D5DB"
                    _hover={{ borderColor: '#9CA3AF' }}
                    borderRadius="6px"
                    height="38px"
                    fontSize="14px"
                  >
                    <ChakraSelect.ValueText placeholder="Select" />
                    <ChakraSelect.Indicator />
                  </ChakraSelect.Trigger>
                  <ChakraSelect.Content
                    bg="white"
                    borderRadius="8px"
                    boxShadow="lg"
                    zIndex={1500}
                    position="absolute"
                  >
                    {departmentOptions.map((option) => (
                      <ChakraSelect.Item key={option.value} item={option}>
                        {option.label}
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Root>
              </Box>

              {/* Role */}
              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Role
                </Text>
                <ChakraSelect.Root
                  collection={roleCollection}
                  size="sm"
                  value={[newEmployee.role]}
                  onValueChange={(e) => setNewEmployee({ ...newEmployee, role: e.value[0] })}
                >
                  <ChakraSelect.Trigger
                    bg="white"
                    borderColor="#D1D5DB"
                    _hover={{ borderColor: '#9CA3AF' }}
                    borderRadius="6px"
                    height="38px"
                    fontSize="14px"
                  >
                    <ChakraSelect.ValueText placeholder="Select" />
                    <ChakraSelect.Indicator />
                  </ChakraSelect.Trigger>
                  <ChakraSelect.Content
                    bg="white"
                    borderRadius="8px"
                    boxShadow="lg"
                    zIndex={1500}
                    position="absolute"
                  >
                    {roleOptions.map((option) => (
                      <ChakraSelect.Item key={option.value} item={option}>
                        {option.label}
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Root>
              </Box>

              {/* Buttons */}
              <HStack gap={2.5} mt={3}>
                <Button
                  flex="1"
                  bg="#E6E7EC"
                  color="#333"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#D1D5DB' }}
                  onClick={cancelAddEmployee}
                >
                  Cancel
                </Button>
                <Button
                  flex="1"
                  bg="#47B65C"
                  color="white"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#3DA550' }}
                  onClick={handleAddEmployee}
                >
                  Add Employee
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="9999"
          onClick={cancelDelete}
        >
          <Box
            bg="white"
            borderRadius="12px"
            p={6}
            maxW="400px"
            w="90%"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={4} align="stretch">
              <Text fontSize="20px" fontWeight="600" color="#333" textAlign="center">
                Delete Employee
              </Text>
              <Text fontSize="14px" color="#666" textAlign="center">
                Are you sure you want to delete this employee? This action cannot be undone.
              </Text>
              <HStack gap={3} mt={2}>
                <Button
                  flex="1"
                  bg="#E6E7EC"
                  color="#333"
                  fontSize="14px"
                  fontWeight="500"
                  h="42px"
                  borderRadius="8px"
                  _hover={{ bg: '#D1D5DB' }}
                  onClick={cancelDelete}
                >
                  Cancel
                </Button>
                <Button
                  flex="1"
                  bg="#FF6B47"
                  color="white"
                  fontSize="14px"
                  fontWeight="500"
                  h="42px"
                  borderRadius="8px"
                  _hover={{ bg: '#E55529' }}
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="9999"
          onClick={cancelAddRole}
        >
          <Box
            bg="white"
            borderRadius="12px"
            p={5}
            maxW="440px"
            w="90%"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={3} align="stretch">
              <HStack justify="space-between" mb={1}>
                <Text fontSize="18px" fontWeight="600" color="#333">
                  Add Role
                </Text>
                <Box
                  as="button"
                  onClick={cancelAddRole}
                  cursor="pointer"
                  color="#666"
                  _hover={{ color: '#333' }}
                  fontSize="22px"
                  lineHeight="1"
                >
                  ×
                </Box>
              </HStack>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Role
                </Text>
                <Input
                  placeholder="Type"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="38px"
                  fontSize="14px"
                />
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Description
                </Text>
                <Textarea
                  placeholder="Type"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="100px"
                  fontSize="14px"
                  resize="vertical"
                />
              </Box>

              <HStack gap={2.5} mt={3}>
                <Button
                  flex="1"
                  bg="#E6E7EC"
                  color="#333"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#D1D5DB' }}
                  onClick={cancelAddRole}
                >
                  Cancel
                </Button>
                <Button
                  flex="1"
                  bg="#47B65C"
                  color="white"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#3DA550' }}
                  onClick={handleAddRole}
                >
                  Add Role
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Edit Role Modal */}
      {showEditRoleModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="9999"
          onClick={cancelEditRole}
        >
          <Box
            bg="white"
            borderRadius="12px"
            p={5}
            maxW="440px"
            w="90%"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={3} align="stretch">
              <HStack justify="space-between" mb={1}>
                <Text fontSize="18px" fontWeight="600" color="#333">
                  Edit Role
                </Text>
                <Box
                  as="button"
                  onClick={cancelEditRole}
                  cursor="pointer"
                  color="#666"
                  _hover={{ color: '#333' }}
                  fontSize="22px"
                  lineHeight="1"
                >
                  ×
                </Box>
              </HStack>

              <Text fontSize="13px" color="#666" mb={1}>
                Update role information.
              </Text>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Role Name
                </Text>
                <Input
                  placeholder="Type"
                  value={editRole.name}
                  onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="38px"
                  fontSize="14px"
                />
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Role Description
                </Text>
                <Input
                  placeholder="Type"
                  value={editRole.description}
                  onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="38px"
                  fontSize="14px"
                />
              </Box>

              <HStack gap={2.5} mt={3}>
                <Button
                  flex="1"
                  bg="#E6E7EC"
                  color="#333"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#D1D5DB' }}
                  onClick={cancelEditRole}
                >
                  Cancel
                </Button>
                <Button
                  flex="1"
                  bg="#47B65C"
                  color="white"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#3DA550' }}
                  onClick={handleUpdateRole}
                >
                  Update Role
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Delete Role Confirmation Modal */}
      {showDeleteRoleModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="9999"
          onClick={cancelDeleteRole}
        >
          <Box
            bg="white"
            borderRadius="12px"
            p={6}
            maxW="400px"
            w="90%"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={4} align="stretch">
              <Text fontSize="20px" fontWeight="600" color="#333" textAlign="center">
                Delete Role
              </Text>
              <Text fontSize="14px" color="#666" textAlign="center">
                Are you sure you want to delete this role? This action cannot be undone.
              </Text>
              <HStack gap={3} mt={2}>
                <Button
                  flex="1"
                  bg="#E6E7EC"
                  color="#333"
                  fontSize="14px"
                  fontWeight="500"
                  h="42px"
                  borderRadius="8px"
                  _hover={{ bg: '#D1D5DB' }}
                  onClick={cancelDeleteRole}
                >
                  Cancel
                </Button>
                <Button
                  flex="1"
                  bg="#FF6B47"
                  color="white"
                  fontSize="14px"
                  fontWeight="500"
                  h="42px"
                  borderRadius="8px"
                  _hover={{ bg: '#E55529' }}
                  onClick={confirmDeleteRole}
                >
                  Delete
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Add Department Modal */}
      {showAddDepartmentModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="9999"
          onClick={cancelAddDepartment}
        >
          <Box
            bg="white"
            borderRadius="12px"
            p={5}
            maxW="440px"
            w="90%"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={3} align="stretch">
              <HStack justify="space-between" mb={1}>
                <Text fontSize="18px" fontWeight="600" color="#333">
                  Add Department
                </Text>
                <Box
                  as="button"
                  onClick={cancelAddDepartment}
                  cursor="pointer"
                  color="#666"
                  _hover={{ color: '#333' }}
                  fontSize="22px"
                  lineHeight="1"
                >
                  ×
                </Box>
              </HStack>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Department
                </Text>
                <Input
                  placeholder="Type"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="38px"
                  fontSize="14px"
                />
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Description
                </Text>
                <Textarea
                  placeholder="Type"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="100px"
                  fontSize="14px"
                  resize="vertical"
                />
              </Box>

              <HStack gap={2.5} mt={3}>
                <Button
                  flex="1"
                  bg="#E6E7EC"
                  color="#333"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#D1D5DB' }}
                  onClick={cancelAddDepartment}
                >
                  Cancel
                </Button>
                <Button
                  flex="1"
                  bg="#47B65C"
                  color="white"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#3DA550' }}
                  onClick={handleAddDepartment}
                >
                  Add Department
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Edit Department Modal */}
      {showEditDepartmentModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="9999"
          onClick={cancelEditDepartment}
        >
          <Box
            bg="white"
            borderRadius="12px"
            p={5}
            maxW="440px"
            w="90%"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={3} align="stretch">
              <HStack justify="space-between" mb={1}>
                <Text fontSize="18px" fontWeight="600" color="#333">
                  Edit Department
                </Text>
                <Box
                  as="button"
                  onClick={cancelEditDepartment}
                  cursor="pointer"
                  color="#666"
                  _hover={{ color: '#333' }}
                  fontSize="22px"
                  lineHeight="1"
                >
                  ×
                </Box>
              </HStack>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Department
                </Text>
                <Input
                  placeholder="Type"
                  value={editDepartment.name}
                  onChange={(e) => setEditDepartment({ ...editDepartment, name: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="38px"
                  fontSize="14px"
                />
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Description
                </Text>
                <Textarea
                  placeholder="Type"
                  value={editDepartment.description}
                  onChange={(e) => setEditDepartment({ ...editDepartment, description: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="100px"
                  fontSize="14px"
                  resize="vertical"
                />
              </Box>

              <HStack gap={2.5} mt={3}>
                <Button
                  flex="1"
                  bg="#E6E7EC"
                  color="#333"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#D1D5DB' }}
                  onClick={cancelEditDepartment}
                >
                  Cancel
                </Button>
                <Button
                  flex="1"
                  bg="#47B65C"
                  color="white"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#3DA550' }}
                  onClick={handleUpdateDepartment}
                >
                  Update Department
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Delete Department Confirmation Modal */}
      {showDeleteDepartmentModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="9999"
          onClick={cancelDeleteDepartment}
        >
          <Box
            bg="white"
            borderRadius="12px"
            p={6}
            maxW="400px"
            w="90%"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={4} align="stretch">
              <Text fontSize="20px" fontWeight="600" color="#333" textAlign="center">
                Delete Department
              </Text>
              <Text fontSize="14px" color="#666" textAlign="center">
                Are you sure you want to delete this department? This action cannot be undone.
              </Text>
              <HStack gap={3} mt={2}>
                <Button
                  flex="1"
                  bg="#E6E7EC"
                  color="#333"
                  fontSize="14px"
                  fontWeight="500"
                  h="42px"
                  borderRadius="8px"
                  _hover={{ bg: '#D1D5DB' }}
                  onClick={cancelDeleteDepartment}
                >
                  Cancel
                </Button>
                <Button
                  flex="1"
                  bg="#FF6B47"
                  color="white"
                  fontSize="14px"
                  fontWeight="500"
                  h="42px"
                  borderRadius="8px"
                  _hover={{ bg: '#E55529' }}
                  onClick={confirmDeleteDepartment}
                >
                  Delete
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Add Counterparty Modal */}
      {showAddCounterpartyModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="9999"
          onClick={cancelAddCounterparty}
        >
          <Box
            bg="white"
            borderRadius="12px"
            p={5}
            maxW="440px"
            w="90%"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={3} align="stretch">
              <HStack justify="space-between" mb={1}>
                <Text fontSize="18px" fontWeight="600" color="#333">
                  Add Counterparty
                </Text>
                <Box
                  as="button"
                  onClick={cancelAddCounterparty}
                  cursor="pointer"
                  color="#666"
                  _hover={{ color: '#333' }}
                  fontSize="22px"
                  lineHeight="1"
                >
                  ×
                </Box>
              </HStack>

              <Text fontSize="13px" color="#666" mb={1}>
                Add a new company to the investment threshold assessment.
              </Text>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Counterparty
                </Text>
                <Input
                  placeholder="Type"
                  value={newCounterparty.name}
                  onChange={(e) => setNewCounterparty({ ...newCounterparty, name: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="38px"
                  fontSize="14px"
                />
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Sector
                </Text>
                <ChakraSelect.Root
                  collection={sectorCollection}
                  size="sm"
                  value={[newCounterparty.sector]}
                  onValueChange={(e) => setNewCounterparty({ ...newCounterparty, sector: e.value[0] })}
                >
                  <ChakraSelect.Trigger
                    bg="white"
                    borderColor="#D1D5DB"
                    _hover={{ borderColor: '#9CA3AF' }}
                    borderRadius="6px"
                    height="38px"
                    fontSize="14px"
                  >
                    <ChakraSelect.ValueText placeholder="Select" />
                    <ChakraSelect.Indicator />
                  </ChakraSelect.Trigger>
                  <ChakraSelect.Content
                    bg="white"
                    borderRadius="8px"
                    boxShadow="lg"
                    zIndex={10000}
                    position="absolute"
                  >
                    {sectorOptions.map((option) => (
                      <ChakraSelect.Item key={option.value} item={option}>
                        {option.label}
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Root>
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Description
                </Text>
                <Textarea
                  placeholder="Type"
                  value={newCounterparty.description}
                  onChange={(e) => setNewCounterparty({ ...newCounterparty, description: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="100px"
                  fontSize="14px"
                  resize="vertical"
                />
              </Box>

              <HStack gap={2.5} mt={3}>
                <Button
                  flex="1"
                  bg="#E6E7EC"
                  color="#333"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#D1D5DB' }}
                  onClick={cancelAddCounterparty}
                >
                  Cancel
                </Button>
                <Button
                  flex="1"
                  bg="#47B65C"
                  color="white"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#3DA550' }}
                  onClick={handleAddCounterparty}
                >
                  Add Counterparty
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Edit Counterparty Modal */}
      {showEditCounterpartyModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="9999"
          onClick={cancelEditCounterparty}
        >
          <Box
            bg="white"
            borderRadius="12px"
            p={5}
            maxW="440px"
            w="90%"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={3} align="stretch">
              <HStack justify="space-between" mb={1}>
                <Text fontSize="18px" fontWeight="600" color="#333">
                  Edit Counterparty
                </Text>
                <Box
                  as="button"
                  onClick={cancelEditCounterparty}
                  cursor="pointer"
                  color="#666"
                  _hover={{ color: '#333' }}
                  fontSize="22px"
                  lineHeight="1"
                >
                  ×
                </Box>
              </HStack>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Counterparty
                </Text>
                <Input
                  placeholder="Type"
                  value={editCounterparty.name}
                  onChange={(e) => setEditCounterparty({ ...editCounterparty, name: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="38px"
                  fontSize="14px"
                />
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Sector
                </Text>
                <ChakraSelect.Root
                  collection={sectorCollection}
                  size="sm"
                  value={[editCounterparty.sector]}
                  onValueChange={(e) => setEditCounterparty({ ...editCounterparty, sector: e.value[0] })}
                >
                  <ChakraSelect.Trigger
                    bg="white"
                    borderColor="#D1D5DB"
                    _hover={{ borderColor: '#9CA3AF' }}
                    borderRadius="6px"
                    height="38px"
                    fontSize="14px"
                  >
                    <ChakraSelect.ValueText placeholder="Select" />
                    <ChakraSelect.Indicator />
                  </ChakraSelect.Trigger>
                  <ChakraSelect.Content
                    bg="white"
                    borderRadius="8px"
                    boxShadow="lg"
                    zIndex={10000}
                    position="absolute"
                  >
                    {sectorOptions.map((option) => (
                      <ChakraSelect.Item key={option.value} item={option}>
                        {option.label}
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Root>
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Description
                </Text>
                <Textarea
                  placeholder="Type"
                  value={editCounterparty.description}
                  onChange={(e) => setEditCounterparty({ ...editCounterparty, description: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="100px"
                  fontSize="14px"
                  resize="vertical"
                />
              </Box>

              <HStack gap={2.5} mt={3}>
                <Button
                  flex="1"
                  bg="#E6E7EC"
                  color="#333"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#D1D5DB' }}
                  onClick={cancelEditCounterparty}
                >
                  Cancel
                </Button>
                <Button
                  flex="1"
                  bg="#47B65C"
                  color="white"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#3DA550' }}
                  onClick={handleUpdateCounterparty}
                >
                  Update Counterparty
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Delete Counterparty Confirmation Modal */}
      {showDeleteCounterpartyModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="9999"
          onClick={cancelDeleteCounterparty}
        >
          <Box
            bg="white"
            borderRadius="12px"
            p={6}
            maxW="400px"
            w="90%"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={4} align="stretch">
              <Text fontSize="20px" fontWeight="600" color="#333" textAlign="center">
                Delete Counterparty
              </Text>
              <Text fontSize="14px" color="#666" textAlign="center">
                Are you sure you want to delete this counterparty? This action cannot be undone.
              </Text>
              <HStack gap={3} mt={2}>
                <Button
                  flex="1"
                  bg="#E6E7EC"
                  color="#333"
                  fontSize="14px"
                  fontWeight="500"
                  h="42px"
                  borderRadius="8px"
                  _hover={{ bg: '#D1D5DB' }}
                  onClick={cancelDeleteCounterparty}
                >
                  Cancel
                </Button>
                <Button
                  flex="1"
                  bg="#FF6B47"
                  color="white"
                  fontSize="14px"
                  fontWeight="500"
                  h="42px"
                  borderRadius="8px"
                  _hover={{ bg: '#E55529' }}
                  onClick={confirmDeleteCounterparty}
                >
                  Delete
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Add Sector Modal */}
      {showAddSectorModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="9999"
          onClick={cancelAddSector}
        >
          <Box
            bg="white"
            borderRadius="12px"
            p={5}
            maxW="440px"
            w="90%"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={3} align="stretch">
              <HStack justify="space-between" mb={1}>
                <Text fontSize="18px" fontWeight="600" color="#333">
                  Add Sector
                </Text>
                <Box
                  as="button"
                  onClick={cancelAddSector}
                  cursor="pointer"
                  color="#666"
                  _hover={{ color: '#333' }}
                  fontSize="22px"
                  lineHeight="1"
                >
                  ×
                </Box>
              </HStack>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Sector
                </Text>
                <Input
                  placeholder="Type"
                  value={newSector.name}
                  onChange={(e) => setNewSector({ ...newSector, name: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="38px"
                  fontSize="14px"
                />
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Description
                </Text>
                <Textarea
                  placeholder="Type"
                  value={newSector.description}
                  onChange={(e) => setNewSector({ ...newSector, description: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="100px"
                  fontSize="14px"
                  resize="vertical"
                />
              </Box>

              <HStack gap={2.5} mt={3}>
                <Button
                  flex="1"
                  bg="#E6E7EC"
                  color="#333"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#D1D5DB' }}
                  onClick={cancelAddSector}
                >
                  Cancel
                </Button>
                <Button
                  flex="1"
                  bg="#47B65C"
                  color="white"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#3DA550' }}
                  onClick={handleAddSector}
                >
                  Add Sector
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Edit Sector Modal */}
      {showEditSectorModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="9999"
          onClick={cancelEditSector}
        >
          <Box
            bg="white"
            borderRadius="12px"
            p={5}
            maxW="440px"
            w="90%"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={3} align="stretch">
              <HStack justify="space-between" mb={1}>
                <Text fontSize="18px" fontWeight="600" color="#333">
                  Edit Sector
                </Text>
                <Box
                  as="button"
                  onClick={cancelEditSector}
                  cursor="pointer"
                  color="#666"
                  _hover={{ color: '#333' }}
                  fontSize="22px"
                  lineHeight="1"
                >
                  ×
                </Box>
              </HStack>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Sector
                </Text>
                <Input
                  placeholder="Type"
                  value={editSector.name}
                  onChange={(e) => setEditSector({ ...editSector, name: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="38px"
                  fontSize="14px"
                />
              </Box>

              <Box>
                <Text fontSize="13px" fontWeight="500" color="#333" mb={1.5}>
                  Description
                </Text>
                <Textarea
                  placeholder="Type"
                  value={editSector.description}
                  onChange={(e) => setEditSector({ ...editSector, description: e.target.value })}
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                  borderRadius="6px"
                  height="100px"
                  fontSize="14px"
                  resize="vertical"
                />
              </Box>

              <HStack gap={2.5} mt={3}>
                <Button
                  flex="1"
                  bg="#E6E7EC"
                  color="#333"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#D1D5DB' }}
                  onClick={cancelEditSector}
                >
                  Cancel
                </Button>
                <Button
                  flex="1"
                  bg="#47B65C"
                  color="white"
                  fontSize="14px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="8px"
                  _hover={{ bg: '#3DA550' }}
                  onClick={handleUpdateSector}
                >
                  Update Sector
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Delete Sector Confirmation Modal */}
      {showDeleteSectorModal && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="9999"
          onClick={cancelDeleteSector}
        >
          <Box
            bg="white"
            borderRadius="12px"
            p={6}
            maxW="400px"
            w="90%"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={4} align="stretch">
              <Text fontSize="20px" fontWeight="600" color="#333" textAlign="center">
                Delete Sector
              </Text>
              <Text fontSize="14px" color="#666" textAlign="center">
                Are you sure you want to delete this sector? This action cannot be undone.
              </Text>
              <HStack gap={3} mt={2}>
                <Button
                  flex="1"
                  bg="#E6E7EC"
                  color="#333"
                  fontSize="14px"
                  fontWeight="500"
                  h="42px"
                  borderRadius="8px"
                  _hover={{ bg: '#D1D5DB' }}
                  onClick={cancelDeleteSector}
                >
                  Cancel
                </Button>
                <Button
                  flex="1"
                  bg="#FF6B47"
                  color="white"
                  fontSize="14px"
                  fontWeight="500"
                  h="42px"
                  borderRadius="8px"
                  _hover={{ bg: '#E55529' }}
                  onClick={confirmDeleteSector}
                >
                  Delete
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </AdminLayout>
  );
};

export default SettingsPage;
