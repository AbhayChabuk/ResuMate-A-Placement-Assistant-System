import React, { useEffect, useState } from 'react';
import { placementPrepAPI } from '../utils/api';
import './ResuHelp.css';

const PlacementPrep = () => {
  const [domain, setDomain] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load existing roadmap on mount
  useEffect(() => {
    let isMounted = true;
    const fetchRoadmap = async () => {
      try {
        const res = await placementPrepAPI.getRoadmap();
        if (!isMounted) return;
        if (res.data) {
          setDomain(res.data.domain || '');
          setRoadmap(res.data);
        }
      } catch (err) {
        // 404 means no roadmap yet – not an error for UX
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || 'Failed to load roadmap.');
        }
      }
    };
    fetchRoadmap();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGenerate = async (regenerate = false) => {
    if (!domain.trim()) {
      setError('Please enter a domain (e.g., Web Development, Data Science, Cloud / DevOps).');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await placementPrepAPI.generateRoadmap(domain, regenerate);
      setRoadmap(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const persistRoadmap = async (updated) => {
    setSaving(true);
    try {
      await placementPrepAPI.updateRoadmap({
        domain: updated.domain,
        sections: updated.sections,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save progress.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleItem = (sectionIndex, itemIndex) => {
    if (!roadmap) return;
    const updated = {
      ...roadmap,
      sections: roadmap.sections.map((section, sIdx) =>
        sIdx !== sectionIndex
          ? section
          : {
              ...section,
              items: section.items.map((item, iIdx) =>
                iIdx !== itemIndex ? item : { ...item, completed: !item.completed }
              ),
            }
      ),
    };
    setRoadmap(updated);
    persistRoadmap(updated);
  };

  const computeProgress = () => {
    if (!roadmap || !roadmap.sections?.length) return 0;
    let total = 0;
    let done = 0;
    roadmap.sections.forEach((section) => {
      (section.items || []).forEach((item) => {
        total += 1;
        if (item.completed) done += 1;
      });
    });
    if (!total) return 0;
    return Math.round((done / total) * 100);
  };

  const progress = computeProgress();

  return (
    <div className="resuhelp-container">
      <h2>PlacementPrep - AI Roadmap</h2>
      <p className="resuhelp-subtitle">
        Get a guided, checklist-based roadmap to land an entry-level job in your chosen domain.
      </p>

      <div className="upload-section">
        <div className="upload-card" style={{ flex: 1 }}>
          <label className="upload-label" htmlFor="domain-input">
            <div className="upload-icon">🎯</div>
            <div className="upload-text">
              <h3>Enter Your Domain</h3>
              <p>E.g., Web Development, Data Science, Cloud / DevOps</p>
            </div>
          </label>
          <input
            id="domain-input"
            type="text"
            spellCheck="false"
            className="file-input"
            style={{ position: 'static', opacity: 1, height: 'auto', padding: '10px', borderRadius: '8px' }}
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Web Development"
          />
        </div>

        <div className="upload-card" style={{ alignItems: 'stretch', justifyContent: 'center' }}>
          <button
            className="analyze-button"
            style={{ width: '100%' }}
            onClick={() => handleGenerate(false)}
            disabled={loading}
          >
            {loading ? 'Generating Roadmap...' : roadmap ? 'Load / Use Roadmap' : 'Generate Roadmap'}
          </button>
          {roadmap && (
            <button
              className="analyze-button"
              style={{
                width: '100%',
                marginTop: '10px',
                background: 'linear-gradient(135deg, #ff8800 0%, #ff6600 100%)',
              }}
              onClick={() => handleGenerate(true)}
              disabled={loading}
            >
              Regenerate Roadmap
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {roadmap && roadmap.sections && roadmap.sections.length > 0 && (
        <div className="analysis-result">
          <div className="job-fit-score">
            <h3>Progress</h3>
            <div className="score-circle">
              <span className="score-value">{progress}</span>
              <span className="score-total">%</span>
            </div>
            <p className="score-description">
              {progress === 0 && 'Getting started'}{progress > 0 && progress < 100 && 'Keep going!'}{progress === 100 &&
                'Great job!'}
            </p>
            {saving && <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>Saving progress…</p>}
          </div>

          <div className="analysis-details">
            {roadmap.sections.map((section, sIdx) => (
              <div key={sIdx} className="detail-section">
                <h4>{section.title}</h4>
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                  {(section.items || []).map((item, iIdx) => (
                    <li key={iIdx} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={!!item.completed}
                          onChange={() => handleToggleItem(sIdx, iIdx)}
                          style={{ marginRight: '8px' }}
                        />
                        <span style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>{item.text}</span>
                      </div>
                      {item.resources && item.resources.length > 0 && (
                        <div style={{ marginLeft: '26px', marginTop: '4px', fontSize: '0.85rem' }}>
                          {item.resources.map((r, rIdx) => (
                            <a
                              key={rIdx}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ marginRight: '8px', color: '#1a73e8' }}
                            >
                              {r.label || 'Resource'}
                            </a>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementPrep;

