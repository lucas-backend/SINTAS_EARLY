import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function WhiteSheet({ children, className = "" }: Props) {
  return (
    <div
      className={`bg-white flex-1 w-full max-w-md mx-auto -mt-6 rounded-t-[60px] pt-13 pb-8 ${className}`}
    >
      {children}
    </div>
  );
}