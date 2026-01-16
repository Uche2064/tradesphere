"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { AlertCircle, Eye, EyeOff, LucideIcon } from "lucide-react";

interface AppInputProps {
  id: string;
  label: string;
  required?: boolean;
  type?: "text" | "email" | "password" | "number" | "tel";
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  showPasswordToggle?: boolean;
  className?: string;
}

export default function AppInput({
  id,
  label,
  required = false,
  type = "text",
  placeholder,
  value,
  onChange,
  onKeyDown,
  disabled = false,
  error,
  leadingIcon: Icon,
  trailingIcon: TrailingIcon,
  showPasswordToggle = false,
  className = "",
}: AppInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const actualType = showPasswordToggle && showPassword ? "text" : type;
  
  // Determine si on a une icône à droite
  const hasRightIcon = error || TrailingIcon || showPasswordToggle;

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground dark:text-muted-foreground" />
        )}
        <Input
          id={id}
          required={required}
          type={actualType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onKeyDown={onKeyDown}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} ${
            hasRightIcon ? "pr-10" : "pr-4"
          } py-5 rounded-lg dark:text-white transition-colors dark:bg-black/30 placeholder:text-muted-foreground ${
            error
              ? "border-red-500 dark:border-red-500"
              : ""
          }`}
        />
        
        {/* Bouton toggle password */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
            tabIndex={-1}
            disabled={disabled}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
        
        {/* Icône trailing personnalisée */}
        {TrailingIcon && !error && !showPasswordToggle && (
          <TrailingIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
        )}
        
        {/* Icône d'erreur */}
        {error && !showPasswordToggle && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
