import React, { useState, useEffect, useRef } from 'react';

const SearchBar = ({ value, onChange, placeholder }) => {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimer = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="relative flex-1 max-w-md mx-4">
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-gray-900 border border-gray-700 rounded-full py-1.5 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition"
      />
      {localValue && (
        <button
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;