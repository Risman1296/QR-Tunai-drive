// Client-safe version of payment config that doesn't use Node.js modules
export const INDONESIAN_BANK_CODES = {
  'BCA': {
    name: 'Bank Central Asia',
    code: '014',
    swiftCode: 'CENAIDJA'
  },
  'MANDIRI': {
    name: 'Bank Mandiri',
    code: '008',
    swiftCode: 'BMRIIDJA'
  },
  'BRI': {
    name: 'Bank Rakyat Indonesia',
    code: '002',
    swiftCode: 'BRINIDJA'
  },
  'BNI': {
    name: 'Bank Negara Indonesia',
    code: '009',
    swiftCode: 'BNINIDJA'
  },
  'BSI': {
    name: 'Bank Syariah Indonesia',
    code: '451',
    swiftCode: 'BSYEIDJA'
  },
  'BTN': {
    name: 'Bank Tabungan Negara',
    code: '200',
    swiftCode: 'BTANIDJA'
  },
  'CIMB': {
    name: 'CIMB Niaga',
    code: '022',
    swiftCode: 'BNIAIDJA'
  },
  'DANAMON': {
    name: 'Bank Danamon',
    code: '011',
    swiftCode: 'BDINIDJA'
  },
  'PERMATA': {
    name: 'Bank Permata',
    code: '013',
    swiftCode: 'BBBAIDJA'
  }
} as const;

export const INDONESIAN_BANK_LOGOS = {
  BCA: '/bank-logos/bca.svg',
  MANDIRI: '/bank-logos/mandiri.svg',
  BRI: '/bank-logos/bri.svg',
  BNI: '/bank-logos/bni.svg',
  BSI: '/bank-logos/bsi.svg',
  BTN: '/bank-logos/btn.svg',
  CIMB: '/bank-logos/cimb.svg',
  DANAMON: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
    <rect width="100" height="40" fill="#0066CC" rx="4"/>
    <text x="50" y="20" text-anchor="middle" fill="white" font-size="8" font-weight="bold">DANAMON</text>
  </svg>`,
  PERMATA: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
    <rect width="100" height="40" fill="#009639" rx="4"/>
    <text x="50" y="20" text-anchor="middle" fill="white" font-size="8" font-weight="bold">PERMATA</text>
  </svg>`,
} as const;
