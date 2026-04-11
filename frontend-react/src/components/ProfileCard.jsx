import React from 'react';

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 3l4 4-7 7H10v-4l7-7z" />
    <path d="M4 20h16" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13" />
    <path d="M9 4h6" />
  </svg>
);

const MaleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="4" />
    <path d="M15 9l6-6" />
    <path d="M21 3h-6" />
    <path d="M21 9V3" />
  </svg>
);

const FemaleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 20v4" />
    <path d="M9 22h6" />
  </svg>
);

const LocationIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const HairIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2c-3.5 0-6 2.5-6 6 0 4 3 7 6 7s6-3 6-7c0-3.5-2.5-6-6-6z" />
    <path d="M12 15v5" />
    <path d="M9 20h6" />
  </svg>
);

const ProfileCard = ({ profile, onEdit, onDelete, onAvatarClick, onNameClick }) => {
  const fullName = [profile.last_name, profile.first_name, profile.middle_name].filter(Boolean).join(' ') || 'Без имени';
  const avatarPhoto = profile.photos?.find(p => p.is_avatar) || profile.photos?.[0];
  const location = profile.current_location;
  const fullLocation = location ? [location.name, location.region?.name, location.region?.country?.name].filter(Boolean).join(', ') : '';
  const profession = profile.professions?.[0];
  const professionName = profession?.name || '';
  const companyName = profession?.company_name || '';
  const hairColor = profile.hair_color;
  
  const formatBirthDate = () => {
    const { birth_year, birth_month, birth_day } = profile;
    if (birth_year && birth_month && birth_day) return `${birth_year}-${String(birth_month).padStart(2, '0')}-${String(birth_day).padStart(2, '0')}`;
    if (birth_year && birth_month) return `${birth_year}-${String(birth_month).padStart(2, '0')}`;
    if (birth_year) return `${birth_year}`;
    return '';
  };

  const getHairColorStyle = () => {
    if (!hairColor) return { backgroundColor: '#333' };
    const colorMap = {
      'блондин': '#F5D7B3',
      'брюнет': '#3C2415',
      'шатен': '#8B5A2B',
      'рыжий': '#D4561E',
      'черный': '#1A1A1A',
      'blonde': '#F5D7B3',
      'brunette': '#3C2415',
      'red': '#D4561E',
      'black': '#1A1A1A',
    };
    return { backgroundColor: colorMap[hairColor.toLowerCase()] || hairColor };
  };

  return (
    <div className="relative group bg-black border-b border-r border-gray-800 break-inside-avoid">
      <div className="relative cursor-pointer" onClick={() => onAvatarClick(profile)}>
        {avatarPhoto ? (
          <img 
            src={`http://localhost:8000${avatarPhoto.url}`} 
            alt={fullName}
            className="w-full h-auto object-cover"
          />
        ) : (
          <div className="w-full aspect-square bg-gray-900 flex items-center justify-center text-3xl font-light text-gray-600">
            {fullName.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Информация появляется только при наведении - каждая на новой строке */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        {/* ФИО */}
        <div 
          className="text-sm font-medium text-white hover:text-gray-300 transition cursor-pointer mb-1"
          onClick={() => onNameClick(profile.id)}
        >
          {fullName}
        </div>
        
        {/* Пол - отдельная строка */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mb-0.5">
          {profile.sex === 'male' ? <MaleIcon /> : <FemaleIcon />}
          <span>{profile.sex === 'male' ? 'Male' : 'Female'}</span>
        </div>
        
        {/* Дата рождения - отдельная строка */}
        {formatBirthDate() && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mb-0.5">
            <CalendarIcon />
            <span>{formatBirthDate()}</span>
          </div>
        )}
        
        {/* Локация - отдельная строка */}
        {fullLocation && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mb-0.5 truncate">
            <LocationIcon />
            <span className="truncate">{fullLocation}</span>
          </div>
        )}
        
        {/* Профессия (компания) - отдельная строка */}
        {professionName && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mb-0.5">
            <BriefcaseIcon />
            <span className="truncate">{professionName}{companyName ? ` @ ${companyName}` : ''}</span>
          </div>
        )}
        
        {/* Цвет волос - отдельная строка, только иконка и точка */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mb-0.5">
          <HairIcon />
          {hairColor ? (
            <span 
              className="inline-block w-2.5 h-2.5 rounded-full" 
              style={getHairColorStyle()}
            />
          ) : (
            <span className="text-gray-500">—</span>
          )}
        </div>

        {profile.university && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mb-0.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span className="truncate">{profile.university.name}</span>
          </div>
        )}

        {/* Место работы */}
        {profile.employments && profile.employments.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mb-0.5">
            <BriefcaseIcon />
            <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0">
              {profile.employments.slice(0, 1).map((job, idx) => (
                <span key={idx} className="inline-flex items-baseline gap-1">
                  <span className="hover:text-blue-400 cursor-pointer" onClick={() => alert(job.profession_name)}>
                    {job.profession_name}
                  </span>
                  {job.company_name && (
                    <>
                      <span className="text-gray-500">|</span>
                      <span className="hover:text-blue-400 cursor-pointer" onClick={() => alert(job.company_name)}>
                        {job.company_name}
                      </span>
                    </>
                  )}
                  {job.is_current && <span className="text-green-500 text-[9px]">✓</span>}
                </span>
              ))}
              {profile.employments.length > 1 && (
                <span className="text-gray-500 text-[9px]">+{profile.employments.length - 1}</span>
              )}
            </div>
          </div>
        )}
        
        {/* Ссылки */}
        {profile.links?.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {profile.links.map(link => (
              <a 
                key={link.id}
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[9px] bg-white/10 px-1.5 py-0.5 hover:bg-white/20 transition rounded"
                onClick={e => e.stopPropagation()}
              >
              {link.platform?.icon_url ? (
                <img src={`http://localhost:8000${link.platform.icon_url}`} alt={link.platform.name} className="w-3 h-3 object-contain platform-icon"  />
              ) : (
                <span>{link.platform.name}</span>
              )}
              </a>
            ))}
          </div>
        )}
      </div>
      
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(profile); }}
          className="w-6 h-6 bg-black/60 text-white hover:text-blue-400 transition flex items-center justify-center rounded"
          title="Edit"
        >
          <EditIcon />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}
          className="w-6 h-6 bg-black/60 text-white hover:text-red-500 transition flex items-center justify-center rounded"
          title="Delete"
        >
          <DeleteIcon />
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;