import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Estimator from "./pages/Estimator";
import Results from "./pages/Results";
import Recommendations from "./pages/Recommendations";
import Compare from "./pages/Compare";
import Heatmap from "./pages/Heatmap";
import Sensitivity from "./pages/Sensitivity";

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estimator" element={<Estimator />} />
        <Route path="/results" element={<Results />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/heatmap" element={<Heatmap />} />
        <Route path="/sensitivity" element={<Sensitivity />} />
      </Routes>
      <footer className="footer">
        <p>
          &copy; 2026 Farmer Profitability Estimator. Built for Indian
          Agriculture.
        </p>
      </footer>
    </Router>
  );
};

export default App;
