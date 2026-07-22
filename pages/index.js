import { useEffect, useState } from 'react';
import { prisma } from '../lib/prisma';

export async function getServerSideProps() {
  const toys = await prisma.toy.findMany({
    where: { status: 'PUBLISHED' },
    include: { media: { where: { isPrimary: true }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  });

  return { props: { initialToys: JSON.parse(JSON.stringify(toys)) } };
}

export default function Home(props) {
  const initialToys = props.initialToys;
  const [region, setRegion] = useState('all');
  const [toys, setToys] = useState(initialToys);

  useEffect(() => {
    fetch('/api/toys?region=' + region)
      .then(function (r) { return r.json(); })
      .then(setToys);
  }, [region]);

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: 720, margin: '0 auto', padding: 20 }}>
      <h1>Toys of the World</h1>
      <p>Discover toys around the world and their history.</p>

      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        {['all', 'samerica', 'africa', 'japan'].map(function (r) {
          return (
            <button key={r} onClick={function () { setRegion(r); }}>{r}</button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {toys.map(function (toy) {
          return (
            <div key={toy.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 14 }}>
              <h3>{toy.name}</h3>
              <p style={{ fontSize: 13, color: '#666' }}>{toy.country}</p>
              <p>{toy.playDescription}</p>
            </div>
          );
        })}
        {toys.length === 0 && <p>No published toys yet for this region — check back soon.</p>}
      </div>
    </main>
  );
}
