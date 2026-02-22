import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const Navbar: React.FC = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "hi" : "en");
  };

  const isActive = (path: string) =>
    location.pathname === path ? "active" : "";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">🌾</div>
          {t("navbar.title")}
        </Link>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {/* <button
            onClick={toggleLanguage}
            className="lang-toggle-btn"
            aria-label="Toggle language"
          >
            {i18n.language === "en" ? "हिंदी" : "EN"}
          </button> */}
          <button
            className="navbar-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <li>
            <Link
              to="/"
              className={isActive("/")}
              onClick={() => setMenuOpen(false)}
            >
              {t("navbar.home")}
            </Link>
          </li>
          <li>
            <Link
              to="/estimator"
              className={isActive("/estimator")}
              onClick={() => setMenuOpen(false)}
            >
              {t("navbar.estimator")}
            </Link>
          </li>
          <li>
            <Link
              to="/recommendations"
              className={isActive("/recommendations")}
              onClick={() => setMenuOpen(false)}
            >
              Recommendations
            </Link>
          </li>
          <li>
            <Link
              to="/compare"
              className={isActive("/compare")}
              onClick={() => setMenuOpen(false)}
            >
              Compare
            </Link>
          </li>
          <li>
            <Link
              to="/sensitivity"
              className={isActive("/sensitivity")}
              onClick={() => setMenuOpen(false)}
            >
              Sensitivity
            </Link>
          </li>
          <li>
            <Link
              to="/heatmap"
              className={isActive("/heatmap")}
              onClick={() => setMenuOpen(false)}
            >
              Heatmap
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
