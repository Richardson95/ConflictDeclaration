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
} from '@chakra-ui/react';
import AdminLayout from '@/lib/layout/AdminLayout';
import { FiChevronLeft, FiChevronRight, FiChevronDown } from 'react-icons/fi';

// Mock data for the table
const mockCheckHistory = Array.from({ length: 812 }, (_, i) => ({
  id: i + 1,
  employee: [
    'Tari Suoyo',
    'Eleazor Ibrabox',
    'Favour Smadox',
    'Adeoze Nwosu',
    'Zainab Abubakar',
    'Oluwafemiola Owibowo',
    'Simbichukwu Okafur',
    'Chukwudi Ibe',
    'Ibrahim Muriala',
    'Ebisagha Karodo',
  ][i % 10],
  department: ['Finance', 'Compliance', 'Investment', 'Finance', 'Compliance'][
    i % 5
  ],
  counterparty: ['Access Bank', 'Deloitte', 'KPMG', 'Access Bank', 'Deloitte'][
    i % 5
  ],
  date: '25 December, 2024',
}));

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<'check' | 'declaration'>('check');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedCounterparty, setSelectedCounterparty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Year selector
  const currentYear = 2025; // Current year
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const yearOptions = [currentYear - 2, currentYear - 1, currentYear];

  // Create collections for filters
  const employeeOptions = [
    ...Array.from(new Set(mockCheckHistory.map((item) => item.employee))).map(
      (employee) => ({
        label: employee,
        value: employee,
      })
    ),
  ];

  const counterpartyOptions = [
    ...Array.from(
      new Set(mockCheckHistory.map((item) => item.counterparty))
    ).map((counterparty) => ({
      label: counterparty,
      value: counterparty,
    })),
  ];

  const departmentOptions = [
    ...Array.from(new Set(mockCheckHistory.map((item) => item.department))).map(
      (department) => ({
        label: department,
        value: department,
      })
    ),
  ];

  const employeeCollection = createListCollection({
    items: employeeOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const counterpartyCollection = createListCollection({
    items: counterpartyOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const departmentCollection = createListCollection({
    items: departmentOptions,
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

  // Statistics
  const stats = {
    totalEmployees: 24,
    completedDeclarations: 14,
    pendingDeclarations: 10,
    totalCounterparties: 30,
    totalConflicts: 200,
    conflictedCounterparties: 5,
  };

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Filter data
  const filteredData = useMemo(() => {
    return mockCheckHistory.filter((item) => {
      const matchesSearch =
        item.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.counterparty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEmployee =
        !selectedEmployee || item.employee === selectedEmployee;
      const matchesCounterparty =
        !selectedCounterparty || item.counterparty === selectedCounterparty;
      const matchesDepartment =
        !selectedDepartment || item.department === selectedDepartment;

      return (
        matchesSearch &&
        matchesEmployee &&
        matchesCounterparty &&
        matchesDepartment
      );
    });
  }, [
    searchQuery,
    selectedEmployee,
    selectedCounterparty,
    selectedDepartment,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
    <AdminLayout>
      <Box px={{ base: 4, md: 6 }} py={6}>
        {/* Year Selector */}
        <HStack justify="flex-end" mb={4}>
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

        {/* Tabs and Table Section */}
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
                  value={[selectedEmployee]}
                  onValueChange={(e) => setSelectedEmployee(e.value[0])}
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
                    {employeeOptions.map((option) => (
                      <ChakraSelect.Item key={option.value} item={option}>
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
                    value={[selectedCounterparty]}
                    onValueChange={(e) => setSelectedCounterparty(e.value[0])}
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
                      {counterpartyOptions.map((option) => (
                        <ChakraSelect.Item key={option.value} item={option}>
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
              {paginatedData.map((item, index) => (
                <Box
                  key={item.id}
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
                        {activeTab === 'check' ? startIndex + index + 1 : 1}
                      </Text>
                    </Box>
                    <Box flex="1">
                      <Text fontSize="13px" color="#333">
                        {item.employee}
                      </Text>
                    </Box>
                    <Box flex="1">
                      <Text fontSize="13px" color="#333">
                        {item.department}
                      </Text>
                    </Box>
                    {activeTab === 'check' && (
                      <Box flex="1">
                        <Text fontSize="13px" color="#333">
                          {item.counterparty}
                        </Text>
                      </Box>
                    )}
                    <Box flex="1">
                      <Text fontSize="13px" color="#333">
                        {item.date}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              ))}
            </VStack>

            {/* Table Body - Mobile Cards */}
            <VStack gap={3} display={{ base: 'flex', md: 'none' }}>
              {paginatedData.map((item, index) => (
                <Box
                  key={item.id}
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
                        {activeTab === 'check' ? startIndex + index + 1 : 1}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="12px" fontWeight="600" color="#666">
                        Employee:
                      </Text>
                      <Text fontSize="13px" color="#333">
                        {item.employee}
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
                    {activeTab === 'check' && (
                      <HStack justify="space-between">
                        <Text fontSize="12px" fontWeight="600" color="#666">
                          Counterparty:
                        </Text>
                        <Text fontSize="13px" color="#333">
                          {item.counterparty}
                        </Text>
                      </HStack>
                    )}
                    <HStack justify="space-between">
                      <Text fontSize="12px" fontWeight="600" color="#666">
                        Date:
                      </Text>
                      <Text fontSize="13px" color="#333">
                        {item.date}
                      </Text>
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
      </Box>
    </AdminLayout>
  );
};

export default AdminPanel;
