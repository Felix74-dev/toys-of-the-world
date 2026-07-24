import { useEffect, useState } from 'react';
import Head from 'next/head';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { prisma } from '../lib/prisma';
import { supabase } from '../lib/supabaseClient';

export async function getServerSideProps() {
  const toys = await prisma.toy.findMany({
    where: { status: 'PUBLISHED' },
    include: { media: { where: { isPrimary: true }, take: 1 }, translations: true },
    orderBy: { createdAt: 'desc' },
  });

  return { props: { initialToys: JSON.parse(JSON.stringify(toys)) } };
}

const colors = {
  ink: '#1E56D6',
  mango: '#FFD400',
  coral: '#FF9478',
  jade: '#F2A9C2',
  paper: '#FBF5E9',
  charcoal: '#2A2419',
};

const uiStrings = {
  en: {
    heroTitle: 'Discover toys around the world and their history',
    sub1: 'Browse and learn what toys kids have used since the beginning of time.',
    sub2: 'Upload it yourself! If you know of a toy that could be in this app, please get in touch with us. Every toy added helps us build the biggest toy library in the world.',
    sub3: 'This app is for everyone passionate about toys: kids, young people, historians, parents, schools, and community organisations.',
    note: 'Many toys were created independently by different cultures throughout history. We celebrate every documented tradition rather than assigning a single origin.',
    allRegions: 'All regions', samerica: 'South America', africa: 'Africa', asia: 'Asia', europe: 'Europe', oceania: 'Oceania', namerica: 'North America',
    playedIn: 'Played in:', shareToy: 'Share a toy', noToys: 'No published toys yet for this region — check back soon.',
    formTitle: 'Share a toy', submittingAs: 'Submitting as:',
    namePlaceholder: 'Toy name', countryPlaceholder: 'Where is this toy played? (country/region)', regionLabel: 'Continent / region category',
    materialsPlaceholder: 'Materials', descPlaceholder: 'Tell us what you know about the toy', sourcePlaceholder: 'Source of information (e.g. story books, family, museums)',
    photoLabel: 'Add a photo', reviewNote: "Submissions are reviewed by our team before they're published, so it may take a little while to appear.",
    submitBtn: 'Submit for approval', submitting: 'Submitting...', mySubmissions: 'My submissions',
    footerText: 'Questions or want to add a toy for us?',
  },
  es: {
    heroTitle: 'Descubre los juguetes del mundo y su historia',
    sub1: 'Explora y aprende qué juguetes han usado los niños desde el principio de los tiempos.',
    sub2: '¡Súbelo tú mismo! Si conoces un juguete que podría estar en esta app, contáctanos. Cada juguete agregado nos ayuda a construir la biblioteca de juguetes más grande del mundo.',
    sub3: 'Esta app es para todos los apasionados por los juguetes: niños, jóvenes, historiadores, padres, escuelas y organizaciones comunitarias.',
    note: 'Muchos juguetes fueron creados independientemente por diferentes culturas a lo largo de la historia. Celebramos cada tradición documentada en lugar de asignar un único origen.',
    allRegions: 'Todas las regiones', samerica: 'Sudamérica', africa: 'África', asia: 'Asia', europe: 'Europa', oceania: 'Oceanía', namerica: 'Norteamérica',
    playedIn: 'Se juega en:', shareToy: 'Compartir un juguete', noToys: 'Aún no hay juguetes publicados en esta región — vuelve pronto.',
    formTitle: 'Comparte un juguete', submittingAs: 'Enviando como:',
    namePlaceholder: 'Nombre del juguete', countryPlaceholder: '¿Dónde se juega este juguete? (país/región)', regionLabel: 'Continente / categoría de región',
    materialsPlaceholder: 'Materiales', descPlaceholder: 'Cuéntanos qué sabes sobre el juguete', sourcePlaceholder: 'Fuente de información (libros, familia, museos)',
    photoLabel: 'Agregar una foto', reviewNote: 'Los envíos son revisados por nuestro equipo antes de publicarse, así que puede tardar un poco en aparecer.',
    submitBtn: 'Enviar para revisión', submitting: 'Enviando...', mySubmissions: 'Mis envíos',
    footerText: '¿Preguntas o quieres agregar un juguete?',
  },
  fr: {
    heroTitle: 'Découvrez les jouets du monde et leur histoire',
    sub1: "Parcourez et découvrez les jouets utilisés par les enfants depuis la nuit des temps.",
    sub2: "Partagez-le vous-même ! Si vous connaissez un jouet qui pourrait figurer dans cette application, contactez-nous. Chaque jouet ajouté nous aide à construire la plus grande bibliothèque de jouets au monde.",
    sub3: "Cette application est faite pour tous les passionnés de jouets : enfants, jeunes, historiens, parents, écoles et organisations communautaires.",
    note: "De nombreux jouets ont été créés indépendamment par différentes cultures au fil de l'histoire. Nous célébrons chaque tradition documentée plutôt que d'attribuer une origine unique.",
    allRegions: 'Toutes les régions', samerica: 'Amérique du Sud', africa: 'Afrique', asia: 'Asie', europe: 'Europe', oceania: 'Océanie', namerica: 'Amérique du Nord',
    playedIn: 'Joué en :', shareToy: 'Partager un jouet', noToys: 'Aucun jouet publié pour cette région pour le moment — revenez bientôt.',
    formTitle: 'Partager un jouet', submittingAs: 'Envoyé en tant que :',
    namePlaceholder: 'Nom du jouet', countryPlaceholder: 'Où joue-t-on à ce jouet ? (pays/région)', regionLabel: 'Continent / catégorie de région',
    materialsPlaceholder: 'Matériaux', descPlaceholder: 'Dites-nous ce que vous savez sur ce jouet', sourcePlaceholder: "Source d'information (livres, famille, musées)",
    photoLabel: 'Ajouter une photo', reviewNote: 'Les propositions sont examinées par notre équipe avant publication, cela peut donc prendre un peu de temps.',
    submitBtn: 'Soumettre pour validation', submitting: 'Envoi...', mySubmissions: 'Mes propositions',
    footerText: 'Des questions ou envie de proposer un jouet ?',
  },
};

