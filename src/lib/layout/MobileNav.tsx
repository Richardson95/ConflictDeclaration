'use client';

import {
  Flex,
  HStack,
  Text,
  Box,
  Image,
  VStack,
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  Avatar,
  IconButton,
  Button,
} from '@chakra-ui/react';
import { FiChevronDown, FiSettings } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import { logOut } from '@/lib/redux/slices/authSlice';
import { useRef, useState, useEffect } from 'react';
import ProfileIcon from '@/assets/icons/profile-icon.png';
import { useGetCurrentUserQuery, useUploadProfileImageMutation } from '@/lib/redux/services/auth.service';
import { hasAdminAccess } from '@/lib/constants/roles';
import { toaster } from '@/components/ui';

const MobileNav = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Get user info from Redux store
  const userInfo = useAppSelector((state) => state.auth.userInfo);

  // Fetch current user data from API
  const { data: currentUserData } = useGetCurrentUserQuery();
  const currentUser = currentUserData?.data;

  // Upload profile image mutation
  const [uploadProfileImage, { isLoading: isUploading }] = useUploadProfileImageMutation();

  // Check if user has admin access (Admin = 3 or ITAdmin = 4)
  const isAdmin = hasAdminAccess(currentUser?.role);

  // Load profile image from current user data
  useEffect(() => {
    if (currentUser?.profileImageUrl) {
      setProfileImage(currentUser.profileImageUrl);
    }
  }, [currentUser]);

  const handleLogout = () => {
    dispatch(logOut());
    router.push('/auth/login');
  };

  const handleAdminPanel = () => {
    router.push('/admin');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Create FormData and upload file
      const formData = new FormData();
      formData.append('file', file);

      try {
        // Upload to backend
        const result = await uploadProfileImage(formData).unwrap();

        // Update local state with returned URL
        if (result?.data?.profileImageUrl) {
          setProfileImage(result.data.profileImageUrl);
        }

        toaster.success({
          title: 'Success',
          description: 'Profile picture updated successfully',
          closable: true,
        });
      } catch (error: any) {
        console.error('Failed to upload profile picture:', error);
        console.error('Error details:', {
          status: error?.status,
          data: error?.data,
          message: error?.data?.message || error?.message,
        });

        const errorMessage = error?.data?.message || error?.message || 'Failed to update profile picture. Please try again.';

        toaster.error({
          title: 'Upload Failed',
          description: errorMessage,
          closable: true,
        });
        // Revert to previous image on error
        setProfileImage(currentUser?.profileImageUrl || null);
      }
    }
  };

  return (
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
      {/* Left side - Logo */}
      <HStack gap={4}>
        <Image
          src="/infracredit-logo.svg"
          alt="InfraCredit"
          h="40px"
          objectFit="contain"
        />
      </HStack>

      {/* Center - Title */}
      <Text
        fontSize="28px"
        fontWeight="600"
        color="#2E7BB4"
        display={{ base: 'none', md: 'block' }}
        position="absolute"
        left="42%"
        transform="translateX(-50%)"
      >
        Conflict Check Management System 1.0
      </Text>

      {/* Right side - Admin Panel and Profile */}
      <HStack gap={{ base: '2', md: '4' }}>
        {/* Admin Panel Button - Only visible to admins */}
        {isAdmin && (
          <>
            {/* Desktop version with text */}
            <Button
              onClick={handleAdminPanel}
              bg="#2E7BB4"
              color="white"
              _hover={{ bg: '#236096' }}
              fontSize="14px"
              fontWeight="500"
              px={4}
              h="40px"
              display={{ base: 'none', md: 'flex' }}
              gap={2}
            >
              <FiSettings size={18} />
              Admin Panel
            </Button>
            {/* Mobile version - icon only */}
            <IconButton
              onClick={handleAdminPanel}
              bg="#2E7BB4"
              color="white"
              _hover={{ bg: '#236096' }}
              aria-label="Admin Panel"
              size="lg"
              display={{ base: 'flex', md: 'none' }}
            >
              <FiSettings size={20} />
            </IconButton>
          </>
        )}

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
                    alt={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User'}
                  />
                  <Avatar.Fallback bg="#2E7BB4" color="white">
                    {currentUser
                      ? `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase()
                      : 'U'}
                  </Avatar.Fallback>
                </Avatar.Root>
                <VStack
                  alignItems="flex-start"
                  gap={0}
                  display={{ base: 'none', md: 'flex' }}
                >
                  <Text fontSize="14px" fontWeight="600" color="#333">
                    {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Loading...'}
                  </Text>
                  <Text fontSize="12px" color="#666">
                    {currentUser?.email || 'Loading...'}
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
  );
};

export default MobileNav;
