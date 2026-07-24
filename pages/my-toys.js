import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useUser, SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/nextjs';

const colors = {
  ink: '#1E56D6',
  coral: '#E8604B',
  paper: '#FBF5E9',
  charcoal: '#2A2419',
};

const statusColors = {
  PENDING: '#F3A73A',
  PUBLISHED: '#2C9D8F',
  REJECTED: '#999',
};

export default function MyToys() {
  const { user, isLoaded } = useUser();
  const [toys, setToys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetch('/api/toys/mine?clerkUserId=' + user.id)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          setToys(data);
          setLoading(false);
        });
    }
  }, [isLoaded, user]);

  return (
    <>
      <Head>
        <title>My Submissions — Toys of the World</title>
      </Head>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <main style={{ fontFamily: 'sans-serif', background: colors.paper, minHeight: '100vh', color: colors.charcoal }}>
          <header style={{ background: colors.ink, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="/" style={{ color: '#fff', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>&larr; Back to all toys</a>
            <UserButton />
          </header>

          <div style={{ padding: 20, maxWidth: 560, margin: '0 auto' }}>
            <h1 style={{ color: colors.ink, fontSize: 22, marginBottom: 16 }}>My Submissions</h1>

            {loading && <p>Loading...</p>}
            {!loading && toys.length === 0 && (
              <p>You haven't submitted any toys yet. Tap "Share a toy" on the homepage to add your first one!</p>
            )}

            <div style={{ display: 'grid', gap: 14 }}>
              {toys.map(function (toy) {
                const photo = toy.media && toy.media[0] ? toy.media[0].url : null;
                return (
                  <div key={toy.id} style={{ background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #eee', display: 'flex', gap: 12 }}>
                    {photo && <img src={photo} alt={toy.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }} />}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px', color: colors.ink, fontSize: 16 }}>{toy.name}</h3>
                      <p style={{ margin: '0 0 6px', fontSize: 12, color: '#666' }}>{toy.country}</p>
                      <span style={{
                        display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#fff',
                        background: statusColors[toy.status] || '#999', padding: '3px 10px', borderRadius: 999,
                      }}>
                        {toy.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </SignedIn>
    </>
  );
}
