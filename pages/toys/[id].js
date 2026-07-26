import { prisma } from '../../lib/prisma';
import Head from 'next/head';
import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

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
  en: { back: '\u2190 Back to all toys', playedIn: 'Played in:', materials: "What it's made of", play: 'How to play', history: 'A little history', collector: "Collector's Corner", see: 'See the collection \u2192', membersOnly: 'Sign in as a member to see this collector and their link.', signInToView: 'Sign in to view',
    overview: 'Overview', culture: 'Civilisation / Culture', period: 'Date / Period', evidence: 'Evidence Status', significance: 'Cultural Significance', facts: 'Interesting Facts', museumRefs: 'Museum & Archaeological References', imageRefs: 'Image References' },
  es: { back: '\u2190 Volver a todos los juguetes', playedIn: 'Se juega en:', materials: 'De qu\u00e9 est\u00e1 hecho', play: 'C\u00f3mo se juega', history: 'Un poco de historia', collector: 'Rinc\u00f3n del coleccionista', see: 'Ver la colecci\u00f3n \u2192', membersOnly: 'Inicia sesi\u00f3n como miembro para ver a este coleccionista y su enlace.', signInToView: 'Iniciar sesi\u00f3n para ver',
    overview: 'Resumen', culture: 'Civilizaci\u00f3n / Cultura', period: 'Fecha / Periodo', evidence: 'Estado de la evidencia', significance: 'Significado cultural', facts: 'Datos curiosos', museumRefs: 'Referencias de museos y arqueolog\u00eda', imageRefs: 'Referencias de imagen' },
  fr: { back: '\u2190 Retour \u00e0 tous les jouets', playedIn: 'Jou\u00e9 en :', materials: 'De quoi il est fait', play: 'Comment jouer', history: 'Un peu d\'histoire', collector: 'Coin des collectionneurs', see: 'Voir la collection \u2192', membersOnly: 'Connectez-vous en tant que membre pour voir ce collectionneur et son lien.', signInToView: 'Se connecter pour voir',
    overview: 'Aper\u00e7u', culture: 'Civilisation / Culture', period: 'Date / P\u00e9riode', evidence: '\u00c9tat des preuves', significance: 'Importance culturelle', facts: 'Anecdotes', museumRefs: 'R\u00e9f\u00e9rences de mus\u00e9es et arch\u00e9ologiques', imageRefs: 'R\u00e9f\u00e9rences d\'image' },
  zh: { back: '\u2190 \u8fd4\u56de\u6240\u6709\u73a9\u5177', playedIn: '\u6d41\u884c\u4e8e\uff1a', materials: '\u5236\u4f5c\u6750\u6599', play: '\u73a9\u6cd5', history: '\u4e00\u70b9\u5386\u53f2', collector: '\u6536\u85cf\u8005\u89d2\u843d', see: '\u67e5\u770b\u6536\u85cf \u2192', membersOnly: '\u767b\u5f55\u4f1a\u5458\u8d26\u6237\u4ee5\u67e5\u770b\u6b64\u6536\u85cf\u8005\u53ca\u5176\u94fe\u63a5\u3002', signInToView: '\u767b\u5f55\u67e5\u770b',
    overview: '\u6982\u89c8', culture: '\u6587\u660e/\u6587\u5316', period: '\u5e74\u4ee3/\u65f6\u671f', evidence: '\u8bc1\u636e\u72b6\u6001', significance: '\u6587\u5316\u610f\u4e49', facts: '\u8da3\u95fb\u8f38\u4e8b', museumRefs: '\u535a\u7269\u9986\u4e0e\u8003\u53e4\u53c2\u8003\u8d44\u6599', imageRefs: '\u56fe\u7247\u53c2\u8003\u6765\u6e90' },
  ja: { back: '\u2190 \u3059\u3079\u3066\u306e\u304a\u3082\u3061\u3083\u306b\u623b\u308b', playedIn: '\u904a\u3070\u308c\u3066\u3044\u308b\u5834\u6240\uff1a', materials: '\u7d20\u6750', play: '\u9075\u3073\u65b9', history: '\u5c11\u3057\u306e\u6b74\u53f2', collector: '\u30b3\u30ec\u30af\u30bf\u30fc\u30ba\u30b3\u30fc\u30ca\u30fc', see: '\u30b3\u30ec\u30af\u30b7\u30e7\u30f3\u3092\u898b\u308b \u2192', membersOnly: '\u3053\u306e\u30b3\u30ec\u30af\u30bf\u30fc\u3068\u305d\u306e\u30ea\u30f3\u30af\u3092\u898b\u308b\u306b\u306f\u3001\u4f1a\u54e1\u3068\u3057\u3066\u30b5\u30a4\u30f3\u30a4\u30f3\u3057\u3066\u304f\u3060\u3055\u3044\u3002', signInToView: '\u30b5\u30a4\u30f3\u30a4\u30f3\u3057\u3066\u898b\u308b',
    overview: '\u6982\u8981', culture: '\u6587\u660e/\u6587\u5316', period: '\u5e74\u4ee3/\u6642\u4ee3', evidence: '\u8a3c\u62e0\u306e\u30b9\u30c6\u30fc\u30bf\u30b9', significance: '\u6587\u5316\u7684\u610f\u7fa9', facts: '\u8c46\u77e5\u8b58', museumRefs: '\u535a\u7269\u9928\u30fb\u8003\u53e4\u5b66\u53c2\u8003\u8cc7\u6599', imageRefs: '\u753b\u50cf\u53c2\u7167' },
};

