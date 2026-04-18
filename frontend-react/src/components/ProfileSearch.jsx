import React, { useState, useEffect, useRef } from 'react';

const ProfileSearch = ({ value, onChange, placeholder = "Search profile..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProfiles = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/profiles/?search=${encodeURIComponent(query)}&limit=10`);
        const data = await res.json();
        setResults(data || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Error searching profiles:', error);
      } finally {
        setLoading(false);
      }
    };
    const delay = setTimeout(searchProfiles, 300);
    return () => clearTimeout(delay);
  }, [query]);

  const handleSelect = (profile) => {
    const fullName = [profile.last_name, profile.first_name, profile.middle_name].filter(Boolean).join(' ');
    onChange(profile.id, fullName, profile.sex);
    setQuery(fullName);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-black border border-gray-800 rounded shadow-lg max-h-48 overflow-y-auto">
          {results.map(profile => {
            const fullName = [profile.last_name, profile.first_name, profile.middle_name].filter(Boolean).join(' ') || `ID ${profile.id}`;
            return (
              <div
                key={profile.id}
                className="px-3 py-2 hover:bg-gray-800 cursor-pointer text-sm"
                onClick={() => handleSelect(profile)}
              >
                {fullName} (id {profile.id})
              </div>
            );
          })}
        </div>
      )}
      {isOpen && !loading && results.length === 0 && query.trim() && (
        <div className="absolute z-10 w-full mt-1 bg-black border border-gray-800 rounded p-2 text-xs text-gray-500">
          No profiles found
        </div>
      )}
    </div>
  );
};

export default ProfileSearch;