function getTranslated(toy, lang, field) {
  if (lang === 'en') return toy[field];
  const t = toy.translations && toy.translations.find(function (tr) { return tr.locale === lang; });
  if (t && t[field]) return t[field];
  return toy[field];
}

export default function Home(props) {
  const { user } = useUser();
  const initialToys = props.initialToys;
  const [lang, setLang] = useState('en');
  const s = uiStrings[lang];
  const [region, setRegion] = useState('all');
  const [toys, setToys] = useState(initialToys);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', country: '', region: 'samerica', materials: '', playDescription: '', source: '' });
  const [submitMessage, setSubmitMessage] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetch('/api/toys?region=' + region)
      .then(function (r) { return r.json(); })
      .then(setToys);
  }, [region]);

  function handleSubmit() {
    setUploading(true);

    if (photoFile) {
      const fileName = 'submissions/' + Date.now() + '-' + photoFile.name;

      supabase.storage
        .from('toy-photos')
        .upload(fileName, photoFile)
        .then(function (result) {
          if (result.error) {
            throw result.error;
          }
          const publicUrlResult = supabase.storage.from('toy-photos').getPublicUrl(fileName);
          const photoUrl = publicUrlResult.data.publicUrl;
          return sendToyData(photoUrl);
        })
        .catch(function (err) {
          setUploading(false);
          setSubmitMessage('Something went wrong uploading the photo. Please try again.');
        });
    } else {
      sendToyData(null);
    }
  }

  function sendToyData(photoUrl) {
    const email = user && user.primaryEmailAddress ? user.primaryEmailAddress.emailAddress : null;
    const payload = Object.assign({}, formData, { photoUrl: photoUrl, clerkUserId: user ? user.id : null, submitterEmail: email });

    return fetch('/api/toys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setUploading(false);
        setSubmitMessage('Thanks! Your toy is pending review.');
        setFormData({ name: '', country: '', region: 'samerica', materials: '', playDescription: '', source: '' });
        setPhotoFile(null);
      })
      .catch(function (err) {
        setUploading(false);
        setSubmitError('Something went wrong submitting your toy. Please check your connection and try again.');
      });
  }

  return (
    <>
    <Head>
      <title>Toys of the World</title>
      <meta name="description" content="Discover toys around the world and their history." />
    </Head>
    <main style={{ fontFamily: 'sans-serif', background: colors.paper, minHeight: '100vh', color: colors.charcoal }}>
      <header style={{ background: colors.ink, color: '#fff', padding: '20px 18px 28px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 24, color: colors.mango }}>Toys of the World</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 999, padding: 3 }}>
              {['en', 'es', 'fr'].map(function (l) {
                return (
                  <button key={l} onClick={function () { setLang(l); }}
                    style={{ border: 'none', background: lang === l ? colors.mango : 'transparent', color: lang === l ? colors.ink : '#fff', fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 999 }}>
                    {l.toUpperCase()}
                  </button>
                );
              })}
            </div>
            <SignedOut>
              <SignInButton mode="modal">
                <button style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button style={{ background: colors.mango, color: colors.ink, border: 'none', padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                  Sign up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <a href="/my-toys" style={{ color: '#fff', fontSize: 12, fontWeight: 700, marginRight: 4, textDecoration: 'none' }}>{s.mySubmissions}</a>
              <UserButton />
            </SignedIn>
          </div>
        </div>
        <h1 style={{ fontSize: 24, lineHeight: 1.2, margin: '0 0 12px', color: '#fff' }}>{s.heroTitle}</h1>
        <p style={{ fontSize: 14, lineHeight: 1.55, margin: '0 0 10px', fontWeight: 700, color: '#fff' }}>{s.sub1}</p>
        <p style={{ fontSize: 14, lineHeight: 1.55, margin: '0 0 10px', fontWeight: 700, color: '#fff' }}>{s.sub2}</p>
        <p style={{ fontSize: 14, lineHeight: 1.55, margin: '0 0 14px', fontWeight: 700, color: '#fff' }}>{s.sub3}</p>
        <p style={{ fontSize: 11.5, lineHeight: 1.5, margin: 0, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>{s.note}</p>
      </header>

      <div style={{ display: 'flex', gap: 8, padding: '18px 16px 6px', overflowX: 'auto' }}>
        {['all', 'samerica', 'africa', 'asia', 'europe', 'oceania', 'namerica'].map(function (r) {
          const active = region === r;
          const labelKey = r === 'all' ? 'allRegions' : r;
          return (
            <button
              key={r}
              onClick={function () { setRegion(r); }}
              style={{
                border: active ? '2px solid ' + colors.mango : '2px solid transparent',
                background: '#fff', padding: '8px 16px', borderRadius: 999, fontWeight: 600, fontSize: 13,
                color: colors.ink, whiteSpace: 'nowrap',
              }}
            >
              {s[labelKey]}
            </button>
          );
        })}
      </div>

      <div style={{ padding: '14px 16px 100px', display: 'grid', gap: 16 }}>
        {toys.map(function (toy) {
          const photo = toy.media && toy.media[0] ? toy.media[0].url : 'https://loremflickr.com/200/200/toy,wood';
          const name = getTranslated(toy, lang, 'name');
          const country = getTranslated(toy, lang, 'country');
          const materials = getTranslated(toy, lang, 'materials');
          const playDescription = getTranslated(toy, lang, 'playDescription');
          return (
            <a key={toy.id} href={'/toys/' + toy.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '2px dashed #e4dcc7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <img src={photo} alt={name} style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} />
                <h3 style={{ margin: 0, color: colors.ink, fontSize: 18 }}>{name}</h3>
              </div>
              <div style={{ fontSize: 12.5, color: '#E8604B', fontWeight: 600, marginBottom: 8 }}>{s.playedIn} {country}</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.5, margin: '0 0 10px' }}>{playDescription}</p>
              <div style={{ fontSize: 11, background: '#f4f0e4', display: 'inline-block', padding: '4px 9px', borderRadius: 8 }}>
                {materials}
              </div>
            </div>
            </a>
          );
        })}
        {toys.length === 0 && <p>{s.noToys}</p>}
      </div>

      <button
        onClick={function () { setShowForm(true); }}
        style={{
          position: 'fixed', bottom: 20, right: 20, background: '#E8604B', color: '#fff',
          border: 'none', borderRadius: 999, padding: '14px 20px', fontWeight: 700, fontSize: 14,
        }}
      >
        {s.shareToy}
      </button>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: colors.paper, width: '100%', maxWidth: 480, borderRadius: '20px 20px 0 0', padding: 20, maxHeight: '85vh', overflowY: 'auto' }}>
            <button onClick={function () { setShowForm(false); }} style={{ float: 'right', border: 'none', background: '#fff', borderRadius: 999, width: 32, height: 32 }}>x</button>
            <h2 style={{ color: colors.ink }}>{s.formTitle}</h2>
            {user && user.primaryEmailAddress && (
              <p style={{ fontSize: 12, color: '#8a8267', marginTop: -8, marginBottom: 14 }}>
                {s.submittingAs} <strong>{user.primaryEmailAddress.emailAddress}</strong>
              </p>
            )}
            {submitMessage ? (
              <p>{submitMessage}</p>
            ) : (
              <div>
                <input placeholder={s.namePlaceholder} value={formData.name}
                  onChange={function (e) { setFormData(Object.assign({}, formData, { name: e.target.value })); }}
                  style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 10, border: '1px solid #ddd' }} />
                <input placeholder={s.countryPlaceholder} value={formData.country}
                  onChange={function (e) { setFormData(Object.assign({}, formData, { country: e.target.value })); }}
                  style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 10, border: '1px solid #ddd' }} />
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.ink, marginBottom: 6 }}>{s.regionLabel}</label>
                <select value={formData.region}
                  onChange={function (e) { setFormData(Object.assign({}, formData, { region: e.target.value })); }}
                  style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 10, border: '1px solid #ddd', background: '#fff' }}>
                  <option value="samerica">{s.samerica}</option>
                  <option value="africa">{s.africa}</option>
                  <option value="asia">{s.asia}</option>
                  <option value="europe">{s.europe}</option>
                  <option value="oceania">{s.oceania}</option>
                  <option value="namerica">{s.namerica}</option>
                </select>
                <input placeholder={s.materialsPlaceholder} value={formData.materials}
                  onChange={function (e) { setFormData(Object.assign({}, formData, { materials: e.target.value })); }}
                  style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 10, border: '1px solid #ddd' }} />
                <textarea placeholder={s.descPlaceholder} value={formData.playDescription}
                  onChange={function (e) { setFormData(Object.assign({}, formData, { playDescription: e.target.value })); }}
                  style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 10, border: '1px solid #ddd', minHeight: 70 }} />
                <input placeholder={s.sourcePlaceholder} value={formData.source}
                  onChange={function (e) { setFormData(Object.assign({}, formData, { source: e.target.value })); }}
                  style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 10, border: '1px solid #ddd' }} />
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.ink, marginBottom: 6 }}>{s.photoLabel}</label>
                <input type="file" accept="image/*"
                  onChange={function (e) { setPhotoFile(e.target.files[0]); }}
                  style={{ width: '100%', marginBottom: 14, fontSize: 12 }} />
                <p style={{ fontSize: 11.5, color: '#8a8267', margin: '0 0 12px' }}>{s.reviewNote}</p>
                <button onClick={handleSubmit} disabled={uploading} style={{ width: '100%', background: '#E8604B', color: '#fff', border: 'none', padding: 13, borderRadius: 12, fontWeight: 700 }}>
                  {uploading ? s.submitting : s.submitBtn}
                </button>
                {submitError && <p style={{ fontSize: 12, color: '#E8604B', marginTop: 10 }}>{submitError}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '20px 16px 90px', fontSize: 12, color: '#8a8267' }}>
        {s.footerText} <a href="mailto:hello@toysoftheworld.app" style={{ color: colors.ink, fontWeight: 700 }}>hello@toysoftheworld.app</a>
      </footer>
    </main>
    </>
  );
}
