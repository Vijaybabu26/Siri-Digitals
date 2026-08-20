import React, { useEffect, useState } from 'react';
import './SiriHome.css';

const services = [
  {
    icon: '🖨️',
    title: 'Flex Printing',
    description:
      'High-quality flex printing for banners, promotions, events, shops and business displays.',
  },
  {
    icon: '🎨',
    title: 'Vinyl Printing',
    description:
      'Premium vinyl printing for branding, stickers, signage, walls and creative applications.',
  },
  {
    icon: '🖼️',
    title: 'Photo Frames',
    description:
      'Beautiful custom photo frames for homes, gifts, memories, celebrations and special occasions.',
  },
  {
    icon: '💳',
    title: 'Visiting Cards',
    description:
      'Professional visiting card designs and premium printing for individuals and businesses.',
  },
  {
    icon: '📐',
    title: 'Custom Sizes',
    description:
      'Frames and printing solutions available in different sizes according to your requirements.',
  },
  {
    icon: '✏️',
    title: 'Design & Print',
    description:
      'Complete design and printing solutions customized according to your ideas and requirements.',
  },
];

const features = [
  {
    icon: '⭐',
    title: 'Quality Printing',
    description:
      'Sharp details, vibrant colors and professional finishing for every project.',
  },
  {
    icon: '✨',
    title: 'Creative Designs',
    description:
      'Modern and attractive designs created according to your brand and requirements.',
  },
  {
    icon: '📏',
    title: 'Custom Sizes',
    description:
      'Choose the size, shape and style that perfectly fits your requirement.',
  },
  {
    icon: '⚡',
    title: 'Fast Service',
    description:
      'Reliable turnaround with attention to quality and customer requirements.',
  },
  {
    icon: '🤝',
    title: 'Local Support',
    description:
      'Friendly local service with direct communication and personalized assistance.',
  },
  {
    icon: '💰',
    title: 'Affordable',
    description:
      'Professional printing solutions designed to deliver great value for your money.',
  },
];

const gallery = [
  {
    icon: '🪧',
    title: 'Flex Banners',
    description:
      'Durable and vibrant outdoor advertising.',
  },
  {
    icon: '🎨',
    title: 'Vinyl Prints',
    description:
      'Glossy and matte printing for branding and signage.',
  },
  {
    icon: '🖼️',
    title: 'Photo Frames',
    description:
      'Elegant frames for your favorite memories.',
  },
  {
    icon: '💳',
    title: 'Visiting Cards',
    description:
      'Professional cards for your personal brand.',
  },
  {
    icon: '✨',
    title: 'Custom Designs',
    description:
      'Creative designs made specifically for you.',
  },
  {
    icon: '📐',
    title: 'Custom Sizes',
    description:
      'Printing and framing in the size you need.',
  },
];

