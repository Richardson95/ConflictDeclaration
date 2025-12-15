'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  HStack,
  VStack,
  Text,
  Image,
  Button as ChakraButton,
  Spinner,
} from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/lib/layout/DashboardLayout';
import leftArrow from '@/assets/icons/left-arrow-1.png';
import { LuDownload } from 'react-icons/lu';
import { useGetConflictCheckHistoryDetailQuery } from '@/lib/redux/services/counterparty.service';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { toaster } from '@/components/ui/toaster';

const DeclarationCertificate = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serialNumber = searchParams.get('id');
  const [certificateData, setCertificateData] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch conflict check history from API
  const { data, isLoading } = useGetConflictCheckHistoryDetailQuery({
    page: 1,
    limit: 100,
    year: new Date().getFullYear(),
  });

  // Find the specific check by serial number
  useEffect(() => {
    if (data?.data?.result && serialNumber) {
      const checkItem = data.data.result.find(
        (item: any) => item.serialNumber === parseInt(serialNumber)
      );
      if (checkItem) {
        setCertificateData(checkItem);
      }
    }
  }, [data, serialNumber]);

  const handleDownloadReport = async () => {
    if (!certificateData) return;

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
      const counterpartyName = certificateData.counterparty || 'counterparty';
      const fileName = `conflict-certificate-${counterpartyName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      pdf.save(fileName);

      toaster.success({
        title: 'Report Downloaded',
        description: `Conflict certificate downloaded successfully.`,
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

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <Box minH="100vh" bg="#EDF5FE" display="flex" alignItems="center" justifyContent="center">
          <VStack gap={4}>
            <Spinner size="xl" color="#2E7BB4" />
            <Text color="#666">Loading certificate...</Text>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  // Show error if certificate not found
  if (!certificateData) {
    return (
      <DashboardLayout>
        <Box minH="100vh" bg="#EDF5FE" px={6} py={5}>
          <VStack gap={4} mt={10}>
            <Text fontSize="20px" fontWeight="600" color="#666">
              Certificate not found
            </Text>
            <ChakraButton
              bg="#2E7BB4"
              color="white"
              onClick={() => router.push('/declaration/check-history')}
            >
              Back to Check History
            </ChakraButton>
          </VStack>
        </Box>
      </DashboardLayout>
    );
  }

  const checkDetail = certificateData.checkDetail;

  return (
    <DashboardLayout>
      <Box minH="100vh" bg="#EDF5FE" px={6} py={5}>
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

        {/* Page Header */}
        <Heading fontSize="20px" fontWeight="600" color="#2C3E50" mb={6}>
          Conflict of Interest Certificate
        </Heading>

        {/* Certificate Card */}
        <Box
          bg={{ base: 'transparent', md: 'white' }}
          borderRadius={{ base: 'none', md: '12px' }}
          p={{ base: 0, md: 6 }}
          maxW="600px"
          mx="auto"
          boxShadow={{ base: 'none', md: 'lg' }}
          id="certificate-content"
        >
          <VStack gap={{ base: 7, md: 4 }} align="stretch">
            {/* Header with Logo and ID */}
            <HStack justify="space-between">
              <Box>
                <Text fontSize={{ base: '22px', md: '20px' }} fontWeight="700" color="#2E7BB4">
                  Infra<Text as="span" color="#47B65C">Credit</Text>
                </Text>
              </Box>
              <Text fontSize={{ base: '14px', md: '12px' }} color="#333">
                ID: {certificateData.serialNumber}
              </Text>
            </HStack>

            {/* Title */}
            <Heading fontSize={{ base: '20px', md: '20px' }} fontWeight="600" color="#2C3E50" textAlign="center">
              Conflict of Interest Statement
            </Heading>

            {/* Counterparty Name */}
            <Heading fontSize={{ base: '19px', md: '18px' }} fontWeight="600" color="#2E7BB4" textAlign="center">
              {certificateData.counterparty}
            </Heading>

            {/* Conflict Status */}
            <Box textAlign="center">
              {checkDetail?.hasConflict ? (
                <Box
                  bg="#FF6B47"
                  color="white"
                  fontSize={{ base: '17px', md: '14px' }}
                  fontWeight="600"
                  py={{ base: 3, md: 2.5 }}
                  px={{ base: 6, md: 5 }}
                  borderRadius={{ base: '12px', md: '6px' }}
                  display="inline-block"
                >
                  A Conflict of Interest exists.
                </Box>
              ) : (
                <Box
                  bg="#227CBF"
                  color="white"
                  fontSize={{ base: '17px', md: '14px' }}
                  fontWeight="600"
                  py={{ base: 3, md: 2.5 }}
                  px={{ base: 6, md: 5 }}
                  borderRadius={{ base: '12px', md: '6px' }}
                  display="inline-block"
                >
                  No Conflict of Interest exists.
                </Box>
              )}
            </Box>

            {/* Checked By Info */}
            <VStack gap={0.5}>
              <Text fontSize={{ base: '17px', md: '13px' }} color="#333">
                Checked by: <Text as="span" color="#333" fontWeight="500">
                  {checkDetail?.checkedByFullName || 'N/A'}
                </Text>
              </Text>
              <Text fontSize={{ base: '17px', md: '13px' }} color="#333">
                Date/Time: <Text as="span" color="#333" fontWeight="500">
                  {checkDetail?.checkedAt
                    ? new Date(checkDetail.checkedAt).toLocaleString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })
                    : 'N/A'}
                </Text>
              </Text>
            </VStack>

            {/* Download Report Button - Always Clickable */}
            <ChakraButton
              w="100%"
              bg="#47B65C"
              color="white"
              fontSize={{ base: '18px', md: '14px' }}
              fontWeight="500"
              h={{ base: '56px', md: '48px' }}
              borderRadius={{ base: '12px', md: '8px' }}
              _hover={{ bg: '#3DA550' }}
              _active={{ bg: '#2E8B3D' }}
              onClick={handleDownloadReport}
              disabled={isDownloading}
              opacity={isDownloading ? 0.6 : 1}
            >
              {isDownloading ? (
                <HStack gap={2} justify="center">
                  <Spinner size="md" />
                  <Text>Downloading...</Text>
                </HStack>
              ) : (
                <HStack gap={2} justify="center">
                  <LuDownload />
                  <Text>Download Report</Text>
                </HStack>
              )}
            </ChakraButton>

            {/* Additional Info */}
            <Text fontSize={{ base: '14px', md: '12px' }} color="#333" textAlign="center" mt={2}>
              This certificate was generated from the declaration check history.
            </Text>
          </VStack>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default DeclarationCertificate;
