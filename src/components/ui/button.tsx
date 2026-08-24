import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-[#68332A] active:bg-[#582A22]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-[#344E44] active:bg-[#2B4038]",
        outline:
          "border border-[#918579] bg-transparent text-foreground hover:bg-[#E8E2D7]/50 active:bg-[#E8E2D7]",
        subtle:
          "border border-border bg-card text-foreground hover:bg-[#E8E2D7]/60 active:bg-[#E8E2D7]",
        ghost: "text-foreground hover:bg-[#E8E2D7]/60 active:bg-[#E8E2D7]",
        link: "text-[#704037] underline-offset-4 hover:underline hover:text-[#582A22] p-0 h-auto font-normal",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-[#852E2E] active:bg-[#722727]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
