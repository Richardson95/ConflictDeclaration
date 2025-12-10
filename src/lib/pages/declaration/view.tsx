'use client';

import React, { useState } from 'react';
import {
  Box,
  Heading,
  HStack,
  VStack,
  Text,
  Image,
  RadioGroup,
  Button as ChakraButton,
} from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/lib/layout/DashboardLayout';
import leftArrow from '@/assets/icons/left-arrow-1.png';
import { useGetDeclarationByIdQuery, useNotifyComplianceMutation } from '@/lib/redux/services/declaration.service';
import { useGetCounterpartiesQuery } from '@/lib/redux/services/counterparty.service';
import { toaster } from '@/components/ui/toaster';

const ViewDeclaration = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const declarationId = searchParams.get('id') || '';
  const [notificationSent, setNotificationSent] = useState(false);

  // Fetch declaration data
  const { data: declarationData, isLoading: isLoadingDeclaration } = useGetDeclarationByIdQuery(declarationId, {
    skip: !declarationId,
  });

  // Fetch all counterparties to map IDs to names
  const { data: counterpartiesData, isLoading: isLoadingCounterparties } = useGetCounterpartiesQuery({
    page: 1,
    limit: 200, // Get all counterparties for mapping
  });

  // Notify compliance mutation
  const [notifyCompliance, { isLoading: isNotifying }] = useNotifyComplianceMutation();

  const declaration = declarationData?.data;
  const counterparties = counterpartiesData?.data || [];
  const isLoading = isLoadingDeclaration || isLoadingCounterparties;

  // Create a map of counterparty IDs to names
  const counterpartyMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    counterparties.forEach((cp) => {
      map[cp.id] = cp.name;
    });
    return map;
  }, [counterparties]);

  // Get assessments with counterparty names
  const assessments = React.useMemo(() => {
    if (!declaration?.asssessmentDtos) return [];
    return declaration.asssessmentDtos.map((assessment) => ({
      ...assessment,
      counterpartyName: typeof assessment.counterparty === 'string'
        ? assessment.counterparty
        : (assessment.counterparty as any)?.name || 'Unknown',
    }));
  }, [declaration]);

  // Check if there are any conflicts
  const hasConflicts = React.useMemo(() => {
    return assessments.some((a) => a.hasConflict);
  }, [assessments]);

  const handleNotifyCompliance = async () => {
    if (!declarationId) return;

    try {
      const result = await notifyCompliance({ declarationId }).unwrap();
      setNotificationSent(true);
      toaster.success({
        title: 'Compliance Notified',
        description: result.message || 'The compliance department has been notified successfully.',
      });
    } catch (error: any) {
      toaster.error({
        title: 'Notification Failed',
        description: error?.data?.message || 'Failed to notify compliance department.',
      });
    }
  };

  // Format date for display
  const formattedDate = declaration?.submittedAt
    ? new Date(declaration.submittedAt).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <DashboardLayout>
      <Box minH="100vh" bg="#EDF5FE" px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }}>
        {/* Back Button */}
        <HStack
          as="button"
          onClick={() => router.back()}
          mb={5}
          fontSize={{ base: '12px', md: '13px' }}
          fontWeight="500"
          color="#333"
          cursor="pointer"
          _hover={{ bg: '#F5F5F5' }}
          gap={2}
          bg="white"
          border="none"
          px={{ base: 3, md: 4 }}
          py={{ base: 1.5, md: 2 }}
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
        <Heading fontSize={{ base: '16px', md: '18px' }} fontWeight="600" color="#2C3E50" mb={{ base: 5, md: 6 }}>
          Declaration History{formattedDate ? `, ${formattedDate}` : ''}
        </Heading>

        {isLoading ? (
          <Box textAlign="center" py={10}>
            <Text color="#666">Loading declaration...</Text>
          </Box>
        ) : !declaration ? (
          <Box textAlign="center" py={10}>
            <Text color="red.500">Declaration not found.</Text>
          </Box>
        ) : (
          <>
            {/* Content Card */}
            <Box bg={{ base: 'transparent', md: 'white' }} borderRadius={{ base: 'none', md: '12px' }} boxShadow={{ base: 'none', md: 'xl' }} p={{ base: 0, md: 6 }} mb={6}>
              <Text fontSize={{ base: '17px', md: '14px' }} fontWeight="600" color="#2C3E50" mb={{ base: 8, md: 6 }} lineHeight="1.6">
                Do you or your immediate family have a debt or equity investment in any of these companies?
              </Text>

              <VStack gap={{ base: 7, md: 4 }} align="stretch">
                {assessments.map((item, index) => (
                  <HStack
                    key={item.id}
                    justify="space-between"
                    py={{ base: 6, md: 3 }}
                    borderBottom={index < assessments.length - 1 ? '1px solid #E8E8E8' : 'none'}
                  >
                    <Text fontSize={{ base: '17px', md: '13px' }} color="#333" fontWeight="500">
                      {index + 1}. {item.counterpartyName}
                    </Text>
                    <RadioGroup.Root value={item.hasConflict ? 'yes' : 'no'} disabled>
                      <HStack gap={{ base: 6, md: 6 }}>
                        <RadioGroup.Item value="yes">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemIndicator />
                          <RadioGroup.ItemText fontSize={{ base: '17px', md: '13px' }} color="#333">
                            Yes
                          </RadioGroup.ItemText>
                        </RadioGroup.Item>
                        <RadioGroup.Item value="no">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemIndicator />
                          <RadioGroup.ItemText fontSize={{ base: '17px', md: '13px' }} color="#333">
                            No
                          </RadioGroup.ItemText>
                        </RadioGroup.Item>
                      </HStack>
                    </RadioGroup.Root>
                  </HStack>
                ))}
              </VStack>
            </Box>

            {/* Notify Compliance Section */}
            {hasConflicts && (
              <Box bg="white" borderRadius="12px" boxShadow="xl" p={{ base: 4, md: 6 }} mb={6}>
                <VStack gap={4} align="stretch">
                  <Box bg="#FFF3E0" px={4} py={3} borderRadius="8px">
                    <Text fontSize="14px" color="#E65100" fontWeight="500">
                      ⚠️ This declaration contains conflict(s) of interest
                    </Text>
                  </Box>

                  <Text fontSize="14px" color="#666">
                    {notificationSent
                      ? 'The compliance department has been notified about the conflict(s) in this declaration.'
                      : 'Please notify the compliance department about the conflict(s) identified in this declaration.'}
                  </Text>

                  <ChakraButton
                    bg={notificationSent ? '#E0E0E0' : '#227CBF'}
                    color={notificationSent ? '#999' : 'white'}
                    fontSize="14px"
                    fontWeight="500"
                    h="44px"
                    borderRadius="8px"
                    cursor={notificationSent ? 'not-allowed' : 'pointer'}
                    _hover={notificationSent ? {} : { bg: '#1B6AA3' }}
                    _active={notificationSent ? {} : { bg: '#165A8C' }}
                    disabled={notificationSent || isNotifying}
                    onClick={handleNotifyCompliance}
                  >
                    {isNotifying ? 'Notifying...' : notificationSent ? 'Compliance Notified ✓' : 'Notify Compliance Department'}
                  </ChakraButton>
                </VStack>
              </Box>
            )}
          </>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default ViewDeclaration;
