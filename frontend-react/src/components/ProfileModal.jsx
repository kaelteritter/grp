import React, { useState, useEffect } from 'react';

const ProfileModal = ({ isOpen, onClose, onSave, profile, locations, platforms, professions, companies }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    sex: 'female',
    birth_year: '',
    birth_month: '',
    birth_day: '',
    current_location_id: '',
    email: '',
    phone: '',
    hair_color: '',
  });
  const [links, setLinks] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [professionId, setProfessionId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        middle_name: profile.middle_name || '',
        last_name: profile.last_name || '',
        sex: profile.sex || 'female',
        birth_year: profile.birth_year || '',
        birth_month: profile.birth_month || '',
        birth_day: profile.birth_day || '',
        current_location_id: profile.current_location_id || '',
        email: profile.email || '',
        phone: profile.phone || '',
        hair_color: profile.hair_color || '',
      });
      setLinks(profile.links || []);
      setProfessionId(profile.professions?.[0]?.id || '');
      setCompanyId(profile.professions?.[0]?.company_id || '');
    } else {
      setFormData({
        first_name: '',
        middle_name: '',
        last_name: '',
        sex: 'female',
        birth_year: '',
        birth_month: '',
        birth_day: '',
        current_location_id: '',
        email: '',
        phone: '',
        hair_color: '',
      });
      setLinks([]);
      setPhotos([]);
      setVideos([]);
      setPhotoPreviews([]);
      setVideoPreviews([]);
      setProfessionId('');
      setCompanyId('');
      setConnections([]);
    }
    setError('');
  }, [profile]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
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
    const files = Array.from(e.target.files);
    setPhotos(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreviews(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    setVideos(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setVideoPreviews(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeVideo = (index) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
    setVideoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addConnection = () => {
    setConnections([...connections, { profile_id: '', relation_type: '' }]);
  };

  const updateConnection = (index, field, value) => {
    const newConnections = [...connections];
    newConnections[index][field] = value;
    setConnections(newConnections);
  };

  const removeConnection = (index) => {
    setConnections(connections.filter((_, i) => i !== index));
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
        email: formData.email || null,
        phone: formData.phone || null,
        hair_color: formData.hair_color || null,
      };

      await onSave(profileData, links.filter(l => l.url && l.platform_id), photos, videos, professionId, companyId, connections);
      onClose();
    } catch (err) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const safeProfessions = professions || [];
  const safeCompanies = companies || [];
  const safeLocations = locations || [];
  const safePlatforms = platforms || [];

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-black border border-gray-800 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-sm font-light tracking-wider">{profile ? 'EDIT PROFILE' : 'NEW PROFILE'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">&times;</button>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs">
            {error}
          </div>
        )}

        <div className="flex border-b border-gray-800">
          <button className={`px-4 py-2 text-xs ${activeTab === 'basic' ? 'text-white border-b border-white' : 'text-gray-500'}`} onClick={() => setActiveTab('basic')}>Basic</button>
          <button className={`px-4 py-2 text-xs ${activeTab === 'media' ? 'text-white border-b border-white' : 'text-gray-500'}`} onClick={() => setActiveTab('media')}>Media</button>
          <button className={`px-4 py-2 text-xs ${activeTab === 'profession' ? 'text-white border-b border-white' : 'text-gray-500'}`} onClick={() => setActiveTab('profession')}>Profession</button>
          <button className={`px-4 py-2 text-xs ${activeTab === 'connections' ? 'text-white border-b border-white' : 'text-gray-500'}`} onClick={() => setActiveTab('connections')}>Connections</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">First Name</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600" />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Middle Name</label>
                <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className="w-full bg-transparent border-b border-gray-800 py-2 text-sm" />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full bg-transparent border-b border-gray-800 py-2 text-sm" />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Gender</label>
                <select name="sex" value={formData.sex} onChange={handleChange} className="w-full bg-transparent border-b border-gray-800 py-2 text-sm">
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div><label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Year</label><input type="number" name="birth_year" value={formData.birth_year} onChange={handleChange} className="w-full bg-transparent border-b border-gray-800 py-2 text-sm" placeholder="YYYY" /></div>
                <div><label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Month</label><input type="number" name="birth_month" value={formData.birth_month} onChange={handleChange} className="w-full bg-transparent border-b border-gray-800 py-2 text-sm" placeholder="MM" /></div>
                <div><label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Day</label><input type="number" name="birth_day" value={formData.birth_day} onChange={handleChange} className="w-full bg-transparent border-b border-gray-800 py-2 text-sm" placeholder="DD" /></div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Location</label>
                <select name="current_location_id" value={formData.current_location_id} onChange={handleChange} className="w-full bg-transparent border-b border-gray-800 py-2 text-sm">
                  <option value="">Not specified</option>
                  {safeLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-transparent border-b border-gray-800 py-2 text-sm" />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-transparent border-b border-gray-800 py-2 text-sm" />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Hair Color</label>
                <input type="text" name="hair_color" value={formData.hair_color} onChange={handleChange} className="w-full bg-transparent border-b border-gray-800 py-2 text-sm" placeholder="blonde, brunette, red, black" />
              </div>
            </>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] text-gray-500 uppercase tracking-wider">Photos</label>
                </div>
                <div
                  className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-gray-500 transition"
                  onClick={() => document.getElementById('photoUpload').click()}
                >
                  <input type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" id="photoUpload" />
                  <span className="text-gray-500 text-sm">
                    {photos.length > 0 ? `${photos.length} photo(s) selected` : 'Click to upload photos'}
                  </span>
                </div>
                {photoPreviews.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {photoPreviews.map((preview, idx) => (
                      <div key={idx} className="relative w-12 h-12 bg-gray-800 overflow-hidden">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removePhoto(idx)} className="absolute top-0 right-0 bg-red-500 text-white text-[8px] w-3 h-3 flex items-center justify-center rounded-full">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] text-gray-500 uppercase tracking-wider">Videos</label>
                </div>
                <div
                  className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-gray-500 transition"
                  onClick={() => document.getElementById('videoUpload').click()}
                >
                  <input type="file" multiple accept="video/*" onChange={handleVideoChange} className="hidden" id="videoUpload" />
                  <span className="text-gray-500 text-sm">
                    {videos.length > 0 ? `${videos.length} video(s) selected` : 'Click to upload videos'}
                  </span>
                </div>
                {videoPreviews.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {videoPreviews.map((preview, idx) => (
                      <div key={idx} className="relative w-12 h-12 bg-gray-800 overflow-hidden">
                        <video src={preview} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeVideo(idx)} className="absolute top-0 right-0 bg-red-500 text-white text-[8px] w-3 h-3 flex items-center justify-center rounded-full">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] text-gray-500 uppercase tracking-wider">Social Links</label>
                  <button type="button" onClick={addLink} className="text-[10px] text-gray-500 hover:text-white">+ ADD</button>
                </div>
                {links.map((link, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <select value={link.platform_id} onChange={e => updateLink(idx, 'platform_id', e.target.value)} className="flex-1 bg-transparent border-b border-gray-800 py-2 text-xs">
                      <option value="">Platform</option>
                      {safePlatforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="url" value={link.url} onChange={e => updateLink(idx, 'url', e.target.value)} placeholder="https://" className="flex-1 bg-transparent border-b border-gray-800 py-2 text-xs" />
                    <button type="button" onClick={() => removeLink(idx)} className="text-gray-500 hover:text-red-500">✖</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Profession Tab */}
          {activeTab === 'profession' && (
            <>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Profession</label>
                <select value={professionId} onChange={e => setProfessionId(e.target.value)} className="w-full bg-transparent border-b border-gray-800 py-2 text-sm">
                  <option value="">Select profession</option>
                  {safeProfessions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Company</label>
                <select value={companyId} onChange={e => setCompanyId(e.target.value)} className="w-full bg-transparent border-b border-gray-800 py-2 text-sm">
                  <option value="">Select company</option>
                  {safeCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] text-gray-500 uppercase tracking-wider">Profile Connections</label>
                  <button type="button" onClick={addConnection} className="text-[10px] text-gray-500 hover:text-white">+ ADD</button>
                </div>
                {connections.map((conn, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="number" placeholder="Profile ID" value={conn.profile_id} onChange={e => updateConnection(idx, 'profile_id', e.target.value)} className="flex-1 bg-transparent border-b border-gray-800 py-2 text-xs" />
                    <select value={conn.relation_type} onChange={e => updateConnection(idx, 'relation_type', e.target.value)} className="flex-1 bg-transparent border-b border-gray-800 py-2 text-xs">
                      <option value="">Relation</option>
                      <option value="friend">Friend</option>
                      <option value="best_friend">Best Friend</option>
                      <option value="colleague">Colleague</option>
                      <option value="mother">Mother</option>
                      <option value="father">Father</option>
                      <option value="sister">Sister</option>
                      <option value="brother">Brother</option>
                    </select>
                    <button type="button" onClick={() => removeConnection(idx)} className="text-gray-500 hover:text-red-500">✖</button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button type="button" onClick={onClose} className="flex-1 text-sm py-2 text-gray-500 hover:text-white">CANCEL</button>
            <button type="submit" disabled={loading} className="flex-1 text-sm py-2 bg-white text-black hover:bg-gray-200 disabled:opacity-50">
              {loading ? 'SAVING...' : 'SAVE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;