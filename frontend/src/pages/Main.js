import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResuHelp from '../components/ResuHelp';
import './Main.css';

const Main = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const handleBackToMain = () => {
    setActiveSection(null);
  };

  if (activeSection === 'resuhelp') {
    return (
      <div className="main-container">
        <header className="main-header">
          <h1>ResuMate</h1>
          <div className="header-actions">
            <button onClick={handleBackToMain} className="back-button">
              ← Back to Main
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </header>
        <div className="section-content">
          <ResuHelp />
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <header className="main-header">
        <h1>ResuMate</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="main-content">
        <h2>Welcome to ResuMate</h2>
        
        <div className="sections-container">
          {/* Section 1: PlacementPrep */}
          <div className="section-card placement-prep">
            <h3>PlacementPrep</h3>
            <p>Get ready for your placement interviews with comprehensive preparation materials and resources.</p>
            <button className="section-button" onClick={() => handleSectionClick('placementprep')}>
              Explore PlacementPrep
            </button>
          </div>

          {/* Section 2: ResuHelp */}
          <div className="section-card resu-help">
            <h3>ResuHelp</h3>
            <p>Build an ATS-friendly resume with the help of artificial intelligence. Get personalized resume suggestions and optimizations.</p>
            <button className="section-button" onClick={() => handleSectionClick('resuhelp')}>
              Start Building Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;

