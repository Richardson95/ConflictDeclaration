'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
} from '@chakra-ui/react';
import AdminLayout from '@/lib/layout/AdminLayout';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useGetConflictMetricsQuery } from '@/lib/redux/services/dashboard.service';
import { useGetCounterpartiesQuery, useGetConflictCheckHistoryDetailQuery } from '@/lib/redux/services/counterparty.service';
import { useGetDeclarationsQuery } from '@/lib/redux/services/declaration.service';
import { useGetUsersQuery } from '@/lib/redux/services/employee.service';
import { useGetCurrentUserQuery } from '@/lib/redux/services/auth.service';
import { isLeadership } from '@/lib/constants/roles';

const AdminPanel = () => {
  const router = useRouter();
  const { data: currentUserData } = useGetCurrentUserQuery();
  const currentUser = currentUserData?.data;
  const userIsLeadership = isLeadership(currentUser?.role);
  const [activeTab, setActiveTab] = useState<'check' | 'declaration'>('check');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedCounterparty, setSelectedCounterparty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Year selector
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const yearOptions = [currentYear - 2, currentYear - 1, currentYear];

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  // Fetch ALL conflict check history from API (fetch large dataset for client-side filtering)
  const { data: checkHistoryData, isLoading: isLoadingCheckHistory } = useGetConflictCheckHistoryDetailQuery({
    page: 1,
    limit: 10000, // Fetch all records
    year: selectedYear,
  });

  // Fetch ALL declaration history from API (fetch large dataset for client-side filtering)
  const { data: declarationHistoryData, isLoading: isLoadingDeclarationHistory } = useGetDeclarationsQuery({
    page: 1,
    limit: 10000, // Fetch all records
    year: selectedYear,
  });

  // Fetch dropdown filter options from existing endpoints
  const { data: usersData } = useGetUsersQuery({ page: 1, limit: 1000 });
  const { data: counterpartiesDataForFilter } = useGetCounterpartiesQuery({ page: 1, limit: 1000 });

  // Process ALL data from API
  const allCheckHistory = checkHistoryData?.data?.result || [];
  const allDeclarationHistory = declarationHistoryData?.data?.result || [];

  // Apply client-side filtering
  const filteredCheckHistory = useMemo(() => {
    return allCheckHistory.filter((item: any) => {
      const employee = item.checkDetail?.user?.fullName || item.checkDetail?.checkedByFullName || item.userFullName || item.checkedByFullName || '';
      const counterparty = item.checkDetail?.counterparty?.name || item.counterpartyName || item.counterparty || '';
      const department = item.checkDetail?.user?.department || item.department || item.departmentName || '';

      const matchesEmployee = !selectedEmployee || employee.toLowerCase().includes(selectedEmployee.toLowerCase());
      const matchesCounterparty = !selectedCounterparty || counterparty.toLowerCase().includes(selectedCounterparty.toLowerCase());
      const matchesDepartment = !selectedDepartment || department.toLowerCase().includes(selectedDepartment.toLowerCase());
      const matchesSearch = !searchQuery ||
        employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        department.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesEmployee && matchesCounterparty && matchesDepartment && matchesSearch;
    });
  }, [allCheckHistory, selectedEmployee, selectedCounterparty, selectedDepartment, searchQuery]);

  const filteredDeclarationHistory = useMemo(() => {
    return allDeclarationHistory.filter((item: any) => {
      const employee = item.userName || '';
      const department = item.department || item.departmentName || '';

      const matchesEmployee = !selectedEmployee || employee.toLowerCase().includes(selectedEmployee.toLowerCase());
      const matchesDepartment = !selectedDepartment || department.toLowerCase().includes(selectedDepartment.toLowerCase());
      const matchesSearch = !searchQuery ||
        employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        department.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesEmployee && matchesDepartment && matchesSearch;
    });
  }, [allDeclarationHistory, selectedEmployee, selectedDepartment, searchQuery]);

  // Get filtered data based on active tab
  const filteredData = activeTab === 'check' ? filteredCheckHistory : filteredDeclarationHistory;

  // Client-side pagination
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Create filter options from real endpoints
  const employeeOptions = useMemo(() => {
    const users = usersData?.data?.result || [];
    const uniqueEmployees = Array.from(
      new Set(users.map(u => `${u.firstName} ${u.lastName}`))
    );
    return [
      { label: 'All Employees', value: '' },
      ...uniqueEmployees.map(emp => ({ label: emp, value: emp }))
    ];
  }, [usersData]);

  const departmentOptions = useMemo(() => {
    // Extract unique departments from actual data since Departments table is empty
    const departments = new Set<string>();

    // Get departments from check history
    allCheckHistory.forEach((item: any) => {
      const dept = item.checkDetail?.user?.department || item.department || item.departmentName;
      if (dept) departments.add(dept);
    });

    // Get departments from declaration history
    allDeclarationHistory.forEach((item: any) => {
      const dept = item.department || item.departmentName;
      if (dept) departments.add(dept);
    });

    return [
      { label: 'All Departments', value: '' },
      ...Array.from(departments).sort().map(dept => ({ label: dept, value: dept }))
    ];
  }, [allCheckHistory, allDeclarationHistory]);

  const counterpartyOptions = useMemo(() => {
    const counterparties = counterpartiesDataForFilter?.data || [];
    return [
      { label: 'All Counterparties', value: '' },
      ...counterparties.map(cp => ({ label: cp.name, value: cp.name }))
    ];
  }, [counterpartiesDataForFilter]);

  // Create collections for filters
  const employeeCollection = createListCollection({
    items: employeeOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const departmentCollection = createListCollection({
    items: departmentOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const counterpartyCollection = createListCollection({
    items: counterpartyOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  // Create collections for items per page select
  const itemsPerPageOptions = [10, 20, 50, 100].map((num) => ({
    label: num.toString(),
    value: num.toString(),
  }));

  const itemsPerPageCollection = createListCollection({
    items: itemsPerPageOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  // Fetch conflict metrics from API
  const { data: conflictMetricsData, isLoading: isLoadingMetrics } = useGetConflictMetricsQuery({
    year: selectedYear,
  });

  // Fetch counterparties to get total count
  const { data: counterpartiesData } = useGetCounterpartiesQuery({
    page: 1,
    limit: 1, // Just need the total count
  });

  // Statistics - Using real API data
  // Calculate total conflicts (count of all "yes" conflicts) from declaration data
  const totalConflictsCount = useMemo(() => {
    // Sum up conflictCount from all declarations
    const fromDeclarations = allDeclarationHistory.reduce((sum: number, declaration: any) => {
      return sum + (declaration.conflictCount || 0);
    }, 0);

    // If conflictCount is not available, count from assessments
    if (fromDeclarations === 0 && allDeclarationHistory.length > 0) {
      let count = 0;
      allDeclarationHistory.forEach((declaration: any) => {
        const assessments = declaration.asssessmentDtos || declaration.assessments || [];
        assessments.forEach((assessment: any) => {
          if (assessment.hasConflict === true) {
            count++;
          }
        });
      });
      return count;
    }

    return fromDeclarations;
  }, [allDeclarationHistory]);

  const stats = useMemo(() => {
    const metrics = conflictMetricsData?.data;
    return {
      totalEmployees: metrics?.totalEmployeeCount || 0,
      completedDeclarations: metrics?.totalUsersThatHaveCompletedConflictDeclaration || 0,
      pendingDeclarations: metrics?.totalUsersThatHaveNotCompletedConflictDeclaration || 0,
      totalCounterparties: metrics?.totalNumberOfCounterParties || 0,
      totalConflicts: totalConflictsCount, // Use calculated count from declaration data
      conflictedCounterparties: metrics?.totalNumberOfConflictedCounterParties || 0,
    };
  }, [conflictMetricsData, totalConflictsCount]);

  // Reset pagination and filters when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery('');
    setSelectedEmployee('');
    setSelectedCounterparty('');
    setSelectedDepartment('');
  }, [activeTab]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedEmployee, selectedCounterparty, selectedDepartment, selectedYear, itemsPerPage]);

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
        {/* Back to Dashboard and Year Selector */}
        <HStack justify="flex-end" mb={4} gap={3}>
          <ChakraButton
            onClick={handleBackToDashboard}
            bg="#2E7BB4"
            color="white"
            _hover={{ bg: '#236096' }}
            fontSize="14px"
            fontWeight="500"
            px={4}
            h="40px"
            borderRadius="6px"
            display="flex"
            gap={2}
          >
            <FiArrowLeft size={18} />
            Back to Dashboard
          </ChakraButton>

          <Box position="relative">
            <MenuRoot>
              <MenuTrigger asChild>
                <HStack
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  px={4}
                  h="40px"
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

        {/* Statistics Cards */}
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
          gap={4}
          mb={6}
        >
          {/* Total Employees */}
          <Box
            bg="linear-gradient(135deg, #2E7BB4 0%, #1e5f8f 100%)"
            borderRadius="12px"
            p={6}
            color="white"
            transition="all 0.3s ease"
            _hover={{
              bg: "linear-gradient(135deg, #5CB85C 0%, #4FA84F 100%)",
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
          >
            <Text fontSize="13px" fontWeight="400" mb={2} opacity={0.9}>
              Total Employees
            </Text>
            <Text fontSize="36px" fontWeight="700">
              {stats.totalEmployees}
            </Text>
          </Box>

          {/* Completed Declarations */}
          <Box
            bg="linear-gradient(135deg, #2E7BB4 0%, #1e5f8f 100%)"
            borderRadius="12px"
            p={6}
            color="white"
            transition="all 0.3s ease"
            _hover={{
              bg: "linear-gradient(135deg, #5CB85C 0%, #4FA84F 100%)",
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
          >
            <Text fontSize="13px" fontWeight="400" mb={2} opacity={0.9}>
              Completed Conflict Declaration (Employee)
            </Text>
            <Text fontSize="36px" fontWeight="700">
              {stats.completedDeclarations}
            </Text>
          </Box>

          {/* Pending Declarations */}
          <Box
            bg="linear-gradient(135deg, #2E7BB4 0%, #1e5f8f 100%)"
            borderRadius="12px"
            p={6}
            color="white"
            transition="all 0.3s ease"
            _hover={{
              bg: "linear-gradient(135deg, #5CB85C 0%, #4FA84F 100%)",
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
          >
            <Text fontSize="13px" fontWeight="400" mb={2} opacity={0.9}>
              Pending Conflict Declaration (Employee)
            </Text>
            <Text fontSize="36px" fontWeight="700">
              {stats.pendingDeclarations}
            </Text>
          </Box>

          {/* Total Counterparties */}
          <Box
            bg="linear-gradient(135deg, #2E7BB4 0%, #1e5f8f 100%)"
            borderRadius="12px"
            p={6}
            color="white"
            transition="all 0.3s ease"
            _hover={{
              bg: "linear-gradient(135deg, #5CB85C 0%, #4FA84F 100%)",
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
          >
            <Text fontSize="13px" fontWeight="400" mb={2} opacity={0.9}>
              Total Counterparties
            </Text>
            <Text fontSize="36px" fontWeight="700">
              {stats.totalCounterparties}
            </Text>
          </Box>

          {/* Total Conflicts */}
          <Box
            bg="linear-gradient(135deg, #FF6B47 0%, #e55532 100%)"
            borderRadius="12px"
            p={6}
            color="white"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
          >
            <Text fontSize="13px" fontWeight="400" mb={2} opacity={0.9}>
              Total Conflicts
            </Text>
            <Text fontSize="36px" fontWeight="700">
              {stats.totalConflicts}
            </Text>
          </Box>

          {/* Conflicted Counterparties */}
          <Box
            bg="linear-gradient(135deg, #FF6B47 0%, #e55532 100%)"
            borderRadius="12px"
            p={6}
            color="white"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
          >
            <Text fontSize="13px" fontWeight="400" mb={2} opacity={0.9}>
              Total Conflicted Counterparties
            </Text>
            <Text fontSize="36px" fontWeight="700">
              {stats.conflictedCounterparties}
            </Text>
          </Box>
        </Grid>

        {/* Tabs and Table Section - hidden for Operations role */}
        {!userIsLeadership && (
        <Box bg="white" borderRadius="12px" p={6}>
          {/* Tabs */}
          <HStack gap={0} mb={6} width="100%">
            <Box
              flex="1"
              py={3}
              bg={activeTab === 'check' ? '#2C3E50' : '#E5E7EB'}
              color={activeTab === 'check' ? 'white' : '#666'}
              cursor="pointer"
              onClick={() => setActiveTab('check')}
              fontSize="14px"
              fontWeight="500"
              borderRadius="8px 0 0 8px"
              transition="all 0.2s"
              textAlign="center"
            >
              Conflict Check History
            </Box>
            <Box
              flex="1"
              py={3}
              bg={activeTab === 'declaration' ? '#2C3E50' : '#E5E7EB'}
              color={activeTab === 'declaration' ? 'white' : '#666'}
              cursor="pointer"
              onClick={() => setActiveTab('declaration')}
              fontSize="14px"
              fontWeight="500"
              borderRadius="0 8px 8px 0"
              transition="all 0.2s"
              textAlign="center"
            >
              Conflict Declaration History
            </Box>
          </HStack>

          {/* Filters */}
          <HStack
            gap={3}
            mb={6}
            flexWrap="wrap"
            align="center"
          >
              {/* Employee Filter */}
              <Box minW="140px" maxW="180px">
                <ChakraSelect.Root
                  collection={employeeCollection}
                  size="sm"
                  value={selectedEmployee ? [selectedEmployee] : []}
                  onValueChange={(e) => setSelectedEmployee(e.value[0] || '')}
                >
                  <ChakraSelect.Trigger
                    bg="white"
                    borderColor="#D1D5DB"
                    _hover={{ borderColor: '#9CA3AF' }}
                    borderRadius="6px"
                    height="40px"
                  >
                    <ChakraSelect.ValueText placeholder="Employee" />
                    <ChakraSelect.Indicator />
                  </ChakraSelect.Trigger>
                  <ChakraSelect.Content
                    bg="white"
                    borderRadius="8px"
                    boxShadow="lg"
                    zIndex={1500}
                    position="absolute"
                  >
                    {employeeOptions.map((option, idx) => (
                      <ChakraSelect.Item key={`emp-${idx}`} item={option}>
                        {option.label}
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Root>
              </Box>

              {/* Counterparty Filter - Only show on Check History tab */}
              {activeTab === 'check' && (
                <Box minW="140px" maxW="180px">
                  <ChakraSelect.Root
                    collection={counterpartyCollection}
                    size="sm"
                    value={selectedCounterparty ? [selectedCounterparty] : []}
                    onValueChange={(e) => setSelectedCounterparty(e.value[0] || '')}
                  >
                    <ChakraSelect.Trigger
                      bg="white"
                      borderColor="#D1D5DB"
                      _hover={{ borderColor: '#9CA3AF' }}
                      borderRadius="6px"
                      height="40px"
                    >
                      <ChakraSelect.ValueText placeholder="Counterparty" />
                      <ChakraSelect.Indicator />
                    </ChakraSelect.Trigger>
                    <ChakraSelect.Content
                      bg="white"
                      borderRadius="8px"
                      boxShadow="lg"
                      zIndex={1500}
                      position="absolute"
                    >
                      {counterpartyOptions.map((option, idx) => (
                        <ChakraSelect.Item key={`cp-${idx}`} item={option}>
                          {option.label}
                        </ChakraSelect.Item>
                      ))}
                    </ChakraSelect.Content>
                  </ChakraSelect.Root>
                </Box>
              )}

              {/* Department Filter */}
              <Box minW="140px" maxW="180px">
                <ChakraSelect.Root
                  collection={departmentCollection}
                  size="sm"
                  value={selectedDepartment ? [selectedDepartment] : []}
                  onValueChange={(e) => setSelectedDepartment(e.value[0] || '')}
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
                    {departmentOptions.map((option, idx) => (
                      <ChakraSelect.Item key={`dept-${idx}`} item={option}>
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
              {(searchQuery || selectedEmployee || selectedDepartment || selectedCounterparty) && (
                <Box
                  as="button"
                  px={4}
                  py={2}
                  bg="#F3F4F6"
                  color="#374151"
                  fontSize="13px"
                  fontWeight="500"
                  borderRadius="6px"
                  height="40px"
                  cursor="pointer"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedEmployee('');
                    setSelectedDepartment('');
                    setSelectedCounterparty('');
                  }}
                  _hover={{ bg: '#E5E7EB' }}
                  transition="background 0.2s"
                >
                  Clear Filters
                </Box>
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
                  <Text fontSize="13px" fontWeight="600" color="#333">
                    S/N
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontSize="13px" fontWeight="600" color="#333">
                    Employee
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontSize="13px" fontWeight="600" color="#333">
                    Department
                  </Text>
                </Box>
                {activeTab === 'check' && (
                  <Box flex="1">
                    <Text fontSize="13px" fontWeight="600" color="#333">
                      Counterparty
                    </Text>
                  </Box>
                )}
                <Box flex="1">
                  <Text fontSize="13px" fontWeight="600" color="#333">
                    Date
                  </Text>
                </Box>
              </HStack>
            </Box>

            {/* Table Body - Desktop */}
            <VStack gap={2} display={{ base: 'none', md: 'flex' }}>
              {isLoadingCheckHistory || isLoadingDeclarationHistory ? (
                <Box textAlign="center" py={8}>
                  <Text color="#666">Loading...</Text>
                </Box>
              ) : paginatedData.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text color="#666">No records found for {selectedYear}</Text>
                </Box>
              ) : (
                paginatedData.map((item: any, index) => {
                  const employee = activeTab === 'check'
                    ? (item.checkDetail?.user?.fullName || item.checkDetail?.checkedByFullName || item.userFullName || item.checkedByFullName || 'Unknown')
                    : (item.userName || 'Unknown');
                  const department = activeTab === 'check'
                    ? (item.checkDetail?.user?.department || item.department || item.departmentName || 'N/A')
                    : (item.department || item.departmentName || 'N/A');
                  const counterparty = activeTab === 'check'
                    ? (item.checkDetail?.counterparty?.name || item.counterpartyName || item.counterparty || 'Unknown')
                    : '';
                  const date = activeTab === 'check'
                    ? new Date(item.checkDetail?.checkedAt || item.date || item.checkedAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : new Date(item.submittedAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      });

                  return (
                    <Box
                      key={item.id || item.checkId || index}
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
                            {employee}
                          </Text>
                        </Box>
                        <Box flex="1">
                          <Text fontSize="13px" color="#333">
                            {department}
                          </Text>
                        </Box>
                        {activeTab === 'check' && (
                          <Box flex="1">
                            <Text fontSize="13px" color="#333">
                              {counterparty}
                            </Text>
                          </Box>
                        )}
                        <Box flex="1">
                          <Text fontSize="13px" color="#333">
                            {date}
                          </Text>
                        </Box>
                      </HStack>
                    </Box>
                  );
                })
              )}
            </VStack>

            {/* Table Body - Mobile Cards */}
            <VStack gap={3} display={{ base: 'flex', md: 'none' }}>
              {isLoadingCheckHistory || isLoadingDeclarationHistory ? (
                <Box textAlign="center" py={8}>
                  <Text color="#666">Loading...</Text>
                </Box>
              ) : paginatedData.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text color="#666">No records found for {selectedYear}</Text>
                </Box>
              ) : (
                paginatedData.map((item: any, index) => {
                  const employee = activeTab === 'check'
                    ? (item.checkDetail?.user?.fullName || item.checkDetail?.checkedByFullName || item.userFullName || item.checkedByFullName || 'Unknown')
                    : (item.userName || 'Unknown');
                  const department = activeTab === 'check'
                    ? (item.checkDetail?.user?.department || item.department || item.departmentName || 'N/A')
                    : (item.department || item.departmentName || 'N/A');
                  const counterparty = activeTab === 'check'
                    ? (item.checkDetail?.counterparty?.name || item.counterpartyName || item.counterparty || 'Unknown')
                    : '';
                  const date = activeTab === 'check'
                    ? new Date(item.checkDetail?.checkedAt || item.date || item.checkedAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : new Date(item.submittedAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      });

                  return (
                    <Box
                      key={item.id || item.checkId || index}
                      bg="white"
                      borderRadius="8px"
                      p={4}
                      w="100%"
                      boxShadow="sm"
                    >
                      <VStack align="stretch" gap={2}>
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
                            Employee:
                          </Text>
                          <Text fontSize="13px" color="#333">
                            {employee}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="12px" fontWeight="600" color="#666">
                            Department:
                          </Text>
                          <Text fontSize="13px" color="#333">
                            {department}
                          </Text>
                        </HStack>
                        {activeTab === 'check' && (
                          <HStack justify="space-between">
                            <Text fontSize="12px" fontWeight="600" color="#666">
                              Counterparty:
                            </Text>
                            <Text fontSize="13px" color="#333">
                              {counterparty}
                            </Text>
                          </HStack>
                        )}
                        <HStack justify="space-between">
                          <Text fontSize="12px" fontWeight="600" color="#666">
                            Date:
                          </Text>
                          <Text fontSize="13px" color="#333">
                            {date}
                          </Text>
                        </HStack>
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
                <FiChevronLeft size={16} />
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
                <FiChevronRight size={16} />
              </Box>
            </HStack>
          </HStack>
        </Box>
        )}
      </Box>
    </AdminLayout>
  );
};

export default AdminPanel;
