import React, { useState, useEffect } from 'react';
import LocationSearch from './LocationSearch';

const AddressModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    street: '',
    house: '',
    location_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({ street: '', house: '', location_id: '' });
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
        street: formData.street || null,
        house: formData.house || null,
        location_id: formData.location_id ? parseInt(formData.location_id, 10) : null,
      };
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Ошибка создания адреса');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-black border border-gray-800 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-sm font-light tracking-wider">NEW ADDRESS</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">&times;</button>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Street</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">House</label>
            <input
              type="text"
              name="house"
              value={formData.house}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Location (City)</label>
            <LocationSearch
              value={formData.location_id}
              onChange={(locationId) => setFormData(prev => ({ ...prev, location_id: locationId }))}
              placeholder="Search location by name..."
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

export default AddressModal;