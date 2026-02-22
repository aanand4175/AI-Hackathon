import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Home: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: "📊",
      title: t("home.feat_1_title"),
      description: t("home.feat_1_desc"),
    },
    {
      icon: "🧠",
      title: t("home.feat_2_title"),
      description: t("home.feat_2_desc"),
    },
    {
      icon: "🌧️",
      title: t("home.feat_3_title"),
      description: t("home.feat_3_desc"),
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">✨ AI-Powered Decision Support Tool</div>
        <h1>{t("home.title")}</h1>
        <p>{t("home.subtitle")}</p>
        <div className="hero-cta">
          <Link to="/estimator" className="btn btn-primary btn-lg">
            🚀 {t("home.start_btn")}
          </Link>
          <a href="#features" className="btn btn-secondary btn-lg">
            Learn More
          </a>
          <Link
            to="/admin/login"
            className="btn btn-secondary btn-lg"
            style={{
              borderColor: "var(--primary-color)",
              color: "var(--primary-color)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            🛡️ Admin Login
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <h2>{t("home.features_title")}</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;
