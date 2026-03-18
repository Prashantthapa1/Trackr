import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-heading transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-green-300/60 bg-green-100 text-green-700 dark:border-green-700/60 dark:bg-green-900/30 dark:text-green-400",
        secondary:
          "border border-transparent bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
        destructive:
          "border border-transparent bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        outline:
          "border border-green-400/40 bg-transparent text-green-700 dark:border-green-600/40 dark:text-green-400",
        income:
          "border border-green-300 bg-green-100 text-green-700 dark:border-green-700 dark:bg-green-900/40 dark:text-green-400",
        expense:
          "border border-red-300 bg-red-100 text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-400",
        warning:
          "border border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
        neutral:
          "border border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400",
        pro:
          "border border-green-400 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
