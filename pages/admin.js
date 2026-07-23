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
  const [toys, setToys] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  function loadPending(pw) {
    setLoading(true);
    setErrorMsg('');
    fetch('/api/toys/pending', {
      headers: { 'x-admin-password': pw },
    })
      .then(function (r) {
        if (r.status === 401) {
          throw new Error('Wrong password');
        }
        return r.json();
      })
      .then(function (data) {
        setToys(data);
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
      setToys(toys.filter(function (t) { return t.id !== toyId; }));
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
          onClick={function () { loadPending(password); }}
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
      <h1 style={{ color: colors.ink, fontSize: 22 }}>Pending submissions ({toys.length})</h1>
      {toys.length === 0 && <p>Nothing waiting for review right now.</p>}
      <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
        {toys.map(function (toy) {
          return (
            <div key={toy.id} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #eee' }}>
              <h3 style={{ margin: '0 0 4px', color: colors.ink }}>{toy.name}</h3>
              <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px' }}>{toy.country} &middot; {toy.region}</p>
              <p style={{ fontSize: 13, margin: '0 0 8px' }}><strong>Materials:</strong> {toy.materials}</p>
              <p style={{ fontSize: 13, margin: '0 0 8px' }}><strong>Description:</strong> {toy.playDescription}</p>
              {toy.history && <p style={{ fontSize: 13, margin: '0 0 8px' }}><strong>History:</strong> {toy.history}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  onClick={function () { decide(toy.id, 'PUBLISHED'); }}
                  style={{ flex: 1, background: '#2C9D8F', color: '#fff', border: 'none', padding: 10, borderRadius: 10, fontWeight: 700 }}
                >
                  Approve
                </button>
                <button
                  onClick={function () { decide(toy.id, 'REJECTED'); }}
                  style={{ flex: 1, background: '#999', color: '#fff', border: 'none', padding: 10, borderRadius: 10, fontWeight: 700 }}
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
