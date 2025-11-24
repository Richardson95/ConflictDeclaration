'use client';

import type {
  IFormikPasswordInputProps,
  IFormikInputRef,
} from '@/lib/interfaces/ui.interface';
import { Field } from '@chakra-ui/react';
import { useField } from 'formik';
import { forwardRef } from 'react';
import { PasswordInput } from './password-input';

export const FormikPasswordInput = forwardRef<
  IFormikInputRef,
  IFormikPasswordInputProps
>(function FormikPasswordInput(props, ref) {
  const {
    name,
    label,
    helperText,
    isRequired = false,
    showRequiredIndicator = true,
    defaultVisible,
    visible,
    onVisibleChange,
    visibilityIcon,
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
          {isRequired && showRequiredIndicator && <Field.RequiredIndicator />}
        </Field.Label>
      )}

      <PasswordInput
        ref={ref}
        {...field}
        size={size}
        bg={bg}
        border={border}
        borderColor={borderColor}
        borderRadius={borderRadius}
        _focus={_focus}
        _placeholder={_placeholder}
        {...inputProps}
        name={field.name}
        defaultVisible={defaultVisible}
        visible={visible}
        onVisibleChange={onVisibleChange}
        visibilityIcon={visibilityIcon}
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
        <Field.ErrorText color="red.500" fontSize="sm" fontWeight="400" mt={-1}>
          {meta.error}
        </Field.ErrorText>
      )}
    </Field.Root>
  );
});
