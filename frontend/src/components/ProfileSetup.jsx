import { useState } from "react";
import { useFirebase } from "../context/firebase";

function ProfileSetup({ user, onComplete }) {
  const { uploadProfileImage } = useFirebase();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState(""); // To manually set location
  const [coordinates, setCoordinates] = useState(null); // To store lat, lng
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get the user's current location (latitude and longitude)
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates([latitude, longitude]); // Store the coordinates
        },
        (error) => {
          console.error("Error fetching location: ", error);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    let photoURL = user.photoURL || null;

    if (profileImage) {
      photoURL = await uploadProfileImage(user.uid, profileImage);
    }

    await fetch(`${import.meta.env.VITE_BE_URL}/api/update-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebaseId: user.uid,
        name,
        age,
        gender,
        location, // User-input location
        coordinates, // Send geolocation data (lat, lng)
        photoURL,
      }),
    });

    onComplete(); // Redirect or proceed after submission
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-20">
      <div className="bg-white py-14 px-12 w-full sm:w-2/3 lg:w-1/2 shadow-2xl rounded-3xl border border-gray-200 hover:shadow-3xl transition-shadow duration-300">
        <h2 className="text-4xl font-semibold mb-2 text-center text-black tracking-wide whitespace-nowrap">Complete Your Profile</h2>
        <p className="text-center text-gray-500 mb-8">Fill in the details to proceed</p>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 focus:outline-none shadow-sm"
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 focus:outline-none shadow-sm"
        />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 focus:outline-none shadow-sm"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 focus:outline-none shadow-sm"
        />
        {/* Add Button to get current location */}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 mb-4"
        >
          Use Current Location
        </button>

        {/* Show the coordinates if available */}
        {coordinates && (
          <p className="text-green-600 mb-4">
            Current Location: Latitude {coordinates[0]}, Longitude {coordinates[1]}
          </p>
        )}


        <label className="block text-black text-sm mb-2">Upload Profile Image:</label>
        <input
          type="file"
          onChange={(e) => setProfileImage(e.target.files[0])}
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 focus:outline-none shadow-sm"
        />

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