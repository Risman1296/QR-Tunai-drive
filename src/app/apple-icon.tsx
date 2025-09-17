import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2563eb',
          borderRadius: 20,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg" 
          width="120" 
          height="120" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect width="5" height="5" x="3" y="3" rx="1"/>
          <rect width="5" height="5" x="16" y="3" rx="1"/>
          <rect width="5" height="5" x="3" y="16" rx="1"/>
          <path d="m5 5 2 2"/>
          <path d="m5 17 2 2"/>
          <path d="m17 5 2 2"/>
          <path d="m13 13l.01 0"/>
          <path d="m17 13l.01 0"/>
          <path d="m13 17l.01 0"/>
          <path d="m17 17l.01 0"/>
          <path d="m21 13l.01 0"/>
          <path d="m21 17l.01 0"/>
          <path d="m21 21l.01 0"/>
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}