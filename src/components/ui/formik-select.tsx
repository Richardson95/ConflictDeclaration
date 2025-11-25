'use client';

import type {
  IFormikSelectProps,
  ISelectOption,
} from '@/lib/interfaces/ui.interface';
import { Field, Portal, Select, createListCollection } from '@chakra-ui/react';
import { useField } from 'formik';
import { forwardRef, useMemo } from 'react';

// Simple groupBy function for select options
const groupOptionsByCategory = (
  options: ISelectOption[]
): Record<string, ISelectOption[]> => {
  return options.reduce(
    (result, item) => {
      const group = item.category || 'Other';
      (result[group] = result[group] || []).push(item);
      return result;
    },
    {} as Record<string, ISelectOption[]>
  );
};

export const FormikSelect = forwardRef<HTMLSelectElement, IFormikSelectProps>(
  function FormikSelect(props, ref) {
    const {
      name,
      label,
      helperText,
      isRequired = false,
      showRequiredIndicator = true,
      placeholder = 'Select option...',
      options,
      multiple = false,
      size = 'lg',
      bg = 'gray.100',
      border = '1px solid',
      borderColor = 'border.100',
      borderRadius = 'full',
      _focus = { borderColor: 'brand.100' },
      labelFontSize = 'md',
      labelFontWeight = '600',
      labelColor = 'text.200',
      ...selectProps
    } = props;

    // Use Formik's useField hook to connect to form state
    const [field, meta, helpers] = useField(name);

    // Determine if field has error
    const hasError = Boolean(meta.error && meta.touched);

    // Create collection from options
    const collection = useMemo(() => {
      return createListCollection({
        items: options,
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
      });
    }, [options]);

    // Group options by category if any have categories
    const groupedOptions = useMemo(() => {
      const hasCategories = options.some((option) => option.category);
      if (!hasCategories) return null;

      return Object.entries(groupOptionsByCategory(options));
    }, [options]);

    // Handle value change
    const handleValueChange = (details: { value: string[] }) => {
      if (multiple) {
        helpers.setValue(details.value);
      } else {
        helpers.setValue(details.value[0] || '');
      }
    };

    // Convert field value to array format expected by Select
    const selectValue = useMemo(() => {
      if (multiple) {
        return Array.isArray(field.value)
          ? field.value
          : field.value
            ? [field.value]
            : [];
      }
      return field.value ? [field.value] : [];
    }, [field.value, multiple]);

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

        <Select.Root
          collection={collection}
          value={selectValue}
          onValueChange={handleValueChange}
          multiple={multiple}
          size={size}
          {...selectProps}
        >
          <Select.HiddenSelect ref={ref} name={field.name} />
          <Select.Control>
            <Select.Trigger
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
                '&[data-state="open"]': {
                  border: border,
                  borderColor: _focus.borderColor,
                  outline: 'none',
                  boxShadow: 'none',
                },
                '&:hover': {
                  borderColor: _focus.borderColor,
                },
              }}
            >
              <Select.ValueText placeholder={placeholder} />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>

          <Portal>
            <Select.Positioner>
              <Select.Content>
                {groupedOptions
                  ? // Render grouped options
                    groupedOptions.map(([category, items]) => (
                      <Select.ItemGroup key={category}>
                        <Select.ItemGroupLabel>
                          {category}
                        </Select.ItemGroupLabel>
                        {items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.ItemGroup>
                    ))
                  : // Render flat options
                    options.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>

        {/* Helper text - only show if no error */}
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

        {/* Error text - show when there's an error */}
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
