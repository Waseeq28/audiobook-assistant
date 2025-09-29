import * as React from 'react';
import { Text as RNText } from 'react-native';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

export const TextClassContext = React.createContext<string | undefined>(undefined);

const textVariants = cva('text-base text-foreground', {
  variants: {
    variant: {
      default: 'text-foreground',
      destructive: 'text-destructive',
      muted: 'text-muted-foreground',
      accent: 'text-accent-foreground',
      secondary: 'text-secondary-foreground',
    },
    size: {
      default: 'text-base',
      sm: 'text-sm',
      lg: 'text-lg',
      xl: 'text-xl',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

interface TextProps extends React.ComponentProps<typeof RNText>, VariantProps<typeof textVariants> {
  className?: string;
}

const Text = React.forwardRef<RNText, TextProps>(({ className, variant, size, ...props }, ref) => {
  const textClass = React.useContext(TextClassContext);
  return (
    <RNText
      ref={ref}
      className={cn(textVariants({ variant, size }), textClass, className)}
      {...props}
    />
  );
});
Text.displayName = 'Text';

export { Text, textVariants };
export type { TextProps };
