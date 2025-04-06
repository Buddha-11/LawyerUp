import { useState, useEffect, useRef } from "react";
import { useFirebase } from "../context/firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import MultiSelect from "./ui/multiselect";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_MAP_API_KEY;

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090,
};

const practiceOptions = ["Civil", "Criminal", "Corporate", "Family", "Property", "Labor"];

function LawyerProfileSetup({ user, onComplete }) {
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
    yearsOfExperience: "",
    qualification: "",
    contact: "",
    consultationFees: "",
    type: [],
    profileImage: null,
    degreeImage: null,
  });

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [map, setMap] = useState(null);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    // Automatically fetch the user's current location
    getUserLocation();

    // Initialize Google Places Autocomplete when script is loaded
    if (window.google) {
      initializeAutocomplete();
    }
  }, []);

  useEffect(() => {
    // Re-initialize autocomplete if search input ref exists and Google is loaded
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
          // Fallback to default location if geolocation fails
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let photoURL = formData.photoURL;
      let degreeImageURL = null;

      if (formData.profileImage) {
        photoURL = await uploadProfileImage(user.uid, formData.profileImage);
      }

      if (formData.degreeImage) {
        degreeImageURL = await uploadProfileImage(user.uid, formData.degreeImage);
      }

      await setDoc(
        doc(db, "lawyers", user.uid),
        {
          firebaseId: user.uid,
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          contact: formData.contact,
          consultationFees: formData.consultationFees,
          location: formData.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
          yearsOfExperience: formData.yearsOfExperience,
          qualification: formData.qualification,
          type: formData.type,
          // rating: formData.rating,
          photoURL,
          degreeImageURL,
        },
        { merge: true }
      );

      onComplete();
    } catch (error) {
      console.error("Error updating lawyer profile:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center min-h-screen pt-10">
      <div className="bg-white p-8 w-full sm:w-2/3 lg:w-1/2 shadow-2xl rounded-3xl border border-gray-200">
        <h2 className="text-3xl font-semibold text-center mb-2">Complete Lawyer Profile</h2>
        <p className="text-center text-gray-500 mb-6">Fill in the details to proceed</p>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 shadow-sm"
        />

        <div className="flex gap-4 mb-3">
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            className="w-1/2 p-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 shadow-sm"
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-1/2 p-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 shadow-sm"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex gap-4 mb-3">
          <input
            type="tel"
            name="contact"
            placeholder="Contact Number"
            value={formData.contact}
            onChange={handleChange}
            className="w-1/2 p-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 shadow-sm"
          />

          <input
            type="number"
            name="consultationFees"
            placeholder="Consultation Fees"
            value={formData.consultationFees}
            onChange={handleChange}
            className="w-1/2 p-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 shadow-sm"
          />
        </div>

        <div className="mb-3">
          <label className="block text-black text-sm mb-1">Search Location:</label>
          <input
            type="text"
            ref={searchInputRef}
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for your location"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 shadow-sm"
          />
        </div>

        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: formData.latitude, lng: formData.longitude }}
            zoom={10}
            onClick={handleMapClick}
            onLoad={(map) => setMap(map)}
          >
            <Marker position={{ lat: formData.latitude, lng: formData.longitude }} />
          </GoogleMap>
        </LoadScript>

        <div className="flex justify-between items-center mt-2 mb-3">
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
        <div className="flex gap-4 mb-3">
          <input
            type="number"
            name="yearsOfExperience"
            placeholder="Years of Experience"
            value={formData.yearsOfExperience}
            onChange={handleChange}
            className="w-1/2 p-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 shadow-sm"
          />

          <input
            type="text"
            name="qualification"
            placeholder="Qualification"
            value={formData.qualification}
            onChange={handleChange}
            className="w-1/2 p-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 shadow-sm"
          />
        </div>
        

        {/* <label className="block text-sm font-medium text-gray-700 mb-2">Practice Type(s):</label>
        <div className="relative">
          <select
            name="practiceTypes"
            multiple
            value={formData.practiceTypes}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
              setFormData({ ...formData, practiceTypes: selected });
            }}
            className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm bg-white appearance-none"
            size="2"
          >
            <option value="Civil">Civil</option>
            <option value="Criminal">Criminal</option>
            <option value="Corporate">Corporate</option>
            <option value="Family">Family</option>
            <option value="Property">Property</option>
            <option value="Labor">Labor</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div> */}
        <MultiSelect
          name="type" // Change from "practiceTypes" to "type" to match your database field
          label="Practice Type(s):"
          options={practiceOptions}
          value={formData.type} // Change from formData.practiceTypes to formData.type
          onChange={handleChange}
        />
        {/* <div className="mb-3">
          <label className="block text-black text-sm mb-1">Rating (Based on user reviews):</label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            readOnly
            min={0}
            max={5}
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 shadow-sm"
          />
        </div> */}

        {[
          { label: "Upload Profile Image", name: "profileImage" },
          { label: "Upload Degree Certificate", name: "degreeImage" },
        ].map(({ label, name }) => (
          <div key={name} className="mb-3">
            <label className="block text-black text-sm mb-1">{label}:</label>
            <input
              type="file"
              name={name}
              onChange={handleChange}
              className="w-full p-1 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 shadow-sm"
            />
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-all font-semibold shadow-lg"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

export default LawyerProfileSetup;