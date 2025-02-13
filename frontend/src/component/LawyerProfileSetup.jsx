import { useState } from "react";
import { useFirebase } from "../context/firebase";
import { useNavigate } from "react-router-dom";

function LawyerProfileSetup({ user, onComplete }) {
  const { uploadProfileImage } = useFirebase();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [qualification, setQualification] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [degreeImage, setDegreeImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    let photoURL = user.photoURL || null;
    let degreeImageURL = null;

    if (profileImage) {
      photoURL = await uploadProfileImage(user.uid, profileImage);
    }

    if (degreeImage) {
      degreeImageURL = await uploadProfileImage(user.uid, degreeImage); // Assuming same function can handle both
    }

    await fetch(`http://localhost:5000/api/update-lawyer-profile/${user.uid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebaseId: user.uid,
        name,
        age,
        gender,
        location,
        yearsOfExperience,
        qualification,
        photoURL,
        degreeImageURL,
      }),
    });

    onComplete(); // Redirect after submission
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-md w-1/3 mx-auto">
      <h2 className="text-2xl font-bold mb-4">Complete Lawyer Profile</h2>

      {/* General User Fields */}
      <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 mb-2 border" />
      <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className="w-full p-2 mb-2 border" />
      <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2 mb-2 border">
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-2 mb-2 border" />

      {/* Lawyer-Specific Fields */}
      <input type="number" placeholder="Years of Experience" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} className="w-full p-2 mb-2 border" />
      <input type="text" placeholder="Qualification" value={qualification} onChange={(e) => setQualification(e.target.value)} className="w-full p-2 mb-2 border" />
      
      {/* File Uploads */}
      <label className="block text-gray-600 mt-2">Upload Profile Image:</label>
      <input type="file" onChange={(e) => setProfileImage(e.target.files[0])} className="w-full p-2 mb-2 border" />

      <label className="block text-gray-600 mt-2">Upload Degree Certificate:</label>
      <input type="file" onChange={(e) => setDegreeImage(e.target.files[0])} className="w-full p-2 mb-4 border" />

      <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white w-full p-2">
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}

export default LawyerProfileSetup;
