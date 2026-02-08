'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Select as ChakraSelect,
  createListCollection,
  Button as ChakraButton,
} from '@chakra-ui/react';
import { Button } from '@/components/ui';
import AdminLayout from '@/lib/layout/AdminLayout';
import { FiChevronLeft, FiChevronRight, FiDownload } from 'react-icons/fi';
import { toaster } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';
import { useGetCurrentUserQuery } from '@/lib/redux/services/auth.service';
import { isITAdmin } from '@/lib/constants/roles';

// Import all API hooks
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from '@/lib/redux/services/employee.service';

import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from '@/lib/redux/services/department.service';

import {
  useCreateCounterpartyMutation,
  useUpdateCounterpartyMutation,
  useDeleteCounterpartyMutation,
} from '@/lib/redux/services/counterparty.service';

import {
  useGetCounterpartyConflictSummaryQuery,
} from '@/lib/redux/services/dashboard.service';

import {
  useGetSectorsQuery,
  useGetActiveSectorsQuery,
  useCreateSectorMutation,
  useUpdateSectorMutation,
  useDeleteSectorMutation,
} from '@/lib/redux/services/sector.service';

import {
  useGetUserActivitiesQuery,
} from '@/lib/redux/services/admin.service';

const SettingsPage = () => {
  const router = useRouter();

  // Get current user to check role
  const { data: currentUserData, isLoading: isLoadingUser } = useGetCurrentUserQuery();
  const currentUser = currentUserData?.data;

  // Redirect non-IT Admin users
  useEffect(() => {
    if (!isLoadingUser && currentUser && !isITAdmin(currentUser.role)) {
      toaster.error({
        title: 'Access Denied',
        description: 'Only IT Admin can access Settings.',
        closable: true,
      });
      router.push('/admin');
    }
  }, [currentUser, isLoadingUser, router]);

  const [activeTab, setActiveTab] = useState('Employees');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(200);
  const [searchQuery, setSearchQuery] = useState('');

  // Employee/User state
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    departmentId: '',
    role: 1,
  });

  // Department state
  const [showDeleteDepartmentModal, setShowDeleteDepartmentModal] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<any>(null);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    code: '',
  });

  // Counterparty state
  const [selectedSector, setSelectedSector] = useState('');
  const [showDeleteCounterpartyModal, setShowDeleteCounterpartyModal] = useState(false);
  const [counterpartyToDelete, setCounterpartyToDelete] = useState<string | null>(null);
  const [showAddCounterpartyModal, setShowAddCounterpartyModal] = useState(false);
  const [showEditCounterpartyModal, setShowEditCounterpartyModal] = useState(false);
  const [counterpartyToEdit, setCounterpartyToEdit] = useState<any>(null);
  const [newCounterparty, setNewCounterparty] = useState({
    name: '',
    sectorId: '',
  });

  // Sector state
  const [showDeleteSectorModal, setShowDeleteSectorModal] = useState(false);
  const [sectorToDelete, setSectorToDelete] = useState<string | null>(null);
  const [showAddSectorModal, setShowAddSectorModal] = useState(false);
  const [showEditSectorModal, setShowEditSectorModal] = useState(false);
  const [sectorToEdit, setSectorToEdit] = useState<any>(null);
  const [newSector, setNewSector] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  // Activity log date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // API Queries - Fetch ALL users for client-side filtering
  const { data: usersData, isLoading: isLoadingUsers, refetch: refetchUsers } = useGetUsersQuery({
    page: 1,
    limit: 10000, // Fetch all users
  });

  const { data: departmentsData, isLoading: isLoadingDepartments } = useGetDepartmentsQuery({
    page: activeTab === 'Departments' ? currentPage : 1,
    limit: activeTab === 'Departments' ? 100 : 10,
  });

  // Fetch all departments for dropdown (using paginated endpoint with large limit)
  const { data: allDepartmentsData } = useGetDepartmentsQuery({
    page: 1,
    limit: 1000,
  });

  // Fetch ALL counterparties for client-side filtering
  const { data: counterpartiesData, isLoading: isLoadingCounterparties, refetch: refetchCounterparties } = useGetCounterpartyConflictSummaryQuery({
    page: 1,
    limit: 10000, // Fetch all counterparties
  });

  const { data: sectorsData, isLoading: isLoadingSectors } = useGetSectorsQuery({
    page: activeTab === 'Categories' ? currentPage : 1,
    limit: activeTab === 'Categories' ? 100 : 10,
  });

  const { data: activeSectorsData } = useGetActiveSectorsQuery({
    page: 1,
    limit: 100,
  });

  // Fetch ALL activity logs for client-side filtering
  const { data: activityLogsData, isLoading: isLoadingActivityLogs } = useGetUserActivitiesQuery({
    page: 1,
    limit: 10000, // Fetch all activity logs
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  // API Mutations
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();
  const [activateUser] = useActivateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();

  const [createDepartment, { isLoading: isCreatingDepartment }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdatingDepartment }] = useUpdateDepartmentMutation();
  const [deleteDepartment, { isLoading: isDeletingDepartment }] = useDeleteDepartmentMutation();

  const [createCounterparty, { isLoading: isCreatingCounterparty }] = useCreateCounterpartyMutation();
  const [updateCounterparty, { isLoading: isUpdatingCounterparty }] = useUpdateCounterpartyMutation();
  const [deleteCounterparty, { isLoading: isDeletingCounterparty }] = useDeleteCounterpartyMutation();

  const [createSector, { isLoading: isCreatingSector }] = useCreateSectorMutation();
  const [updateSector, { isLoading: isUpdatingSector }] = useUpdateSectorMutation();
  const [deleteSector, { isLoading: isDeletingSector }] = useDeleteSectorMutation();

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
  }, [activeTab]);

  // Reset page when filters change for Employees tab
  useEffect(() => {
    if (activeTab === 'Employees') {
      setCurrentPage(1);
    }
  }, [selectedDepartment, selectedStatus, searchQuery, activeTab]);

  // Reset page when filters change for Counterparties tab
  useEffect(() => {
    if (activeTab === 'Counterparties') {
      setCurrentPage(1);
    }
  }, [selectedSector, searchQuery, activeTab]);

  // Reset page when filters change for Activity log tab
  useEffect(() => {
    if (activeTab === 'Activity log') {
      setCurrentPage(1);
    }
  }, [startDate, endDate, searchQuery, activeTab]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('');
    setSelectedRole('');
    setSelectedStatus('');
    setSelectedSector('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedDepartment || selectedStatus || selectedSector || startDate || endDate;

  const tabs = ['Employees', 'Departments', 'Counterparties', 'Categories', 'Activity log'];

  // Helper function to parse activity details into user-friendly text
  const parseActivityDetails = (details: string): string => {
    if (!details) return '';

    // If it's already clean text (doesn't contain technical patterns), return as is
    if (!details.includes("Id: '") && !details.includes("'DepartmentId:")) {
      return details;
    }

    // Extract meaningful information from technical strings
    let parsed = '';

    // Check for conflict check details
    const refNumberMatch = details.match(/ReferenceNumber:\s*'([^']+)'/);
    const hasConflictMatch = details.match(/HasConflict:\s*'(True|False)'/);

    if (refNumberMatch) {
      const conflictStatus = hasConflictMatch && hasConflictMatch[1] === 'True' ? 'Conflict detected' : 'No conflict';
      parsed = `Conflict check performed - Reference: ${refNumberMatch[1]} - ${conflictStatus}`;
      return parsed;
    }

    // Check for department updates
    const deptIdMatch = details.match(/DepartmentId:\s*'([^']+)'.*=>\s*'([^']+)'/);
    if (deptIdMatch) {
      parsed = 'Department information updated';
      return parsed;
    }

    // Check for general Details field
    const detailsFieldMatch = details.match(/Details:\s*'([^']+)'/);
    if (detailsFieldMatch) {
      return detailsFieldMatch[1];
    }

    // If we can't parse it meaningfully, return a generic message
    return 'System activity recorded';
  };

  // Get current tab data
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'Employees':
        return {
          data: usersData?.data?.result || [],
          totalRecords: usersData?.data?.totalRecords || 0,
          totalPages: usersData?.data?.totalPages || 1,
          isLoading: isLoadingUsers,
        };
      case 'Departments':
        return {
          data: departmentsData?.data?.result || [],
          totalRecords: departmentsData?.data?.totalRecords || 0,
          totalPages: departmentsData?.data?.totalPages || 1,
          isLoading: isLoadingDepartments,
        };
      case 'Counterparties':
        return {
          data: counterpartiesData?.data?.result?.map((item: any) => ({
            id: item.id,
            name: item.counterparty,
            sectorName: item.sector,
            conflictCount: item.numberOfConflictsDeclared,
          })) || [],
          totalRecords: counterpartiesData?.data?.totalRecords || 0,
          totalPages: counterpartiesData?.data?.totalPages || 1,
          isLoading: isLoadingCounterparties,
        };
      case 'Categories':
        return {
          data: sectorsData?.data?.result || [],
          totalRecords: sectorsData?.data?.totalRecords || 0,
          totalPages: sectorsData?.data?.totalPages || 1,
          isLoading: isLoadingSectors,
        };
      case 'Activity log':
        return {
          data: activityLogsData?.data?.result || [],
          totalRecords: activityLogsData?.data?.totalRecords || 0,
          totalPages: activityLogsData?.data?.totalPages || 1,
          isLoading: isLoadingActivityLogs,
        };
      default:
        return { data: [], totalRecords: 0, totalPages: 1, isLoading: false };
    }
  };

  const { data, totalRecords, totalPages, isLoading } = getCurrentTabData();

  // Filter data client-side
  const filteredData = useMemo(() => {
    if (activeTab === 'Employees') {
      const filtered = data.filter((item: any) => {
        const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
        const matchesSearch = searchQuery === '' || fullName.includes(searchQuery.toLowerCase()) || item.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = !selectedDepartment || item.department?.name === selectedDepartment;

        // Status filtering - Backend uses: 1=Active, 2=Inactive
        let matchesStatus = true;
        if (selectedStatus) {
          if (selectedStatus === 'active') {
            matchesStatus = item.status === 1;
          } else if (selectedStatus === 'inactive') {
            matchesStatus = item.status === 2; // Backend uses 2 for inactive, not 0
          }
        }

        return matchesSearch && matchesDepartment && matchesStatus;
      });

      return filtered;
    } else if (activeTab === 'Counterparties') {
      return data.filter((item: any) => {
        const matchesSearch = searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSector = !selectedSector || item.sectorName === selectedSector;
        return matchesSearch && matchesSector;
      });
    } else if (activeTab === 'Activity log') {
      return data.filter((item: any) => {
        if (searchQuery === '') return true;
        const query = searchQuery.toLowerCase();
        const matchesInitiator = item.initiator?.toLowerCase().includes(query);
        const matchesAction = item.action?.toLowerCase().includes(query);
        const matchesDetails = item.details?.toLowerCase().includes(query);

        // Search by date - format the date the same way it's displayed
        let matchesDate = false;
        if (item.createdAt) {
          const formattedDate = new Date(item.createdAt).toLocaleString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }).toLowerCase();
          matchesDate = formattedDate.includes(query);
        }

        return matchesInitiator || matchesAction || matchesDetails || matchesDate;
      });
    } else {
      return data.filter((item: any) => {
        if (activeTab === 'Departments' || activeTab === 'Categories') {
          return searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      });
    }
  }, [data, searchQuery, activeTab, selectedDepartment, selectedStatus, selectedSector]);

  // Pagination - Apply to filtered data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = (activeTab === 'Employees' || activeTab === 'Counterparties' || activeTab === 'Activity log')
    ? filteredData.slice(startIndex, endIndex)
    : filteredData;

  // Calculate total pages based on filtered data for client-side filtered tabs
  const actualTotalPages = (activeTab === 'Employees' || activeTab === 'Counterparties' || activeTab === 'Activity log')
    ? Math.ceil(filteredData.length / itemsPerPage)
    : totalPages;
  const actualTotalRecords = (activeTab === 'Employees' || activeTab === 'Counterparties' || activeTab === 'Activity log')
    ? filteredData.length
    : totalRecords;

  const renderPageNumbers = useMemo(() => {
    const pagesToShow = (activeTab === 'Employees' || activeTab === 'Counterparties' || activeTab === 'Activity log') ? actualTotalPages : totalPages;
    const pages: (number | string)[] = [];
    if (pagesToShow <= 10) {
      for (let i = 1; i <= pagesToShow; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(pagesToShow - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < pagesToShow - 2) pages.push('...');
      pages.push(pagesToShow);
    }
    return pages;
  }, [currentPage, totalPages, actualTotalPages, activeTab]);

  // User/Employee handlers
  const handleToggleUserStatus = async (userId: string, currentStatus: number) => {
    try {
      if (currentStatus === 1) {
        await deactivateUser(userId).unwrap();
        toaster.success({ title: 'User deactivated successfully' });
      } else {
        await activateUser(userId).unwrap();
        toaster.success({ title: 'User activated successfully' });
      }
    } catch (error: any) {
      toaster.error({ title: 'Error', description: error?.data?.message || 'Failed to update user status' });
    }
  };

  const handleEditUser = (user: any) => {
    setUserToEdit(user);
    setNewUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      departmentId: user.department.id,
      role: user.role,
    });
    setShowEditUserModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete).unwrap();
        toaster.success({ title: 'User deleted successfully' });
        setShowDeleteModal(false);
        setUserToDelete(null);
      } catch (error: any) {
        toaster.error({ title: 'Error', description: error?.data?.message || 'Failed to delete user' });
      }
    }
  };

  const handleAddUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.departmentId) {
      toaster.error({ title: 'Error', description: 'Please fill all required fields' });
      return;
    }

    try {
      await createUser(newUser).unwrap();
      toaster.success({ title: 'User created successfully' });
      setShowAddUserModal(false);
      setNewUser({ firstName: '', lastName: '', email: '', departmentId: '', role: 1 });
    } catch (error: any) {
      toaster.error({ title: 'Error', description: error?.data?.message || 'Failed to create user' });
    }
  };

  const handleUpdateUser = async () => {
    if (!userToEdit || !newUser.firstName || !newUser.lastName || !newUser.email || !newUser.departmentId) {
      toaster.error({ title: 'Error', description: 'Please fill all required fields' });
      return;
    }

    try {
      await updateUser({ id: userToEdit.id, data: newUser }).unwrap();
      toaster.success({ title: 'User updated successfully' });
      setShowEditUserModal(false);
      setUserToEdit(null);
      setNewUser({ firstName: '', lastName: '', email: '', departmentId: '', role: 1 });
    } catch (error: any) {
      toaster.error({ title: 'Error', description: error?.data?.message || 'Failed to update user' });
    }
  };

  // Department handlers
  const handleEditDepartment = (department: any) => {
    setDepartmentToEdit(department);
    setNewDepartment({
      name: department.name,
      description: department.description || '',
      code: department.code || '',
    });
    setShowEditDepartmentModal(true);
  };

  const handleDeleteDepartment = (departmentId: string) => {
    setDepartmentToDelete(departmentId);
    setShowDeleteDepartmentModal(true);
  };

  const confirmDeleteDepartment = async () => {
    if (departmentToDelete) {
      try {
        await deleteDepartment(departmentToDelete).unwrap();
        toaster.success({ title: 'Department deleted successfully' });
        setShowDeleteDepartmentModal(false);
        setDepartmentToDelete(null);
      } catch (error: any) {
        toaster.error({ title: 'Error', description: error?.data?.message || 'Failed to delete department' });
      }
    }
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.name) {
      toaster.error({ title: 'Error', description: 'Please enter department name' });
      return;
    }

    try {
      await createDepartment(newDepartment).unwrap();
      toaster.success({ title: 'Department created successfully' });
      setShowAddDepartmentModal(false);
      setNewDepartment({ name: '', description: '', code: '' });
    } catch (error: any) {
      toaster.error({ title: 'Error', description: error?.data?.message || 'Failed to create department' });
    }
  };

  const handleUpdateDepartment = async () => {
    if (!departmentToEdit || !newDepartment.name) {
      toaster.error({ title: 'Error', description: 'Please enter department name' });
      return;
    }

    try {
      await updateDepartment({ id: departmentToEdit.id, data: newDepartment }).unwrap();
      toaster.success({ title: 'Department updated successfully' });
      setShowEditDepartmentModal(false);
      setDepartmentToEdit(null);
      setNewDepartment({ name: '', description: '', code: '' });
    } catch (error: any) {
      toaster.error({ title: 'Error', description: error?.data?.message || 'Failed to update department' });
    }
  };

  // Counterparty handlers
  const handleEditCounterparty = (counterparty: any) => {
    setCounterpartyToEdit(counterparty);
    setNewCounterparty({
      name: counterparty.name,
      sectorId: counterparty.sectorId,
    });
    setShowEditCounterpartyModal(true);
  };

  const handleDeleteCounterparty = (counterpartyId: string) => {
    setCounterpartyToDelete(counterpartyId);
    setShowDeleteCounterpartyModal(true);
  };

  const confirmDeleteCounterparty = async () => {
    if (counterpartyToDelete) {
      try {
        await deleteCounterparty(counterpartyToDelete).unwrap();
        toaster.success({ title: 'Counterparty deleted successfully' });
        setShowDeleteCounterpartyModal(false);
        setCounterpartyToDelete(null);
        // Refetch counterparties to remove the deleted one immediately
        refetchCounterparties();
      } catch (error: any) {
        toaster.error({ title: 'Error', description: error?.data?.message || 'Failed to delete counterparty' });
      }
    }
  };

  const handleAddCounterparty = async () => {
    if (!newCounterparty.name || !newCounterparty.sectorId) {
      toaster.error({ title: 'Error', description: 'Please fill all required fields' });
      return;
    }

    try {
      await createCounterparty(newCounterparty).unwrap();
      toaster.success({ title: 'Counterparty created successfully' });
      setShowAddCounterpartyModal(false);
      setNewCounterparty({ name: '', sectorId: '' });
      // Refetch counterparties to show the new one immediately
      refetchCounterparties();
    } catch (error: any) {
      toaster.error({ title: 'Error', description: error?.data?.message || 'Failed to create counterparty' });
    }
  };

  const handleUpdateCounterparty = async () => {
    if (!counterpartyToEdit || !newCounterparty.name || !newCounterparty.sectorId) {
      toaster.error({ title: 'Error', description: 'Please fill all required fields' });
      return;
    }

    try {
      await updateCounterparty({ id: counterpartyToEdit.id, data: newCounterparty }).unwrap();
      toaster.success({ title: 'Counterparty updated successfully' });
      setShowEditCounterpartyModal(false);
      setCounterpartyToEdit(null);
      setNewCounterparty({ name: '', sectorId: '' });
      // Refetch counterparties to show the updated one immediately
      refetchCounterparties();
    } catch (error: any) {
      toaster.error({ title: 'Error', description: error?.data?.message || 'Failed to update counterparty' });
    }
  };

  // Sector handlers
  const handleEditSector = (sector: any) => {
    setSectorToEdit(sector);
    setNewSector({
      name: sector.name,
      description: sector.description || '',
      isActive: sector.isActive,
    });
    setShowEditSectorModal(true);
  };

  const handleDeleteSector = (sectorId: string) => {
    setSectorToDelete(sectorId);
    setShowDeleteSectorModal(true);
  };

  const confirmDeleteSector = async () => {
    if (sectorToDelete) {
      try {
        await deleteSector(sectorToDelete).unwrap();
        toaster.success({ title: 'Category deleted successfully' });
        setShowDeleteSectorModal(false);
        setSectorToDelete(null);
      } catch (error: any) {
        toaster.error({ title: 'Error', description: error?.data?.message || 'Failed to delete category' });
      }
    }
  };

  const handleAddSector = async () => {
    if (!newSector.name) {
      toaster.error({ title: 'Error', description: 'Please enter category name' });
      return;
    }

    try {
      await createSector(newSector).unwrap();
      toaster.success({ title: 'Category created successfully' });
      setShowAddSectorModal(false);
      setNewSector({ name: '', description: '', isActive: true });
    } catch (error: any) {
      toaster.error({ title: 'Error', description: error?.data?.message || 'Failed to create category' });
    }
  };

  const handleUpdateSector = async () => {
    if (!sectorToEdit || !newSector.name) {
      toaster.error({ title: 'Error', description: 'Please enter category name' });
      return;
    }

    try {
      await updateSector({ id: sectorToEdit.id, data: newSector }).unwrap();
      toaster.success({ title: 'Category updated successfully' });
      setShowEditSectorModal(false);
      setSectorToEdit(null);
      setNewSector({ name: '', description: '', isActive: true });
    } catch (error: any) {
      toaster.error({ title: 'Error', description: error?.data?.message || 'Failed to update category' });
    }
  };

  // Download Activity Log as CSV
  const handleDownloadActivityLogCSV = () => {
    const activityData = activityLogsData?.data?.result || [];

    if (activityData.length === 0) {
      toaster.error({ title: 'No data to download', description: 'There are no activity logs to export.' });
      return;
    }

    // CSV headers
    const headers = ['S/N', 'Initiator', 'Action', 'Details', 'Date/Time'];

    // Convert data to CSV rows
    const rows = activityData.map((item: any, index: number) => {
      const initiator = item.initiator || 'N/A';
      const action = item.action || 'N/A';
      const details = parseActivityDetails(item.details) || '';
      const dateTime = item.createdAt
        ? new Date(item.createdAt).toLocaleString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
        : 'N/A';

      // Escape CSV fields that contain commas, quotes, or newlines
      const escapeCSV = (field: string) => {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      };

      return [
        index + 1,
        escapeCSV(initiator),
        escapeCSV(action),
        escapeCSV(details),
        escapeCSV(dateTime),
      ].join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Generate filename with current date
    const today = new Date().toISOString().split('T')[0];
    const filename = `activity_log_${today}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toaster.success({ title: 'Download started', description: `Exporting ${activityData.length} activity log entries.` });
  };

  // Collections for filters - Extract departments from users data
  const departmentOptions = useMemo(() => {
    if (!usersData?.data?.result) return [{ label: 'All Departments', value: '' }];

    const departments = new Set<string>();
    usersData.data.result.forEach((user: any) => {
      if (user.department?.name) {
        departments.add(user.department.name);
      }
    });

    return [
      { label: 'All Departments', value: '' },
      ...Array.from(departments).sort().map((dept) => ({
        label: dept,
        value: dept,
      }))
    ];
  }, [usersData]);

  const sectorOptions = useMemo(() => {
    if (!activeSectorsData?.data?.result) return [{ label: 'All Categories', value: '' }];
    return [
      { label: 'All Categories', value: '' },
      ...activeSectorsData.data.result.map((sector: any) => ({
        label: sector.name,
        value: sector.name,
      }))
    ];
  }, [activeSectorsData]);

  const sectorOptionsForCreate = useMemo(() => {
    if (!activeSectorsData?.data?.result) return [];
    return activeSectorsData.data.result.map((sector: any) => ({
      label: sector.name,
      value: sector.id,
    }));
  }, [activeSectorsData]);

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  const itemsPerPageOptions = [10, 20, 50, 100].map((num) => ({
    label: num.toString(),
    value: num.toString(),
  }));

  return (
    <AdminLayout hideBackButton={true}>
      <Box px={{ base: 4, md: 6 }} py={6}>
        {/* Header */}
        <Text fontSize="24px" fontWeight="600" color="#2C3E50" mb={6}>
          Settings
        </Text>

        {/* Tabs */}
        <HStack gap={0} mb={6} overflowX="auto" flexWrap="wrap">
          {tabs.map((tab) => (
            <Box
              key={tab}
              px={6}
              py={3}
              bg={activeTab === tab ? '#2C3E50' : '#E5E7EB'}
              color={activeTab === tab ? 'white' : '#666'}
              cursor="pointer"
              onClick={() => setActiveTab(tab)}
              fontSize="14px"
              fontWeight="500"
              transition="all 0.2s"
              borderRadius={tab === tabs[0] ? '8px 0 0 8px' : tab === tabs[tabs.length - 1] ? '0 8px 8px 0' : '0'}
              _hover={{ bg: activeTab === tab ? '#2C3E50' : '#D1D5DB' }}
              minW="fit-content"
            >
              {tab}
            </Box>
          ))}
        </HStack>

        {/* Content */}
        <Box bg="white" borderRadius="12px" p={6}>
          {/* Filters and Actions */}
          <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
            <HStack gap={3} flex="1" flexWrap="wrap">
              {/* Search */}
              <Input
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                maxW="300px"
                size="sm"
                bg="white"
                borderColor="#D1D5DB"
                _hover={{ borderColor: '#9CA3AF' }}
                _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                borderRadius="6px"
                height="40px"
              />

              {/* Conditional filters */}
              {activeTab === 'Employees' && (
                <>
                  <ChakraSelect.Root
                    collection={createListCollection({
                      items: departmentOptions,
                      itemToString: (item) => item.label,
                      itemToValue: (item) => item.value,
                    })}
                    value={[selectedDepartment]}
                    onValueChange={(e) => setSelectedDepartment(e.value[0])}
                    size="sm"
                    width="180px"
                    positioning={{ sameWidth: true }}
                  >
                    <ChakraSelect.Trigger bg="white" borderColor="#D1D5DB" borderRadius="6px" height="40px">
                      <ChakraSelect.ValueText placeholder="Department" />
                    </ChakraSelect.Trigger>
                    <ChakraSelect.Positioner>
                      <ChakraSelect.Content
                        bg="white"
                        borderRadius="8px"
                        boxShadow="lg"
                        zIndex={1500}
                        position="absolute"
                        maxH="250px"
                        overflowY="auto"
                      >
                        {departmentOptions.map((option: any) => (
                          <ChakraSelect.Item key={option.value} item={option}>
                            {option.label}
                          </ChakraSelect.Item>
                        ))}
                      </ChakraSelect.Content>
                    </ChakraSelect.Positioner>
                  </ChakraSelect.Root>

                  <ChakraSelect.Root
                    collection={createListCollection({
                      items: statusOptions,
                      itemToString: (item) => item.label,
                      itemToValue: (item) => item.value,
                    })}
                    value={[selectedStatus]}
                    onValueChange={(e) => setSelectedStatus(e.value[0])}
                    size="sm"
                    width="150px"
                    positioning={{ sameWidth: true }}
                  >
                    <ChakraSelect.Trigger bg="white" borderColor="#D1D5DB" borderRadius="6px" height="40px">
                      <ChakraSelect.ValueText placeholder="Status" />
                    </ChakraSelect.Trigger>
                    <ChakraSelect.Positioner>
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
                    </ChakraSelect.Positioner>
                  </ChakraSelect.Root>
                </>
              )}

              {activeTab === 'Counterparties' && (
                <ChakraSelect.Root
                  collection={createListCollection({
                    items: sectorOptions,
                    itemToString: (item) => item.label,
                    itemToValue: (item) => item.value,
                  })}
                  value={[selectedSector]}
                  onValueChange={(e) => setSelectedSector(e.value[0])}
                  size="sm"
                  width="180px"
                  positioning={{ sameWidth: true }}
                >
                  <ChakraSelect.Trigger bg="white" borderColor="#D1D5DB" borderRadius="6px" height="40px">
                    <ChakraSelect.ValueText placeholder="Category" />
                  </ChakraSelect.Trigger>
                  <ChakraSelect.Positioner>
                    <ChakraSelect.Content
                      bg="white"
                      borderRadius="8px"
                      boxShadow="lg"
                      zIndex={1500}
                      position="absolute"
                      maxHeight="250px"
                      overflowY="auto"
                    >
                      {sectorOptions.map((option: any) => (
                        <ChakraSelect.Item key={option.value} item={option}>
                          {option.label}
                        </ChakraSelect.Item>
                      ))}
                    </ChakraSelect.Content>
                  </ChakraSelect.Positioner>
                </ChakraSelect.Root>
              )}

              {/* Activity log date filters */}
              {activeTab === 'Activity log' && (
                <>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start Date"
                    maxW="180px"
                    size="sm"
                    bg="white"
                    borderColor="#D1D5DB"
                    _hover={{ borderColor: '#9CA3AF' }}
                    _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                    borderRadius="6px"
                    height="40px"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="End Date"
                    maxW="180px"
                    size="sm"
                    bg="white"
                    borderColor="#D1D5DB"
                    _hover={{ borderColor: '#9CA3AF' }}
                    _focus={{ borderColor: '#227CBF', boxShadow: 'none' }}
                    borderRadius="6px"
                    height="40px"
                  />
                </>
              )}

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <ChakraButton
                  bg="white"
                  color="#666"
                  fontSize="13px"
                  fontWeight="500"
                  px={4}
                  h="40px"
                  borderRadius="6px"
                  border="1px solid #D1D5DB"
                  _hover={{ bg: '#F9FAFB', borderColor: '#9CA3AF' }}
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </ChakraButton>
              )}
            </HStack>

            {/* Add Button */}
            {activeTab !== 'Activity log' && (
              <Button
                bg="#227CBF"
                color="white"
                fontSize="14px"
                fontWeight="500"
                px={6}
                h="40px"
                borderRadius="6px"
                _hover={{ bg: '#1B6AA3' }}
                onClick={() => {
                  if (activeTab === 'Employees') setShowAddUserModal(true);
                  else if (activeTab === 'Departments') setShowAddDepartmentModal(true);
                  else if (activeTab === 'Counterparties') setShowAddCounterpartyModal(true);
                  else if (activeTab === 'Categories') setShowAddSectorModal(true);
                }}
              >
                + Add {
                  activeTab === 'Employees' ? 'User' :
                  activeTab === 'Counterparties' ? 'Counterparty' :
                  activeTab === 'Categories' ? 'Category' :
                  activeTab.slice(0, -1)
                }
              </Button>
            )}

            {/* Download CSV Button for Activity Log */}
            {activeTab === 'Activity log' && (
              <ChakraButton
                bg="#227CBF"
                color="white"
                fontSize="14px"
                fontWeight="500"
                px={6}
                h="40px"
                borderRadius="6px"
                _hover={{ bg: '#1B6AA3' }}
                onClick={handleDownloadActivityLogCSV}
                disabled={isLoadingActivityLogs}
              >
                <FiDownload style={{ marginRight: '8px' }} />
                Download CSV
              </ChakraButton>
            )}
          </HStack>

          {/* Table */}
          <Box overflowX="auto">
            {isLoading ? (
              <Box textAlign="center" py={8}>
                <Text color="#666">Loading...</Text>
              </Box>
            ) : paginatedData.length === 0 ? (
              <VStack py={12} gap={3}>
                <Text fontSize="16px" fontWeight="600" color="#333">
                  No {activeTab} Found
                </Text>
                <Text fontSize="14px" color="#666" textAlign="center" maxW="500px">
                  {hasActiveFilters
                    ? `No ${activeTab.toLowerCase()} match your current filters. Try adjusting your search criteria or click "Clear Filters" to see all ${activeTab.toLowerCase()}.`
                    : `No ${activeTab.toLowerCase()} available. ${activeTab !== 'Activity log' ? `Click "Add ${activeTab === 'Employees' ? 'User' : activeTab === 'Counterparties' ? 'Counterparty' : activeTab === 'Categories' ? 'Category' : activeTab.slice(0, -1)}" to create one.` : ''}`}
                </Text>
              </VStack>
            ) : (
              <>
                {/* Table Header */}
                <Box bg="#E2EEFE" borderRadius="8px" px={4} py={3} mb={2} display={{ base: 'none', md: 'block' }}>
                  <HStack>
                    <Box w="60px">
                      <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                        S/N
                      </Text>
                    </Box>
                    {activeTab === 'Employees' && (
                      <>
                        <Box flex="1">
                          <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                            Name
                          </Text>
                        </Box>
                        <Box flex="1">
                          <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                            Email
                          </Text>
                        </Box>
                        <Box flex="1">
                          <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                            Department
                          </Text>
                        </Box>
                        <Box w="120px" textAlign="center">
                          <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                            Role
                          </Text>
                        </Box>
                        <Box w="100px" textAlign="center">
                          <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                            Status
                          </Text>
                        </Box>
                        <Box w="180px" textAlign="center">
                          <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                            Actions
                          </Text>
                        </Box>
                      </>
                    )}
                    {(activeTab === 'Departments' || activeTab === 'Categories') && (
                      <>
                        <Box flex="1">
                          <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                            Name
                          </Text>
                        </Box>
                        <Box flex="2">
                          <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                            Description
                          </Text>
                        </Box>
                        <Box w="180px" textAlign="center">
                          <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                            Actions
                          </Text>
                        </Box>
                      </>
                    )}
                    {activeTab === 'Counterparties' && (
                      <>
                        <Box flex="1">
                          <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                            Name
                          </Text>
                        </Box>
                        <Box flex="1">
                          <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                            Category
                          </Text>
                        </Box>
                        <Box w="100px" textAlign="center">
                          <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                            Conflicts
                          </Text>
                        </Box>
                        <Box w="180px" textAlign="center">
                          <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                            Actions
                          </Text>
                        </Box>
                      </>
                    )}
                    {activeTab === 'Activity log' && (
                      <>
                        <Box flex="1">
                          <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                            Initiator
                          </Text>
                        </Box>
                        <Box flex="2">
                          <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                            Action
                          </Text>
                        </Box>
                        <Box flex="1">
                          <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                            Date/Time
                          </Text>
                        </Box>
                      </>
                    )}
                  </HStack>
                </Box>

                {/* Table Body */}
                <VStack gap={2} align="stretch">
                  {paginatedData.map((item: any, index) => (
                    <Box
                      key={item.id || item._id || index}
                      bg={index % 2 === 0 ? 'white' : '#F9FAFB'}
                      borderRadius="8px"
                      px={4}
                      py={3}
                      _hover={{ bg: '#F5F7FA' }}
                      transition="background 0.2s"
                    >
                      <HStack display={{ base: 'none', md: 'flex' }}>
                        <Box w="60px">
                          <Text fontSize="13px" color="#333">
                            {startIndex + index + 1}
                          </Text>
                        </Box>

                        {activeTab === 'Employees' && (
                          <>
                            <Box flex="1">
                              <Text fontSize="13px" color="#333">
                                {item.firstName} {item.lastName}
                              </Text>
                            </Box>
                            <Box flex="1">
                              <Text fontSize="13px" color="#333">
                                {item.email}
                              </Text>
                            </Box>
                            <Box flex="1">
                              <Text fontSize="13px" color="#333">
                                {item.department?.name || 'N/A'}
                              </Text>
                            </Box>
                            <Box w="120px" textAlign="center">
                              <Text fontSize="13px" color="#333">
                                {item.role === 1 ? 'Employee' : item.role === 3 ? 'Admin' : item.role === 4 ? 'IT Admin' : item.role === 5 ? 'Operations' : item.role === 6 ? 'Compliance' : item.role === 7 ? 'Head of Compliance' : 'Unknown'}
                              </Text>
                            </Box>
                            <Box w="100px" textAlign="center">
                              <Box
                                as="span"
                                px={3}
                                py={1}
                                borderRadius="12px"
                                bg={item.status === 1 ? '#E8F5E9' : '#FFEBEE'}
                                color={item.status === 1 ? '#2E7D32' : '#C62828'}
                                fontSize="12px"
                                fontWeight="500"
                              >
                                {item.status === 1 ? 'Active' : item.status === 2 ? 'Inactive' : 'Unknown'}
                              </Box>
                            </Box>
                            <Box w="180px" textAlign="center">
                              <HStack justify="center" gap={2}>
                                <ChakraButton
                                  size="sm"
                                  bg="#FFA726"
                                  color="white"
                                  fontSize="12px"
                                  px={3}
                                  h="32px"
                                  borderRadius="6px"
                                  _hover={{ bg: '#FB8C00' }}
                                  onClick={() => handleEditUser(item)}
                                >
                                  Edit
                                </ChakraButton>
                                <ChakraButton
                                  size="sm"
                                  bg={item.status === 1 ? '#EF5350' : '#66BB6A'}
                                  color="white"
                                  fontSize="12px"
                                  px={3}
                                  h="32px"
                                  borderRadius="6px"
                                  _hover={{ bg: item.status === 1 ? '#E53935' : '#4CAF50' }}
                                  onClick={() => handleToggleUserStatus(item.id, item.status)}
                                >
                                  {item.status === 1 ? 'Deactivate' : 'Activate'}
                                </ChakraButton>
                                <ChakraButton
                                  size="sm"
                                  bg="#EF5350"
                                  color="white"
                                  fontSize="12px"
                                  px={3}
                                  h="32px"
                                  borderRadius="6px"
                                  _hover={{ bg: '#E53935' }}
                                  onClick={() => handleDeleteUser(item.id)}
                                >
                                  Delete
                                </ChakraButton>
                              </HStack>
                            </Box>
                          </>
                        )}

                        {(activeTab === 'Departments' || activeTab === 'Categories') && (
                          <>
                            <Box flex="1">
                              <Text fontSize="13px" color="#333">
                                {item.name}
                              </Text>
                            </Box>
                            <Box flex="2">
                              <Text fontSize="13px" color="#333">
                                {item.description || 'N/A'}
                              </Text>
                            </Box>
                            <Box w="180px" textAlign="center">
                              <HStack justify="center" gap={2}>
                                <ChakraButton
                                  size="sm"
                                  bg="#FFA726"
                                  color="white"
                                  fontSize="12px"
                                  px={4}
                                  h="32px"
                                  borderRadius="6px"
                                  _hover={{ bg: '#FB8C00' }}
                                  onClick={() =>
                                    activeTab === 'Departments'
                                      ? handleEditDepartment(item)
                                      : handleEditSector(item)
                                  }
                                >
                                  Edit
                                </ChakraButton>
                                <ChakraButton
                                  size="sm"
                                  bg="#EF5350"
                                  color="white"
                                  fontSize="12px"
                                  px={4}
                                  h="32px"
                                  borderRadius="6px"
                                  _hover={{ bg: '#E53935' }}
                                  onClick={() =>
                                    activeTab === 'Departments'
                                      ? handleDeleteDepartment(item.id)
                                      : handleDeleteSector(item.id)
                                  }
                                >
                                  Delete
                                </ChakraButton>
                              </HStack>
                            </Box>
                          </>
                        )}

                        {activeTab === 'Counterparties' && (
                          <>
                            <Box flex="1">
                              <Text fontSize="13px" color="#333">
                                {item.name}
                              </Text>
                            </Box>
                            <Box flex="1">
                              <Text fontSize="13px" color="#333">
                                {item.sectorName || 'N/A'}
                              </Text>
                            </Box>
                            <Box w="100px" textAlign="center">
                              <Text fontSize="13px" color="#333">
                                {item.conflictCount || 0}
                              </Text>
                            </Box>
                            <Box w="180px" textAlign="center">
                              <HStack justify="center" gap={2}>
                                <ChakraButton
                                  size="sm"
                                  bg="#FFA726"
                                  color="white"
                                  fontSize="12px"
                                  px={4}
                                  h="32px"
                                  borderRadius="6px"
                                  _hover={{ bg: '#FB8C00' }}
                                  onClick={() => handleEditCounterparty(item)}
                                >
                                  Edit
                                </ChakraButton>
                                <ChakraButton
                                  size="sm"
                                  bg="#EF5350"
                                  color="white"
                                  fontSize="12px"
                                  px={4}
                                  h="32px"
                                  borderRadius="6px"
                                  _hover={{ bg: '#E53935' }}
                                  onClick={() => handleDeleteCounterparty(item.id)}
                                >
                                  Delete
                                </ChakraButton>
                              </HStack>
                            </Box>
                          </>
                        )}

                        {activeTab === 'Activity log' && (
                          <>
                            <Box flex="1">
                              <Text fontSize="13px" color="#333">
                                {item.initiator || 'N/A'}
                              </Text>
                            </Box>
                            <Box flex="2">
                              <VStack align="start" gap={1}>
                                <Text fontSize="13px" fontWeight="600" color="#333">
                                  {item.action || 'N/A'}
                                </Text>
                                {item.details && parseActivityDetails(item.details) && (
                                  <Text fontSize="12px" color="#666">
                                    {parseActivityDetails(item.details)}
                                  </Text>
                                )}
                              </VStack>
                            </Box>
                            <Box flex="1">
                              <Text fontSize="13px" color="#333">
                                {item.createdAt
                                  ? new Date(item.createdAt).toLocaleString('en-US', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
                                    })
                                  : 'N/A'}
                              </Text>
                            </Box>
                          </>
                        )}
                      </HStack>

                      {/* Mobile view */}
                      <VStack align="stretch" gap={2} display={{ base: 'flex', md: 'none' }}>
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          #{startIndex + index + 1}
                        </Text>
                        {activeTab === 'Employees' && (
                          <>
                            <Text fontSize="14px" fontWeight="600" color="#333">
                              {item.firstName} {item.lastName}
                            </Text>
                            <Text fontSize="13px" color="#666">
                              {item.email}
                            </Text>
                            <Text fontSize="13px" color="#666">
                              Dept: {item.department?.name || 'N/A'}
                            </Text>
                            <Text fontSize="13px" color="#666">
                              Role: {item.role === 1 ? 'Employee' : item.role === 3 ? 'Admin' : item.role === 4 ? 'IT Admin' : item.role === 5 ? 'Operations' : item.role === 6 ? 'Compliance' : item.role === 7 ? 'Head of Compliance' : 'Unknown'}
                            </Text>
                            <HStack gap={2}>
                              <Box
                                as="span"
                                px={3}
                                py={1}
                                borderRadius="12px"
                                bg={item.status === 1 ? '#E8F5E9' : '#FFEBEE'}
                                color={item.status === 1 ? '#2E7D32' : '#C62828'}
                                fontSize="12px"
                                fontWeight="500"
                              >
                                {item.status === 1 ? 'Active' : item.status === 2 ? 'Inactive' : 'Unknown'}
                              </Box>
                            </HStack>
                            <HStack gap={2} mt={2}>
                              <ChakraButton
                                size="sm"
                                bg="#FFA726"
                                color="white"
                                fontSize="12px"
                                flex="1"
                                h="36px"
                                borderRadius="6px"
                                _hover={{ bg: '#FB8C00' }}
                                onClick={() => handleEditUser(item)}
                              >
                                Edit
                              </ChakraButton>
                              <ChakraButton
                                size="sm"
                                bg={item.status === 1 ? '#EF5350' : '#66BB6A'}
                                color="white"
                                fontSize="12px"
                                flex="1"
                                h="36px"
                                borderRadius="6px"
                                _hover={{ bg: item.status === 1 ? '#E53935' : '#4CAF50' }}
                                onClick={() => handleToggleUserStatus(item.id, item.status)}
                              >
                                {item.status === 1 ? 'Deactivate' : 'Activate'}
                              </ChakraButton>
                              <ChakraButton
                                size="sm"
                                bg="#EF5350"
                                color="white"
                                fontSize="12px"
                                flex="1"
                                h="36px"
                                borderRadius="6px"
                                _hover={{ bg: '#E53935' }}
                                onClick={() => handleDeleteUser(item.id)}
                              >
                                Delete
                              </ChakraButton>
                            </HStack>
                          </>
                        )}
                        {/* Add mobile views for other tabs similarly */}
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </>
            )}
          </Box>

          {/* Pagination */}
          <HStack justify="space-between" mt={6} flexWrap="wrap" gap={4}>
            <HStack gap={2}>
              <Text fontSize="13px" color="#666">
                Showing
              </Text>
              <ChakraSelect.Root
                collection={createListCollection({ items: itemsPerPageOptions })}
                value={[itemsPerPage.toString()]}
                onValueChange={(e) => {
                  setItemsPerPage(Number(e.value[0]));
                  setCurrentPage(1);
                }}
                size="sm"
                width="80px"
              >
                <ChakraSelect.Trigger bg="white" borderColor="#E6E7EC" borderRadius="6px">
                  <ChakraSelect.ValueText />
                </ChakraSelect.Trigger>
                <ChakraSelect.Positioner>
                  <ChakraSelect.Content bg="white" borderRadius="8px" zIndex={1500} position="absolute">
                    {itemsPerPageOptions.map((option) => (
                      <ChakraSelect.Item key={option.value} item={option}>
                        {option.label}
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Positioner>
              </ChakraSelect.Root>
              <Text fontSize="13px" color="#666">
                out of {actualTotalRecords}
              </Text>
            </HStack>

            <HStack gap={1}>
              <ChakraButton
                size="sm"
                minW="32px"
                h="32px"
                bg="white"
                border="1px solid #E6E7EC"
                borderRadius="6px"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                _hover={{ bg: currentPage === 1 ? 'white' : '#F5F5F5' }}
                opacity={currentPage === 1 ? 0.5 : 1}
              >
                <FiChevronLeft />
              </ChakraButton>

              {renderPageNumbers.map((page, index) =>
                page === '...' ? (
                  <Text key={`ellipsis-${index}`} px={2} color="#666">
                    ...
                  </Text>
                ) : (
                  <ChakraButton
                    key={page}
                    size="sm"
                    minW="32px"
                    h="32px"
                    bg={currentPage === page ? '#227CBF' : 'white'}
                    color={currentPage === page ? 'white' : '#333'}
                    border="1px solid"
                    borderColor={currentPage === page ? '#227CBF' : '#E6E7EC'}
                    borderRadius="6px"
                    onClick={() => setCurrentPage(page as number)}
                    _hover={{ bg: currentPage === page ? '#227CBF' : '#F5F5F5' }}
                  >
                    {page}
                  </ChakraButton>
                )
              )}

              <ChakraButton
                size="sm"
                minW="32px"
                h="32px"
                bg="white"
                border="1px solid #E6E7EC"
                borderRadius="6px"
                disabled={currentPage === actualTotalPages}
                onClick={() => setCurrentPage((p) => Math.min(actualTotalPages, p + 1))}
                _hover={{ bg: currentPage === actualTotalPages ? 'white' : '#F5F5F5' }}
                opacity={currentPage === actualTotalPages ? 0.5 : 1}
              >
                <FiChevronRight />
              </ChakraButton>
            </HStack>
          </HStack>
        </Box>

        {/* Add/Edit User Modal */}
        {(showAddUserModal || showEditUserModal) && (
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
            onClick={() => {
              setShowAddUserModal(false);
              setShowEditUserModal(false);
              setUserToEdit(null);
              setNewUser({ firstName: '', lastName: '', email: '', departmentId: '', role: 1 });
            }}
          >
            <Box
              bg="white"
              borderRadius="12px"
              p={6}
              maxW="500px"
              w="90%"
              maxH="90vh"
              overflowY="auto"
              boxShadow="xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Text fontSize="18px" fontWeight="600" mb={4}>
                {showEditUserModal ? 'Edit User' : 'Add New User'}
              </Text>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text fontSize="13px" fontWeight="500" mb={1}>
                    First Name*
                  </Text>
                  <Input
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    placeholder="Enter first name"
                  />
                </Box>
                <Box>
                  <Text fontSize="13px" fontWeight="500" mb={1}>
                    Last Name*
                  </Text>
                  <Input
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    placeholder="Enter last name"
                  />
                </Box>
                <Box>
                  <Text fontSize="13px" fontWeight="500" mb={1}>
                    Email*
                  </Text>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </Box>
                <Box>
                  <Text fontSize="13px" fontWeight="500" mb={1}>
                    Department*
                  </Text>
                  <select
                    value={newUser.departmentId}
                    onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                    required
                  >
                    <option value="" disabled>Select department</option>
                    {allDepartmentsData?.data?.result?.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </Box>
                <Box>
                  <Text fontSize="13px" fontWeight="500" mb={1}>
                    Role*
                  </Text>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                    required
                  >
                    <option value={1}>Employee</option>
                    <option value={3}>Admin</option>
                    <option value={4}>IT Admin</option>
                    <option value={5}>Operations</option>
                    <option value={6}>Compliance</option>
                    <option value={7}>Head of Compliance</option>
                  </select>
                </Box>
                <HStack gap={3} mt={4}>
                  <Button
                    flex="1"
                    bg="#E0E0E0"
                    color="#666"
                    _hover={{ bg: '#D0D0D0' }}
                    onClick={() => {
                      setShowAddUserModal(false);
                      setShowEditUserModal(false);
                      setUserToEdit(null);
                      setNewUser({ firstName: '', lastName: '', email: '', departmentId: '', role: 1 });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    flex="1"
                    bg="#227CBF"
                    color="white"
                    _hover={{ bg: '#1B6AA3' }}
                    onClick={showEditUserModal ? handleUpdateUser : handleAddUser}
                    disabled={isCreatingUser || isUpdatingUser}
                  >
                    {isCreatingUser || isUpdatingUser ? 'Saving...' : showEditUserModal ? 'Update' : 'Create'}
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}

        {/* Add/Edit Department Modal */}
        {(showAddDepartmentModal || showEditDepartmentModal) && (
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
            onClick={() => {
              setShowAddDepartmentModal(false);
              setShowEditDepartmentModal(false);
              setDepartmentToEdit(null);
              setNewDepartment({ name: '', description: '', code: '' });
            }}
          >
            <Box
              bg="white"
              borderRadius="12px"
              p={6}
              maxW="500px"
              w="90%"
              boxShadow="xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Text fontSize="18px" fontWeight="600" mb={4}>
                {showEditDepartmentModal ? 'Edit Department' : 'Add New Department'}
              </Text>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text fontSize="13px" fontWeight="500" mb={1}>
                    Name*
                  </Text>
                  <Input
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                    placeholder="Enter department name"
                  />
                </Box>
                <Box>
                  <Text fontSize="13px" fontWeight="500" mb={1}>
                    Code
                  </Text>
                  <Input
                    value={newDepartment.code}
                    onChange={(e) => setNewDepartment({ ...newDepartment, code: e.target.value })}
                    placeholder="Enter department code"
                  />
                </Box>
                <Box>
                  <Text fontSize="13px" fontWeight="500" mb={1}>
                    Description
                  </Text>
                  <Textarea
                    value={newDepartment.description}
                    onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                    placeholder="Enter description"
                    rows={3}
                  />
                </Box>
                <HStack gap={3} mt={4}>
                  <Button
                    flex="1"
                    bg="#E0E0E0"
                    color="#666"
                    _hover={{ bg: '#D0D0D0' }}
                    onClick={() => {
                      setShowAddDepartmentModal(false);
                      setShowEditDepartmentModal(false);
                      setDepartmentToEdit(null);
                      setNewDepartment({ name: '', description: '', code: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    flex="1"
                    bg="#227CBF"
                    color="white"
                    _hover={{ bg: '#1B6AA3' }}
                    onClick={showEditDepartmentModal ? handleUpdateDepartment : handleAddDepartment}
                    disabled={isCreatingDepartment || isUpdatingDepartment}
                  >
                    {isCreatingDepartment || isUpdatingDepartment ? 'Saving...' : showEditDepartmentModal ? 'Update' : 'Create'}
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}

        {/* Add/Edit Counterparty Modal */}
        {(showAddCounterpartyModal || showEditCounterpartyModal) && (
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
            onClick={() => {
              setShowAddCounterpartyModal(false);
              setShowEditCounterpartyModal(false);
              setCounterpartyToEdit(null);
              setNewCounterparty({ name: '', sectorId: '' });
            }}
          >
            <Box
              bg="white"
              borderRadius="12px"
              p={6}
              maxW="500px"
              w="90%"
              boxShadow="xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Text fontSize="18px" fontWeight="600" mb={4}>
                {showEditCounterpartyModal ? 'Edit Counterparty' : 'Add New Counterparty'}
              </Text>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text fontSize="13px" fontWeight="500" mb={1}>
                    Name*
                  </Text>
                  <Input
                    value={newCounterparty.name}
                    onChange={(e) => setNewCounterparty({ ...newCounterparty, name: e.target.value })}
                    placeholder="Enter counterparty name"
                  />
                </Box>
                <Box>
                  <Text fontSize="13px" fontWeight="500" mb={1}>
                    Category*
                  </Text>
                  <select
                    value={newCounterparty.sectorId}
                    onChange={(e) => setNewCounterparty({ ...newCounterparty, sectorId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '14px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                    required
                  >
                    <option value="" disabled>Select category</option>
                    {sectorOptionsForCreate.map((option: any) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Box>
                <HStack gap={3} mt={4}>
                  <Button
                    flex="1"
                    bg="#E0E0E0"
                    color="#666"
                    _hover={{ bg: '#D0D0D0' }}
                    onClick={() => {
                      setShowAddCounterpartyModal(false);
                      setShowEditCounterpartyModal(false);
                      setCounterpartyToEdit(null);
                      setNewCounterparty({ name: '', sectorId: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    flex="1"
                    bg="#227CBF"
                    color="white"
                    _hover={{ bg: '#1B6AA3' }}
                    onClick={showEditCounterpartyModal ? handleUpdateCounterparty : handleAddCounterparty}
                    disabled={isCreatingCounterparty || isUpdatingCounterparty}
                  >
                    {isCreatingCounterparty || isUpdatingCounterparty ? 'Saving...' : showEditCounterpartyModal ? 'Update' : 'Create'}
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}

        {/* Add/Edit Sector Modal */}
        {(showAddSectorModal || showEditSectorModal) && (
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
            onClick={() => {
              setShowAddSectorModal(false);
              setShowEditSectorModal(false);
              setSectorToEdit(null);
              setNewSector({ name: '', description: '', isActive: true });
            }}
          >
            <Box
              bg="white"
              borderRadius="12px"
              p={6}
              maxW="500px"
              w="90%"
              boxShadow="xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Text fontSize="18px" fontWeight="600" mb={4}>
                {showEditSectorModal ? 'Edit Category' : 'Add New Category'}
              </Text>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text fontSize="13px" fontWeight="500" mb={1}>
                    Name*
                  </Text>
                  <Input
                    value={newSector.name}
                    onChange={(e) => setNewSector({ ...newSector, name: e.target.value })}
                    placeholder="Enter category name"
                  />
                </Box>
                <Box>
                  <Text fontSize="13px" fontWeight="500" mb={1}>
                    Description
                  </Text>
                  <Textarea
                    value={newSector.description}
                    onChange={(e) => setNewSector({ ...newSector, description: e.target.value })}
                    placeholder="Enter description"
                    rows={3}
                  />
                </Box>
                <HStack gap={3} mt={4}>
                  <Button
                    flex="1"
                    bg="#E0E0E0"
                    color="#666"
                    _hover={{ bg: '#D0D0D0' }}
                    onClick={() => {
                      setShowAddSectorModal(false);
                      setShowEditSectorModal(false);
                      setSectorToEdit(null);
                      setNewSector({ name: '', description: '', isActive: true });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    flex="1"
                    bg="#227CBF"
                    color="white"
                    _hover={{ bg: '#1B6AA3' }}
                    onClick={showEditSectorModal ? handleUpdateSector : handleAddSector}
                    disabled={isCreatingSector || isUpdatingSector}
                  >
                    {isCreatingSector || isUpdatingSector ? 'Saving...' : showEditSectorModal ? 'Update' : 'Create'}
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        )}

        {/* Delete Confirmation Modal */}
        {(showDeleteModal || showDeleteDepartmentModal || showDeleteCounterpartyModal || showDeleteSectorModal) && (
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
            onClick={() => {
              setShowDeleteModal(false);
              setShowDeleteDepartmentModal(false);
              setShowDeleteCounterpartyModal(false);
              setShowDeleteSectorModal(false);
            }}
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
              <Text fontSize="18px" fontWeight="600" mb={4}>
                Confirm Delete
              </Text>
              <Text fontSize="14px" color="#666" mb={6}>
                Are you sure you want to delete this {activeTab === 'Employees' ? 'user' : activeTab.slice(0, -1).toLowerCase()}? This action cannot be undone.
              </Text>
              <HStack gap={3}>
                <Button
                  flex="1"
                  bg="#E0E0E0"
                  color="#666"
                  _hover={{ bg: '#D0D0D0' }}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setShowDeleteDepartmentModal(false);
                    setShowDeleteCounterpartyModal(false);
                    setShowDeleteSectorModal(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  flex="1"
                  bg="#EF5350"
                  color="white"
                  _hover={{ bg: '#E53935' }}
                  onClick={
                    showDeleteModal
                      ? confirmDeleteUser
                      : showDeleteDepartmentModal
                      ? confirmDeleteDepartment
                      : showDeleteCounterpartyModal
                      ? confirmDeleteCounterparty
                      : confirmDeleteSector
                  }
                  disabled={isDeletingUser || isDeletingDepartment || isDeletingCounterparty || isDeletingSector}
                >
                  {isDeletingUser || isDeletingDepartment || isDeletingCounterparty || isDeletingSector ? 'Deleting...' : 'Delete'}
                </Button>
              </HStack>
            </Box>
          </Box>
        )}
      </Box>
    </AdminLayout>
  );
};

export default SettingsPage;
