import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, DollarSign, ArrowRight } from 'lucide-react';

export const SearchPanel = ({ className = '', initialValues = {} }) => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState(initialValues.city || '');
  const [checkIn, setCheckIn] = useState(initialValues.checkIn || '');
  const [checkOut, setCheckOut] = useState(initialValues.checkOut || '');
  const [guests, setGuests] = useState(initialValues.guests || 2);
  const [rooms, setRooms] = useState(initialValues.rooms || 1);
  const [maxBudget, setMaxBudget] = useState(initialValues.maxBudget || 600);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  const POPULAR_DESTINATIONS = [
    { city: 'Bangalore', state: 'Karnataka', tag: 'Heritage & Tech' },
    { city: 'Mumbai', state: 'Maharashtra', tag: 'Ocean Suites' },
    { city: 'Goa', state: 'North & South', tag: 'Beachfront Villas' },
    { city: 'Delhi', state: 'NCR', tag: 'Art Deco & Luxury' },
  ];

  const handleSearch = (e) => {
    e?.preventDefault();
    const query = new URLSearchParams();
    if (destination) query.append('city', destination);
    if (checkIn) query.append('checkIn', checkIn);
    if (checkOut) query.append('checkOut', checkOut);
    if (guests) query.append('guests', guests);
    if (rooms) query.append('rooms', rooms);
    if (maxBudget) query.append('maxPrice', maxBudget);

    navigate(`/search?${query.toString()}`);
  };

  return (
    <div className={`bg-white rounded-3xl border border-[#E4DFD5] shadow-luxury-lg p-3 sm:p-4 ${className}`}>
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Destination Field with Autocomplete Dropdown */}
        <div className="md:col-span-4 relative">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#F8F6F0] rounded-2xl border border-transparent focus-within:border-[#C6A66B] transition-colors">
            <MapPin className="w-5 h-5 text-[#C6A66B] shrink-0" />
            <div className="w-full">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A626A]">
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onFocus={() => setShowDestinationSuggestions(true)}
                onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                placeholder="Where to? (e.g. Bangalore, Goa)"
                className="w-full bg-transparent text-sm font-semibold text-[#14251F] focus:outline-none placeholder:text-[#5A626A]/50"
              />
            </div>
          </div>

          {/* Autocomplete Suggestions */}
          {showDestinationSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-[#E4DFD5] shadow-2xl p-2 z-50">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A626A] px-3 py-1.5">
                Curated Luxury Destinations
              </div>
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  type="button"
                  key={dest.city}
                  onMouseDown={() => {
                    setDestination(dest.city);
                    setShowDestinationSuggestions(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl hover:bg-[#F8F6F0] transition-colors"
                >
                  <div>
                    <span className="text-xs font-bold text-[#14251F] block">{dest.city}</span>
                    <span className="text-[10px] text-[#5A626A]">{dest.state}</span>
                  </div>
                  <span className="text-[10px] text-[#C6A66B] font-semibold bg-[#F4EEDA] px-2 py-0.5 rounded-full">
                    {dest.tag}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Selection */}
        <div className="md:col-span-3">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#F8F6F0] rounded-2xl border border-transparent focus-within:border-[#C6A66B] transition-colors">
            <Calendar className="w-5 h-5 text-[#C6A66B] shrink-0" />
            <div className="w-full">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A626A]">
                Check-in / Out
              </label>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#14251F]">
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="bg-transparent focus:outline-none text-xs w-28"
                />
                <span className="text-[#5A626A]">→</span>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="bg-transparent focus:outline-none text-xs w-28"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Guests & Budget */}
        <div className="md:col-span-3">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#F8F6F0] rounded-2xl border border-transparent focus-within:border-[#C6A66B] transition-colors">
            <Users className="w-5 h-5 text-[#C6A66B] shrink-0" />
            <div className="w-full">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A626A]">
                Occupancy & Budget
              </label>
              <div className="flex items-center justify-between text-xs font-semibold text-[#14251F]">
                <span>{guests} Guests, {rooms} Room</span>
                <span className="text-[11px] text-[#0D8A5E]">Up to ${maxBudget}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full h-full py-3.5 px-4 bg-[#C6A66B] hover:bg-[#B5955A] text-[#14251F] font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-luxury-gold flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchPanel;
