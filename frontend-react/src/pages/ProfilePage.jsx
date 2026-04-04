import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileApi, photoApi } from '../services/api';
import ProfileModal from '../components/ProfileModal';
import SlideshowModal from '../components/SlideshowModal';

// SVG иконки

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 3l4 4-7 7H10v-4l7-7z" />
    <path d="M4 20h16" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13" />
    <path d="M9 4h6" />
  </svg>
);

const AddPhotoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
    <line x1="12" y1="8" x2="12" y2="18" />
    <line x1="8" y1="13" x2="16" y2="13" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [currentPhotos, setCurrentPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    loadProfile();
    loadLocationsPlatforms();
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, photosRes] = await Promise.all([
        profileApi.get(id),
        photoApi.getByProfile(id),
      ]);
      setProfile(profileRes.data);
      setPhotos(photosRes.data || []);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocationsPlatforms = async () => {
    try {
      const [locationsRes, platformsRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/locations/').then(r => r.json()),
        fetch('http://localhost:8000/api/v1/platforms/').then(r => r.json()),
      ]);
      setLocations(locationsRes);
      setPlatforms(platformsRes);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Открытие слайд-шоу с определенного индекса
  const openSlideshow = (startIndex = 0) => {
    if (photos.length > 0) {
      setCurrentPhotos(photos);
      setCurrentIndex(startIndex);
      setSlideshowOpen(true);
    }
  };

  // Установка аватара
  const setAsAvatar = async (photoId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/photos/profile/${id}/avatar/${photoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        await loadProfile();
      }
    } catch (error) {
      console.error('Error setting avatar:', error);
    }
  };

  const handleEditProfile = () => {
    setModalOpen(true);
  };

  const handleDeleteProfile = async () => {
    if (confirm('Вы уверены, что хотите удалить этот профиль?')) {
      try {
        await profileApi.delete(id);
        navigate('/');
      } catch (error) {
        console.error('Error deleting profile:', error);
        alert('Ошибка удаления профиля');
      }
    }
  };

  const handleSaveProfile = async (profileData, linksData, photosFiles) => {
    try {
      await profileApi.update(id, profileData);
      
      for (const link of linksData) {
        if (link.url && link.platform_id) {
          await fetch('http://localhost:8000/api/v1/links/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...link, profile_id: parseInt(id) }),
          });
        }
      }
      
      if (photosFiles && photosFiles.length > 0) {
        const formData = new FormData();
        photosFiles.forEach(file => formData.append('files', file));
        formData.append('profile_id', id);
        await fetch('http://localhost:8000/api/v1/photos/multiple/', {
          method: 'POST',
          body: formData,
        });
      }
      
      await loadProfile();
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  const handlePhotoUpload = async (e) => {
    if (e.target.files.length) {
      const formData = new FormData();
      Array.from(e.target.files).forEach(f => formData.append('files', f));
      formData.append('profile_id', id);
      await fetch('http://localhost:8000/api/v1/photos/multiple/', {
        method: 'POST',
        body: formData,
      });
      await loadProfile();
    }
  };

  const fullName = profile ? [profile.last_name, profile.first_name, profile.middle_name].filter(Boolean).join(' ') || 'Без имени' : '';
  const avatarPhoto = photos.find(p => p.is_avatar) || photos[0];
  const avatarIndex = photos.findIndex(p => p.is_avatar) || 0;
  const location = profile?.current_location;
  const fullLocation = location ? [location.name, location.region?.name, location.region?.country?.name].filter(Boolean).join(', ') : '';

  const formatBirthDate = () => {
    if (!profile) return '';
    const { birth_year, birth_month, birth_day } = profile;
    if (birth_year && birth_month && birth_day) return `${birth_year}-${String(birth_month).padStart(2, '0')}-${String(birth_day).padStart(2, '0')}`;
    if (birth_year && birth_month) return `${birth_year}-${String(birth_month).padStart(2, '0')}`;
    if (birth_year) return `${birth_year}`;
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-xl mb-4 text-gray-500">Профиль не найден</p>
          <button onClick={() => navigate('/')} className="text-sm border border-gray-700 px-4 py-1.5 hover:border-white transition">НА ГЛАВНУЮ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="flex justify-between items-center px-5 py-3">
          <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-white transition">← НАЗАД</button>
          <h1 className="text-sm font-light tracking-wider text-white">GRAPHSOCIAL</h1>
          <div className="flex gap-2">
            <button onClick={handleEditProfile} className="p-1.5 text-gray-400 hover:text-white transition"><EditIcon /></button>
            <button onClick={handleDeleteProfile} className="p-1.5 text-gray-400 hover:text-red-500 transition"><DeleteIcon /></button>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-4xl mx-auto">
        <div className="border-b border-gray-800 p-6">
          <div className="flex gap-6">
            <div 
              className="w-24 h-24 rounded-full overflow-hidden cursor-pointer bg-gray-900 flex-shrink-0 border border-gray-700"
              onClick={() => openSlideshow(avatarIndex)}
            >
              {avatarPhoto ? (
                <img 
                  src={`http://localhost:8000${avatarPhoto.url}`} 
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-light text-gray-600">
                  {fullName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-xl font-light mb-2">{fullName}</h1>
              <div className="flex flex-col gap-1 text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-4">{profile.sex === 'male' ? '♂' : '♀'}</span>
                  <span>{profile.sex === 'male' ? 'Male' : 'Female'}</span>
                </div>
                {formatBirthDate() && (
                  <div className="flex items-center gap-2">
                    <span className="w-4">📅</span>
                    <span>{formatBirthDate()}</span>
                  </div>
                )}
                {fullLocation && (
                  <div className="flex items-center gap-2">
                    <span className="w-4">📍</span>
                    <span className="truncate">{fullLocation}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-sm font-light">{photos.length}</div>
                  <div className="text-[10px] text-gray-600">PHOTOS</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-light">{profile.links?.length || 0}</div>
                  <div className="text-[10px] text-gray-600">LINKS</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {profile.links?.length > 0 && (
          <div className="border-b border-gray-800 p-6">
            <h2 className="text-xs font-light tracking-wider text-gray-500 mb-3">SOCIAL</h2>
            <div className="flex gap-3 flex-wrap">
              {profile.links.map(link => (
                <a 
                  key={link.id}
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition"
                >
                  <span>🔗</span>
                  <span>{link.platform.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-light tracking-wider text-gray-500">PHOTOS</h2>
            <button 
              onClick={() => document.getElementById('photoUpload').click()}
              className="text-gray-400 hover:text-white transition"
            >
              <AddPhotoIcon />
            </button>
            <input id="photoUpload" type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          {photos.length > 0 ? (
            <div className="columns-2 md:columns-3 gap-2 space-y-2">
              {photos.map((photo, idx) => (
                <div key={photo.id} className="relative group break-inside-avoid">
                  <div 
                    className="cursor-pointer overflow-hidden bg-gray-900"
                    onClick={() => openSlideshow(idx)}
                  >
                    <img 
                      src={`http://localhost:8000${photo.url}`} 
                      alt="Фото"
                      className="w-full h-auto object-cover hover:opacity-80 transition"
                    />
                  </div>
                  <button 
                    onClick={() => setAsAvatar(photo.id)}
                    className={`absolute top-2 right-2 p-1.5 ${photo.is_avatar ? 'bg-yellow-500' : 'bg-black/60'} text-white hover:bg-yellow-500 transition rounded-full`}
                    title="Set as avatar"
                  >
                    <StarIcon filled={photo.is_avatar} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600 text-sm">Нет фотографий</div>
          )}
        </div>
        </div>
      </main>

      <ProfileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProfile}
        profile={profile}
        locations={locations}
        platforms={platforms}
      />

      <SlideshowModal
        isOpen={slideshowOpen}
        onClose={() => setSlideshowOpen(false)}
        photos={currentPhotos}
        profile={profile}
        startIndex={currentIndex}
      />
    </div>
  );
};

export default ProfilePage;