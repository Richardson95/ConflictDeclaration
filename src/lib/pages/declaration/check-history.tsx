'use client';

import React, { useState, useCallback, useMemo } from 'react';
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
  Spinner,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/lib/layout/DashboardLayout';
import leftArrow from '@/assets/icons/left-arrow-1.png';
import { LuDownload } from 'react-icons/lu';
import infraCreditLogo from '@/assets/logos/logo-1.png';
import { useGetConflictCheckHistoryDetailQuery } from '@/lib/redux/services/counterparty.service';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { toaster } from '@/components/ui/toaster';

const DeclarationCheckHistory = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch conflict check history from API
  const { data, isLoading, error } = useGetConflictCheckHistoryDetailQuery({
    page: 1,
    limit: 100, // Get all checks for the year
    year: parseInt(selectedYear),
  });

  const checkHistory = data?.data?.result || [];

  const handleViewCertificate = useCallback((item: any) => {
    setSelectedItem(item);
    setShowCertificateModal(true);
  }, []);

  const handleDownloadReport = async () => {
    if (!selectedItem) return;

    setIsDownloading(true);
    try {
      // Get the certificate content element
      const certificateElement = document.getElementById('certificate-content');

      if (!certificateElement) {
        throw new Error('Certificate content not found');
      }

      // Wait for content to fully render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate PNG from the content using html-to-image
      const dataUrl = await toPng(certificateElement, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      // Create an image to get dimensions
      const img = new window.Image();
      img.src = dataUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (img.height * imgWidth) / img.width;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Add image to PDF (handle multiple pages if content is long)
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const counterpartyName = selectedItem.counterparty || selectedItem.checkDetail?.counterparty?.name || 'counterparty';
      const fileName = `conflict-check-certificate-${counterpartyName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      pdf.save(fileName);

      toaster.success({
        title: 'Report Downloaded',
        description: `Conflict check certificate downloaded successfully.`,
      });
    } catch (error: any) {
      console.error('PDF Generation Error:', error);
      toaster.error({
        title: 'Download Failed',
        description: 'Unable to download report. Please try again.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNotifyCompliance = () => {
    // TODO: Implement compliance notification
  };

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

  // Filter by search query
  const filteredData = useMemo(() => {
    if (!checkHistory || !Array.isArray(checkHistory)) return [];
    return checkHistory.filter((item: any) =>
      (item.counterpartyName || item.counterparty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sector || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [checkHistory, searchQuery]);

  const totalPages = useMemo(() => Math.ceil(filteredData.length / itemsPerPage), [filteredData.length, itemsPerPage]);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = useMemo(() => filteredData.slice(startIndex, startIndex + itemsPerPage), [filteredData, startIndex, itemsPerPage]);

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
      <Box minH="100vh" bg="#EDF5FE" px={{ base: 4, md: 5, lg: 6 }} py={{ base: 4, md: 5 }}>
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
        <Box mb={{ base: 4, md: 5 }} display={{ base: "flex", lg: "none" }} justifyContent="flex-end">
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
        <HStack justify="space-between" align="center" mb={6} display={{ base: "none", lg: "flex" }}>
          <Heading fontSize="20px" fontWeight="600" color="#2C3E50">
            Declaration Check History
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
        <Box mb={6} display={{ base: "block", lg: "none" }}>
          <Heading fontSize={{ base: '18px', md: '20px' }} fontWeight="600" color="#2C3E50">
            Declaration Check History
          </Heading>
        </Box>

        {/* Search */}
        <Box mb={4}>
          <Input
            placeholder="Search counterparty or sector"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            maxW={{ base: '100%', md: '300px', lg: '250px' }}
            h={{ base: '38px', md: '40px' }}
            borderRadius="8px"
            border="1px solid #D0D7DE"
            bg="white"
            fontSize={{ base: '13px', md: '14px' }}
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
              <Box w="300px" pl={4}>
                <Text color="#2E7BB4" fontWeight="600" fontSize="13px">
                  Counterparties
                </Text>
              </Box>
              <Box flex="1" pl={4}>
                <Text color="#2E7BB4" fontWeight="600" fontSize="13px">
                  Sector
                </Text>
              </Box>
              <Box w="200px" transform="translateX(-60px)">
                <Text color="#2E7BB4" fontWeight="600" fontSize="13px">
                  Date
                </Text>
              </Box>
              <Box w="160px" textAlign="center">
                <Text color="#2E7BB4" fontWeight="600" fontSize="13px">
                  Action
                </Text>
              </Box>
            </HStack>
          </Box>

          {/* Table Rows */}
          {isLoading ? (
            <Box textAlign="center" py={8}>
              <Text color="#666">Loading conflict check history...</Text>
            </Box>
          ) : error ? (
            <Box textAlign="center" py={8}>
              <Text color="red.500">Error loading conflict check history. Please try again.</Text>
            </Box>
          ) : paginatedData.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="#666">No conflict checks found for {selectedYear}.</Text>
            </Box>
          ) : (
            <VStack gap={2} align="stretch">
              {paginatedData.map((item: any, index) => {
                const formattedDate = item.date || item.checkDetail?.checkedAt || item.checkedAt
                  ? new Date(item.date || item.checkDetail?.checkedAt || item.checkedAt).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '';

                return (
                  <Box
                    key={item.id || item.checkId || index}
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
                      <Box w="300px" pl={4}>
                        <Text fontSize="14px" color="#333">
                          {item.counterpartyName || item.counterparty || 'Unknown'}
                        </Text>
                      </Box>
                      <Box flex="1" pl={4}>
                        <Text fontSize="14px" color="#333">
                          {item.sector || 'N/A'}
                        </Text>
                      </Box>
                      <Box w="200px" transform="translateX(-60px)">
                        <Text fontSize="14px" color="#333">
                          {formattedDate}
                        </Text>
                      </Box>
                      <Box w="160px" textAlign="center">
                        <ChakraButton
                          bg="#227CBF"
                          color="white"
                          fontSize="13px"
                          fontWeight="500"
                          px={4}
                          h="36px"
                          borderRadius="6px"
                          _hover={{ bg: '#1B6AA3' }}
                          onClick={() => handleViewCertificate(item)}
                        >
                          View Certificate
                        </ChakraButton>
                      </Box>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          )}
        </Box>

        {/* Mobile Card View */}
        <VStack gap={7} align="stretch" display={{ base: "flex", lg: "none" }}>
          {isLoading ? (
            <Box textAlign="center" py={8}>
              <Text color="#666">Loading conflict check history...</Text>
            </Box>
          ) : error ? (
            <Box textAlign="center" py={8}>
              <Text color="red.500">Error loading conflict check history. Please try again.</Text>
            </Box>
          ) : paginatedData.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="#666">No conflict checks found for {selectedYear}.</Text>
            </Box>
          ) : (
            paginatedData.map((item: any, index) => {
              const formattedDate = item.date || item.checkDetail?.checkedAt || item.checkedAt
                ? new Date(item.date || item.checkDetail?.checkedAt || item.checkedAt).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : '';

              return (
                <Box
                  key={item.id || item.checkId || index}
                  bg="transparent"
                  borderRadius="none"
                  p={0}
                  boxShadow="none"
                >
                  <VStack align="stretch" gap={6}>
                    <HStack justify="space-between" pb={4} borderBottom="1px solid #E0E0E0">
                      <Text fontSize="15px" color="#333" fontWeight="500">#{startIndex + index + 1}</Text>
                      <Text fontSize="14px" color="#333" fontWeight="500">ID: {item.id || item.checkId || index}</Text>
                    </HStack>

                    <VStack align="stretch" gap={5}>
                      <Box>
                        <Text fontSize="14px" color="#333" mb={2}>Counterparty</Text>
                        <Text fontSize="18px" color="#333" fontWeight="600">{item.counterpartyName || item.counterparty || 'Unknown'}</Text>
                      </Box>

                      <Box>
                        <Text fontSize="14px" color="#333" mb={2}>Sector</Text>
                        <Text fontSize="17px" color="#333">{item.sector || 'N/A'}</Text>
                      </Box>

                      <Box>
                        <Text fontSize="14px" color="#333" mb={2}>Date Checked</Text>
                        <Text fontSize="16px" color="#333" fontWeight="500">{formattedDate}</Text>
                      </Box>
                    </VStack>

                    <ChakraButton
                      bg="#227CBF"
                      color="white"
                      fontSize="17px"
                      fontWeight="500"
                      w="100%"
                      h="52px"
                      borderRadius="12px"
                      _hover={{ bg: '#1B6AA3' }}
                      _active={{ bg: '#165A8C' }}
                      onClick={() => handleViewCertificate(item)}
                    >
                      View Certificate
                    </ChakraButton>
                  </VStack>
                </Box>
              );
            })
          )}
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

      {/* Certificate Modal Overlay */}
      {showCertificateModal && selectedItem && (
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
          onClick={() => setShowCertificateModal(false)}
        >
          <Box
            bg="white"
            borderRadius={{ base: '10px', md: '12px' }}
            p={{ base: 4, md: 5, lg: 6 }}
            maxW={{ base: '95%', md: '550px', lg: '600px' }}
            w="90%"
            boxShadow="xl"
            onClick={(e) => e.stopPropagation()}
            maxH="90vh"
            overflowY="auto"
          >
            <VStack gap={{ base: 3, md: 4 }} align="stretch" id="certificate-content">
              {/* Header with Logo and ID */}
              <HStack justify="space-between" flexWrap="wrap" gap={2}>
                <Box>
                  <Image
                    src={typeof infraCreditLogo === 'string' ? infraCreditLogo : infraCreditLogo.src}
                    alt="InfraCredit"
                    h={{ base: '32px', md: '36px', lg: '40px' }}
                    loading="lazy"
                  />
                </Box>
                <Text fontSize={{ base: '11px', md: '12px' }} color="#666">ID: 1254KD</Text>
              </HStack>

              {/* Title */}
              <Heading fontSize={{ base: '16px', md: '18px', lg: '20px' }} fontWeight="600" color="#2C3E50" textAlign="center">
                Conflict of Interest Statement
              </Heading>

              {/* Counterparty Name */}
              <Heading fontSize={{ base: '15px', md: '17px', lg: '18px' }} fontWeight="600" color="#2E7BB4" textAlign="center">
                {selectedItem.counterparty || selectedItem.checkDetail?.counterparty?.name}
              </Heading>

              {/* Conflict Status */}
              <Box textAlign="center">
                {(selectedItem.checkDetail?.hasConflict || selectedItem.hasConflict) ? (
                  <Box
                    bg="#FF6B47"
                    color="white"
                    fontSize={{ base: '12px', md: '13px', lg: '14px' }}
                    fontWeight="600"
                    py={{ base: 2, md: 2.5 }}
                    px={{ base: 4, md: 5 }}
                    borderRadius="6px"
                    display="inline-block"
                  >
                    A Conflict of Interest exists.
                  </Box>
                ) : (
                  <Box
                    bg="#227CBF"
                    color="white"
                    fontSize={{ base: '12px', md: '13px', lg: '14px' }}
                    fontWeight="600"
                    py={{ base: 2, md: 2.5 }}
                    px={{ base: 4, md: 5 }}
                    borderRadius="6px"
                    display="inline-block"
                  >
                    No Conflict of Interest exists.
                  </Box>
                )}
              </Box>

              {/* Checked By Info */}
              <VStack gap={0.5}>
                <Text fontSize={{ base: '12px', md: '13px' }} color="#666" textAlign="center">
                  Checked by: <Text as="span" color="#333" fontWeight="500">
                    {selectedItem.checkDetail?.checkedByFullName || selectedItem.userFullName || 'Unknown'}
                  </Text>
                </Text>
                <Text fontSize={{ base: '12px', md: '13px' }} color="#666" textAlign="center">
                  Date/Time: <Text as="span" color="#333" fontWeight="500">
                    {(() => {
                      const date = new Date(selectedItem.checkDetail?.checkedAt || selectedItem.date);
                      // Backend times are already in Nigeria time, display as-is
                      return date.toLocaleString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      }).replace(/,/g, ' at');
                    })()}
                  </Text>
                </Text>
              </VStack>

              {/* Action Buttons */}
              <HStack gap={2} display={{ base: 'flex', md: 'none' }}>
                <ChakraButton
                  flex="1"
                  bg="#E0E0E0"
                  color="#999"
                  fontSize="11px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="6px"
                  cursor="not-allowed"
                  disabled={true}
                >
                  Notify Compliance
                </ChakraButton>
                <ChakraButton
                  flex="1"
                  bg="#47B65C"
                  color="white"
                  fontSize="11px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="6px"
                  _hover={{ bg: '#3DA550' }}
                  _active={{ bg: '#2E8B3D' }}
                  onClick={handleDownloadReport}
                  disabled={isDownloading}
                  opacity={isDownloading ? 0.6 : 1}
                >
                  {isDownloading ? (
                    <HStack gap={1} justify="center">
                      <Spinner size="xs" />
                      <Text>Downloading...</Text>
                    </HStack>
                  ) : (
                    <HStack gap={1} justify="center">
                      <LuDownload />
                      <Text>Download</Text>
                    </HStack>
                  )}
                </ChakraButton>
              </HStack>

              <HStack gap={2} display={{ base: 'none', md: 'flex' }}>
                <ChakraButton
                  flex="1.2"
                  bg="#E0E0E0"
                  color="#999"
                  fontSize="11.5px"
                  fontWeight="500"
                  h="42px"
                  borderRadius="6px"
                  cursor="not-allowed"
                  disabled={true}
                  px={3}
                  textAlign="center"
                >
                  Notify Compliance Department
                </ChakraButton>
                <ChakraButton
                  flex="1"
                  bg="#47B65C"
                  color="white"
                  fontSize="13px"
                  fontWeight="500"
                  h="42px"
                  borderRadius="6px"
                  _hover={{ bg: '#3DA550' }}
                  _active={{ bg: '#2E8B3D' }}
                  onClick={handleDownloadReport}
                  disabled={isDownloading}
                  opacity={isDownloading ? 0.6 : 1}
                >
                  {isDownloading ? (
                    <HStack gap={2} justify="center">
                      <Spinner size="sm" />
                      <Text>Downloading...</Text>
                    </HStack>
                  ) : (
                    <HStack gap={2} justify="center">
                      <LuDownload />
                      <Text>Download Report</Text>
                    </HStack>
                  )}
                </ChakraButton>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </DashboardLayout>
  );
};

export default DeclarationCheckHistory;
