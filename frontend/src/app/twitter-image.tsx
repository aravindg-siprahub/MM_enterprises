import { ImageResponse } from 'next/og';

export const alt = 'MM Enterprises - Premium Electronics & Appliances';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          borderTop: '16px solid #2563EB',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {/* We use an img tag pointing to the absolute URL of the logo, or we can use styling */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: 20,
              letterSpacing: '-0.02em',
            }}
          >
            MM Enterprises
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 500,
              color: '#64748b',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Premium Electronics & Appliances
          </div>
          <div style={{
            marginTop: 60,
            display: 'flex',
            gap: '20px',
            fontSize: 24,
            color: '#3b82f6',
            fontWeight: 'bold'
          }}>
            <span>SMARTPHONES</span> • <span>APPLIANCES</span> • <span>FURNITURE</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
