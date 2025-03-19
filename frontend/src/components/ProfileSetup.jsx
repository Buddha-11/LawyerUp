import { useState } from "react";
import { useFirebase } from "../context/firebase";
import { useNavigate } from "react-router-dom";

function ProfileSetup({ user, onComplete }) {
  const { uploadProfileImage } = useFirebase();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    let photoURL = user.photoURL || null;

    if (profileImage) {
      photoURL = await uploadProfileImage(user.uid, profileImage);
    }

    await fetch("http://localhost:5000/api/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebaseId: user.uid,
        name,
        age,
        gender,
        location,
        photoURL,
      }),
    });

    onComplete(); // Redirect or proceed after submission
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className=" bg-gray-300 py-12 px-6 w-full sm:w-2/3 lg:w-1/2 shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">Complete Your Profile</h2>

        {/* General User Fields */}
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-500 rounded-md"
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-500 rounded-md"
        />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-500 rounded-md"
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
          className="w-full p-3 mb-4 border border-gray-500 rounded-md"
        />

        {/* File Upload */}
        <label className="block text-gray-600 mb-2">Upload Profile Image:</label>
        <input
          type="file"
          onChange={(e) => setProfileImage(e.target.files[0])}
          className="w-full p-2 mb-4 border border-gray-500 rounded-md"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-teal-600 text-white py-3 rounded-md hover:bg-teal-700"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

export default ProfileSetup;
