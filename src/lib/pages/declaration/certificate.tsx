'use client';

import React from 'react';
import {
  Box,
  Heading,
  HStack,
  VStack,
  Text,
  Image,
  Button as ChakraButton,
} from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/lib/layout/DashboardLayout';
import leftArrow from '@/assets/icons/left-arrow-1.png';
import { LuDownload } from 'react-icons/lu';

// Mock data for counterparties
const counterparties = [
  { id: 1, name: 'Access Bank', sector: 'Banking', hasConflict: false },
  { id: 2, name: 'Agusto', sector: 'Credit Rating', hasConflict: true },
  { id: 3, name: 'Auro', sector: 'Technology', hasConflict: false },
  { id: 4, name: 'Deloitte', sector: 'Professional Services', hasConflict: true },
  { id: 5, name: 'KPMG', sector: 'Professional Services', hasConflict: false },
  { id: 6, name: 'First Bank', sector: 'Banking', hasConflict: false },
  { id: 7, name: 'Stanbic IBTC Asset Management', sector: 'Asset Management', hasConflict: true },
  { id: 8, name: 'Leadway Asset Management', sector: 'Asset Management', hasConflict: false },
  { id: 9, name: 'Templars', sector: 'Legal Services', hasConflict: true },
  { id: 10, name: 'KPMG', sector: 'Professional Services', hasConflict: false },
  { id: 11, name: 'Bolcom', sector: 'Technology', hasConflict: true },
  { id: 12, name: 'Fitch', sector: 'Credit Rating', hasConflict: false },
];

const DeclarationCertificate = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  // Get counterparty data based on ID (cycling through mock data)
  const counterpartyIndex = id ? (parseInt(id) - 1) % counterparties.length : 0;
  const counterparty = counterparties[counterpartyIndex];

  const handleDownloadReport = () => {
    // Implement download functionality
    console.log('Downloading report for:', counterparty.name);
    // In production, this would trigger an actual download
    alert(`Downloading report for ${counterparty.name}`);
  };

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
        >
          <VStack gap={{ base: 7, md: 4 }} align="stretch">
            {/* Header with Logo and ID */}
            <HStack justify="space-between">
              <Box>
                <Text fontSize={{ base: '22px', md: '20px' }} fontWeight="700" color="#2E7BB4">
                  Infra<Text as="span" color="#47B65C">Credit</Text>
                </Text>
              </Box>
              <Text fontSize={{ base: '14px', md: '12px' }} color="#333">ID: {id || '1254KD'}</Text>
            </HStack>

            {/* Title */}
            <Heading fontSize={{ base: '20px', md: '20px' }} fontWeight="600" color="#2C3E50" textAlign="center">
              Conflict of Interest Statement
            </Heading>

            {/* Counterparty Name */}
            <Heading fontSize={{ base: '19px', md: '18px' }} fontWeight="600" color="#2E7BB4" textAlign="center">
              {counterparty.name}
            </Heading>

            {/* Conflict Status */}
            <Box textAlign="center">
              {counterparty.hasConflict ? (
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
                Checked by: <Text as="span" color="#333" fontWeight="500">Emmanuel Adeyemo</Text>
              </Text>
              <Text fontSize={{ base: '17px', md: '13px' }} color="#333">
                Date/Time: <Text as="span" color="#333" fontWeight="500">7th July, 2025; 11:25pm</Text>
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
            >
              <HStack gap={2} justify="center">
                <LuDownload />
                <Text>Download Report</Text>
              </HStack>
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
