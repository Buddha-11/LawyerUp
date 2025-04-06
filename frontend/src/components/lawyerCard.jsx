import React from "react";
import { useState } from "react";
import BookAppointmentModal from "./BookAppointmentModal"; // Adjust the import path as necessary
const LawyerCard = ({ lawyer }) => {
  const [showModal, setShowModal] = useState(false);
  const photoSrc =
    typeof lawyer?.photoURL === "string" && lawyer.photoURL.trim() !== ""
      ? lawyer.photoURL
      : "https://via.placeholder.com/80";

  const practiceAreas = Array.isArray(lawyer?.type)
    ? lawyer.type
    : [];
  console.log(lawyer);
  
  // Move the modal outside the main component flow
return (
  <>
    {/* Modal positioned at the root level */}
    {showModal && (
      <BookAppointmentModal
        lawyer={lawyer}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    )}
    
    <div className="p-5 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src={photoSrc}
              alt={lawyer?.name || "Lawyer"}
              className="h-24 w-24 rounded-full object-cover border-2 border-teal-100 shadow-sm"
            />
            {lawyer?.yearsOfExperience != null && (
              <div className="absolute -bottom-1 -right-1 bg-teal-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {lawyer.yearsOfExperience}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
            <div>
              <div className="flex items-center flex-wrap">
                <h3 className="text-lg font-bold text-gray-800 flex items-center mr-2">
                  {lawyer?.name || "Unknown"}
                  {lawyer?.verified && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </h3>
                {lawyer?.qualification && (
                  <p className="text-gray-600 font-medium">{lawyer.qualification}</p>
                )}
              </div>
            </div>

            <div className="mt-2 sm:mt-0">
              <div className="flex flex-wrap gap-2">
                {lawyer?.distance != null && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-medium">
                    {lawyer.distance} km
                  </span>
                )}
                {lawyer?.consultationFees != null && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                    ₹{lawyer.consultationFees}/hr
                  </span>
                )}
                {lawyer?.availableNow && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                    <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                    Available Now
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mt-3 text-sm">
            {lawyer?.yearsOfExperience != null && (
              <div className="flex items-center text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {lawyer.yearsOfExperience} years experience
              </div>
            )}

            {lawyer?.location && (
              <div className="flex items-center text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {lawyer.location.length > 50
                  ? lawyer.location.slice(0, 50) + "..."
                  : lawyer.location}
              </div>
            )}

            {lawyer?.email && (
              <div className="flex items-center text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {lawyer.email}
              </div>
            )}

            {lawyer?.gender && (
              <div className="flex items-center text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {lawyer.gender}
              </div>
            )}
          </div>

          {practiceAreas.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-600">Practice Areas:</span>
                {practiceAreas.slice(0, 5).map((type, index) => (
                  <span
                    key={type + index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
                  >
                    {type}
                  </span>
                ))}
                {practiceAreas.length > 5 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                    +{practiceAreas.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-col sm:flex-row space-x-4 space-y-2 sm:space-y-0">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-md transition-colors flex items-center"
          >
            Book Consultation
          </button>
            <button className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);
};

export default LawyerCard;
