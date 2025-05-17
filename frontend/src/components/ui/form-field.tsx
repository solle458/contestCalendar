import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  required,
  description,
  children,
  className,
  ...props
}: FormFieldProps) {
  const id = React.useId();
  const descriptionId = React.useId();
  const errorId = React.useId();

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}
        >
          {label}
        </Label>
        {description && (
          <span id={descriptionId} className="text-sm text-gray-500">
            {description}
          </span>
        )}
      </div>
      {React.isValidElement(children) &&
        React.cloneElement(children, {
          id,
          "aria-describedby": cn(
            description && descriptionId,
            error && errorId
          ),
          "aria-invalid": !!error,
          "aria-required": required,
        })}
      <FormError id={errorId} message={error} />
    </div>
  );
} 
