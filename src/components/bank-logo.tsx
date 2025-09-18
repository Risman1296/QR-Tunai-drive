'use client';

import { INDONESIAN_BANK_LOGOS } from '@/lib/bank-logos';

interface BankLogoProps {
  bankCode: string;
  bankName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const BankLogo: React.FC<BankLogoProps> = ({ 
  bankCode, 
  bankName, 
  size = 'md', 
  className = '' 
}) => {
  const logo = INDONESIAN_BANK_LOGOS[bankCode as keyof typeof INDONESIAN_BANK_LOGOS];
  
  if (!logo) {
    // Fallback untuk bank yang tidak ada logonya
    return (
      <div 
        className={`${sizeClasses[size]} ${className} bg-gray-100 rounded-lg flex items-center justify-center`}
        title={bankName}
      >
        <span className="text-xs font-medium text-gray-600">
          {bankCode.substring(0, 3)}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`${sizeClasses[size]} ${className} flex items-center justify-center`}
      title={bankName}
    >
      <div 
        className="w-full h-full rounded-lg overflow-hidden"
        dangerouslySetInnerHTML={{ 
          __html: logo 
        }} 
      />
    </div>
  );
};

export default BankLogo;