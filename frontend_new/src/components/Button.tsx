import type { ButtonHTMLAttributes, ReactNode } from "react";

// Perlu mendefinisikan tipe children dan props standar tombol
export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export default function Button({
  children,
  className = "",
  ...props
}: IButtonProps) {
  return (
    <button
      {...props} // Meneruskan onClick, disabled, type, dll.
      className={`bg-blue-500 font-semibold text-lg py-2 w-full rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
