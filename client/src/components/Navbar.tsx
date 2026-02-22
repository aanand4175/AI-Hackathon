import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">🌾</div>
          FarmProfit
        </Link>
        <ul className="navbar-links">
          <li>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/estimator"
              className={location.pathname === "/estimator" ? "active" : ""}
            >
              Estimator
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
