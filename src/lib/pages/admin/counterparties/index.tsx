'use client';

import React, { useState, useMemo, useCallback } from 'react';
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

// Mock data for counterparties
const baseCounterparties = [
  { name: 'Access Bank', sector: 'Banking', conflicts: 0, hasConflict: false, employees: [] },
  { name: 'Agusto', sector: 'Credit Rating', conflicts: 4, hasConflict: true, employees: ['Seiyefa Oyintare', 'Uzoma Okechukwu', 'Simisola Olowookere', 'Fiyebo Diongoli', 'Kolawole Oyelowo'] },
  { name: 'Auro', sector: 'Technology', conflicts: 4, hasConflict: true, employees: ['John Doe', 'Jane Smith', 'Michael Brown', 'Sarah Wilson'] },
  { name: 'Deloitte', sector: 'Professional Services', conflicts: 4, hasConflict: true, employees: ['David Lee', 'Emily Chen', 'Robert Taylor', 'Lisa Anderson'] },
  { name: 'KPMG', sector: 'Professional Services', conflicts: 4, hasConflict: true, employees: ['James Martin', 'Patricia Garcia', 'Christopher White', 'Jennifer Moore'] },
  { name: 'Access Bank', sector: 'Banking', conflicts: 4, hasConflict: true, employees: ['Daniel Jackson', 'Michelle Thompson', 'Kevin Martinez', 'Amanda Robinson'] },
  { name: 'Agusto', sector: 'Credit Rating', conflicts: 4, hasConflict: true, employees: ['Seiyefa Oyintare', 'Uzoma Okechukwu', 'Simisola Olowookere', 'Fiyebo Diongoli', 'Kolawole Oyelowo'] },
  { name: 'Auro', sector: 'Technology', conflicts: 4, hasConflict: true, employees: ['John Doe', 'Jane Smith', 'Michael Brown', 'Sarah Wilson'] },
  { name: 'Deloitte', sector: 'Professional Services', conflicts: 4, hasConflict: true, employees: ['David Lee', 'Emily Chen', 'Robert Taylor', 'Lisa Anderson'] },
];

const mockCounterparties = Array.from({ length: 512 }, (_, i) => ({
  id: i + 1,
  name: baseCounterparties[i % baseCounterparties.length].name,
  sector: baseCounterparties[i % baseCounterparties.length].sector,
  conflicts: baseCounterparties[i % baseCounterparties.length].conflicts,
  hasConflict: baseCounterparties[i % baseCounterparties.length].hasConflict,
  employees: baseCounterparties[i % baseCounterparties.length].employees,
}));

const CounterpartiesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedConflict, setSelectedConflict] = useState('');
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [selectedCounterparty, setSelectedCounterparty] = useState<typeof mockCounterparties[0] | null>(null);
  const [showStatement, setShowStatement] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  // Year selector
  const currentYear = 2025;
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear];

  const handleNotifyCompliance = useCallback(() => {
    if (selectedCounterparty) {
      console.log('Notifying compliance for:', selectedCounterparty.name);
      setNotificationSent(true);
    }
  }, [selectedCounterparty]);

  // Filter options
  const sectorOptions = [
    ...Array.from(new Set(mockCounterparties.map((item) => item.sector))).map(
      (sector) => ({
        label: sector,
        value: sector,
      })
    ),
  ];

  const conflictOptions = [
    { label: 'Has Conflict', value: 'has' },
    { label: 'No Conflict', value: 'none' },
  ];

  const sectorCollection = createListCollection({
    items: sectorOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const conflictCollection = createListCollection({
    items: conflictOptions,
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
    return mockCounterparties.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = !selectedSector || item.sector === selectedSector;
      const matchesConflict =
        !selectedConflict ||
        (selectedConflict === 'has' && item.conflicts > 0) ||
        (selectedConflict === 'none' && item.conflicts === 0);

      return matchesSearch && matchesSector && matchesConflict;
    });
  }, [searchQuery, selectedSector, selectedConflict]);

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
        {/* Header with Year Selector */}
        <HStack justify="space-between" mb={6}>
          <Text fontSize="24px" fontWeight="600" color="#2C3E50">
            Counterparties
          </Text>

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

        {/* Table Section */}
        <Box bg="white" borderRadius="12px" p={6}>
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
                  <ChakraSelect.ValueText placeholder="Sector" />
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

            {/* Conflict Filter */}
            <Box minW="140px" maxW="180px">
              <ChakraSelect.Root
                collection={conflictCollection}
                size="sm"
                value={[selectedConflict]}
                onValueChange={(e) => setSelectedConflict(e.value[0])}
              >
                <ChakraSelect.Trigger
                  bg="white"
                  borderColor="#D1D5DB"
                  _hover={{ borderColor: '#9CA3AF' }}
                  borderRadius="6px"
                  height="40px"
                >
                  <ChakraSelect.ValueText placeholder="Conflict" />
                  <ChakraSelect.Indicator />
                </ChakraSelect.Trigger>
                <ChakraSelect.Content
                  bg="white"
                  borderRadius="8px"
                  boxShadow="lg"
                  zIndex={1500}
                  position="absolute"
                >
                  {conflictOptions.map((option) => (
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
                    Sector
                  </Text>
                </Box>
                <Box w="200px" textAlign="center">
                  <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                    Action
                  </Text>
                </Box>
                <Box w="100px" textAlign="center">
                  <Text fontSize="13px" fontWeight="600" color="#2E7BB4">
                    Conflicts
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
                        {startIndex + index + 1}
                      </Text>
                    </Box>
                    <Box flex="1">
                      <Text fontSize="13px" color="#333">
                        {item.name}
                      </Text>
                    </Box>
                    <Box flex="1">
                      <Text fontSize="13px" color="#333">
                        {item.sector}
                      </Text>
                    </Box>
                    <Box w="200px" textAlign="center">
                      <ChakraButton
                        bg="#227CBF"
                        color="white"
                        fontSize="13px"
                        fontWeight="500"
                        px={5}
                        h="36px"
                        borderRadius="6px"
                        _hover={{ bg: '#1B6AA3' }}
                        onClick={() => {
                          setSelectedCounterparty(item);
                          setIsDisclaimerOpen(true);
                        }}
                      >
                        Check Conflict
                      </ChakraButton>
                    </Box>
                    <Box w="100px" textAlign="center">
                      <Text fontSize="13px" color="#333">
                        {item.conflicts}
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
                        {startIndex + index + 1}
                      </Text>
                    </HStack>
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
                        Sector:
                      </Text>
                      <Text fontSize="13px" color="#333">
                        {item.sector}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="12px" fontWeight="600" color="#666">
                        Conflicts:
                      </Text>
                      <Text fontSize="13px" color="#333">
                        {item.conflicts}
                      </Text>
                    </HStack>
                    <ChakraButton
                      bg="#227CBF"
                      color="white"
                      fontSize="13px"
                      fontWeight="500"
                      w="100%"
                      h="36px"
                      borderRadius="6px"
                      _hover={{ bg: '#1B6AA3' }}
                      mt={2}
                      onClick={() => {
                        setSelectedCounterparty(item);
                        setIsDisclaimerOpen(true);
                      }}
                    >
                      Check Conflict
                    </ChakraButton>
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

      {/* Conflict Statement Modal */}
      {showStatement && selectedCounterparty && (
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
              {/* Header with Logo and ID */}
              <HStack justify="space-between">
                <Box>
                  {/* Logo placeholder - replace with actual logo */}
                  <Text fontSize="20px" fontWeight="700" color="#2E7BB4">
                    Infra<Text as="span" color="#47B65C">Credit</Text>
                  </Text>
                </Box>
                <Text fontSize="12px" color="#666">ID: 1254KD</Text>
              </HStack>

              {/* Title */}
              <Heading fontSize="20px" fontWeight="600" color="#2C3E50" textAlign="center">
                Conflict of Interest Statement
              </Heading>

              {/* Counterparty Name */}
              <Heading fontSize="18px" fontWeight="600" color="#2E7BB4" textAlign="center">
                {selectedCounterparty.name}
              </Heading>

              {/* Conflict Status */}
              <Box textAlign="center">
                {selectedCounterparty.hasConflict ? (
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
                    A Conflict of Interest exists.
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
                    No Conflict of Interest exists.
                  </Box>
                )}
              </Box>

              {/* Employee Names (only show when conflict exists) */}
              {selectedCounterparty.hasConflict && selectedCounterparty.employees && selectedCounterparty.employees.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center" mt={2}>
                  {selectedCounterparty.employees.map((employee, index) => (
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
              )}

              {/* Checked By Info */}
              <VStack gap={0.5}>
                <Text fontSize="13px" color="#666">
                  Checked by: <Text as="span" color="#333" fontWeight="500">Tunde Bakare</Text>
                </Text>
                <Text fontSize="13px" color="#666">
                  Date/Time: <Text as="span" color="#333" fontWeight="500">7th July, 2025; 11:25pm</Text>
                </Text>
              </VStack>

              {/* Close button for all cases */}
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
    </AdminLayout>
  );
};

export default CounterpartiesPage;
