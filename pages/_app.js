import Head from 'next/head';
import { ClerkProvider } from '@clerk/nextjs';

export default function MyApp({ Component, pageProps }) {
  return (
    <ClerkProvider>
      <Head>
        <link rel="icon" href="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2232%22%20fill%3D%22%231E56D6%22/%3E%3Ctext%20x%3D%2232%22%20y%3D%2244%22%20font-size%3D%2236%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-weight%3D%22700%22%20fill%3D%22%23FFD400%22%20text-anchor%3D%22middle%22%3ET%3C/text%3E%3C/svg%3E" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#1E56D6" />
      </Head>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
