import { useState, useEffect, useRef } from "react";
import { useFirebase } from "../context/firebase";
import { serverTimestamp, doc, setDoc, getFirestore } from "firebase/firestore";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_MAP_API_KEY;

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090,
};

function ProfileSetup({ user, onComplete }) {
  const { uploadProfileImage } = useFirebase();
  const db = getFirestore();
  
  const [formData, setFormData] = useState({
    name: user.displayName || "",
    email: user.email || "",
    photoURL: user.photoURL || "",
    age: "",
    gender: "",
    location: "",
    latitude: defaultCenter.lat,
    longitude: defaultCenter.lng,
    profileImage: null,
    type: user.type || "user",
  });

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    getUserLocation();
    if (window.google) {
      initializeAutocomplete();
    }
  }, []);

  useEffect(() => {
    if (searchInputRef.current && window.google) {
      initializeAutocomplete();
    }
  }, [window.google]);

  const initializeAutocomplete = () => {
    if (searchInputRef.current && !autocompleteRef.current) {
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
  };

  const handlePlaceSelect = (place) => {
    const location = place.geometry.location;
    setFormData({
      ...formData,
      latitude: location.lat(),
      longitude: location.lng(),
      location: place.formatted_address,
    });
  };

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateLocation(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          updateLocation(defaultCenter.lat, defaultCenter.lng);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      updateLocation(defaultCenter.lat, defaultCenter.lng);
    }
  };

  const updateLocation = (latitude, longitude) => {
    setFormData(prevData => ({
      ...prevData,
      latitude,
      longitude,
    }));
    fetchLocationDetails(latitude, longitude);
  };

  const fetchLocationDetails = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setFormData(prevData => ({
          ...prevData,
          location: data.results[0].formatted_address,
        }));
      }
    } catch (error) {
      console.error("Error fetching location details:", error);
    }
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    updateLocation(lat, lng);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleChange = (e) => {
    if (e.target.name === "profileImage") {
      setFormData({
        ...formData,
        [e.target.name]: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let photoURL = formData.photoURL;

      // Upload profile image if selected
      if (formData.profileImage) {
        photoURL = await uploadProfileImage(user.uid, formData.profileImage);
      }

      // Prepare user data
      const userData = {
        uid: user.uid,
        email: formData.email,
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        location: formData.location,
        coordinates: {
          latitude: formData.latitude,
          longitude: formData.longitude
        },
        photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        type: "user",
      };

      // Reference to the user document
      const userDocRef = doc(db, "users", user.uid);
      
      // Set/update the document
      await setDoc(userDocRef, userData, { merge: true });

      onComplete(); // Proceed after successful save
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white py-6 px-6 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5 shadow-md rounded-xl border border-gray-200">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Complete Your Profile</h2>
          <p className="text-sm text-gray-500">We need a few details to get started</p>
        </div>
        
        {/* Form */}
        <div className="space-y-4">
          {/* Full Name Field */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full p-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
  
          {/* Age and Gender Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="25"
                className="w-full p-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
  
          {/* Location Section */}
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-xs font-medium text-gray-700">Location</label>
              <button
                onClick={getUserLocation}
                className="text-xs text-teal-600 hover:text-teal-800 flex items-center"
              >
                <svg className="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Use Current
              </button>
            </div>
            <div className="relative mt-1 mb-1">
              <input
                type="text"
                ref={searchInputRef}
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for your location"
                className="w-full p-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none pl-10"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {formData.location || "Fetching your location..."}
            </p>
          </div>
  
          {/* Google Map */}
          <div className="rounded-md overflow-hidden h-36 border border-gray-200">
            <LoadScript
              googleMapsApiKey={GOOGLE_MAPS_API_KEY}
              libraries={["places"]}
              onLoad={() => {
                if (searchInputRef.current && !autocompleteRef.current && window.google) {
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
              }}
            >
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={{ lat: formData.latitude, lng: formData.longitude }}
                zoom={10}
                onClick={handleMapClick}
              >
                <Marker position={{ lat: formData.latitude, lng: formData.longitude }} />
              </GoogleMap>
            </LoadScript>
          </div>
  
          {/* Profile Image Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Profile Image</label>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden flex-shrink-0">
                {formData.profileImage ? (
                  <img 
                    src={URL.createObjectURL(formData.profileImage)} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-6 h-6 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  name="profileImage"
                  id="profileImage"
                  onChange={handleChange}
                  className="hidden"
                />
                <label 
                  htmlFor="profileImage"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                >
                  <svg className="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Choose Image
                </label>
              </div>
            </div>
          </div>
        </div>
  
        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-all text-sm font-medium flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save Profile"
          )}
        </button>
      </div>
    </div>
  );
}

export default ProfileSetup;
