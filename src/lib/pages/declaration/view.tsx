'use client';

import React from 'react';
import {
  Box,
  Heading,
  HStack,
  VStack,
  Text,
  Image,
  RadioGroup,
} from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/lib/layout/DashboardLayout';
import leftArrow from '@/assets/icons/left-arrow-1.png';
import { useGetDeclarationByIdQuery } from '@/lib/redux/services/declaration.service';

const ViewDeclaration = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const declarationId = searchParams.get('id') || '';

  // Fetch declaration data
  const { data: declarationData, isLoading: isLoadingDeclaration } = useGetDeclarationByIdQuery(declarationId, {
    skip: !declarationId,
  });

  const declaration = declarationData?.data;
  const isLoading = isLoadingDeclaration;

  // Get assessments with counterparty names and sort by conflict status
  const assessments = React.useMemo(() => {
    if (!declaration?.asssessmentDtos) return [];
    const mappedAssessments = declaration.asssessmentDtos.map((assessment) => ({
      ...assessment,
      counterpartyName: typeof assessment.counterparty === 'string'
        ? assessment.counterparty
        : (assessment.counterparty as any)?.name || 'Unknown',
    }));

    // Sort: conflicts (Yes) first, then no conflicts (No)
    return mappedAssessments.sort((a, b) => {
      if (a.hasConflict && !b.hasConflict) return -1;
      if (!a.hasConflict && b.hasConflict) return 1;
      return 0;
    });
  }, [declaration]);

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
          </>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default ViewDeclaration;
