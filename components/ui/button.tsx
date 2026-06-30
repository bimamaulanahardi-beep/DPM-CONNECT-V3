import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'bg-navy-900 text-white hover:bg-navy-800 shadow-lg shadow-navy-900/20 hover:shadow-xl hover:shadow-navy-900/30',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg',
        outline:
          'border-2 border-navy-900 bg-transparent text-navy-900 hover:bg-navy-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-navy-900',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent/10 hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        gold:
          'bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 hover:from-gold-500 hover:to-gold-600 shadow-lg shadow-gold-400/30 hover:shadow-xl hover:shadow-gold-500/40 font-bold',
        'outline-gold':
          'border-2 border-gold-400 bg-transparent text-gold-400 hover:bg-gold-400 hover:text-navy-900',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
