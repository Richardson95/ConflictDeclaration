'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Heading,
  HStack,
  VStack,
  Text,
  Image,
  Select,
  createListCollection,
  Portal,
  Button as ChakraButton,
  Input,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/lib/layout/DashboardLayout';
import leftArrow from '@/assets/icons/left-arrow-1.png';

// Mock data for declaration history with varied dates
const generateRandomDate = (index: number) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const year = 2024;
  const monthIndex = Math.floor((index * 7) % 12); // Distribute across months
  const day = ((index * 13) % 28) + 1; // Days 1-28 to avoid invalid dates

  return `${day} ${months[monthIndex]}, ${year}`;
};

const mockDeclarations = Array(512).fill(null).map((_, index) => ({
  id: index + 1,
  date: generateRandomDate(index),
}));

const DeclarationHistory = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [sortBy, setSortBy] = useState<string>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateSearch, setDateSearch] = useState<string>('');

  const yearOptions = [
    { label: currentYear.toString(), value: currentYear.toString() },
    { label: (currentYear - 1).toString(), value: (currentYear - 1).toString() },
    { label: (currentYear - 2).toString(), value: (currentYear - 2).toString() },
  ];

  const yearCollection = createListCollection({
    items: yearOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  const sortOptions = [
    { label: 'Date', value: 'date' },
    { label: 'ID', value: 'id' },
  ];

  const sortCollection = createListCollection({
    items: sortOptions,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });

  // Filter declarations by date search
  const filteredDeclarations = useMemo(() =>
    mockDeclarations.filter((declaration) =>
      declaration.date.toLowerCase().includes(dateSearch.toLowerCase())
    ), [dateSearch]);

  const totalPages = useMemo(() => Math.ceil(filteredDeclarations.length / itemsPerPage), [filteredDeclarations.length, itemsPerPage]);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = useMemo(() => filteredDeclarations.slice(startIndex, startIndex + itemsPerPage), [filteredDeclarations, startIndex, itemsPerPage]);

  const renderPageNumbers = useMemo(() => {
    const pages = [];

    // Always show page 1
    pages.push(1);

    // Show page 2
    if (totalPages >= 2) {
      pages.push(2);
    }

    // Show page 3
    if (totalPages >= 3) {
      pages.push(3);
    }

    // Show ellipsis if needed
    if (currentPage > 4 && totalPages > 5) {
      pages.push('...');
    }

    // Show current page if it's not already shown
    if (currentPage > 3 && currentPage < totalPages - 2) {
      pages.push(currentPage);
    }

    // Show ellipsis before last page if needed
    if (currentPage < totalPages - 3 && totalPages > 4) {
      pages.push('...');
    }

    // Show last page if it's beyond page 3
    if (totalPages > 3) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  return (
    <DashboardLayout>
      <Box minH="100vh" bg="#EDF5FE" px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }}>
        {/* Back Button */}
        <HStack
          as="button"
          onClick={() => router.back()}
          mb={5}
          fontSize="13px"
          fontWeight="500"
          color="#333"
          cursor="pointer"
          _hover={{ bg: '#F5F5F5' }}
          gap={2}
          bg="white"
          border="none"
          px={4}
          py={2}
          borderRadius="6px"
          boxShadow="sm"
          w="fit-content"
          display={{ base: 'none', md: 'flex' }}
        >
          <Image
            src={typeof leftArrow === 'string' ? leftArrow : leftArrow.src}
            alt="Back"
            w="14px"
            h="14px"
          />
          <Text>Back</Text>
        </HStack>

        {/* Year Selector - Mobile */}
        <Box mb={{ base: 4, md: 5 }} display={{ base: "flex", md: "none" }} justifyContent="flex-end">
          <Select.Root
            collection={yearCollection}
            value={[selectedYear]}
            onValueChange={(details) => setSelectedYear(details.value[0])}
            size="sm"
            width="120px"
          >
            <Select.Control>
              <Select.Trigger
                bg="white"
                border="1px solid #E0E0E0"
                borderRadius="6px"
                fontSize="13px"
                color="#333"
                fontWeight="500"
                h="36px"
              >
                <Select.ValueText placeholder="Select year" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content
                  bg="white"
                  border="1px solid #E0E0E0"
                  borderRadius="6px"
                  boxShadow="md"
                >
                  {yearOptions.map((option) => (
                    <Select.Item
                      key={option.value}
                      item={option}
                      fontSize="13px"
                      color="#333"
                      _hover={{ bg: '#F5F5F5' }}
                      cursor="pointer"
                    >
                      {option.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Box>

        {/* Desktop Page Header */}
        <HStack justify="space-between" align="center" mb={6} display={{ base: "none", md: "flex" }}>
          <Heading fontSize="20px" fontWeight="600" color="#2C3E50">
            Declaration History
          </Heading>

          <Select.Root
            collection={yearCollection}
            value={[selectedYear]}
            onValueChange={(details) => setSelectedYear(details.value[0])}
            size="sm"
            width="120px"
          >
            <Select.Control>
              <Select.Trigger
                bg="white"
                border="1px solid #E0E0E0"
                borderRadius="6px"
                fontSize="13px"
                color="#333"
                fontWeight="500"
                h="36px"
              >
                <Select.ValueText placeholder="Select year" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content
                  bg="white"
                  border="1px solid #E0E0E0"
                  borderRadius="6px"
                  boxShadow="md"
                >
                  {yearOptions.map((option) => (
                    <Select.Item
                      key={option.value}
                      item={option}
                      fontSize="13px"
                      color="#333"
                      _hover={{ bg: '#F5F5F5' }}
                      cursor="pointer"
                    >
                      {option.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </HStack>

        {/* Mobile Page Header */}
        <Box mb={6} display={{ base: "block", md: "none" }}>
          <Heading fontSize="18px" fontWeight="600" color="#2C3E50">
            Declaration History
          </Heading>
        </Box>

        {/* Date Search */}
        <Box mb={4}>
          <Input
            placeholder="Search by date"
            value={dateSearch}
            onChange={(e) => {
              setDateSearch(e.target.value);
              setCurrentPage(1);
            }}
            maxW={{ base: '100%', md: '350px' }}
            h="40px"
            borderRadius="8px"
            border="1px solid #D0D7DE"
            bg="white"
            fontSize="14px"
            _focus={{ borderColor: '#2E7BB4', boxShadow: '0 0 0 1px #2E7BB4' }}
          />
        </Box>

        {/* Table - Desktop View */}
        <Box display={{ base: 'none', md: 'block' }}>
          <Box bg="#E2EEFE" borderRadius="8px" px={6} py={3.5} mb={2}>
            <HStack gap={0}>
              <Box w="80px"><Text color="#2E7BB4" fontWeight="600" fontSize="13px">S/N</Text></Box>
              <Box flex="1" textAlign="center"><Text color="#2E7BB4" fontWeight="600" fontSize="13px">Date</Text></Box>
              <Box w="200px" textAlign="right"><Text color="#2E7BB4" fontWeight="600" fontSize="13px">Action</Text></Box>
            </HStack>
          </Box>
          <VStack gap={2} align="stretch">
            {paginatedData.map((item) => (
              <Box key={item.id} bg="white" borderRadius="8px" px={6} py={3.5} boxShadow="sm" _hover={{ bg: '#F8F9FA' }}>
                <HStack gap={0}>
                  <Box w="80px"><Text fontSize="14px" color="#333">{item.id}</Text></Box>
                  <Box flex="1" textAlign="center"><Text fontSize="14px" color="#333">{item.date}</Text></Box>
                  <Box w="200px" textAlign="right">
                    <ChakraButton bg="#227CBF" color="white" fontSize="13px" fontWeight="500" px={5} h="36px" borderRadius="6px" _hover={{ bg: '#1B6AA3' }} onClick={() => router.push(`/declaration/view?date=${encodeURIComponent(item.date)}`)}>View Declaration</ChakraButton>
                  </Box>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Mobile Card View */}
        <VStack gap={8} align="stretch" display={{ base: 'flex', md: 'none' }}>
          {paginatedData.map((item, index) => (
            <Box key={item.id} bg="transparent" borderRadius="none" p={0} boxShadow="none">
              <VStack align="stretch" gap={6}>
                <VStack align="stretch" gap={3} bg="#F8FAFC" p={4} borderRadius="8px" borderLeft="3px solid #227CBF">
                  <HStack justify="space-between">
                    <Text fontSize="13px" color="#666" fontWeight="500">Serial Number</Text>
                    <Text fontSize="15px" color="#333" fontWeight="600">{item.id}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="13px" color="#666" fontWeight="500">Declaration Date</Text>
                    <Text fontSize="15px" color="#2E7BB4" fontWeight="600">{item.date}</Text>
                  </HStack>
                </VStack>
                <ChakraButton bg="#227CBF" color="white" fontSize="17px" fontWeight="500" w="100%" h="54px" borderRadius="10px" _hover={{ bg: '#1B6AA3' }} _active={{ bg: '#165A8C' }} onClick={() => router.push(`/declaration/view?date=${encodeURIComponent(item.date)}`)}>View Declaration</ChakraButton>
              </VStack>
              {index < paginatedData.length - 1 && (
                <Box h="1px" bg="#D1D5DB" mt={8} />
              )}
            </Box>
          ))}
        </VStack>

        {/* Pagination */}
        <Box mt={6} pb={{ base: 4, md: 6 }}>
          {/* Mobile Pagination */}
          <VStack gap={3} display={{ base: "flex", md: "none" }} align="stretch">
            <HStack gap={2} fontSize="13px" color="#6C757D" justify="center">
              <Text fontWeight="400">Showing</Text>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  fontSize: '13px',
                  color: '#212529',
                  border: '1px solid #DEE2E6',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <Text fontWeight="400">of {filteredDeclarations.length}</Text>
            </HStack>

            <HStack gap={2} justify="center">
              <ChakraButton
                size="sm"
                bg="white"
                color="#666"
                border="1px solid #D0D7DE"
                borderRadius="6px"
                minW="36px"
                h="36px"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
                _hover={{ bg: currentPage === 1 ? 'white' : '#F8F9FA' }}
              >
                &lt;
              </ChakraButton>

              <ChakraButton
                size="sm"
                bg={currentPage === 1 ? '#227CBF' : 'white'}
                color={currentPage === 1 ? 'white' : '#666'}
                border="1px solid #D0D7DE"
                borderRadius="6px"
                minW="36px"
                h="36px"
                onClick={() => setCurrentPage(1)}
                _hover={{ bg: currentPage === 1 ? '#1B6AA3' : '#F8F9FA' }}
              >
                1
              </ChakraButton>

              {currentPage > 2 && totalPages > 3 && <Text color="#666" px={1}>...</Text>}

              {currentPage > 1 && currentPage < totalPages && (
                <ChakraButton
                  size="sm"
                  bg="#227CBF"
                  color="white"
                  border="1px solid #D0D7DE"
                  borderRadius="6px"
                  minW="36px"
                  h="36px"
                  _hover={{ bg: '#1B6AA3' }}
                >
                  {currentPage}
                </ChakraButton>
              )}

              {currentPage < totalPages - 1 && totalPages > 3 && <Text color="#666" px={1}>...</Text>}

              {totalPages > 1 && (
                <ChakraButton
                  size="sm"
                  bg={currentPage === totalPages ? '#227CBF' : 'white'}
                  color={currentPage === totalPages ? 'white' : '#666'}
                  border="1px solid #D0D7DE"
                  borderRadius="6px"
                  minW="36px"
                  h="36px"
                  onClick={() => setCurrentPage(totalPages)}
                  _hover={{ bg: currentPage === totalPages ? '#1B6AA3' : '#F8F9FA' }}
                >
                  {totalPages}
                </ChakraButton>
              )}

              <ChakraButton
                size="sm"
                bg="white"
                color="#666"
                border="1px solid #D0D7DE"
                borderRadius="6px"
                minW="36px"
                h="36px"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
                _hover={{ bg: currentPage === totalPages ? 'white' : '#F8F9FA' }}
              >
                &gt;
              </ChakraButton>
            </HStack>
          </VStack>

          {/* Desktop Pagination */}
          <HStack justify="space-between" align="center" display={{ base: "none", md: "flex" }}>
            <HStack gap={2} fontSize="14px" color="#6C757D">
              <Text fontWeight="400">Showing</Text>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  fontSize: '14px',
                  color: '#212529',
                  border: '1px solid #DEE2E6',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <Text fontWeight="400">out of {filteredDeclarations.length}</Text>
            </HStack>

            <HStack gap={2}>
              <ChakraButton
                size="sm"
                bg="white"
                color="#666"
                border="1px solid #D0D7DE"
                borderRadius="6px"
                minW="32px"
                h="32px"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
                _hover={{ bg: currentPage === 1 ? 'white' : '#F8F9FA' }}
              >
                &lt;
              </ChakraButton>

              {renderPageNumbers.map((page, index) => (
                page === '...' ? (
                  <Text key={`ellipsis-${index}`} color="#666" px={1}>...</Text>
                ) : (
                  <ChakraButton
                    key={page}
                    size="sm"
                    bg={currentPage === page ? '#227CBF' : 'white'}
                    color={currentPage === page ? 'white' : '#666'}
                    border="1px solid #D0D7DE"
                    borderRadius="6px"
                    minW="32px"
                    h="32px"
                    onClick={() => setCurrentPage(page as number)}
                    _hover={{ bg: currentPage === page ? '#1B6AA3' : '#F8F9FA' }}
                  >
                    {page}
                  </ChakraButton>
                )
              ))}

              <ChakraButton
                size="sm"
                bg="white"
                color="#666"
                border="1px solid #D0D7DE"
                borderRadius="6px"
                minW="32px"
                h="32px"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
                _hover={{ bg: currentPage === totalPages ? 'white' : '#F8F9FA' }}
              >
                &gt;
              </ChakraButton>
            </HStack>
          </HStack>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default DeclarationHistory;
