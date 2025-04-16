import React from "react";

interface BasicInputProps {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
}

export function BasicInput({
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  disabled,
  className
}: BasicInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      name={name}
      disabled={disabled}
      className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${className || ""}`}
    />
  );
}