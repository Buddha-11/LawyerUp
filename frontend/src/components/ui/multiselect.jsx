import React, { useState, useRef, useEffect } from 'react';

const MultiSelect = ({ options, value, onChange, label, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(value || []);
  const dropdownRef = useRef(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    let newSelection;
    
    if (selectedOptions.includes(option)) {
      newSelection = selectedOptions.filter(item => item !== option);
    } else {
      newSelection = [...selectedOptions, option];
    }
    
    setSelectedOptions(newSelection);
    onChange({ target: { name, value: newSelection } });
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative" ref={dropdownRef}>
        <div
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm bg-white flex flex-wrap items-center min-h-10 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option, index) => (
              <span 
                key={option} 
                className="bg-teal-100 text-teal-800 text-sm rounded-full px-2 py-1 m-1 flex items-center"
              >
                {option}
                <button
                  type="button"
                  className="ml-1 text-teal-600 hover:text-teal-800 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option);
                  }}
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400">Select options...</span>
          )}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
            {options.map((option) => (
              <div
                key={option}
                className={`p-2 hover:bg-gray-100 cursor-pointer ${
                  selectedOptions.includes(option) ? 'bg-teal-50' : ''
                }`}
                onClick={() => toggleOption(option)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    checked={selectedOptions.includes(option)}
                    onChange={() => {}}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="ml-2">{option}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;