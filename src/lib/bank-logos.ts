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
  BCA: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
    <rect width="100" height="40" fill="#0066CC" rx="4"/>
    <text x="50" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold">BCA</text>
  </svg>`,
  
  MANDIRI: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
    <rect width="100" height="40" fill="#FFA500" rx="4"/>
    <text x="50" y="25" text-anchor="middle" fill="white" font-size="10" font-weight="bold">MANDIRI</text>
  </svg>`,
  
  BRI: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
    <rect width="100" height="40" fill="#003D7A" rx="4"/>
    <text x="50" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold">BRI</text>
  </svg>`,
  
  BNI: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
    <rect width="100" height="40" fill="#E60012" rx="4"/>
    <text x="50" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold">BNI</text>
  </svg>`,
  
  BSI: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
    <rect width="100" height="40" fill="#00A651" rx="4"/>
    <text x="50" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold">BSI</text>
  </svg>`,
  
  BTN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
    <rect width="100" height="40" fill="#FF6600" rx="4"/>
    <text x="50" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold">BTN</text>
  </svg>`,
  
  CIMB: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
    <rect width="100" height="40" fill="#CC0000" rx="4"/>
    <text x="50" y="25" text-anchor="middle" fill="white" font-size="12" font-weight="bold">CIMB</text>
  </svg>`,
  
  DANAMON: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
    <rect width="100" height="40" fill="#0066CC" rx="4"/>
    <text x="50" y="20" text-anchor="middle" fill="white" font-size="8" font-weight="bold">DANAMON</text>
  </svg>`,
  
  PERMATA: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
    <rect width="100" height="40" fill="#009639" rx="4"/>
    <text x="50" y="20" text-anchor="middle" fill="white" font-size="8" font-weight="bold">PERMATA</text>
  </svg>`
} as const;