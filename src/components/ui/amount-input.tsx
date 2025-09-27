import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AmountInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number;
  onChange?: (value: number | undefined) => void;
  min?: number;
  max?: number;
  quickAmounts?: number[];
  showQuickAmounts?: boolean;
  className?: string;
}

const defaultQuickAmounts = [10000, 25000, 50000, 100000, 500000, 1000000];

export function AmountInput({ 
  value, 
  onChange, 
  min = 1000,
  max,
  quickAmounts = defaultQuickAmounts,
  showQuickAmounts = true,
  className,
  placeholder = "0",
  ...props 
}: AmountInputProps) {
  const [displayValue, setDisplayValue] = React.useState<string>('');

  // Format number to Indonesian currency display
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  // Handle input value display
  React.useEffect(() => {
    if (value && value > 0) {
      setDisplayValue(formatAmount(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remove all non-digit characters
    const numbers = inputValue.replace(/\D/g, '');
    
    if (numbers === '') {
      setDisplayValue('');
      onChange?.(undefined);
      return;
    }

    const numericValue = parseInt(numbers, 10);
    
    // Allow typing, but validate on blur or form submission instead
    setDisplayValue(formatAmount(numericValue));
    onChange?.(numericValue);
  };

  const handleQuickAmount = (amount: number) => {
    setDisplayValue(formatAmount(amount));
    onChange?.(amount);
  };

  const filteredQuickAmounts = quickAmounts.filter(amount => {
    if (min && amount < min) return false;
    if (max && amount > max) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
          Rp
        </div>
        <Input
          {...props}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={displayValue}
          onChange={handleInputChange}
          className={cn("pl-10 pr-4 text-right font-mono text-base sm:text-lg h-11 sm:h-12 mobile-optimized", className)}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>
      
      {showQuickAmounts && filteredQuickAmounts.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-500 font-medium">Nominal Cepat:</div>
          <div className="flex flex-wrap gap-2">
            {filteredQuickAmounts.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8 px-3 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => handleQuickAmount(amount)}
              >
                {formatAmount(amount)}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {min && (
        <div className="text-xs text-gray-500">
          Minimum: Rp {formatAmount(min)}
          {max && ` • Maksimum: Rp ${formatAmount(max)}`}
        </div>
      )}
    </div>
  );
}