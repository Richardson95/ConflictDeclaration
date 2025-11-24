import type { ButtonProps as ChakraButtonProps } from '@chakra-ui/react';

interface IButtonLoadingProps {
  loading?: boolean;
  loadingText?: React.ReactNode;
  spinner?: React.ReactNode;
  spinnerPlacement?: 'start' | 'end';
}

interface IButtonIconProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconSpacing?: string;
}
import {
  AbsoluteCenter,
  Button as ChakraButton,
  HStack,
  Span,
  Spinner,
} from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface ButtonProps
  extends ChakraButtonProps,
    IButtonLoadingProps,
    IButtonIconProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const {
      loading,
      disabled,
      loadingText,
      spinner,
      spinnerPlacement = 'start',
      leftIcon,
      rightIcon,
      iconSpacing = '2',
      children,
      variant = 'solid',
      size = 'md',
      fontWeight = '600',
      fontSize = 'md',
      bg,
      color,
      border,
      borderColor,
      borderRadius = 'full',
      px = '6',
      _hover,
      ...rest
    } = props;

    // Define default styles based on variant
    const getVariantStyles = () => {
      switch (variant) {
        case 'solid':
          return {
            bg: bg || 'brand.100',
            color: color || 'white',
            _hover: _hover || {
              bg: 'brand.200',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: borderRadius || 'full',
            px: px || '6',
          };
        case 'outline':
          return {
            bg: bg || 'white',
            color: color || 'brand.100',
            border: border || '1px solid',
            borderColor: borderColor || 'brand.100',
            _hover: _hover || {
              bg: 'brand.100',
              color: 'white',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: borderRadius || 'full',
            px: px || '6',
          };
        case 'ghost':
          return {
            bg: bg || 'transparent',
            color: color || 'brand.100',
            _hover: _hover || {
              bg: 'brand.50',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: borderRadius || 'full',
            px: px || '6',
          };
        default:
          return {
            bg: bg || 'brand.100',
            color: color || 'white',
            _hover: _hover || {
              bg: 'brand.200',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: borderRadius || 'full',
            px: px || '6',
          };
      }
    };

    const variantStyles = getVariantStyles();

    // Custom spinner or default Spinner
    const LoadingSpinner = spinner || (
      <Spinner size="inherit" color="inherit" />
    );

    // Render loading state
    if (loading) {
      if (loadingText) {
        return (
          <ChakraButton
            disabled={loading || disabled}
            ref={ref}
            variant={variant}
            size={size}
            fontWeight={fontWeight}
            fontSize={fontSize}
            {...variantStyles}
            {...rest}
          >
            <HStack gap={iconSpacing}>
              {spinnerPlacement === 'start' && LoadingSpinner}
              <Span>{loadingText}</Span>
              {spinnerPlacement === 'end' && LoadingSpinner}
            </HStack>
          </ChakraButton>
        );
      } else {
        return (
          <ChakraButton
            disabled={loading || disabled}
            ref={ref}
            variant={variant}
            size={size}
            fontWeight={fontWeight}
            fontSize={fontSize}
            {...variantStyles}
            {...rest}
          >
            <AbsoluteCenter display="inline-flex">
              {LoadingSpinner}
            </AbsoluteCenter>
            <Span opacity={0}>
              <HStack gap={iconSpacing}>
                {leftIcon}
                {children}
                {rightIcon}
              </HStack>
            </Span>
          </ChakraButton>
        );
      }
    }

    // Render normal state with icons
    const hasIcons = leftIcon || rightIcon;

    return (
      <ChakraButton
        disabled={disabled}
        ref={ref}
        variant={variant}
        size={size}
        fontWeight={fontWeight}
        fontSize={fontSize}
        {...variantStyles}
        {...rest}
      >
        {hasIcons ? (
          <HStack gap={iconSpacing}>
            {leftIcon}
            {children}
            {rightIcon}
          </HStack>
        ) : (
          children
        )}
      </ChakraButton>
    );
  }
);
