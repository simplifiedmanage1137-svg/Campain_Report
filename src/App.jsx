import { BrowserRouter, Routes, Route } from "react-router-dom";
import CampaignReport from "./components/CampaignReport";
import CampaignReportTabs from "./components/CampaignReportTabs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CampaignReport />} />
        <Route path="/campaign-report-tabs" element={<CampaignReportTabs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;