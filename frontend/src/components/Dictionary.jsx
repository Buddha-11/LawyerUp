import React, { useState } from 'react';

const legalResources = {
  Beginner: {
    "Legal Basics": [
      { 
        title: "Constitution of India (Govt. Website)", 
        url: "https://legislative.gov.in/constitution-of-india",
        description: "Official government portal for accessing the complete text of the Indian Constitution."
      },
      { 
        title: "Indian Kanoon - Legal Information", 
        url: "https://indiankanoon.org/",
        description: "Free search engine for Indian law providing access to judgments, statutes, and regulations."
      }
    ],
    "Self-Help": [
      { 
        title: "NALSAR Legal Services", 
        url: "https://www.nalsar.ac.in/",
        description: "Legal aid services and resources from the National Academy of Legal Studies and Research."
      }
    ]
  },
  Intermediate: {
    "Case Law": [
      { 
        title: "Supreme Court of India Judgements", 
        url: "https://main.sci.gov.in/",
        description: "Official database of Supreme Court judgments and case status information."
      },
      { 
        title: "High Court Judgements (India Kanoon)", 
        url: "https://indiankanoon.org/search/?formInput=High+Court",
        description: "Searchable collection of High Court judgments from across India."
      }
    ],
    "Legislation (Bare Acts)": [
      { 
        title: "Indian Penal Code - Bare Act", 
        url: "https://www.indiankanoon.org/doc/1314133/",
        description: "Complete text of the Indian Penal Code (IPC) with sections and amendments."
      },
      { 
        title: "Indian Evidence Act - Bare Act", 
        url: "https://www.indiankanoon.org/doc/1850109/",
        description: "Full text of the Indian Evidence Act governing rules of evidence in court proceedings."
      },
      { 
        title: "Indian Contract Act - Bare Act", 
        url: "https://www.indiankanoon.org/doc/1161003/",
        description: "Complete legal framework governing contractual relationships in India."
      }
    ]
  },
  Expert: {
    "Legal Books & Commentaries": [
      { 
        title: "Commentary on the Indian Penal Code", 
        url: "https://www.google.com/books/edition/Indian_Penal_Code",
        description: "Authoritative analysis and interpretation of the IPC with case references."
      },
      { 
        title: "The Indian Contract Act (Ratanlal & Dhirajlal)", 
        url: "https://www.google.com/books/edition/The_Indian_Contract_Act",
        description: "Classic reference work on Indian contract law with extensive commentary."
      },
      { 
        title: "Mulla on Partnership Act", 
        url: "https://www.google.com/books/edition/Mulla_on_Partnership",
        description: "Comprehensive guide to partnership law in India by renowned legal scholars."
      }
    ],
    "Research & Journals": [
      { 
        title: "HeinOnline (Indian Law Journals)", 
        url: "https://home.heinonline.org/",
        description: "Database of Indian legal journals, articles, and historical legal documents."
      },
      { 
        title: "Bar & Bench (Indian Judiciary News)", 
        url: "https://www.barandbench.com/",
        description: "Legal news portal covering court updates, judgments, and legal developments."
      },
      { 
        title: "SC Observer", 
        url: "https://scobserver.in/",
        description: "Dedicated platform tracking and analyzing Supreme Court cases and decisions."
      }
    ]
  }
};

const Dictionary = () => {
  const [activeTab, setActiveTab] = useState("Beginner");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter resources based on search term
  const filteredResources = searchTerm.trim() === "" 
    ? legalResources
    : Object.entries(legalResources).reduce((filtered, [expertise, sections]) => {
        const filteredSections = Object.entries(sections).reduce((filteredSecs, [type, resources]) => {
          const filteredRes = resources.filter(resource => 
            resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          if (filteredRes.length > 0) {
            filteredSecs[type] = filteredRes;
          }
          
          return filteredSecs;
        }, {});
        
        if (Object.keys(filteredSections).length > 0) {
          filtered[expertise] = filteredSections;
        }
        
        return filtered;
      }, {});

  return (
    <div className="bg-gray-100 min-h-screen py-4">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header Section with gradient background */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6">
            {/* Back Button */}
                <div className="absolute top-4 left-4">
                <a
                    href="/"
                    className="inline-flex items-center text-sm text-white bg-teal-700 hover:bg-teal-800 px-3 py-1.5 rounded-lg shadow-md transition-colors"
                >
                    <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </a>
                </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center tracking-tight">Legal Resources Dictionary</h1>
            <p className="text-teal-100 text-center mt-1">Curated legal resources for all experience levels</p>
            
            {/* Search Bar with improved styling */}
            <div className="mt-5 relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full p-3 pl-10 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-teal-300 shadow-md bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-5 h-5 text-teal-500 absolute left-3 top-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Tabs Navigation with pill styling */}
          <div className="flex justify-center p-4 bg-gray-50 border-b border-gray-200">
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              {Object.keys(legalResources).map((expertise) => (
                <button
                  key={expertise}
                  className={`py-2 px-4 text-sm font-medium transition-colors duration-200 rounded-md ${
                    activeTab === expertise
                      ? "bg-white text-teal-600 shadow-sm"
                      : "text-gray-600 hover:text-teal-500"
                  }`}
                  onClick={() => setActiveTab(expertise)}
                >
                  {expertise}
                  <span className="ml-1 bg-gray-200 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">
                    {Object.values(legalResources[expertise]).flat().length}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Content Area */}
          <div className="p-5">
            {searchTerm.trim() !== "" ? (
              // Search Results
              Object.keys(filteredResources).length > 0 ? (
                Object.entries(filteredResources).map(([expertise, sections]) => (
                  <div key={expertise} className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">{expertise} Resources</h2>
                    {Object.entries(sections).map(([type, resources]) => (
                      <div key={type} className="mb-5">
                        <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                          <span className="w-1 h-5 bg-teal-500 rounded-sm mr-2"></span>
                          {type}
                        </h3>
                        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                          {resources.map((resource, idx) => (
                            <ResourceCard key={idx} resource={resource} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <svg className="w-14 h-14 text-gray-300 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="mt-2 text-xl font-medium text-gray-700">No resources found</h3>
                  <p className="text-gray-500 mt-1">Try adjusting your search criteria</p>
                </div>
              )
            ) : (
              // Regular Tab Content
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-1.5 h-6 bg-teal-500 rounded-sm mr-2"></span>
                  {activeTab} Level Resources
                </h2>
                
                {Object.entries(legalResources[activeTab]).map(([type, resources]) => (
                  <div key={type} className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-3 border-b border-gray-200 pb-2">{type}</h3>
                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {resources.map((resource, idx) => (
                        <ResourceCard key={idx} resource={resource} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer with improved styling */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              These resources are regularly updated. Last update: April 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResourceCard = ({ resource }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <a 
        href={resource.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block group h-full"
      >
        <h4 className="text-teal-600 font-medium mb-1 group-hover:text-teal-800 flex items-center">
          {resource.title}
          <svg className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </h4>
        <p className="text-sm text-gray-600">{resource.description}</p>
      </a>
    </div>
  );
};

export default Dictionary;