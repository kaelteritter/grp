import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

const SlideshowModal = ({ isOpen, onClose, photos, profile, startIndex = 0, isVideo = false, onUpdate }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [showTagForm, setShowTagForm] = useState(false);
  const [tagX, setTagX] = useState(0.5);
  const [tagY, setTagY] = useState(0.5);
  const [tagProfileId, setTagProfileId] = useState('');
  const [tags, setTags] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [daytimes, setDaytimes] = useState([]);
  const [events, setEvents] = useState([]);
  const [clothes, setClothes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedDaytime, setSelectedDaytime] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedCloth, setSelectedCloth] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showSeasonSelect, setShowSeasonSelect] = useState(false);
  const [showDaytimeSelect, setShowDaytimeSelect] = useState(false);
  const [showEventSelect, setShowEventSelect] = useState(false);
  const [showClothSelect, setShowClothSelect] = useState(false);
  const [hoverVideo, setHoverVideo] = useState(false);
  const [selectedClothes, setSelectedClothes] = useState([]);

  const safePhotos = photos && Array.isArray(photos) ? photos : [];
  
  useEffect(() => {
    if (isOpen) {
      loadReferenceData();
    }
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
      // Если приходит массив clothes, извлекаем ID
      const clothIds = photo.clothes?.map(c => c.id) || [];
      setSelectedClothes(clothIds);
    } catch (error) {
      console.error('Error loading photo attributes:', error);
    }
  };

  useEffect(() => {
    if (safePhotos[currentIndex]?.id) {
      loadTags();
      loadPhotoAttributes();
    }
  }, [currentIndex]);

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

  const prevPhoto = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const nextPhoto = () => {
    if (currentIndex < safePhotos.length - 1) setCurrentIndex(currentIndex + 1);
  };

