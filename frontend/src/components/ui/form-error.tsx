import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
  id?: string;
}

export function FormError({ message, className, id }: FormErrorProps) {
  if (!message) return null;

  return (
    <p className={cn("text-sm text-red-500 mt-1", className)} role="alert" id={id}>
      {message}
    </p>
  );
} 
