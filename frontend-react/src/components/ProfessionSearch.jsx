import React, { useState, useEffect, useRef } from 'react';

const ProfessionSearch = ({ value, onChange, placeholder = "Search profession..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value) {
      fetch(`http://localhost:8000/api/v1/professions/${value}`)
        .then(res => res.json())
        .then(data => setQuery(data.name))
        .catch(console.error);
    }
  }, [value]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/professions/?search=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await res.json();
      setResults(data);
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (profession) => {
    setQuery(profession.name);
    onChange(profession.id);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value === '') {
      onChange(null);
    }
  };

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
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600 transition"
      />
      {loading && (
        <div className="absolute z-10 w-full bg-black border border-gray-800 mt-1 max-h-60 overflow-auto">
          <div className="p-2 text-gray-500 text-sm">Loading...</div>
        </div>
      )}
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full bg-black border border-gray-800 mt-1 max-h-60 overflow-auto">
          {results.map(profession => (
            <div
              key={profession.id}
              onClick={() => handleSelect(profession)}
              className="p-2 hover:bg-gray-800 cursor-pointer text-sm"
            >
              <div className="text-white">{profession.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfessionSearch;