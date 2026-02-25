import { useEffect, useState } from 'react';
import { placementPrepAPI } from '../utils/api';
import './PlacementPrep.css';

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
      setError('Please enter a domain (e.g., Web Development, Data Science, Cloud).');
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
    <div className="prep-container">
      <div className="prep-header">
        <h2>Placement Roadmap</h2>
        <p className="prep-subtitle">
          AI-generated, checklist-based roadmap to land an entry-level job in your chosen domain.
        </p>
      </div>

      <div className="prep-input-section">
        <div className="prep-input-wrapper">
          <input
            id="domain-input"
            type="text"
            spellCheck="false"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Enter Domain (e.g. Data Science, DevOps, UI/UX...)"
          />
        </div>

        <div className="prep-actions">
          <button
            className="prep-btn primary"
            onClick={() => handleGenerate(false)}
            disabled={loading}
          >
            {loading ? 'Generating Roadmap...' : roadmap ? 'Load Roadmap' : 'Generate Roadmap'}
          </button>

          {roadmap && (
            <button
              className="prep-btn secondary"
              onClick={() => handleGenerate(true)}
              disabled={loading}
            >
              🔄 Regenerate
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {roadmap && roadmap.sections && roadmap.sections.length > 0 && (
        <div className="prep-dashboard">
          <div className="prep-progress-header">
            <div className="prep-progress-info">
              <h3>Track Your Progress</h3>
              <p>
                {progress === 0 && 'Getting started - you can do this!'}
                {progress > 0 && progress < 100 && 'Keep going, you are making progress!'}
                {progress === 100 && 'Incredible job! You are ready!'}
                {saving && <span style={{ marginLeft: '10px', fontStyle: 'italic', color: '#60a5fa' }}>Saving...</span>}
              </p>
            </div>
            <div className="prep-progress-circle">
              <span className="value">{progress}</span>
              <span className="symbol">%</span>
            </div>
          </div>

          <div className="roadmap-grid">
            {roadmap.sections.map((section, sIdx) => (
              <div key={sIdx} className="roadmap-card">
                <h4>{section.title}</h4>
                <ul className="roadmap-items">
                  {(section.items || []).map((item, iIdx) => (
                    <li key={iIdx} className="roadmap-item">
                      <input
                        type="checkbox"
                        checked={!!item.completed}
                        onChange={() => handleToggleItem(sIdx, iIdx)}
                      />
                      <div className="item-content">
                        <span className={`item-text ${item.completed ? 'completed' : ''}`}>
                          {item.text}
                        </span>

                        {item.resources && item.resources.length > 0 && (
                          <div className="resource-links">
                            {item.resources.map((r, rIdx) => (
                              <a
                                key={rIdx}
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resource-badge"
                              >
                                {r.label || 'Resource'} 🔗
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
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

