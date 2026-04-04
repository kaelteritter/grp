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
    <path d="M12 2c-3.5 0-6 2.5-6 6 0 4 3 7 6 7s6-3 6-7c0-3.5-2.5-6-6-6z" />
    <path d="M12 15v5" />
    <path d="M9 20h6" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
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

  useEffect(() => {
    loadAllData();
  }, [id]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [profileRes, photosRes, videosRes, tagsRes, locationsRes, platformsRes, professionsRes, companiesRes, connectionsRes] = await Promise.all([
        profileApi.get(id),
        photoApi.getByProfile(id),
        fetch(`http://localhost:8000/api/v1/videos/?profile_id=${id}`).then(r => r.json()),
        fetch(`http://localhost:8000/api/v1/photo-tags/?profile_id=${id}`).then(r => r.json()),
        fetch('http://localhost:8000/api/v1/locations/').then(r => r.json()),
        fetch('http://localhost:8000/api/v1/platforms/').then(r => r.json()),
        fetch('http://localhost:8000/api/v1/professions/').then(r => r.json()),
        fetch('http://localhost:8000/api/v1/companies/').then(r => r.json()),
        fetch(`http://localhost:8000/api/v1/connections/${id}`).then(r => r.json()),
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

  const handleUpdateProfile = async (profileData, linksData, photos, videos, professionId, companyId, connections) => {
    try {
      await profileApi.update(id, profileData);
      
      for (const link of linksData) {
        if (link.url && link.platform_id) {
          await fetch('http://localhost:8000/api/v1/links/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...link, profile_id: parseInt(id) })
          });
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
      
      if (professionId) {
        await fetch('http://localhost:8000/api/v1/professions/profile/employment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile_id: parseInt(id),
            profession_id: parseInt(professionId),
            company_id: companyId ? parseInt(companyId) : null,
            is_current: true
          })
        });
      }
      
      for (const conn of connections) {
        if (conn.profile_id && conn.relation_type) {
          await fetch('http://localhost:8000/api/v1/connections/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profile_id: parseInt(id),
              connected_profile_id: parseInt(conn.profile_id),
              relation_type: conn.relation_type
            })
          });
        }
      }
      
      await loadAllData();
      setModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const fullName = profile ? [profile.last_name, profile.first_name, profile.middle_name].filter(Boolean).join(' ') || 'Без имени' : '';
  const avatarPhoto = photos.find(p => p.is_avatar) || photos[0];
  const profession = profile?.professions?.[0];
  const hairColor = profile?.hair_color;
  
  const getHairColorStyle = () => {
    if (!hairColor) return { backgroundColor: '#333' };
    const colorMap = {
      'блондин': '#F5D7B3',
      'брюнет': '#3C2415',
      'шатен': '#8B5A2B',
      'рыжий': '#D4561E',
      'черный': '#1A1A1A',
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

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="flex justify-between items-center px-5 py-3">
          <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-white transition">← НАЗАД</button>
          <h1 className="text-sm font-light tracking-wider text-white">GRAPHSOCIAL</h1>
          <div className="flex gap-2">
            <button onClick={() => setModalOpen(true)} className="p-1.5 text-gray-400 hover:text-white transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3l4 4-7 7H10v-4l7-7z"/><path d="M4 20h16"/></svg>
            </button>
            <button onClick={async () => { if (confirm('Вы уверены?')) { await profileApi.delete(id); navigate('/'); } }} className="p-1.5 text-gray-400 hover:text-red-500 transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13"/><path d="M9 4h6"/></svg>
            </button>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="border-b border-gray-800 p-6">
            <div className="flex gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden cursor-pointer bg-gray-900 flex-shrink-0" onClick={() => photos.length > 0 && openSlideshow(photos, 0, false)}>
                {avatarPhoto ? (
                  <img src={`http://localhost:8000${avatarPhoto.url}`} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-light text-gray-600">{fullName.slice(0, 2).toUpperCase()}</div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-xl font-light mb-2">{fullName}</h1>
                
                {/* Отдельные строки с SVG иконками */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-2">
                    {profile.sex === 'male' ? '♂ Male' : '♀ Female'}
                  </div>
                  
                  {profile.email && (
                    <div className="flex items-center gap-2">
                      <EmailIcon />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  
                  {profile.phone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  
                  {hairColor && (
                    <div className="flex items-center gap-2">
                      <HairIcon />
                      <span className="inline-block w-3 h-3 rounded-full" style={getHairColorStyle()} />
                      <span>{hairColor}</span>
                    </div>
                  )}
                  
                  {profession && (
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon />
                      <span>{profession.name}{profession.company_name ? ` @ ${profession.company_name}` : ''}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4 mt-3">
                  <div className="text-center"><div className="text-sm font-light">{photos.length}</div><div className="text-[10px] text-gray-600">PHOTOS</div></div>
                  <div className="text-center"><div className="text-sm font-light">{videos.length}</div><div className="text-[10px] text-gray-600">VIDEOS</div></div>
                  <div className="text-center"><div className="text-sm font-light">{tags.length}</div><div className="text-[10px] text-gray-600">TAGS</div></div>
                  <div className="text-center"><div className="text-sm font-light">{profile.links?.length || 0}</div><div className="text-[10px] text-gray-600">LINKS</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Connections Section - Avatar chips */}
          {connections.length > 0 && (
            <div className="border-b border-gray-800 p-4">
              <h2 className="text-xs font-light tracking-wider text-gray-500 mb-3">CONNECTIONS</h2>
              <div className="flex gap-3 flex-wrap">
                {connections.map(conn => (
                  <div key={conn.connected_profile.id} className="text-center cursor-pointer hover:opacity-80" onClick={() => navigate(`/profile/${conn.connected_profile.id}`)}>
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 mx-auto mb-1">
                      {conn.connected_profile.photos?.[0] ? (
                        <img src={`http://localhost:8000${conn.connected_profile.photos[0].url}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">{conn.connected_profile.first_name?.[0]}{conn.connected_profile.last_name?.[0]}</div>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400">{conn.relation_type}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button className={`px-6 py-3 text-xs ${activeTab === 'photos' ? 'text-white border-b border-white' : 'text-gray-500'}`} onClick={() => setActiveTab('photos')}>PHOTOS</button>
            <button className={`px-6 py-3 text-xs ${activeTab === 'videos' ? 'text-white border-b border-white' : 'text-gray-500'}`} onClick={() => setActiveTab('videos')}>VIDEOS</button>
            <button className={`px-6 py-3 text-xs ${activeTab === 'tags' ? 'text-white border-b border-white' : 'text-gray-500'}`} onClick={() => setActiveTab('tags')}>TAGGED</button>
          </div>

          {/* Photos Gallery */}
          {activeTab === 'photos' && (
            <div className="p-4">
              {photos.length > 0 ? (
                <div className="columns-2 md:columns-3 gap-2 space-y-2">
                  {photos.map((photo, idx) => (
                    <div key={photo.id} className="relative group break-inside-avoid cursor-pointer" onClick={() => openSlideshow(photos, idx, false)}>
                      <img src={`http://localhost:8000${photo.url}`} alt="Фото" className="w-full h-auto object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition">
                        <div className="flex gap-2 text-[10px] text-gray-300">
                          {photo.season && <span>🌸 {photo.season.name}</span>}
                          {photo.daytime && <span>☀️ {photo.daytime.name}</span>}
                          {photo.event && <span>🎉 {photo.event.name}</span>}
                          {photo.clothes?.length > 0 && <span>👕 {photo.clothes.length}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600 text-sm">Нет фотографий</div>
              )}
            </div>
          )}

          {/* Videos Gallery - with hover autoplay */}
          {activeTab === 'videos' && (
            <div className="p-4">
              {videos.length > 0 ? (
                <div className="columns-2 md:columns-3 gap-2 space-y-2">
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

          {/* Tagged Photos Gallery */}
          {activeTab === 'tags' && (
            <div className="p-4">
              {tags.length > 0 ? (
                <div className="columns-2 md:columns-3 gap-2 space-y-2">
                  {tags.map((tag) => (
                    <div key={tag.id} className="relative group break-inside-avoid cursor-pointer" onClick={() => openSlideshow([tag.photo], 0, false)}>
                      {tag.photo?.url ? (
                        <img src={`http://localhost:8000${tag.photo.url}`} alt="Tagged" className="w-full h-auto object-cover" />
                      ) : (
                        <div className="w-full aspect-square bg-gray-800 flex items-center justify-center text-gray-600 text-xs">NO IMAGE</div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <div className="flex items-center gap-2 text-[10px] text-gray-300">
                          <div 
                            className="w-5 h-5 rounded-full overflow-hidden bg-gray-700 cursor-pointer hover:opacity-80"
                            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${tag.profile_id}`); }}
                          >
                            {tag.profile?.photos?.[0] ? (
                              <img src={`http://localhost:8000${tag.profile.photos[0].url}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px]">{tag.profile?.first_name?.[0]}</div>
                            )}
                          </div>
                          <span>Tagged by {tag.profile?.first_name} at ({tag.x}, {tag.y})</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
      />

      <SlideshowModal
        isOpen={slideshowOpen}
        onClose={() => setSlideshowOpen(false)}
        photos={currentMedia}
        profile={profile}
        startIndex={currentIndex}
        isVideo={isVideoSlideshow}
      />
    </div>
  );
};

export default ProfilePage;