// App.jsx (изменённая версия)
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
  const [clothes, setClothes] = useState([]);
  const [selectedClothIds, setSelectedClothIds] = useState([]);
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState(null);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false); // состояние для выпадающего меню

  const limit = 20;

  useEffect(() => {
    loadReferenceData();
  }, []);

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
        
        if (photos && photos.length > 0) {
          const formData = new FormData();
          photos.forEach(f => formData.append('files', f));
          formData.append('profile_id', profileId);
          await fetch('http://localhost:8000/api/v1/photos/multiple/', {
            method: 'POST',
            body: formData,
          });
        }
        
        if (videos && videos.length > 0) {
          const formData = new FormData();
          videos.forEach(f => formData.append('files', f));
          formData.append('profile_id', profileId);
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
              profile_id: profileId,
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
      <div className="max-w-4xl mx-auto px-4 py-2 flex justify-between items-center">
        <h1 className="text-base font-light tracking-wider text-white">GRAPHSOCIAL</h1>
        <div className="flex gap-2">
          {/* Админ с выпадающим меню */}
          <div className="relative">
            <button
              onClick={() => setAdminMenuOpen(!adminMenuOpen)}
              className="text-xs px-2 py-1 border border-gray-600 rounded text-gray-300 hover:bg-gray-800 transition"
            >
              Админ-панель
            </button>
              {adminMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black border border-gray-700 rounded shadow-lg z-20 py-1">
                  <button onClick={() => { setLocationModalOpen(true); setAdminMenuOpen(false); }} className="block w-full text-left px-4 py-1 text-xs text-gray-300 hover:bg-gray-800">+ Location</button>
                  <button onClick={() => { setRegionModalOpen(true); setAdminMenuOpen(false); }} className="block w-full text-left px-4 py-1 text-xs text-gray-300 hover:bg-gray-800">+ Region</button>
                  <button onClick={() => { setCountryModalOpen(true); setAdminMenuOpen(false); }} className="block w-full text-left px-4 py-1 text-xs text-gray-300 hover:bg-gray-800">+ Country</button>
                  <button onClick={() => { setProfessionModalOpen(true); setAdminMenuOpen(false); }} className="block w-full text-left px-4 py-1 text-xs text-gray-300 hover:bg-gray-800">+ Profession</button>
                  <button onClick={() => { setCompanyModalOpen(true); setAdminMenuOpen(false); }} className="block w-full text-left px-4 py-1 text-xs text-gray-300 hover:bg-gray-800">+ Company</button>
                  <button onClick={() => { setAddressModalOpen(true); setAdminMenuOpen(false); }} className="block w-full text-left px-4 py-1 text-xs text-gray-300 hover:bg-gray-800">+ Address</button>
                  <button onClick={() => { setSeasonModalOpen(true); setAdminMenuOpen(false); }} className="block w-full text-left px-4 py-1 text-xs text-gray-300 hover:bg-gray-800">+ Season</button>
                  <button onClick={() => { setClothModalOpen(true); setAdminMenuOpen(false); }} className="block w-full text-left px-4 py-1 text-xs text-gray-300 hover:bg-gray-800">+ Cloth</button>
                  <button onClick={() => { setDaytimeModalOpen(true); setAdminMenuOpen(false); }} className="block w-full text-left px-4 py-1 text-xs text-gray-300 hover:bg-gray-800">+ Daytime</button>
                  <button onClick={() => { setEventModalOpen(true); setAdminMenuOpen(false); }} className="block w-full text-left px-4 py-1 text-xs text-gray-300 hover:bg-gray-800">+ Event</button>
                  <button onClick={() => { setPlaceModalOpen(true); setAdminMenuOpen(false); }} className="block w-full text-left px-4 py-1 text-xs text-gray-300 hover:bg-gray-800">+ Place</button>
                </div>
              )}
            </div>
            <button
              onClick={() => { setEditingProfile(null); setModalOpen(true); }}
              className="text-xs px-2 py-1 border border-gray-600 rounded text-gray-300 hover:bg-gray-800 transition"
            >
              Создать
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-4xl mx-auto px-4 mt-6">
        <main className="flex-1 p-0">
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-4 gap-0 space-y-0">
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

      {/* Модальные окна (без изменений) */}
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
      <LocationModal isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)} onSave={(data) => handleCreateSimple('locations', data)} regions={regions} />
      <RegionModal isOpen={regionModalOpen} onClose={() => setRegionModalOpen(false)} onSave={(data) => handleCreateSimple('regions', data)} countries={countries} />
      <CountryModal isOpen={countryModalOpen} onClose={() => setCountryModalOpen(false)} onSave={(data) => handleCreateSimple('countries', data)} />
      <SimpleModal isOpen={professionModalOpen} onClose={() => setProfessionModalOpen(false)} onSave={(data) => handleCreateSimple('professions', data)} title="NEW PROFESSION" fields={[{ name: 'name', label: 'Name', type: 'text', required: true }]} />
      <CompanyModal isOpen={companyModalOpen} onClose={() => setCompanyModalOpen(false)} onSave={(data) => handleCreateSimple('companies', data)} />
      <AddressModal isOpen={addressModalOpen} onClose={() => setAddressModalOpen(false)} onSave={(data) => handleCreateSimple('addresses', data)} />
      <SimpleModal isOpen={seasonModalOpen} onClose={() => setSeasonModalOpen(false)} onSave={(data) => handleCreateSimple('seasons', data)} title="NEW SEASON" fields={[{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'cover_url', label: 'Cover URL', type: 'text' }]} />
      <SimpleModal isOpen={clothModalOpen} onClose={() => setClothModalOpen(false)} onSave={(data) => handleCreateSimple('clothes', data)} title="NEW CLOTH" fields={[{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'color', label: 'Color', type: 'text', required: true }, { name: 'material', label: 'Material', type: 'text', required: true }]} />
      <SimpleModal isOpen={daytimeModalOpen} onClose={() => setDaytimeModalOpen(false)} onSave={(data) => handleCreateSimple('daytimes', data)} title="NEW DAYTIME" fields={[{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'cover_url', label: 'Cover URL', type: 'text' }]} />
      <SimpleModal isOpen={eventModalOpen} onClose={() => setEventModalOpen(false)} onSave={(data) => handleCreateSimple('events', data)} title="NEW EVENT" fields={[{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'cover_url', label: 'Cover URL', type: 'text' }]} />
      <PlaceModal isOpen={placeModalOpen} onClose={() => setPlaceModalOpen(false)} onSave={(data) => handleCreateSimple('places', data)} />
      <SlideshowModal isOpen={slideshowOpen} onClose={() => setSlideshowOpen(false)} photos={currentSlideshowAvatars} profile={currentSlideshowProfile} isGlobal={true} startIndex={slideshowStartIndex} />
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