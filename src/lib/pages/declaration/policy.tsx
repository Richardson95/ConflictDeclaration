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
          <VStack gap={{ base: 2, md: 2 }} align="stretch">
            {/* Policy Document Box - PDF Viewer */}
            <Box
              border="2px solid #E0E0E0"
              borderRadius={{ base: '12px', md: '8px' }}
              overflow="hidden"
              minH={{ base: '500px', md: '600px' }}
              h={{ base: '68vh', md: '73vh' }}
              bg="white"
            >
              <iframe
                src="https://icgcprdrgdiag.blob.core.windows.net/ces-images/policydoc.pdf#view=FitH"
                width="100%"
                height="100%"
                style={{ border: 'none', display: 'block' }}
                title="Personal Account Dealing Policy"
              />
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
