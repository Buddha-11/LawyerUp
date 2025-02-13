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
    <div className="p-6 bg-white rounded-md shadow-md w-1/3 mx-auto">
      <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
      <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 mb-2 border" />
      <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className="w-full p-2 mb-2 border" />
      <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2 mb-2 border">
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-2 mb-2 border" />
      <input type="file" onChange={(e) => setProfileImage(e.target.files[0])} className="w-full p-2 mb-2 border" />
      <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white w-full p-2">
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}

export default ProfileSetup;
