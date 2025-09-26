import { ImageResponse } from 'next/og';
import styles from './icon.module.css';

// Required for static export
export const dynamic = 'force-static';
export const revalidate = 0;

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
      <div
        className={styles.iconContainer}
      >
      <svg
        xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
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
      </div>,
      {
        ...size,
      }
    )
}