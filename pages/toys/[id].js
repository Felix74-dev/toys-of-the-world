import { prisma } from '../../lib/prisma';
import Head from 'next/head';
import { useState } from 'react';

export async function getServerSideProps(context) {
  const id = context.params.id;

  const toy = await prisma.toy.findUnique({
    where: { id: id },
    include: { media: true, collector: true, translations: true },
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

const labels = {
  en: { back: '\u2190 Back to all toys', playedIn: 'Played in:', materials: "What it's made of", play: 'How to play', history: 'A little history', collector: "Collector's Corner", see: 'See the collection \u2192' },
  es: { back: '\u2190 Volver a todos los juguetes', playedIn: 'Se juega en:', materials: 'De qu\u00e9 est\u00e1 hecho', play: 'C\u00f3mo se juega', history: 'Un poco de historia', collector: 'Rinc\u00f3n del coleccionista', see: 'Ver la colecci\u00f3n \u2192' },
  fr: { back: '\u2190 Retour \u00e0 tous les jouets', playedIn: 'Jou\u00e9 en :', materials: 'De quoi il est fait', play: 'Comment jouer', history: 'Un peu d\'histoire', collector: 'Coin des collectionneurs', see: 'Voir la collection \u2192' },
};

function getTranslated(toy, lang, field) {
  if (lang === 'en') return toy[field];
  const t = toy.translations && toy.translations.find(function (tr) { return tr.locale === lang; });
  if (t && t[field]) return t[field];
  return toy[field];
}

export default function ToyDetail(props) {
  const toy = props.toy;
  const [lang, setLang] = useState('en');
  const l = labels[lang];
  const photo = toy.media && toy.media[0] ? toy.media[0].url : 'https://loremflickr.com/400/400/toy,wood';

  const name = getTranslated(toy, lang, 'name');
  const country = getTranslated(toy, lang, 'country');
  const materials = getTranslated(toy, lang, 'materials');
  const playDescription = getTranslated(toy, lang, 'playDescription');
  const history = getTranslated(toy, lang, 'history');

  return (
    <>
    <Head>
      <title>{name + ' \u2014 Toys of the World'}</title>
      <meta name="description" content={playDescription} />
    </Head>
    <main style={{ fontFamily: 'sans-serif', background: colors.paper, minHeight: '100vh', color: colors.charcoal }}>
      <div style={{ background: colors.ink, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ color: '#fff', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>{l.back}</a>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 999, padding: 3 }}>
          {['en', 'es', 'fr'].map(function (code) {
            return (
              <button key={code} onClick={function () { setLang(code); }}
                style={{ border: 'none', background: lang === code ? '#FFD400' : 'transparent', color: lang === code ? colors.ink : '#fff', fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 999 }}>
                {code.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: 20, maxWidth: 560, margin: '0 auto' }}>
        <img src={photo} alt={name} style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 16, marginBottom: 16 }} />

        <h1 style={{ color: colors.ink, fontSize: 26, margin: '0 0 6px' }}>{name}</h1>
        <div style={{ fontSize: 14, color: colors.coral, fontWeight: 600, marginBottom: 20 }}>{l.playedIn} {country}</div>

        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#8a8267', marginBottom: 6 }}>
          {l.materials}
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>{materials}</p>

        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#8a8267', marginBottom: 6 }}>
          {l.play}
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>{playDescription}</p>

        {history && (
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#8a8267', marginBottom: 6 }}>
              {l.history}
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>{history}</p>
          </div>
        )}

        {toy.collector && (
          <div style={{ background: '#fff', border: '1.5px solid #ece4d2', borderRadius: 16, padding: 16, marginTop: 20 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#2C9D8F', marginBottom: 8 }}>
              {l.collector}
            </div>
            <strong style={{ display: 'block', fontSize: 14, color: colors.ink }}>{toy.collector.collectorName}</strong>
            <span style={{ fontSize: 12, color: '#8a8267' }}>{toy.collector.collectorRegion}</span>
            <p style={{ fontSize: 13, margin: '10px 0' }}>{toy.collector.description}</p>
            <a href={toy.collector.destinationUrl} style={{
              display: 'block', textAlign: 'center', background: colors.ink, color: '#fff',
              padding: 10, borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none',
            }}>
              {l.see}
            </a>
          </div>
        )}
      </div>
    </main>
    </>
  );
}
