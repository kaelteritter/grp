import React, { useState, useEffect, useRef } from 'react';

const MultiClothSearch = ({ value, onChange, placeholder = "Search clothes..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedClothes, setSelectedClothes] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value && value.length) {
      Promise.all(value.map(id => fetch(`http://localhost:8000/api/v1/clothes/${id}`).then(r => r.json())))
        .then(clothes => setSelectedClothes(clothes))
        .catch(console.error);
    } else {
      setSelectedClothes([]);
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
      const res = await fetch(`http://localhost:8000/api/v1/clothes/?search=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await res.json();
      setResults(data);
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (cloth) => {
    if (!selectedClothes.find(c => c.id === cloth.id)) {
      const newSelected = [...selectedClothes, cloth];
      setSelectedClothes(newSelected);
      onChange(newSelected.map(c => c.id));
    }
    setQuery('');
    setIsOpen(false);
  };

  const removeCloth = (clothId) => {
    const newSelected = selectedClothes.filter(c => c.id !== clothId);
    setSelectedClothes(newSelected);
    onChange(newSelected.map(c => c.id));
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
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedClothes.map(cloth => (
          <div key={cloth.id} className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1 text-xs">
            <span>{cloth.name} ({cloth.color}, {cloth.material})</span>
            <button onClick={() => removeCloth(cloth.id)} className="text-gray-400 hover:text-white">✖</button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
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
          {results.map(cloth => (
            <div
              key={cloth.id}
              onClick={() => handleSelect(cloth)}
              className="p-2 hover:bg-gray-800 cursor-pointer text-sm"
            >
              <div className="text-white">{cloth.name}</div>
              <div className="text-gray-500 text-xs">{cloth.color}, {cloth.material}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiClothSearch;