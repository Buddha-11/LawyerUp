import { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, Marker, Circle } from "@react-google-maps/api";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import MultiSelect from "./ui/multiselect";
import LawyerCard from "./LawyerCard";
import Navbar from "./Navbar";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_MAP_API_KEY;

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "8px",
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090,
};

const radiusOptions = [5, 10, 25, 50, 100, 500]; // in kilometers
const practiceOptions = ["Civil", "Criminal", "Corporate", "Family", "Property", "Labor"];

function SearchLawyers() {
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(10);
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  
  // Filter states
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [genderFilter, setGenderFilter] = useState("");
  const [experienceMin, setExperienceMin] = useState("");
  const [experienceMax, setExperienceMax] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [sortOrder, setSortOrder] = useState("asc");

  // Initialize Google Places Autocomplete when map is loaded
  useEffect(() => {
    if (mapLoaded && searchInputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        searchInputRef.current,
        { types: ["geocode"] }
      );
      
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry) {
          handlePlaceSelect(place);
        }
      });
    }
  }, [mapLoaded]);

  // Get user's current location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Apply filters whenever lawyers or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [
    lawyers, 
    selectedTypes, 
    genderFilter, 
    experienceMin, 
    experienceMax, 
    priceMin, 
    priceMax,
    sortBy,
    sortOrder
  ]);

  const getUserLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          searchLawyers(latitude, longitude, radius);
        },
        (error) => {
          console.error("Error getting location:", error);
          searchLawyers(defaultCenter.lat, defaultCenter.lng, radius);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      searchLawyers(defaultCenter.lat, defaultCenter.lng, radius);
    }
  };

  const handlePlaceSelect = (place) => {
    const location = place.geometry.location;
    setUserLocation({
      lat: location.lat(),
      lng: location.lng(),
    });
    setSearchQuery(place.formatted_address);
    searchLawyers(location.lat(), location.lng(), radius);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value);
    setRadius(newRadius);
    searchLawyers(userLocation.lat, userLocation.lng, newRadius);
  };

  const handleMapClick = (e) => {
    if (!mapLoaded) return;
    
    const newLocation = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setUserLocation(newLocation);
    searchLawyers(newLocation.lat, newLocation.lng, radius);
  };

  const handleTypeChange = (e) => {
    setSelectedTypes(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const searchLawyers = async (lat, lng, radiusKm) => {
    setLoading(true);
    try {
      const db = getFirestore();
      
      // Convert kilometers to meters (Firestore uses meters)
      const radiusMeters = radiusKm * 1000;
      
      // Approximate degree distances
      const latDelta = radiusKm / 111.32;
      const lngDelta = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180));
      
      const lawyersRef = collection(db, "lawyers");
      const q = query(
        lawyersRef,
        where("latitude", ">=", lat - latDelta),
        where("latitude", "<=", lat + latDelta)
      );

      const querySnapshot = await getDocs(q);
      const lawyersData = [];
      
      querySnapshot.forEach((doc) => {
        const lawyer = doc.data();
        const distance = calculateDistance(lat, lng, lawyer.latitude, lawyer.longitude);
        if (distance <= radiusKm) {
          lawyersData.push({
            ...lawyer,
            id: doc.id,
            distance: distance.toFixed(1),
          });
        }
      });

      setLawyers(lawyersData);
    } catch (error) {
      console.error("Error searching lawyers:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...lawyers];
    
    // Filter by practice type
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(lawyer => {
        // Check if there's overlap between selected types and lawyer's types
        return selectedTypes.some(type => lawyer.type && lawyer.type.includes(type));
      });
    }
    
    // Filter by gender
    if (genderFilter) {
      filtered = filtered.filter(lawyer => lawyer.gender === genderFilter);
    }
    
    // Filter by experience
    if (experienceMin) {
      filtered = filtered.filter(lawyer => parseInt(lawyer.yearsOfExperience) >= parseInt(experienceMin));
    }
    if (experienceMax) {
      filtered = filtered.filter(lawyer => parseInt(lawyer.yearsOfExperience) <= parseInt(experienceMax));
    }
    
    // Filter by price
    if (priceMin) {
      filtered = filtered.filter(lawyer => parseFloat(lawyer.consultationFees) >= parseFloat(priceMin));
    }
    if (priceMax) {
      filtered = filtered.filter(lawyer => parseFloat(lawyer.consultationFees) <= parseFloat(priceMax));
    }
    
    // Sort results
    if (sortBy === "distance") {
      filtered.sort((a, b) => {
        return sortOrder === "asc" 
          ? parseFloat(a.distance) - parseFloat(b.distance)
          : parseFloat(b.distance) - parseFloat(a.distance);
      });
    } else if (sortBy === "price") {
      filtered.sort((a, b) => {
        return sortOrder === "asc"
          ? parseFloat(a.consultationFees || 0) - parseFloat(b.consultationFees || 0)
          : parseFloat(b.consultationFees || 0) - parseFloat(a.consultationFees || 0);
      });
    } else if (sortBy === "experience") {
      filtered.sort((a, b) => {
        return sortOrder === "asc"
          ? parseInt(a.yearsOfExperience || 0) - parseInt(b.yearsOfExperience || 0)
          : parseInt(b.yearsOfExperience || 0) - parseInt(a.yearsOfExperience || 0);
      });
    }
    
    setFilteredLawyers(filtered);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const renderMarkerIcon = () => {
    if (!mapLoaded) return null;
    
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#059669",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "#ffffff",
    };
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setGenderFilter("");
    setExperienceMin("");
    setExperienceMax("");
    setPriceMin("");
    setPriceMax("");
    setSortBy("distance");
    setSortOrder("asc");
  };

  const mapOptions = {
    styles: [
      {
        featureType: "all",
        elementType: "geometry",
        stylers: [{ color: "#f5f5f5" }]
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#c9d6de" }]
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#ffffff" }]
      },
      {
        featureType: "poi",
        elementType: "geometry",
        stylers: [{ color: "#e8f0f5" }]
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#c5e6c0" }]
      }
    ],
    disableDefaultUI: true,
    zoomControl: true,
    scaleControl: true,
    rotateControl: false,
    fullscreenControl: false
  };

  // Function to view lawyer profile details
  const viewLawyerProfile = (lawyerId) => {
    // Navigate to lawyer profile page
    window.location.href = `/lawyer-profile/${lawyerId}`;
  };

  // Function to book appointment with lawyer
  const bookAppointment = (lawyerId) => {
    // Navigate to appointment booking page
    window.location.href = `/book-appointment/${lawyerId}`;
  };
  console.log();
  

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 p-4 md:p-6">Find Lawyers Near You</h1>
        
        <div className="p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Location</label>
                <input
                  type="text"
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Enter a location"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={getUserLocation}
                  className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Use My Current Location
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar with filters */}
            <div className="md:w-1/3 lg:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Radius</label>
                  <select
                    value={radius}
                    onChange={handleRadiusChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  >
                    {radiusOptions.map((option) => (
                      <option key={option} value={option}>
                        Within {option} km
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <MultiSelect
                    name="type"
                    label="Practice Areas"
                    options={practiceOptions}
                    value={selectedTypes}
                    onChange={handleTypeChange}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Any</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={experienceMin}
                      onChange={(e) => setExperienceMin(e.target.value)}
                      className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={experienceMax}
                      onChange={(e) => setExperienceMax(e.target.value)}
                      className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={sortBy}
                      onChange={handleSortChange}
                      className="w-3/4 p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="distance">Distance</option>
                      <option value="price">Price</option>
                      <option value="experience">Experience</option>
                    </select>
                    <button 
                      onClick={toggleSortOrder}
                      className="flex-1 p-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      {sortOrder === "asc" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={resetFilters}
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
              
              {/* Map in sidebar */}
              <div className="bg-white rounded-lg shadow-md p-4 hidden md:block">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Map View</h2>
                <LoadScript 
                  googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                  libraries={["places"]}
                  onLoad={() => setMapLoaded(true)}
                >
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={userLocation}
                    zoom={12}
                    onClick={handleMapClick}
                    onLoad={(map) => setMap(map)}
                    options={mapOptions}
                  >
                    {/* User location marker */}
                    {mapLoaded && (
                      <Marker
                        position={userLocation}
                        icon={renderMarkerIcon()}
                      />
                    )}
                    
                    {/* Search radius circle */}
                    {mapLoaded && (
                      <Circle
                        center={userLocation}
                        radius={radius * 1000}
                        options={{
                          fillColor: "#10B981",
                          fillOpacity: 0.2,
                          strokeColor: "#059669",
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                        }}
                      />
                    )}
                    
                    {/* Lawyer markers */}
                    {mapLoaded && filteredLawyers.map((lawyer) => (
                      <Marker
                        key={lawyer.id}
                        position={{ lat: lawyer.latitude, lng: lawyer.longitude }}
                        onClick={() => {
                          if (map) {
                            map.panTo({ lat: lawyer.latitude, lng: lawyer.longitude });
                            map.setZoom(15);
                          }
                        }}
                      />
                    ))}
                  </GoogleMap>
                </LoadScript>
              </div>
            </div>
            
            {/* Main content - Lawyer listings */}
            <div className="md:w-2/3 lg:w-3/4">
              {/* Map for mobile view */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6 md:hidden">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Map View</h2>
                <LoadScript 
                  googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                  libraries={["places"]}
                  onLoad={() => setMapLoaded(true)}
                >
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={userLocation}
                    zoom={12}
                    onClick={handleMapClick}
                    onLoad={(map) => setMap(map)}
                    options={mapOptions}
                  >
                    {/* User location marker */}
                    {mapLoaded && (
                      <Marker
                        position={userLocation}
                        icon={renderMarkerIcon()}
                      />
                    )}
                    
                    {/* Search radius circle */}
                    {mapLoaded && (
                      <Circle
                        center={userLocation}
                        radius={radius * 1000}
                        options={{
                          fillColor: "#10B981",
                          fillOpacity: 0.2,
                          strokeColor: "#059669",
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                        }}
                      />
                    )}
                    
                    {/* Lawyer markers */}
                    {mapLoaded && filteredLawyers.map((lawyer) => (
                      <Marker
                        key={lawyer.id}
                        position={{ lat: lawyer.latitude, lng: lawyer.longitude }}
                        onClick={() => {
                          if (map) {
                            map.panTo({ lat: lawyer.latitude, lng: lawyer.longitude });
                            map.setZoom(15);
                          }
                        }}
                      />
                    ))}
                  </GoogleMap>
                </LoadScript>
              </div>
            
              {loading ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
                  <p className="mt-2 text-gray-600">Searching for lawyers...</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <h2 className="text-xl font-semibold p-4 bg-teal-50 border-b border-gray-200 flex justify-between items-center">
                    <span className="text-teal-700">{filteredLawyers.length} Lawyers Found</span>
                    <span className="text-sm bg-teal-100 text-teal-800 px-3 py-1 rounded-full">Within {radius} km</span>
                  </h2>
                  
                  {filteredLawyers.length === 0 ? (
                    <div className="p-8 text-center">
                      {/* ... SVG and messages ... */}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredLawyers.map((lawyer) => (
                        <LawyerCard key={lawyer.id} lawyer={lawyer} />
                      ))}
                    </div>
                  )}
                  
                  {filteredLawyers.length > 5 && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-center">
                      <button className="px-4 py-2 flex items-center text-teal-600 hover:text-teal-800 font-medium text-sm transition-colors">
                        Show more lawyers
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>  
          </div>
        </div>
      </div>
    </div>
  );
}
export default SearchLawyers;
