import './styles.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Aurora · Zero-knowledge attendance on Midnight',
    template: '%s · Aurora',
  },
  description:
    'Aurora verifies student attendance on the Midnight ledger with zero-knowledge proofs. No names, no student IDs, no linkable history — presence, proven privately.',
  applicationName: 'Aurora',
  keywords: ['Aurora', 'zero-knowledge', 'attendance', 'Midnight Network', 'privacy', 'Compact', 'dApp'],
  openGraph: {
    title: 'Aurora · Zero-knowledge attendance on Midnight',
    description:
      'Instructors open sealed attendance windows; students prove presence without disclosing identity. Nothing personal ever reaches the ledger.',
    siteName: 'Aurora',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Aurora · Zero-knowledge attendance on Midnight',
    description: 'Presence, proven privately. Zero-knowledge student attendance on the Midnight ledger.',
  },
  appleWebApp: {
    title: 'Aurora',
  },
};

export const viewport: Viewport = {
  themeColor: '#faf8f5',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://db.onlinewebfonts.com/c/0e6de1ec911a2e267ff136bbdd384a44?family=Helvetica+Neue+Light"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Oswald:wght@500&family=Montserrat:wght@700&family=Roboto+Slab:wght@600&family=Raleway:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="aurora-canvas" aria-hidden="true" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
