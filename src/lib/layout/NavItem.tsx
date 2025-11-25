'use client';

import type { FlexProps } from '@chakra-ui/react';
import { Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItemProps extends FlexProps {
  icon: string | React.ReactNode;
  children: React.ReactNode;
  path?: string;
  iconActive: string | React.ReactNode;
  onClick?: () => void;
}

const NavItem = ({ icon, children, ...rest }: NavItemProps) => {
  const pathname = usePathname();
  const [onHover, setOnHover] = useState(false);
  return (
    <Link
      href={rest.path || '#'}
      style={{ textDecoration: 'none' }}
      onClick={rest.onClick}
    >
      <Flex
        align="center"
        p="3"
        mb="1"
        role="group"
        cursor="pointer"
        gap="2"
        _hover={{
          bg: 'brand.200',
          color: 'brand.100',
        }}
        bg={pathname === rest.path ? 'brand.200' : 'transparent'}
        color={onHover || pathname === rest.path ? 'brand.100' : 'bodyText.400'}
        fontWeight="regular"
        fontSize="14px"
        onMouseEnter={() => setOnHover(true)}
        onMouseLeave={() => setOnHover(false)}
        {...rest}
      >
        {onHover || pathname === rest.path ? rest.iconActive : icon}
        {/* <Image
          src={onHover || pathname === rest.path ? rest.iconActive : icon}
          alt="icon"
          width="20px"
          height="20px"
          mr="4"
        /> */}
        {children}
      </Flex>
    </Link>
  );
};

export default NavItem;
