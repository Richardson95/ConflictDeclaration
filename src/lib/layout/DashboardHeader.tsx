import { Text, Stack, HStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

type DashboardHeaderProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

const DashboardHeader = ({
  title,
  description,
  children,
}: DashboardHeaderProps) => {
  return (
    <HStack
      justify="space-between"
      mt={5}
      mb={5}
      w="100%"
      flexDirection={{ base: 'column', md: 'row' }}
      alignItems={{ base: 'flex-start', md: 'center' }}
    >
      <Stack direction="column" gap={2} w={{ base: '100%', md: 'auto' }}>
        <Text color="brand.600" fontSize="xl" fontWeight={800}>
          {title}
        </Text>
        <Text color="bodyText.800" fontSize="14px" fontWeight={400} mt={-2}>
          {description}
        </Text>
      </Stack>

      <Stack
        direction="row"
        gap={2}
        align="center"
        justifyContent="flex-end"
        w={{ base: '100%', md: '50%', lg: '40%' }}
      >
        {children}
      </Stack>
    </HStack>
  );
};

export default DashboardHeader;
