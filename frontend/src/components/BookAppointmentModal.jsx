import React, { useState, useEffect } from "react";
import { useFirebase } from "../context/firebase"; // adjust path if needed
import { db } from "../context/firebase"; // you'll need to export db from firebase file
import { collection, addDoc, getDoc, doc } from "firebase/firestore";

const BookAppointmentModal = ({ isOpen, onClose, lawyer }) => {
  const { currentUser } = useFirebase();
  const [userData, setUserData] = useState({ name: "", age: "", gender: "" });
  const [caseType, setCaseType] = useState("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            name: data.name || "",
            age: data.age || "",
            gender: data.gender || "",
          });
        }
      }
    };
    if (isOpen) fetchUserInfo();
  }, [currentUser, isOpen]);

  const handleSubmit = async () => {
    if (!caseType || !query) {
      alert("Please fill all required fields");
      return;
    }
    
    setIsLoading(true);
    try {
      await addDoc(collection(db, "appointments"), {
        uid: currentUser.uid,
        lawyerId: lawyer?.id,
        lawyerName: lawyer?.name,
        name: userData.name,
        age: userData.age,
        gender: userData.gender,
        caseType,
        query,
        createdAt: new Date(),
      });
      alert("Appointment booked successfully!");
      onClose();
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black z-40 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-50 mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Book Consultation</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {lawyer && (
            <div className="mb-4 pb-4 border-b border-gray-200 opacity-100">
              <div className="flex items-center">
                <div className="mr-3">
                  <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                    {lawyer.photoSrc ? (
                      <img 
                        src={lawyer.photoSrc} 
                        alt={lawyer.name} 
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{lawyer.name}</h3>
                  {lawyer.qualification && (
                    <p className="text-sm text-gray-600">{lawyer.qualification}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-800 border border-gray-300 rounded-md px-3 py-2 bg-gray-50">{userData.name || "Not provided"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <p className="text-gray-800 border border-gray-300 rounded-md px-3 py-2 bg-gray-50">{userData.age || "Not provided"}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <p className="text-gray-800 border border-gray-300 rounded-md px-3 py-2 bg-gray-50">{userData.gender || "Not provided"}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type of case <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Criminal, Civil, Property"
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your query <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Please describe your legal issue in detail"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-24"
                rows={4}
                required
              ></textarea>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-teal-500 rounded-md text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Book Consultation"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookAppointmentModal;