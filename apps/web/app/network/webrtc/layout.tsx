import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free WebRTC Network Test - Analyze STUN/TURN ICE Candidates',
  description: 'Deep WebRTC network analysis. Examine STUN/TURN servers, ICE candidates, local and public IP exposure, and real-time communication capabilities of your browser.',
  keywords: ['WebRTC test', 'STUN server', 'TURN server', 'ICE candidates', 'WebRTC leak', 'local IP', 'WebRTC analysis'],
  openGraph: {
    title: 'WebRTC Network Analysis - STUN/TURN/ICE Deep Dive',
    description: 'Comprehensive WebRTC network analysis showing STUN/TURN servers, ICE candidates, and IP exposure.',
    type: 'website',
    images: ['/og-webrtc-network.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebRTC Network Test',
    description: 'Free test to analyze WebRTC network configuration and potential IP leaks.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/network/webrtc',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
