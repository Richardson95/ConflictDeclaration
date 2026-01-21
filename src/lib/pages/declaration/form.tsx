'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Input,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/lib/layout/DashboardLayout';
import leftArrow from '@/assets/icons/left-arrow-1.png';
import { Button, toaster } from '@/components/ui';
import { useGetCounterpartiesQuery } from '@/lib/redux/services/counterparty.service';
import { useSubmitDeclarationMutation } from '@/lib/redux/services/declaration.service';
import { useGetCurrentUserQuery } from '@/lib/redux/services/auth.service';
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
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);

  // Get current user from /Users/me endpoint
  const { data: currentUserData } = useGetCurrentUserQuery();
  const userId = currentUserData?.data?.id || '';

  // Fetch ALL counterparties from API (needed for submission)
  const { data: counterpartiesData, isLoading: isLoadingCounterparties } = useGetCounterpartiesQuery({
    page: 1,
    limit: 10000, // Get all counterparties for the form
  });

  // Submit declaration mutation
  const [submitDeclaration, { isLoading: isSubmitting }] = useSubmitDeclarationMutation();

  // Get counterparties list
  const counterparties: ICounterparty[] = useMemo(() => {
    return counterpartiesData?.data || [];
  }, [counterpartiesData]);

  // Filter counterparties based on search query
  const filteredCounterparties: ICounterparty[] = useMemo(() => {
    if (!searchQuery.trim()) {
      return counterparties;
    }
    return counterparties.filter((counterparty) =>
      counterparty.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [counterparties, searchQuery]);

  // Pagination calculations
  const totalRecords = filteredCounterparties.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Get paginated counterparties for display
  const paginatedCounterparties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCounterparties.slice(startIndex, endIndex);
  }, [filteredCounterparties, currentPage, itemsPerPage]);

  // Calculate page numbers to render
  const renderPageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];

    pages.push(1);

    if (totalPages >= 2) {
      if (currentPage > 3) {
        pages.push('...');
      }

      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  // Initialize all answers to "no" by default when counterparties are loaded
  useEffect(() => {
    if (counterparties.length > 0 && Object.keys(answers).length === 0) {
      const defaultAnswers: Record<string, string> = {};
      counterparties.forEach((counterparty) => {
        defaultAnswers[counterparty.id] = 'no';
      });
      setAnswers(defaultAnswers);
    }
  }, [counterparties, answers]);

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

      // Show success modal
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
          <Box
            display="flex"
            flexDirection={{ base: 'column', md: 'row' }}
            gap={{ base: 3, md: 3 }}
            justifyContent={{ base: 'flex-start', md: 'flex-end' }}
            alignItems={{ base: 'stretch', md: 'center' }}
            mt={{ base: 3, md: -12 }}
          >
            {/* Search Input */}
            <Box position="relative" flex={{ base: '1', md: 'none' }} width={{ base: '100%', md: '280px' }}>
              <Input
                type="text"
                placeholder="Search counterparties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                w="100%"
                h="36px"
                px={4}
                pr={10}
                fontSize="13px"
                color="#333"
                bg="white"
                border="1px solid #E0E0E0"
                borderRadius="6px"
                outline="none"
                _focus={{
                  borderColor: '#2E7BB4',
                  boxShadow: '0 0 0 1px #2E7BB4',
                }}
                _placeholder={{ color: '#999' }}
              />
              <Box
                position="absolute"
                right="12px"
                top="50%"
                transform="translateY(-50%)"
                pointerEvents="none"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#999"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </Box>
            </Box>

            {/* Year Select */}
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
          ) : filteredCounterparties.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="#666">No counterparties match your search.</Text>
            </Box>
          ) : (
            <VStack gap={{ base: 7, md: 3, lg: 4 }} align="stretch">
              {paginatedCounterparties.map((counterparty, index) => {
                // Calculate the actual index across all pages
                const actualIndex = (currentPage - 1) * itemsPerPage + index;
                return (
                <Box
                  key={counterparty.id}
                  py={{ base: 6, md: 3 }}
                  borderBottom={index < paginatedCounterparties.length - 1 ? '1px solid #E8E8E8' : 'none'}
                >
                  <VStack gap={{ base: 2, md: 2 }} align="stretch" display={{ base: 'flex', md: 'none' }}>
                    <Text fontSize={{ base: "17px", md: "13px" }} color="#333" fontWeight="500" lineHeight="1.4">
                      {actualIndex + 1}. {counterparty.name}
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
                      {actualIndex + 1}. {counterparty.name}
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
              );
              })}
            </VStack>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Box mt={6}>
              <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
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
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <Text fontWeight="400">out of {totalRecords}</Text>
                </HStack>

                <HStack gap={2}>
                  <Button
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
                  </Button>

                  {renderPageNumbers.map((page, idx) => (
                    page === '...' ? (
                      <Text key={`ellipsis-${idx}`} color="#666" px={1}>...</Text>
                    ) : (
                      <Button
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
                      </Button>
                    )
                  ))}

                  <Button
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
                  </Button>
                </HStack>
              </HStack>
            </Box>
          )}
        </Box>

        {/* Submit Button */}
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
            Submit
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
            maxW={{ base: '100%', md: '70vw' }}
            w={{ base: '100%', md: '70vw' }}
            h={{ base: '95vh', md: '95vh' }}
            maxH="95vh"
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
            <VStack gap={{ base: 1.5, md: 1 }} p={{ base: 4, md: 6 }} align="stretch" flex="1" justify="space-between">
              <Box flex="1" overflow="hidden">
                {/* Policy Document Box - PDF Viewer */}
                <Box
                  border={{ base: '1.5px solid #E0E0E0', md: '2px solid #E0E0E0' }}
                  borderRadius="6px"
                  overflow="hidden"
                  bg="white"
                  h={{ base: 'calc(95vh - 230px)', md: 'calc(95vh - 190px)' }}
                >
                  <iframe
                    src="https://icgcprdrgdiag.blob.core.windows.net/ces-images/policydoc.pdf#view=FitH"
                    width="100%"
                    height="100%"
                    style={{ border: 'none', display: 'block' }}
                    title="Personal Account Dealing Policy"
                  />
                </Box>
              </Box>

              <Box flexShrink={0} mt={{ base: 3, md: 2 }}>
                {/* Checkbox Agreement */}
                <Checkbox.Root
                  checked={isAgreed}
                  onCheckedChange={(e) => setIsAgreed(e.checked === true)}
                  size="sm"
                  mb={{ base: 3, md: 3 }}
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
                  {isSubmitting ? 'Submitting...' : 'Complete Declaration'}
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
              Assessment Completed!
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
            <VStack gap={{ base: 1.5, md: 1.5 }} p={{ base: 4, md: 6 }} align="stretch" flex="1">
              <Box flex="1" overflow="hidden">
                {/* Policy Document Box - PDF Viewer */}
                <Box
                  border={{ base: '1.5px solid #E0E0E0', md: '2px solid #E0E0E0' }}
                  borderRadius="6px"
                  overflow="hidden"
                  bg="white"
                  h={{ base: 'calc(85vh - 100px)', md: 'calc(85vh - 100px)' }}
                >
                  <iframe
                    src="https://icgcprdrgdiag.blob.core.windows.net/ces-images/policydoc.pdf#view=FitH"
                    width="100%"
                    height="100%"
                    style={{ border: 'none', display: 'block' }}
                    title="Personal Account Dealing Policy"
                  />
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
