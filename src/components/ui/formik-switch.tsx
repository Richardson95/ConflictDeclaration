'use client';

import type { IFormikSwitchProps } from '@/lib/interfaces/ui.interface';
import { Field, Switch } from '@chakra-ui/react';
import { useField } from 'formik';
import { forwardRef } from 'react';

export const FormikSwitch = forwardRef<HTMLLabelElement, IFormikSwitchProps>(
  function FormikSwitch(props, ref) {
    const {
      name,
      label,
      helperText,
      isRequired = false,
      showRequiredIndicator = true,
      children,
      ...switchProps
    } = props;

    // Use Formik's useField hook to connect to form state
    const [field, meta, helpers] = useField({ name, type: 'checkbox' });

    // Determine if field has error
    const hasError = Boolean(meta.error && meta.touched);

    return (
      <Field.Root required={isRequired} invalid={hasError}>
        <Switch.Root
          {...switchProps}
          checked={field.checked}
          onCheckedChange={(checked) => helpers.setValue(checked.checked)}
          ref={ref}
        >
          <Switch.HiddenInput name={field.name} />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          {(label || children) && (
            <Switch.Label>
              {label || children}
              {isRequired && showRequiredIndicator && (
                <Field.RequiredIndicator />
              )}
            </Switch.Label>
          )}
        </Switch.Root>

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
