import { Link } from "react-router-dom";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const Home: React.FC = () => {
  const features: Feature[] = [
    {
      icon: "📊",
      title: "Yield Estimation",
      description:
        "Get accurate crop yield predictions based on your region, soil type, and irrigation method.",
    },
    {
      icon: "💰",
      title: "MSP vs Market Price",
      description:
        "Compare your expected revenue at government MSP rates and current market prices.",
    },
    {
      icon: "📈",
      title: "Profit Projection",
      description:
        "Detailed cost breakdown and profit/loss calculation with ROI percentage.",
    },
    {
      icon: "🌧️",
      title: "Risk Assessment",
      description:
        "Evaluate weather, irrigation, and market risks with a comprehensive risk score.",
    },
    {
      icon: "🗺️",
      title: "Region-Based Data",
      description:
        "12 major Indian agricultural regions with localized yield multipliers and risk factors.",
    },
    {
      icon: "🌱",
      title: "10 Major Crops",
      description:
        "Rice, Wheat, Cotton, Sugarcane, Soybean, and more — with realistic Indian market data.",
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">✨ AI-Powered Decision Support Tool</div>
        <h1>
          Make Smarter
          <br />
          <span className="gradient-text">Farming Decisions</span>
        </h1>
        <p>
          Estimate crop profitability before you sow. Get AI-driven insights on
          yield, costs, revenue, and risks — tailored to your region and
          conditions.
        </p>
        <div className="hero-cta">
          <Link to="/estimator" className="btn btn-primary btn-lg">
            🚀 Start Estimating
          </Link>
          <a href="#features" className="btn btn-secondary btn-lg">
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <h2>How It Works</h2>
        <p className="subtitle">
          Input your farming details and get a comprehensive profitability
          report in seconds.
        </p>
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
