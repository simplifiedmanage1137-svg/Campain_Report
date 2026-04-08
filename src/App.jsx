import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NextPage from './components/NextPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import CampaignReport from './components/CampaignReport';
import CampaignReportTabs from './components/CampaignReportTabs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CampaignReport />} />
        <Route path="/CampaignReportTabs" element={<CampaignReportTabs />} />
      </Routes>
    </Router>
  );
}

export default App;