function getTranslated(toy, lang, field) {
  if (lang === 'en') return toy[field];
  const t = toy.translations && toy.translations.find(function (tr) { return tr.locale === lang; });
  if (t && t[field]) return t[field];
  return toy[field];
}

function Field(props) {
  if (!props.value) return null;
  return (
    <div>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#8a8267', marginBottom: 6, marginTop: 20 }}>
        {props.label}
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{props.value}</p>
    </div>
  );
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
        <select value={lang} onChange={function (e) { setLang(e.target.value); }}
          style={{ border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 10px', borderRadius: 999 }}>
          <option value="en" style={{ color: '#000' }}>English</option>
          <option value="es" style={{ color: '#000' }}>Español</option>
          <option value="fr" style={{ color: '#000' }}>Français</option>
          <option value="zh" style={{ color: '#000' }}>中文</option>
          <option value="ja" style={{ color: '#000' }}>日本語</option>
        </select>
      </div>

      <div style={{ padding: 20, maxWidth: 560, margin: '0 auto' }}>
        {toy.media && toy.media.length > 0 ? (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {toy.media.slice(0, 3).map(function (m, i) {
              return (
                <img key={i} src={m.url} alt={name} style={{
                  width: toy.media.length === 1 ? '100%' : 'calc((100% - 16px) / ' + Math.min(toy.media.length, 3) + ')',
                  height: 200, objectFit: 'cover', borderRadius: 16,
                }} />
              );
            })}
          </div>
        ) : (
          <img src={photo} alt={name} style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 16, marginBottom: 16 }} />
        )}

        <h1 style={{ color: colors.ink, fontSize: 26, margin: '0 0 6px' }}>{name}</h1>
        <div style={{ fontSize: 14, color: colors.coral, fontWeight: 600, marginBottom: 6 }}>{l.playedIn} {country}</div>
        {(toy.civilisationCulture || toy.datePeriod) && (
          <div style={{ fontSize: 12, color: '#8a8267', marginBottom: 20 }}>
            {toy.civilisationCulture}{toy.civilisationCulture && toy.datePeriod ? ' \u00b7 ' : ''}{toy.datePeriod}
          </div>
        )}
        {!(toy.civilisationCulture || toy.datePeriod) && <div style={{ marginBottom: 20 }} />}

        {toy.description && <Field label={l.overview} value={toy.description} />}

        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#8a8267', marginBottom: 6, marginTop: 20 }}>
          {l.materials}
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0 }}>{materials}</p>

        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#8a8267', marginBottom: 6, marginTop: 20 }}>
          {l.play}
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0 }}>{playDescription}</p>

        {history && (
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#8a8267', marginBottom: 6, marginTop: 20 }}>
              {l.history}
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0 }}>{history}</p>
          </div>
        )}

        <Field label={l.significance} value={toy.culturalSignificance} />
        <Field label={l.facts} value={toy.interestingFacts} />

        {toy.evidenceStatus && (
          <div style={{ marginTop: 20, display: 'inline-block', background: '#f4f0e4', padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: colors.ink }}>
            {l.evidence}: {toy.evidenceStatus}
          </div>
        )}

        <Field label={l.museumRefs} value={toy.museumReferences} />
        <Field label={l.imageRefs} value={toy.imageReferences} />

        {toy.collector && (
          <div style={{ background: '#fff', border: '1.5px solid #ece4d2', borderRadius: 16, padding: 16, marginTop: 24 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#2C9D8F', marginBottom: 8 }}>
              {l.collector}
            </div>
            <SignedIn>
              <strong style={{ display: 'block', fontSize: 14, color: colors.ink }}>{toy.collector.collectorName}</strong>
              <span style={{ fontSize: 12, color: '#8a8267' }}>{toy.collector.collectorRegion}</span>
              <p style={{ fontSize: 13, margin: '10px 0' }}>{toy.collector.description}</p>
              <a href={toy.collector.destinationUrl} style={{
                display: 'block', textAlign: 'center', background: colors.ink, color: '#fff',
                padding: 10, borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none',
              }}>
                {l.see}
              </a>
            </SignedIn>
            <SignedOut>
              <p style={{ fontSize: 13, color: '#8a8267', margin: '0 0 12px' }}>
                {l.membersOnly}
              </p>
              <SignInButton mode="modal">
                <button style={{
                  display: 'block', width: '100%', textAlign: 'center', background: colors.ink, color: '#fff',
                  border: 'none', padding: 10, borderRadius: 10, fontWeight: 700, fontSize: 13,
                }}>
                  {l.signInToView}
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        )}
      </div>
    </main>
    </>
  );
}
