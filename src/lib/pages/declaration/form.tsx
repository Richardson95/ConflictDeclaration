'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
  RadioGroup,
  Select,
  createListCollection,
  Portal,
  Checkbox,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/lib/layout/DashboardLayout';
import leftArrow from '@/assets/icons/left-arrow-1.png';
import { Button, toaster } from '@/components/ui';
import { useGetCounterpartiesQuery } from '@/lib/redux/services/counterparty.service';
import { useSubmitDeclarationMutation } from '@/lib/redux/services/declaration.service';
import { useGetCurrentUserQuery } from '@/lib/redux/services/auth.service';
import { useGetUserDeclarationStatusQuery } from '@/lib/redux/services/dashboard.service';
import { useAppDispatch } from '@/lib/redux/store';
import { dashboardApi } from '@/lib/redux/services/dashboard.service';
import type { ICounterparty } from '@/lib/interfaces/counterparty.interfaces';
import type { IAssessment } from '@/lib/interfaces/declaration.interfaces';

const DeclarationForm = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showPolicyViewModal, setShowPolicyViewModal] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Get current user from /Users/me endpoint
  const { data: currentUserData } = useGetCurrentUserQuery();
  const userId = currentUserData?.data?.id || '';

  // Fetch counterparties from API
  const { data: counterpartiesData, isLoading: isLoadingCounterparties } = useGetCounterpartiesQuery({
    page: 1,
    limit: 100, // Get all counterparties for the form
  });

  // Submit declaration mutation
  const [submitDeclaration, { isLoading: isSubmitting }] = useSubmitDeclarationMutation();

  // Get counterparties list
  const counterparties: ICounterparty[] = useMemo(() => {
    return counterpartiesData?.data || [];
  }, [counterpartiesData]);

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

  const handleAnswerChange = (counterpartyId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [counterpartyId]: value,
    }));
  };

  const handleSubmitDeclaration = async () => {
    if (!isAgreed) return;

    // Build assessments array from answers
    const assessments: IAssessment[] = counterparties.map((counterparty) => ({
      counterpartyId: counterparty.id,
      hasConflict: answers[counterparty.id] === 'yes',
      notes: answers[counterparty.id] === 'yes'
        ? 'Declared conflict of interest'
        : 'No conflict of interest declared',
    }));

    const requestBody = {
      userId,
      year: parseInt(selectedYear),
      policyAccepted: true,
      assessments,
    };

    try {
      const result = await submitDeclaration(requestBody).unwrap();

      // Invalidate dashboard cache to refresh the declaration status banner
      dispatch(dashboardApi.util.invalidateTags(['UserDeclarationStatus', 'DashboardMetrics']));

      toaster.success({
        title: 'Declaration Submitted',
        description: result.message || 'Your declaration has been submitted successfully',
      });

      setShowPolicyModal(false);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error submitting declaration:', error);
      toaster.error({
        title: 'Submission Failed',
        description: error?.data?.message || 'Failed to submit declaration. Please try again.',
      });
    }
  };

  return (
    <DashboardLayout>
      <Box minH="100vh" bg="#EDF5FE" px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }}>
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
            loading="lazy"
          />
          <Text>Back</Text>
        </HStack>

        {/* Page Header */}
        <Box mb={4}>
          <Box mb={{ base: 3, md: 0 }}>
            <Heading fontSize={{ base: '18px', md: '20px' }} fontWeight="600" color="#2C3E50" mb={2}>
              Personal Account Dealing Declaration
            </Heading>
            <Text fontSize={{ base: '11px', md: '12px' }} color="#666" lineHeight="1.6" maxW={{ base: '100%', md: '700px' }} mb={{ base: 3, md: 0 }}>
              Employees must ensure that their investments in any Relevant Assets, including direct and indirect investments, and those of their Immediate Family, are disclosed to InfraCredit. Please refer to the{' '}
              <Text
                as="span"
                color="#2E7BB4"
                fontWeight="500"
                textDecoration="underline"
                cursor="pointer"
                onClick={() => setShowPolicyViewModal(true)}
              >
                personal account dealing policy
              </Text>{' '}
              or reach out to the compliance team for any clarification needed.
            </Text>
          </Box>
          <Box display="flex" justifyContent={{ base: 'flex-start', md: 'flex-end' }} mt={{ base: 3, md: -12 }}>
            <Select.Root
              collection={yearCollection}
              value={[selectedYear]}
              onValueChange={(details) => setSelectedYear(details.value[0])}
              size="sm"
              width={{ base: '100%', md: '120px' }}
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
        </Box>

        {/* Form Card */}
        <Box bg={{ base: 'transparent', md: 'white' }} borderRadius={{ base: 'none', md: '10px', lg: '12px' }} boxShadow={{ base: 'none', md: 'sm' }} p={{ base: 0, md: 5, lg: 6 }} mb={6}>
          <Text fontSize={{ base: '17px', md: '13px', lg: '14px' }} fontWeight="600" color="#2C3E50" mb={{ base: 8, md: 5, lg: 6 }} lineHeight="1.5">
            Do you or your immediate family have a debt or equity investment in any of these companies?
          </Text>

          {isLoadingCounterparties ? (
            <Box textAlign="center" py={8}>
              <Text color="#666">Loading counterparties...</Text>
            </Box>
          ) : counterparties.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="#666">No counterparties found.</Text>
            </Box>
          ) : (
            <VStack gap={{ base: 7, md: 3, lg: 4 }} align="stretch">
              {counterparties.map((counterparty, index) => (
                <Box
                  key={counterparty.id}
                  py={{ base: 6, md: 3 }}
                  borderBottom={index < counterparties.length - 1 ? '1px solid #E8E8E8' : 'none'}
                >
                  <VStack gap={{ base: 2, md: 2 }} align="stretch" display={{ base: 'flex', md: 'none' }}>
                    <Text fontSize={{ base: "17px", md: "13px" }} color="#333" fontWeight="500" lineHeight="1.4">
                      {index + 1}. {counterparty.name}
                    </Text>
                    <RadioGroup.Root
                      value={answers[counterparty.id] || ''}
                      onValueChange={(details) => handleAnswerChange(counterparty.id, details.value ?? '')}
                    >
                      <HStack gap={{ base: 6, md: 6 }} justify="flex-start">
                        <RadioGroup.Item value="yes">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemIndicator />
                          <RadioGroup.ItemText fontSize={{ base: "17px", md: "13px" }} color="#333">
                            Yes
                          </RadioGroup.ItemText>
                        </RadioGroup.Item>
                        <RadioGroup.Item value="no">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemIndicator />
                          <RadioGroup.ItemText fontSize={{ base: "17px", md: "13px" }} color="#333">
                            No
                          </RadioGroup.ItemText>
                        </RadioGroup.Item>
                      </HStack>
                    </RadioGroup.Root>
                  </VStack>

                  <HStack justify="space-between" display={{ base: 'none', md: 'flex' }}>
                    <Text fontSize="13px" color="#333" fontWeight="500">
                      {index + 1}. {counterparty.name}
                    </Text>
                    <RadioGroup.Root
                      value={answers[counterparty.id] || ''}
                      onValueChange={(details) => handleAnswerChange(counterparty.id, details.value ?? '')}
                    >
                      <HStack gap={6}>
                        <RadioGroup.Item value="yes">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemIndicator />
                          <RadioGroup.ItemText fontSize="13px" color="#333">
                            Yes
                          </RadioGroup.ItemText>
                        </RadioGroup.Item>
                        <RadioGroup.Item value="no">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemIndicator />
                          <RadioGroup.ItemText fontSize="13px" color="#333">
                            No
                          </RadioGroup.ItemText>
                        </RadioGroup.Item>
                      </HStack>
                    </RadioGroup.Root>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        {/* Next Button */}
        <Box display="flex" justifyContent="flex-end" pb={{ base: 4, md: 6 }}>
          <Button
            bg="#47B65C"
            color="white"
            fontSize={{ base: "13px", md: "13px", lg: "14px" }}
            fontWeight="500"
            px={{ base: 8, md: 10, lg: 12 }}
            py={2}
            h={{ base: "42px", md: "auto" }}
            w={{ base: '100%', md: 'auto' }}
            borderRadius="6px"
            _hover={{ bg: '#3DA550' }}
            disabled={Object.keys(answers).length < counterparties.length || isLoadingCounterparties}
            opacity={Object.keys(answers).length < counterparties.length || isLoadingCounterparties ? 0.5 : 1}
            cursor={Object.keys(answers).length < counterparties.length || isLoadingCounterparties ? 'not-allowed' : 'pointer'}
            onClick={() => {
              if (Object.keys(answers).length === counterparties.length && !isLoadingCounterparties) {
                setShowPolicyModal(true);
              }
            }}
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* Policy Modal */}
      {showPolicyModal && (
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
          zIndex="9999"
          onClick={() => setShowPolicyModal(false)}
          px={{ base: 4, md: 0 }}
        >
          <Box
            bg="white"
            borderRadius={{ base: '10px', md: '12px' }}
            maxW={{ base: '100%', md: '420px' }}
            w={{ base: '100%', md: '80%' }}
            h={{ base: '95vh', md: '100vh' }}
            boxShadow="2xl"
            onClick={(e) => e.stopPropagation()}
            display="flex"
            flexDirection="column"
          >
            {/* Modal Header */}
            <Box
              bg="#E8E8E8"
              py={{ base: 2.5, md: 3 }}
              px={{ base: 4, md: 6 }}
              borderTopRadius={{ base: '10px', md: '12px' }}
            >
              <Heading fontSize={{ base: '15px', md: '16px' }} fontWeight="600" color="#2C3E50" textAlign="center">
                Conflicts Policy
              </Heading>
            </Box>

            {/* Modal Content */}
            <VStack gap={{ base: 3, md: 4 }} p={{ base: 4, md: 6 }} align="stretch" flex="1" justify="space-between">
              <Box flex="1" overflow="hidden">
                {/* Header with Draft and Logo */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
                  <Text fontSize={{ base: '9px', md: '10px' }} fontWeight="700" color="#FF0000">
                    DRAFT VERSION
                  </Text>
                  <Image
                    src="/infracredit-logo.svg"
                    alt="InfraCredit"
                    h={{ base: '22px', md: '28px' }}
                    objectFit="contain"
                    loading="lazy"
                  />
                </Box>

                {/* Policy Document Box */}
                <Box
                  border={{ base: '1.5px solid #333', md: '2px solid #333' }}
                  borderRadius="6px"
                  p={{ base: 4, md: 8 }}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  bg="white"
                  h={{ base: 'calc(95vh - 240px)', md: 'calc(100vh - 260px)' }}
                >
                  <VStack gap={{ base: 4, md: 6 }} align="center">
                    <Text
                      fontSize={{ base: '11px', md: '13px' }}
                      fontWeight="600"
                      color="#333"
                      textAlign="center"
                      letterSpacing="0.3px"
                    >
                      INFRASTRUCTURE CREDIT GUARANTEE COMPANY PLC
                    </Text>

                    <VStack gap={1.5} align="center">
                      <Text
                        fontSize={{ base: '11px', md: '12px' }}
                        fontWeight="600"
                        color="#333"
                        textAlign="center"
                      >
                        PERSONAL ACCOUNT DEALING POLICY
                      </Text>
                      <Text
                        fontSize={{ base: '9px', md: '10px' }}
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
              </Box>

              <Box flexShrink={0}>
                {/* Checkbox Agreement */}
                <Checkbox.Root
                  checked={isAgreed}
                  onCheckedChange={(e) => setIsAgreed(e.checked === true)}
                  size="sm"
                  mb={3}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label>
                    <Text fontSize={{ base: '11px', md: '12px' }} color="#333" lineHeight="1.6">
                      I have read the policy and agreed to the terms.
                    </Text>
                  </Checkbox.Label>
                </Checkbox.Root>

                {/* Submit Button */}
                <Button
                  bg="#47B65C"
                  color="white"
                  fontSize="13px"
                  fontWeight="500"
                  w="100%"
                  h={{ base: '42px', md: '40px' }}
                  borderRadius="6px"
                  _hover={{ bg: '#3DA550' }}
                  disabled={!isAgreed || isSubmitting}
                  opacity={!isAgreed || isSubmitting ? 0.5 : 1}
                  cursor={!isAgreed || isSubmitting ? 'not-allowed' : 'pointer'}
                  onClick={handleSubmitDeclaration}
                  loading={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </Box>
            </VStack>
          </Box>
        </Box>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
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
          zIndex="9999"
          px={{ base: 4, md: 0 }}
        >
          <Box
            bg="white"
            borderRadius={{ base: '10px', md: '12px' }}
            maxW="520px"
            w={{ base: '100%', md: '90%' }}
            p={{ base: 5, md: 6 }}
            boxShadow="2xl"
            textAlign="center"
          >
            {/* Success Checkmark */}
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mb={4}
            >
              <Box
                w={{ base: '70px', md: '80px' }}
                h={{ base: '70px', md: '80px' }}
                borderRadius="full"
                border={{ base: '3px solid #47B65C', md: '4px solid #47B65C' }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                animation="scaleIn 0.6s ease-out"
                css={{
                  '@keyframes scaleIn': {
                    '0%': {
                      transform: 'scale(0)',
                      opacity: 0,
                    },
                    '50%': {
                      transform: 'scale(1.1)',
                    },
                    '100%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                  },
                }}
              >
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#47B65C"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 50,
                    strokeDashoffset: 50,
                    animation: 'drawCheck 1s ease-out 0.4s forwards',
                  }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </Box>
            </Box>
            <style>
              {`
                @keyframes drawCheck {
                  to {
                    stroke-dashoffset: 0;
                  }
                }
              `}
            </style>

            {/* Success Message */}
            <Heading fontSize={{ base: '19px', md: '22px' }} fontWeight="600" color="#2C3E50" mb={2}>
              Assessment Complete!
            </Heading>
            <Text fontSize={{ base: '13px', md: '14px' }} color="#666" lineHeight="1.6" mb={{ base: 4, md: 5 }}>
              Thank you for completing the conflict declaration form.
            </Text>

            {/* Close/Continue Button */}
            <Button
              bg="#47B65C"
              color="white"
              fontSize="14px"
              fontWeight="500"
              w="100%"
              h="44px"
              borderRadius="6px"
              _hover={{ bg: '#3DA550' }}
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/dashboard');
              }}
            >
              Continue
            </Button>
          </Box>
        </Box>
      )}

      {/* Policy View Modal (for viewing only, without agreement) */}
      {showPolicyViewModal && (
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
          zIndex="9999"
          onClick={() => setShowPolicyViewModal(false)}
          px={{ base: 4, md: 0 }}
        >
          <Box
            bg="white"
            borderRadius={{ base: '10px', md: '12px' }}
            maxW={{ base: '100%', md: '420px' }}
            w={{ base: '100%', md: '80%' }}
            h={{ base: '85vh', md: '85vh' }}
            boxShadow="2xl"
            onClick={(e) => e.stopPropagation()}
            display="flex"
            flexDirection="column"
          >
            {/* Modal Header */}
            <Box
              bg="#E8E8E8"
              py={{ base: 2.5, md: 3 }}
              px={{ base: 4, md: 6 }}
              borderTopRadius={{ base: '10px', md: '12px' }}
            >
              <Heading fontSize={{ base: '15px', md: '16px' }} fontWeight="600" color="#2C3E50" textAlign="center">
                Conflicts Policy
              </Heading>
            </Box>

            {/* Modal Content */}
            <VStack gap={{ base: 3, md: 4 }} p={{ base: 4, md: 6 }} align="stretch" flex="1">
              <Box flex="1" overflow="hidden">
                {/* Header with Draft and Logo */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
                  <Text fontSize={{ base: '9px', md: '10px' }} fontWeight="700" color="#FF0000">
                    DRAFT VERSION
                  </Text>
                  <Image
                    src="/infracredit-logo.svg"
                    alt="InfraCredit"
                    h={{ base: '22px', md: '28px' }}
                    objectFit="contain"
                    loading="lazy"
                  />
                </Box>

                {/* Policy Document Box */}
                <Box
                  border={{ base: '1.5px solid #333', md: '2px solid #333' }}
                  borderRadius="6px"
                  p={{ base: 4, md: 8 }}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  bg="white"
                  h={{ base: 'calc(95vh - 200px)', md: 'calc(100vh - 230px)' }}
                >
                  <VStack gap={{ base: 4, md: 6 }} align="center">
                    <Text
                      fontSize={{ base: '11px', md: '13px' }}
                      fontWeight="600"
                      color="#333"
                      textAlign="center"
                      letterSpacing="0.3px"
                    >
                      INFRASTRUCTURE CREDIT GUARANTEE COMPANY PLC
                    </Text>

                    <VStack gap={1.5} align="center">
                      <Text
                        fontSize={{ base: '11px', md: '12px' }}
                        fontWeight="600"
                        color="#333"
                        textAlign="center"
                      >
                        PERSONAL ACCOUNT DEALING POLICY
                      </Text>
                      <Text
                        fontSize={{ base: '9px', md: '10px' }}
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
              </Box>
            </VStack>
          </Box>
        </Box>
      )}
    </DashboardLayout>
  );
};

export default DeclarationForm;
