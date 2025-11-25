'use client';

import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Image,
  Checkbox,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/lib/layout/DashboardLayout';
import { Button } from '@/components/ui';

const ConflictsPolicy = () => {
  const router = useRouter();
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <DashboardLayout>
      <Box minH="100vh" bg="#EDF5FE" px={6} py={5}>
        {/* Page Title */}
        <Heading fontSize="20px" fontWeight="600" color="#2C3E50" mb={6} textAlign="center">
          Conflicts Policy
        </Heading>

        {/* Policy Card */}
        <Box
          maxW="650px"
          mx="auto"
          bg={{ base: 'transparent', md: 'white' }}
          borderRadius={{ base: 'none', md: '12px' }}
          boxShadow={{ base: 'none', md: 'sm' }}
          p={{ base: 0, md: 8 }}
          mb={6}
        >
          <VStack gap={{ base: 7, md: 6 }} align="stretch">
            {/* Header with Draft and Logo */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
              <Text fontSize="12px" fontWeight="700" color="#FF0000">
                DRAFT VERSION
              </Text>
              <Image
                src="/infracredit-logo.svg"
                alt="InfraCredit"
                h="35px"
                objectFit="contain"
              />
            </Box>

            {/* Policy Document Box */}
            <Box
              border="2px solid #333"
              borderRadius={{ base: '12px', md: '8px' }}
              p={{ base: 8, md: 12 }}
              minH={{ base: '350px', md: '400px' }}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              bg="white"
            >
              <VStack gap={8} align="center">
                <Text
                  fontSize="15px"
                  fontWeight="600"
                  color="#333"
                  textAlign="center"
                  letterSpacing="0.5px"
                >
                  INFRASTRUCTURE CREDIT GUARANTEE COMPANY PLC
                </Text>

                <VStack gap={2} align="center">
                  <Text
                    fontSize="14px"
                    fontWeight="600"
                    color="#333"
                    textAlign="center"
                  >
                    PERSONAL ACCOUNT DEALING POLICY
                  </Text>
                  <Text
                    fontSize="12px"
                    fontWeight="500"
                    color="#333"
                    textAlign="center"
                    fontStyle="italic"
                  >
                    (proposed to be embedded in Code of Ethics & Business Conduct Policy)
                  </Text>
                </VStack>
              </VStack>
            </Box>

            {/* Checkbox Agreement */}
            <Checkbox.Root
              checked={isAgreed}
              onCheckedChange={(e) => setIsAgreed(e.checked === true)}
              size="sm"
              mt={2}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Label>
                <Text fontSize={{ base: '17px', md: '13px' }} color="#333" lineHeight="1.6">
                  I have read the policy and agreed to the terms.
                </Text>
              </Checkbox.Label>
            </Checkbox.Root>

            {/* Submit Button */}
            <Button
              bg="#47B65C"
              color="white"
              fontSize={{ base: '18px', md: '13px' }}
              fontWeight="500"
              w="100%"
              h={{ base: '56px', md: '42px' }}
              borderRadius={{ base: '12px', md: '6px' }}
              _hover={{ bg: '#3DA550' }}
              disabled={!isAgreed}
              opacity={!isAgreed ? 0.5 : 1}
              cursor={!isAgreed ? 'not-allowed' : 'pointer'}
              onClick={() => {
                if (isAgreed) {
                  // TODO: Handle submission and navigate to next page
                  console.log('Policy agreed and submitted');
                  router.push('/dashboard');
                }
              }}
            >
              Submit
            </Button>
          </VStack>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default ConflictsPolicy;
