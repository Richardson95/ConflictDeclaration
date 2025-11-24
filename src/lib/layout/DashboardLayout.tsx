'use client';

import { Box } from '@chakra-ui/react';

import MobileNav from './MobileNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <Box minH="100vh" bg="#EDF5FE">
      {/* Header/Nav */}
      <MobileNav />
      <Box pt={{ base: 6, md: 8, lg: 10 }} px="4" pb="4" bg="#EDF5FE">
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
