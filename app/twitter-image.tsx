import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Flare - Event Triggers for DeFi Agents';
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
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#16181a',
          backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255, 107, 53, 0.15) 0%, transparent 50%)',
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.5,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <span style={{ fontSize: '72px' }}>🔥</span>
            <span
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: 'white',
                marginLeft: '16px',
                fontFamily: 'sans-serif',
              }}
            >
              Flare
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '16px',
              fontFamily: 'sans-serif',
            }}
          >
            Watch the Chain
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ff6b35 0%, #ff9f1c 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              fontFamily: 'sans-serif',
            }}
          >
            While You Sleep
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '24px',
              color: '#8e8e8e',
              marginTop: '32px',
              fontFamily: 'sans-serif',
            }}
          >
            Event Triggers for DeFi Agents • Built by Monarch
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
