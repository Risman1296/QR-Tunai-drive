import React from 'react';
import { Input } from "@/components/ui/input";

interface FormattedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix?: string;
  formatValue?: (value: number) => string;
}

export function FormattedInput({
  prefix = "Rp",
  formatValue = (value) => new Intl.NumberFormat('id-ID').format(value),
  className,
  value,
  onChange,
  ...props
}: FormattedInputProps) {
  const [formattedText, setFormattedText] = React.useState<string>("");
  
  // Format initial value if provided
  React.useEffect(() => {
    if (value && typeof value === 'number' && value > 0) {
      setFormattedText(formatValue(value));
    }
  }, [value, formatValue]);
  
  // Custom change handler to update both the actual value and formatted display
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hapus karakter non-digit jika ada
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    
    // Buat event baru dengan nilai yang sudah difilter
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: rawValue
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    if (onChange) {
      onChange(newEvent);
    }
    
    const numValue = Number(rawValue);
    if (!isNaN(numValue) && numValue > 0) {
      setFormattedText(formatValue(numValue));
    } else {
      setFormattedText("");
    }
  };
  
  return (
    <div className="space-y-1">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          {prefix}
        </span>
        <Input 
          className={`pl-10 ${className}`}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          {...props}
        />
      </div>
      {formattedText && (
        <div className="text-xs text-gray-500 font-medium">
          {prefix} {formattedText}
        </div>
      )}
    </div>
  );
}