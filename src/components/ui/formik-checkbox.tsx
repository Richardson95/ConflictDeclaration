'use client';

import type { IFormikCheckboxProps } from '@/lib/interfaces/ui.interface';
import { Field, Checkbox } from '@chakra-ui/react';
import { useField } from 'formik';
import { forwardRef } from 'react';

export const FormikCheckbox = forwardRef<
  HTMLLabelElement,
  IFormikCheckboxProps
>(function FormikCheckbox(props, ref) {
  const {
    name,
    label,
    helperText,
    isRequired = false,
    showRequiredIndicator = true,
    labelFontSize = 'md',
    labelFontWeight = '600',
    labelColor = 'text.200',
    colorPalette = 'blue',
    variant = 'solid',
    ...checkboxProps
  } = props;

  const [field, meta, helpers] = useField(name);

  const hasError = Boolean(meta.error && meta.touched);

  return (
    <Field.Root required={isRequired} invalid={hasError}>
      <Checkbox.Root
        {...checkboxProps}
        checked={field.value || false}
        onCheckedChange={(details) => helpers.setValue(details.checked)}
        name={field.name}
        ref={ref}
        colorPalette={colorPalette}
        variant={variant}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Label>
          {label && (
            <span
              style={{
                fontSize: labelFontSize,
                fontWeight: labelFontWeight,
                color: labelColor,
              }}
            >
              {label}
            </span>
          )}
          {isRequired && showRequiredIndicator && <Field.RequiredIndicator />}
        </Checkbox.Label>
      </Checkbox.Root>

      {helperText && !hasError && (
        <Field.HelperText>{helperText}</Field.HelperText>
      )}

      {hasError && <Field.ErrorText>{meta.error}</Field.ErrorText>}
    </Field.Root>
  );
});
