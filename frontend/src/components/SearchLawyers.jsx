import { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, Marker, Circle } from "@react-google-maps/api";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

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

const radiusOptions = [5, 10, 25, 50, 100,500]; // in kilometers

function SearchLawyers() {
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(10);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);

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
        where("latitude", "<=", lat + latDelta),
        where("longitude", ">=", lng - lngDelta),
        where("longitude", "<=", lng + lngDelta)
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

      lawyersData.sort((a, b) => a.distance - b.distance);
      setLawyers(lawyersData);
    } catch (error) {
      console.error("Error searching lawyers:", error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Find Lawyers Near You</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
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
            
            <div>
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
            
            <div className="flex items-end">
              <button
                onClick={getUserLocation}
                className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition-colors"
              >
                Use My Current Location
              </button>
            </div>
          </div>

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
              {mapLoaded && lawyers.map((lawyer) => (
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

        {/* Rest of the component remains the same */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-gray-600">Searching for lawyers...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-semibold p-4 border-b border-gray-200">
              {lawyers.length} Lawyers Found Within {radius} km
            </h2>
            
            {lawyers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No lawyers found in this area. Try expanding your search radius.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {lawyers.map((lawyer) => (
                  <div key={lawyer.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={lawyer.photoURL || "https://via.placeholder.com/80"}
                          alt={lawyer.name}
                          className="h-20 w-20 rounded-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium text-gray-800">{lawyer.name}</h3>
                        <p className="text-gray-600">{lawyer.qualification}</p>
                        <p className="text-gray-600">{lawyer.yearsOfExperience} years of experience</p>
                        <p className="text-gray-500 text-sm">{lawyer.location}</p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-sm font-medium">
                          {lawyer.distance} km away
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchLawyers;