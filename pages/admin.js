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
  const [editData, setEditData] = useState({});
  const [saveMsg, setSaveMsg] = useState('');

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

  function openReview(toy) {
    setExpandedId(toy.id);
    setSaveMsg('');
    const media = toy.media || [];
    setEditData({
      name: toy.name,
      country: toy.country,
      materials: toy.materials,
      playDescription: toy.playDescription,
      history: toy.history || '',
      photoUrl1: media[0] ? media[0].url : '',
      photoUrl2: media[1] ? media[1].url : '',
      photoUrl3: media[2] ? media[2].url : '',
      civilisationCulture: toy.civilisationCulture || '',
      datePeriod: toy.datePeriod || '',
      evidenceStatus: toy.evidenceStatus || '',
      description: toy.description || '',
      culturalSignificance: toy.culturalSignificance || '',
      interestingFacts: toy.interestingFacts || '',
      museumReferences: toy.museumReferences || '',
      imageReferences: toy.imageReferences || '',
    });
  }

  function saveEdits(toyId) {
    fetch('/api/toys/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(Object.assign({ toyId: toyId }, editData)),
    })
      .then(function (r) { return r.json(); })
      .then(function () {
        const newMedia = [editData.photoUrl1, editData.photoUrl2, editData.photoUrl3]
          .filter(Boolean)
          .map(function (u) { return { url: u }; });

        setPending(pending.map(function (t) {
          if (t.id !== toyId) return t;
          const updated = Object.assign({}, t, editData);
          updated.media = newMedia;
          return updated;
        }));
        setPublished(published.map(function (t) {
          if (t.id !== toyId) return t;
          const updated = Object.assign({}, t, editData);
          updated.media = newMedia;
          return updated;
        }));
        setSaveMsg('Saved!');
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

  const inputStyle = { width: '100%', padding: 10, marginBottom: 12, borderRadius: 10, border: '1px solid #ddd', fontSize: 14 };
  const labelStyle = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#8a8267', marginBottom: 4 };

  function EditableToyForm(props) {
    const toy = props.toy;
    return (
      <div>
        <div onClick={function () { setExpandedId(null); }} style={{ cursor: 'pointer', color: colors.ink, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
          &larr; Collapse
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {[editData.photoUrl1, editData.photoUrl2, editData.photoUrl3].map(function (u, i) {
            return u ? <img key={i} src={u} alt="" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8 }} /> : null;
          })}
        </div>

        <div style={labelStyle}>Photo 1 (main)</div>
        <input style={inputStyle} value={editData.photoUrl1}
          onChange={function (e) { setEditData(Object.assign({}, editData, { photoUrl1: e.target.value })); }} />

        <div style={labelStyle}>Photo 2</div>
        <input style={inputStyle} value={editData.photoUrl2}
          onChange={function (e) { setEditData(Object.assign({}, editData, { photoUrl2: e.target.value })); }} />

        <div style={labelStyle}>Photo 3</div>
        <input style={inputStyle} value={editData.photoUrl3}
          onChange={function (e) { setEditData(Object.assign({}, editData, { photoUrl3: e.target.value })); }} />

        <div style={labelStyle}>Name</div>
        <input style={inputStyle} value={editData.name}
          onChange={function (e) { setEditData(Object.assign({}, editData, { name: e.target.value })); }} />

        <div style={labelStyle}>Country</div>
        <input style={inputStyle} value={editData.country}
          onChange={function (e) { setEditData(Object.assign({}, editData, { country: e.target.value })); }} />

        <div style={labelStyle}>Civilisation / Culture</div>
        <input style={inputStyle} value={editData.civilisationCulture}
          onChange={function (e) { setEditData(Object.assign({}, editData, { civilisationCulture: e.target.value })); }} />

        <div style={labelStyle}>Date / Period</div>
        <input style={inputStyle} value={editData.datePeriod} placeholder="e.g. c. 500 BCE, 19th century"
          onChange={function (e) { setEditData(Object.assign({}, editData, { datePeriod: e.target.value })); }} />

        <div style={labelStyle}>Evidence Status</div>
        <input style={inputStyle} value={editData.evidenceStatus} placeholder="e.g. Archaeological, Documented, Oral tradition"
          onChange={function (e) { setEditData(Object.assign({}, editData, { evidenceStatus: e.target.value })); }} />

        <div style={labelStyle}>Overview / General Description</div>
        <textarea style={Object.assign({}, inputStyle, { minHeight: 60 })} value={editData.description}
          onChange={function (e) { setEditData(Object.assign({}, editData, { description: e.target.value })); }} />

        <div style={labelStyle}>Materials</div>
        <input style={inputStyle} value={editData.materials}
          onChange={function (e) { setEditData(Object.assign({}, editData, { materials: e.target.value })); }} />

        <div style={labelStyle}>How it's played</div>
        <textarea style={Object.assign({}, inputStyle, { minHeight: 70 })} value={editData.playDescription}
          onChange={function (e) { setEditData(Object.assign({}, editData, { playDescription: e.target.value })); }} />

        <div style={labelStyle}>History</div>
        <textarea style={Object.assign({}, inputStyle, { minHeight: 70 })} value={editData.history}
          onChange={function (e) { setEditData(Object.assign({}, editData, { history: e.target.value })); }} />

        <div style={labelStyle}>Cultural Significance</div>
        <textarea style={Object.assign({}, inputStyle, { minHeight: 60 })} value={editData.culturalSignificance}
          onChange={function (e) { setEditData(Object.assign({}, editData, { culturalSignificance: e.target.value })); }} />

        <div style={labelStyle}>Interesting Facts</div>
        <textarea style={Object.assign({}, inputStyle, { minHeight: 60 })} value={editData.interestingFacts}
          onChange={function (e) { setEditData(Object.assign({}, editData, { interestingFacts: e.target.value })); }} />

        <div style={labelStyle}>Museum / Archaeological References</div>
        <textarea style={Object.assign({}, inputStyle, { minHeight: 50 })} value={editData.museumReferences}
          onChange={function (e) { setEditData(Object.assign({}, editData, { museumReferences: e.target.value })); }} />

        <div style={labelStyle}>Image References</div>
        <textarea style={Object.assign({}, inputStyle, { minHeight: 50 })} value={editData.imageReferences}
          onChange={function (e) { setEditData(Object.assign({}, editData, { imageReferences: e.target.value })); }} />

        {toy.submitterEmail && (
          <p style={{ fontSize: 12, color: '#8a8267', marginBottom: 12 }}>Submitted by: {toy.submitterEmail}</p>
        )}

        <button
          onClick={function () { saveEdits(toy.id); }}
          style={{ width: '100%', background: colors.ink, color: '#fff', border: 'none', padding: 10, borderRadius: 10, fontWeight: 700, marginBottom: 10 }}
        >
          Save changes
        </button>
        {saveMsg && <p style={{ fontSize: 12, color: '#2C9D8F', marginBottom: 10 }}>{saveMsg}</p>}
      </div>
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
                <div onClick={function () { openReview(toy); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
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
                  <EditableToyForm toy={toy} />
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
          const isOpen = expandedId === toy.id;
          return (
            <div key={toy.id} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #eee' }}>
              {!isOpen && (
                <div>
                  <h3 style={{ margin: '0 0 4px', color: colors.ink }}>{toy.name}</h3>
                  <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px' }}>{toy.country}</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={function () { openReview(toy); }}
                      style={{ flex: 1, background: colors.ink, color: '#fff', border: 'none', padding: 10, borderRadius: 10, fontWeight: 700 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={function () {
                        if (window.confirm('Remove this toy from the library? This cannot be undone.')) {
                          removeToy(toy.id);
                        }
                      }}
                      style={{ flex: 1, background: '#E8604B', color: '#fff', border: 'none', padding: 10, borderRadius: 10, fontWeight: 700 }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              {isOpen && <EditableToyForm toy={toy} />}
            </div>
          );
        })}
      </div>
    </main>
  );
}
