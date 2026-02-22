import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import Home from "./pages/Home";
import Estimator from "./pages/Estimator";
import Results from "./pages/Results";
import Recommendations from "./pages/Recommendations";
import Compare from "./pages/Compare";
import Heatmap from "./pages/Heatmap";
import Sensitivity from "./pages/Sensitivity";

import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import CropsManager from "./pages/admin/CropsManager";
import CropForm from "./pages/admin/CropForm";
import CategoryManager from "./pages/admin/CategoryManager";
import StateManager from "./pages/admin/StateManager";
import IrrigationManager from "./pages/admin/IrrigationManager";
import CostParameterManager from "./pages/admin/CostParameterManager";
import RegionsManager from "./pages/admin/RegionsManager";
import RegionForm from "./pages/admin/RegionForm";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="login" element={<AdminLogin />} />
          <Route path="crops" element={<CropsManager />} />
          <Route path="crops/new" element={<CropForm />} />
          <Route path="crops/:id" element={<CropForm />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="states" element={<StateManager />} />
          <Route path="irrigations" element={<IrrigationManager />} />
          <Route path="costs" element={<CostParameterManager />} />
          <Route path="regions" element={<RegionsManager />} />
          <Route path="regions/new" element={<RegionForm />} />
          <Route path="regions/:id" element={<RegionForm />} />
        </Route>

        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="estimator" element={<Estimator />} />
          <Route path="results" element={<Results />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="compare" element={<Compare />} />
          <Route path="heatmap" element={<Heatmap />} />
          <Route path="sensitivity" element={<Sensitivity />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
