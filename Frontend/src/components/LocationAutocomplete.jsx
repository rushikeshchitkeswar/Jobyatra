import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { citiesData } from '../data/citiesData';

const LocationAutocomplete = ({ value, onChange, placeholder = "Location", icon: Icon = MapPin }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownStyles, setDropdownStyles] = useState({});
  const wrapperRef = useRef(null);
  const inputContainerRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Update dropdown position
  const updatePosition = () => {
    if (inputContainerRef.current) {
      const rect = inputContainerRef.current.getBoundingClientRect();
      setDropdownStyles({
        top: `${rect.bottom + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        width: `${rect.width}px`,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestions = (input) => {
    if (!input || input.length < 1) return [];

    const normalizedInput = input.toLowerCase().trim();

    // Rule: Prioritize cities that START with the typed input
    const startsWithMatches = citiesData.filter(item =>
      item.city.toLowerCase().startsWith(normalizedInput)
    ).sort((a, b) => b.popularity - a.popularity);

    // Rule: Include closely related matches (contains) if not in startsWith
    const containsMatches = citiesData.filter(item =>
      item.city.toLowerCase().includes(normalizedInput) &&
      !item.city.toLowerCase().startsWith(normalizedInput)
    ).sort((a, b) => b.popularity - a.popularity);

    const combined = [...startsWithMatches, ...containsMatches];

    // Limit to top 10
    return combined.slice(0, 10);
  };

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    onChange(newVal);

    const filtered = getSuggestions(newVal);
    setSuggestions(filtered);
    setIsOpen(filtered.length > 0);
    setActiveIndex(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    const formatted = suggestion.state
      ? `${suggestion.city}, ${suggestion.state}, ${suggestion.country}`
      : `${suggestion.city}, ${suggestion.country}`;

    setInputValue(formatted);
    onChange(formatted);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSuggestionClick(suggestions[activeIndex]);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const dropdownMenu = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 4, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          style={{
            position: 'absolute',
            ...dropdownStyles,
            zIndex: 9999,
          }}
          className="bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.city}-${suggestion.state}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${index === activeIndex ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className={`p-2 rounded-lg ${index === activeIndex ? 'bg-white' : 'bg-slate-100'}`}>
                  <MapPin size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">
                    {suggestion.city}
                    <span className="text-slate-400 font-normal">
                      {suggestion.state ? `, ${suggestion.state}` : ''}, {suggestion.country}
                    </span>
                  </span>
                </div>
                {suggestion.popularity > 80 && (
                  <span className="ml-auto text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Popular
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={wrapperRef} className="relative flex-3 w-full group/loc">
      <div ref={inputContainerRef} className="flex items-center px-4 flex-1 w-full h-full">
        <Icon className="text-slate-400 mr-3 group-hover/loc:text-primary transition-colors" size={20} />
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            const filtered = getSuggestions(inputValue);
            if (filtered.length > 0) {
              setSuggestions(filtered);
              setIsOpen(true);
            }
          }}
          className="border-none outline-none w-full text-base font-bold text-slate-900 bg-transparent placeholder:text-slate-400 py-4"
        />
      </div>

      {createPortal(dropdownMenu, document.body)}
    </div>
  );
};

export default LocationAutocomplete;

