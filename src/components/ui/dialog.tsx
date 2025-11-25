'use client';

import type { IDialogProps } from '@/lib/interfaces/ui.interface';
import { Dialog as ChakraDialog, Portal, CloseButton } from '@chakra-ui/react';
import { Button } from './button';
import { forwardRef } from 'react';

export const Dialog = forwardRef<HTMLDivElement, IDialogProps>(
  function Dialog(props, ref) {
    const {
      title,
      description,
      confirmText = 'Confirm',
      onConfirm,
      onCancel,
      isLoading = false,
      children,
      ...dialogProps
    } = props;

    return (
      <ChakraDialog.Root {...dialogProps}>
        <Portal>
          <ChakraDialog.Backdrop />
          <ChakraDialog.Positioner>
            <ChakraDialog.Content ref={ref}>
              <ChakraDialog.Header>
                {title && <ChakraDialog.Title>{title}</ChakraDialog.Title>}
                <ChakraDialog.CloseTrigger />
              </ChakraDialog.Header>

              <ChakraDialog.Body>
                {description && (
                  <ChakraDialog.Description>
                    {description}
                  </ChakraDialog.Description>
                )}
                {children}
              </ChakraDialog.Body>

              {(onConfirm || onCancel) && (
                <ChakraDialog.Footer>
                  <ChakraDialog.CloseTrigger asChild>
                    <CloseButton
                      size="md"
                      _hover={{ bg: 'transparent' }}
                      onClick={onCancel}
                    />
                  </ChakraDialog.CloseTrigger>

                  {onConfirm && (
                    <Button
                      colorPalette="blue"
                      onClick={onConfirm}
                      loading={isLoading}
                    >
                      {confirmText}
                    </Button>
                  )}
                </ChakraDialog.Footer>
              )}
            </ChakraDialog.Content>
          </ChakraDialog.Positioner>
        </Portal>
      </ChakraDialog.Root>
    );
  }
);
