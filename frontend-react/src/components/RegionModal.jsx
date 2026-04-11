import React, { useState, useEffect } from 'react';
import CountrySearch from './CountrySearch';

const RegionModal = ({ isOpen, onClose, onSave, countries }) => {
  const [formData, setFormData] = useState({ name: '', country_id: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', country_id: '' });
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        name: formData.name,
        country_id: formData.country_id ? parseInt(formData.country_id, 10) : null,
      };
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Ошибка создания региона');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-black border border-gray-800 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-sm font-light tracking-wider">NEW REGION</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">&times;</button>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Country</label>
            <CountrySearch
              value={formData.country_id}
              onChange={(countryId) => setFormData(prev => ({ ...prev, country_id: countryId }))}
              placeholder="Search country by name..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button type="button" onClick={onClose} className="flex-1 text-sm py-2 text-gray-500 hover:text-white">CANCEL</button>
            <button type="submit" disabled={loading} className="flex-1 text-sm py-2 bg-white text-black hover:bg-gray-200 disabled:opacity-50">
              {loading ? 'CREATING...' : 'CREATE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegionModal;