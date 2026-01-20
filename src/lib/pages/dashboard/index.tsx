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
import { FiSettings } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetCounterpartiesQuery, useCheckConflictMutation, useNotifyComplianceForConflictCheckMutation } from '@/lib/redux/services/counterparty.service';
import type { ICounterparty, IConflictCheckResponse } from '@/lib/interfaces/counterparty.interfaces';
import { useGetCurrentUserQuery } from '@/lib/redux/services/auth.service';
import { hasAdminAccess } from '@/lib/constants/roles';

const Dashboard = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [selectedCounterparty, setSelectedCounterparty] = useState<ICounterparty | null>(null);
  const [showStatement, setShowStatement] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [conflictCheckResult, setConflictCheckResult] = useState<IConflictCheckResponse | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch current user data to check role
  const { data: currentUserData } = useGetCurrentUserQuery();
  const currentUser = currentUserData?.data;
  const isAdmin = hasAdminAccess(currentUser?.role);

  // Fetch counterparties from API
  const { data, isLoading, error } = useGetCounterpartiesQuery({
    page: currentPage,
    limit: itemsPerPage,
    filters: searchQuery ? { searchTerm: searchQuery } : undefined,
  });

  // Check conflict mutation
  const [checkConflict, { isLoading: isCheckingConflict }] = useCheckConflictMutation();

  // Notify compliance mutation
  const [notifyCompliance, { isLoading: isNotifyingCompliance }] = useNotifyComplianceForConflictCheckMutation();

  const handleCheckConflict = useCallback(async () => {
    if (selectedCounterparty) {
      try {
        setIsDisclaimerOpen(false);
        const result = await checkConflict({
          counterpartyId: selectedCounterparty.id,
        }).unwrap();

        setConflictCheckResult(result.data);
        setShowStatement(true);
      } catch (error) {
        console.error('Error checking conflict:', error);
        // Handle error - could show a toast notification
      }
    }
  }, [selectedCounterparty, checkConflict]);

  const handleNotifyCompliance = useCallback(async () => {
    // Find the current user's declaration from userDeclarations array
    const userDeclaration = conflictCheckResult?.userDeclarations?.find(
      (decl) => decl.userId === currentUser?.id
    );
    const declarationId = userDeclaration?.declarationId;

    if (declarationId) {
      try {
        await notifyCompliance({
          declarationId: declarationId,
        }).unwrap();
        setNotificationSent(true);
      } catch (error) {
        console.error('Error notifying compliance:', error);
        // Still set notificationSent to true to allow user to proceed
        setNotificationSent(true);
      }
    } else {
      console.error('No declaration found for current user in conflictCheckResult:', conflictCheckResult);
    }
  }, [conflictCheckResult, currentUser, notifyCompliance]);

  const handleAdminPanel = useCallback(() => {
    router.push('/admin');
  }, [router]);

  const handleDownloadReport = useCallback(async () => {
    if (!conflictCheckResult) {
      alert('No report data available');
      return;
    }

    try {
      setIsDownloading(true);

      // Dynamically import jsPDF only (simpler approach without html2canvas)
      const { jsPDF } = await import('jspdf');

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Helper function to add text
      const addText = (text: string, fontSize: number, isBold: boolean = false, align: 'left' | 'center' = 'left') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');

        if (align === 'center') {
          const textWidth = pdf.getTextWidth(text);
          const x = (pageWidth - textWidth) / 2;
          pdf.text(text, x, yPosition);
        } else {
          pdf.text(text, margin, yPosition);
        }
        yPosition += fontSize / 2 + 3;
      };

      // Add logo/header
      pdf.setTextColor(46, 123, 180); // Blue color
      addText('InfraCredit', 18, true, 'center');
      yPosition += 5;

      // Add ID
      pdf.setTextColor(102, 102, 102); // Gray
      addText(`ID: 1254KD`, 10, false, 'center');
      yPosition += 10;

      // Add title
      pdf.setTextColor(44, 62, 80); // Dark gray
      addText('Conflict of Interest Statement', 16, true, 'center');
      yPosition += 10;

      // Add counterparty name
      pdf.setTextColor(46, 123, 180); // Blue
      addText(conflictCheckResult.counterparty.name, 14, true, 'center');
      yPosition += 10;

      // Add conflict status box
      const boxWidth = 120;
      const boxHeight = 12;
      const boxX = (pageWidth - boxWidth) / 2;

      if (conflictCheckResult.hasConflict) {
        pdf.setFillColor(255, 107, 71); // Red/Orange
        pdf.setTextColor(255, 255, 255); // White text
      } else {
        pdf.setFillColor(34, 124, 191); // Blue
        pdf.setTextColor(255, 255, 255); // White text
      }

      pdf.roundedRect(boxX, yPosition, boxWidth, boxHeight, 3, 3, 'F');

      const statusText = conflictCheckResult.hasConflict
        ? 'A Conflict of Interest exists.'
        : 'No Conflict of Interest exists.';

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      const statusTextWidth = pdf.getTextWidth(statusText);
      pdf.text(statusText, (pageWidth - statusTextWidth) / 2, yPosition + 8);

      yPosition += boxHeight + 15;

      // Add checked by info
      pdf.setTextColor(102, 102, 102); // Gray
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);

      const checkedByText = `Checked by: ${conflictCheckResult.checkedByFullName}`;
      const checkedByWidth = pdf.getTextWidth(checkedByText);
      pdf.text(checkedByText, (pageWidth - checkedByWidth) / 2, yPosition);
      yPosition += 6;

      const dateTimeText = `Date/Time: ${new Date(conflictCheckResult.checkedAt).toLocaleString()}`;
      const dateTimeWidth = pdf.getTextWidth(dateTimeText);
      pdf.text(dateTimeText, (pageWidth - dateTimeWidth) / 2, yPosition);
      yPosition += 15;

      // Add footer
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      const footerText = 'This is an automated report generated by the InfraCredit Conflict Check Management System 1.0';
      const footerWidth = pdf.getTextWidth(footerText);
      pdf.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 15);

      // Generate filename
      const counterpartyName = conflictCheckResult.counterparty.name.replace(/[^a-z0-9]/gi, '_');
      const date = new Date().toISOString().split('T')[0];
      const filename = `Conflict_Report_${counterpartyName}_${date}.pdf`;

      // Download PDF
      pdf.save(filename);

      setIsDownloading(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsDownloading(false);
      alert(`Error generating report: ${error instanceof Error ? error.message : 'Unknown error'}.`);
    }
  }, [conflictCheckResult]);

  // Use data from API
  const counterparties = data?.data || [];
  const totalRecords = data?.total || 0;
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

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
            Counterparty Checklist
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

            {isAdmin && (
              <Button
                bg="#2E7BB4"
                color="white"
                fontSize="14px"
                fontWeight="500"
                px={6}
                h="40px"
                borderRadius="8px"
                _hover={{ bg: '#236096' }}
                onClick={handleAdminPanel}
              >
                <HStack gap={2}>
                  <FiSettings />
                  <Text>Admin Panel</Text>
                </HStack>
              </Button>
            )}
          </HStack>
        </HStack>

        {/* Mobile Header */}
        <VStack align="stretch" mb={{ base: 4, md: 6 }} gap={{ base: 4, md: 4 }} display={{ base: "flex", lg: "none" }}>
          <Heading fontSize={{ base: "20px", md: "24px" }} fontWeight="600" color="#2C3E50" mb={{ base: 2, md: 0 }}>
            Counterparty Checklist
          </Heading>

          <Box display="grid" gridTemplateColumns={{ base: isAdmin ? "repeat(4, 1fr)" : "repeat(3, 1fr)", sm: isAdmin ? "repeat(4, 1fr)" : "repeat(3, 1fr)" }} gap={{ base: 2, sm: 3 }}>
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

            {isAdmin && (
              <Button
                bg="#2E7BB4"
                color="white"
                fontSize={{ base: "11.5px", sm: "13px", md: "14px" }}
                fontWeight="500"
                px={{ base: 2, sm: 3, md: 6 }}
                h={{ base: "40px", sm: "40px", md: "40px" }}
                w="100%"
                borderRadius="8px"
                _hover={{ bg: '#236096' }}
                onClick={handleAdminPanel}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text textAlign="center" lineHeight="1.3">Admin Panel</Text>
              </Button>
            )}
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
              <Box w="350px" pl={28}>
                <Text color="#2E7BB4" fontWeight="600" fontSize="13px">
                  Counterparties
                </Text>
              </Box>
              <Box flex="1" pl={56}>
                <Text color="#2E7BB4" fontWeight="600" fontSize="13px">
                  Category
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
            {isLoading && (
              <Box textAlign="center" py={8}>
                <Text color="#666">Loading counterparties...</Text>
              </Box>
            )}
            {error && (
              <Box textAlign="center" py={8}>
                <Text color="red.500">Error loading counterparties. Please try again.</Text>
              </Box>
            )}
            {!isLoading && !error && counterparties.map((item, index) => (
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
                  <Box w="350px" pl={28}>
                    <Text fontSize="14px" color="#333" whiteSpace="nowrap">
                      {item.name}
                    </Text>
                  </Box>
                  <Box flex="1" pl={56}>
                    <Text fontSize="14px" color="#333">
                      {item.sectorName}
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
                        setConflictCheckResult(null);
                        setNotificationSent(false);
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
          {isLoading && (
            <Box textAlign="center" py={8}>
              <Text color="#666">Loading counterparties...</Text>
            </Box>
          )}
          {error && (
            <Box textAlign="center" py={8}>
              <Text color="red.500">Error loading counterparties. Please try again.</Text>
            </Box>
          )}
          {!isLoading && !error && counterparties.map((item, index) => (
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
                    bg={item.conflictCount > 0 ? "#FFF3E0" : "#E8F5E9"}
                    px={{ base: 3, md: 2 }}
                    py={2}
                    borderRadius="8px"
                  >
                    <Text fontSize={{ base: "13px", md: "10px" }} color={item.conflictCount > 0 ? "#F57C00" : "#2E7D32"} fontWeight="600">
                      {item.conflictCount > 0 ? "HAS CONFLICT" : "NO CONFLICT"}
                    </Text>
                  </Box>
                </HStack>

                <VStack align="stretch" gap={5}>
                  <Box>
                    <Text fontSize={{ base: "14px", md: "11px" }} color="#333" mb={2}>Counterparty</Text>
                    <Text fontSize={{ base: "18px", md: "15px" }} color="#333" fontWeight="600">{item.name}</Text>
                  </Box>

                  <Box>
                    <Text fontSize={{ base: "14px", md: "11px" }} color="#333" mb={2}>Category</Text>
                    <Text fontSize={{ base: "17px", md: "14px" }} color="#333">{item.sectorName}</Text>
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
                    setConflictCheckResult(null);
                    setNotificationSent(false);
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
                <option value={100}>100</option>
              </select>
              <Text fontWeight="400">of {totalRecords}</Text>
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
                <option value={100}>100</option>
              </select>
              <Text fontWeight="400">out of {totalRecords}</Text>
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
                This activity will be documented as a conflict check conducted on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Africa/Lagos' })}.
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
                onClick={handleCheckConflict}
                loading={isCheckingConflict}
              >
                {isCheckingConflict ? 'Checking...' : 'Proceed'}
              </Button>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Conflict Statement Modal */}
      {showStatement && conflictCheckResult && (
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
          onClick={() => {
            // Only allow closing if no conflict or if compliance has been notified
            if (!conflictCheckResult?.hasConflict || notificationSent) {
              setShowStatement(false);
              setConflictCheckResult(null);
              setNotificationSent(false);
            }
          }}
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
                {conflictCheckResult.counterparty.name}
              </Heading>

              {/* Conflict Status */}
              <Box textAlign="center">
                {conflictCheckResult.hasConflict ? (
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
                  Checked by: <Text as="span" color="#333" fontWeight="500">{conflictCheckResult.checkedByFullName}</Text>
                </Text>
                <Text fontSize="13px" color="#666">
                  Date/Time: <Text as="span" color="#333" fontWeight="500">{new Date(conflictCheckResult.checkedAt).toLocaleString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Africa/Lagos'
                  })}</Text>
                </Text>
              </VStack>

              {/* Action Buttons - Mobile */}
              <HStack gap={2} display={{ base: 'flex', md: 'none' }}>
                <ChakraButton
                  flex="1"
                  bg={conflictCheckResult.hasConflict && !notificationSent ? "#227CBF" : "#E0E0E0"}
                  color={conflictCheckResult.hasConflict && !notificationSent ? "white" : "#999"}
                  fontSize="11px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="6px"
                  cursor={conflictCheckResult.hasConflict && !notificationSent && !isNotifyingCompliance ? "pointer" : "not-allowed"}
                  _hover={conflictCheckResult.hasConflict && !notificationSent && !isNotifyingCompliance ? { bg: '#1B6AA3' } : {}}
                  _active={conflictCheckResult.hasConflict && !notificationSent && !isNotifyingCompliance ? { bg: '#165A8C' } : {}}
                  disabled={!conflictCheckResult.hasConflict || notificationSent || isNotifyingCompliance}
                  onClick={handleNotifyCompliance}
                >
                  {isNotifyingCompliance ? 'Notifying...' : 'Notify Compliance'}
                </ChakraButton>
                <ChakraButton
                  flex="1"
                  bg={!conflictCheckResult.hasConflict || notificationSent ? "#47B65C" : "#E0E0E0"}
                  color={!conflictCheckResult.hasConflict || notificationSent ? "white" : "#999"}
                  fontSize="11px"
                  fontWeight="500"
                  h="40px"
                  borderRadius="6px"
                  _hover={!conflictCheckResult.hasConflict || notificationSent ? { bg: '#3DA550' } : {}}
                  _active={!conflictCheckResult.hasConflict || notificationSent ? { bg: '#2E8B3D' } : {}}
                  disabled={conflictCheckResult.hasConflict && !notificationSent}
                  onClick={handleDownloadReport}
                >
                  <HStack gap={1} justify="center">
                    <LuDownload />
                    <Text>{isDownloading ? 'Downloading...' : 'Download'}</Text>
                  </HStack>
                </ChakraButton>
              </HStack>

              {/* Action Buttons - Desktop */}
              <HStack gap={3} display={{ base: 'none', md: 'flex' }}>
                <ChakraButton
                  flex="1"
                  bg={conflictCheckResult.hasConflict && !notificationSent ? "#227CBF" : "#E0E0E0"}
                  color={conflictCheckResult.hasConflict && !notificationSent ? "white" : "#999"}
                  fontSize="13px"
                  fontWeight="500"
                  h="42px"
                  borderRadius="6px"
                  cursor={conflictCheckResult.hasConflict && !notificationSent && !isNotifyingCompliance ? "pointer" : "not-allowed"}
                  _hover={conflictCheckResult.hasConflict && !notificationSent && !isNotifyingCompliance ? { bg: '#1B6AA3' } : {}}
                  _active={conflictCheckResult.hasConflict && !notificationSent && !isNotifyingCompliance ? { bg: '#165A8C' } : {}}
                  disabled={!conflictCheckResult.hasConflict || notificationSent || isNotifyingCompliance}
                  onClick={handleNotifyCompliance}
                >
                  {isNotifyingCompliance ? 'Notifying...' : 'Notify Compliance Department'}
                </ChakraButton>
                <ChakraButton
                  flex="1"
                  bg={!conflictCheckResult.hasConflict || notificationSent ? "#47B65C" : "#E0E0E0"}
                  color={!conflictCheckResult.hasConflict || notificationSent ? "white" : "#999"}
                  fontSize="13px"
                  fontWeight="500"
                  h="42px"
                  borderRadius="6px"
                  _hover={!conflictCheckResult.hasConflict || notificationSent ? { bg: '#3DA550' } : {}}
                  _active={!conflictCheckResult.hasConflict || notificationSent ? { bg: '#2E8B3D' } : {}}
                  disabled={conflictCheckResult.hasConflict && !notificationSent}
                  onClick={handleDownloadReport}
                >
                  <HStack gap={2} justify="center">
                    <LuDownload />
                    <Text>{isDownloading ? 'Downloading...' : 'Download Report'}</Text>
                  </HStack>
                </ChakraButton>
              </HStack>

              {/* Notification Note */}
              {conflictCheckResult.hasConflict && !notificationSent && (
                <Text fontSize="13px" color="#FF6B47" textAlign="center">
                  Note: You must notify the compliance department before downloading the certificate.
                </Text>
              )}

              {conflictCheckResult.hasConflict && notificationSent && (
                <Text fontSize="13px" color="#47B65C" textAlign="center">
                  Compliance department has been notified. You can now download the report.
                </Text>
              )}

              {/* Close button - only shows after compliance is notified (for conflicts) or always for no conflict */}
              {(!conflictCheckResult.hasConflict || notificationSent) && (
                <ChakraButton
                  size="xs"
                  variant="outline"
                  color="#666"
                  borderColor="#D0D7DE"
                  fontSize="11px"
                  fontWeight="500"
                  h="28px"
                  px={4}
                  borderRadius="4px"
                  alignSelf="center"
                  _hover={{ bg: '#F8F9FA', borderColor: '#999' }}
                  onClick={() => {
                    setShowStatement(false);
                    setConflictCheckResult(null);
                    setNotificationSent(false);
                  }}
                >
                  Close
                </ChakraButton>
              )}
            </VStack>
          </Box>
        </Box>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
