'use client';

import { BoxProps, Button, Dialog, Portal } from '@chakra-ui/react';
import { Box, CloseButton, Flex, Text } from '@chakra-ui/react';
import { useState } from 'react';

import { logOut } from '@/lib/redux/slices/authSlice';
import { useAppDispatch } from '@/lib/redux/store';

import NavItem from './NavItem';
import { FiHome, FiLogOut } from 'react-icons/fi';

interface LinkItemProps {
  name: string;
  icon: string | React.ReactNode;
  path: string;
  iconActive: string | React.ReactNode;
}

const LinkItems: Array<LinkItemProps> = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <FiHome />,
    iconActive: <FiHome />,
  },
];

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const handleLogOutAlert = () => {
    setOpen(true);
  };

  const handleLogOut = () => {
    dispatch(logOut());
  };

  return (
    <Box
      transition="3s ease"
      bg="white"
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      overflowY="auto"
      borderRight="1px solid #E6E7EC"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="20px" fontWeight="bold">
          Logo
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>

      {LinkItems.map((link) => (
        <NavItem
          key={link.name}
          icon={link.icon}
          path={link.path}
          iconActive={link.iconActive}
        >
          {link.name}
        </NavItem>
      ))}

      {/* log out */}
      <Box mt={10} />
      <NavItem
        icon={<FiLogOut />}
        iconActive={<FiLogOut />}
        onClick={handleLogOutAlert}
      >
        Log out
      </NavItem>

      <Box mb={10} />

      <Dialog.Root size="md" open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Log out</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text>Are you sure you want to log out?</Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" color="brand.100">
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button color="white" bg="brand.100" onClick={handleLogOut}>
                  Log out
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};

export default SidebarContent;
