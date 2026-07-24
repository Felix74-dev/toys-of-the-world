import { prisma } from '../../lib/prisma';
import Head from 'next/head';

export async function getServerSideProps(context) {
  const id = context.params.id;

  const toy = await prisma.toy.findUnique({
    where: { id: id },
    include: { media: true, collector: true },
  });

  if (!toy || toy.status !== 'PUBLISHED') {
    return { notFound: true };
  }

  return { props: { toy: JSON.parse(JSON.stringify(toy)) } };
}

const colors = {
  ink: '#1E56D6',
  coral: '#E8604B',
  paper: '#FBF5E9',
  charcoal: '#2A2419',
};

export default function ToyDetail(props) {
  const toy = props.toy;
  const photo = toy.media && toy.media[0] ? toy.media[0].url : 'https://loremflickr.com/400/400/toy,wood';

  return (
    <>
    <Head>
      <title>{toy.name + ' — Toys of the World'}</title>
      <meta name="description" content={toy.playDescription} />
    </Head>
    <main style={{ fontFamily: 'sans-serif', background: colors.paper, minHeight: '100vh', color: colors.charcoal }}>
      <div style={{ background: colors.ink, padding: '18px 20px' }}>
        <a href="/" style={{ color: '#fff', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>&larr; Back to all toys</a>
      </div>

      <div style={{ padding: 20, maxWidth: 560, margin: '0 auto' }}>
        <img src={photo} alt={toy.name} style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 16, marginBottom: 16 }} />

        <h1 style={{ color: colors.ink, fontSize: 26, margin: '0 0 6px' }}>{toy.name}</h1>
        <div style={{ fontSize: 14, color: colors.coral, fontWeight: 600, marginBottom: 20 }}>Played in: {toy.country}</div>

        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#8a8267', marginBottom: 6 }}>
          What it's made of
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>{toy.materials}</p>

        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#8a8267', marginBottom: 6 }}>
          How to play
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>{toy.playDescription}</p>

        {toy.history && (
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#8a8267', marginBottom: 6 }}>
              A little history
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>{toy.history}</p>
          </div>
        )}

        {toy.collector && (
          <div style={{ background: '#fff', border: '1.5px solid #ece4d2', borderRadius: 16, padding: 16, marginTop: 20 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#2C9D8F', marginBottom: 8 }}>
              Collector's Corner
            </div>
            <strong style={{ display: 'block', fontSize: 14, color: colors.ink }}>{toy.collector.collectorName}</strong>
            <span style={{ fontSize: 12, color: '#8a8267' }}>{toy.collector.collectorRegion}</span>
            <p style={{ fontSize: 13, margin: '10px 0' }}>{toy.collector.description}</p>
            <a href={toy.collector.destinationUrl} style={{
              display: 'block', textAlign: 'center', background: colors.ink, color: '#fff',
              padding: 10, borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none',
            }}>
              See the collection &rarr;
            </a>
          </div>
        )}
      </div>
    </main>
    </>
  );
}
