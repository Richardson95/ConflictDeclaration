'use client';

import { Box, VStack, HStack, Text, Image, IconButton } from '@chakra-ui/react';
import { useRouter, usePathname } from 'next/navigation';
import { FiGrid, FiUsers, FiUser, FiSettings } from 'react-icons/fi';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}

const SidebarItem = ({ icon, label, isActive, onClick, isCollapsed }: SidebarItemProps) => {
  return (
    <HStack
      px={4}
      py={3}
      cursor="pointer"
      onClick={onClick}
      bg={isActive ? '#227CBF' : 'transparent'}
      color={isActive ? 'white' : '#666'}
      _hover={{
        bg: isActive ? '#227CBF' : '#F5F5F5',
      }}
      transition="all 0.2s"
      gap={3}
      w="100%"
      justifyContent={isCollapsed ? 'center' : 'flex-start'}
    >
      <Box fontSize="18px">{icon}</Box>
      {!isCollapsed && (
        <Text fontSize="14px" fontWeight={isActive ? '600' : '400'}>
          {label}
        </Text>
      )}
    </HStack>
  );
};

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar = ({ isCollapsed, onToggle }: AdminSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { icon: <FiGrid />, label: 'Dashboard', path: '/admin' },
    { icon: <FiUsers />, label: 'Counterparties', path: '/admin/counterparties' },
    { icon: <FiUser />, label: 'Employees', path: '/admin/employees' },
    { icon: <FiSettings />, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <Box
      w={isCollapsed ? '80px' : '240px'}
      minH="100vh"
      bg="white"
      borderRight="1px solid"
      borderColor="#E6E7EC"
      position="fixed"
      left="0"
      top="0"
      display={{ base: 'none', lg: 'block' }}
      transition="width 0.3s ease"
    >
      {/* Logo and Toggle Button */}
      <HStack
        px={isCollapsed ? 4 : 6}
        py={5}
        borderBottom="1px solid #E6E7EC"
        justifyContent={isCollapsed ? 'center' : 'space-between'}
      >
        {!isCollapsed && (
          <Image
            src="/infracredit-logo.svg"
            alt="InfraCredit"
            h="35px"
            objectFit="contain"
          />
        )}
        <IconButton
          variant="ghost"
          aria-label="Toggle sidebar"
          onClick={onToggle}
          size="sm"
          _hover={{ bg: 'gray.100' }}
        >
          <Image src="/open-and-close-sidebar.png" alt="Toggle" width="20px" height="20px" />
        </IconButton>
      </HStack>

      {/* Menu Items */}
      <VStack gap={1} pt={4} align="stretch">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={pathname === item.path}
            onClick={() => router.push(item.path)}
            isCollapsed={isCollapsed}
          />
        ))}
      </VStack>
    </Box>
  );
};

export default AdminSidebar;
