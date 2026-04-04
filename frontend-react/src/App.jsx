import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import ProfileCard from './components/ProfileCard';
import ProfileModal from './components/ProfileModal';
import LocationModal from './components/LocationModal';
import RegionModal from './components/RegionModal';
import CountryModal from './components/CountryModal';
import SimpleModal from './components/SimpleModal';
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

  useEffect(() => {
    loadAllData();
  }, []);

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
      } else {
        const res = await profileApi.create(profileData);
        profileId = res.data.id;
        
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
          <div className="flex gap-2 flex-wrap">
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

      <SimpleModal
        isOpen={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        onSave={(data) => handleCreateSimple('companies', data)}
        title="NEW COMPANY"
        fields={[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'address_ids', label: 'Address IDs (comma separated)', type: 'text', description: 'Enter address IDs separated by commas, e.g. 1,2,3' }
        ]}
      />

      <SimpleModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSave={(data) => handleCreateSimple('addresses', data)}
        title="NEW ADDRESS"
        fields={[
          { name: 'street', label: 'Street', type: 'text', required: true },
          { name: 'house', label: 'House', type: 'text', required: true },
          { name: 'location_id', label: 'Location ID', type: 'number', description: 'Optional location ID' }
        ]}
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