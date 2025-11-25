'use client';

import type { GroupProps } from '@chakra-ui/react';
import { Group } from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface ButtonGroupProps extends GroupProps {
  attached?: boolean; // Optional: Whether buttons are attached
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'; // Optional: Size for all buttons
  variant?: 'solid' | 'subtle' | 'surface' | 'outline' | 'ghost' | 'plain'; // Optional: Variant for all buttons
  colorPalette?:
    | 'gray'
    | 'red'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'teal'
    | 'blue'
    | 'cyan'
    | 'purple'
    | 'pink'; // Optional: Color palette for all buttons
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(props, ref) {
    const {
      attached = false,
      size,
      variant,
      colorPalette,
      children,
      ...rest
    } = props;

    return (
      <Group
        ref={ref}
        attached={attached}
        // Pass common props to children buttons
        data-size={size}
        data-variant={variant}
        data-color-palette={colorPalette}
        {...rest}
      >
        {children}
      </Group>
    );
  }
);
