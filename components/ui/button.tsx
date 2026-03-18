import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-heading font-semibold rounded-full transition-all duration-[250ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-green-500 text-white shadow-[0_4px_14px_rgba(34,197,94,0.35)] hover:bg-green-600 hover:shadow-[0_8px_28px_rgba(34,197,94,0.45)] hover:-translate-y-0.5 hover:scale-[1.03] active:translate-y-0 active:scale-[0.98] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        destructive:
          "bg-red-600 text-white shadow-[0_4px_14px_rgba(220,38,38,0.25)] hover:bg-red-700 hover:shadow-[0_8px_24px_rgba(220,38,38,0.35)] hover:-translate-y-0.5 hover:scale-[1.03] active:translate-y-0 active:scale-[0.98]",
        outline:
          "border-[1.5px] border-green-400 bg-transparent text-green-600 hover:border-green-500 hover:bg-green-50/60 hover:shadow-[0_6px_20px_rgba(34,197,94,0.18)] hover:-translate-y-0.5 hover:scale-[1.03] active:translate-y-0 active:scale-[0.98] dark:text-green-400 dark:hover:bg-green-500/10",
        secondary:
          "bg-green-100 text-green-700 hover:bg-green-200 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50",
        ghost:
          "bg-transparent border-[1.5px] border-transparent text-ink dark:text-green-50 hover:border-green-400/30 hover:bg-green-500/6 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]",
        link: "text-green-600 underline-offset-4 hover:underline dark:text-green-400",
      },
      size: {
        default: "h-10 px-5 py-2 text-sm [&_svg]:size-4",
        sm: "h-8 px-3 text-xs [&_svg]:size-3.5",
        lg: "h-12 px-8 text-base [&_svg]:size-5",
        icon: "h-10 w-10 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
