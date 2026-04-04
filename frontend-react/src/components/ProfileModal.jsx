import React, { useState, useEffect } from 'react';

const ProfileModal = ({ isOpen, onClose, onSave, profile, locations, platforms }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    sex: 'male',
    birth_year: '',
    birth_month: '',
    birth_day: '',
    current_location_id: '',
  });
  const [links, setLinks] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        middle_name: profile.middle_name || '',
        last_name: profile.last_name || '',
        sex: profile.sex || 'male',
        birth_year: profile.birth_year || '',
        birth_month: profile.birth_month || '',
        birth_day: profile.birth_day || '',
        current_location_id: profile.current_location_id || '',
      });
      setLinks(profile.links || []);
    } else {
      setFormData({
        first_name: '',
        middle_name: '',
        last_name: '',
        sex: 'male',
        birth_year: '',
        birth_month: '',
        birth_day: '',
        current_location_id: '',
      });
      setLinks([]);
      setPhotos([]);
    }
    setError('');
  }, [profile]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addLink = () => {
    setLinks([...links, { url: '', platform_id: '' }]);
  };

  const updateLink = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const removeLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handlePhotoChange = (e) => {
    setPhotos(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const profileData = {
        first_name: formData.first_name || null,
        middle_name: formData.middle_name || null,
        last_name: formData.last_name || null,
        sex: formData.sex,
        birth_year: formData.birth_year ? parseInt(formData.birth_year) : null,
        birth_month: formData.birth_month ? parseInt(formData.birth_month) : null,
        birth_day: formData.birth_day ? parseInt(formData.birth_day) : null,
        current_location_id: formData.current_location_id ? parseInt(formData.current_location_id) : null,
      };
      
      await onSave(profileData, links.filter(l => l.url && l.platform_id), photos);
      onClose();
    } catch (err) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-black border border-gray-800 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-sm font-light tracking-wider">{profile ? 'EDIT PROFILE' : 'NEW PROFILE'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">&times;</button>
        </div>
        
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600 transition"
            />
          </div>
          
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Middle Name</label>
            <input
              type="text"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600 transition"
            />
          </div>
          
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600 transition"
            />
          </div>
          
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Gender</label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600 transition"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Year</label>
              <input 
                type="number" 
                name="birth_year" 
                value={formData.birth_year} 
                onChange={handleChange} 
                className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600 transition" 
                placeholder="YYYY"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Month</label>
              <input 
                type="number" 
                name="birth_month" 
                value={formData.birth_month} 
                onChange={handleChange} 
                className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600 transition" 
                placeholder="MM"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Day</label>
              <input 
                type="number" 
                name="birth_day" 
                value={formData.birth_day} 
                onChange={handleChange} 
                className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600 transition" 
                placeholder="DD"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Location</label>
            <select 
              name="current_location_id" 
              value={formData.current_location_id} 
              onChange={handleChange} 
              className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600 transition"
            >
              <option value="">Not specified</option>
              {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider">Social Links</label>
              <button type="button" onClick={addLink} className="text-[10px] text-gray-500 hover:text-white transition">+ ADD</button>
            </div>
            {links.map((link, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select 
                  value={link.platform_id} 
                  onChange={e => updateLink(idx, 'platform_id', e.target.value)} 
                  className="flex-1 bg-transparent border-b border-gray-800 py-2 text-xs focus:outline-none focus:border-gray-600 transition"
                >
                  <option value="">Platform</option>
                  {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input 
                  type="url" 
                  value={link.url} 
                  onChange={e => updateLink(idx, 'url', e.target.value)} 
                  placeholder="https://" 
                  className="flex-1 bg-transparent border-b border-gray-800 py-2 text-xs focus:outline-none focus:border-gray-600 transition" 
                />
                <button type="button" onClick={() => removeLink(idx)} className="text-gray-500 hover:text-red-500 transition">✖</button>
              </div>
            ))}
          </div>
          
          {!profile && (
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Photos</label>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handlePhotoChange} 
                className="w-full text-xs"
              />
            </div>
          )}
          
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button type="button" onClick={onClose} className="flex-1 text-sm py-2 text-gray-500 hover:text-white transition">CANCEL</button>
            <button type="submit" disabled={loading} className="flex-1 text-sm py-2 bg-white text-black hover:bg-gray-200 transition disabled:opacity-50">
              {loading ? 'SAVING...' : 'SAVE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;