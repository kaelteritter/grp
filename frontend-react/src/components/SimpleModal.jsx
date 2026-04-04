import React, { useState, useEffect } from 'react';

const SimpleModal = ({ isOpen, onClose, onSave, title, fields }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Сброс формы при открытии
      const initialData = {};
      fields.forEach(field => {
        initialData[field.name] = '';
      });
      setFormData(initialData);
      setError('');
    }
  }, [isOpen, fields]);

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
      // Подготовка данных - преобразование числовых полей
      const submitData = {};
      for (const [key, value] of Object.entries(formData)) {
        if (value === '' || value === null || value === undefined) {
          submitData[key] = null;
        } else if (fields.find(f => f.name === key && f.type === 'number')) {
          submitData[key] = parseFloat(value);
        } else {
          submitData[key] = value;
        }
      }
      
      await onSave(submitData);
      onClose();
    } catch (err) {
      setError(err.message || 'Ошибка создания');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-black border border-gray-800 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-sm font-light tracking-wider">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl transition">&times;</button>
        </div>
        
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-xs rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                {field.label}
              </label>
              
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600 transition"
                  required={field.required}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600 transition"
                  rows={3}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-gray-800 py-2 text-sm focus:outline-none focus:border-gray-600 transition"
                  placeholder={field.placeholder}
                  required={field.required}
                  step={field.type === 'number' ? 'any' : undefined}
                />
              )}
              
              {field.description && (
                <p className="text-[9px] text-gray-600 mt-1">{field.description}</p>
              )}
            </div>
          ))}
          
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 text-sm py-2 text-gray-500 hover:text-white transition"
            >
              CANCEL
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 text-sm py-2 bg-white text-black hover:bg-gray-200 transition disabled:opacity-50"
            >
              {loading ? 'CREATING...' : 'CREATE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleModal;