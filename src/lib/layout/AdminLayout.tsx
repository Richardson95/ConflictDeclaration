'use client';

import React, { useState } from 'react';
import {
  Flex,
  HStack,
  Text,
  Box,
  Badge,
  Image,
  VStack,
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  Avatar,
  IconButton,
  Select as ChakraSelect,
  createListCollection,
} from '@chakra-ui/react';
import { FiBell, FiChevronDown } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { logOut } from '@/lib/redux/slices/authSlice';
import { useRef } from 'react';
import ProfileIcon from '@/assets/icons/profile-icon.png';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Get user info from Redux store
  const userInfo = useAppSelector((state) => state.auth.userInfo);

  const handleLogout = () => {
    dispatch(logOut());
    router.push('/auth/login');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <AdminSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Content Area */}
      <Box
        flex="1"
        ml={{ base: '0', lg: isSidebarCollapsed ? '80px' : '240px' }}
        bg="#EDF5FE"
        transition="margin-left 0.3s ease"
      >
        {/* Top Navigation */}
        <Flex
          px={{ base: 4, md: 6 }}
          height="20"
          alignItems="center"
          bg="white"
          justifyContent="space-between"
          position="sticky"
          top="0"
          left="0"
          right="0"
          zIndex="sticky"
          borderBottom="1px solid #E6E7EC"
        >
          {/* Left side - Logo (mobile only) and Title */}
          <HStack gap={4}>
            <Image
              src="/infracredit-logo.svg"
              alt="InfraCredit"
              h="40px"
              objectFit="contain"
              display={{ base: 'block', lg: 'none' }}
            />
            <Text
              fontSize="18px"
              fontWeight="600"
              color="#227CBF"
              display={{ base: 'none', md: 'block' }}
            >
              Conflicts Check Portal
            </Text>
          </HStack>

          {/* Right side - Notification and Profile */}
          <HStack gap={{ base: '2', md: '4' }}>
            {/* Notification Bell */}
            <Box position="relative" role="group">
              <IconButton
                variant="ghost"
                aria-label="notification"
                _hover={{ bg: 'gray.100' }}
                transition="all 0.2s"
                size="lg"
              >
                <FiBell size={28} />
              </IconButton>
              <Badge
                position="absolute"
                top="8px"
                right="8px"
                bg="#5CB85C"
                color="white"
                fontSize="9px"
                borderRadius="full"
                fontWeight={700}
                minW="16px"
                h="16px"
                px="4px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                lineHeight="1"
                transition="all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)"
                _groupHover={{
                  transform: 'scale(1.2)',
                }}
              >
                10
              </Badge>
            </Box>

            {/* User Profile Dropdown */}
            <Box position="relative">
              <MenuRoot>
                <MenuTrigger asChild>
                  <HStack
                    cursor="pointer"
                    _hover={{ bg: 'gray.50' }}
                    p={2}
                    borderRadius="8px"
                    transition="all 0.2s"
                  >
                    <Avatar.Root size="sm">
                      <Avatar.Image
                        src={profileImage || ProfileIcon.src}
                        alt="Peter Adams"
                      />
                      <Avatar.Fallback bg="#2E7BB4" color="white">PA</Avatar.Fallback>
                    </Avatar.Root>
                    <VStack
                      alignItems="flex-start"
                      gap={0}
                      display={{ base: 'none', md: 'flex' }}
                    >
                      <Text fontSize="14px" fontWeight="600" color="#333">
                        Peter Adams
                      </Text>
                      <Text fontSize="12px" color="#666">
                        IT Admin
                      </Text>
                    </VStack>
                    <FiChevronDown color="#666" />
                  </HStack>
                </MenuTrigger>

                <MenuContent
                  minW="200px"
                  p={1}
                  borderRadius="8px"
                  boxShadow="lg"
                  bg="white"
                  position="absolute"
                  top="100%"
                  right="0"
                  mt={1}
                  zIndex={1000}
                >
                  <MenuItem
                    value="dashboard"
                    fontSize="13px"
                    py={1.5}
                    px={3}
                    bg="white"
                    _hover={{ bg: 'gray.50' }}
                    cursor="pointer"
                    onClick={handleBackToDashboard}
                    borderRadius="4px"
                  >
                    Back to Dashboard
                  </MenuItem>
                  <MenuItem
                    value="upload"
                    fontSize="13px"
                    py={1.5}
                    px={3}
                    bg="white"
                    _hover={{ bg: 'gray.50' }}
                    cursor="pointer"
                    onClick={handleUploadClick}
                    borderRadius="4px"
                  >
                    Upload picture
                  </MenuItem>
                  <MenuItem
                    value="logout"
                    fontSize="13px"
                    py={1.5}
                    px={3}
                    bg="white"
                    _hover={{ bg: 'red.50' }}
                    cursor="pointer"
                    onClick={handleLogout}
                    borderRadius="4px"
                  >
                    Logout
                  </MenuItem>
                </MenuContent>
              </MenuRoot>
            </Box>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </HStack>
        </Flex>

        {/* Page Content */}
        <Box>{children}</Box>
      </Box>
    </Flex>
  );
};

export default AdminLayout;
