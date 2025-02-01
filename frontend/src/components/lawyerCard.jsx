import React from "react";
import { Link } from "react-router-dom";

const LawyerCard = ({ name, image, experience, _id, fee, ratings, address }) => {
  return (
    <div className="lawyer-card">
      {/* Top Section: Image, Name, YOE, Address, Consultation Fee */}
      <div className="top-section">
        <div className="left-section">
          <div className="profile-pic">
            <img src={image} alt={`${name}'s profile`} className="lawyer-image" />
          </div>
          <div className="lawyer-info">
            <h2 className="lawyer-name">{name}</h2>
            <p className="lawyer-experience">{experience} years of Experience</p>
            <p className="lawyer-address">⚲ {address}</p>
          </div>
        </div>
        <div className="right-section">
          <p className="consultation-fee">Consultation Fee <br /><strong>₹{fee}/-</strong></p>
        </div>
      </div>

      {/* Dashed Divider */}
      <hr className="dashed-divider" />

      {/* Bottom Section: Rating and Consult Now Button */}
      <div className="bottom-section">
        <div className="ratings">
          <span className="rating">{ratings}✩</span> <span className="rating-count">3840 Ratings</span>
        </div>
        <Link to={`/lawyers/${_id}`} className="consult-link">
          <button className="btn-consult">Consult Now</button>
        </Link>
      </div>
    </div>
  );
};

export default LawyerCard;