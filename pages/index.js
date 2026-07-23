import { useState } from 'react';

const colors = {
  ink: '#1E56D6',
  coral: '#E8604B',
  paper: '#FBF5E9',
  charcoal: '#2A2419',
};

export default function Admin() {
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [pending, setPending] = useState([]);
  const [published, setPublished] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  function loadAll(pw) {
    setLoading(true);
    setErrorMsg('');

    Promise.all([
      fetch('/api/toys/pending?t=' + Date.now(), { headers: { 'x-admin-password': pw }, cache: 'no-store' }),
      fetch('/api/toys/published?t=' + Date.now(), { headers: { 'x-admin-password': pw }, cache: 'no-store' }),
    ])
      .then(function (responses) {
        if (responses[0].status === 401 || responses[1].status === 401) {
          throw new Error('Wrong password');
        }
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(function (results) {
        setPending(results[0]);
        setPublished(results[1]);
        setUnlocked(true);
        setLoading(false);
      })
      .catch(function (err) {
        setErrorMsg('Wrong password, please try again.');
        setLoading(false);
      });
  }

  function decide(toyId, decision) {
    fetch('/api/toys/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ toyId: toyId, decision: decision }),
    }).then(function () {
      const approvedToy = pending.filter(function (t) { return t.id === toyId; })[0];
      setPending(pending.filter(function (t) { return t.id !== toyId; }));
      if (decision === 'PUBLISHED' && approvedToy) {
        setPublished([approvedToy].concat(published));
      }
    });
  }

  function removeToy(toyId) {
    fetch('/api/toys/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ toyId: toyId }),
    }).then(function () {
      setPublished(published.filter(function (t) { return t.id !== toyId; }));
    });
  }

  if (!unlocked) {
    return (
      <main style={{ fontFamily: 'sans-serif', background: colors.paper, minHeight: '100vh', padding: 24 }}>
        <h1 style={{ color: colors.ink, fontSize: 22 }}>Admin login</h1>
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={function (e) { setPassword(e.target.value); }}
          style={{ width: '100%', maxWidth: 320, padding: 12, borderRadius: 10, border: '1px solid #ddd', marginBottom: 12 }}
        />
        <br />
        <button
          onClick={function () { loadAll(password); }}
          style={{ background: colors.coral, color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 10, fontWeight: 700 }}
        >
          {loading ? 'Checking...' : 'Unlock'}
        </button>
        {errorMsg && <p style={{ color: colors.coral, marginTop: 10 }}>{errorMsg}</p>}
      </main>
    );
  }

  return (
    <main style={{ fontFamily: 'sans-serif', background: colors.paper, minHeight: '100vh', padding: 24 }}>
      <h1 style={{ color: colors.ink, fontSize: 22 }}>Pending submissions ({pending.length})</h1>
      {pending.length === 0 && <p>Nothing waiting for review right now.</p>}
      <div style={{ display: 'grid', gap: 16, marginTop: 16, marginBottom: 36 }}>
        {pending.map(function (toy) {
          const isOpen = expandedId === toy.id;
          const photo = toy.media && toy.media[0] ? toy.media[0].url : null;
          return (
            <div key={toy.id} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #eee' }}>
              {!isOpen && (
                <div onClick={function () { setExpandedId(toy.id); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {photo && <img src={photo} alt={toy.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10 }} />}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 2px', color: colors.ink }}>{toy.name}</h3>
                    <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{toy.country}</p>
                  </div>
                  <span style={{ color: colors.ink, fontSize: 13, fontWeight: 700 }}>Review &rarr;</span>
                </div>
              )}

              {isOpen && (
                <div>
                  <div onClick={function () { setExpandedId(null); }} style={{ cursor: 'pointer', color: colors.ink, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                    &larr; Collapse
                  </div>
                  {photo && (
                    <a href={photo} target="_blank" rel="noreferrer">
                      <img src={photo} alt={toy.name} style={{ width: '100%', maxWidth: 320, height: 240, objectFit: 'cover', borderRadius: 12, marginBottom: 14, display: 'block' }} />
                    </a>
                  )}
                  <h3 style={{ margin: '0 0 4px', color: colors.ink, fontSize: 20 }}>{toy.name}</h3>
                  <p style={{ fontSize: 13, color: '#666', margin: '0 0 14px' }}>{toy.country} &middot; {toy.region}</p>

                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#8a8267', marginBottom: 4 }}>Materials</div>
                  <p style={{ fontSize: 14, margin: '0 0 14px' }}>{toy.materials}</p>

                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#8a8267', marginBottom: 4 }}>How it's played</div>
                  <p style={{ fontSize: 14, margin: '0 0 14px' }}>{toy.playDescription}</p>

                  {toy.history && (
                    <div>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#8a8267', marginBottom: 4 }}>History</div>
                      <p style={{ fontSize: 14, margin: '0 0 14px' }}>{toy.history}</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button
                      onClick={function () { decide(toy.id, 'PUBLISHED'); setExpandedId(null); }}
                      style={{ flex: 1, background: '#2C9D8F', color: '#fff', border: 'none', padding: 10, borderRadius: 10, fontWeight: 700 }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={function () { decide(toy.id, 'REJECTED'); setExpandedId(null); }}
                      style={{ flex: 1, background: '#999', color: '#fff', border: 'none', padding: 10, borderRadius: 10, fontWeight: 700 }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <h1 style={{ color: colors.ink, fontSize: 22 }}>Published toys ({published.length})</h1>
      <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
        {published.map(function (toy) {
          return (
            <div key={toy.id} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #eee' }}>
              <h3 style={{ margin: '0 0 4px', color: colors.ink }}>{toy.name}</h3>
              <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px' }}>{toy.country}</p>
              <button
                onClick={function () {
                  if (window.confirm('Remove this toy from the library? This cannot be undone.')) {
                    removeToy(toy.id);
                  }
                }}
                style={{ background: '#E8604B', color: '#fff', border: 'none', padding: 10, borderRadius: 10, fontWeight: 700, width: '100%' }}
              >
                Remove from library
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
