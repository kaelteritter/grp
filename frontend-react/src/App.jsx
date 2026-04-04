import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import ProfileCard from './components/ProfileCard';
import ProfileModal from './components/ProfileModal';
import LocationModal from './components/LocationModal';
import RegionModal from './components/RegionModal';
import CountryModal from './components/CountryModal';
import SlideshowModal from './components/SlideshowModal';
import ProfilePage from './pages/ProfilePage';
import { profileApi, photoApi, platformApi, locationApi, regionApi, countryApi, linkApi } from './services/api';

function HomePage() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [currentSlideshowAvatars, setCurrentSlideshowAvatars] = useState([]);
  const [currentSlideshowProfile, setCurrentSlideshowProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [profilesRes, locationsRes, regionsRes, countriesRes, platformsRes] = await Promise.all([
        profileApi.getAll(),
        locationApi.getAll(),
        regionApi.getAll(),
        countryApi.getAll(),
        platformApi.getAll(),
      ]);
      setProfiles(profilesRes.data || []);
      setLocations(locationsRes.data || []);
      setRegions(regionsRes.data || []);
      setCountries(countriesRes.data || []);
      setPlatforms(platformsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const [slideshowStartIndex, setSlideshowStartIndex] = useState(0);

  const handleAvatarClick = (profile) => {
    const allAvatars = [];
    profiles.forEach(p => {
      if (p.photos && p.photos.length > 0) {
        const avatarPhoto = p.photos.find(ph => ph.is_avatar) || p.photos[0];
        allAvatars.push({
          ...avatarPhoto,
          profileId: p.id,
          profileName: [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(' ') || 'Без имени',
          profile: p
        });
      }
    });
  
  if (allAvatars.length === 0) {
    alert('Нет фотографий для показа');
    return;
  }
  
  const startIndex = allAvatars.findIndex(a => a.profileId === profile.id);
  setCurrentSlideshowAvatars(allAvatars);
  setCurrentSlideshowProfile(profile);
  setSlideshowStartIndex(startIndex);
  setSlideshowOpen(true);
};
  const handleNameClick = (profileId) => {
    navigate(`/profile/${profileId}`);
  };

  const handleEditProfile = (profile) => {
    setEditingProfile(profile);
    setModalOpen(true);
  };

  const handleDeleteProfile = async (id) => {
    if (confirm('Вы уверены, что хотите удалить этот профиль?')) {
      try {
        await profileApi.delete(id);
        await loadAllData();
      } catch (error) {
        console.error('Error deleting profile:', error);
        alert('Ошибка удаления профиля');
      }
    }
  };

  const handleSaveProfile = async (profileData, linksData, photos) => {
    try {
      let profileId;
      
      if (editingProfile) {
        await profileApi.update(editingProfile.id, profileData);
        profileId = editingProfile.id;
      } else {
        const res = await profileApi.create(profileData);
        profileId = res.data.id;
        
        if (photos && photos.length > 0) {
          await photoApi.uploadMultiple(profileId, photos);
        }
      }
      
      for (const link of linksData) {
        if (link.url && link.platform_id) {
          await linkApi.create({
            url: link.url,
            platform_id: link.platform_id,
            profile_id: profileId
          });
        }
      }
      
      await loadAllData();
      setModalOpen(false);
      setEditingProfile(null);
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  const handleCreateLocation = async (data) => {
    try {
      await locationApi.create(data);
      await loadAllData();
      setLocationModalOpen(false);
    } catch (error) {
      console.error('Error creating location:', error);
    }
  };

  const handleCreateRegion = async (data) => {
    try {
      await regionApi.create(data);
      await loadAllData();
      setRegionModalOpen(false);
    } catch (error) {
      console.error('Error creating region:', error);
    }
  };

  const handleCreateCountry = async (data) => {
    try {
      await countryApi.create(data);
      await loadAllData();
      setCountryModalOpen(false);
    } catch (error) {
      console.error('Error creating country:', error);
    }
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
    <>
      <header className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="flex justify-between items-center px-5 py-3">
          <h1 className="text-xl font-light tracking-wider text-white">GRAPHSOCIAL</h1>
          <div className="flex gap-2">
            <button onClick={() => setCountryModalOpen(true)} className="text-[10px] text-gray-500 hover:text-white transition">+ COUNTRY</button>
            <button onClick={() => setRegionModalOpen(true)} className="text-[10px] text-gray-500 hover:text-white transition">+ REGION</button>
            <button onClick={() => setLocationModalOpen(true)} className="text-[10px] text-gray-500 hover:text-white transition">+ LOCATION</button>
            <button onClick={() => { setEditingProfile(null); setModalOpen(true); }} className="text-[10px] text-white border-l border-gray-800 pl-2 ml-1 hover:text-gray-300 transition">+ PROFILE</button>
          </div>
        </div>
      </header>

      <main className="p-0">
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-0 space-y-0">
          {profiles.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onEdit={handleEditProfile}
              onDelete={handleDeleteProfile}
              onAvatarClick={handleAvatarClick}
              onNameClick={handleNameClick}
            />
          ))}
        </div>
      </main>

      <ProfileModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProfile(null); }}
        onSave={handleSaveProfile}
        profile={editingProfile}
        locations={locations}
        platforms={platforms}
      />

      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSave={handleCreateLocation}
        regions={regions}
      />

      <RegionModal
        isOpen={regionModalOpen}
        onClose={() => setRegionModalOpen(false)}
        onSave={handleCreateRegion}
        countries={countries}
      />

      <CountryModal
        isOpen={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        onSave={handleCreateCountry}
      />

      <SlideshowModal
        isOpen={slideshowOpen}
        onClose={() => setSlideshowOpen(false)}
        photos={currentSlideshowAvatars}
        profile={currentSlideshowProfile}
        isGlobal={true}
        startIndex={slideshowStartIndex}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;