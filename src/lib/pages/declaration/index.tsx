'use client';

import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/lib/layout/DashboardLayout';
import leftArrow from '@/assets/icons/left-arrow-1.png';
import handshakeIcon from '@/assets/icons/Frame.png';

const Declaration = () => {
  const router = useRouter();

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

        {/* Page Title */}
        <Heading fontSize="20px" fontWeight="600" color="#2C3E50" mb={6}>
          Conflicts of Interest Declaration
        </Heading>

        {/* Main Card */}
        <Box
          maxW="850px"
          mx="auto"
          bg={{ base: 'transparent', md: 'white' }}
          borderRadius={{ base: 'none', md: '12px' }}
          boxShadow={{ base: 'none', md: 'sm' }}
          px={{ base: 0, md: 12 }}
          py={{ base: 0, md: 8 }}
          mt={3}
        >
          <VStack gap={{ base: 7, md: 4 }} align="center">
            {/* Icon */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={1}
            >
              <Image
                src={typeof handshakeIcon === 'string' ? handshakeIcon : handshakeIcon.src}
                alt="Handshake"
                w={{ base: '90px', md: '70px' }}
                h={{ base: '90px', md: '70px' }}
              />
            </Box>

            {/* Description */}
            <Text
              fontSize={{ base: '17px', md: '13px' }}
              color="#333"
              textAlign="center"
              lineHeight="1.6"
              maxW="600px"
            >
              Your commitment to transparency and integrity is crucial to our organization&apos;s success. This form helps us identify and manage potential conflicts of interest effectively. Your cooperation ensures our actions remain aligned with our values.
            </Text>

            {/* Start Button */}
            <Box
              as="button"
              bg="#47B65C"
              color="white"
              fontSize={{ base: '18px', md: '13px' }}
              fontWeight="500"
              px={{ base: 12, md: 10 }}
              py={{ base: 3.5, md: 2 }}
              borderRadius={{ base: '12px', md: '6px' }}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ bg: '#3DA550' }}
              mt={1}
              border="none"
              onClick={() => router.push('/declaration/form')}
            >
              Start
            </Box>
          </VStack>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Declaration;
