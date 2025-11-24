'use client';

import type { IAlertProps } from '@/lib/interfaces/ui.interface';
import { Alert as ChakraAlert, CloseButton } from '@chakra-ui/react';
import { forwardRef } from 'react';
import {
  RiCheckboxCircleLine,
  RiInformationLine,
  RiErrorWarningLine,
  RiAlertLine,
} from 'react-icons/ri';

const statusIcons = {
  success: <RiCheckboxCircleLine />,
  info: <RiInformationLine />,
  warning: <RiAlertLine />,
  error: <RiErrorWarningLine />,
};

export const Alert = forwardRef<HTMLDivElement, IAlertProps>(
  function Alert(props, ref) {
    const {
      title,
      description,
      status = 'info',
      variant = 'subtle',
      showIcon = true,
      onClose,
      children,
      ...alertProps
    } = props;

    return (
      <ChakraAlert.Root
        ref={ref}
        status={status}
        variant={variant}
        {...alertProps}
      >
        {showIcon && (
          <ChakraAlert.Indicator>{statusIcons[status]}</ChakraAlert.Indicator>
        )}

        <ChakraAlert.Content>
          {title && <ChakraAlert.Title>{title}</ChakraAlert.Title>}
          {description && (
            <ChakraAlert.Description>{description}</ChakraAlert.Description>
          )}
          {children}
        </ChakraAlert.Content>

        {onClose && (
          <CloseButton
            size="sm"
            onClick={onClose}
            position="absolute"
            top={2}
            right={2}
          />
        )}
      </ChakraAlert.Root>
    );
  }
);
