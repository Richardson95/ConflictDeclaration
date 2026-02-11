'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Input,
  Select as ChakraSelect,
  createListCollection,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Button as ChakraButton,
  Heading,
} from '@chakra-ui/react';
import { Button } from '@/components/ui';
import AdminLayout from '@/lib/layout/AdminLayout';
import { FiChevronDown } from 'react-icons/fi';
import { LuDownload } from 'react-icons/lu';
import { useGetCounterpartiesQuery, useCreateCounterpartyMutation, useUpdateCounterpartyMutation, useDeleteCounterpartyMutation } from '@/lib/redux/services/counterparty.service';
import { useGetCounterpartyConflictSummaryQuery, useDownloadCounterpartyConflictSummaryMutation, useSendBroadcastEmailMutation } from '@/lib/redux/services/dashboard.service';
import { useGetActiveSectorsQuery } from '@/lib/redux/services/sector.service';
import { useGetDeclarationsQuery } from '@/lib/redux/services/declaration.service';
import { useGetCurrentUserQuery } from '@/lib/redux/services/auth.service';
import { canViewConflictDetails, isITAdmin, isLeadership, UserRole } from '@/lib/constants/roles';
import { toaster } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';

const CounterpartiesPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('');

  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [selectedCounterparty, setSelectedCounterparty] = useState<any>(null);
  const [showStatement, setShowStatement] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  // Manage mode state
  const [isManageMode, setIsManageMode] = useState(false);
  const [showAddCounterpartyModal, setShowAddCounterpartyModal] = useState(false);
  const [showEditCounterpartyModal, setShowEditCounterpartyModal] = useState(false);
  const [counterpartyToEdit, setCounterpartyToEdit] = useState<any>(null);
  const [showDeleteCounterpartyModal, setShowDeleteCounterpartyModal] = useState(false);
  const [counterpartyToDelete, setCounterpartyToDelete] = useState<string | null>(null);
  const [newCounterparty, setNewCounterparty] = useState({ name: '', sectorId: '' });

  // Get current user to check role
  const { data: currentUserData } = useGetCurrentUserQuery();
  const currentUser = currentUserData?.data;
  const userCanViewDetails = canViewConflictDetails(currentUser?.role);
  const canManageCounterparties = isITAdmin(currentUser?.role) || canViewConflictDetails(currentUser?.role) || currentUser?.role === UserRole.ComplianceTeam;

  // Redirect Leadership users to dashboard
  useEffect(() => {
    if (currentUser && isLeadership(currentUser.role)) {
      router.push('/admin');
    }
  }, [currentUser, router]);

  // Year selector
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear];

  // Mutations
  const [downloadReport] = useDownloadCounterpartyConflictSummaryMutation();
  const [sendBroadcastEmail] = useSendBroadcastEmailMutation();
  const [createCounterparty, { isLoading: isCreatingCounterparty }] = useCreateCounterpartyMutation();
  const [updateCounterparty, { isLoading: isUpdatingCounterparty }] = useUpdateCounterpartyMutation();
  const [deleteCounterparty, { isLoading: isDeletingCounterparty }] = useDeleteCounterpartyMutation();

  const handleViewDetails = async (counterparty: any) => {
    setSelectedCounterparty(counterparty);
    setShowStatement(true);

    // Send broadcast email notification
    try {
      const counterpartyName = counterparty.name || counterparty.counterparty || 'Unknown';
      await sendBroadcastEmail({
        subject: 'Conflict of Interest Review Notification',
        body: `Hello Dear Team,<br><br>Kindly note that Risk and Compliance has reviewed the details of the employees who have a conflict with <strong>${counterpartyName}</strong> counterparty today.`,
      });
    } catch (error) {
      console.error('Error sending broadcast email:', error);
    }
  };

  const handleNotifyCompliance = useCallback(() => {
    if (selectedCounterparty) {
      setNotificationSent(true);
    }
  }, [selectedCounterparty]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSector('');

    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedSector;

  const handleDownloadReport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await downloadReport({ format, year: selectedYear }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `counterparty-conflict-summary-${selectedYear}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  // Counterparty CRUD handlers
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
    } catch (error: any) {
      toaster.error({ title: 'Error', description: error?.data?.message || 'Failed to update counterparty' });
    }
  };

  // Fetch counterparty conflict summary from API
  const { data: counterpartiesData, isLoading: isLoadingCounterparties } = useGetCounterpartyConflictSummaryQuery({
    page: currentPage,
    limit: itemsPerPage,
    year: selectedYear,
  });

  // Fetch sectors for filter
  const { data: sectorsData } = useGetActiveSectorsQuery({
    page: 1,
    limit: 100,
  });

  const counterparties = counterpartiesData?.data?.result || [];
  const totalRecords = counterpartiesData?.data?.totalRecords || 0;
  const totalPages = counterpartiesData?.data?.totalPages || 1;

  // Filter options
  const sectorOptions = useMemo(() => {
    if (!sectorsData?.data?.result) return [];
    return sectorsData.data.result.map((sector: any) => ({
      label: sector.name,
      value: sector.name,
    }));
  }, [sectorsData]);

  // Sector options for create/edit modal (uses sector id as value)
  const sectorOptionsForCreate = useMemo(() => {
    if (!sectorsData?.data?.result) return [];
    return sectorsData.data.result.map((sector: any) => ({
      label: sector.name,
      value: sector.id,
    }));
  }, [sectorsData]);

  const sectorCollection = createListCollection({
    items: sectorOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const itemsPerPageOptions = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((num) => ({
    label: num.toString(),
    value: num.toString(),
  }));

  const itemsPerPageCollection = createListCollection({
    items: itemsPerPageOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  // Filter data (client-side filtering for current page)
  const filteredData = useMemo(() => {
    return counterparties.filter((item: any) => {
      const counterpartyName = item.counterparty || item.name || '';
      const sector = item.sector || '';
      const conflicts = item.numberOfConflictsDeclared || item.conflicts || 0;

      const matchesSearch = counterpartyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = !selectedSector || sector === selectedSector;

      return matchesSearch && matchesSector;
    });
  }, [counterparties, searchQuery, selectedSector]);

  // Pagination - using API pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData;

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

  return (
    <AdminLayout hideBackButton={true}>
      <Box px={{ base: 4, md: 6 }} py={6}>
        {/* Header with Year Selector */}
        <HStack justify="space-between" mb={6}>
          <Text fontSize="24px" fontWeight="600" color="#2C3E50">
            Counterparties
          </Text>

          <HStack gap={3}>
            {canManageCounterparties && (
              <ChakraButton
                bg={isManageMode ? '#E0E0E0' : '#227CBF'}
                color={isManageMode ? '#333' : 'white'}
                fontSize="13px"
                fontWeight="500"
                px={4}
                h="40px"
                borderRadius="6px"
                _hover={{ bg: isManageMode ? '#D0D0D0' : '#1B6AA3' }}
                onClick={() => setIsManageMode(!isManageMode)}
              >
                {isManageMode ? 'Done Managing' : 'Manage Counterparties'}
              </ChakraButton>
            )}
          <Box position="relative">
            <MenuRoot>
              <MenuTrigger asChild>
                <HStack
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  px={4}
                  py={2}
                  borderRadius="6px"
                  transition="all 0.2s"
                  bg="white"
                  border="1px solid #E6E7EC"
                  gap={2}
                >
                  <Text fontSize="14px" fontWeight="500" color="#333">
                    {selectedYear}
                  </Text>
                  <FiChevronDown color="#666" />
                </HStack>
              </MenuTrigger>

              <MenuContent
                minW="120px"
                p={1}
                borderRadius="8px"
                boxShadow="lg"
                bg="white"
                position="absolute"
                top="100%"
                right="0"
                mt={1}
                zIndex={1000}
              >
                {yearOptions.map((year) => (
                  <MenuItem
                    key={year}
                    value={year.toString()}
                    fontSize="14px"
                    py={2}
                    px={3}
                    bg={selectedYear === year ? 'gray.100' : 'white'}
                    _hover={{ bg: 'gray.50' }}
                    cursor="pointer"
                    onClick={() => setSelectedYear(year)}
                    borderRadius="4px"
                  >
                    {year}
                  </MenuItem>
                ))}
              </MenuContent>
            </MenuRoot>
          </Box>
          </HStack>
        </HStack>

        {/* Table Section */}
        <Box bg="white" borderRadius="12px" p={6}>
          {/* Add Counterparty Button */}
          {isManageMode && (
            <HStack justify="flex-end" mb={4}>
              <ChakraButton
                bg="#227CBF"
                color="white"
                fontSize="13px"
                fontWeight="500"
                px={5}
                h="40px"
                borderRadius="6px"
                _hover={{ bg: '#1B6AA3' }}
                onClick={() => setShowAddCounterpartyModal(true)}
              >
                + Add Counterparty
              </ChakraButton>
            </HStack>
          )}

          {/* Filters */}
          <HStack
            gap={3}
            mb={6}
            flexWrap="wrap"
            align="center"
          >
            {/* Sector Filter */}
            <Box minW="140px" maxW="180px">
              <ChakraSelect.Root
                collection={sectorCollection}
                size="sm"
                value={[selectedSector]}
                onValueChange={(e) => setSelectedSector(e.value[0])}
              >
                <ChakraSelect.Trigger
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  borderRadius="6px"
                  height="40px"
                >
                  <ChakraSelect.ValueText placeholder="Category" />
                  <ChakraSelect.Indicator />
                </ChakraSelect.Trigger>
                <ChakraSelect.Content
                  bg="white"
                  borderRadius="8px"
                  boxShadow="lg"
                  zIndex={1500}
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
                <Box w="60px">
                  <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                    S/N
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                    Counterparties
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                    Category
                  </Text>
                </Box>
                <Box w="200px" textAlign="center">
                  <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                    Action
                  </Text>
                </Box>
                {isManageMode && (
                  <Box w="180px" textAlign="center">
                    <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                      Manage
                    </Text>
                  </Box>
                )}
              </HStack>
            </Box>

            {/* Table Body - Desktop */}
            <VStack gap={2} display={{ base: 'none', md: 'flex' }}>
              {isLoadingCounterparties ? (
                <Box textAlign="center" py={8}>
                  <Text color="#666">Loading counterparties...</Text>
                </Box>
              ) : paginatedData.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text color="#666">No counterparties found</Text>
                </Box>
              ) : (
                paginatedData.map((item: any, index) => {
                  const counterpartyName = item.counterparty || item.name || 'Unknown';
                  const sector = item.sector || 'N/A';
                  const conflicts = item.numberOfConflictsDeclared || item.conflicts || 0;
                  const declarants = item.conflictDeclarantNames || item.employees || [];

                  return (
                    <Box
                      key={item.id || index}
                      bg={index % 2 === 0 ? 'white' : '#F9FAFB'}
                      borderRadius="8px"
                      px={4}
                      py={3}
                      w="100%"
                      _hover={{ bg: '#F5F7FA' }}
                      transition="background 0.2s"
                    >
                      <HStack>
                        <Box w="60px">
                          <Text fontSize="13px" color="#333">
                            {startIndex + index + 1}
                          </Text>
                        </Box>
                        <Box flex="1">
                          <Text fontSize="13px" color="#333">
                            {counterpartyName}
                          </Text>
                        </Box>
                        <Box flex="1">
                          <Text fontSize="13px" color="#333">
                            {sector}
                          </Text>
                        </Box>
                        <Box w="200px" textAlign="center">
                          {userCanViewDetails ? (
                            <ChakraButton
                              bg="#227CBF"
                              color="white"
                              fontSize="13px"
                              fontWeight="500"
                              px={5}
                              h="36px"
                              borderRadius="6px"
                              _hover={{ bg: '#1B6AA3' }}
                              onClick={() => handleViewDetails({ ...item, name: counterpartyName, employees: declarants, conflicts })}
                            >
                              View Details
                            </ChakraButton>
                          ) : (
                            <Text fontSize="13px" color="#999">-</Text>
                          )}
                        </Box>
                        {isManageMode && (
                          <Box w="180px" textAlign="center">
                            <HStack justify="center" gap={2}>
                              <ChakraButton
                                bg="#F59E0B"
                                color="white"
                                fontSize="12px"
                                fontWeight="500"
                                px={3}
                                h="32px"
                                borderRadius="6px"
                                _hover={{ bg: '#D97706' }}
                                onClick={() => handleEditCounterparty({ id: item.id, name: counterpartyName, sectorId: item.sectorId })}
                              >
                                Edit
                              </ChakraButton>
                              <ChakraButton
                                bg="#EF4444"
                                color="white"
                                fontSize="12px"
                                fontWeight="500"
                                px={3}
                                h="32px"
                                borderRadius="6px"
                                _hover={{ bg: '#DC2626' }}
                                onClick={() => handleDeleteCounterparty(item.id)}
                              >
                                Delete
                              </ChakraButton>
                            </HStack>
                          </Box>
                        )}
                      </HStack>
                    </Box>
                  );
                })
              )}
            </VStack>

            {/* Mobile View */}
            <VStack gap={3} display={{ base: 'flex', md: 'none' }}>
              {isLoadingCounterparties ? (
                <Box textAlign="center" py={8}>
                  <Text color="#666">Loading counterparties...</Text>
                </Box>
              ) : paginatedData.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text color="#666">No counterparties found</Text>
                </Box>
              ) : (
                paginatedData.map((item: any, index) => {
                  const counterpartyName = item.counterparty || item.name || 'Unknown';
                  const sector = item.sector || 'N/A';
                  const conflicts = item.numberOfConflictsDeclared || item.conflicts || 0;
                  const declarants = item.conflictDeclarantNames || item.employees || [];

                  return (
                    <Box
                      key={item.id || index}
                      bg="white"
                      borderRadius="8px"
                      p={4}
                      w="100%"
                      boxShadow="sm"
                    >
                      <VStack align="stretch" gap={3}>
                        <HStack justify="space-between">
                          <Text fontSize="12px" fontWeight="600" color="#666">
                            S/N:
                          </Text>
                          <Text fontSize="13px" color="#333">
                            {startIndex + index + 1}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="12px" fontWeight="600" color="#666">
                            Counterparty:
                          </Text>
                          <Text fontSize="13px" color="#333">
                            {counterpartyName}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="12px" fontWeight="600" color="#666">
                            Category:
                          </Text>
                          <Text fontSize="13px" color="#333">
                            {sector}
                          </Text>
                        </HStack>
                        {userCanViewDetails && (
                          <ChakraButton
                            bg="#227CBF"
                            color="white"
                            fontSize="13px"
                            fontWeight="500"
                            w="100%"
                            h="40px"
                            borderRadius="6px"
                            _hover={{ bg: '#1B6AA3' }}
                            onClick={() => handleViewDetails({ ...item, name: counterpartyName, employees: declarants, conflicts })}
                          >
                            View Details
                          </ChakraButton>
                        )}
                        {isManageMode && (
                          <HStack gap={2}>
                            <ChakraButton
                              bg="#F59E0B"
                              color="white"
                              fontSize="13px"
                              fontWeight="500"
                              flex="1"
                              h="40px"
                              borderRadius="6px"
                              _hover={{ bg: '#D97706' }}
                              onClick={() => handleEditCounterparty({ id: item.id, name: counterpartyName, sectorId: item.sectorId })}
                            >
                              Edit
                            </ChakraButton>
                            <ChakraButton
                              bg="#EF4444"
                              color="white"
                              fontSize="13px"
                              fontWeight="500"
                              flex="1"
                              h="40px"
                              borderRadius="6px"
                              _hover={{ bg: '#DC2626' }}
                              onClick={() => handleDeleteCounterparty(item.id)}
                            >
                              Delete
                            </ChakraButton>
                          </HStack>
                        )}
                      </VStack>
                    </Box>
                  );
                })
              )}
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
                out of {totalRecords}
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
      </Box>

      {/* Disclaimer Modal */}
      {isDisclaimerOpen && (
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
          zIndex="1000"
          onClick={() => setIsDisclaimerOpen(false)}
        >
          <Box
            bg="white"
            borderRadius="16px"
            p={8}
            maxW="500px"
            w="90%"
            boxShadow="2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={6}>
              <Heading fontSize="20px" fontWeight="600" color="#333" textAlign="center">
                Disclaimer
              </Heading>
              <Text fontSize="14px" color="#666" textAlign="center" lineHeight="1.6">
                This activity will be documented as a conflict check conducted on July 7, 2025.
              </Text>
              <Button
                w="100%"
                bg="#47B65C"
                color="white"
                fontSize="14px"
                fontWeight="500"
                h="48px"
                borderRadius="8px"
                _hover={{ bg: '#3DA550' }}
                onClick={() => {
                  setIsDisclaimerOpen(false);
                  setShowStatement(true);
                }}
              >
                Proceed
              </Button>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Conflict Declaration Details Modal */}
      {showStatement && selectedCounterparty && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="flex-start"
          justifyContent="center"
          pt="100px"
          zIndex="1000"
          onClick={() => setShowStatement(false)}
        >
          <Box
            bg="white"
            borderRadius="12px"
            p={6}
            maxW="600px"
            w="90%"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack gap={4} align="stretch">
              {/* Header with Logo and Year */}
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="20px" fontWeight="700" color="#2E7BB4">
                    Infra<Text as="span" color="#47B65C">Credit</Text>
                  </Text>
                </Box>
                <Text fontSize="12px" color="#666">
                  Year: {selectedYear}
                </Text>
              </HStack>

              {/* Title */}
              <Heading fontSize="20px" fontWeight="600" color="#2C3E50" textAlign="center">
                Conflict of Interest Declaration
              </Heading>

              {/* Counterparty Name */}
              <Heading fontSize="18px" fontWeight="600" color="#2E7BB4" textAlign="center">
                {selectedCounterparty.name}
              </Heading>

              {/* Conflict Status */}
              <Box textAlign="center">
                {selectedCounterparty.conflicts > 0 ? (
                  <Box
                    bg="#FF6B47"
                    color="white"
                    fontSize="14px"
                    fontWeight="600"
                    py={2.5}
                    px={5}
                    borderRadius="6px"
                    display="inline-block"
                  >
                    {selectedCounterparty.conflicts} Conflict{selectedCounterparty.conflicts > 1 ? 's' : ''} Declared
                  </Box>
                ) : (
                  <Box
                    bg="#227CBF"
                    color="white"
                    fontSize="14px"
                    fontWeight="600"
                    py={2.5}
                    px={5}
                    borderRadius="6px"
                    display="inline-block"
                  >
                    No Conflict of Interest Declared
                  </Box>
                )}
              </Box>

              {/* Employee Names (only show when conflict exists) */}
              {selectedCounterparty.conflicts > 0 && selectedCounterparty.employees && selectedCounterparty.employees.length > 0 && (
                <VStack gap={3} mt={2}>
                  <Text fontSize="13px" fontWeight="600" color="#666">
                    Employees who declared conflicts:
                  </Text>
                  <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
                    {selectedCounterparty.employees.map((employee: string, index: number) => (
                      <Box
                        key={index}
                        bg="#D4E6F5"
                        color="#2E7BB4"
                        fontSize="13px"
                        fontWeight="500"
                        py={1.5}
                        px={3}
                        borderRadius="6px"
                      >
                        {employee}
                      </Box>
                    ))}
                  </Box>
                </VStack>
              )}

              {/* Declaration Summary */}
              <Box
                bg="#F9FAFB"
                borderRadius="8px"
                p={4}
                mt={2}
              >
                <VStack gap={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="13px" color="#666">Total Declarations:</Text>
                    <Text fontSize="13px" fontWeight="600" color="#333">
                      {selectedCounterparty.conflicts}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="13px" color="#666">Category:</Text>
                    <Text fontSize="13px" fontWeight="600" color="#333">
                      {selectedCounterparty.sector || 'N/A'}
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              {/* Close button */}
              <ChakraButton
                w="100%"
                bg="#E6E7EC"
                color="#333"
                fontSize="14px"
                fontWeight="500"
                h="48px"
                borderRadius="8px"
                _hover={{ bg: '#D1D5DB' }}
                onClick={() => setShowStatement(false)}
              >
                Close
              </ChakraButton>
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
          onClick={() => {
            setShowDeleteCounterpartyModal(false);
            setCounterpartyToDelete(null);
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
              Are you sure you want to delete this counterparty? This action cannot be undone.
            </Text>
            <HStack gap={3}>
              <Button
                flex="1"
                bg="#E0E0E0"
                color="#666"
                _hover={{ bg: '#D0D0D0' }}
                onClick={() => {
                  setShowDeleteCounterpartyModal(false);
                  setCounterpartyToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                flex="1"
                bg="#EF4444"
                color="white"
                _hover={{ bg: '#DC2626' }}
                onClick={confirmDeleteCounterparty}
                disabled={isDeletingCounterparty}
              >
                {isDeletingCounterparty ? 'Deleting...' : 'Delete'}
              </Button>
            </HStack>
          </Box>
        </Box>
      )}
    </AdminLayout>
  );
};

export default CounterpartiesPage;
