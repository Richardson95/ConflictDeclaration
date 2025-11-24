'use client';

import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@/authConfig';
import Cookies from 'js-cookie';

import { Button, toaster } from '@/components/ui';
import { Box, Heading, VStack, Text, Image } from '@chakra-ui/react';
import { setCredentials } from '@/lib/redux/slices/authSlice';
import { useAppDispatch } from '@/lib/redux/store';
import { useRouter } from 'next/navigation';

const Login = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { instance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);

  const handleSingleSignIn = () => {
    setIsLoading(true);
    instance
      .loginPopup(loginRequest)
      .then((res) => {
        const { accessToken } = res;
        const email = res.account?.username;
        const data = { email };
        const payload = { data, token: accessToken };
        Cookies.set('token', accessToken, { expires: 1 });
        dispatch(setCredentials(payload));
        toaster.success({
          title: 'Login successful',
          description: 'You have been logged in successfully.',
          closable: true,
        });
        router.push('/dashboard');
      })
      .catch(() => {
        toaster.error({
          title: 'Login failed',
          description: 'Login failed, please try again.',
          closable: true,
        });
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Box
      w="100vw"
      h="100vh"
      bg="#2E7BB4"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        bg="white"
        borderRadius="16px"
        p={8}
        w={{ base: '90%', sm: '400px', md: '450px' }}
        boxShadow="xl"
      >
        <VStack gap={6}>
          {/* Logo - Update src path when you add the actual logo */}
          <Image
            src="/infracredit-logo.svg"
            alt="InfraCredit Logo"
            h="80px"
            objectFit="contain"
            style={{ imageRendering: 'crisp-edges' }}
          />

          {/* Title and Subtitle */}
          <VStack gap={1}>
            <Heading
              fontSize="18px"
              fontWeight="700"
              color="#333333"
              textAlign="center"
            >
              Conflict Check Portal
            </Heading>

            <Text
              fontSize="13px"
              color="#666666"
              textAlign="center"
            >
              Click below to access your account
            </Text>
          </VStack>

          {/* Sign In Button */}
          <Button
            onClick={handleSingleSignIn}
            loading={isLoading}
            w="100%"
            bg="#2E7BB4"
            color="white"
            fontSize="16px"
            fontWeight="500"
            h="48px"
            borderRadius="8px"
            _hover={{
              bg: '#5CB85C',
            }}
            _active={{
              bg: '#4FA84F',
            }}
          >
            Sign In
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default Login;
