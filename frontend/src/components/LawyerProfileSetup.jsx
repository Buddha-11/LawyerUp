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
    setFormData((prevData) => ({
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
        setFormData((prevData) => ({
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
    // For file inputs, capture the file
    if (e.target.type === "file") {
      setFormData({
        ...formData,
        [e.target.name]: e.target.files[0],
      });
    } else if (e.target.name === "type") {
      // For multi-select, use the selected value
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
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
          photoURL,
          degreeImageURL,
        },
        { merge: true }
      );

      onComplete();
    } catch (error) {
      console.error("Error updating lawyer profile:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen pt-10 bg-gray-50 p-4">
      <div className="bg-white p-8 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5 shadow-md rounded-xl border border-gray-200">
        <h2 className="text-3xl font-semibold text-center mb-2">Complete Lawyer Profile</h2>
        <p className="text-center text-gray-500 mb-6">Fill in the details to proceed</p>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 mb-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 shadow-sm"
        />

        <div className="flex gap-4 mb-3">
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            className="w-1/2 p-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 shadow-sm"
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-1/2 p-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 shadow-sm"
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
            className="w-1/2 p-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 shadow-sm"
          />

          <input
            type="number"
            name="consultationFees"
            placeholder="Consultation Fees"
            value={formData.consultationFees}
            onChange={handleChange}
            className="w-1/2 p-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Location:</label>
          <input
            type="text"
            ref={searchInputRef}
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for your location"
            className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 shadow-sm"
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
            className="w-1/2 p-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 shadow-sm"
          />

          <input
            type="text"
            name="qualification"
            placeholder="Qualification"
            value={formData.qualification}
            onChange={handleChange}
            className="w-1/2 p-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
        </div>

        <MultiSelect
          name="type"
          label="Practice Type(s):"
          options={practiceOptions}
          value={formData.type}
          onChange={handleChange}
        />

        {[
          { label: "Upload Profile Image", name: "profileImage" },
          { label: "Upload Degree Certificate", name: "degreeImage" },
        ].map(({ label, name }) => (
          <div key={name} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}:</label>
            <input
              type="file"
              name={name}
              onChange={handleChange}
              className="w-full p-1 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 shadow-sm"
            />
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition-all font-medium shadow"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

export default LawyerProfileSetup;
