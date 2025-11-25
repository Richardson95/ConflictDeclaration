'use client';

import { Box, Spinner, VStack, Text } from '@chakra-ui/react';

export const PageLoader = () => {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(255, 255, 255, 0.95)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="9999"
    >
      <VStack gap={4}>
        <Spinner size="xl" color="#2E7BB4" />
        <Text fontSize="16px" color="#666" fontWeight="500">
          Loading...
        </Text>
      </VStack>
    </Box>
  );
};

export const SkeletonLoader = () => {
  return (
    <Box p={6} bg="#EDF5FE" minH="100vh">
      <Box
        bg="#E2E8F0"
        h="40px"
        w="300px"
        borderRadius="8px"
        mb={6}
        animation="pulse 1.5s ease-in-out infinite"
      />
      <Box
        bg="#E2E8F0"
        h="200px"
        borderRadius="12px"
        animation="pulse 1.5s ease-in-out infinite"
      />
    </Box>
  );
};
