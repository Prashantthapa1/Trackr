import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border-2 border-green-300/40 bg-white px-4 py-2 font-body text-sm text-foreground ring-offset-background transition-all duration-200 placeholder:text-muted-foreground hover:border-green-400/60 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-700/40 dark:bg-zinc-900 dark:hover:border-green-600/60 dark:focus:border-green-500 dark:focus:ring-green-500/30 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
