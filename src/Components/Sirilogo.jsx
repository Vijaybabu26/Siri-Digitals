import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SiriLogo.css";

import LakshmiImage from "../assets/LAKSHMI.png";

const SiriLogo = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("SiriLogo loaded");
    console.log("Current path:", window.location.pathname);

    const timer = setTimeout(() => {
      navigate("/siridigitals", { replace: true });
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="siri-logo-container">
      <div className="siri-logo splash-screen">

        {/* Background circles */}
        <div className="siri-logo circle circle-one"></div>
        <div className="siri-logo circle circle-two"></div>
        <div className="siri-logo circle circle-three"></div>

        {/* Goddess */}
        <div className="siri-logo goddess-section">

          <div className="siri-logo goddess-glow"></div>

          <img
            src={LakshmiImage}
            alt="Goddess Lakshmi"
            className="siri-logo goddess-image"
          />

        </div>

        {/* Brand */}
        <div className="siri-logo brand-section">

          {/* Om Symbol */}
          <div className="siri-logo symbol">
            ॐ
          </div>

          {/* English Name */}
          <h1 className="siri-logo brand-name-en">
            SIRI DIGITAS
          </h1>

          {/* Telugu Name */}
          <h2 className="siri-logo brand-name-telugu">
            సిరి డిజిటల్
          </h2>

          {/* Tagline */}
          <p className="siri-logo main-tagline">
            Your Local Print &amp; Media Partner
          </p>

          {/* Gold Divider */}
          <div className="siri-logo gold-line"></div>

          {/* Services */}
          <div className="siri-logo services">

            <strong>
              Quality Printing. Creative Designs. Custom Sizes.
            </strong>

            <div className="siri-logo service-list">

              <span className="siri-logo service">
                Flex Printing
              </span>

              <span className="siri-logo service">
                Vinyl Printing
              </span>

              <span className="siri-logo service">
                Photo Frames
              </span>

              <span className="siri-logo service">
                Visiting Cards
              </span>

              <span className="siri-logo service">
                Custom Sizes
              </span>

              <span className="siri-logo service">
                Design &amp; Print
              </span>

            </div>

          </div>

          {/* Contact */}
          <div className="siri-logo contact">
            📞 Contact: +91 XXXXXXXXXX
          </div>

          {/* Loading */}
          <div className="siri-logo loading">

            <span>
              WELCOME
            </span>

            <div className="siri-logo loading-bar">

              <div className="siri-logo loading-progress"></div>

            </div>

            <small>
              Loading...
            </small>

          </div>

        </div>

      </div>
    </div>
  );
};

export default SiriLogo;    