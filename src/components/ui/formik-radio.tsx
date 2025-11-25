'use client';

import type { IFormikRadioProps } from '@/lib/interfaces/ui.interface';
import { Field, RadioGroup, VStack } from '@chakra-ui/react';
import { useField } from 'formik';
import { forwardRef } from 'react';

export const FormikRadio = forwardRef<HTMLDivElement, IFormikRadioProps>(
  function FormikRadio(props, ref) {
    const {
      name,
      label,
      helperText,
      isRequired = false,
      showRequiredIndicator = true,
      options,
      ...radioGroupProps
    } = props;

    // Use Formik's useField hook to connect to form state
    const [field, meta, helpers] = useField(name);

    // Determine if field has error
    const hasError = Boolean(meta.error && meta.touched);

    return (
      <Field.Root required={isRequired} invalid={hasError} ref={ref}>
        {label && (
          <Field.Label>
            {label}
            {isRequired && showRequiredIndicator && <Field.RequiredIndicator />}
          </Field.Label>
        )}

        <RadioGroup.Root
          {...radioGroupProps}
          value={field.value || ''}
          onValueChange={(details) => helpers.setValue(details.value)}
          name={field.name}
        >
          <VStack align="start" gap={3}>
            {options.map((option) => (
              <RadioGroup.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
              </RadioGroup.Item>
            ))}
          </VStack>
        </RadioGroup.Root>

        {/* Helper text - only show if no error */}
        {helperText && !hasError && (
          <Field.HelperText>{helperText}</Field.HelperText>
        )}

        {/* Error text - show when there's an error */}
        {hasError && <Field.ErrorText>{meta.error}</Field.ErrorText>}
      </Field.Root>
    );
  }
);
