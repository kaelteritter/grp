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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 4c-5 0-6 5-6 8 0 2 1 4 3 5v3h6v-3c2-1 3-3 3-5 0-3-1-8-6-8z" />
    <path d="M10 19h4" />
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
          <span>{profile.sex === 'male' ? 'Мужской' : 'Женский'}</span>
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
        
        {/* Цвет волос - отдельная строка */}
        {hairColor && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mb-0.5">
            <HairIcon />
            <span>{hairColor}</span>
          </div>
        )}

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

        {profile.employments && profile.employments.length > 0 && (
        <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mb-0.5">
          <BriefcaseIcon />
          {(() => {
            const currentJob = profile.employments.find(job => job.is_current);
            const otherJobs = profile.employments.filter(job => !job.is_current);
            return (
              <div className="flex items-center gap-1 flex-wrap">
                {currentJob ? (
                  <>
                    <span className="hover:text-blue-400 cursor-pointer" onClick={() => alert(currentJob.profession_name)}>
                      {currentJob.profession_name}
                    </span>
                    {currentJob.company_name && (
                      <>
                        <span className="text-gray-500">|</span>
                        <span className="hover:text-blue-400 cursor-pointer" onClick={() => alert(currentJob.company_name)}>
                          {currentJob.company_name}
                        </span>
                      </>
                    )}
                    <span className="text-green-500">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 12l3 3 6-6" />
                      </svg>
                    </span>
                  </>
                ) : (
                  <span className="hover:text-blue-400 cursor-pointer" onClick={() => alert(profile.employments[0].profession_name)}>
                    {profile.employments[0].profession_name}
                  </span>
                )}
                {otherJobs.length > 0 && (
                  <span className="text-gray-400 text-[9px] cursor-pointer hover:text-white" onClick={() => alert(otherJobs.map(j => j.profession_name).join(', '))}>
                    +{otherJobs.length}
                  </span>
                )}
              </div>
            );
          })()}
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