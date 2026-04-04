import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// SVG иконки
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PrevIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const NextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const SlideshowModal = ({ isOpen, onClose, photos, profile, isGlobal = false, startIndex = 0 }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(startIndex);
    }
  }, [isOpen, startIndex]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos]);

  const prevPhoto = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const nextPhoto = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleProfileClick = () => {
    const targetProfile = isGlobal ? photos[currentIndex]?.profile : profile;
    if (targetProfile) {
      onClose();
      navigate(`/profile/${targetProfile.id}`);
    }
  };

  if (!isOpen || !photos?.length) return null;

  const currentPhoto = photos[currentIndex];
  const currentProfile = isGlobal ? currentPhoto?.profile : profile;
  const fullName = currentProfile ? [currentProfile.last_name, currentProfile.first_name, currentProfile.middle_name].filter(Boolean).join(' ') || 'Без имени' : 'Без имени';

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative w-full h-screen">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/5 text-white hover:bg-white/10 transition flex items-center justify-center"
        >
          <CloseIcon />
        </button>
        
        <button 
          onClick={prevPhoto} 
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/5 text-white hover:bg-white/10 transition flex items-center justify-center ${currentIndex === 0 ? 'opacity-0 cursor-default' : ''}`}
          disabled={currentIndex === 0}
        >
          <PrevIcon />
        </button>
        
        <button 
          onClick={nextPhoto} 
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/5 text-white hover:bg-white/10 transition flex items-center justify-center ${currentIndex === photos.length - 1 ? 'opacity-0 cursor-default' : ''}`}
          disabled={currentIndex === photos.length - 1}
        >
          <NextIcon />
        </button>
        
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src={`http://localhost:8000${currentPhoto.url}`} 
            alt="Фото" 
            className="max-w-full max-h-screen object-contain"
          />
        </div>
        
        <div className="absolute right-0 top-0 h-full w-64 bg-black/80 p-4 border-l border-gray-800">
          <div 
            className="text-center cursor-pointer hover:opacity-80 transition"
            onClick={handleProfileClick}
          >
            <div className="w-16 h-16 mx-auto mb-3 overflow-hidden bg-gray-800 rounded-full">
              <img 
                src={`http://localhost:8000${currentPhoto.url}`} 
                alt={fullName} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-sm font-light">{fullName}</div>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/5 px-3 py-1 text-xs text-gray-400">
          {currentIndex + 1} / {photos.length}
        </div>
      </div>
    </div>
  );
};

export default SlideshowModal;