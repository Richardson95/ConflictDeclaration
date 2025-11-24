'use client';

import React, { useState, useMemo, useCallback } from 'react';
import DashboardLayout from '@/lib/layout/DashboardLayout';
import {
  Box,
  Heading,
  HStack,
  VStack,
  Input,
  Button as ChakraButton,
  Text,
} from '@chakra-ui/react';
import { Button } from '@/components/ui';
import { LuHistory, LuDownload } from 'react-icons/lu';
import Link from 'next/link';

// Mock data - replace with actual data from API
const baseCounterparties = [
  { name: 'Access Bank', sector: 'Banking', hasConflict: false },
  { name: 'Agusto', sector: 'Credit Rating', hasConflict: true },
  { name: 'Auro', sector: 'Technology', hasConflict: false },
  { name: 'Deloitte', sector: 'Professional Services', hasConflict: true },
  { name: 'KPMG', sector: 'Professional Services', hasConflict: false },
  { name: 'First Bank', sector: 'Banking', hasConflict: false },
  { name: 'Stanbic IBTC', sector: 'Banking', hasConflict: true },
  { name: 'Fitch', sector: 'Credit Rating', hasConflict: false },
  { name: 'PwC', sector: 'Professional Services', hasConflict: true },
  { name: 'EY', sector: 'Professional Services', hasConflict: false },
  { name: 'GTBank', sector: 'Banking', hasConflict: false },
  { name: 'Zenith Bank', sector: 'Banking', hasConflict: true },
];

