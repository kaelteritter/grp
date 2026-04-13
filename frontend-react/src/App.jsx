import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import ProfileCard from './components/ProfileCard';
import ProfileModal from './components/ProfileModal';
import LocationModal from './components/LocationModal';
import RegionModal from './components/RegionModal';
import CountryModal from './components/CountryModal';
import SimpleModal from './components/SimpleModal';
import CompanyModal from './components/CompanyModal';
import SlideshowModal from './components/SlideshowModal';
import AddressModal from './components/AddressModal';
import ProfilePage from './pages/ProfilePage';
import PlaceModal from './components/PlaceModal';
import PlacePhotosPage from './pages/PlacePhotosPage';
import { profileApi, photoApi, platformApi, locationApi, regionApi, countryApi, linkApi, clothApi } from './services/api';

function HomePage() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [professionModalOpen, setProfessionModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [seasonModalOpen, setSeasonModalOpen] = useState(false);
  const [clothModalOpen, setClothModalOpen] = useState(false);
  const [daytimeModalOpen, setDaytimeModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [currentSlideshowAvatars, setCurrentSlideshowAvatars] = useState([]);
  const [currentSlideshowProfile, setCurrentSlideshowProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const [slideshowStartIndex, setSlideshowStartIndex] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [clothes, setClothes] = useState([]); // список всех предметов одежды
  const [selectedClothIds, setSelectedClothIds] = useState([]); // выбранные ID
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState(null);



  const limit = 20;

  useEffect(() => {
    loadReferenceData();
  }, []);

  // Первая загрузка профилей
  useEffect(() => {
    setSkip(0);
    setHasMore(true);
    loadProfiles(0, false, selectedClothIds, searchQuery);
  }, [selectedClothIds, searchQuery]);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    setSkip(0);
    setHasMore(true);
    loadProfiles(0, false, selectedClothIds);
  }, [selectedClothIds]);

    // Бесконечный скролл
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (scrollTop + windowHeight >= documentHeight - 200) {
        loadProfiles(skip + limit, true, selectedClothIds, searchQuery);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, skip]);

  const loadReferenceData = async () => {
      try {
        const [locationsRes, regionsRes, countriesRes, platformsRes, professionsRes, companiesRes, addressesRes, clothesRes] = await Promise.all([
          locationApi.getAll(),
          regionApi.getAll(),
          countryApi.getAll(),
          platformApi.getAll(),
          fetch('http://localhost:8000/api/v1/professions/').then(r => r.json()).catch(() => []),
          fetch('http://localhost:8000/api/v1/companies/').then(r => r.json()).catch(() => []),
          fetch('http://localhost:8000/api/v1/addresses/').then(r => r.json()).catch(() => []),
          clothApi.getAll().catch(() => ({ data: [] })),
        ]);
        setLocations(locationsRes.data || []);
        setRegions(regionsRes.data || []);
        setCountries(countriesRes.data || []);
        setPlatforms(platformsRes.data || []);
        setProfessions(professionsRes);
        setCompanies(companiesRes);
        setAddresses(addressesRes);
        setClothes(clothesRes.data || []);
      } catch (error) {
        console.error('Error loading reference data:', error);
      }
    };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setSkip(0);
    setHasMore(true);
    loadProfiles(0, false, selectedClothIds, value);
  };


  const loadProfiles = async (newSkip, append, clothIds, search) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await profileApi.getAll(newSkip, limit, clothIds, search);
      const newProfiles = res.data || [];
      if (append) {
        setProfiles(prev => [...prev, ...newProfiles]);
      } else {
        setProfiles(newProfiles);
      }
      setHasMore(newProfiles.length === limit);
      setSkip(newSkip + (append ? limit : 0));
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [profilesRes, locationsRes, regionsRes, countriesRes, platformsRes, professionsRes, companiesRes, addressesRes] = await Promise.all([
        profileApi.getAll(),
        locationApi.getAll(),
        regionApi.getAll(),
        countryApi.getAll(),
        platformApi.getAll(),
        fetch('http://localhost:8000/api/v1/professions/').then(r => r.json()).catch(() => []),
        fetch('http://localhost:8000/api/v1/companies/').then(r => r.json()).catch(() => []),
        fetch('http://localhost:8000/api/v1/addresses/').then(r => r.json()).catch(() => []),
      ]);
      setProfiles(profilesRes.data || []);
      setLocations(locationsRes.data || []);
      setRegions(regionsRes.data || []);
      setCountries(countriesRes.data || []);
      setPlatforms(platformsRes.data || []);
      setProfessions(professionsRes);
      setCompanies(companiesRes);
      setAddresses(addressesRes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = (profile) => {
    const allAvatars = [];
    profiles.forEach(p => {
      if (p.photos && p.photos.length > 0) {
        const avatarPhoto = p.photos.find(ph => ph.is_avatar) || p.photos[0];
        allAvatars.push({
          ...avatarPhoto,
          id: avatarPhoto.id,
          url: avatarPhoto.url,
          profileId: p.id,
          profileName: [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(' ') || 'Без имени',
          profile: p
        });
      } else {
        // Профиль без фото – добавляем заглушку
        allAvatars.push({
          id: null,
          url: null,
          profileId: p.id,
          profileName: [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(' ') || 'Без имени',
          profile: p,
          isPlaceholder: true
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
    setSlideshowStartIndex(startIndex >= 0 ? startIndex : 0);
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
  

  const handleSaveProfile = async (profileData, linksData, photos, videos, professionId, companyId, connections) => {
    try {
      let profileId;
      
      if (editingProfile) {
        await profileApi.update(editingProfile.id, profileData);
        profileId = editingProfile.id;
        
        // Загружаем новые фото (если есть)
        if (photos && photos.length > 0) {
          const formData = new FormData();
          photos.forEach(f => formData.append('files', f));
          formData.append('profile_id', profileId);
          await fetch('http://localhost:8000/api/v1/photos/multiple/', {
            method: 'POST',
            body: formData,
          });
        }
        
      // Загружаем новые видео (если есть)
      if (videos && videos.length > 0) {
        const formData = new FormData();
        videos.forEach(f => formData.append('files', f));
        formData.append('profile_id', profileId);
        await fetch('http://localhost:8000/api/v1/videos/multiple/', {
          method: 'POST',
          body: formData,
        });
      }
      
      // Добавляем профессию (если новая)
      if (professionId) {
        await fetch('http://localhost:8000/api/v1/professions/profile/employment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile_id: profileId,
            profession_id: parseInt(professionId),
            company_id: companyId ? parseInt(companyId) : null,
            is_current: true
          })
        });
      }
      
      // Добавляем связи
      for (const conn of connections) {
        if (conn.profile_id && conn.relation_type) {
          await fetch('http://localhost:8000/api/v1/connections/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profile_id: profileId,
              connected_profile_id: parseInt(conn.profile_id),
              relation_type: conn.relation_type
            })
          });
        }
      }

      } else {
        const res = await profileApi.create(profileData);
        profileId = res.data.id;
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


  const handleCreateSimple = async (endpoint, data) => {
    try {
      await fetch(`http://localhost:8000/api/v1/${endpoint}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      await loadAllData();
    } catch (error) {
      console.error(`Error creating ${endpoint}:`, error);
    }
  };

  const toggleClothFilter = (clothId) => {
    setSelectedClothIds(prev =>
      prev.includes(clothId) ? prev.filter(id => id !== clothId) : [...prev, clothId]
    );
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black">...</div>;
  }

  return (
    <>
    <header className="sticky top-0 z-10 bg-black border-b border-gray-800">
      <div className="flex justify-between items-center px-5 py-3">
        {/* Кнопка-стрелка для переключения сайдбара */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`fixed top-4 z-30 bg-black/80 border border-gray-700 rounded p-1 hover:bg-gray-800 transition-all duration-300 ${
            sidebarOpen ? 'left-64' : 'left-0'
          }`}
          title={sidebarOpen ? "Hide filters" : "Show filters"}
        >
          {sidebarOpen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </button>


        {/* Компонент поиска */}
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search profiles by name, email, profession, company, social link..."
        />

        <h1 className="text-xl font-light tracking-wider text-white">GRAPHSOCIAL</h1>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setPlaceModalOpen(true)} className="text-[10px] text-gray-500 hover:text-white">+ PLACE</button>
          <button onClick={() => setCountryModalOpen(true)} className="text-[10px] text-gray-500 hover:text-white">+ COUNTRY</button>
          <button onClick={() => setRegionModalOpen(true)} className="text-[10px] text-gray-500 hover:text-white">+ REGION</button>
          <button onClick={() => setLocationModalOpen(true)} className="text-[10px] text-gray-500 hover:text-white">+ LOCATION</button>
          <button onClick={() => setProfessionModalOpen(true)} className="text-[10px] text-gray-500 hover:text-white">+ PROF</button>
          <button onClick={() => setCompanyModalOpen(true)} className="text-[10px] text-gray-500 hover:text-white">+ CO</button>
          <button onClick={() => setAddressModalOpen(true)} className="text-[10px] text-gray-500 hover:text-white">+ ADDR</button>
          <button onClick={() => setSeasonModalOpen(true)} className="text-[10px] text-gray-500 hover:text-white">+ SEAS</button>
          <button onClick={() => setClothModalOpen(true)} className="text-[10px] text-gray-500 hover:text-white">+ CLOTH</button>
          <button onClick={() => setDaytimeModalOpen(true)} className="text-[10px] text-gray-500 hover:text-white">+ DAY</button>
          <button onClick={() => setEventModalOpen(true)} className="text-[10px] text-gray-500 hover:text-white">+ EV</button>
          <button onClick={() => { setEditingProfile(null); setModalOpen(true); }} className="text-[10px] text-white border-l border-gray-800 pl-2 ml-1">+ PROFILE</button>
        </div>
      </div>
    </header>

      <div className="flex">
        {/* Левая боковая панель (фильтр) */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-black border-r border-gray-800 z-20 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 pt-16"> {/* Отступ сверху, чтобы не перекрывать кнопку */}
            <h3 className="text-xs font-light tracking-wider text-gray-500 mb-3">FILTER BY CLOTHES</h3>
            <div className="grid grid-cols-3 gap-2">
              {clothes.map(cloth => (
                <button
                  key={cloth.id}
                  onClick={() => toggleClothFilter(cloth.id)}
                  className={`relative aspect-square rounded overflow-hidden border-2 transition ${selectedClothIds.includes(cloth.id) ? 'border-blue-500' : 'border-transparent'}`}
                  title={cloth.name}
                >
                  {cloth.cover_url ? (
                    <img src={`http://localhost:8000${cloth.cover_url}`} alt={cloth.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-400">
                      {cloth.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {selectedClothIds.includes(cloth.id) && (
                    <div className="absolute top-0 right-0 w-4 h-4 bg-blue-500 rounded-bl flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {selectedClothIds.length > 0 && (
              <button
                onClick={() => setSelectedClothIds([])}
                className="mt-4 text-xs text-gray-400 hover:text-white w-full py-1 border border-gray-700 rounded"
              >
                CLEAR ALL
              </button>
            )}
          </div>
        </aside>

        {/* Основной контент */}
        <main
          className={`flex-1 p-0 transition-all duration-300 ${
            sidebarOpen ? 'md:ml-64' : 'ml-0'
          }`}
        >
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
          {loadingMore && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {!hasMore && profiles.length > 0 && (
            <div className="text-center text-gray-500 text-xs py-4">No more profiles</div>
          )}
        </main>
      </div>

      

      <ProfileModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProfile(null); }}
        onSave={handleSaveProfile}
        profile={editingProfile}
        locations={locations}
        platforms={platforms}
        professions={professions}
        companies={companies}
      />

      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSave={(data) => handleCreateSimple('locations', data)}
        regions={regions}
      />

      <RegionModal
        isOpen={regionModalOpen}
        onClose={() => setRegionModalOpen(false)}
        onSave={(data) => handleCreateSimple('regions', data)}
        countries={countries}
      />

      <CountryModal
        isOpen={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        onSave={(data) => handleCreateSimple('countries', data)}
      />

      <SimpleModal
        isOpen={professionModalOpen}
        onClose={() => setProfessionModalOpen(false)}
        onSave={(data) => handleCreateSimple('professions', data)}
        title="NEW PROFESSION"
        fields={[{ name: 'name', label: 'Name', type: 'text', required: true }]}
      />

      <CompanyModal
        isOpen={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        onSave={(data) => handleCreateSimple('companies', data)}
      />

      <AddressModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSave={(data) => handleCreateSimple('addresses', data)}
      />

      <SimpleModal
        isOpen={seasonModalOpen}
        onClose={() => setSeasonModalOpen(false)}
        onSave={(data) => handleCreateSimple('seasons', data)}
        title="NEW SEASON"
        fields={[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'cover_url', label: 'Cover URL', type: 'text' }
        ]}
      />

      <SimpleModal
        isOpen={clothModalOpen}
        onClose={() => setClothModalOpen(false)}
        onSave={(data) => handleCreateSimple('clothes', data)}
        title="NEW CLOTH"
        fields={[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'color', label: 'Color', type: 'text', required: true },
          { name: 'material', label: 'Material', type: 'text', required: true }
        ]}
      />

      <SimpleModal
        isOpen={daytimeModalOpen}
        onClose={() => setDaytimeModalOpen(false)}
        onSave={(data) => handleCreateSimple('daytimes', data)}
        title="NEW DAYTIME"
        fields={[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'cover_url', label: 'Cover URL', type: 'text' }
        ]}
      />

      <SimpleModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSave={(data) => handleCreateSimple('events', data)}
        title="NEW EVENT"
        fields={[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'cover_url', label: 'Cover URL', type: 'text' }
        ]}
      />
      <PlaceModal
        isOpen={placeModalOpen}
        onClose={() => setPlaceModalOpen(false)}
        onSave={(data) => handleCreateSimple('places', data)}
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
        <Route path="/place/:placeId/photos" element={<PlacePhotosPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;