import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SlideshowModal from '../components/SlideshowModal';

const PlacePhotosPage = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadData();
  }, [placeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Загружаем информацию о месте
      const placeRes = await fetch(`http://localhost:8000/api/v1/places/${placeId}`);
      if (placeRes.ok) {
        const placeData = await placeRes.json();
        setPlace(placeData);
      }
      // Загружаем фото этого места
      const photosRes = await fetch(`http://localhost:8000/api/v1/photos/?place_id=${placeId}&limit=100`);
      if (photosRes.ok) {
        const photosData = await photosRes.json();
        setPhotos(photosData);
      }
    } catch (error) {
      console.error('Error loading place photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const openSlideshow = (media, startIndex = 0) => {
    setCurrentMedia(media);
    setCurrentIndex(startIndex);
    setSlideshowOpen(true);
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

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="flex justify-between items-center px-5 py-3">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-white transition">← НАЗАД</button>
          <h1 className="text-sm font-light tracking-wider text-white">GRAPHSOCIAL</h1>
          <div className="w-20"></div>
        </div>
      </header>
      <main>
        <div className="max-w-4xl mx-auto p-4">
          <h2 className="text-xl font-light mb-4">{place?.name || 'Место'}</h2>
          {place?.address && (
            <p className="text-sm text-gray-400 mb-6">{place.address.street}, {place.address.house}</p>
          )}
          {photos.length > 0 ? (
            <div className="columns-2 md:columns-3 gap-2 space-y-2">
              {photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="cursor-pointer break-inside-avoid"
                  onClick={() => openSlideshow(photos, idx)}
                >
                  <img src={`http://localhost:8000${photo.url}`} alt="Фото" className="w-full h-auto object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600 text-sm">Нет фотографий в этом месте</div>
          )}
        </div>
      </main>
      <SlideshowModal
        isOpen={slideshowOpen}
        onClose={() => setSlideshowOpen(false)}
        photos={currentMedia}
        startIndex={currentIndex}
        isGlobal={true}
      />
    </div>
  );
};

export default PlacePhotosPage;