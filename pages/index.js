import { useEffect, useState } from 'react';
import { prisma } from '../lib/prisma';
import { supabase } from '../lib/supabaseClient';

export async function getServerSideProps() {
  const toys = await prisma.toy.findMany({
    where: { status: 'PUBLISHED' },
    include: { media: { where: { isPrimary: true }, take: 1 } },
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

export default function Home(props) {
  const initialToys = props.initialToys;
  const [region, setRegion] = useState('all');
  const [toys, setToys] = useState(initialToys);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', country: '', materials: '', playDescription: '', source: '' });
  const [submitMessage, setSubmitMessage] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
    const payload = Object.assign({}, formData, { photoUrl: photoUrl });

    return fetch('/api/toys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setUploading(false);
        setSubmitMessage('Thanks! Your toy is pending review.');
        setFormData({ name: '', country: '', materials: '', playDescription: '', source: '' });
        setPhotoFile(null);
      });
  }

  return (
    <main style={{ fontFamily: 'sans-serif', background: colors.paper, minHeight: '100vh', color: colors.charcoal }}>
      <header style={{ background: colors.ink, color: '#fff', padding: '20px 18px 28px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 12, color: colors.mango }}>Toys of the World</div>
        <h1 style={{ fontSize: 24, lineHeight: 1.2, margin: '0 0 12px', color: '#fff' }}>Discover toys around the world and their history</h1>
        <p style={{ fontSize: 14, lineHeight: 1.55, margin: '0 0 10px', fontWeight: 700, color: '#fff' }}>
          Browse and learn what toys kids have used since the beginning of time.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.55, margin: '0 0 10px', fontWeight: 700, color: '#fff' }}>
          Upload it yourself! If you know of a toy that could be in this app, please get in touch with us.
          Every toy added helps us build the biggest toy library in the world.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.55, margin: '0 0 14px', fontWeight: 700, color: '#fff' }}>
          This app is for everyone passionate about toys: kids, young people, historians, parents, schools, and community organisations.
        </p>
        <p style={{ fontSize: 11.5, lineHeight: 1.5, margin: 0, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>
          Many toys were created independently by different cultures throughout history. We celebrate every documented tradition rather than assigning a single origin.
        </p>
      </header>

      <div style={{ display: 'flex', gap: 8, padding: '18px 16px 6px', overflowX: 'auto' }}>
        {['all', 'samerica', 'africa', 'japan'].map(function (r) {
          const active = region === r;
          return (
            <button
              key={r}
              onClick={function () { setRegion(r); }}
              style={{
                border: active ? '2px solid ' + colors.mango : '2px solid transparent',
                background: '#fff',
                padding: '8px 16px',
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 13,
                color: colors.ink,
                whiteSpace: 'nowrap',
              }}
            >
              {r === 'all' ? 'All regions' : r === 'samerica' ? 'South America' : r === 'africa' ? 'Africa' : 'Japan'}
            </button>
          );
        })}
      </div>

      <div style={{ padding: '14px 16px 100px', display: 'grid', gap: 16 }}>
        {toys.map(function (toy) {
          const photo = toy.media && toy.media[0] ? toy.media[0].url : 'https://loremflickr.com/200/200/toy,wood';
          return (
            <a key={toy.id} href={'/toys/' + toy.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '2px dashed #e4dcc7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <img src={photo} alt={toy.name} style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} />
                <h3 style={{ margin: 0, color: colors.ink, fontSize: 18 }}>{toy.name}</h3>
              </div>
              <div style={{ fontSize: 12.5, color: '#E8604B', fontWeight: 600, marginBottom: 8 }}>Played in: {toy.country}</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.5, margin: '0 0 10px' }}>{toy.playDescription}</p>
              <div style={{ fontSize: 11, background: '#f4f0e4', display: 'inline-block', padding: '4px 9px', borderRadius: 8 }}>
                {toy.materials}
              </div>
            </div>
            </a>
          );
        })}
        {toys.length === 0 && <p>No published toys yet for this region — check back soon.</p>}
      </div>

      <button
        onClick={function () { setShowForm(true); }
