import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    email: '',
    mobileNumber: '',
    dob: '',
    address: '',
    city: '',
    state: '',
    // Educational Details
    collegeName: '',
    ssc: {
      board: '',
      year: '',
      percentage: '',
    },
    hsc: {
      board: '',
      year: '',
      percentage: '',
    },
    degree: {
      name: '',
      year: '',
      percentage: '',
    },
    yearOfStudy: '',
    expectedGraduationYear: '',
    // Skills & Interest
    technicalSkills: '',
    interests: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields (ssc, hsc, degree)
    if (name.startsWith('ssc.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        ssc: {
          ...formData.ssc,
          [field]: value,
        },
      });
    } else if (name.startsWith('hsc.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        hsc: {
          ...formData.hsc,
          [field]: value,
        },
      });
    } else if (name.startsWith('degree.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        degree: {
          ...formData.degree,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.saveProfile(formData);
      // Update user in localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      user.hasProfile = true;
      localStorage.setItem('user', JSON.stringify(user));
      
      navigate('/main');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Create Your Profile</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Personal Details Section */}
          <section className="profile-section">
            <h2>Personal Details</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mobileNumber">Mobile Number</label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* Educational Details Section */}
          <section className="profile-section">
            <h2>Educational Details</h2>
            <div className="form-group">
              <label htmlFor="collegeName">College / University Name</label>
              <input
                type="text"
                id="collegeName"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                required
              />
            </div>

            <h3>SSC</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ssc.board">Board</label>
                <input
                  type="text"
                  id="ssc.board"
                  name="ssc.board"
                  value={formData.ssc.board}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="ssc.year">Year</label>
                <input
                  type="text"
                  id="ssc.year"
                  name="ssc.year"
                  value={formData.ssc.year}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="ssc.percentage">Percentage</label>
                <input
                  type="number"
                  id="ssc.percentage"
                  name="ssc.percentage"
                  value={formData.ssc.percentage}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <h3>HSC</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hsc.board">Board</label>
                <input
                  type="text"
                  id="hsc.board"
                  name="hsc.board"
                  value={formData.hsc.board}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="hsc.year">Year</label>
                <input
                  type="text"
                  id="hsc.year"
                  name="hsc.year"
                  value={formData.hsc.year}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="hsc.percentage">Percentage</label>
                <input
                  type="number"
                  id="hsc.percentage"
                  name="hsc.percentage"
                  value={formData.hsc.percentage}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <h3>Degree</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="degree.name">Degree Name</label>
                <input
                  type="text"
                  id="degree.name"
                  name="degree.name"
                  value={formData.degree.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="degree.year">Year</label>
                <input
                  type="text"
                  id="degree.year"
                  name="degree.year"
                  value={formData.degree.year}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="degree.percentage">Percentage</label>
                <input
                  type="number"
                  id="degree.percentage"
                  name="degree.percentage"
                  value={formData.degree.percentage}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="yearOfStudy">Year of Study</label>
                <input
                  type="text"
                  id="yearOfStudy"
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="expectedGraduationYear">Expected Graduation Year</label>
                <input
                  type="text"
                  id="expectedGraduationYear"
                  name="expectedGraduationYear"
                  value={formData.expectedGraduationYear}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* Skills & Interest Section */}
          <section className="profile-section">
            <h2>Skills & Interest</h2>
            <div className="form-group">
              <label htmlFor="technicalSkills">Technical Skills</label>
              <textarea
                id="technicalSkills"
                name="technicalSkills"
                value={formData.technicalSkills}
                onChange={handleChange}
                rows="4"
                placeholder="e.g., JavaScript, React, Python, Java"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="interests">Interests</label>
              <textarea
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                rows="4"
                placeholder="e.g., Web Development, Machine Learning, Reading"
                required
              />
            </div>
          </section>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;





