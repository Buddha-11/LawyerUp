import { useState, useEffect, useRef } from "react";
import { useFirebase } from "../context/firebase";
import { serverTimestamp, doc, setDoc,getFirestore } from "firebase/firestore";
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
  const { uploadProfileImage, } = useFirebase();
  const db=getFirestore();
  
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
    <div className="flex flex-col items-center justify-center min-h-screen pt-20">
      <div className="bg-white py-14 px-12 w-full sm:w-2/3 lg:w-1/2 shadow-2xl rounded-3xl border border-gray-200 hover:shadow-3xl transition-shadow duration-300">
        <h2 className="text-4xl font-semibold mb-2 text-center text-black tracking-wide whitespace-nowrap">Complete Your Profile</h2>
        <p className="text-center text-gray-500 mb-8">Fill in the details to proceed</p>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 focus:outline-none shadow-sm"
        />

        <div className="flex gap-4 mb-4">
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            className="w-1/2 p-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 focus:outline-none shadow-sm"
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-1/2 p-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 focus:outline-none shadow-sm"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-black text-sm mb-1">Search Location:</label>
          <input
            type="text"
            ref={searchInputRef}
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for your location"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 focus:outline-none shadow-sm"
          />
        </div>

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
            mapContainerStyle={mapContainerStyle}
            center={{ lat: formData.latitude, lng: formData.longitude }}
            zoom={10}
            onClick={handleMapClick}
          >
            <Marker position={{ lat: formData.latitude, lng: formData.longitude }} />
          </GoogleMap>
        </LoadScript>


        <div className="flex justify-between items-center mt-2 mb-4">
          <p className="text-sm text-gray-600">
            Selected Location: {formData.location || "Fetching your location..."}
          </p>
          <button
            onClick={getUserLocation}
            className="text-sm text-teal-600 hover:text-teal-800 font-medium"
          >
            Use Current Location
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-black text-sm mb-2">Upload Profile Image:</label>
          <input
            type="file"
            name="profileImage"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 focus:outline-none shadow-sm"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-all font-semibold shadow-lg hover:shadow-xl"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

export default ProfileSetup;