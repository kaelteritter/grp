import React, { useState, useEffect, useRef } from 'react';
import LocationSearch from './LocationSearch';
import PlaceSearch from './PlaceSearch';
import ProfessionSearch from './ProfessionSearch';
import CompanySearch from './CompanySearch';
import ProfileSearch from './ProfileSearch';


const ProfileModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  profile, 
  locations, 
  platforms, 
  professions, 
  companies, 
  connections: propConnections = []
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    sex: 'female',
    birth_year: '',
    birth_month: '',
    birth_day: '',
    current_location_id: '',
    university_id: '',
    email: '',
    phone: '',
    hair_color: '',
  });
  const [links, setLinks] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [localConnections, setLocalConnections] = useState([]);
  const [newConnectionProfileId, setNewConnectionProfileId] = useState(null);
  const [newConnectionProfileName, setNewConnectionProfileName] = useState('');
  const [newConnectionRelationType, setNewConnectionRelationType] = useState('friend');
  const [newConnectionProfileSex, setNewConnectionProfileSex] = useState('male');
  const [deletedLinkIds, setDeletedLinkIds] = useState([]);
  const [employments, setEmployments] = useState([]);
  const initialized = useRef(false);
  


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
        current_location_id: profile.current_location?.id || '',
        university_id: profile.university?.id || '',
        email: profile.email || '',
        phone: profile.phone || '',
        hair_color: profile.hair_color || '',
      });
      setLinks((profile.links || []).map(link => ({
        id: link.id,
        url: link.url,
        platform_id: link.platform?.id || link.platform_id
      })));
      // Инициализация профессий
      setEmployments((profile.employments || []).map(emp => ({
        profession_id: emp.profession_id,
        company_id: emp.company_id,
        is_current: emp.is_current,
        start_year: emp.start_year,
        end_year: emp.end_year
      })));
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
        university_id: '',
        email: '',
        phone: '',
        hair_color: '',
      });
      setLinks([]);
      setPhotos([]);
      setVideos([]);
      setPhotoPreviews([]);
      setVideoPreviews([]);
      setEmployments([]);       // ✅ вместо profile.employments
      setLocalConnections([]);
      setDeletedLinkIds([]);
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

  useEffect(() => {
    if (isOpen && !initialized.current) {
      if (propConnections && propConnections.length > 0) {
        const mapped = propConnections.map(conn => ({
          profile_id: conn.connected_profile?.id || conn.profile_id,
          relation_type: conn.relation_type,
          profileName: conn.connected_profile 
            ? [conn.connected_profile.first_name, conn.connected_profile.last_name].filter(Boolean).join(' ')
            : `ID ${conn.profile_id}`
        }));
        setLocalConnections(mapped);
      } else if (isOpen) {
        setLocalConnections([]);
      }
      initialized.current = true;
    }
    if (!isOpen) {
      initialized.current = false;
    }
  }, [isOpen, propConnections]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addLink = () => {
    setLinks([...links, { url: '', platform_id: '' }]);
  };

  // Функция удаления ссылки
  const removeLink = (index) => {
    const linkToRemove = links[index];
    if (linkToRemove.id) {
      setDeletedLinkIds(prev => [...prev, linkToRemove.id]);
    }
    setLinks(links.filter((_, i) => i !== index));
  };

  // Функция обновления ссылки (при изменении URL или платформы)
  const updateLink = (index, field, value) => {
    console.log(`🔄 updateLink: index=${index}, field=${field}, value=${value}`);
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    console.log('📝 newLinks after update:', newLinks);
    setLinks(newLinks);
  };

  const addEmployment = () => {
    setEmployments([...employments, { profession_id: '', company_id: '', is_current: true }]);
  };

  const updateEmployment = (index, field, value) => {
    const newEmployments = [...employments];
    newEmployments[index][field] = value;
    setEmployments(newEmployments);
  };

  const removeEmployment = (index) => {
    setEmployments(employments.filter((_, i) => i !== index));
  };

  // Функция для построения полного URL из base_url и введённого пользователем значения
  const buildFullUrl = (platform, userInput) => {
    if (!platform?.base_url) return userInput;
    let input = userInput.trim();
    if (input.startsWith('http://') || input.startsWith('https://')) return input;
    const base = platform.base_url.replace(/\/$/, '');
    const path = input.replace(/^\//, '');
    return `${base}/${path}`;
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

  const addConnection = (profileId, profileName, relationType) => {
    console.log('➕ addConnection called with:', { profileId, profileName, relationType });
    setLocalConnections(prev => {
      const newConnections = [...prev, { profile_id: profileId, relation_type: relationType, profileName }];
      console.log('📝 New localConnections:', newConnections);
      return newConnections;
    });
  };

  const updateConnection = (index, field, value) => {
    const newConnections = [...connections];
    newConnections[index][field] = value;
    setConnections(localConnections);
  };

  const removeConnection = (index) => {
    setLocalConnections(localConnections.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const connectionsToSend = localConnections.map(c => ({
      profile_id: c.profile_id,
      relation_type: c.relation_type
    }));
    onSave(profileData, linksData, photos, videos, employments, connectionsToSend);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const connectionsToSend = localConnections.map(c => ({
      profile_id: c.profile_id,
      relation_type: c.relation_type
    }));
    const linksToSend = links;
    console.log('📤 Sending connections:', connectionsToSend);
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
        university_id: formData.university_id ? parseInt(formData.university_id) : null,
        email: formData.email || null,
        phone: formData.phone || null,
        hair_color: formData.hair_color || null,
      };

      console.log('📦 Current links state before processing:', links);
      console.log('🔍 Links before filter:', links.map(l => ({ id: l.id, url: l.url, platform_id: l.platform_id, type: typeof l.platform_id })));
      const processedLinks = links
      .filter(link => link.url && link.url.trim() !== '' && link.platform_id)
      .map(link => {
        const platform = platforms.find(p => p.id === parseInt(link.platform_id));
        const fullUrl = buildFullUrl(platform, link.url);
        return { ...link, url: fullUrl };
      });

      await onSave(profileData, processedLinks, photos, videos, employments, connectionsToSend, deletedLinkIds);
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
  const getAvailableRelationTypes = (sex) => {
  const allOptions = [
    { value: 'friend', label: 'Друг', allowedFor: ['male', 'female'] },
    { value: 'mother', label: 'Мать', allowedFor: ['female'] },
    { value: 'father', label: 'Отец', allowedFor: ['male'] },
    { value: 'brother', label: 'Брат', allowedFor: ['male'] },
    { value: 'sister', label: 'Сестра', allowedFor: ['female'] },
    { value: 'daughter', label: 'Дочь', allowedFor: ['female'] },  // Добавлено
    { value: 'son', label: 'Сын', allowedFor: ['male'] },          // Опционально
  ];
    return allOptions.filter(opt => opt.allowedFor.includes(sex));
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-black border border-gray-800 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-sm font-light tracking-wider">{profile ? 'EDIT PROFILE' : 'NEW PROFILE'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">&times;</button>
        </div>

        {error && <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs">{error}</div>}

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

              <div className="form-group">
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Location</label>
                <LocationSearch
                  value={formData.current_location_id}
                  onChange={(locationId) => setFormData(prev => ({ ...prev, current_location_id: locationId }))}
                  placeholder="Search location..."
                />
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

            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">University</label>
              <PlaceSearch
                value={formData.university_id}
                onChange={(universityId) => setFormData(prev => ({ ...prev, university_id: universityId }))}
                placeholder="Search university by name..."
              />
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
                    <select value={link.platform_id || ''} onChange={e => updateLink(idx, 'platform_id', e.target.value)} className="flex-1 bg-transparent border-b border-gray-800 py-2 text-xs">
                      <option value="">Platform</option>
                      {safePlatforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input
                      type="text"
                      value={link.url || ''}
                      onChange={e => updateLink(idx, 'url', e.target.value)}
                      placeholder="username or path"
                      className="flex-1 bg-transparent border-b border-gray-800 py-2 text-xs"
                    />
                    <button type="button" onClick={() => removeLink(idx)} className="text-gray-500 hover:text-red-500">✖</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Profession Tab */}
          {activeTab === 'profession' && (
            <>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider">Professions</label>
                <button type="button" onClick={addEmployment} className="text-[10px] text-gray-500 hover:text-white">+ ADD</button>
              </div>
              {employments.map((emp, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-start">
                  <div className="flex-1">
                    <ProfessionSearch
                      value={emp.profession_id}
                      onChange={(id) => updateEmployment(idx, 'profession_id', id)}
                      placeholder="Search profession..."
                    />
                  </div>
                  <div className="flex-1">
                    <CompanySearch
                      value={emp.company_id}
                      onChange={(id) => updateEmployment(idx, 'company_id', id)}
                      placeholder="Search company..."
                    />
                  </div>
                  <button type="button" onClick={() => removeEmployment(idx)} className="text-red-500 hover:text-red-400">✖</button>
                </div>
              ))}
            </>
          )}

          {activeTab === 'connections' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider">Profile Connections</label>
            </div>

            {/* Форма добавления новой связи */}
            <div className="flex gap-2 items-end mb-4">
              <div className="flex-1">
                <label className="block text-[10px] text-gray-500 mb-1">Profile</label>
                  <ProfileSearch
                    onChange={(id, name, sex) => {
                      setNewConnectionProfileId(id);
                      setNewConnectionProfileName(name);
                      setNewConnectionProfileSex(sex || 'male'); // если пол не передан, по умолчанию male
                    }}
                    placeholder="Search profile by name..."
                  />

              </div>
              <div className="w-32">
                <label className="block text-[10px] text-gray-500 mb-1">Relation</label>
                <select
                  value={newConnectionRelationType}
                  onChange={(e) => setNewConnectionRelationType(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-800 py-2 text-sm"
                >
                  {getAvailableRelationTypes(newConnectionProfileSex).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  console.log('🔘 Add button clicked', { newConnectionProfileId, newConnectionRelationType });
                  if (newConnectionProfileId && newConnectionRelationType) {
                    addConnection(newConnectionProfileId, newConnectionProfileName, newConnectionRelationType);
                    setNewConnectionProfileId(null);
                    setNewConnectionProfileName('');
                    setNewConnectionRelationType('friend');
                  } else {
                    console.warn('⚠️ Missing profileId or relationType');
                  }
                }}
                className="mt-5 text-xs text-white bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
              >
                Add
              </button>
            </div>

            {/* Список текущих связей */}
            <div className="space-y-2">
              {localConnections.map((conn, idx) => {
                const relationTypeRu = 
                  conn.relation_type === 'friend' ? 'Друг' :
                  conn.relation_type === 'mother' ? 'Мать' :
                  conn.relation_type === 'brother' ? 'Брат' :
                  conn.relation_type === 'sister' ? 'Сестра' :
                  conn.relation_type === 'father' ? 'Отец' : conn.relation_type;
                return (
                  <div key={idx} className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                    <div>
                      <span className="text-sm text-white">{conn.profileName}</span>
                      <span className="text-xs text-gray-400 ml-2">({conn.profile_id})</span>
                      <span className="text-xs text-gray-500 ml-2">– {relationTypeRu}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeConnection(idx)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Удалить
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
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