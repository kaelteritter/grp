import React, { useState, useEffect, useRef } from 'react';

const LocationSearch = ({ value, onChange, placeholder = "Search location..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasLoadedDefault, setHasLoadedDefault] = useState(false);
  const wrapperRef = useRef(null);

  // Загружаем название локации, если передан ID (при редактировании)
  useEffect(() => {
    if (value) {
      fetch(`http://localhost:8000/api/v1/locations/${value}`)
        .then(res => res.json())
        .then(data => setQuery(data.name))
        .catch(console.error);
    }
  }, [value]);

  // Поиск при вводе (с debounce)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query);
      } else if (query === '') {
        // Если поле пустое, очищаем результаты, но не закрываем список
        setResults([]);
        setIsOpen(false);
        setHasLoadedDefault(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/locations/?search=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await res.json();
      setResults(data);
      setIsOpen(true);
      setHasLoadedDefault(false);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/locations/?limit=20`);
      const data = await res.json();
      setResults(data);
      setIsOpen(true);
      setHasLoadedDefault(true);
    } catch (error) {
      console.error('Error loading default locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = () => {
    // Если поле пустое и ещё не загружали дефолтный список
    if (!hasLoadedDefault && query === '') {
      loadDefaultLocations();
    } else if (query === '' && results.length === 0 && !loading) {
      loadDefaultLocations();
    }
  };

  const handleSelect = (location) => {
    setQuery(location.name);
    onChange(location.id);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    if (newValue === '') {
      onChange(null);
      setHasLoadedDefault(false);
      setResults([]);
      setIsOpen(false);
    }
  };

  // Закрыть список при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600 transition"
      />
      {loading && (
        <div className="absolute z-10 w-full bg-black border border-gray-800 mt-1 max-h-60 overflow-auto">
          <div className="p-2 text-gray-500 text-sm">Loading...</div>
        </div>
      )}
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full bg-black border border-gray-800 mt-1 max-h-60 overflow-auto">
          {results.map(location => (
            <div
              key={location.id}
              onClick={() => handleSelect(location)}
              className="p-2 hover:bg-gray-800 cursor-pointer text-sm"
            >
              <div className="flex items-start gap-2">
                <span className="text-gray-400"></span>
                <div>
                  <div className="text-white">{location.name}</div>
                  {location.region && (
                    <div className="text-gray-500 text-xs">
                      {location.region.name}
                      {location.region.country && `, ${location.region.country.name}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {isOpen && results.length === 0 && !loading && (
        <div className="absolute z-10 w-full bg-black border border-gray-800 mt-1">
          <div className="p-2 text-gray-500 text-sm">No locations found</div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;