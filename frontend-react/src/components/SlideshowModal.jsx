import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AddressSearch from './AddressSearch';
import MultiClothSearch from './MultiClothSearch';
import PlaceSearch from './PlaceSearch'

// SVG иконки
const SeasonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v4M12 22v-4M2 12h4M22 12h-4" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

const DaytimeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const EventIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="12" cy="15" r="1" />
    <circle cx="16" cy="15" r="1" />
    <circle cx="8" cy="15" r="1" />
  </svg>
);

const ClothesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a4 4 0 0 0-4 4c0 2 2 4 4 4s4-2 4-4a4 4 0 0 0-4-4z" />
    <path d="M8 12h8l2 8H6l2-8z" />
  </svg>
);

const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 3l4 4-7 7H10v-4l7-7z" />
    <path d="M4 20h16" />
  </svg>
);

const SlideshowModal = ({ isOpen, onClose, photos, profile, startIndex = 0, isVideo = false, onUpdate, isGlobal = false }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [tags, setTags] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [daytimes, setDaytimes] = useState([]);
  const [events, setEvents] = useState([]);
  const [clothes, setClothes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedDaytime, setSelectedDaytime] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedClothes, setSelectedClothes] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [showSeasonSelect, setShowSeasonSelect] = useState(false);
  const [showDaytimeSelect, setShowDaytimeSelect] = useState(false);
  const [showEventSelect, setShowEventSelect] = useState(false);
  const [showClothSelect, setShowClothSelect] = useState(false);
  const [hoverVideo, setHoverVideo] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState('');
  const [showPlaceSelect, setShowPlaceSelect] = useState(false);
  const [selectedPlaceObj, setSelectedPlaceObj] = useState(null);
  
  // Состояния для тегов
  const [isTaggingMode, setIsTaggingMode] = useState(false);
  const [tempTagPosition, setTempTagPosition] = useState({ x: 0.5, y: 0.5 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const imageRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const safePhotos = photos && Array.isArray(photos) ? photos : [];

  const [selectedAddress, setSelectedAddress] = useState('');
  const [showAddressSelect, setShowAddressSelect] = useState(false);
  const [selectedAddressObj, setSelectedAddressObj] = useState(null);


  // Загрузка справочников
  useEffect(() => {
    if (isOpen) loadReferenceData();
  }, [isOpen]);

  const loadReferenceData = async () => {
    try {
      const [seasonsRes, daytimesRes, eventsRes, clothesRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/seasons/').then(r => r.json()),
        fetch('http://localhost:8000/api/v1/daytimes/').then(r => r.json()),
        fetch('http://localhost:8000/api/v1/events/').then(r => r.json()),
        fetch('http://localhost:8000/api/v1/clothes/').then(r => r.json()),
      ]);
      setSeasons(seasonsRes);
      setDaytimes(daytimesRes);
      setEvents(eventsRes);
      setClothes(clothesRes);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  useEffect(() => {
    if (isOpen && safePhotos.length > 0) {
      setCurrentIndex(Math.min(startIndex, safePhotos.length - 1));
    }
  }, [isOpen, startIndex, safePhotos.length]);

  const loadTags = async () => {
    if (!safePhotos[currentIndex]?.id) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/photo-tags/?photo_id=${safePhotos[currentIndex].id}`);
      const data = await res.json();
      setTags(data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const loadPhotoAttributes = async () => {
    if (!safePhotos[currentIndex]?.id) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/photos/${safePhotos[currentIndex].id}`);
      const photo = await res.json();
      setSelectedSeason(photo.season_id || '');
      setSelectedDaytime(photo.daytime_id || '');
      setSelectedEvent(photo.event_id || '');
      // Извлекаем ID одежды из массива clothes (если есть)
      setSelectedClothes(photo.clothes ? photo.clothes.map(c => c.id) : []);
      setSelectedAddress(photo.address_id || '');
      if (photo.place) {
        setSelectedPlace(photo.place.id);
        setSelectedPlaceObj(photo.place);
      } else {
        setSelectedPlace('');
        setSelectedPlaceObj(null);
      }
    } catch (error) {
      console.error('Error loading photo attributes:', error);
    }
  };

useEffect(() => {
  const currentPhotoId = safePhotos[currentIndex]?.id;
  if (currentPhotoId) {
    loadTags();
    loadPhotoAttributes();
  } else {
    // Очищаем теги и атрибуты, если фото без id (заглушка)
    setTags([]);
    setSelectedSeason('');
    setSelectedDaytime('');
    setSelectedEvent('');
    setSelectedClothes([]);
  }
}, [currentIndex, safePhotos]);

  // Поиск профилей
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/profiles/?search=${encodeURIComponent(searchQuery)}&limit=10`);
        const data = await res.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchQuery]);

  const handleImageClick = (e) => {
    if (!isTaggingMode) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTempTagPosition({ x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) });
  };

  const handleSaveTag = async () => {
    if (!selectedProfile) {
      alert('Выберите профиль');
      return;
    }
    try {
      await fetch('http://localhost:8000/api/v1/photo-tags/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo_id: safePhotos[currentIndex].id,
          profile_id: selectedProfile.id,
          x: tempTagPosition.x,
          y: tempTagPosition.y,
        }),
      });
      setIsTaggingMode(false);
      setSelectedProfile(null);
      setSearchQuery('');
      setTempTagPosition({ x: 0.5, y: 0.5 });
      await loadTags();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving tag:', error);
      alert('Ошибка сохранения тега');
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!confirm('Удалить этот тег?')) return;
    try {
      await fetch(`http://localhost:8000/api/v1/photo-tags/${tagId}`, { method: 'DELETE' });
      await loadTags();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert('Ошибка удаления тега');
    }
  };

  const startEditTag = (tag) => {
    setEditingTag(tag);
    setTempTagPosition({ x: tag.x, y: tag.y });
    setIsTaggingMode(true);
    setSelectedProfile(tag.profile);
    setSearchQuery(`${tag.profile.first_name} ${tag.profile.last_name}`);
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;
    try {
      await fetch(`http://localhost:8000/api/v1/photo-tags/${editingTag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: tempTagPosition.x, y: tempTagPosition.y }),
      });
      setIsTaggingMode(false);
      setEditingTag(null);
      setSelectedProfile(null);
      setSearchQuery('');
      await loadTags();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating tag:', error);
      alert('Ошибка обновления тега');
    }
  };

  const cancelTagging = () => {
    setIsTaggingMode(false);
    setEditingTag(null);
    setSelectedProfile(null);
    setSearchQuery('');
    setTempTagPosition({ x: 0.5, y: 0.5 });
  };

  const handleUpdateAttribute = async (field, value) => {
    if (!safePhotos[currentIndex]?.id) return;
    setUpdating(true);
    try {
      await fetch(`http://localhost:8000/api/v1/photos/${safePhotos[currentIndex].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value || null }),
      });
      if (field === 'season_id') setSelectedSeason(value);
      if (field === 'daytime_id') setSelectedDaytime(value);
      if (field === 'event_id') setSelectedEvent(value);
      if (field === 'place_id') {
        setSelectedPlace(value);
        if (value) {
          fetch(`http://localhost:8000/api/v1/places/${value}`)
            .then(r => r.json())
            .then(place => setSelectedPlaceObj(place))
            .catch(console.error);
        } else {
          setSelectedPlaceObj(null);
        }
      }
      if (onUpdate) onUpdate();
      setShowSeasonSelect(false);
      setShowDaytimeSelect(false);
      setShowEventSelect(false);
    } catch (error) {
      console.error('Error updating attribute:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateClothes = async (clothIds) => {
    if (!safePhotos[currentIndex]?.id) return;
    setUpdating(true);
    try {
      await fetch(`http://localhost:8000/api/v1/photos/${safePhotos[currentIndex].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloth_ids: clothIds }),
      });
      setSelectedClothes(clothIds);
      await loadPhotoAttributes();
      if (onUpdate) onUpdate();
      setShowClothSelect(false);
    } catch (error) {
      console.error('Error updating clothes:', error);
    } finally {
      setUpdating(false);
    }
  };

  const prevPhoto = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const nextPhoto = () => {
    if (currentIndex < safePhotos.length - 1) setCurrentIndex(currentIndex + 1);
  };

  useEffect(() => {
    if (!isOpen || safePhotos.length === 0) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, safePhotos.length]);

  const currentPhoto = safePhotos[currentIndex];
  
  // ВЫЧИСЛЯЕМ ТЕКУЩИЙ ПРОФИЛЬ ДЛЯ БОКОВОЙ ПАНЕЛИ
  const currentProfile = isGlobal ? currentPhoto?.profile : profile;
  const currentProfileFullName = currentProfile
    ? [currentProfile.last_name, currentProfile.first_name, currentProfile.middle_name].filter(Boolean).join(' ') || 'Без имени'
    : 'Без имени';
  const currentProfileAvatar = currentProfile?.photos?.[0]?.url
    ? `http://localhost:8000${currentProfile.photos[0].url}`
    : null;

  if (!isOpen || safePhotos.length === 0 || !currentPhoto) return null;

  const selectedSeasonObj = seasons.find(s => s.id == selectedSeason);
  const selectedDaytimeObj = daytimes.find(d => d.id == selectedDaytime);
  const selectedEventObj = events.find(e => e.id == selectedEvent);

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative w-full h-screen">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/5 text-white hover:bg-white/10 rounded-full">✕</button>
        <button onClick={prevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/5 text-white hover:bg-white/10 rounded-full">❮</button>
        <button onClick={nextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/5 text-white hover:bg-white/10 rounded-full">❯</button>

        <div className="w-full h-full flex items-center justify-center">
          {isVideo ? (
            <video
              src={`http://localhost:8000${currentPhoto.url}`}
              className="max-w-full max-h-screen object-contain"
              controls
              onMouseEnter={() => setHoverVideo(true)}
              onMouseLeave={() => setHoverVideo(false)}
              autoPlay={hoverVideo}
              loop
              muted
            />
          ) : (
            <div className="relative" ref={imageRef} onClick={handleImageClick}>
              <img src={`http://localhost:8000${currentPhoto.url}`} alt="Фото" className="max-w-full max-h-screen object-contain" />
              {tags.map(tag => (
                <div
                  key={tag.id}
                  className="absolute w-6 h-6 bg-yellow-400 rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-transform flex items-center justify-center text-xs font-bold text-black"
                  style={{ left: `${tag.x * 100}%`, top: `${tag.y * 100}%`, transform: 'translate(-50%, -50%)' }}
                  title={`${tag.profile?.first_name} ${tag.profile?.last_name}`}
                  onClick={() => navigate(`/profile/${tag.profile_id}`)}
                >
                  {tag.profile?.photos?.[0] ? (
                    <img src={`http://localhost:8000${tag.profile.photos[0].url}`} className="w-full h-full rounded-full object-cover" alt="" />
                  ) : (
                    <span>{(tag.profile?.first_name?.[0] || '') + (tag.profile?.last_name?.[0] || '')}</span>
                  )}
                </div>
              ))}
              {isTaggingMode && (
                <div
                  className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white animate-pulse"
                  style={{ left: `${tempTagPosition.x * 100}%`, top: `${tempTagPosition.y * 100}%`, transform: 'translate(-50%, -50%)' }}
                />
              )}
            </div>
          )}
        </div>

        {/* Правая панель – ИСПРАВЛЕНО: используем currentProfile */}
        <div className="absolute right-0 top-0 h-full w-80 bg-black/80 backdrop-blur p-4 border-l border-gray-800 overflow-y-auto">
          {/* Информация о профиле (аватарка и имя) */}
          <div
            className="text-center cursor-pointer hover:opacity-80 transition mb-6"
            onClick={() => {
              onClose();
              if (currentProfile) navigate(`/profile/${currentProfile.id}`);
            }}
          >
            <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden bg-gray-800">
              {currentProfileAvatar ? (
                <img src={currentProfileAvatar} alt={currentProfileFullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">
                  {currentProfileFullName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="text-sm font-light">{currentProfileFullName}</div>
          </div>

          {/* Теги */}
          {tags.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs text-gray-500 mb-2">TAGGED PEOPLE</h3>
              <div className="space-y-2">
                {tags.map(tag => (
                  <div key={tag.id} className="flex items-center gap-2 text-xs hover:bg-gray-800 p-2 rounded group">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 cursor-pointer" onClick={() => navigate(`/profile/${tag.profile_id}`)}>
                      {tag.profile?.photos?.[0] ? (
                        <img src={`http://localhost:8000${tag.profile.photos[0].url}`} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px]">{tag.profile?.first_name?.[0]}{tag.profile?.last_name?.[0]}</div>
                      )}
                    </div>
                    <div className="flex-1 cursor-pointer" onClick={() => navigate(`/profile/${tag.profile_id}`)}>
                      <div className="font-medium">{tag.profile?.first_name} {tag.profile?.last_name}</div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => startEditTag(tag)} className="text-gray-400 hover:text-white p-1" title="Edit position">
                        <EditIcon />
                      </button>
                      <button onClick={() => handleDeleteTag(tag.id)} className="text-gray-400 hover:text-red-500 p-1" title="Delete tag">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13"/><path d="M9 4h6"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Форма добавления/редактирования тега */}
          {!isTaggingMode ? (
            <button onClick={() => setIsTaggingMode(true)} className="w-full text-xs py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition mb-4 rounded">
              + ADD TAG
            </button>
          ) : (
            <div className="mb-4 p-3 bg-gray-900 rounded space-y-2">
              <div className="text-xs text-gray-300">Click on the photo to set position</div>
              <div className="text-[10px] text-gray-500">Position: ({tempTagPosition.x.toFixed(2)}, {tempTagPosition.y.toFixed(2)})</div>
              <input
                type="text"
                placeholder="Search profile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-xs"
              />
              {isSearching && <div className="text-[10px] text-gray-400">Searching...</div>}
              {searchResults.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {searchResults.map(p => (
                    <div
                      key={p.id}
                      className={`flex items-center gap-2 p-1 cursor-pointer hover:bg-gray-700 rounded ${selectedProfile?.id === p.id ? 'bg-blue-900' : ''}`}
                      onClick={() => setSelectedProfile(p)}
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-600">
                        {p.photos?.[0] ? (
                          <img src={`http://localhost:8000${p.photos[0].url}`} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px]">{p.first_name?.[0]}{p.last_name?.[0]}</div>
                        )}
                      </div>
                      <span className="text-xs">{p.first_name} {p.last_name}</span>
                    </div>
                  ))}
                </div>
              )}
              {selectedProfile && (
                <div className="text-xs text-green-400">Selected: {selectedProfile.first_name} {selectedProfile.last_name}</div>
              )}
              <div className="flex gap-2">
                {editingTag ? (
                  <button onClick={handleUpdateTag} className="flex-1 text-xs py-1 bg-blue-500 text-white rounded hover:bg-blue-600">UPDATE</button>
                ) : (
                  <button onClick={handleSaveTag} className="flex-1 text-xs py-1 bg-blue-500 text-white rounded hover:bg-blue-600">SAVE</button>
                )}
                <button onClick={cancelTagging} className="flex-1 text-xs py-1 bg-gray-700 text-white rounded hover:bg-gray-600">CANCEL</button>
              </div>
            </div>
          )}

          {/* Атрибуты */}
          <div>
            <h3 className="text-xs text-gray-500 mb-2">ATTRIBUTES</h3>
            <div className="space-y-3">
              {/* Season */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><SeasonIcon /><span className="text-xs">{selectedSeasonObj?.name || 'Not specified'}</span></div>
                <button onClick={() => setShowSeasonSelect(!showSeasonSelect)} className="text-gray-400 hover:text-white"><EditIcon /></button>
              </div>
              {showSeasonSelect && (
                <select className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-xs" value={selectedSeason} onChange={e => handleUpdateAttribute('season_id', e.target.value)} disabled={updating}>
                  <option value="">Not specified</option>
                  {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}

              {/* Daytime */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><DaytimeIcon /><span className="text-xs">{selectedDaytimeObj?.name || 'Not specified'}</span></div>
                <button onClick={() => setShowDaytimeSelect(!showDaytimeSelect)} className="text-gray-400 hover:text-white"><EditIcon /></button>
              </div>
              {showDaytimeSelect && (
                <select className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-xs" value={selectedDaytime} onChange={e => handleUpdateAttribute('daytime_id', e.target.value)} disabled={updating}>
                  <option value="">Not specified</option>
                  {daytimes.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              )}

              {/* Event */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><EventIcon /><span className="text-xs">{selectedEventObj?.name || 'Not specified'}</span></div>
                <button onClick={() => setShowEventSelect(!showEventSelect)} className="text-gray-400 hover:text-white"><EditIcon /></button>
              </div>
              {showEventSelect && (
                <select className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-xs" value={selectedEvent} onChange={e => handleUpdateAttribute('event_id', e.target.value)} disabled={updating}>
                  <option value="">Not specified</option>
                  {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              )}

              {/* Clothes multiple - with search */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClothesIcon />
                  <span className="text-xs">
                    {selectedClothes.length > 0 ? `${selectedClothes.length} item(s)` : 'Not specified'}
                  </span>
                </div>
                <button onClick={() => setShowClothSelect(!showClothSelect)} className="text-gray-400 hover:text-white">
                  <EditIcon />
                </button>
              </div>
              {showClothSelect && (
                <div className="mt-2">
                  <MultiClothSearch
                    value={selectedClothes}
                    onChange={(clothIds) => handleUpdateClothes(clothIds)}
                    placeholder="Search clothes by name..."
                  />
                </div>
              )}

              {/* Place */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2c-3.5 0-6 2.5-6 6 0 4 3 7 6 7s6-3 6-7c0-3.5-2.5-6-6-6z" />
                    <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                  </svg>
                  <span className="text-xs">{selectedPlaceObj ? selectedPlaceObj.name : 'Not specified'}</span>
                </div>
                <button onClick={() => setShowPlaceSelect(!showPlaceSelect)} className="text-gray-400 hover:text-white">
                  <EditIcon />
                </button>
              </div>
              {showPlaceSelect && (
                <PlaceSearch
                  value={selectedPlace}
                  onChange={(placeId) => handleUpdateAttribute('place_id', placeId)}
                  placeholder="Search place..."
                />
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/5 px-3 py-1 text-xs text-gray-400 rounded-full">
          {currentIndex + 1} / {safePhotos.length}
        </div>
      </div>
    </div>
  );
};

export default SlideshowModal;