const handleUpdateClothes = async (clothIds) => {
    if (!safePhotos[currentIndex]?.id) return;
    setUpdating(true);
    try {
      await fetch(`http://localhost:8000/api/v1/photos/${safePhotos[currentIndex].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloth_ids: clothIds })
      });
      if (onUpdate) onUpdate(); // перезагрузить данные после сохранения
      setShowClothSelect(false);
    } catch (error) {
      console.error('Error updating clothes:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateAttribute = async (field, value) => {
    if (!safePhotos[currentIndex]?.id) return;
    setUpdating(true);
    try {
      await fetch(`http://localhost:8000/api/v1/photos/${safePhotos[currentIndex].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value || null })
      });
      if (field === 'season_id') setSelectedSeason(value);
      if (field === 'daytime_id') setSelectedDaytime(value);
      if (field === 'event_id') setSelectedEvent(value);
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

  const handleAddTag = async () => {
    if (!safePhotos[currentIndex]?.id || !tagProfileId) return;
    try {
      await fetch('http://localhost:8000/api/v1/photo-tags/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo_id: safePhotos[currentIndex].id,
          profile_id: parseInt(tagProfileId),
          x: tagX,
          y: tagY
        })
      });
      setShowTagForm(false);
      setTagProfileId('');
      loadTags();
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };


  const currentPhoto = safePhotos[currentIndex];
  const fullName = profile ? [profile.last_name, profile.first_name, profile.middle_name].filter(Boolean).join(' ') || 'Без имени' : 'Без имени';

  if (!isOpen || safePhotos.length === 0 || !currentPhoto) return null;

  // Находим выбранные значения для отображения
  const selectedSeasonObj = seasons.find(s => s.id == selectedSeason);
  const selectedDaytimeObj = daytimes.find(d => d.id == selectedDaytime);
  const selectedEventObj = events.find(e => e.id == selectedEvent);
  const selectedClothObj = clothes.find(c => c.id == selectedCloth);

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative w-full h-screen">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/5 text-white hover:bg-white/10 transition flex items-center justify-center rounded-full">✕</button>
        <button onClick={prevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/5 text-white hover:bg-white/10 transition flex items-center justify-center rounded-full">❮</button>
        <button onClick={nextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/5 text-white hover:bg-white/10 transition flex items-center justify-center rounded-full">❯</button>
        
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
            <div className="relative">
              <img src={`http://localhost:8000${currentPhoto.url}`} alt="Фото" className="max-w-full max-h-screen object-contain" />
              {/* Отображение отметок в виде точек на фото */}
              {tags.map(tag => (
                <div 
                  key={tag.id}
                  className="absolute w-4 h-4 bg-yellow-400 rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-transform"
                  style={{ left: `${tag.x * 100}%`, top: `${tag.y * 100}%`, transform: 'translate(-50%, -50%)' }}
                  title={`${tag.profile?.first_name} ${tag.profile?.last_name}`}
                  onClick={() => navigate(`/profile/${tag.profile_id}`)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="absolute right-0 top-0 h-full w-80 bg-black/80 backdrop-blur p-4 border-l border-gray-800 overflow-y-auto">
          {/* Profile info - кликабельный */}
          <div className="text-center cursor-pointer hover:opacity-80 transition mb-6" onClick={() => { onClose(); navigate(`/profile/${profile?.id}`); }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden bg-gray-800">
              {profile?.photos?.[0] ? (
                <img src={`http://localhost:8000${profile.photos[0].url}`} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">{fullName.slice(0, 2).toUpperCase()}</div>
              )}
            </div>
            <div className="text-sm font-light">{fullName}</div>
          </div>
          
          {/* Tags section - кликабельные аватарки */}
          {tags.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs text-gray-500 mb-2">TAGGED PEOPLE</h3>
              <div className="space-y-2">
                {tags.map(tag => (
                  <div 
                    key={tag.id} 
                    className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-800 p-2 rounded transition"
                    onClick={() => navigate(`/profile/${tag.profile_id}`)}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                      {tag.profile?.photos?.[0] ? (
                        <img src={`http://localhost:8000${tag.profile.photos[0].url}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px]">{tag.profile?.first_name?.[0]}{tag.profile?.last_name?.[0]}</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{tag.profile?.first_name} {tag.profile?.last_name}</div>
                      <div className="text-[10px] text-gray-500">position: ({tag.x}, {tag.y})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add tag button */}
          <button onClick={() => setShowTagForm(!showTagForm)} className="w-full text-xs py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition mb-4 rounded">
            + ADD TAG
          </button>
          
          {showTagForm && (
            <div className="mb-4 p-3 bg-gray-900 rounded">
              <div className="mb-2">
                <label className="text-[10px] text-gray-500">Profile ID</label>
                <input type="number" value={tagProfileId} onChange={e => setTagProfileId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-xs" />
              </div>
              <div className="flex gap-2 mb-2">
                <div className="flex-1"><label className="text-[10px] text-gray-500">X (0-1)</label><input type="number" step="0.1" value={tagX} onChange={e => setTagX(parseFloat(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-xs" /></div>
                <div className="flex-1"><label className="text-[10px] text-gray-500">Y (0-1)</label><input type="number" step="0.1" value={tagY} onChange={e => setTagY(parseFloat(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-xs" /></div>
              </div>
              <button onClick={handleAddTag} className="w-full text-xs py-1 bg-blue-500 text-white rounded hover:bg-blue-600">SAVE TAG</button>
            </div>
          )}
          
          {/* Attributes section - с иконками и редактированием */}
          <div>
            <h3 className="text-xs text-gray-500 mb-2">ATTRIBUTES</h3>
            <div className="space-y-3">
              {/* Season */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SeasonIcon />
                  <span className="text-xs">{selectedSeasonObj?.name || 'Not specified'}</span>
                </div>
                <button onClick={() => setShowSeasonSelect(!showSeasonSelect)} className="text-gray-400 hover:text-white transition">
                  <EditIcon />
                </button>
              </div>
              {showSeasonSelect && (
                <select 
                  className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-xs" 
                  value={selectedSeason} 
                  onChange={e => handleUpdateAttribute('season_id', e.target.value)}
                  disabled={updating}
                >
                  <option value="">Not specified</option>
                  {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
              
              {/* Daytime */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DaytimeIcon />
                  <span className="text-xs">{selectedDaytimeObj?.name || 'Not specified'}</span>
                </div>
                <button onClick={() => setShowDaytimeSelect(!showDaytimeSelect)} className="text-gray-400 hover:text-white transition">
                  <EditIcon />
                </button>
              </div>
              {showDaytimeSelect && (
                <select 
                  className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-xs" 
                  value={selectedDaytime} 
                  onChange={e => handleUpdateAttribute('daytime_id', e.target.value)}
                  disabled={updating}
                >
                  <option value="">Not specified</option>
                  {daytimes.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              )}
              
              {/* Event */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EventIcon />
                  <span className="text-xs">{selectedEventObj?.name || 'Not specified'}</span>
                </div>
                <button onClick={() => setShowEventSelect(!showEventSelect)} className="text-gray-400 hover:text-white transition">
                  <EditIcon />
                </button>
              </div>
              {showEventSelect && (
                <select 
                  className="w-full bg-gray-800 border border-gray-700 rounded p-1 text-xs" 
                  value={selectedEvent} 
                  onChange={e => handleUpdateAttribute('event_id', e.target.value)}
                  disabled={updating}
                >
                  <option value="">Not specified</option>
                  {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              )}

              {selectedClothes.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-xs text-gray-500 mb-1">Clothes</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedClothes.map(clothId => {
                      const cloth = clothes.find(c => c.id === clothId);
                      return cloth ? (
                        <span key={cloth.id} className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded">
                          {cloth.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              
              {/* Clothes (multiple) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClothesIcon />
                  <span className="text-xs">
                    {selectedClothes.length > 0 
                      ? `${selectedClothes.length} item(s)` 
                      : 'Not specified'}
                  </span>
                </div>
                <button onClick={() => setShowClothSelect(!showClothSelect)} className="text-gray-400 hover:text-white transition">
                  <EditIcon />
                </button>
              </div>
              {showClothSelect && (
                <div className="mt-2 space-y-2">
                  <div className="max-h-40 overflow-y-auto space-y-1 bg-gray-900 p-2 rounded">
                    {clothes.map(cloth => (
                      <label key={cloth.id} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          value={cloth.id}
                          checked={selectedClothes.includes(cloth.id)}
                          onChange={(e) => {
                            const id = cloth.id;
                            if (e.target.checked) {
                              setSelectedClothes(prev => [...prev, id]);
                            } else {
                              setSelectedClothes(prev => prev.filter(cid => cid !== id));
                            }
                          }}
                          className="rounded border-gray-600 bg-gray-800"
                        />
                        <span>{cloth.name} ({cloth.color}, {cloth.material})</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={async () => {
                      await handleUpdateClothes(selectedClothes);
                      setShowClothSelect(false);
                    }}
                    className="w-full text-xs py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={updating}
                  >
                    Save clothes
                  </button>
                </div>
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