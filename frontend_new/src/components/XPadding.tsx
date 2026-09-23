import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface Props extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

export default function XPadding({ children, className, ...props }: Props) {
  return (
    <div
      className={`w-full px-4 sm:px-0 max-w-sm mx-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
