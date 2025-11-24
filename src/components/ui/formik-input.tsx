'use client';

import type {
  IFormikInputProps,
  IFormikInputRef,
} from '@/lib/interfaces/ui.interface';
import { Field, Input } from '@chakra-ui/react';
import { useField } from 'formik';
import { forwardRef } from 'react';

export const FormikInput = forwardRef<IFormikInputRef, IFormikInputProps>(
  function FormikInput(props, ref) {
    const {
      name,
      label,
      helperText,
      isRequired = false,
      showRequiredIndicator = true,
      size = 'xl',
      bg = 'gray.100',
      border = '1px solid',
      borderColor = 'border.100',
      borderRadius = 'full',
      _focus = { borderColor: 'brand.100' },
      _placeholder = { color: 'gray.200' },
      labelFontSize = 'md',
      labelFontWeight = '600',
      labelColor = 'text.200',
      ...inputProps
    } = props;

    const [field, meta] = useField(name);

    const hasError = Boolean(meta.error && meta.touched);

    return (
      <Field.Root required={isRequired} invalid={hasError}>
        {label && (
          <Field.Label
            fontSize={labelFontSize}
            fontWeight={labelFontWeight}
            color={labelColor}
          >
            {label}
            {(isRequired || showRequiredIndicator) && (
              <Field.RequiredIndicator color="red.500" />
            )}
          </Field.Label>
        )}

        <Input
          ref={ref}
          {...field}
          size={size}
          css={{
            backgroundColor: bg,
            border: border,
            borderColor: borderColor,
            borderRadius: borderRadius,
            '&:focus': {
              border: border,
              borderColor: _focus.borderColor,
              outline: 'none',
              boxShadow: 'none',
            },
            '&[data-focus]': {
              border: border,
              borderColor: _focus.borderColor,
              outline: 'none',
              boxShadow: 'none',
            },
            '&:hover': {
              borderColor: _focus.borderColor,
            },
            '&::placeholder': _placeholder,
          }}
          {...inputProps}
          name={field.name}
        />

        {helperText && !hasError && (
          <Field.HelperText
            color="gray.200"
            fontSize="sm"
            fontWeight="400"
            mt={-1}
          >
            {helperText}
          </Field.HelperText>
        )}

        {hasError && (
          <Field.ErrorText
            color="red.500"
            fontSize="sm"
            fontWeight="400"
            mt={-1}
          >
            {meta.error}
          </Field.ErrorText>
        )}
      </Field.Root>
    );
  }
);
