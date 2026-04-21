import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileApi, photoApi } from '../services/api';
import ProfileModal from '../components/ProfileModal';
import SlideshowModal from '../components/SlideshowModal';

// SVG иконки
const EmailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-10 7L2 7" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const HairIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 4c-5 0-6 5-6 8 0 2 1 4 3 5v3h6v-3c2-1 3-3 3-5 0-3-1-8-6-8z" />
    <path d="M10 19h4" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const SeasonIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v4M12 22v-4M2 12h4M22 12h-4" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

const DaytimeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const EventIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// Иконки для пола
const MaleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 3h6v6M9 9l6-6" />
    <circle cx="12" cy="15" r="6" />
  </svg>
);

const FemaleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="6" />
    <path d="M12 18v4M9 22h6" />
  </svg>
);

const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const VideoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="16" height="12" rx="2" />
    <path d="M22 8l-4 4 4 4V8z" />
  </svg>
);

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('photos');
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoSlideshow, setIsVideoSlideshow] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [connections, setConnections] = useState([]);
  const [hoverVideo, setHoverVideo] = useState({});
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [deletedLinkIds, setDeletedLinkIds] = useState([]);



  useEffect(() => {
    loadAllData();
  }, [id]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [profileRes, photosRes, videosRes, tagsRes, locationsRes, platformsRes, professionsRes, companiesRes, connectionsRes] = await Promise.all([
        profileApi.get(id),
        photoApi.getByProfile(id),
        fetch(`http://localhost:8000/api/v1/videos/?profile_id=${id}`).then(r => r.json()).catch(() => []),
        fetch(`http://localhost:8000/api/v1/photo-tags/?profile_id=${id}`).then(r => r.json()).catch(() => []),
        fetch('http://localhost:8000/api/v1/locations/').then(r => r.json()).catch(() => []),
        fetch('http://localhost:8000/api/v1/platforms/').then(r => r.json()).catch(() => []),
        fetch('http://localhost:8000/api/v1/professions/').then(r => r.json()).catch(() => []),
        fetch('http://localhost:8000/api/v1/companies/').then(r => r.json()).catch(() => []),
        fetch(`http://localhost:8000/api/v1/connections/${id}`).then(r => r.json()).catch(() => []),
      ]);

      setProfile(profileRes.data);
      setPhotos(photosRes.data || []);
      setVideos(videosRes || []);
      setTags(tagsRes || []);
      setLocations(locationsRes);
      setPlatforms(platformsRes);
      setProfessions(professionsRes);
      setCompanies(companiesRes);
      setConnections(connectionsRes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openSlideshow = (media, startIndex = 0, isVideo = false) => {
    setCurrentMedia(media);
    setCurrentIndex(startIndex);
    setIsVideoSlideshow(isVideo);
    setSlideshowOpen(true);
  };

  const setAsAvatar = async (photoId) => {
    try {
      await fetch(`http://localhost:8000/api/v1/photos/profile/${id}/avatar/${photoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      await loadAllData();
    } catch (error) {
      console.error('Error setting avatar:', error);
    }
  };

  const handleSlideshowClose = () => {
    setSlideshowOpen(false);
    loadAllData();
  };

const handleUpdateProfile = async (profileData, linksData, photos, videos, employments, connections, deletedLinkIds) => {
  console.log('🔄 handleUpdateProfile received:', { linksData, deletedLinkIds });
    try {
      await profileApi.update(id, profileData);

    // 1. Удаляем помеченные ссылки
    for (const linkId of deletedLinkIds) {
      await fetch(`http://localhost:8000/api/v1/links/${linkId}`, { method: 'DELETE' });
    }
    
    // 2. Обрабатываем оставшиеся ссылки (создаём новые, обновляем существующие)
    // Обновляем существующие ссылки (PATCH) и создаём новые (POST)
    for (const link of linksData) {
      if (!link.url || !link.platform_id) continue;
      const payload = {
        url: link.url,
        platform_id: parseInt(link.platform_id)
      };
      if (link.id) {
        // Обновление
        const resp = await fetch(`http://localhost:8000/api/v1/links/${link.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!resp.ok) throw new Error(`Ошибка обновления ссылки: ${resp.status}`);
      } else {
        // Создание
        const createPayload = { ...payload, profile_id: parseInt(id) };
        const resp = await fetch('http://localhost:8000/api/v1/links/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createPayload)
        });
        if (!resp.ok) throw new Error(`Ошибка создания ссылки: ${resp.status}`);
      }
    }

      if (photos && photos.length > 0) {
        const formData = new FormData();
        photos.forEach(f => formData.append('files', f));
        formData.append('profile_id', id);
        await fetch('http://localhost:8000/api/v1/photos/multiple/', {
          method: 'POST',
          body: formData,
        });
      }

      if (videos && videos.length > 0) {
        const formData = new FormData();
        videos.forEach(f => formData.append('files', f));
        formData.append('profile_id', id);
        await fetch('http://localhost:8000/api/v1/videos/multiple/', {
          method: 'POST',
          body: formData,
        });
      }

      // Синхронизация профессий (список employments)
      const currentEmployments = profile.employments || [];
      const newEmployments = employments || [];

      // Удаляем те, которых нет в новом списке
      for (const curr of currentEmployments) {
        const stillExists = newEmployments.some(emp => emp.profession_id === curr.profession_id);
        if (!stillExists) {
          await fetch(`http://localhost:8000/api/v1/professions/profile/${id}/profession/${curr.profession_id}`, {
            method: 'DELETE'
          });
        }
      }

      // Добавляем новые или обновляем существующие
      for (const emp of newEmployments) {
        if (!emp.profession_id) continue;
        const exists = currentEmployments.some(curr => curr.profession_id === emp.profession_id);
        if (!exists) {
          // Добавление
          const payload = {
            profile_id: parseInt(id),
            profession_id: parseInt(emp.profession_id),
            company_id: emp.company_id ? parseInt(emp.company_id) : null,
            is_current: emp.is_current || false
          };
          await fetch('http://localhost:8000/api/v1/professions/profile/employment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          // Обновление: удаляем старую, добавляем новую (если изменилась компания)
          const oldEmp = currentEmployments.find(curr => curr.profession_id === emp.profession_id);
          if (oldEmp && (oldEmp.company_id !== emp.company_id)) {
            await fetch(`http://localhost:8000/api/v1/professions/profile/${id}/profession/${emp.profession_id}`, {
              method: 'DELETE'
            });
            const payload = {
              profile_id: parseInt(id),
              profession_id: parseInt(emp.profession_id),
              company_id: emp.company_id ? parseInt(emp.company_id) : null,
              is_current: emp.is_current || false
            };
            await fetch('http://localhost:8000/api/v1/professions/profile/employment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }
        }
}

      const currentRes = await fetch(`http://localhost:8000/api/v1/connections/${id}`);
      const currentConnections = await currentRes.json();

      // Находим связи, которые нужно удалить (которые есть в current, но нет в form)
      const toDelete = currentConnections.filter(
        c => !connections.some(f => f.profile_id === (c.connected_profile_id || c.connected_profile?.id))
      );

      // Удаляем только лишние
      for (const conn of toDelete) {
        const connectedId = conn.connected_profile_id || conn.connected_profile?.id;
        await fetch(`http://localhost:8000/api/v1/connections/${id}/${connectedId}`, { method: 'DELETE' });
      }

      // Находим связи, которые нужно добавить (есть в form, но нет в current)
      const toAdd = connections.filter(
        f => !currentConnections.some(c => (c.connected_profile_id || c.connected_profile?.id) === f.profile_id)
      );

      // Добавляем новые
      for (const conn of toAdd) {
        const payload = {
          profile_id: parseInt(id),
          connected_profile_id: parseInt(conn.profile_id),
          relation_type: conn.relation_type
        };
        const response = await fetch('http://localhost:8000/api/v1/connections/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Ошибка при добавлении связи');
        }
      }


      await loadAllData();
      setModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
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
      await loadAllData();
    }
  };

  const handleVideoUpload = async (e) => {
    if (e.target.files.length) {
      const formData = new FormData();
      Array.from(e.target.files).forEach(f => formData.append('files', f));
      formData.append('profile_id', id);
      try {
        await fetch('http://localhost:8000/api/v1/videos/multiple/', {
          method: 'POST',
          body: formData,
        });
        await loadAllData();
      } catch (error) {
        console.error('Error uploading videos:', error);
        alert('Ошибка загрузки видео');
      }
    }
  };

  const fullName = profile ? [profile.last_name, profile.first_name, profile.middle_name].filter(Boolean).join(' ') || 'Без имени' : '';
  const avatarPhoto = profile?.photos?.find(p => p.is_avatar) || profile?.photos?.[0];
  const avatarIndex = photos.findIndex(p => p.id === avatarPhoto?.id);
  const hairColor = profile?.hair_color;
  const location = profile?.current_location;
  const fullLocation = location ? [location.name, location.region?.name, location.region?.country?.name].filter(Boolean).join(', ') : '';

  const formatBirthDate = () => {
    if (!profile) return '';
    const { birth_year, birth_month, birth_day } = profile;
    if (birth_year && birth_month && birth_day) return `${birth_year}.${String(birth_month).padStart(2, '0')}.${String(birth_day).padStart(2, '0')}`;
    if (birth_year && birth_month) return `${birth_year}.${String(birth_month).padStart(2, '0')}`;
    if (birth_year) return `${birth_year}`;
    return '';
  };

  const getHairColorStyle = () => {
    if (!hairColor) return { backgroundColor: '#333' };
    const colorMap = {
      'блондинка': '#F5D7B3',
      'брюнетка': '#3C2415',
      'шатенка': '#8B5A2B',
      'рыжая': '#D4561E',
      'черный': '#1A1A1A',
      'blonde': '#F5D7B3',
      'brunette': '#3C2415',
      'red': '#D4561E',
      'black': '#1A1A1A',
    };
    return { backgroundColor: colorMap[hairColor.toLowerCase()] || hairColor };
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

  const seasonIcons = {
    'зима': <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20M4.5 4.5l15 15M19.5 4.5l-15 15"/></svg>,
    'весна': <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.5 4.5l3 3M16.5 16.5l3 3M4.5 19.5l3-3M16.5 7.5l3-3"/><circle cx="12" cy="12" r="3"/></svg>,
    'лето': <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M1 12h2M21 12h2M4.5 4.5l1.5 1.5M18 18l1.5 1.5M4.5 19.5l1.5-1.5M18 6l1.5-1.5"/></svg>,
    'осень': <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><path d="M12 12c-2 0-4-2-4-4s2-4 4-4 4 2 4 4-2 4-4 4z"/><path d="M12 12c-2 0-4 2-4 4s2 4 4 4 4-2 4-4-2-4-4-4z"/></svg>,
  };

  const daytimeIcons = {
    'утро': <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="5"/><path d="M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>,
    'день': <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="6"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>,
    'вечер': <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10c2 0 3.8-0.6 5.3-1.6C14.5 19.4 13 16.4 13 13c0-3.4 1.5-6.4 4.3-8.4C15.8 2.6 14 2 12 2z"/></svg>,
    'ночь': <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>,
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="flex justify-between items-center px-5 py-3">
          <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-white transition">← НАЗАД</button>
          <h1 className="text-sm font-light tracking-wider text-white">GRAPHSOCIAL</h1>
          <div className="w-16"></div> {/* Пустой блок для баланса */}
        </div>
      </header>

      <main>
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="border-b border-gray-800 p-6">
            <div className="flex gap-6">
              <div
                className="w-48 h-48 rounded-full overflow-hidden cursor-pointer bg-gray-900 flex-shrink-0 border border-gray-700"
                onClick={() => photos.length > 0 && openSlideshow(photos, avatarIndex >= 0 ? avatarIndex : 0, false)}
              >
                {avatarPhoto ? (
                  <img src={`http://localhost:8000${avatarPhoto.url}`} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-light text-gray-600">{fullName.slice(0, 2).toUpperCase()}</div>
                )}
              </div>

              <div className="flex-1">
                {/* Строка с именем и кнопками */}
                <div className="flex justify-between items-start">
                  <h1 className="text-2xl font-bold mb-2">{fullName}</h1>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setModalOpen(true)}
                      className="text-s px-3 py-1.5 border border-white rounded text-white hover:bg-white hover:text-black transition"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={async () => { if (confirm('Вы уверены?')) { await profileApi.delete(id); navigate('/'); } }}
                      className="text-s px-3 py-1.5 border border-red-500 rounded text-red-500 hover:bg-red-500 hover:text-white transition"
                    >
                      Удалить
                    </button>
                  </div>
                </div>

                {/* Информация о профиле (увеличенный кегль) */}
                <div className="text-sm text-gray-500 space-y-0">
                  {/* Пол с иконкой */}
                  <div className="flex items-center gap-1 space-y-0">
                    {profile.sex === 'male' ? <MaleIcon /> : <FemaleIcon />}
                    <span>{profile.sex === 'male' ? 'Мужской' : 'Женский'}</span>
                  </div>
                  
                  {/* Дата рождения */}
                  {formatBirthDate() && (
                    <div className="flex items-center gap-1 space-y-0">
                      <div className="w-4 flex-shrink-0">
                        <CalendarIcon />
                      </div>
                      <span>{formatBirthDate()}</span>
                    </div>
                  )}
                  
                  {/* Локация */}
                  {fullLocation && (
                    <div className="flex items-center gap-1 space-y-0">
                      <div className="w-4 flex-shrink-0">
                        <LocationIcon />
                      </div>
                      <span className="truncate">{fullLocation}</span>
                    </div>
                  )}
                  
                  {/* Email */}
                  {profile.email && (
                    <div className="flex items-center gap-1 space-y-0">
                      <div className="w-4 flex-shrink-0">
                        <EmailIcon />
                      </div>
                      <span>{profile.email}</span>
                    </div>
                  )}
                  
                  {/* Телефон */}
                  {profile.phone && (
                    <div className="flex items-center gap-1 space-y-0">
                      <div className="w-4 flex-shrink-0">
                        <PhoneIcon />
                      </div>
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  
                  {/* Цвет волос */}
                  {hairColor && (
                    <div className="flex items-center gap-1 space-y-0">
                      <div className="w-4 flex-shrink-0">
                        <HairIcon />
                      </div>
                      <span>{hairColor}</span>
                    </div>
                  )}

{profile.employments && profile.employments.length > 0 && (
  <div className="mt-2">
    {(() => {
      const currentJob = profile.employments.find(job => job.is_current === true);
      const firstJob = profile.employments[0];
      const displayJob = currentJob || firstJob;
      const otherJobs = profile.employments.filter(job => 
        (currentJob ? job !== currentJob : job !== firstJob)
      );
      const hasOther = otherJobs.length > 0;
      
      return (
        <div className="text-sm text-gray-500">  {/* ← основной цвет контейнера */}
          {/* Отображаемая работа (текущая или первая) */}
          {displayJob && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-500">  {/* ← иконка наследует цвет */}
                <BriefcaseIcon />
              </span>
              <span className="text-gray-500">{displayJob.profession_name}</span>  {/* ← профессия */}
              {displayJob.company_name && (
                <>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-500">{displayJob.company_name}</span>  {/* ← компания */}
                </>
              )}
              {(displayJob.start_year || displayJob.end_year) && (
                <>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-500">
                    {displayJob.start_year && displayJob.end_year && `${displayJob.start_year} — ${displayJob.end_year}`}
                    {displayJob.start_year && !displayJob.end_year && displayJob.is_current && `${displayJob.start_year} — present`}
                    {displayJob.start_year && !displayJob.end_year && !displayJob.is_current && `${displayJob.start_year}`}
                    {!displayJob.start_year && displayJob.end_year && `until ${displayJob.end_year}`}
                  </span>
                </>
              )}
              {displayJob.is_current && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="inline-block">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12l3 3 6-6" />
                </svg>
              )}
            </div>
          )}
          
          {/* Остальные работы (скрыты) */}
          {hasOther && (
            <div className="mt-1">
              <button
                onClick={() => setShowAllJobs(!showAllJobs)}
                className="text-xs text-gray-500 hover:text-white transition flex items-center gap-1"
              >
                {showAllJobs ? '−' : '+'} {otherJobs.length} other position{otherJobs.length > 1 ? 's' : ''}
              </button>
              {showAllJobs && (
                <div className="mt-2 space-y-1 pl-4 border-l border-gray-700">
                  {otherJobs.map((job, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                      <span className="text-gray-500">{job.profession_name}</span>
                      {job.company_name && (
                        <>
                          <span className="text-gray-500">|</span>
                          <span className="text-gray-500">{job.company_name}</span>
                        </>
                      )}
                      {(job.start_year || job.end_year) && (
                        <>
                          <span className="text-gray-500">|</span>
                          <span className="text-gray-500">
                            {job.start_year && job.end_year && `${job.start_year} — ${job.end_year}`}
                            {job.start_year && !job.end_year && `${job.start_year}`}
                            {!job.start_year && job.end_year && `until ${job.end_year}`}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    })()}
  </div>
)}
                  
                  {/* Ссылки с иконками */}
                  {profile.links && profile.links.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {profile.links.map(link => (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gray-400 hover:text-blue-400 transition" title={link.platform?.name}>
                          {link.platform?.icon_url ? (
                            <img src={`http://localhost:8000${link.platform.icon_url}`} alt={link.platform.name} className="w-5 h-5 object-contain platform-icon" />
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>



                {/* Статистика */}
                <div className="flex gap-4 mt-3">
                  <div className="text-center"><div className="text-sm font-light">{photos.length}</div><div className="text-[10px] text-gray-600">PHOTOS</div></div>
                  <div className="text-center"><div className="text-sm font-light">{videos.length}</div><div className="text-[10px] text-gray-600">VIDEOS</div></div>
                  <div className="text-center"><div className="text-sm font-light">{tags.length}</div><div className="text-[10px] text-gray-600">TAGS</div></div>
                  <div className="text-center"><div className="text-sm font-light">{profile.links?.length || 0}</div><div className="text-[10px] text-gray-600">LINKS</div></div>
                </div>
              </div>
            </div>
          </div>


          {connections.length > 0 && (
            <div className="border-b border-gray-800 p-4">
              <h2 className="text-xs font-light tracking-wider text-gray-500 mb-3">CONNECTIONS</h2>
              <div className="flex gap-3 flex-wrap">
                {connections.map(conn => {
                  const connectedProfile = conn.connected_profile;
                  const profileId = connectedProfile?.id || conn.connected_profile_id;
                  if (!profileId) return null;
                  const profileName = connectedProfile 
                    ? [connectedProfile.first_name, connectedProfile.last_name].filter(Boolean).join(' ') 
                    : `ID ${profileId}`;
                  const photoUrl = connectedProfile?.photos?.[0]?.url 
                    ? `http://localhost:8000${connectedProfile.photos[0].url}` 
                    : null;
                  const initials = profileName.slice(0, 2).toUpperCase();
                  return (
                    <div key={profileId} className="text-center cursor-pointer hover:opacity-80" onClick={() => navigate(`/profile/${profileId}`)}>
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 mx-auto mb-1">
                        {photoUrl ? (
                          <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-500">
                            {initials}
                          </div>
                        )}
                      </div>
                      {/* Добавляем имя */}
                      <div className="text-[10px] text-white font-medium truncate max-w-[70px]">{profileName}</div>
                      {/* Тип связи на русском */}
                      <div className="text-[9px] text-gray-400">
                        {conn.relation_type === 'friend' ? 'Друг' : 
                        conn.relation_type === 'mother' ? 'Мать' : 
                        conn.relation_type === 'father' ? 'Отец' : 
                        conn.relation_type === 'brother' ? 'Брат' : 
                        conn.relation_type === 'sister' ? 'Сестра' : 
                        conn.relation_type === 'daughter' ? 'Дочь' : 
                        conn.relation_type === 'son' ? 'Сын' : conn.relation_type}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Стильные плавающие кнопки для фото и видео */}
          <div className="fixed bottom-6 right-6 z-20 flex flex-col gap-3">
            {/* Кнопка добавления фото */}
            <label className="group relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/30 cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl flex items-center justify-center">
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <CameraIcon />
              <span className="absolute -top-8 right-0 whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Add Photos
              </span>
            </label>

            {/* Кнопка добавления видео */}
            <label className="group relative w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-red-600 shadow-lg shadow-red-500/30 cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl flex items-center justify-center">
              <input type="file" multiple accept="video/*" onChange={handleVideoUpload} className="hidden" />
              <VideoIcon />
              <span className="absolute -top-8 right-0 whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Add Videos
              </span>
            </label>
          </div>

          {/* Tabs - прижаты к центру */}
          <div className="flex justify-center gap-8 border-b border-gray-800">
            <button
              className={`py-3 px-4 flex items-center justify-center gap-2 transition ${activeTab === 'photos' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}
              onClick={() => setActiveTab('photos')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="2.18" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M22 13l-6-6-4 4-4-4-6 6" />
              </svg>
            </button>
            <button
              className={`py-3 px-4 flex items-center justify-center gap-2 transition ${activeTab === 'videos' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}
              onClick={() => setActiveTab('videos')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <polygon points="10 8 16 12 10 16" />
              </svg>
            </button>
            <button
              className={`py-3 px-4 flex items-center justify-center gap-2 transition ${activeTab === 'tags' ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}
              onClick={() => setActiveTab('tags')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <path d="M9 4l1-3h4l1 3" />
              </svg>
            </button>
          </div>

          {/* Photos Gallery */}
          {activeTab === 'photos' && (
            <div className="p-4">
              {photos.length > 0 ? (
                <div className="columns-2 md:columns-3 gap-0.5 space-y-0.5">
                  {photos.map((photo, idx) => (
                    <div key={photo.id} className="relative group break-inside-avoid">
                      <div className="cursor-pointer" onClick={() => openSlideshow(photos, idx, false)}>
                        <img src={`http://localhost:8000${photo.url}`} alt="Фото" className="w-full h-auto object-cover" />
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm('Удалить это фото?')) {
                            try {
                              await photoApi.delete(photo.id);
                              await loadAllData();
                            } catch (error) {
                              console.error('Error deleting photo:', error);
                              alert('Ошибка удаления фото');
                            }
                          }
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white hover:bg-red-500 transition rounded
                        opacity-0 group-hover:opacity-100 transition"
                        title="Delete photo"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setAsAvatar(photo.id)}
                        className={`absolute top-2 left-2 p-1.5 rounded transition ${photo.is_avatar ? 'bg-yellow-500 text-black' : 'bg-black/60 text-white hover:bg-yellow-500 hover:text-black opacity-0 group-hover:opacity-100 transition'}`}
                        title={photo.is_avatar ? "Current avatar" : "Set as avatar"}
                      >
                        <StarIcon filled={photo.is_avatar} />
                      </button>
                      {photo.is_avatar && (
                        <div className="absolute bottom-2 left-2 bg-yellow-500 text-black text-[8px] px-1.5 py-0.5 rounded font-medium">
                          AVATAR
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                        <div className="flex flex-wrap gap-2 text-[10px] text-gray-300 items-center">
                          {photo.season && (
                            <div className="flex items-center gap-1" title={photo.season.name}>
                              {seasonIcons[photo.season.name.toLowerCase()] || <SeasonIcon />}
                            </div>
                          )}
                          {photo.daytime && (
                            <div className="flex items-center gap-1" title={photo.daytime.name}>
                              {daytimeIcons[photo.daytime.name.toLowerCase()] || <DaytimeIcon />}
                            </div>
                          )}
                          {photo.event && (
                            <div className="flex items-center gap-1">
                              <EventIcon />
                              <span>{photo.event.name}</span>
                            </div>
                          )}
                        </div>
                        {photo.clothes && photo.clothes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-gray-300">
                            {photo.clothes.map(c => (
                              <span key={c.id} className="bg-white/10 px-1.5 py-0.5 rounded leading-tight">#{c.name.replace(/\s/g, '')}</span>
                            ))}
                          </div>
                        )}
                        {photo.place && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-300 cursor-pointer hover:text-blue-400 transition"
                              onClick={() => navigate(`/place/${photo.place.id}/photos`)}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2c-3.5 0-6 2.5-6 6 0 4 3 7 6 7s6-3 6-7c0-3.5-2.5-6-6-6z" />
                              <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                            </svg>
                            <span>{photo.place.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600 text-sm">Нет фотографий</div>
              )}
            </div>
          )}

          {/* Videos Gallery - единый стиль с фото */}
          {activeTab === 'videos' && (
            <div className="p-4">
              {videos.length > 0 ? (
                <div className="columns-2 md:columns-3 gap-0.5 space-y-0.5">
                  {videos.map((video, idx) => (
                    <div 
                      key={video.id} 
                      className="relative group break-inside-avoid cursor-pointer" 
                      onClick={() => openSlideshow(videos, idx, true)}
                      onMouseEnter={() => setHoverVideo(prev => ({ ...prev, [idx]: true }))}
                      onMouseLeave={() => setHoverVideo(prev => ({ ...prev, [idx]: false }))}
                    >
                      <video 
                        src={`http://localhost:8000${video.url}`} 
                        className="w-full h-auto object-cover"
                        muted
                        loop
                        playsInline
                        autoPlay={hoverVideo[idx]}
                      />
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm('Удалить это видео?')) {
                            try {
                              await fetch(`http://localhost:8000/api/v1/videos/${video.id}`, { method: 'DELETE' });
                              await loadAllData();
                            } catch (error) {
                              console.error('Error deleting video:', error);
                              alert('Ошибка удаления видео');
                            }
                          }
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white hover:bg-red-500 transition rounded opacity-0 group-hover:opacity-100 transition"
                        title="Delete video"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                        <div className="text-[10px] text-gray-300">🎬 {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600 text-sm">Нет видео</div>
              )}
            </div>
          )}

          {/* Tagged Photos Gallery - единый стиль */}
          {activeTab === 'tags' && (
            <div className="p-4">
              {tags.length > 0 ? (
                <div className="columns-2 md:columns-3 gap-0.5 space-y-0.5">
                  {(() => {
                    const uniqueTaggedPhotos = [];
                    const seenIds = new Set();
                    tags.forEach(t => {
                      if (t.photo_url && !seenIds.has(t.photo_id)) {
                        seenIds.add(t.photo_id);
                        uniqueTaggedPhotos.push({
                          id: t.photo_id,
                          url: t.photo_url,
                          title: t.photo?.title || ''
                        });
                      }
                    });
                    return tags.map((tag) => {
                      const currentIndex = uniqueTaggedPhotos.findIndex(p => p.id === tag.photo_id);
                      return (
                        <div 
                          key={tag.id} 
                          className="relative group break-inside-avoid cursor-pointer" 
                          onClick={() => openSlideshow(uniqueTaggedPhotos, currentIndex, false)}
                        >
                          {tag.photo_url ? (
                            <img 
                              src={`http://localhost:8000${tag.photo_url}`} 
                              alt="Tagged" 
                              className="w-full h-auto object-cover" 
                            />
                          ) : (
                            <div className="w-full aspect-square bg-gray-800 flex items-center justify-center text-gray-600 text-xs">
                              NO IMAGE
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <div className="flex items-center gap-2 text-[10px] text-gray-300">
                              <div 
                                className="w-5 h-5 rounded-full overflow-hidden bg-gray-700 cursor-pointer hover:opacity-80"
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  navigate(`/profile/${tag.profile_id}`);
                                }}
                              >
                                {tag.profile?.photos?.[0] ? (
                                  <img 
                                    src={`http://localhost:8000${tag.profile.photos[0].url}`} 
                                    alt="" 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[8px]">
                                    {tag.profile?.first_name?.[0]}
                                  </div>
                                )}
                              </div>
                              <span>Tagged by {tag.profile?.first_name}</span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600 text-sm">Нет отметок</div>
              )}
            </div>
          )}
        </div>
      </main>

      <ProfileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleUpdateProfile}
        profile={profile}
        locations={locations}
        platforms={platforms}
        professions={professions}
        companies={companies}
        connections={profile?.connections || []}
      />

      <SlideshowModal
        isOpen={slideshowOpen}
        onClose={handleSlideshowClose}
        onUpdate={loadAllData}
        photos={currentMedia}
        profile={profile}
        startIndex={currentIndex}
        isVideo={isVideoSlideshow}
      />
    </div>
  );
};

export default ProfilePage;