const SiriHome = () => {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  /* =====================================================
     CURSOR LIGHT
     ===================================================== */

  useEffect(() => {
    const handleMouseMove = (event) => {
      const light =
        document.getElementById(
          'siriHomeCursorLight'
        );

      if (!light) return;

      light.style.left =
        `${event.clientX}px`;

      light.style.top =
        `${event.clientY}px`;
    };

    window.addEventListener(
      'mousemove',
      handleMouseMove
    );

    return () => {
      window.removeEventListener(
        'mousemove',
        handleMouseMove
      );
    };
  }, []);

  /* =====================================================
     NAVBAR SCROLL
     ===================================================== */

  useEffect(() => {
    const handleScroll = () => {
      const navbar =
        document.querySelector(
          '.siri-home-navbar'
        );

      if (!navbar) return;

      if (window.scrollY > 20) {
        navbar.classList.add(
          'scrolled'
        );
      } else {
        navbar.classList.remove(
          'scrolled'
        );
      }
    };

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );
    };
  }, []);

  /* =====================================================
     CLOSE MOBILE MENU WHEN RESIZING
     ===================================================== */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 820) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener(
      'resize',
      handleResize
    );

    return () => {
      window.removeEventListener(
        'resize',
        handleResize
      );
    };
  }, []);

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleMenu = () => {
    setMobileMenuOpen(
      (previous) => !previous
    );
  };

  return (
    <div className="siri-home-wrapper">

      {/* =================================================
          CURSOR LIGHT
          ================================================= */}

      <div
        id="siriHomeCursorLight"
        className="siri-home-cursor-light"
      />

      {/* =================================================
          NAVBAR
          ================================================= */}

      <header className="siri-home-navbar">

        <div className="siri-home-container siri-home-nav-container">

          <a
            href="#home"
            className="siri-home-logo"
            onClick={closeMenu}
          >

            <span className="siri-home-logo-orb" />

            <span className="siri-home-logo-text">

              <span className="siri-home-logo-main">
                SIRI DIGITALS
              </span>

              <span className="siri-home-logo-telugu">
                సిరి డిజిటల్
              </span>

            </span>

          </a>

          <nav
            className={
              `siri-home-nav-links ${
                mobileMenuOpen
                  ? 'active'
                  : ''
              }`
            }
          >

            <a
              href="#home"
              onClick={closeMenu}
            >
              Home
            </a>

            <a
              href="#services"
              onClick={closeMenu}
            >
              Services
            </a>

            <a
              href="#customization"
              onClick={closeMenu}
            >
              Customization
            </a>

            <a
              href="#gallery"
              onClick={closeMenu}
            >
              Gallery
            </a>

            <a
              href="#about"
              onClick={closeMenu}
            >
              About
            </a>

            <a
              href="#contact"
              onClick={closeMenu}
            >
              Contact
            </a>

            <a
              href="#contact"
              className="siri-home-nav-cta"
              onClick={closeMenu}
            >
              Get Quote
            </a>

          </nav>

          <button
            className="siri-home-hamburger"
            onClick={toggleMenu}
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>

        </div>

      </header>

      {/* =================================================
          HERO
          ================================================= */}

      <section
        id="home"
        className="siri-home-hero"
      >

        <div
          className="siri-home-hero-glow glow-one"
        />

        <div
          className="siri-home-hero-glow glow-two"
        />

        <div className="siri-home-container siri-home-hero-grid">

          {/* HERO CONTENT */}

          <div className="siri-home-hero-content">

            <div className="siri-home-hero-badge">

              <span className="badge-icon">
                ✦
              </span>

              <span>
                Your Local Print & Media Partner
              </span>

            </div>

            <h1 className="siri-home-hero-title">

              Quality Printing.

              <br />

              <span className="siri-home-gradient-text">
                Creative Designs.
              </span>

              <br />

              Custom Sizes.

            </h1>

            <p className="siri-home-hero-subtitle">
              Bring your ideas to life with
              professional flex printing,
              vinyl printing, photo frames,
              visiting cards and completely
              customized print solutions.
            </p>

            <div className="siri-home-hero-buttons">

              <a
                href="#services"
                className="siri-home-btn-primary"
              >
                Explore Services
                <span>→</span>
              </a>

              <a
                href="#contact"
                className="siri-home-btn-secondary"
              >
                Contact Us
                <span>☎</span>
              </a>

            </div>

            <div className="siri-home-trust-row">

              <div className="siri-home-trust-item">
                <strong>1 Lakh +</strong>
                <span>Services</span>
              </div>

              <div className="siri-home-trust-divider" />

              <div className="siri-home-trust-item">
                <strong>100%</strong>
                <span>Customizable</span>
              </div>

              <div className="siri-home-trust-divider" />

              <div className="siri-home-trust-item">
                <strong>Local</strong>
                <span>Support</span>
              </div>

            </div>

          </div>

          {/* HERO VISUAL */}

          <div className="siri-home-hero-visual">

            <div className="siri-home-3d-scene">

              <div
                className="siri-home-orbit orbit-one"
              />

              <div
                className="siri-home-orbit orbit-two"
              />

              <div className="siri-home-3d-card">

                <div className="siri-home-card-shine" />

                <div className="siri-home-card-logo">

                  <span className="logo-symbol" />

                  <div>

                    <strong>
                      SIRI
                    </strong>

                    <span>
                      DIGITAS
                    </span>

                  </div>

                </div>

                <div className="siri-home-printer-icon">
                  🖨️
                </div>

                <h3>
                  Professional
                  <br />
                  Printing Studio
                </h3>

                <p>
                  Flex • Vinyl • Frames • Cards
                </p>

                <div className="siri-home-card-line" />

                <span className="siri-home-card-tag">
                  DESIGN • PRINT • CREATE
                </span>

              </div>

              <div className="floating-object object-one">
                🖼️
              </div>

              <div className="floating-object object-two">
                🎨
              </div>

              <div className="floating-object object-three">
                ✨
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          SERVICES
          ================================================= */}

      <section
        id="services"
        className="siri-home-section-padding"
      >

        <div className="siri-home-container">

          <div className="siri-home-section-header">

            <div className="siri-home-section-label">
              WHAT WE DO
            </div>

            <h2>
              Everything You Need
              <br />

              <span className="siri-home-gradient-text">
                Under One Roof.
              </span>
            </h2>

            <p>
              Professional printing and creative
              media solutions for businesses,
              events, homes and special moments.
            </p>

          </div>

          <div className="siri-home-services-grid">

            {services.map(
              (service, index) => (
                <div
                  className="siri-home-service-card"
                  key={service.title}
                >

                  <div className="siri-home-service-number">
                    0{index + 1}
                  </div>

                  <div className="siri-home-service-icon">
                    {service.icon}
                  </div>

                  <h3>
                    {service.title}
                  </h3>

                  <p>
                    {service.description}
                  </p>

                  <div className="siri-home-card-arrow">
                    →
                  </div>

                </div>
              )
            )}

          </div>

        </div>

      </section>

      {/* =================================================
          CUSTOMIZATION
          ================================================= */}

      <section
        id="customization"
        className="siri-home-customization-section siri-home-section-padding"
      >

        <div className="siri-home-container siri-home-custom-grid">

          <div className="siri-home-custom-content">

            <div className="siri-home-section-label">
              MADE FOR YOU
            </div>

            <h2>
              Your Idea.
              <br />

              <span className="siri-home-gradient-text">
                Your Size. Your Style.
              </span>
            </h2>

            <p>
              Every customer has a different
              requirement. We provide customized
              printing and framing solutions
              according to your size, design,
              color and purpose.
            </p>

            <div className="siri-home-custom-list">

              <div>
                <span>✓</span>
                Custom sizes
              </div>

              <div>
                <span>✓</span>
                Custom designs
              </div>

              <div>
                <span>✓</span>
                Custom colors
              </div>

              <div>
                <span>✓</span>
                Personalized printing
              </div>

              <div>
                <span>✓</span>
                Different frame sizes
              </div>

              <div>
                <span>✓</span>
                Business branding
              </div>

            </div>

            <a
              href="#contact"
              className="siri-home-btn-primary custom-btn"
            >
              Discuss Your Requirement
              <span>→</span>
            </a>

          </div>

          <div className="siri-home-custom-visual">

            <div className="siri-home-floating-frame">

              <div className="frame-corner top-left" />
              <div className="frame-corner top-right" />
              <div className="frame-corner bottom-left" />
              <div className="frame-corner bottom-right" />

              <div className="frame-inner">

                <div className="frame-icon">
                  🖼️
                </div>

                <h3>
                  CUSTOM
                </h3>

                <strong>
                  YOUR SIZE
                </strong>

                <span>
                  SIRI DIGITAS
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          ABOUT / FEATURES
          ================================================= */}

      <section
        id="about"
        className="siri-home-section-padding"
      >

        <div className="siri-home-container">

          <div className="siri-home-section-header">

            <div className="siri-home-section-label">
              WHY SIRI DIGITAS
            </div>

            <h2>
              Quality You Can
              <br />

              <span className="siri-home-gradient-text">
                See & Trust.
              </span>
            </h2>

            <p>
              We combine creativity, quality and
              local service to provide printing
              solutions that make your ideas stand out.
            </p>

          </div>

          <div className="siri-home-features-grid">

            {features.map((feature) => (

              <div
                className="siri-home-feature-card"
                key={feature.title}
              >

                <div className="siri-home-feature-icon">
                  {feature.icon}
                </div>

                <h3>
                  {feature.title}
                </h3>

                <p>
                  {feature.description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =================================================
          GALLERY
          ================================================= */}

      <section
        id="gallery"
        className="siri-home-gallery-section siri-home-section-padding"
      >

        <div className="siri-home-container">

          <div className="siri-home-section-header">

            <div className="siri-home-section-label">
              OUR WORK
            </div>

            <h2>
              Creative Work.
              <br />

              <span className="siri-home-gradient-text">
                Professional Results.
              </span>
            </h2>

            <p>
              Explore the different types of
              printing and customization solutions
              available at SIRI DIGITAS.
            </p>

          </div>

          <div className="siri-home-gallery-grid">

            {gallery.map(
              (item, index) => (

                <div
                  className="siri-home-gallery-item"
                  key={item.title}
                >

                  <div className="gallery-overlay" />

                  <div className="gallery-icon">
                    {item.icon}
                  </div>

                  <div className="gallery-content">

                    <span>
                      0{index + 1}
                    </span>

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.description}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>

      {/* =================================================
          CONTACT
          ================================================= */}

      <section
        id="contact"
        className="siri-home-contact-section"
      >

        <div className="siri-home-container">

          <div className="siri-home-contact-box">

            <div className="contact-glow" />

            <div className="siri-home-section-label">
              LET'S CREATE
            </div>

            <h2>
              Need Printing or
              <br />

              <span className="siri-home-gradient-text">
                Custom Design?
              </span>
            </h2>

            <p>
              Tell us what you need. We'll help
              turn your idea into a professional print.
            </p>

            <div className="siri-home-contact-details">

              <a
                href="tel:+91XXXXXXXXXX"
                className="siri-home-contact-card"
              >

                <div className="contact-card-icon">
                  ☎
                </div>

                <div>

                  <span>
                    CALL US
                  </span>

                  <strong>
                    +91 XXXXXXXXXX
                  </strong>

                </div>

              </a>

              <a
                href="mailto:siridigitals@gmail.com"
                className="siri-home-contact-card"
              >

                <div className="contact-card-icon">
                  ✉
                </div>

                <div>

                  <span>
                    EMAIL US
                  </span>

                  <strong>
                    siridigitals@gmail.com
                  </strong>

                </div>

              </a>

            </div>

            <div className="siri-home-contact-buttons">

              <a
                href="tel:+91XXXXXXXXXX"
                className="siri-home-btn-primary"
              >
                ☎ Call Now
              </a>

              <a
                href="https://wa.me/91XXXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="siri-home-whatsapp-btn"
              >
                WhatsApp
              </a>

              <a
                href="mailto:siridigitals@gmail.com"
                className="siri-home-btn-secondary"
              >
                ✉ Email Us
              </a>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          FOOTER
          ================================================= */}

      <footer className="siri-home-footer">

        <div className="siri-home-container">

          <div className="siri-home-footer-grid">

            <div className="siri-home-footer-brand">

              <a
                href="#home"
                className="siri-home-logo"
              >

                <span className="siri-home-logo-orb" />

                <span className="siri-home-logo-text">

                  <span className="siri-home-logo-main">
                    SIRI DIGITAS
                  </span>

                  <span className="siri-home-logo-telugu">
                    సిరి డిజిటల్
                  </span>

                </span>

              </a>

              <p>
                Your Local Print & Media Partner
                for quality printing, creative
                designs and custom sizes.
              </p>

            </div>

            <div className="siri-home-footer-column">

              <h4>
                Services
              </h4>

              <a href="#services">
                Flex Printing
              </a>

              <a href="#services">
                Vinyl Printing
              </a>

              <a href="#services">
                Photo Frames
              </a>

              <a href="#services">
                Visiting Cards
              </a>

              <a href="#services">
                Custom Sizes
              </a>

            </div>

            <div className="siri-home-footer-column">

              <h4>
                Quick Links
              </h4>

              <a href="#home">
                Home
              </a>

              <a href="#services">
                Services
              </a>

              <a href="#gallery">
                Gallery
              </a>

              <a href="#about">
                About
              </a>

              <a href="#contact">
                Contact
              </a>

            </div>

            <div className="siri-home-footer-column">

              <h4>
                Contact
              </h4>

              <a href="tel:+91XXXXXXXXXX">
                ☎ +91 9154081160
              </a>

              <a href="mailto:siridigitals99@gmail.com">
                ✉ siridigitals99@gmail.com
              </a>

              <a
                href="https://wa.me/91XXXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>

            </div>

          </div>

          <div className="siri-home-footer-bottom">

            <p>
              © 2026 SIRI DIGITAS.
              All Rights Reserved.
            </p>

            <span>
              Design • Print • Create
            </span>

          </div>

        </div>

      </footer>

    </div>
  );
};

export default SiriHome;