const mockCounterparties = Array(50).fill(null).map((_, index) => ({
  id: index + 1,
  name: baseCounterparties[index % baseCounterparties.length].name,
  sector: baseCounterparties[index % baseCounterparties.length].sector,
  hasConflict: baseCounterparties[index % baseCounterparties.length].hasConflict,
}));

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [selectedCounterparty, setSelectedCounterparty] = useState<typeof mockCounterparties[0] | null>(null);
  const [showStatement, setShowStatement] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  const handleNotifyCompliance = useCallback(() => {
    if (selectedCounterparty) {
      console.log('Notifying compliance for:', selectedCounterparty.name);
      setNotificationSent(true);
    }
  }, [selectedCounterparty]);

  const filteredData = useMemo(() =>
    mockCounterparties.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]);

  const totalPages = useMemo(() => Math.ceil(filteredData.length / itemsPerPage), [filteredData.length, itemsPerPage]);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = useMemo(() => filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  ), [filteredData, startIndex, itemsPerPage]);

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
      <Box p={{ base: 4, md: 5, lg: 6 }} bg="#EDF5FE" minH="100vh">
        {/* Header */}
        <HStack justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4} display={{ base: "none", lg: "flex" }}>
          <Heading fontSize="24px" fontWeight="600" color="#2C3E50">
            Counter Party Checklist
          </Heading>

          <HStack gap={3} flexWrap="wrap">
            <Link href="/declaration" prefetch style={{ textDecoration: 'none' }}>
              <Button
                bg="#47B65C"
                color="white"
                fontSize="14px"
                fontWeight="500"
                px={6}
                h="40px"
                borderRadius="8px"
                _hover={{ bg: '#3DA550' }}
                as="div"
              >
                Declare Conflict
              </Button>
            </Link>

            <Link href="/declaration/history" prefetch style={{ textDecoration: 'none' }}>
              <Button
                bg="#1B3242"
                color="white"
                fontSize="14px"
                fontWeight="500"
                px={6}
                h="40px"
                borderRadius="8px"
                _hover={{ bg: '#0F1F2D' }}
                as="div"
              >
                <HStack gap={2}>
                  <LuHistory />
                  <Text>Declaration History</Text>
                </HStack>
              </Button>
            </Link>

            <Link href="/declaration/check-history" prefetch style={{ textDecoration: 'none' }}>
              <Button
                bg="#FF6633"
                color="white"
                fontSize="14px"
                fontWeight="500"
                px={6}
                h="40px"
                borderRadius="8px"
                _hover={{ bg: '#E55529' }}
                as="div"
              >
                <HStack gap={2}>
                  <LuHistory />
                  <Text>Declaration Check History</Text>
                </HStack>
              </Button>
            </Link>
          </HStack>
        </HStack>

        {/* Mobile Header */}
        <VStack align="stretch" mb={{ base: 4, md: 6 }} gap={{ base: 4, md: 4 }} display={{ base: "flex", lg: "none" }}>
          <Heading fontSize={{ base: "20px", md: "24px" }} fontWeight="600" color="#2C3E50" mb={{ base: 2, md: 0 }}>
            Counter Party Checklist
          </Heading>

          <Box display="grid" gridTemplateColumns={{ base: "repeat(3, 1fr)", sm: "repeat(3, 1fr)" }} gap={{ base: 2, sm: 3 }}>
            <Link href="/declaration" prefetch style={{ textDecoration: 'none' }}>
              <Button
                bg="#47B65C"
                color="white"
                fontSize={{ base: "11.5px", sm: "13px", md: "14px" }}
                fontWeight="500"
                px={{ base: 2, sm: 3, md: 6 }}
                h={{ base: "40px", sm: "40px", md: "40px" }}
                w="100%"
                borderRadius="8px"
                _hover={{ bg: '#3DA550' }}
                as="div"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text textAlign="center" lineHeight="1.3">Declare Conflict</Text>
              </Button>
            </Link>

            <Link href="/declaration/history" prefetch style={{ textDecoration: 'none' }}>
              <Button
                bg="#1B3242"
                color="white"
                fontSize={{ base: "11.5px", sm: "13px", md: "14px" }}
                fontWeight="500"
                px={{ base: 2, sm: 3, md: 6 }}
                h={{ base: "40px", sm: "40px", md: "40px" }}
                w="100%"
                borderRadius="8px"
                _hover={{ bg: '#0F1F2D' }}
                as="div"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text textAlign="center" lineHeight="1.3">Declaration History</Text>
              </Button>
            </Link>

            <Link href="/declaration/check-history" prefetch style={{ textDecoration: 'none' }}>
              <Button
                bg="#FF6633"
                color="white"
                fontSize={{ base: "11.5px", sm: "13px", md: "14px" }}
                fontWeight="500"
                px={{ base: 2, sm: 3, md: 6 }}
                h={{ base: "40px", sm: "40px", md: "40px" }}
                w="100%"
                borderRadius="8px"
                _hover={{ bg: '#E55529' }}
                as="div"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text textAlign="center" lineHeight="1.3">Check History</Text>
              </Button>
            </Link>
          </Box>
        </VStack>

        {/* Search */}
        <Box mb={4}>
          <Input
            placeholder="Search counterparty"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            maxW={{ base: "100%", md: "300px", lg: "250px" }}
            h={{ base: "38px", md: "40px" }}
            borderRadius="8px"
            border="1px solid #D0D7DE"
            bg="white"
            fontSize={{ base: "13px", md: "14px", lg: "15px" }}
            _focus={{ borderColor: '#2E7BB4', boxShadow: '0 0 0 1px #2E7BB4' }}
          />
        </Box>

        {/* Desktop Table View */}
        <Box display={{ base: "none", lg: "block" }}>
          {/* Table Header */}
          <Box
            bg="#E2EEFE"
            borderRadius="8px"
            px={6}
            py={3.5}
            mb={2}
          >
            <HStack gap={0}>
              <Box w="60px">
                <Text color="#2E7BB4" fontWeight="600" fontSize="13px">
                  S/N
                </Text>
              </Box>
              <Box w="350px" pl={56}>
                <Text color="#2E7BB4" fontWeight="600" fontSize="13px">
                  Counterparties
                </Text>
              </Box>
              <Box flex="1" pl={56}>
                <Text color="#2E7BB4" fontWeight="600" fontSize="13px">
                  Sector
                </Text>
              </Box>
              <Box w="200px" display="flex" justifyContent="center" alignItems="center">
                <Text color="#2E7BB4" fontWeight="600" fontSize="13px">
                  Action
                </Text>
              </Box>
            </HStack>
          </Box>

          {/* Table Rows */}
          <VStack gap={2} align="stretch">
            {paginatedData.map((item, index) => (
              <Box
                key={item.id}
                bg="white"
                borderRadius="8px"
                px={6}
                py={3.5}
                boxShadow="sm"
                _hover={{ bg: '#F8F9FA' }}
              >
                <HStack gap={0}>
                  <Box w="60px">
                    <Text fontSize="14px" color="#333">
                      {startIndex + index + 1}
                    </Text>
                  </Box>
                  <Box w="350px" pl={56}>
                    <Text fontSize="14px" color="#333">
                      {item.name}
                    </Text>
                  </Box>
                  <Box flex="1" pl={56}>
                    <Text fontSize="14px" color="#333">
                      {item.sector}
                    </Text>
                  </Box>
                  <Box w="200px" textAlign="right">
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
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Mobile Card View */}
        <VStack gap={{ base: 7, md: 3 }} align="stretch" display={{ base: "flex", lg: "none" }}>
          {paginatedData.map((item, index) => (
            <Box
              key={item.id}
              bg={{ base: "transparent", md: "white" }}
              borderRadius={{ base: "none", md: "10px" }}
              p={{ base: 0, md: 4 }}
              boxShadow={{ base: "none", md: "xl" }}
              _hover={{ boxShadow: { base: "none", md: "2xl" }, transform: { base: "none", md: "translateY(-2px)" } }}
              transition="all 0.2s"
            >
              <VStack align="stretch" gap={{ base: 6, md: 3 }}>
                <HStack justify="space-between" pb={4} borderBottom="1px solid #E0E0E0">
                  <Text fontSize={{ base: "15px", md: "11px" }} color="#333" fontWeight="500">#{startIndex + index + 1}</Text>
                  <Box
                    bg={item.hasConflict ? "#FFF3E0" : "#E8F5E9"}
                    px={{ base: 3, md: 2 }}
                    py={2}
                    borderRadius="8px"
                  >
                    <Text fontSize={{ base: "13px", md: "10px" }} color={item.hasConflict ? "#F57C00" : "#2E7D32"} fontWeight="600">
                      {item.hasConflict ? "HAS CONFLICT" : "NO CONFLICT"}
                    </Text>
                  </Box>
                </HStack>

                <VStack align="stretch" gap={5}>
                  <Box>
                    <Text fontSize={{ base: "14px", md: "11px" }} color="#333" mb={2}>Counterparty</Text>
                    <Text fontSize={{ base: "18px", md: "15px" }} color="#333" fontWeight="600">{item.name}</Text>
                  </Box>

                  <Box>
                    <Text fontSize={{ base: "14px", md: "11px" }} color="#333" mb={2}>Sector</Text>
                    <Text fontSize={{ base: "17px", md: "14px" }} color="#333">{item.sector}</Text>
                  </Box>
                </VStack>

                <ChakraButton
                  bg="#227CBF"
                  color="white"
                  fontSize={{ base: "17px", md: "14px" }}
                  fontWeight="500"
                  w="100%"
                  h={{ base: "52px", md: "42px" }}
                  borderRadius="12px"
                  _hover={{ bg: '#1B6AA3' }}
                  _active={{ bg: '#165A8C' }}
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

        {/* Pagination */}
        <Box mt={6} pb={{ base: 4, md: 0 }}>
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
              <Text fontWeight="400">of {filteredData.length}</Text>
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
              <Text fontWeight="400">out of {filteredData.length}</Text>
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

              {/* Checked By Info */}
              <VStack gap={0.5}>
                <Text fontSize="13px" color="#666">
                  Checked by: <Text as="span" color="#333" fontWeight="500">Emmanuel Adeyemo</Text>
                </Text>
                <Text fontSize="13px" color="#666">
                  Date/Time: <Text as="span" color="#333" fontWeight="500">7th July, 2025; 11:25pm</Text>
                </Text>
              </VStack>

              {/* Action Buttons - Mobile */}
              <HStack gap={2} display={{ base: 'flex', md: 'none' }}>
                <ChakraButton
                  flex="1"
                  bg={selectedCounterparty.hasConflict && !notificationSent ? "#227CBF" : "#E0E0E0"}
                  color={selectedCounterparty.hasConflict && !notificationSent ? "white" : "#999"}
                  fontSize="11px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="6px"
                  cursor={selectedCounterparty.hasConflict && !notificationSent ? "pointer" : "not-allowed"}
                  _hover={selectedCounterparty.hasConflict && !notificationSent ? { bg: '#1B6AA3' } : {}}
                  _active={selectedCounterparty.hasConflict && !notificationSent ? { bg: '#165A8C' } : {}}
                  disabled={!selectedCounterparty.hasConflict || notificationSent}
                  onClick={handleNotifyCompliance}
                >
                  Notify Compliance
                </ChakraButton>
                <ChakraButton
                  flex="1"
                  bg={!selectedCounterparty.hasConflict || notificationSent ? "#47B65C" : "#E0E0E0"}
                  color={!selectedCounterparty.hasConflict || notificationSent ? "white" : "#999"}
                  fontSize="11px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="6px"
                  _hover={!selectedCounterparty.hasConflict || notificationSent ? { bg: '#3DA550' } : {}}
                  _active={!selectedCounterparty.hasConflict || notificationSent ? { bg: '#2E8B3D' } : {}}
                  disabled={selectedCounterparty.hasConflict && !notificationSent}
                >
                  <HStack gap={1} justify="center">
                    <LuDownload />
                    <Text>Download</Text>
                  </HStack>
                </ChakraButton>
              </HStack>

              {/* Action Buttons - Desktop */}
              <HStack gap={3} display={{ base: 'none', md: 'flex' }}>
                <ChakraButton
                  flex="1"
                  bg={selectedCounterparty.hasConflict && !notificationSent ? "#227CBF" : "#E0E0E0"}
                  color={selectedCounterparty.hasConflict && !notificationSent ? "white" : "#999"}
                  fontSize="13px"
                  fontWeight="500"
                  h="42px"
                  borderRadius="6px"
                  cursor={selectedCounterparty.hasConflict && !notificationSent ? "pointer" : "not-allowed"}
                  _hover={selectedCounterparty.hasConflict && !notificationSent ? { bg: '#1B6AA3' } : {}}
                  _active={selectedCounterparty.hasConflict && !notificationSent ? { bg: '#165A8C' } : {}}
                  disabled={!selectedCounterparty.hasConflict || notificationSent}
                  onClick={handleNotifyCompliance}
                >
                  Notify Compliance Department
                </ChakraButton>
                <ChakraButton
                  flex="1"
                  bg={!selectedCounterparty.hasConflict || notificationSent ? "#47B65C" : "#E0E0E0"}
                  color={!selectedCounterparty.hasConflict || notificationSent ? "white" : "#999"}
                  fontSize="13px"
                  fontWeight="500"
                  h="42px"
                  borderRadius="6px"
                  _hover={!selectedCounterparty.hasConflict || notificationSent ? { bg: '#3DA550' } : {}}
                  _active={!selectedCounterparty.hasConflict || notificationSent ? { bg: '#2E8B3D' } : {}}
                  disabled={selectedCounterparty.hasConflict && !notificationSent}
                >
                  <HStack gap={2} justify="center">
                    <LuDownload />
                    <Text>Download Report</Text>
                  </HStack>
                </ChakraButton>
              </HStack>

              {/* Notification Note */}
              {selectedCounterparty.hasConflict && !notificationSent && (
                <Text fontSize="13px" color="#FF6B47" textAlign="center">
                  Note: You must notify the compliance department before downloading the certificate.
                </Text>
              )}

              {selectedCounterparty.hasConflict && notificationSent && (
                <Text fontSize="13px" color="#47B65C" textAlign="center">
                  Compliance department has been notified. You can now download the report.
                </Text>
              )}
            </VStack>
          </Box>
        </Box>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
