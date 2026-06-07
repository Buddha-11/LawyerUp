import React, { useState } from 'react';
import Navbar from './Navbar';
import { BookOpen, Search, ExternalLink } from 'lucide-react';

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

const tabColors = {
  Beginner: "from-emerald-500 to-teal-600",
  Intermediate: "from-teal-500 to-cyan-600",
  Expert: "from-cyan-600 to-blue-600",
};

const Dictionary = () => {
  const [activeTab, setActiveTab] = useState("Beginner");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResources = searchTerm.trim() === ""
    ? legalResources
    : Object.entries(legalResources).reduce((filtered, [expertise, sections]) => {
        const filteredSections = Object.entries(sections).reduce((filteredSecs, [type, resources]) => {
          const filteredRes = resources.filter(resource =>
            resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (filteredRes.length > 0) filteredSecs[type] = filteredRes;
          return filteredSecs;
        }, {});
        if (Object.keys(filteredSections).length > 0) filtered[expertise] = filteredSections;
        return filtered;
      }, {});

  const isSearching = searchTerm.trim() !== "";
  const displayData = isSearching ? filteredResources : { [activeTab]: legalResources[activeTab] };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Legal Resources Library</h1>
          </div>
          <p className="text-teal-100 text-sm md:text-base">
            Curated legal resources for every experience level
          </p>

          {/* Search bar */}
          <div className="mt-5 relative max-w-lg">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Level Tabs */}
        {!isSearching && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {Object.keys(legalResources).map((expertise) => (
              <button
                key={expertise}
                onClick={() => setActiveTab(expertise)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === expertise
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:text-teal-700 hover:bg-teal-50 border border-gray-200"
                }`}
              >
                {expertise}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === expertise ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {Object.values(legalResources[expertise]).flat().length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Search results header */}
        {isSearching && (
          <div className="mb-5">
            <p className="text-sm text-gray-500">
              Showing results for <span className="font-medium text-gray-700">"{searchTerm}"</span>
            </p>
          </div>
        )}

        {/* Content */}
        {Object.keys(displayData).length === 0 ? (
          <div className="text-center py-16">
            <Search size={40} className="mx-auto text-gray-200 mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No resources found</h3>
            <p className="text-sm text-gray-400">Try adjusting your search terms</p>
          </div>
        ) : (
          Object.entries(displayData).map(([expertise, sections]) => (
            <div key={expertise}>
              {isSearching && (
                <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-teal-500 rounded" />
                  {expertise} Level
                </h2>
              )}
              {Object.entries(sections).map(([type, resources]) => (
                <div key={type} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-teal-400 rounded" />
                    {type}
                  </h3>
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource, idx) => (
                      <ResourceCard key={idx} resource={resource} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}

        <div className="mt-8 text-center text-xs text-gray-400 pb-4">
          Resources are regularly updated · Last updated April 2025
        </div>
      </div>
    </div>
  );
};

const ResourceCard = ({ resource }) => (
  <a
    href={resource.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-teal-200 transition-all duration-200 flex flex-col h-full"
  >
    <div className="flex items-start justify-between gap-2 mb-2">
      <h4 className="text-teal-700 font-medium text-sm group-hover:text-teal-800 leading-snug flex-1">
        {resource.title}
      </h4>
      <ExternalLink size={14} className="text-gray-300 group-hover:text-teal-400 flex-shrink-0 mt-0.5 transition-colors" />
    </div>
    <p className="text-xs text-gray-500 leading-relaxed flex-1">{resource.description}</p>
  </a>
);

export default Dictionary;