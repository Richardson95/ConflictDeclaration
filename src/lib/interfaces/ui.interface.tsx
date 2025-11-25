import type {
  InputProps as ChakraInputProps,
  TextareaProps as ChakraTextareaProps,
  SelectRootProps as ChakraSelectRootProps,
  CheckboxRootProps as ChakraCheckboxRootProps,
  RadioGroupRootProps as ChakraRadioGroupRootProps,
  SwitchRootProps as ChakraSwitchRootProps,
  AlertRootProps as ChakraAlertRootProps,
  DialogRootProps as ChakraDialogRootProps,
} from '@chakra-ui/react';

export interface IFormikInputProps extends ChakraInputProps {
  name: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  showRequiredIndicator?: boolean;
  labelFontSize?: string;
  labelFontWeight?: string;
  labelColor?: string;
}
export interface IFormikFieldState {
  value: string;
  error?: string;
  touched: boolean;
}

export type IFormikInputRef = HTMLInputElement;

export interface IFormikPasswordInputProps extends ChakraInputProps {
  name: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  showRequiredIndicator?: boolean;
  labelFontSize?: string;
  labelFontWeight?: string;
  labelColor?: string;
  // Password-specific props
  defaultVisible?: boolean;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  visibilityIcon?: {
    on: React.ReactNode;
    off: React.ReactNode;
  };
}

export interface IFormikTextareaProps extends ChakraTextareaProps {
  name: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  showRequiredIndicator?: boolean;
  labelFontSize?: string;
  labelFontWeight?: string;
  labelColor?: string;
}

export type IFormikTextareaRef = HTMLTextAreaElement;

export interface ISelectOption {
  label: string;
  value: string;
  category?: string;
  disabled?: boolean;
}

export interface IFormikSelectProps
  extends Omit<
    ChakraSelectRootProps,
    'collection' | 'value' | 'onValueChange'
  > {
  name: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  showRequiredIndicator?: boolean;
  placeholder?: string;
  options: ISelectOption[];
  multiple?: boolean;
  labelFontSize?: string;
  labelFontWeight?: string;
  labelColor?: string;
}

export interface IFormikCheckboxProps
  extends Omit<ChakraCheckboxRootProps, 'checked' | 'onCheckedChange'> {
  name: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  showRequiredIndicator?: boolean;
  labelFontSize?: string;
  labelFontWeight?: string;
  labelColor?: string;
}

export interface IFormikRadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface IFormikRadioProps
  extends Omit<ChakraRadioGroupRootProps, 'value' | 'onValueChange'> {
  name: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  showRequiredIndicator?: boolean;
  options: IFormikRadioOption[];
}

export interface IFormikSwitchProps
  extends Omit<ChakraSwitchRootProps, 'checked' | 'onCheckedChange'> {
  name: string;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  showRequiredIndicator?: boolean;
}

export interface IAlertProps extends ChakraAlertRootProps {
  title?: string;
  description?: string;
  status?: 'info' | 'warning' | 'success' | 'error';
  variant?: 'subtle' | 'solid' | 'outline';
  showIcon?: boolean;
  onClose?: () => void;
}

export interface IDialogProps extends Omit<ChakraDialogRootProps, 'children'> {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export interface IToastOptions {
  title?: string;
  description?: string;
  type?: 'info' | 'warning' | 'success' | 'error' | 'loading';
  duration?: number;
  closable?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  id?: string;
}
