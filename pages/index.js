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

  useEffect(() => {
    fetch('/api/toys?region=' + region)
      .then(function (r) { return r.json(); })
      .then(setToys);
  }, [region]);

  function handleSubmit() {
    fetch('/api/toys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setSubmitMessage('Thanks! Your toy is pending review.');
        setFormData({ name: '', country: '', materials: '', playDescription: '', source: '' });
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
            <div key={toy.id} style={{ background: '#fff', borderRadius: 16, padding: 16, border: '2px dashed #e4dcc7' }}>
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
          );
        })}
        {toys.length === 0 && <p>No published toys yet for this region — check back soon.</p>}
      </div>

      <button
        onClick={function () { setShowForm(true); }}
        style={{
          position: 'fixed', bottom: 20, right: 20, background: '#E8604B', color: '#fff',
          border: 'none', borderRadius: 999, padding: '14px 20px', fontWeight: 700, fontSize: 14,
        }}
      >
        Share a toy
      </button>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: colors.paper, width: '100%', maxWidth: 480, borderRadius: '20px 20px 0 0', padding: 20, maxHeight: '85vh', overflowY: 'auto' }}>
            <button onClick={function () { setShowForm(false); }} style={{ float: 'right', border: 'none', background: '#fff', borderRadius: 999, width: 32, height: 32 }}>x</button>
            <h2 style={{ color: colors.ink }}>Share a toy</h2>
            {submitMessage ? (
              <p>{submitMessage}</p>
            ) : (
              <div>
                <input placeholder="Toy name" value={formData.name}
                  onChange={function (e) { setFormData(Object.assign({}, formData, { name: e.target.value })); }}
                  style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 10, border: '1px solid #ddd' }} />
                <input placeholder="Where is this toy played? (country/region)" value={formData.country}
                  onChange={function (e) { setFormData(Object.assign({}, formData, { country: e.target.value })); }}
                  style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 10, border: '1px solid #ddd' }} />
                <input placeholder="Materials" value={formData.materials}
                  onChange={function (e) { setFormData(Object.assign({}, formData, { materials: e.target.value })); }}
                  style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 10, border: '1px solid #ddd' }} />
                <textarea placeholder="Tell us what you know about the toy" value={formData.playDescription}
                  onChange={function (e) { setFormData(Object.assign({}, formData, { playDescription: e.target.value })); }}
                  style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 10, border: '1px solid #ddd', minHeight: 70 }} />
                <input placeholder="Source of information (e.g. story books, family, museums)" value={formData.source}
                  onChange={function (e) { setFormData(Object.assign({}, formData, { source: e.target.value })); }}
                  style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 10, border: '1px solid #ddd' }} />
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.ink, marginBottom: 6 }}>Add a photo</label>
                <input type="file" accept="image/*"
                  style={{ width: '100%', marginBottom: 14, fontSize: 12 }} />
                <p style={{ fontSize: 11.5, color: '#8a8267', margin: '0 0 12px' }}>
                  Submissions are reviewed by our team before they're published, so it may take a little while to appear.
                </p>
                <button onClick={handleSubmit} style={{ width: '100%', background: '#E8604B', color: '#fff', border: 'none', padding: 13, borderRadius: 12, fontWeight: 700 }}>
                  Add to the library
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
