import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'BrowserLeaks.io - Comprehensive Browser Privacy Testing';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 72,
          background: 'linear-gradient(to bottom right, #1e40af, #7c3aed)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 'bold', marginBottom: 20 }}>
          BrowserLeaks.io
        </div>
        <div style={{ fontSize: 48, opacity: 0.9 }}>
          Comprehensive Browser Privacy Testing
        </div>
        <div style={{ fontSize: 36, marginTop: 40, opacity: 0.8 }}>
          🔒 IP • DNS • WebRTC • Fingerprint
        </div>
      </div>
    ),
    { ...size }
  );
}
