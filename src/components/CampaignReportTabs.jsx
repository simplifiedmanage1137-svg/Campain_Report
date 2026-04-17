import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Table, Alert, Tab, Tabs } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Custom Date Picker Component
const CustomDatePicker = ({ value, onChange, placeholder = "DD/MM/YYYY" }) => {
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef(null);
  const hiddenDateRef = useRef(null);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        setDisplayValue(`${day}/${month}/${year}`);
      }
    } else {
      setDisplayValue('');
    }

    if (hiddenDateRef.current) {
      hiddenDateRef.current.value = value || '';
    }
  }, [value]);

  const handleDateChange = (e) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);

    const parts = newValue.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);

      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          onChange(formattedDate);
        }
      }
    }
  };

  const handleNativeDateChange = (e) => {
    if (e.target.value) {
      onChange(e.target.value);
    }
  };

  const openCalendar = () => {
    if (hiddenDateRef.current) {
      hiddenDateRef.current.showPicker();
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', gap: '5px' }}>
      <Form.Control
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleDateChange}
        size="sm"
      />
      <input
        ref={hiddenDateRef}
        type="date"
        onChange={handleNativeDateChange}
        style={{
          position: 'absolute',
          right: '0',
          top: '0',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
          border: 'none',
          padding: 0,
          margin: 0
        }}
      />
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={openCalendar}
        style={{ padding: '0 8px' }}
      >
        📅
      </Button>
    </div>
  );
};

const CustomNumberInput = ({ value, onChange, placeholder = "Enter value", size = "sm", disabled = false }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      defaultValue={value || ''}
      onBlur={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      autoComplete="off"
      className={`form-control form-control-${size}`}
      style={{ ...(disabled && { backgroundColor: '#f5f5f5' }) }}
    />
  );
};

const OutboundForm = ({
  outboundFormData,
  handleOutboundChange,
  handleOutboundDateChange,
  handleOutboundNumberChange,
  softBounced,
  setSoftBounced,
  pacingEntries,
  handlePacingEntryChange,
  addPacingEntry,
  removePacingEntry,
  jobRoleEntries,
  handleJobRoleChange,
  addJobRoleEntry,
  removeJobRoleEntry,
  jobScenarioEntries,
  handleJobScenarioChange,
  addJobScenarioEntry,
  removeJobScenarioEntry,
  handleBackToCampaign,
  saveOutboundData,
  outboundValidationError,
  setOutboundValidationError,
  outboundRoleError,
  outboundScenarioError
}) => {
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const getRoleTotal = () => {
    return jobRoleEntries.reduce((sum, entry) => sum + (parseFloat(entry.value) || 0), 0);
  };

  const getScenarioTotal = () => {
    return jobScenarioEntries.reduce((sum, entry) => sum + (parseFloat(entry.value) || 0), 0);
  };

  return (
    <>
      {outboundValidationError && (
        <Alert variant="danger" className="mb-3" onClose={() => setOutboundValidationError('')} dismissible>
          {outboundValidationError}
        </Alert>
      )}

      <Row className="mb-3">
        <Col md={6}>
          <Form.Label>Report Title</Form.Label>
          <Form.Control
            name="reportTitle"
            value={outboundFormData.reportTitle}
            onChange={handleOutboundChange}
            placeholder="Enter report title"
          />
        </Col>
        <Col md={6}>
          <Form.Label>Subtitle</Form.Label>
          <Form.Control
            name="reportSubtitle"
            value={outboundFormData.reportSubtitle}
            onChange={handleOutboundChange}
            placeholder="Enter subtitle"
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Label>Start Date</Form.Label>
          <CustomDatePicker
            value={outboundFormData.startDate}
            onChange={(value) => handleOutboundDateChange('startDate', value)}
          />
        </Col>
        <Col md={3}>
          <Form.Label>End Date</Form.Label>
          <CustomDatePicker
            value={outboundFormData.endDate}
            onChange={(value) => handleOutboundDateChange('endDate', value)}
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Label>Total Emails Sent</Form.Label>
          <Form.Control
            type="text"
            value={outboundFormData.totalEmailsSent}
            disabled
            style={{ backgroundColor: '#f5f5f5' }}
            placeholder="Auto-calculated from table"
          />
        </Col>
        <Col md={3}>
          <Form.Label>Total Delivered</Form.Label>
          <Form.Control
            type="text"
            value={outboundFormData.totalEmailsDelivered}
            disabled
            style={{ backgroundColor: '#f5f5f5' }}
            placeholder="Auto-calculated"
          />
        </Col>
        <Col md={3}>
          <Form.Label>Avg Sends</Form.Label>
          <Form.Control
            type="text"
            value={outboundFormData.dailyAvgSends}
            disabled
            style={{ backgroundColor: '#f5f5f5' }}
            placeholder="Auto-calculated from table"
          />
        </Col>
        <Col md={3}>
          <Form.Label>Hard Bounced</Form.Label>
          <CustomNumberInput
            value={outboundFormData.totalHardBounced}
            onChange={(value) => handleOutboundNumberChange('totalHardBounced', value)}
            placeholder="Manual entry"
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Label>Soft Bounced</Form.Label>
          <CustomNumberInput
            value={softBounced}
            onChange={(value) => setSoftBounced(value)}
            placeholder="Manual entry (Not in PDF)"
          />
        </Col>
        <Col md={3}>
          <Form.Label>Bounce Rate %</Form.Label>
          <Form.Control
            type="text"
            value={outboundFormData.bounceRate}
            disabled
            style={{ backgroundColor: '#f5f5f5' }}
            placeholder="Auto-calculated"
          />
        </Col>
      </Row>

      {/* Table 1: Daily Pacing Dynamic Data */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">1. Daily Pacing Dynamic Data</Form.Label>
        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px' }}>
          <Table responsive bordered size="sm">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Date (Editable)</th>
                <th style={{ width: '45%' }}>Value (Emails Sent) - Editable</th>
                <th style={{ width: '10%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pacingEntries.map((entry) => (
                <tr key={entry.id}>
                  <td style={{ width: '45%' }}>
                    <CustomDatePicker
                      value={entry.date}
                      onChange={(value) => handlePacingEntryChange(entry.id, 'date', value)}
                    />
                  </td>
                  <td style={{ width: '45%' }}>
                    <CustomNumberInput
                      value={entry.value}
                      onChange={(value) => handlePacingEntryChange(entry.id, 'value', value)}
                      placeholder="Enter value"
                    />
                  </td>
                  <td className="text-center" style={{ width: '10%' }}>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removePacingEntry(entry.id)}
                      disabled={pacingEntries.length === 1}
                    >
                      ×
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={addPacingEntry}
          className="mt-2"
          style={{ width: '100%' }}
        >
          + Add New Entry
        </Button>
      </Form.Group>

      {/* Table 2: Job Role Distribution */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">2. Job Role Distribution</Form.Label>
        {outboundRoleError && (
          <Alert variant="danger" className="mb-2 py-1" style={{ fontSize: '12px' }}>
            {outboundRoleError}
          </Alert>
        )}
        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px' }}>
          <Table responsive bordered size="sm">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Role Name</th>
                <th style={{ width: '45%' }}>Value (%)</th>
                <th style={{ width: '10%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobRoleEntries.map((entry) => (
                <tr key={entry.id}>
                  <td style={{ width: '45%' }}>
                    <Form.Control
                      type="text"
                      value={entry.role}
                      onChange={(e) => handleJobRoleChange(entry.id, 'role', e.target.value)}
                      placeholder="Enter role name"
                      size="sm"
                    />
                  </td>
                  <td style={{ width: '45%' }}>
                    <CustomNumberInput
                      value={entry.value}
                      onChange={(value) => handleJobRoleChange(entry.id, 'value', value)}
                      placeholder="Enter percentage"
                    />
                  </td>
                  <td className="text-center" style={{ width: '10%' }}>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeJobRoleEntry(entry.id)}
                      disabled={jobRoleEntries.length === 1}
                    >
                      ×
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <small className="text-muted mt-2 d-block">
          Total: {getRoleTotal()}%
          {getRoleTotal() > 100 &&
            <span className="text-danger"> (Exceeds 100%!)</span>
          }
        </small>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={addJobRoleEntry}
          className="mt-2"
          style={{ width: '100%' }}
        >
          + Add New Entry
        </Button>
      </Form.Group>

      {/* Table 3: Job Scenario Distribution */}
      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">3. Job Scenario Distribution</Form.Label>
        {outboundScenarioError && (
          <Alert variant="danger" className="mb-2 py-1" style={{ fontSize: '12px' }}>
            {outboundScenarioError}
          </Alert>
        )}
        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px' }}>
          <Table responsive bordered size="sm">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Scenario Name</th>
                <th style={{ width: '45%' }}>Value (%)</th>
                <th style={{ width: '10%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobScenarioEntries.map((entry) => (
                <tr key={entry.id}>
                  <td style={{ width: '45%' }}>
                    <Form.Control
                      type="text"
                      value={entry.scenario}
                      onChange={(e) => handleJobScenarioChange(entry.id, 'scenario', e.target.value)}
                      placeholder="Enter scenario name"
                      size="sm"
                    />
                  </td>
                  <td style={{ width: '45%' }}>
                    <CustomNumberInput
                      value={entry.value}
                      onChange={(value) => handleJobScenarioChange(entry.id, 'value', value)}
                      placeholder="Enter percentage"
                    />
                  </td>
                  <td className="text-center" style={{ width: '10%' }}>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeJobScenarioEntry(entry.id)}
                      disabled={jobScenarioEntries.length === 1}
                    >
                      ×
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <small className="text-muted mt-2 d-block">
          Total: {getScenarioTotal()}%
          {getScenarioTotal() > 100 &&
            <span className="text-danger"> (Exceeds 100%!)</span>
          }
        </small>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={addJobScenarioEntry}
          className="mt-2"
          style={{ width: '100%' }}
        >
          + Add New Entry
        </Button>
      </Form.Group>

      <div className="d-flex gap-3">
        <Button variant="outline-secondary" size="lg" className="flex-grow-1 fw-bold" onClick={handleBackToCampaign}>Back to Campaign</Button>
        <Button variant="success" size="lg" className="flex-grow-1 fw-bold" onClick={saveOutboundData}>💾 Save & Next</Button>
      </div>
    </>
  );
};

const CampaignReportTabs = () => {
  const [activeTab, setActiveTab] = useState('outbound');
  const [outboundData, setOutboundData] = useState(null);
  const [pocOpensData, setPocOpensData] = useState(null);
  const [pocClicksData, setPocClicksData] = useState(null);
  const [landingPageData, setLandingPageData] = useState(null);
  const [webVitalsData, setWebVitalsData] = useState(null);
  const [isOutboundSaved, setIsOutboundSaved] = useState(false);
  const [isPocOpensSaved, setIsPocOpensSaved] = useState(false);
  const [isPocClicksSaved, setIsPocClicksSaved] = useState(false);
  const [isLandingPageSaved, setIsLandingPageSaved] = useState(false);
  const [isWebVitalsSaved, setIsWebVitalsSaved] = useState(false);
  const [outboundSaveMessage, setOutboundSaveMessage] = useState('');
  const [pocOpensSaveMessage, setPocOpensSaveMessage] = useState('');
  const [pocClicksSaveMessage, setPocClicksSaveMessage] = useState('');
  const [landingPageSaveMessage, setLandingPageSaveMessage] = useState('');
  const [webVitalsSaveMessage, setWebVitalsSaveMessage] = useState('');
  const [outboundValidationMessage, setOutboundValidationMessage] = useState('');
  const [pocOpensValidationMessage, setPocOpensValidationMessage] = useState('');
  const [pocClicksValidationMessage, setPocClicksValidationMessage] = useState('');
  const [landingPageValidationMessage, setLandingPageValidationMessage] = useState('');
  const [webVitalsValidationMessage, setWebVitalsValidationMessage] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Validation error states for cross-tab validation
  const [outboundValidationError, setOutboundValidationError] = useState('');
  const [opensValidationError, setOpensValidationError] = useState('');
  const [clicksValidationError, setClicksValidationError] = useState('');

  // Per-row validation error states
  const [opensValidationErrors, setOpensValidationErrors] = useState({});
  const [clicksValidationErrors, setClicksValidationErrors] = useState({});
  const [opensToOutboundError, setOpensToOutboundError] = useState({});
  const [clicksToOpensError, setClicksToOpensError] = useState({});
  const [hasOpensValidationError, setHasOpensValidationError] = useState(false);
  const [hasClicksValidationError, setHasClicksValidationError] = useState(false);

  // Job Role Distribution validation errors
  const [outboundRoleError, setOutboundRoleError] = useState('');
  const [opensRoleError, setOpensRoleError] = useState('');
  const [clicksRoleError, setClicksRoleError] = useState('');

  // Job Scenario Distribution validation errors
  const [outboundScenarioError, setOutboundScenarioError] = useState('');
  const [opensScenarioError, setOpensScenarioError] = useState('');
  const [clicksScenarioError, setClicksScenarioError] = useState('');

  // Outbound Form State
  const [outboundFormData, setOutboundFormData] = useState({
    reportTitle: '',
    reportSubtitle: '',
    startDate: '',
    endDate: '',
    totalEmailsSent: '',
    totalEmailsDelivered: '',
    dailyAvgSends: '',
    totalHardBounced: '',
    securityPerc: '',
    safetyPerc: '',
    othersPerc: '',
    bounceRate: '',
    ecManagers: '',
    ecDirectors: ''
  });

  const [pacingEntries, setPacingEntries] = useState([
    { id: Date.now(), date: '', value: '' }
  ]);

  // Separate Job Role entries for each tab
  const [outboundJobRoleEntries, setOutboundJobRoleEntries] = useState([
    { id: Date.now(), role: '', value: '' }
  ]);
  const [opensJobRoleEntries, setOpensJobRoleEntries] = useState([]);
  const [clicksJobRoleEntries, setClicksJobRoleEntries] = useState([]);

  // Separate Job Scenario entries for each tab
  const [outboundJobScenarioEntries, setOutboundJobScenarioEntries] = useState([
    { id: Date.now(), scenario: '', value: '' }
  ]);
  const [opensJobScenarioEntries, setOpensJobScenarioEntries] = useState([]);
  const [clicksJobScenarioEntries, setClicksJobScenarioEntries] = useState([]);

  useEffect(() => {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    setCurrentDate(formattedDate);
  }, []);

  // Sync Role Names and Scenario Names from Outbound to Opens and Clicks tabs
  useEffect(() => {
    if (outboundJobRoleEntries.length > 0) {
      setOpensJobRoleEntries(prev => {
        const newEntries = outboundJobRoleEntries.map(outboundEntry => {
          const existingEntry = prev.find(e => e.id === outboundEntry.id);
          return {
            id: outboundEntry.id,
            role: outboundEntry.role,
            value: existingEntry ? existingEntry.value : outboundEntry.value
          };
        });
        return newEntries;
      });

      setClicksJobRoleEntries(prev => {
        const newEntries = outboundJobRoleEntries.map(outboundEntry => {
          const existingEntry = prev.find(e => e.id === outboundEntry.id);
          return {
            id: outboundEntry.id,
            role: outboundEntry.role,
            value: existingEntry ? existingEntry.value : outboundEntry.value
          };
        });
        return newEntries;
      });
    }
  }, [outboundJobRoleEntries]);

  useEffect(() => {
    if (outboundJobScenarioEntries.length > 0) {
      setOpensJobScenarioEntries(prev => {
        const newEntries = outboundJobScenarioEntries.map(outboundEntry => {
          const existingEntry = prev.find(e => e.id === outboundEntry.id);
          return {
            id: outboundEntry.id,
            scenario: outboundEntry.scenario,
            value: existingEntry ? existingEntry.value : outboundEntry.value
          };
        });
        return newEntries;
      });

      setClicksJobScenarioEntries(prev => {
        const newEntries = outboundJobScenarioEntries.map(outboundEntry => {
          const existingEntry = prev.find(e => e.id === outboundEntry.id);
          return {
            id: outboundEntry.id,
            scenario: outboundEntry.scenario,
            value: existingEntry ? existingEntry.value : outboundEntry.value
          };
        });
        return newEntries;
      });
    }
  }, [outboundJobScenarioEntries]);

  // Validate Job Role Distribution total percentage
  const validateJobRoleTotal = useCallback((entries, setErrorCallback) => {
    const total = entries.reduce((sum, entry) => {
      const value = parseFloat(entry.value) || 0;
      return sum + value;
    }, 0);

    if (total > 100) {
      setErrorCallback(`⚠️ Total percentage cannot exceed 100%. Current total: ${total}%`);
      return false;
    } else {
      setErrorCallback('');
      return true;
    }
  }, []);

  // Validate Job Scenario Distribution total percentage
  const validateJobScenarioTotal = useCallback((entries, setErrorCallback) => {
    const total = entries.reduce((sum, entry) => {
      const value = parseFloat(entry.value) || 0;
      return sum + value;
    }, 0);

    if (total > 100) {
      setErrorCallback(`⚠️ Total percentage cannot exceed 100%. Current total: ${total}%`);
      return false;
    } else {
      setErrorCallback('');
      return true;
    }
  }, []);

  // Validate Outbound Job Role Distribution
  useEffect(() => {
    validateJobRoleTotal(outboundJobRoleEntries, setOutboundRoleError);
  }, [outboundJobRoleEntries, validateJobRoleTotal]);

  // Validate Outbound Job Scenario Distribution
  useEffect(() => {
    validateJobScenarioTotal(outboundJobScenarioEntries, setOutboundScenarioError);
  }, [outboundJobScenarioEntries, validateJobScenarioTotal]);

  // Validate Opens Job Role Distribution
  useEffect(() => {
    validateJobRoleTotal(opensJobRoleEntries, setOpensRoleError);
  }, [opensJobRoleEntries, validateJobRoleTotal]);

  // Validate Opens Job Scenario Distribution
  useEffect(() => {
    validateJobScenarioTotal(opensJobScenarioEntries, setOpensScenarioError);
  }, [opensJobScenarioEntries, validateJobScenarioTotal]);

  // Validate Clicks Job Role Distribution
  useEffect(() => {
    validateJobRoleTotal(clicksJobRoleEntries, setClicksRoleError);
  }, [clicksJobRoleEntries, validateJobRoleTotal]);

  // Validate Clicks Job Scenario Distribution
  useEffect(() => {
    validateJobScenarioTotal(clicksJobScenarioEntries, setClicksScenarioError);
  }, [clicksJobScenarioEntries, validateJobScenarioTotal]);

  const calculateDerivedValues = useCallback((entries) => {
    const validValues = entries
      .map(entry => parseFloat(entry.value))
      .filter(val => !isNaN(val) && val !== '');
    const countWithValues = validValues.length;
    let totalSum = 0;
    if (validValues.length > 0) {
      totalSum = validValues.reduce((sum, val) => sum + val, 0);
    }
    const calculatedTotalSent = totalSum;
    const calculatedAvgSends = countWithValues > 0 ? (totalSum / countWithValues).toFixed(2) : 0;
    return {
      totalEmailsSent: calculatedTotalSent.toString(),
      dailyAvgSends: calculatedAvgSends.toString()
    };
  }, []);

  useEffect(() => {
    const { totalEmailsSent, dailyAvgSends } = calculateDerivedValues(pacingEntries);
    setOutboundFormData(prev => ({
      ...prev,
      totalEmailsSent: totalEmailsSent,
      dailyAvgSends: dailyAvgSends
    }));
    setIsOutboundSaved(false);
    setOutboundValidationMessage('');
  }, [pacingEntries, calculateDerivedValues]);

  // PoC Opens Form State
  const [pocOpensFormData, setPocOpensFormData] = useState({
    reportTitle: '',
    reportSubtitle: '',
    totalECsOpened: '',
    ecOpenRatio: '',
    openManager: '',
    openDirector: '',
    securityPerc: '',
    safetyPerc: '',
    othersPerc: ''
  });

  const [opensBarEntries, setOpensBarEntries] = useState([
    { id: Date.now(), date: '', value: '' }
  ]);

  // PoC Clicks Form State
  const [pocClicksFormData, setPocClicksFormData] = useState({
    reportTitle: '',
    reportSubtitle: '',
    totalECsClicked: '',
    ecClickRatio: '',
    clicksManager: '',
    clicksDirector: '',
    securityPerc: '',
    safetyPerc: '',
    othersPerc: ''
  });

  const [clicksBarEntries, setClicksBarEntries] = useState([
    { id: Date.now(), date: '', value: '' }
  ]);

  // Landing Page Form State
  const [landingPageFormData, setLandingPageFormData] = useState({
    reportTitle: '',
    reportSubtitle: '',
    totalUsers: '',
    avgSession: '',
    bouncedUsers: '',
    formDownloads: '',
    bounceRate: ''
  });

  const [stateEntries, setStateEntries] = useState([
    { id: Date.now(), state: '', value: '' }
  ]);

  // Web Page Vitals Form State
  const [webVitalsFormData, setWebVitalsFormData] = useState({
    reportTitle: '',
    reportSubtitle: '',
    avgPageLoadSpeed: '',
    structureMetrix: '',
    largestElementLCP: '',
    tbtScriptBlocks: '',
    tbt: '',
    reducedDNSConnectionTime: '',
    backend: '',
    firstContentfulPaint: '',
    timeToInteractive: '',
    orcadedTime: '',
    largestContentfulPaint: '',
    fullyLoadedTime: ''
  });

  const [speedEntries, setSpeedEntries] = useState([
    { id: Date.now(), value: '' }
  ]);

  const [screenshotImage, setScreenshotImage] = useState(null);
  const navigate = useNavigate();

  const [softBounced, setSoftBounced] = useState('');

  const calculateTotalDelivered = useCallback(() => {
    const totalEmailsSent = parseFloat(outboundFormData.totalEmailsSent) || 0;
    const hardBounces = parseFloat(outboundFormData.totalHardBounced) || 0;
    const softBounces = parseFloat(softBounced) || 0;
    const totalDelivered = totalEmailsSent - hardBounces - softBounces;
    return totalDelivered >= 0 ? totalDelivered.toString() : '0';
  }, [outboundFormData.totalEmailsSent, outboundFormData.totalHardBounced, softBounced]);

  const calculateBounceRate = useCallback(() => {
    const totalEmailsSent = parseFloat(outboundFormData.totalEmailsSent) || 0;
    const hardBounces = parseFloat(outboundFormData.totalHardBounced) || 0;
    const softBounces = parseFloat(softBounced) || 0;
    if (totalEmailsSent > 0) {
      const bounceRate = ((hardBounces + softBounces) / totalEmailsSent) * 100;
      return bounceRate.toFixed(2);
    }
    return '0';
  }, [outboundFormData.totalEmailsSent, outboundFormData.totalHardBounced, softBounced]);

  useEffect(() => {
    const calculatedTotalDelivered = calculateTotalDelivered();
    const calculatedBounceRate = calculateBounceRate();
    setOutboundFormData(prev => ({
      ...prev,
      totalEmailsDelivered: calculatedTotalDelivered,
      bounceRate: calculatedBounceRate
    }));
  }, [calculateTotalDelivered, calculateBounceRate]);

  // Sync from Outbound to Opens
  useEffect(() => {
    if (pacingEntries.length > 0) {
      const syncedBarEntries = pacingEntries.map(entry => ({
        id: entry.id,
        date: entry.date,
        value: entry.value
      }));
      setOpensBarEntries(syncedBarEntries);
    }
  }, [pacingEntries]);

  // Sync from Opens to Clicks
  useEffect(() => {
    if (opensBarEntries.length > 0) {
      const syncedBarEntries = opensBarEntries.map(entry => ({
        id: entry.id,
        date: entry.date,
        value: entry.value
      }));
      setClicksBarEntries(syncedBarEntries);
    }
  }, [opensBarEntries]);

  useEffect(() => {
    if (outboundFormData.reportTitle) {
      setPocOpensFormData(prev => ({ ...prev, reportTitle: outboundFormData.reportTitle }));
      setPocClicksFormData(prev => ({ ...prev, reportTitle: outboundFormData.reportTitle }));
      setLandingPageFormData(prev => ({ ...prev, reportTitle: outboundFormData.reportTitle }));
      setWebVitalsFormData(prev => ({ ...prev, reportTitle: outboundFormData.reportTitle }));
    }
  }, [outboundFormData.reportTitle]);

  useEffect(() => {
    if (outboundFormData.startDate && outboundFormData.endDate) {
      const formatDateForSubtitle = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
      };
      const subtitle = `${formatDateForSubtitle(outboundFormData.startDate)} - ${formatDateForSubtitle(outboundFormData.endDate)}`;
      setPocOpensFormData(prev => prev.reportSubtitle ? prev : ({ ...prev, reportSubtitle: subtitle }));
      setPocClicksFormData(prev => prev.reportSubtitle ? prev : ({ ...prev, reportSubtitle: subtitle }));
    }
  }, [outboundFormData.startDate, outboundFormData.endDate]);

  useEffect(() => {
    const totalUsers = parseFloat(landingPageFormData.totalUsers) || 0;
    const bouncedUsers = parseFloat(landingPageFormData.bouncedUsers) || 0;

    let calculatedBounceRate = '';
    if (totalUsers > 0 && bouncedUsers > 0) {
      const bounceRate = (bouncedUsers / totalUsers) * 100;
      calculatedBounceRate = bounceRate.toFixed(2);
    } else if (totalUsers > 0 && bouncedUsers === 0) {
      calculatedBounceRate = '0';
    } else {
      calculatedBounceRate = '';
    }

    if (calculatedBounceRate !== landingPageFormData.bounceRate) {
      setLandingPageFormData(prev => ({
        ...prev,
        bounceRate: calculatedBounceRate
      }));
    }
  }, [landingPageFormData.totalUsers, landingPageFormData.bouncedUsers]);


  const handleBackToCampaign = () => {
    navigate('/');
  };

  const validateOutboundForm = () => {
    if (!outboundFormData.reportTitle) {
      setOutboundValidationMessage('Please enter Report Title');
      return false;
    }
    if (!outboundFormData.startDate) {
      setOutboundValidationMessage('Please select Start Date');
      return false;
    }
    if (!outboundFormData.endDate) {
      setOutboundValidationMessage('Please select End Date');
      return false;
    }
    const hasValidPacing = pacingEntries.some(entry => entry.date && entry.value && !isNaN(parseFloat(entry.value)));
    if (!hasValidPacing) {
      setOutboundValidationMessage('Please add at least one valid entry in Daily Pacing Dynamic Data');
      return false;
    }
    setOutboundValidationMessage('');
    return true;
  };

  const validatePocOpensForm = () => {
    if (!pocOpensFormData.reportTitle) {
      setPocOpensValidationMessage('Please enter Report Title');
      return false;
    }
    setPocOpensValidationMessage('');
    return true;
  };

  const validatePocClicksForm = () => {
    if (!pocClicksFormData.reportTitle) {
      setPocClicksValidationMessage('Please enter Report Title');
      return false;
    }
    setPocClicksValidationMessage('');
    return true;
  };

  const validateLandingPageForm = () => {
    if (!landingPageFormData.reportTitle) {
      setLandingPageValidationMessage('Please enter Report Title');
      return false;
    }
    if (!landingPageFormData.totalUsers) {
      setLandingPageValidationMessage('Please enter Total Users');
      return false;
    }
    if (!landingPageFormData.bouncedUsers) {
      setLandingPageValidationMessage('Please enter Bounced Users');
      return false;
    }
    const hasValidState = stateEntries.some(entry => entry.state && entry.value);
    if (!hasValidState) {
      setLandingPageValidationMessage('Please add at least one entry in Audience Location Overview');
      return false;
    }
    setLandingPageValidationMessage('');
    return true;
  };

  const validateWebVitalsForm = () => {
    if (!webVitalsFormData.reportTitle) {
      setWebVitalsValidationMessage('Please enter Report Title');
      return false;
    }
    if (!webVitalsFormData.avgPageLoadSpeed) {
      setWebVitalsValidationMessage('Please enter Avg Page Load Speed');
      return false;
    }
    if (!webVitalsFormData.structureMetrix) {
      setWebVitalsValidationMessage('Please enter Structure Metrix');
      return false;
    }
    if (!webVitalsFormData.largestElementLCP) {
      setWebVitalsValidationMessage('Please enter Largest Element LCP');
      return false;
    }
    if (!webVitalsFormData.tbtScriptBlocks) {
      setWebVitalsValidationMessage('Please enter TBT Script Blocks');
      return false;
    }
    setWebVitalsValidationMessage('');
    return true;
  };

  const handleOutboundChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'totalEmailsSent' || name === 'dailyAvgSends' || name === 'totalHardBounced' || name === 'totalEmailsDelivered' || name === 'bounceRate') {
      return;
    }
    setOutboundFormData(prev => ({ ...prev, [name]: value }));
    setIsOutboundSaved(false);
    setOutboundValidationMessage('');
  }, []);

  const handleOutboundNumberChange = useCallback((name, value) => {
    if (name === 'totalEmailsSent' || name === 'dailyAvgSends' || name === 'totalEmailsDelivered' || name === 'bounceRate') {
      return;
    }
    setOutboundFormData(prev => ({ ...prev, [name]: value }));
    setIsOutboundSaved(false);
    setOutboundValidationMessage('');
  }, []);

  const handleOutboundDateChange = useCallback((field, value) => {
    setOutboundFormData(prev => ({ ...prev, [field]: value }));
    setIsOutboundSaved(false);
    setOutboundValidationMessage('');
  }, []);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Updated handlePacingEntryChange with cross-tab validation
  const handlePacingEntryChange = useCallback((id, field, value) => {
    if (field === 'value') {
      const entry = pacingEntries.find(e => e.id === id);
      if (entry && entry.date) {
        const newValueNum = parseFloat(value) || 0;

        const opensEntry = opensBarEntries.find(e => e.date === entry.date);
        if (opensEntry && opensEntry.value) {
          const opensValue = parseFloat(opensEntry.value) || 0;
          if (newValueNum > opensValue) {
            setOutboundValidationError(`Error: Cannot set value ${newValueNum} for date ${formatDateForDisplay(entry.date)} because it exceeds the Opens value (${opensValue}).`);
            return;
          }
        }

        const clicksEntry = clicksBarEntries.find(e => e.date === entry.date);
        if (clicksEntry && clicksEntry.value) {
          const clicksValue = parseFloat(clicksEntry.value) || 0;
          if (newValueNum > clicksValue) {
            setOutboundValidationError(`Error: Cannot set value ${newValueNum} for date ${formatDateForDisplay(entry.date)} because it exceeds the Clicks value (${clicksValue}).`);
            return;
          }
        }
      }
    }

    setOutboundValidationError('');
    setPacingEntries(prev => {
      return prev.map(entry => {
        if (entry.id === id) {
          return { ...entry, [field]: value };
        }
        return entry;
      });
    });
  }, [pacingEntries, opensBarEntries, clicksBarEntries]);

  const addPacingEntry = () => {
    setPacingEntries(prev => [...prev, { id: Date.now(), date: '', value: '' }]);
  };

  const removePacingEntry = (id) => {
    if (pacingEntries.length > 1) {
      setPacingEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const saveOutboundData = () => {
    if (outboundRoleError) {
      setOutboundValidationMessage(outboundRoleError);
      return;
    }
    if (outboundScenarioError) {
      setOutboundValidationMessage(outboundScenarioError);
      return;
    }
    if (!validateOutboundForm()) {
      return;
    }
    const dataToSave = {
      formData: outboundFormData,
      pacingEntries,
      jobRoleEntries: outboundJobRoleEntries,
      jobScenarioEntries: outboundJobScenarioEntries,
      softBounced,
      savedAt: new Date().toISOString()
    };
    setOutboundData(dataToSave);
    setIsOutboundSaved(true);
    setOutboundSaveMessage('Outbound data saved successfully!');
    setTimeout(() => setOutboundSaveMessage(''), 3000);
    setActiveTab('poc-opens');
  };

  const handlePocOpensChange = useCallback((e) => {
    const { name, value } = e.target;
    setPocOpensFormData(prev => ({ ...prev, [name]: value }));
    setIsPocOpensSaved(false);
    setPocOpensValidationMessage('');
  }, []);

  const handlePocOpensNumberChange = useCallback((name, value) => {
    setPocOpensFormData(prev => ({ ...prev, [name]: value }));
    setIsPocOpensSaved(false);
    setPocOpensValidationMessage('');
  }, []);

  const handlePocClicksChange = useCallback((e) => {
    const { name, value } = e.target;
    setPocClicksFormData(prev => ({ ...prev, [name]: value }));
    setIsPocClicksSaved(false);
    setPocClicksValidationMessage('');
  }, []);

  const handlePocClicksNumberChange = useCallback((name, value) => {
    setPocClicksFormData(prev => ({ ...prev, [name]: value }));
    setIsPocClicksSaved(false);
    setPocClicksValidationMessage('');
  }, []);

  const handleLandingPageChange = useCallback((e) => {
    const { name, value } = e.target;
    setLandingPageFormData(prev => ({ ...prev, [name]: value }));
    setIsLandingPageSaved(false);
    setLandingPageValidationMessage('');
  }, []);

  const handleLandingPageNumberChange = useCallback((name, value) => {
    setLandingPageFormData(prev => ({ ...prev, [name]: value }));
    setIsLandingPageSaved(false);
    setLandingPageValidationMessage('');
  }, []);

  const handleStateEntryChange = useCallback((id, field, value) => {
    setStateEntries(prev => {
      return prev.map(entry => {
        if (entry.id === id) {
          return { ...entry, [field]: value };
        }
        return entry;
      });
    });
    setIsLandingPageSaved(false);
    setLandingPageValidationMessage('');
  }, []);

  const addStateEntry = () => {
    setStateEntries(prev => [...prev, { id: Date.now(), state: '', value: '' }]);
    setIsLandingPageSaved(false);
  };

  const removeStateEntry = (id) => {
    if (stateEntries.length > 1) {
      setStateEntries(prev => prev.filter(entry => entry.id !== id));
      setIsLandingPageSaved(false);
    }
  };

  const saveLandingPageData = () => {
    if (!validateLandingPageForm()) {
      return;
    }
    const dataToSave = {
      formData: landingPageFormData,
      stateEntries,
      savedAt: new Date().toISOString()
    };
    setLandingPageData(dataToSave);
    setIsLandingPageSaved(true);
    setLandingPageSaveMessage('Landing Page data saved successfully!');
    setTimeout(() => setLandingPageSaveMessage(''), 3000);
    setActiveTab('web-vitals');
  };

  const handleWebVitalsChange = useCallback((e) => {
    const { name, value } = e.target;
    setWebVitalsFormData(prev => ({ ...prev, [name]: value }));
    setIsWebVitalsSaved(false);
    setWebVitalsValidationMessage('');
  }, []);

  const handleWebVitalsNumberChange = useCallback((name, value) => {
    setWebVitalsFormData(prev => ({ ...prev, [name]: value }));
    setIsWebVitalsSaved(false);
    setWebVitalsValidationMessage('');
  }, []);

  const handleSpeedEntryChange = useCallback((id, value) => {
    setSpeedEntries(prev => {
      return prev.map(entry => {
        if (entry.id === id) {
          return { ...entry, value };
        }
        return entry;
      });
    });
    setIsWebVitalsSaved(false);
    setWebVitalsValidationMessage('');
  }, []);

  const addSpeedEntry = () => {
    setSpeedEntries(prev => [...prev, { id: Date.now(), value: '' }]);
    setIsWebVitalsSaved(false);
  };

  const removeSpeedEntry = (id) => {
    if (speedEntries.length > 1) {
      setSpeedEntries(prev => prev.filter(entry => entry.id !== id));
      setIsWebVitalsSaved(false);
    }
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setWebVitalsValidationMessage('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setScreenshotImage(event.target.result);
        setIsWebVitalsSaved(false);
        setWebVitalsValidationMessage('');
      };
      reader.onerror = () => {
        setWebVitalsValidationMessage('Error reading file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const saveWebVitalsData = () => {
    if (!validateWebVitalsForm()) {
      return;
    }
    const dataToSave = {
      formData: { ...webVitalsFormData },
      screenshotImage: screenshotImage || null,
      savedAt: new Date().toISOString()
    };
    setWebVitalsData(dataToSave);
    setIsWebVitalsSaved(true);
    setWebVitalsSaveMessage('Web Page Vitals data saved successfully!');
    setTimeout(() => setWebVitalsSaveMessage(''), 3000);
  };

  // Updated handleOpensBarEntryChange with Outbound validation
  const handleOpensBarEntryChange = useCallback((id, field, value) => {
    if (field === 'value') {
      const entry = opensBarEntries.find(e => e.id === id);
      if (entry && entry.date) {
        const newValueNum = parseFloat(value) || 0;

        const outboundEntry = pacingEntries.find(e => e.date === entry.date);
        if (outboundEntry && outboundEntry.value) {
          const outboundValue = parseFloat(outboundEntry.value) || 0;
          if (newValueNum > outboundValue) {
            setOpensToOutboundError(prev => ({
              ...prev,
              [id]: `❌ Cannot set value ${newValueNum} for ${formatDateForDisplay(entry.date)} because it exceeds Outbound value (${outboundValue}).`
            }));
            setHasOpensValidationError(true);
            return;
          }
        }
      }
    }

    setOpensToOutboundError(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    setHasOpensValidationError(Object.keys(opensToOutboundError).length > 0);

    setOpensBarEntries(prev => {
      return prev.map(entry => {
        if (entry.id === id) {
          return { ...entry, [field]: value };
        }
        return entry;
      });
    });
    setIsPocOpensSaved(false);
    setPocOpensValidationMessage('');
  }, [opensBarEntries, pacingEntries, formatDateForDisplay, opensToOutboundError]);

  // Updated handleClicksBarEntryChange with Opens validation
  const handleClicksBarEntryChange = useCallback((id, field, value) => {
    if (field === 'value') {
      const entry = clicksBarEntries.find(e => e.id === id);
      if (entry && entry.date) {
        const newValueNum = parseFloat(value) || 0;

        const opensEntry = opensBarEntries.find(e => e.date === entry.date);
        if (opensEntry && opensEntry.value) {
          const opensValue = parseFloat(opensEntry.value) || 0;
          if (newValueNum > opensValue) {
            setClicksToOpensError(prev => ({
              ...prev,
              [id]: `❌ Cannot set value ${newValueNum} for ${formatDateForDisplay(entry.date)} because it exceeds Opens value (${opensValue}).`
            }));
            setHasClicksValidationError(true);
            return;
          }
        }
      }
    }

    setClicksToOpensError(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    setHasClicksValidationError(Object.keys(clicksToOpensError).length > 0);

    setClicksBarEntries(prev => {
      return prev.map(entry => {
        if (entry.id === id) {
          return { ...entry, [field]: value };
        }
        return entry;
      });
    });
    setIsPocClicksSaved(false);
    setPocClicksValidationMessage('');
  }, [clicksBarEntries, opensBarEntries, formatDateForDisplay, clicksToOpensError]);

  // Helper functions to clear errors
  const clearOpensValidationError = useCallback((id) => {
    setOpensValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  }, []);

  const clearClicksValidationError = useCallback((id) => {
    setClicksValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  }, []);

  const clearOpensToOutboundError = useCallback((id) => {
    setOpensToOutboundError(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    setHasOpensValidationError(Object.keys(opensToOutboundError).length > 0);
  }, [opensToOutboundError]);

  const clearClicksToOpensError = useCallback((id) => {
    setClicksToOpensError(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    setHasClicksValidationError(Object.keys(clicksToOpensError).length > 0);
  }, [clicksToOpensError]);

  // Updated PoC Opens Form Component - with non-editable date
  const PoCOpensFormComponent = ({
    pocOpensFormData,
    handlePocOpensChange,
    handlePocOpensNumberChange,
    opensBarEntries,
    handleOpensBarEntryChange,
    savePocOpensData,
    setActiveTab,
    formatDateForDisplay,
    outboundTotalDelivered,
    jobRoleEntries,
    jobScenarioEntries,
    handleJobRoleValueChange,
    handleJobScenarioValueChange,
    opensToOutboundError,
    clearOpensToOutboundError,
    opensRoleError,
    opensScenarioError
  }) => {
    const [localOpensValues, setLocalOpensValues] = useState({});

    useEffect(() => {
      const values = {};
      opensBarEntries.forEach(entry => {
        values[entry.id] = entry.value;
      });
      setLocalOpensValues(values);
    }, [opensBarEntries]);

    // Calculate Total ECs Opened = sum of all bar chart values
    useEffect(() => {
      const totalECsOpened = opensBarEntries.reduce((sum, entry) => {
        const value = parseFloat(entry.value) || 0;
        return sum + value;
      }, 0);
      const roundedTotal = Math.round(totalECsOpened).toString();

      if (roundedTotal !== pocOpensFormData.totalECsOpened) {
        handlePocOpensNumberChange('totalECsOpened', roundedTotal);
      }
    }, [opensBarEntries, handlePocOpensNumberChange]);

    // Calculate EC Open Ratio = (Total ECs Opened / Total Delivered) × 100
    useEffect(() => {
      const totalECsOpened = parseFloat(pocOpensFormData.totalECsOpened) || 0;
      const totalDelivered = parseFloat(outboundTotalDelivered) || 0;
      let calculatedRatio = '0';
      if (totalDelivered > 0) {
        calculatedRatio = ((totalECsOpened / totalDelivered) * 100).toFixed(2);
      }

      if (calculatedRatio !== pocOpensFormData.ecOpenRatio) {
        handlePocOpensNumberChange('ecOpenRatio', calculatedRatio);
      }
    }, [pocOpensFormData.totalECsOpened, outboundTotalDelivered, pocOpensFormData.ecOpenRatio, handlePocOpensNumberChange]);

    const handleOpensValueChange = useCallback((id, value) => {
      setLocalOpensValues(prev => ({ ...prev, [id]: value }));
      clearOpensToOutboundError(id);
      const timeoutId = setTimeout(() => {
        handleOpensBarEntryChange(id, 'value', value);
      }, 300);
      return () => clearTimeout(timeoutId);
    }, [handleOpensBarEntryChange, clearOpensToOutboundError]);

    const getRoleTotal = () => {
      return jobRoleEntries.reduce((sum, entry) => sum + (parseFloat(entry.value) || 0), 0);
    };

    const getScenarioTotal = () => {
      return jobScenarioEntries.reduce((sum, entry) => sum + (parseFloat(entry.value) || 0), 0);
    };

    return (
      <>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Report Title</Form.Label>
            <input
              type="text"
              value={pocOpensFormData.reportTitle}
              disabled
              className="form-control form-control-sm"
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </Col>
          <Col md={6}>
            <Form.Label>Subtitle</Form.Label>
            <input
              type="text"
              name="reportSubtitle"
              defaultValue={pocOpensFormData.reportSubtitle}
              onBlur={(e) => handlePocOpensChange({ target: { name: 'reportSubtitle', value: e.target.value } })}
              placeholder="Enter subtitle"
              className="form-control form-control-sm"
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={3}>
            <Form.Label>Total ECs Opened</Form.Label>
            <Form.Control
              type="text"
              value={pocOpensFormData.totalECsOpened}
              disabled
              style={{ backgroundColor: '#f5f5f5' }}
              placeholder="Auto-calculated from bar chart values"
            />
            <small className="text-muted">Auto: Sum of all Bar Chart Values</small>
          </Col>
          <Col md={3}>
            <Form.Label>EC Open Ratio %</Form.Label>
            <Form.Control
              type="text"
              value={pocOpensFormData.ecOpenRatio}
              disabled
              style={{ backgroundColor: '#f5f5f5' }}
              placeholder="Auto-calculated"
            />
            <small className="text-muted">Auto: (Total ECs Opened / Total Delivered) × 100</small>
          </Col>
        </Row>

        {/* Bar Chart Values Table - Date NON-EDITABLE, Value EDITABLE */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Bar Chart Values (PoC Engagement Stats (Opens))</Form.Label>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px' }}>
            <Table responsive bordered size="sm">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Date (Non-Editable - Synced from Outbound)</th>
                  <th style={{ width: '45%' }}>Value (Editable)</th>
                  <th style={{ width: '10%' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {opensBarEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ width: '45%' }}>
                      <input
                        type="text"
                        value={entry.date ? formatDateForDisplay(entry.date) : ''}
                        disabled
                        className="form-control form-control-sm"
                        style={{ backgroundColor: '#f5f5f5' }}
                      />
                    </td>
                    <td style={{ width: '45%' }}>
                      <CustomNumberInput
                        value={localOpensValues[entry.id] !== undefined ? localOpensValues[entry.id] : entry.value}
                        onChange={(value) => handleOpensValueChange(entry.id, value)}
                        placeholder="Enter value"
                      />
                      {opensToOutboundError[entry.id] && (
                        <div className="text-danger mt-1" style={{ fontSize: '12px' }}>
                          {opensToOutboundError[entry.id]}
                        </div>
                      )}
                    </td>
                    <td className="text-center" style={{ width: '10%' }}>
                      <span className="text-success">✓ Date Synced from Outbound</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <small className="text-muted mt-2 d-block">
            📅 Date is automatically synced from Daily Pacing Dynamic Data (Non-Editable).
            ✏️ Values entered here will be summed to calculate Total ECs Opened.
            ⚠️ Values cannot exceed Outbound values.
          </small>
        </Form.Group>

        {/* Open Role Distribution Table */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Open Role Distribution</Form.Label>
          {opensRoleError && (
            <Alert variant="danger" className="mb-2 py-1" style={{ fontSize: '12px' }}>
              {opensRoleError}
            </Alert>
          )}
          <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px' }}>
            <Table responsive bordered size="sm">
              <thead>
                <tr>
                  <th style={{ width: '60%' }}>Role Name (Synced from Outbound - Non-Editable)</th>
                  <th style={{ width: '40%' }}>Value (%) - Editable</th>
                </tr>
              </thead>
              <tbody>
                {jobRoleEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ width: '60%' }}>
                      <Form.Control
                        type="text"
                        value={entry.role || ''}
                        disabled
                        style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}
                        size="sm"
                      />
                    </td>
                    <td style={{ width: '40%' }}>
                      <CustomNumberInput
                        value={entry.value}
                        onChange={(value) => handleJobRoleValueChange(entry.id, value)}
                        placeholder="Enter percentage"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <small className="text-muted mt-2 d-block">
            Total: {getRoleTotal()}%
            {getRoleTotal() > 100 && <span className="text-danger"> (Exceeds 100%!)</span>}
          </small>
        </Form.Group>

        {/* Job Scenario Distribution Table */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Job Scenario Distribution</Form.Label>
          {opensScenarioError && (
            <Alert variant="danger" className="mb-2 py-1" style={{ fontSize: '12px' }}>
              {opensScenarioError}
            </Alert>
          )}
          <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px' }}>
            <Table responsive bordered size="sm">
              <thead>
                <tr>
                  <th style={{ width: '60%' }}>Scenario Name (Synced from Outbound - Non-Editable)</th>
                  <th style={{ width: '40%' }}>Value (%) - Editable</th>
                </tr>
              </thead>
              <tbody>
                {jobScenarioEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ width: '60%' }}>
                      <Form.Control
                        type="text"
                        value={entry.scenario || ''}
                        disabled
                        style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}
                        size="sm"
                      />
                    </td>
                    <td style={{ width: '40%' }}>
                      <CustomNumberInput
                        value={entry.value}
                        onChange={(value) => handleJobScenarioValueChange(entry.id, value)}
                        placeholder="Enter percentage"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <small className="text-muted mt-2 d-block">
            Total: {getScenarioTotal()}%
            {getScenarioTotal() > 100 && <span className="text-danger"> (Exceeds 100%!)</span>}
          </small>
        </Form.Group>

        <div className="d-flex gap-3">
          <Button variant="outline-secondary" size="lg" className="flex-grow-1 fw-bold" onClick={() => setActiveTab('outbound')}>← Back</Button>
          <Button variant="success" size="lg" className="flex-grow-1 fw-bold" onClick={savePocOpensData}>💾 Save & Next</Button>
        </div>
      </>
    );
  };

  // PoC Clicks Form Component - Date NON-EDITABLE, Value EDITABLE
  const PoCClicksFormComponent = ({
    pocClicksFormData,
    handlePocClicksChange,
    handlePocClicksNumberChange,
    clicksBarEntries,
    handleClicksBarEntryChange,
    savePocClicksData,
    setActiveTab,
    formatDateForDisplay,
    outboundTotalDelivered,
    pocOpensTotalECsOpened,
    jobRoleEntries,
    jobScenarioEntries,
    handleJobRoleValueChange,
    handleJobScenarioValueChange,
    clicksToOpensError,
    clearClicksToOpensError,
    clicksRoleError,
    clicksScenarioError
  }) => {
    const [localClicksValues, setLocalClicksValues] = useState({});

    useEffect(() => {
      const values = {};
      clicksBarEntries.forEach(entry => {
        values[entry.id] = entry.value;
      });
      setLocalClicksValues(values);
    }, [clicksBarEntries]);

    // Calculate Total ECs Clicked = sum of all bar chart values
    useEffect(() => {
      const totalECsClicked = clicksBarEntries.reduce((sum, entry) => {
        const value = parseFloat(entry.value) || 0;
        return sum + value;
      }, 0);
      const roundedTotal = Math.round(totalECsClicked).toString();

      if (roundedTotal !== pocClicksFormData.totalECsClicked) {
        handlePocClicksNumberChange('totalECsClicked', roundedTotal);
      }
    }, [clicksBarEntries, handlePocClicksNumberChange]);

    // Calculate EC Click Ratio % = (Total ECs Clicked / Total ECs Opened) × 100
    useEffect(() => {
      const totalECsClicked = parseFloat(pocClicksFormData.totalECsClicked) || 0;
      const totalECsOpened = parseFloat(pocOpensTotalECsOpened) || 0;
      let calculatedRatio = '0';
      if (totalECsOpened > 0) {
        calculatedRatio = ((totalECsClicked / totalECsOpened) * 100).toFixed(2);
      }

      if (calculatedRatio !== pocClicksFormData.ecClickRatio) {
        handlePocClicksNumberChange('ecClickRatio', calculatedRatio);
      }
    }, [pocClicksFormData.totalECsClicked, pocOpensTotalECsOpened, pocClicksFormData.ecClickRatio, handlePocClicksNumberChange]);

    const handleClicksValueChange = useCallback((id, value) => {
      setLocalClicksValues(prev => ({ ...prev, [id]: value }));
      clearClicksToOpensError(id);
      const timeoutId = setTimeout(() => {
        handleClicksBarEntryChange(id, 'value', value);
      }, 300);
      return () => clearTimeout(timeoutId);
    }, [handleClicksBarEntryChange, clearClicksToOpensError]);

    const getRoleTotal = () => {
      return jobRoleEntries.reduce((sum, entry) => sum + (parseFloat(entry.value) || 0), 0);
    };

    const getScenarioTotal = () => {
      return jobScenarioEntries.reduce((sum, entry) => sum + (parseFloat(entry.value) || 0), 0);
    };

    return (
      <>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Report Title</Form.Label>
            <input
              type="text"
              value={pocClicksFormData.reportTitle}
              disabled
              className="form-control form-control-sm"
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </Col>
          <Col md={6}>
            <Form.Label>Subtitle</Form.Label>
            <input
              type="text"
              name="reportSubtitle"
              defaultValue={pocClicksFormData.reportSubtitle}
              onBlur={(e) => handlePocClicksChange({ target: { name: 'reportSubtitle', value: e.target.value } })}
              placeholder="Enter subtitle"
              className="form-control form-control-sm"
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={3}>
            <Form.Label>Total ECs Clicked</Form.Label>
            <Form.Control
              type="text"
              value={pocClicksFormData.totalECsClicked}
              disabled
              style={{ backgroundColor: '#f5f5f5' }}
              placeholder="Auto-calculated from bar chart values"
            />
            <small className="text-muted">Auto: Sum of all Bar Chart Values</small>
          </Col>
          <Col md={3}>
            <Form.Label>EC Click Ratio %</Form.Label>
            <Form.Control
              type="text"
              value={pocClicksFormData.ecClickRatio}
              disabled
              style={{ backgroundColor: '#f5f5f5' }}
              placeholder="Auto-calculated"
            />
            <small className="text-muted">Auto: (Total ECs Clicked / Total ECs Opened) × 100</small>
          </Col>
        </Row>

        {/* Bar Chart Values Table - Date NON-EDITABLE, Value EDITABLE */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Bar Chart Values (PoC Engagement Stats (Clicks))</Form.Label>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px' }}>
            <Table responsive bordered size="sm">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Date (Non-Editable - Synced from Opens)</th>
                  <th style={{ width: '45%' }}>Value (Editable)</th>
                  <th style={{ width: '10%' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {clicksBarEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ width: '45%' }}>
                      <input
                        type="text"
                        value={entry.date ? formatDateForDisplay(entry.date) : ''}
                        disabled
                        className="form-control form-control-sm"
                        style={{ backgroundColor: '#f5f5f5' }}
                      />
                    </td>
                    <td style={{ width: '45%' }}>
                      <CustomNumberInput
                        value={localClicksValues[entry.id] !== undefined ? localClicksValues[entry.id] : entry.value}
                        onChange={(value) => handleClicksValueChange(entry.id, value)}
                        placeholder="Enter value"
                      />
                      {clicksToOpensError[entry.id] && (
                        <div className="text-danger mt-1" style={{ fontSize: '12px' }}>
                          {clicksToOpensError[entry.id]}
                        </div>
                      )}
                    </td>
                    <td className="text-center" style={{ width: '10%' }}>
                      <span className="text-success">✓ Date Synced from Opens</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <small className="text-muted mt-2 d-block">
            📅 Date is automatically synced from PoC Opens tab (Non-Editable).
            ✏️ Values entered here will be summed to calculate Total ECs Clicked.
            ⚠️ Values cannot exceed Opens values.
          </small>
        </Form.Group>

        {/* Click Role Distribution Table */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Click Role Distribution</Form.Label>
          {clicksRoleError && (
            <Alert variant="danger" className="mb-2 py-1" style={{ fontSize: '12px' }}>
              {clicksRoleError}
            </Alert>
          )}
          <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px' }}>
            <Table responsive bordered size="sm">
              <thead>
                <tr>
                  <th style={{ width: '60%' }}>Role Name (Synced from Outbound - Non-Editable)</th>
                  <th style={{ width: '40%' }}>Value (%) - Editable</th>
                </tr>
              </thead>
              <tbody>
                {jobRoleEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ width: '60%' }}>
                      <Form.Control
                        type="text"
                        value={entry.role || ''}
                        disabled
                        style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}
                        size="sm"
                      />
                    </td>
                    <td style={{ width: '40%' }}>
                      <CustomNumberInput
                        value={entry.value}
                        onChange={(value) => handleJobRoleValueChange(entry.id, value)}
                        placeholder="Enter percentage"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <small className="text-muted mt-2 d-block">
            Total: {getRoleTotal()}%
            {getRoleTotal() > 100 && <span className="text-danger"> (Exceeds 100%!)</span>}
          </small>
        </Form.Group>

        {/* Job Scenario Distribution Table */}
        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Job Scenario Distribution</Form.Label>
          {clicksScenarioError && (
            <Alert variant="danger" className="mb-2 py-1" style={{ fontSize: '12px' }}>
              {clicksScenarioError}
            </Alert>
          )}
          <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px' }}>
            <Table responsive bordered size="sm">
              <thead>
                <tr>
                  <th style={{ width: '60%' }}>Scenario Name (Synced from Outbound - Non-Editable)</th>
                  <th style={{ width: '40%' }}>Value (%) - Editable</th>
                </tr>
              </thead>
              <tbody>
                {jobScenarioEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ width: '60%' }}>
                      <Form.Control
                        type="text"
                        value={entry.scenario || ''}
                        disabled
                        style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}
                        size="sm"
                      />
                    </td>
                    <td style={{ width: '40%' }}>
                      <CustomNumberInput
                        value={entry.value}
                        onChange={(value) => handleJobScenarioValueChange(entry.id, value)}
                        placeholder="Enter percentage"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <small className="text-muted mt-2 d-block">
            Total: {getScenarioTotal()}%
            {getScenarioTotal() > 100 && <span className="text-danger"> (Exceeds 100%!)</span>}
          </small>
        </Form.Group>

        <div className="d-flex gap-3">
          <Button variant="outline-secondary" size="lg" className="flex-grow-1 fw-bold" onClick={() => setActiveTab('poc-opens')}>← Back</Button>
          <Button variant="success" size="lg" className="flex-grow-1 fw-bold" onClick={savePocClicksData}>💾 Save & Next</Button>
        </div>
      </>
    );
  };

  const savePocOpensData = () => {
    if (Object.keys(opensToOutboundError).length > 0) {
      setPocOpensValidationMessage('❌ Please fix all validation errors (Opens value cannot exceed Outbound value) before saving.');
      return;
    }
    if (opensRoleError) {
      setPocOpensValidationMessage(opensRoleError);
      return;
    }
    if (opensScenarioError) {
      setPocOpensValidationMessage(opensScenarioError);
      return;
    }
    if (!validatePocOpensForm()) {
      return;
    }

    const dataToSave = {
      formData: pocOpensFormData,
      barEntries: opensBarEntries,
      jobRoleEntries: opensJobRoleEntries,
      jobScenarioEntries: opensJobScenarioEntries,
      savedAt: new Date().toISOString()
    };
    setPocOpensData(dataToSave);
    setIsPocOpensSaved(true);
    setPocOpensSaveMessage('PoC Opens data saved successfully!');
    setTimeout(() => setPocOpensSaveMessage(''), 3000);
    setActiveTab('poc-clicks');
  };

  const savePocClicksData = () => {
    if (Object.keys(clicksToOpensError).length > 0) {
      setPocClicksValidationMessage('❌ Please fix all validation errors (Clicks value cannot exceed Opens value) before saving.');
      return;
    }
    if (clicksRoleError) {
      setPocClicksValidationMessage(clicksRoleError);
      return;
    }
    if (clicksScenarioError) {
      setPocClicksValidationMessage(clicksScenarioError);
      return;
    }
    if (!validatePocClicksForm()) {
      return;
    }
    const dataToSave = {
      formData: pocClicksFormData,
      barEntries: clicksBarEntries,
      jobRoleEntries: clicksJobRoleEntries,
      jobScenarioEntries: clicksJobScenarioEntries,
      savedAt: new Date().toISOString()
    };
    setPocClicksData(dataToSave);
    setIsPocClicksSaved(true);
    setPocClicksSaveMessage('PoC Clicks data saved successfully!');
    setTimeout(() => setPocClicksSaveMessage(''), 3000);
    setActiveTab('landing-page');
  };

  const LandingPageFormComponent = () => {
    const [localStateEntries, setLocalStateEntries] = useState(stateEntries);

    useEffect(() => {
      setLocalStateEntries(stateEntries);
    }, [stateEntries]);

    const handleStateEntryChangeLocal = useCallback((id, field, value) => {
      setLocalStateEntries(prev => prev.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
    }, []);

    const handleStateEntryBlur = useCallback((id, field, value) => {
      handleStateEntryChange(id, field, value);
    }, [handleStateEntryChange]);

    const addStateEntryLocal = () => {
      const newId = Date.now();
      const newEntry = { id: newId, state: '', value: '' };
      setLocalStateEntries(prev => [...prev, newEntry]);
      addStateEntry();
    };

    const removeStateEntryLocal = (id) => {
      if (localStateEntries.length > 1) {
        setLocalStateEntries(prev => prev.filter(entry => entry.id !== id));
        removeStateEntry(id);
      }
    };

    return (
      <>
        <Row className="mb-3">
          <Col md={12}>
            <Form.Label>Report Title</Form.Label>
            <input
              type="text"
              value={landingPageFormData.reportTitle}
              disabled
              className="form-control form-control-sm"
              style={{ backgroundColor: '#f5f5f5' }}
            />
            <small className="text-muted">Auto-synced from Outbound tab</small>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={12}>
            <Form.Label>Subtitle</Form.Label>
            <input
              type="text"
              name="reportSubtitle"
              defaultValue={landingPageFormData.reportSubtitle}
              onBlur={(e) => handleLandingPageChange({ target: { name: 'reportSubtitle', value: e.target.value } })}
              placeholder="Enter subtitle"
              className="form-control form-control-sm"
            />
            <small className="text-muted">Editable subtitle for this tab</small>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={3}>
            <Form.Label>Total Users</Form.Label>
            <CustomNumberInput
              value={landingPageFormData.totalUsers}
              onChange={(value) => handleLandingPageNumberChange('totalUsers', value)}
              placeholder="e.g. 209"
            />
          </Col>
          <Col md={3}>
            <Form.Label>Avg. Session</Form.Label>
            <CustomNumberInput
              value={landingPageFormData.avgSession}
              onChange={(value) => handleLandingPageNumberChange('avgSession', value)}
              placeholder="e.g. 50s"
            />
          </Col>
          <Col md={3}>
            <Form.Label>Bounced Users</Form.Label>
            <CustomNumberInput
              value={landingPageFormData.bouncedUsers}
              onChange={(value) => handleLandingPageNumberChange('bouncedUsers', value)}
              placeholder="e.g. 149"
            />
          </Col>
          <Col md={3}>
            <Form.Label>Form Downloads</Form.Label>
            <CustomNumberInput
              value={landingPageFormData.formDownloads}
              onChange={(value) => handleLandingPageNumberChange('formDownloads', value)}
              placeholder="e.g. 60"
            />
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={3}>
            <Form.Label>Bounce Rate %</Form.Label>
            <Form.Control
              type="text"
              value={landingPageFormData.bounceRate}
              disabled
              style={{ backgroundColor: '#f5f5f5' }}
              placeholder="Auto-calculated"
            />
            <small className="text-muted">Auto: (Bounced Users / Total Users) × 100</small>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Audience Location Overview (For Bar Chart)</Form.Label>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px' }}>
            <Table responsive bordered size="sm">
              <thead>
                <tr>
                  <th style={{ width: '70%' }}>State/Region</th>
                  <th style={{ width: '20%' }}>Value (Users/Count)</th>
                  <th style={{ width: '10%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {localStateEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ width: '70%' }}>
                      <input
                        type="text"
                        value={entry.state}
                        onChange={(e) => handleStateEntryChangeLocal(entry.id, 'state', e.target.value)}
                        onBlur={(e) => handleStateEntryBlur(entry.id, 'state', e.target.value)}
                        placeholder="e.g. FL, OK, NY"
                        className="form-control form-control-sm"
                        autoComplete="off"
                      />
                    </td>
                    <td style={{ width: '20%' }}>
                      <input
                        type="text"
                        value={entry.value}
                        onChange={(e) => handleStateEntryChangeLocal(entry.id, 'value', e.target.value)}
                        onBlur={(e) => handleStateEntryBlur(entry.id, 'value', e.target.value)}
                        placeholder="e.g. 45"
                        className="form-control form-control-sm"
                        autoComplete="off"
                      />
                    </td>
                    <td className="text-center" style={{ width: '10%' }}>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeStateEntryLocal(entry.id)}
                        disabled={localStateEntries.length === 1}
                      >
                        ×
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={addStateEntryLocal}
            className="mt-2"
            style={{ width: '100%' }}
          >
            + Add New Location
          </Button>
        </Form.Group>

        <div className="d-flex gap-3">
          <Button variant="outline-secondary" size="lg" className="flex-grow-1 fw-bold" onClick={() => setActiveTab('poc-clicks')}>← Back</Button>
          <Button variant="success" size="lg" className="flex-grow-1 fw-bold" onClick={saveLandingPageData}>💾 Save & Next</Button>
        </div>
      </>
    );
  };

  const WebVitalsFormComponent = () => (
    <>
      <Row className="mb-3">
        <Col md={12}>
          <Form.Label>Report Title</Form.Label>
          <input
            type="text"
            value={webVitalsFormData.reportTitle}
            disabled
            className="form-control form-control-sm"
            style={{ backgroundColor: '#f5f5f5' }}
          />
          <small className="text-muted">Auto-synced from Outbound tab</small>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={12}>
          <Form.Label>Subtitle</Form.Label>
          <input
            type="text"
            name="reportSubtitle"
            defaultValue={webVitalsFormData.reportSubtitle}
            onBlur={(e) => handleWebVitalsChange({ target: { name: 'reportSubtitle', value: e.target.value } })}
            placeholder="Enter subtitle"
            className="form-control form-control-sm"
          />
          <small className="text-muted">Editable subtitle for this tab</small>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Label>Avg. Page Load Speed (s)</Form.Label>
          <CustomNumberInput
            value={webVitalsFormData.avgPageLoadSpeed}
            onChange={(value) => handleWebVitalsNumberChange('avgPageLoadSpeed', value)}
            placeholder="e.g. 4.4"
          />
        </Col>
        <Col md={3}>
          <Form.Label>Structure Metrix (%)</Form.Label>
          <CustomNumberInput
            value={webVitalsFormData.structureMetrix}
            onChange={(value) => handleWebVitalsNumberChange('structureMetrix', value)}
            placeholder="e.g. 80"
          />
        </Col>
        <Col md={3}>
          <Form.Label>Largest Element (LCP) (s)</Form.Label>
          <CustomNumberInput
            value={webVitalsFormData.largestElementLCP}
            onChange={(value) => handleWebVitalsNumberChange('largestElementLCP', value)}
            placeholder="e.g. 2.9"
          />
        </Col>
        <Col md={3}>
          <Form.Label>TBT Script Blocks (MS)</Form.Label>
          <CustomNumberInput
            value={webVitalsFormData.tbtScriptBlocks}
            onChange={(value) => handleWebVitalsNumberChange('tbtScriptBlocks', value)}
            placeholder="e.g. 94"
          />
        </Col>
      </Row>

      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">Upload Screenshot/Image</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleScreenshotUpload}
          size="sm"
        />
        {screenshotImage && (
          <div className="mt-2">
            <img src={screenshotImage} alt="Preview" style={{ maxHeight: '100px', borderRadius: '4px' }} />
          </div>
        )}
      </Form.Group>

      <div className="d-flex gap-3">
        <Button variant="outline-secondary" size="lg" className="flex-grow-1 fw-bold" onClick={() => setActiveTab('landing-page')}>← Back</Button>
        <Button variant="success" size="lg" className="flex-grow-1 fw-bold" onClick={saveWebVitalsData}>💾 Save Web Vitals Data</Button>
        <Button type="button" size="lg" className="flex-grow-1 fw-bold border-0" style={{ backgroundColor: '#4db69f' }} onClick={generateCompletePDF} disabled={!isOutboundSaved || !isPocOpensSaved || !isPocClicksSaved || !isLandingPageSaved || !isWebVitalsSaved}>
          📄 Download PDF
        </Button>
      </div>
    </>
  );

  const generateCompletePDF = async () => {
    if (!isOutboundSaved || !isPocOpensSaved || !isPocClicksSaved || !isLandingPageSaved || !isWebVitalsSaved) {
      alert('Please save all data (Outbound, PoC Opens, PoC Clicks, Landing Page, and Web Page Vitals) before generating PDF!');
      return;
    }

    if (!outboundData || !pocOpensData || !pocClicksData || !landingPageData || !webVitalsData) {
      alert('Some data is missing. Please ensure all sections have been saved.');
      return;
    }

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    try {
      const addPageToPDF = async (elementCreator, pdfDoc, isFirstPage = false) => {
        const element = elementCreator();
        document.body.appendChild(element);

        const actualWidth = element.offsetWidth;
        const actualHeight = element.offsetHeight;

        const pdfWidth = 297;
        const pdfHeight = 210;

        const scale = pdfWidth / (actualWidth / 3.78);
        const scaledHeight = (actualHeight / 3.78) * scale;

        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          logging: false,
          allowTaint: false,
          backgroundColor: '#fdfbf2',
          windowWidth: actualWidth,
          windowHeight: actualHeight
        });

        const imgData = canvas.toDataURL('image/png');

        if (isFirstPage) {
          pdfDoc.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);
        } else {
          const yOffset = Math.max(0, (pdfHeight - scaledHeight) / 2);
          pdfDoc.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, scaledHeight);
        }

        document.body.removeChild(element);
      };

      await addPageToPDF(createCampaignPage, pdf, true);
      pdf.addPage();
      await addPageToPDF(() => createOutboundPageWithDynamicHeight(), pdf, false);
      pdf.addPage();
      await addPageToPDF(() => createPocOpensPageWithNoSpacing(), pdf, false);
      pdf.addPage();
      await addPageToPDF(() => createPocClicksPageWithNoSpacing(), pdf, false);
      pdf.addPage();
      await addPageToPDF(() => createLandingPageWithNoSpacing(), pdf, false);
      pdf.addPage();
      await addPageToPDF(createWebVitalsPage, pdf, false);

      pdf.save('Complete_Campaign_Report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    }
  };

  const createCampaignPage = () => {
    const div = document.createElement('div');
    div.style.width = '1122px';
    div.style.height = '794px';
    div.style.backgroundColor = '#fdfcf0';
    div.style.position = 'relative';
    div.style.boxSizing = 'border-box';
    div.style.fontFamily = '"Inter", "Helvetica Neue", Arial, sans-serif';
    div.style.display = 'flex';
    div.style.overflow = 'hidden';

    // --- Dynamic Date ---
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    // --- Image URLs ---
    const bookCoverUrl = "https://picsum.photos/seed/report/300/400";
    // Aapka provided Logo URL
    const logoUrl = "https://media.licdn.com/dms/image/v2/D4D0BAQF8tBleLHtOoA/company-logo_200_200/B4DZhxnf90HYAI-/0/1754252837229/b2bindemand_logo?e=2147483647&v=beta&t=qo2BaNcIxWJCCOsYwA-iI5KcaCvz5-3OCiRLl65oENQ";

    div.innerHTML = `
    <div style="width: 240px; height: 100%; background: #ffffff; position: relative; display: flex; align-items: center; justify-content: flex-end;">
      <img src="${bookCoverUrl}" 
           alt="Cover" 
           style="width: 280px; height: 400px; object-fit: cover; z-index: 5; transform: translateX(140px); box-shadow: -15px 15px 35px rgba(0,0,0,0.2); border-radius: 4px;"
           onerror="this.style.backgroundColor='#4db69f'; this.alt='Cover Load Failed';" />
    </div>

    <div style="flex: 1; padding: 60px 80px; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
      
      <div style="display: flex; flex-direction: column; align-items: flex-end;">
        <img src="${logoUrl}" 
             alt="Ventes Logo" 
             style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 5px;" 
             onerror="this.style.display='none';" />
        <div style="color: #4db69f; font-weight: bold; font-size: 14px; letter-spacing: 0.5px;">
           B2B Technologies Inc.
        </div>
      </div>

      <div style="margin-top: -20px; padding-left: 100px;">
        <h1 style="color: #444; font-size: 85px; font-weight: 800; line-height: 0.9; margin: 0; letter-spacing: -3px;">
          Campaign<br/>Performance<br/>Report
        </h1>
        
        <div style="margin-top: 60px;">
          <h2 style="color: #555; font-size: 34px; font-weight: 700; margin: 0; line-height: 1.2;">
            "Bridging the Gap between<br/>Cannabusinesses and Insurers"
          </h2>
          <p style="color: #b0b0b0; font-style: italic; font-size: 20px; margin-top: 15px;">
            Secrets for an impressive and informative talk
          </p>
        </div>
      </div>

      <div style="text-align: right; padding-bottom: 20px;">
        <p style="color: #444; font-size: 24px; font-weight: 400; margin: 0;">
          For Team 2X  |  Date ${formattedDate}
        </p>
      </div>
    </div>
  `;

    return div;
  };

  const createOutboundPageWithDynamicHeight = () => {
    const data = outboundData;
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const reportTitle = data.formData.reportTitle || 'Campaign Report';
    const startDate = formatDate(data.formData.startDate);
    const endDate = formatDate(data.formData.endDate);
    const dateRange = `${startDate} - ${endDate}`;

    const validEntries = data.pacingEntries.filter(e => e.date && e.value);
    const values = validEntries.map(entry => parseFloat(entry.value) || 0);
    const maxValue = Math.max(...values, 2500);

    let graphHeight = 150;
    if (maxValue > 5000) graphHeight = 200;
    if (maxValue > 10000) graphHeight = 250;
    if (maxValue > 20000) graphHeight = 300;

    const w = 550;
    const h = graphHeight;
    const xStep = validEntries.length > 1 ? w / (validEntries.length - 1) : 0;
    const points = values.map((v, i) => `${i * xStep},${h - (v / maxValue * h)}`).join(' ');
    const areaPoints = values.map((v, i) => `${i * xStep},${h - (v / maxValue * h)}`).join(' ');
    const area = `0,${h} ${areaPoints} ${w},${h}`;

    const jobRoleData = data.jobRoleEntries?.filter(e => e.role && e.value) || [];
    let jobRolePieChartHtml = '';
    if (jobRoleData.length > 0) {
      const totalValue = jobRoleData.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
      const colors = ['#7d8bb1', '#a2bad0', '#d1eef4', '#4db69f', '#f4a261', '#e76f51', '#2a9d8f', '#e9c46a'];

      let pieSegments = '';
      let labelsHtml = '';
      let currentAngle = 0;
      const centerX = 105;
      const centerY = 105;
      const radius = 80;

      jobRoleData.forEach((item, index) => {
        const value = parseFloat(item.value) || 0;
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
        const angle = (percentage / 100) * 360;

        if (angle > 0) {
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          const startRad = (startAngle - 90) * Math.PI / 180;
          const endRad = (endAngle - 90) * Math.PI / 180;
          const x1 = centerX + radius * Math.cos(startRad);
          const y1 = centerY + radius * Math.sin(startRad);
          const x2 = centerX + radius * Math.cos(endRad);
          const y2 = centerY + radius * Math.sin(endRad);
          const largeArc = angle > 180 ? 1 : 0;

          pieSegments += `<path d="M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z" fill="${colors[index % colors.length]}" stroke="white" stroke-width="2" />`;

          const midAngle = startAngle + (angle / 2);
          const labelRad = (midAngle - 90) * Math.PI / 180;

          let labelDistance = radius + 45;
          if (percentage < 15) labelDistance = radius + 55;
          if (percentage > 30) labelDistance = radius + 40;

          const labelX = centerX + labelDistance * Math.cos(labelRad);
          const labelY = centerY + labelDistance * Math.sin(labelRad);
          let textAnchor = 'middle';
          let xOffset = 0;
          let yOffset = 0;

          if (midAngle >= 0 && midAngle < 90) {
            textAnchor = 'start';
            xOffset = 5;
            yOffset = -5;
          } else if (midAngle >= 90 && midAngle < 180) {
            textAnchor = 'end';
            xOffset = -5;
            yOffset = -5;
          } else if (midAngle >= 180 && midAngle < 270) {
            textAnchor = 'end';
            xOffset = -5;
            yOffset = 5;
          } else {
            textAnchor = 'start';
            xOffset = 5;
            yOffset = 5;
          }

          labelsHtml += `
          <div style="position: absolute; left: ${labelX + xOffset}px; top: ${labelY + yOffset}px; transform: translate(${textAnchor === 'middle' ? '-50%' : (textAnchor === 'start' ? '0%' : '-100%')}, -50%); background: white; padding: 6px 12px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.12); white-space: nowrap; font-size: 12px; font-weight: 600; color: #333; border: 1px solid #e0e0e0; z-index: 10;">
            ${item.role}: ${percentage.toFixed(1)}%
          </div>
        `;
        }
        currentAngle += angle;
      });

      jobRolePieChartHtml = `
      <div style="margin-top: 20px; width: 100%; page-break-inside: avoid;">
        <div style="background-color: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h4 style="color: #444; margin-bottom: 20px; text-align: center; font-size: 18px; font-weight: 600;">Job Role Distribution</h4>
          <div style="position: relative; width: 100%; min-height: 320px; display: flex; justify-content: center;">
            <div style="position: relative; width: 300px; height: 300px;">
              <svg width="300" height="300" viewBox="0 0 210 210" style="display: block; margin: 0 auto;">
                ${pieSegments}
                <circle cx="${centerX}" cy="${centerY}" r="35" fill="#fdfbf2" />
              </svg>
              ${labelsHtml}
            </div>
          </div>
          <div style="margin-top: 20px; display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; padding-top: 10px; border-top: 1px solid #f0f0f0;">
            ${jobRoleData.map((item, idx) => {
        const percentage = ((parseFloat(item.value) || 0) / totalValue * 100).toFixed(1);
        return `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 12px; height: 12px; background-color: ${colors[idx % colors.length]}; border-radius: 3px;"></div>
                  <span style="font-size: 12px; color: #555;"><strong>${item.role}</strong>: ${percentage}%</span>
                </div>
              `;
      }).join('')}
          </div>
        </div>
      </div>
    `;
    } else {
      jobRolePieChartHtml = `
      <div style="margin-top: 20px; width: 100%;">
        <div style="background-color: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center;">
          <h4 style="color: #444; margin-bottom: 20px;">Job Role Distribution</h4>
          <p style="color: #999;">No role distribution data available</p>
        </div>
      </div>
    `;
    }

    const jobScenarioData = data.jobScenarioEntries?.filter(e => e.scenario && e.value) || [];
    let jobScenarioCardsHtml = '';
    if (jobScenarioData.length > 0) {
      jobScenarioCardsHtml = `
      <div style="display: flex; gap: 15px; margin-top: 20px; flex-wrap: wrap;">
        ${jobScenarioData.map(item => `
          <div style="flex: 1; min-width: 120px; background: #fff; padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h5 style="color: #aaa; font-size: 16px; font-weight: 400; margin-bottom: 8px;">${item.scenario}</h5>
            <div style="font-size: 48px; font-weight: bold; color: #444;">${item.value}%</div>
          </div>
        `).join('')}
      </div>
    `;
    } else {
      jobScenarioCardsHtml = `
      <div style="margin-top: 20px; text-align: center; padding: 20px; background: #fff; border-radius: 8px;">
        <p style="color: #999;">No scenario distribution data available</p>
      </div>
    `;
    }

    const bounceRate = parseFloat(data.formData.bounceRate) || 0;
    const maxBounce = 100;
    const radius = 80;
    const circumference = 2 * Math.PI * radius; // 502.65
    const strokeDashoffset = circumference * (1 - (bounceRate / maxBounce));

    // Alternative simpler calculation
    const bouncePercentage = Math.min(bounceRate, 100);
    const dashOffsetValue = 251 * (1 - (bouncePercentage / 100)); // 251 is for 80 radius

    // In the div.innerHTML, replace the Bounce Rate SVG section with:

    const dateLabels = validEntries.map(entry => {
      const formattedDate = entry.date ? formatDate(entry.date) : '';
      const shortDate = formattedDate.split('/').slice(0, 2).join('/');
      return `<span style="text-align: center; flex: 1; font-size: ${validEntries.length > 7 ? '8px' : '10px'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${shortDate}</span>`;
    }).join('');

    const div = document.createElement('div');
    div.style.width = '1122px';
    div.style.height = 'auto';
    div.style.backgroundColor = '#fdfbf2';
    div.style.padding = '40px';
    div.style.boxSizing = 'border-box';
    div.style.fontFamily = 'Arial, sans-serif';

    div.innerHTML = `
    <div style="background-color: #545454; padding: 18px 40px; border-left: 15px solid #4db69f; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="color: #fff; margin: 0; font-size: 36px; font-weight: 400;">${reportTitle}</h1>
        <div style="color: #fff; margin-top: 5px; font-size: 18px; opacity: 0.9;">Outbound Performance</div>
      </div>
      <div style="color: #fff; font-size: 16px; opacity: 0.8; text-align: right;">
        ${dateRange}
      </div>
    </div>
    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
      <div style="width: 330px;">
        <div style="background-color: #4db69f; color: #fff; padding: 40px 20px; text-align: center; border-radius: 8px;">
          <h4 style="font-weight: 400; font-size: 24px; margin-bottom: 20px;">Total Emails Sent</h4>
          <div style="font-size: 80px; font-weight: bold;">${data.formData.totalEmailsSent}</div>
        </div>
        ${jobRolePieChartHtml}
      </div>
      <div style="flex: 1;">
        <div style="display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
          <div style="flex: 1; background: #fff; padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h5 style="color: #aaa;">Total Delivered</h5>
            <div style="font-size: 48px; font-weight: bold;">${data.formData.totalEmailsDelivered}</div>
          </div>
          <div style="flex: 1; background: #fff; padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h5 style="color: #aaa;">Daily Avg Sends</h5>
            <div style="font-size: 48px; font-weight: bold;">${data.formData.dailyAvgSends}</div>
          </div>
          <div style="flex: 1; background: #fff; padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h5 style="color: #aaa;">Hard Bounced</h5>
            <div style="font-size: 48px; font-weight: bold;">${data.formData.totalHardBounced}</div>
          </div>
        </div>
        <div style="display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
          <div style="width: 230px; background: #fff; padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
  <h5 style="color: #aaa;">Bounce Rate</h5>
  <div style="text-align: center; position: relative;">
    <svg width="180" height="120" viewBox="0 0 180 120">
      <!-- Background arc (gray) -->
      <path d="M 20 100 A 80 80 0 0 1 160 100" fill="none" stroke="#e0e0e0" stroke-width="15" stroke-linecap="round" />
      <!-- Foreground arc (green) based on bounce rate -->
      <path d="M 20 100 A 80 80 0 0 1 160 100" fill="none" stroke="#28a745" stroke-width="15" stroke-linecap="round" 
        stroke-dasharray="251" 
        stroke-dashoffset="${251 * (1 - (bounceRate / 100))}" />
      <!-- Needle -->
      <line x1="90" y1="100" x2="90" y2="50" stroke="#28a745" stroke-width="3" stroke-linecap="round" 
        transform="rotate(${(bounceRate / 100) * 180 - 90}, 90, 100)" />
      <!-- Center circle -->
      <circle cx="90" cy="100" r="8" fill="#28a745" />
    </svg>
    <div style="font-size: 48px; font-weight: bold; color: #444; margin-top: 10px;">${bounceRate}%</div>
  </div>
  <small style="color: #888; font-size: 12px;">0% - Low | 100% - High</small>
</div>
          <div style="flex: 1; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h5 style="color: #aaa; text-align: right;">Daily Pacing Dynamic</h5>
            <div style="display: flex; margin-top: 15px;">
              <div style="height: ${h}px; display: flex; flex-direction: column; justify-content: space-between; font-size: 12px; color: #bbb; padding-right: 12px;">
                <span>${maxValue}</span>
                <span>${Math.floor(maxValue / 2)}</span>
                <span>0</span>
              </div>
              <div style="flex: 1; border-left: 1px solid #eee; border-bottom: 1px solid #eee;">
                <svg width="100%" height="${h}" viewBox="0 0 550 ${h}" preserveAspectRatio="none">
                  <polyline points="${area}" fill="#9bd9cc" fill-opacity="0.4" />
                  <polyline points="${points}" fill="none" stroke="#4db69f" stroke-width="3" />
                </svg>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 10px; color: #bbb; font-size: 11px; padding-left: 45px;">
              ${dateLabels}
            </div>
          </div>
        </div>
        ${jobScenarioCardsHtml}
      </div>
    </div>
  `;
    return div;
  };

  const getDynamicBarChartHeight = (bars) => {
    if (!bars || bars.length === 0) return 180;
    const numBars = bars.length;
    const maxValue = Math.max(...bars.map(b => b.value), 100);
    let height = 180;
    if (numBars <= 3) height = 180;
    else if (numBars <= 5) height = 220;
    else if (numBars <= 7) height = 280;
    else height = 340;
    if (maxValue > 150) height += 30;
    if (maxValue > 250) height += 40;
    return Math.min(height, 400);
  };

  const createPocOpensPageWithNoSpacing = () => {
    const data = pocOpensData;
    const outbound = outboundData;

    const reportTitle =
      outbound?.formData?.reportTitle ||
      data.formData.reportTitle ||
      "Campaign Report";

    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      if (isNaN(d.getTime())) return "";
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${d.getFullYear()}`;
    };

    const dateRange = `${formatDate(outbound?.formData?.startDate)} - ${formatDate(outbound?.formData?.endDate)}`;

    const formatDateForDisplayFn = (dateString) => {
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
    };

    const bars = data.barEntries
      .filter((e) => e.date && e.value)
      .map((e) => ({
        label: formatDateForDisplayFn(e.date),
        value: parseInt(e.value) || 0,
      }));

    const maxValue = Math.max(...bars.map((b) => b.value), 1);

    // Calculate dynamic height based on number of bars
    const getDynamicHeight = () => {
      const barCount = bars.length;
      if (barCount <= 3) return 200;
      if (barCount <= 5) return 280;
      if (barCount <= 7) return 360;
      return 440;
    };

    const containerHeight = getDynamicHeight();
    const individualBarHeight = Math.max(30, Math.min(45, (containerHeight - 60) / bars.length));

    let barChartHtml = "";
    if (bars.length > 0) {
      barChartHtml = bars
        .map((bar) => {
          const percentage = (bar.value / maxValue) * 100;
          return `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
          <div style="width:65px;font-size:11px;color:#555;font-weight:600;text-align:right;">
            ${bar.label}
          </div>
          <div style="flex:1;background:#e6e6e6;height:${individualBarHeight}px;border-radius:8px;">
            <div style="width:${percentage}%;background:linear-gradient(90deg,#4db69f,#3a8f7c);height:100%;display:flex;align-items:center;justify-content:flex-end;padding-right:10px;color:#fff;font-size:12px;font-weight:600;border-radius:8px;">
              ${bar.value}
            </div>
          </div>
        </div>`;
        })
        .join("");
    } else {
      barChartHtml = '<div style="text-align:center;padding:40px;color:#999;">No data</div>';
    }

    // Open Role Distribution Pie Chart
    const openRoleData = data.jobRoleEntries?.filter(e => e.role && e.value) || [];
    let openRolePieChartHtml = '';

    if (openRoleData.length > 0) {
      const totalValue = openRoleData.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
      const colors = ['#7d8bb1', '#a2bad0', '#d1eef4', '#4db69f', '#f4a261', '#e76f51', '#2a9d8f', '#e9c46a'];

      let pieSegments = '';
      let labelsHtml = '';
      let currentAngle = 0;

      const centerX = 130;
      const centerY = 130;
      const radius = 65;

      openRoleData.forEach((item, index) => {
        const value = parseFloat(item.value) || 0;
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
        const angle = (percentage / 100) * 360;

        if (angle > 0) {
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          const startRad = (startAngle - 90) * Math.PI / 180;
          const endRad = (endAngle - 90) * Math.PI / 180;

          const x1 = centerX + radius * Math.cos(startRad);
          const y1 = centerY + radius * Math.sin(startRad);
          const x2 = centerX + radius * Math.cos(endRad);
          const y2 = centerY + radius * Math.sin(endRad);

          const largeArc = angle > 180 ? 1 : 0;

          pieSegments += `
        <path d="M ${centerX},${centerY}
        L ${x1},${y1}
        A ${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z"
        fill="${colors[index % colors.length]}"
        stroke="white"
        stroke-width="2" />
      `;

          const midAngle = startAngle + angle / 2;
          const labelRad = (midAngle - 90) * Math.PI / 180;
          const labelDistance = radius + 10;
          const labelX = centerX + labelDistance * Math.cos(labelRad);
          const labelY = centerY + labelDistance * Math.sin(labelRad);
          const textAnchor = labelX > centerX ? 'start' : 'end';
          const roleName = item.role.length > 14 ? item.role.slice(0, 12) + '..' : item.role;

          labelsHtml += `
        <text 
          x="${labelX}" 
          y="${labelY}" 
          text-anchor="${textAnchor}" 
          dominant-baseline="middle"
          style="font-size:11px; font-weight:600; fill:#333;">
          ${roleName} (${percentage.toFixed(1)}%)
        </text>
      `;
        }

        currentAngle += angle;
      });

      openRolePieChartHtml = `
    <div style="background:#fff;padding:20px 10px;border-radius:14px;overflow:visible;">
      <div style="font-size:13px;font-weight:600;margin-bottom:10px;text-align:center;">
        Open Role Distribution
      </div>
      <svg width="340" height="340" viewBox="0 0 260 260" 
        style="margin:auto;display:block;overflow:visible;">
        ${pieSegments}
        <circle cx="${centerX}" cy="${centerY}" r="28" fill="#fdfbf2" />
        ${labelsHtml}
      </svg>
    </div>
  `;
    } else {
      openRolePieChartHtml = '<div style="background:#fff;padding:15px;border-radius:14px;text-align:center;color:#999;">No role distribution data</div>';
    }

    // Get values from Job Scenario Distribution for Manager and Director
    const jobScenarioData = data.jobScenarioEntries?.filter(e => e.scenario && e.value) || [];

    const findScenarioValue = (scenarioName) => {
      const scenario = jobScenarioData.find(
        item => item.scenario?.toLowerCase() === scenarioName.toLowerCase()
      );
      return scenario ? parseFloat(scenario.value) || 0 : 0;
    };

    const openManagerValue = findScenarioValue('Manager');
    const openDirectorValue = findScenarioValue('Director');

    const div = document.createElement("div");
    div.style.width = "1122px";
    div.style.backgroundColor = "#fdfbf2";
    div.style.padding = "25px 35px";
    div.style.fontFamily = "Arial, sans-serif";
    div.style.display = "flex";
    div.style.flexDirection = "column";

    const ecOpenRatio = parseFloat(data.formData.ecOpenRatio) || 0;
    const circumference = 2 * Math.PI * 55;
    const dashoffset = circumference * (1 - (ecOpenRatio / 100));

    // Calculate the maximum height among left and center sections to align properly
    const leftSectionHeight = 320 + (openRoleData.length > 0 ? 340 : 100);
    const centerSectionHeight = 400;
    const rightSectionDynamicHeight = containerHeight + 80;
    const maxSectionHeight = Math.max(leftSectionHeight, centerSectionHeight, rightSectionDynamicHeight);

    div.innerHTML = `
  <div style="background:#545454;padding:18px 40px;border-left:15px solid #4db69f;margin-bottom:20px;border-radius:8px;display:flex;justify-content:space-between;">
    <div>
      <h1 style="color:#fff;margin:0;font-size:32px;">${reportTitle}</h1>
      <div style="color:#ddd;font-size:14px;">PoC Engagement Stats (Opens)</div>
    </div>
    <div style="color:#ccc;font-size:13px;">${dateRange}</div>
  </div>

  <div style="display:flex;gap:20px;align-items:stretch;min-height:${maxSectionHeight}px;">
    <!-- LEFT SECTION -->
    <div style="width:320px;display:flex;flex-direction:column;gap:15px;">
      <div style="background:linear-gradient(135deg,#4db69f,#3a8f7c);color:#fff;padding:20px;border-radius:14px;text-align:center;">
        <div style="font-size:14px;margin-bottom:8px;">Total ECs Opened</div>
        <div style="font-size:52px;font-weight:bold;">${data.formData.totalECsOpened || 0}</div>
      </div>
      ${openRolePieChartHtml}
    </div>

    <!-- CENTER SECTION -->
    <div style="width:240px;display:flex;flex-direction:column;gap:15px;justify-content:center;">
      <div style="background:#fff;padding:18px;border-radius:14px;text-align:center;">
        <div style="font-size:12px;color:#888;margin-bottom:10px;">EC Open Ratio</div>
        <svg width="140" height="140" viewBox="0 0 140 140" style="margin:0 auto;">
          <circle cx="70" cy="70" r="55" fill="transparent" stroke="#e0e0e0" stroke-width="12" />
          <circle cx="70" cy="70" r="55" fill="transparent" stroke="#76e5eb" stroke-width="12" 
            stroke-dasharray="${circumference}" 
            stroke-dashoffset="${dashoffset}" 
            stroke-linecap="round" transform="rotate(-90 70 70)" />
          <text x="70" y="78" text-anchor="middle" font-size="22" font-weight="bold" fill="#333">${ecOpenRatio}%</text>
        </svg>
      </div>

      <div style="background:#fff;padding:14px;border-radius:14px;display:flex;justify-content:space-between;">
        <span style="font-size:13px;color:#777;">Open Manager</span>
        <span style="font-size:22px;font-weight:bold;color:#4db69f;">${openManagerValue}%</span>
      </div>

      <div style="background:#fff;padding:14px;border-radius:14px;display:flex;justify-content:space-between;">
        <span style="font-size:13px;color:#777;">Open Director</span>
        <span style="font-size:22px;font-weight:bold;color:#4db69f;">${openDirectorValue}%</span>
      </div>
    </div>

    <!-- RIGHT SECTION - Daily Pacing Dynamic with dynamic height and centered vertically -->
    <div style="flex:1;background:#fff;padding:20px;border-radius:14px;display:flex;flex-direction:column;justify-content:center;">
      <div style="text-align:center;margin-bottom:10px;">
        <span style="font-size:12px;color:#4db69f;font-weight:700;">📊 DAILY PACING DYNAMIC</span>
      </div>
      <div style="text-align:right;margin-bottom:10px;color:#aaa;font-size:11px;font-style:italic;">
        Synced from Outbound Performance
      </div>
      <div style="max-height:${containerHeight}px;overflow-y:auto;padding-right:8px;">
        ${barChartHtml}
      </div>
      <div style="margin-top:12px;font-size:11px;color:#999;text-align:center;">
        ${bars.length} entries • Max ${maxValue}
      </div>
    </div>
  </div>
`;

    return div;
  };

  const createPocClicksPageWithNoSpacing = () => {
    const data = pocClicksData;
    const outbound = outboundData;

    const reportTitle =
      outbound?.formData?.reportTitle ||
      data.formData.reportTitle ||
      "Campaign Report";

    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      if (isNaN(d.getTime())) return "";
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${d.getFullYear()}`;
    };

    const dateRange = `${formatDate(outbound?.formData?.startDate)} - ${formatDate(outbound?.formData?.endDate)}`;

    const formatDateForDisplayFn = (dateString) => {
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
    };

    const bars = data.barEntries
      .filter((e) => e.date && e.value)
      .map((e) => ({
        label: formatDateForDisplayFn(e.date),
        value: parseInt(e.value) || 0,
      }));

    const maxValue = Math.max(...bars.map((b) => b.value), 1);

    // Calculate dynamic height based on number of bars
    const getDynamicHeight = () => {
      const barCount = bars.length;
      if (barCount <= 3) return 200;
      if (barCount <= 5) return 280;
      if (barCount <= 7) return 360;
      return 440;
    };

    const containerHeight = getDynamicHeight();
    const individualBarHeight = Math.max(30, Math.min(45, (containerHeight - 60) / bars.length));

    let barChartHtml = "";
    if (bars.length > 0) {
      barChartHtml = bars
        .map((bar) => {
          const percentage = (bar.value / maxValue) * 100;
          return `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
          <div style="width:65px;font-size:11px;color:#555;font-weight:600;text-align:right;">
            ${bar.label}
          </div>
          <div style="flex:1;background:#e6e6e6;height:${individualBarHeight}px;border-radius:8px;">
            <div style="width:${percentage}%;background:linear-gradient(90deg,#4db69f,#3a8f7c);height:100%;display:flex;align-items:center;justify-content:flex-end;padding-right:10px;color:#fff;font-size:12px;font-weight:600;border-radius:8px;">
              ${bar.value}
            </div>
          </div>
        </div>`;
        })
        .join("");
    } else {
      barChartHtml = '<div style="text-align:center;padding:40px;color:#999;">No data</div>';
    }

    // Click Role Distribution Pie Chart
    const clickRoleData = data.jobRoleEntries?.filter(e => e.role && e.value) || [];
    let clickRolePieChartHtml = '';

    if (clickRoleData.length > 0) {
      const totalValue = clickRoleData.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
      const colors = ['#7d8bb1', '#a2bad0', '#d1eef4', '#4db69f', '#f4a261', '#e76f51', '#2a9d8f', '#e9c46a'];

      let pieSegments = '';
      let labelsHtml = '';
      let currentAngle = 0;

      const centerX = 130;
      const centerY = 130;
      const radius = 65;

      clickRoleData.forEach((item, index) => {
        const value = parseFloat(item.value) || 0;
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
        const angle = (percentage / 100) * 360;

        if (angle > 0) {
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          const startRad = (startAngle - 90) * Math.PI / 180;
          const endRad = (endAngle - 90) * Math.PI / 180;

          const x1 = centerX + radius * Math.cos(startRad);
          const y1 = centerY + radius * Math.sin(startRad);
          const x2 = centerX + radius * Math.cos(endRad);
          const y2 = centerY + radius * Math.sin(endRad);

          const largeArc = angle > 180 ? 1 : 0;

          pieSegments += `
        <path d="M ${centerX},${centerY}
        L ${x1},${y1}
        A ${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z"
        fill="${colors[index % colors.length]}"
        stroke="white"
        stroke-width="2" />
      `;

          const midAngle = startAngle + angle / 2;
          const labelRad = (midAngle - 90) * Math.PI / 180;
          const labelDistance = radius + 10;
          const labelX = centerX + labelDistance * Math.cos(labelRad);
          const labelY = centerY + labelDistance * Math.sin(labelRad);
          const textAnchor = labelX > centerX ? 'start' : 'end';
          const roleName = item.role.length > 14 ? item.role.slice(0, 12) + '..' : item.role;

          labelsHtml += `
        <text 
          x="${labelX}" 
          y="${labelY}" 
          text-anchor="${textAnchor}" 
          dominant-baseline="middle"
          style="font-size:11px; font-weight:600; fill:#333;">
          ${roleName} (${percentage.toFixed(1)}%)
        </text>
      `;
        }

        currentAngle += angle;
      });

      clickRolePieChartHtml = `
    <div style="background:#fff;padding:20px 10px;border-radius:14px;overflow:visible;">
      <div style="font-size:13px;font-weight:600;margin-bottom:10px;text-align:center;">
        Click Role Distribution
      </div>
      <svg width="340" height="340" viewBox="0 0 260 260" 
        style="margin:auto;display:block;overflow:visible;">
        ${pieSegments}
        <circle cx="${centerX}" cy="${centerY}" r="28" fill="#fdfbf2" />
        ${labelsHtml}
      </svg>
    </div>
  `;
    } else {
      clickRolePieChartHtml = '<div style="background:#fff;padding:15px;border-radius:14px;text-align:center;color:#999;">No role distribution data</div>';
    }

    // Get values from Job Scenario Distribution for Manager and Director
    const jobScenarioData = data.jobScenarioEntries?.filter(e => e.scenario && e.value) || [];

    const findScenarioValue = (scenarioName) => {
      const scenario = jobScenarioData.find(
        item => item.scenario?.toLowerCase() === scenarioName.toLowerCase()
      );
      return scenario ? parseFloat(scenario.value) || 0 : 0;
    };

    const clicksManagerValue = findScenarioValue('Manager');
    const clicksDirectorValue = findScenarioValue('Director');

    const div = document.createElement("div");
    div.style.width = "1122px";
    div.style.backgroundColor = "#fdfbf2";
    div.style.padding = "25px 35px";
    div.style.fontFamily = "Arial, sans-serif";
    div.style.display = "flex";
    div.style.flexDirection = "column";

    const ecClickRatio = parseFloat(data.formData.ecClickRatio) || 0;
    const circumference = 2 * Math.PI * 55;
    const dashoffset = circumference * (1 - (ecClickRatio / 100));

    // Calculate the maximum height among left and center sections to align properly
    const leftSectionHeight = 320 + (clickRoleData.length > 0 ? 340 : 100);
    const centerSectionHeight = 400;
    const rightSectionDynamicHeight = containerHeight + 80;
    const maxSectionHeight = Math.max(leftSectionHeight, centerSectionHeight, rightSectionDynamicHeight);

    div.innerHTML = `
  <div style="background:#545454;padding:18px 40px;border-left:15px solid #4db69f;margin-bottom:20px;border-radius:8px;display:flex;justify-content:space-between;">
    <div>
      <h1 style="color:#fff;margin:0;font-size:32px;">${reportTitle}</h1>
      <div style="color:#ddd;font-size:14px;">PoC Engagement Stats (Clicks)</div>
    </div>
    <div style="color:#ccc;font-size:13px;">${dateRange}</div>
  </div>

  <div style="display:flex;gap:20px;align-items:stretch;min-height:${maxSectionHeight}px;">
    <!-- LEFT SECTION -->
    <div style="width:320px;display:flex;flex-direction:column;gap:15px;">
      <div style="background:linear-gradient(135deg,#4db69f,#3a8f7c);color:#fff;padding:20px;border-radius:14px;text-align:center;">
        <div style="font-size:14px;margin-bottom:8px;">Total ECs Clicked</div>
        <div style="font-size:52px;font-weight:bold;">${data.formData.totalECsClicked || 0}</div>
      </div>
      ${clickRolePieChartHtml}
    </div>

    <!-- CENTER SECTION -->
    <div style="width:240px;display:flex;flex-direction:column;gap:15px;justify-content:center;">
      <div style="background:#fff;padding:18px;border-radius:14px;text-align:center;">
        <div style="font-size:12px;color:#888;margin-bottom:10px;">EC Click Ratio</div>
        <svg width="140" height="140" viewBox="0 0 140 140" style="margin:0 auto;">
          <circle cx="70" cy="70" r="55" fill="transparent" stroke="#e0e0e0" stroke-width="12" />
          <circle cx="70" cy="70" r="55" fill="transparent" stroke="#76e5eb" stroke-width="12" 
            stroke-dasharray="${circumference}" 
            stroke-dashoffset="${dashoffset}" 
            stroke-linecap="round" transform="rotate(-90 70 70)" />
          <text x="70" y="78" text-anchor="middle" font-size="22" font-weight="bold" fill="#333">${ecClickRatio}%</text>
        </svg>
      </div>

      <div style="background:#fff;padding:14px;border-radius:14px;display:flex;justify-content:space-between;">
        <span style="font-size:13px;color:#777;">Clicks Manager</span>
        <span style="font-size:22px;font-weight:bold;color:#4db69f;">${clicksManagerValue}%</span>
      </div>

      <div style="background:#fff;padding:14px;border-radius:14px;display:flex;justify-content:space-between;">
        <span style="font-size:13px;color:#777;">Clicks Director</span>
        <span style="font-size:22px;font-weight:bold;color:#4db69f;">${clicksDirectorValue}%</span>
      </div>
    </div>

    <!-- RIGHT SECTION - Daily Pacing Dynamic with dynamic height and centered vertically -->
    <div style="flex:1;background:#fff;padding:20px;border-radius:14px;display:flex;flex-direction:column;justify-content:center;">
      <div style="text-align:center;margin-bottom:10px;">
        <span style="font-size:12px;color:#4db69f;font-weight:700;">📊 DAILY PACING DYNAMIC</span>
      </div>
      <div style="text-align:right;margin-bottom:10px;color:#aaa;font-size:11px;font-style:italic;">
        Synced from Opens Performance
      </div>
      <div style="max-height:${containerHeight}px;overflow-y:auto;padding-right:8px;">
        ${barChartHtml}
      </div>
      <div style="margin-top:12px;font-size:11px;color:#999;text-align:center;">
        ${bars.length} entries • Max ${maxValue}
      </div>
    </div>
  </div>
`;

    return div;
  };

  const createLandingPageWithNoSpacing = () => {
    const data = landingPageData;
    const outbound = outboundData;

    const reportTitle =
      outbound?.formData?.reportTitle ||
      data.formData.reportTitle ||
      "Campaign Report";

    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      if (isNaN(d.getTime())) return "";
      return `${d.getDate().toString().padStart(2, "0")}/${(
        d.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${d.getFullYear()}`;
    };

    const startDate = formatDate(outbound?.formData?.startDate);
    const endDate = formatDate(outbound?.formData?.endDate);
    const dateRange = `${startDate} - ${endDate}`;

    /* ================= DATA ================= */
    const locationData = data.stateEntries
      .filter((e) => e.state && e.value)
      .map((e) => ({
        state: e.state.trim(),
        value: parseInt(e.value) || 0,
      }));

    if (locationData.length === 0) {
      locationData.push({ state: "No Data", value: 10 });
    }

    const maxValue = Math.max(...locationData.map((d) => d.value), 10);

    /* ================= DYNAMIC HEIGHT ================= */
    const chartHeight = Math.max(240, locationData.length * 20);

    let chartWidth = 480;
    if (locationData.length >= 5) chartWidth = 580;
    if (locationData.length >= 7) chartWidth = 700;

    const barWidth = Math.max(
      28,
      Math.min(42, Math.floor((chartWidth - 80) / locationData.length))
    );

    const startX = 55;

    /* ================= BARS ================= */
    let barsSvg = "";
    locationData.forEach((item, i) => {
      const barHeight = (item.value / maxValue) * (chartHeight - 50);

      const x = startX + i * (barWidth + 18);
      const y = chartHeight - barHeight + 35;

      barsSvg += `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#4db69f" rx="4"/>
      <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-size="11" fill="#2c7a6f" font-weight="bold">
        ${item.value}
      </text>
    `;
    });

    let xLabels = "";
    locationData.forEach((item, i) => {
      const x = startX + i * (barWidth + 18) + barWidth / 2;
      xLabels += `
      <text x="${x}" y="${chartHeight + 60}" text-anchor="middle" font-size="11" fill="#555">
        ${item.state}
      </text>
    `;
    });

    /* ================= BOUNCE ================= */
    const bouncedUsers = parseFloat(data.formData.bouncedUsers) || 0;
    const totalUsers = parseFloat(data.formData.totalUsers) || 1;

    const bounceRate = (bouncedUsers / totalUsers) * 100;
    const normalizedBounced = Math.min(Math.max(bounceRate, 0), 100);

    const dash = 283;
    const offset = dash * (1 - normalizedBounced / 100);

    /* ================= ROOT ================= */
    const div = document.createElement("div");

    div.style.width = "1122px";
    div.style.minHeight = "auto";
    div.style.padding = "25px 30px 30px";
    div.style.background = "#fdfbf2";
    div.style.fontFamily = "Arial";

    /* ================= HTML ================= */
    div.innerHTML = `
  
  <!-- HEADER -->
  <div style="background:#545454;padding:18px 40px;border-left:15px solid #4db69f;border-radius:8px;margin-bottom:25px;display:flex;justify-content:space-between;">
    <div>
      <h1 style="color:#fff;margin:0;font-size:34px;">${reportTitle}</h1>
      <div style="color:#fff;">Landing Page Performance</div>
    </div>
    <div style="color:#fff;">${dateRange}</div>
  </div>

  <!-- MAIN -->
  <div style="display:flex;gap:25px;align-items:stretch;">

    <!-- LEFT CHART -->
    <div style="flex:2;background:#fff;padding:20px;border-radius:16px;">

      <div style="text-align:center;margin-bottom:15px;">
        <span style="background:#4db69f20;color:#4db69f;padding:5px 14px;border-radius:20px;font-weight:bold;font-size:13px;">
          📍 AUDIENCE LOCATION OVERVIEW
        </span>
      </div>

      <div style="height:${chartHeight + 90}px;">
        <svg width="100%" height="${chartHeight + 90}" viewBox="0 0 ${chartWidth + 100} ${chartHeight + 90}">
          
          <line x1="48" y1="35" x2="48" y2="${chartHeight + 35}" stroke="#ddd"/>
          <line x1="48" y1="${chartHeight + 35}" x2="${chartWidth + 60}" y2="${chartHeight + 35}" stroke="#ddd"/>

          ${barsSvg}
          ${xLabels}
        </svg>
      </div>

      <div style="text-align:center;color:#aaa;margin-top:10px;font-size:12px;">
        Total ${locationData.length} locations • Max: ${maxValue} • Total Users: ${totalUsers}
      </div>
    </div>

    <!-- RIGHT SIDE -->
    <div style="width:340px;display:flex;flex-direction:column;gap:15px;">

      <!-- GRID -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">

        <div style="background:#fff;padding:15px;text-align:center;border-radius:10px;">
          <div style="font-size:12px;color:#777;">Total Users</div>
          <div style="font-size:28px;font-weight:bold;">${totalUsers}</div>
        </div>

        <div style="background:#fff;padding:15px;text-align:center;border-radius:10px;">
          <div style="font-size:12px;color:#777;">Avg. Session</div>
          <div style="font-size:28px;font-weight:bold;">${data.formData.avgSession}s</div>
        </div>

        <div style="background:#fff;padding:15px;text-align:center;border-radius:10px;">
          <div style="font-size:12px;color:#777;">Bounced Users</div>
          <div style="font-size:28px;font-weight:bold;">${bouncedUsers}</div>
        </div>

        <div style="background:#fff;padding:15px;text-align:center;border-radius:10px;">
          <div style="font-size:12px;color:#777;">Form Downloads</div>
          <div style="font-size:28px;font-weight:bold;">${data.formData.formDownloads}</div>
        </div>

      </div>

      <!-- GAUGE -->
      <div style="background:#fff;padding:18px;border-radius:12px;text-align:center;">

        <div style="font-size:13px;color:#777;margin-bottom:8px;">Bounce Rate</div>

        <svg width="200" height="120" viewBox="0 0 220 140">
          
          <path d="M 20 120 A 90 90 0 0 1 200 120"
            fill="none"
            stroke="#e0e0e0"
            stroke-width="14"/>

          <path d="M 20 120 A 90 90 0 0 1 200 120"
            fill="none"
            stroke="#4db69f"
            stroke-width="14"
            stroke-dasharray="${dash}"
            stroke-dashoffset="${offset}" />

          <line x1="110" y1="120" x2="110" y2="60"
            stroke="#333"
            stroke-width="3"
            transform="rotate(${(normalizedBounced / 100) * 180 - 90},110,120)" />

          <circle cx="110" cy="120" r="6" fill="#333"/>
        </svg>

        <div style="font-size:32px;font-weight:bold;">
          ${normalizedBounced.toFixed(0)}%
        </div>

      </div>

    </div>

  </div>
`;

    return div;
  };

  const createWebVitalsPage = () => {
    const data = webVitalsData;
    const outbound = outboundData;

    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };
    const startDate = formatDate(outbound?.formData?.startDate);
    const endDate = formatDate(outbound?.formData?.endDate);
    const dateRange = `${startDate} - ${endDate}`;

    if (!data || !data.formData) {
      const div = document.createElement('div');
      div.style.width = '1122px';
      div.style.minHeight = '794px';
      div.style.backgroundColor = '#fdfbf2';
      div.style.padding = '40px';
      div.style.boxSizing = 'border-box';
      div.style.fontFamily = 'Arial, sans-serif';
      const reportTitle = outbound?.formData?.reportTitle || 'Web Page Vitals';
      div.innerHTML = `
        <div style="background-color: #545454; padding: 18px 40px; border-left: 15px solid #4db69f; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="color: #fff; margin: 0; font-size: 36px; font-weight: 400;">${reportTitle}</h1>
            <div style="color: #fff; margin-top: 5px; font-size: 18px; opacity: 0.9;">Web Page Vitals</div>
          </div>
          <div style="color: #fff; font-size: 16px; opacity: 0.8; text-align: right;">
            ${dateRange}
          </div>
        </div>
        <div style="text-align: center; padding: 100px; color: #999;">
          No data available. Please save the Web Vitals data first.
        </div>
      `;
      return div;
    }

    const reportTitle = outbound?.formData?.reportTitle || data.formData.reportTitle || 'Campaign Report';
    const div = document.createElement('div');
    div.style.width = '1122px';
    div.style.minHeight = '794px';
    div.style.backgroundColor = '#fdfbf2';
    div.style.padding = '40px';
    div.style.boxSizing = 'border-box';
    div.style.fontFamily = 'Arial, sans-serif';

    let screenshotHtml = '';
    if (data.screenshotImage && data.screenshotImage !== '') {
      screenshotHtml = `
        <div style="background: #fff; padding: 20px; border-radius: 12px; margin-top: 20px;">
          <div style="text-align: center; background: #f5f5f5; border-radius: 8px; padding: 20px; min-height: 300px; display: flex; align-items: center; justify-content: center;">
            <img src="${data.screenshotImage}" style="max-width: 100%; max-height: 400px; width: auto; height: auto; object-fit: contain; border-radius: 8px;" alt="Screenshot" />
          </div>
        </div>
      `;
    } else {
      screenshotHtml = `
        <div style="background: #fff; padding: 20px; border-radius: 12px; margin-top: 20px;">
          <div style="text-align: center; padding: 60px; color: #999; background: #f5f5f5; border-radius: 8px;">
            No screenshot uploaded
          </div>
        </div>
      `;
    }

    div.innerHTML = `
      <div style="background-color: #545454; padding: 18px 40px; border-left: 15px solid #4db69f; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="color: #fff; margin: 0; font-size: 36px; font-weight: 400;">${reportTitle}</h1>
          <div style="color: #fff; margin-top: 5px; font-size: 18px; opacity: 0.9;">Web Page Vitals</div>
        </div>
        <div style="color: #fff; font-size: 16px; opacity: 0.8; text-align: right;">
          ${dateRange}
        </div>
      </div>
      
      <div style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap;">
        <div style="flex: 1; background: #fff; padding: 20px; text-align: center; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h5 style="color: #aaa; font-size: 14px;">Avg. Page Load Speed</h5>
          <div style="font-size: 40px; font-weight: bold;">${data.formData.avgPageLoadSpeed || '0'}s</div>
        </div>
        <div style="flex: 1; background: #fff; padding: 20px; text-align: center; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h5 style="color: #aaa; font-size: 14px;">Structure Metric</h5>
          <div style="font-size: 40px; font-weight: bold;">${data.formData.structureMetrix || '0'}%</div>
        </div>
        <div style="flex: 1; background: #fff; padding: 20px; text-align: center; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h5 style="color: #aaa; font-size: 14px;">Largest Element (LCP)</h5>
          <div style="font-size: 40px; font-weight: bold;">${data.formData.largestElementLCP || '0'}s</div>
        </div>
        <div style="flex: 1; background: #fff; padding: 20px; text-align: center; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h5 style="color: #aaa; font-size: 14px;">TBT Script Blocks</h5>
          <div style="font-size: 40px; font-weight: bold;">${data.formData.tbtScriptBlocks || '0'}MS</div>
        </div>
      </div>
      
      ${screenshotHtml}
    `;
    return div;
  };

  return (
    <div className="vh-100 overflow-hidden d-flex flex-column" style={{ backgroundColor: '#f4f7f6' }}>
      <Container className="py-4 flex-grow-1 overflow-auto">
        <Card className="shadow-lg border-0">
          <Card.Header className="bg-dark text-white p-3">
            <h5 className="mb-0">Campaign Report Generator</h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
              <Tab eventKey="outbound" title="Outbound Performance">
                {outboundSaveMessage && <Alert variant="success" className="mb-3">{outboundSaveMessage}</Alert>}
                {outboundValidationMessage && <Alert variant="warning" className="mb-3">{outboundValidationMessage}</Alert>}
                <OutboundForm
                  outboundFormData={outboundFormData}
                  handleOutboundChange={handleOutboundChange}
                  handleOutboundDateChange={handleOutboundDateChange}
                  handleOutboundNumberChange={handleOutboundNumberChange}
                  softBounced={softBounced}
                  setSoftBounced={setSoftBounced}
                  pacingEntries={pacingEntries}
                  handlePacingEntryChange={handlePacingEntryChange}
                  addPacingEntry={addPacingEntry}
                  removePacingEntry={removePacingEntry}
                  jobRoleEntries={outboundJobRoleEntries}
                  handleJobRoleChange={(id, field, value) => {
                    setOutboundJobRoleEntries(prev => prev.map(entry =>
                      entry.id === id ? { ...entry, [field]: value } : entry
                    ));
                    setIsOutboundSaved(false);
                  }}
                  addJobRoleEntry={() => {
                    setOutboundJobRoleEntries(prev => [...prev, { id: Date.now(), role: '', value: '' }]);
                    setIsOutboundSaved(false);
                  }}
                  removeJobRoleEntry={(id) => {
                    if (outboundJobRoleEntries.length > 1) {
                      setOutboundJobRoleEntries(prev => prev.filter(entry => entry.id !== id));
                      setIsOutboundSaved(false);
                    }
                  }}
                  jobScenarioEntries={outboundJobScenarioEntries}
                  handleJobScenarioChange={(id, field, value) => {
                    setOutboundJobScenarioEntries(prev => prev.map(entry =>
                      entry.id === id ? { ...entry, [field]: value } : entry
                    ));
                    setIsOutboundSaved(false);
                  }}
                  addJobScenarioEntry={() => {
                    setOutboundJobScenarioEntries(prev => [...prev, { id: Date.now(), scenario: '', value: '' }]);
                    setIsOutboundSaved(false);
                  }}
                  removeJobScenarioEntry={(id) => {
                    if (outboundJobScenarioEntries.length > 1) {
                      setOutboundJobScenarioEntries(prev => prev.filter(entry => entry.id !== id));
                      setIsOutboundSaved(false);
                    }
                  }}
                  handleBackToCampaign={handleBackToCampaign}
                  saveOutboundData={saveOutboundData}
                  outboundValidationError={outboundValidationError}
                  setOutboundValidationError={setOutboundValidationError}
                  outboundRoleError={outboundRoleError}
                  outboundScenarioError={outboundScenarioError}
                />
              </Tab>
              <Tab eventKey="poc-opens" title="PoC Engagement Stats (Opens)">
                {activeTab === 'poc-opens' && (
                  <>
                    {pocOpensSaveMessage && <Alert variant="success" className="mb-3">{pocOpensSaveMessage}</Alert>}
                    {pocOpensValidationMessage && <Alert variant="warning" className="mb-3">{pocOpensValidationMessage}</Alert>}
                    <PoCOpensFormComponent
                      pocOpensFormData={pocOpensFormData}
                      handlePocOpensChange={handlePocOpensChange}
                      handlePocOpensNumberChange={handlePocOpensNumberChange}
                      opensBarEntries={opensBarEntries}
                      handleOpensBarEntryChange={handleOpensBarEntryChange}
                      savePocOpensData={savePocOpensData}
                      setActiveTab={setActiveTab}
                      formatDateForDisplay={formatDateForDisplay}
                      outboundTotalDelivered={outboundFormData.totalEmailsDelivered}
                      jobRoleEntries={opensJobRoleEntries}
                      jobScenarioEntries={opensJobScenarioEntries}
                      handleJobRoleValueChange={(id, value) => {
                        setOpensJobRoleEntries(prev => prev.map(entry =>
                          entry.id === id ? { ...entry, value } : entry
                        ));
                      }}
                      handleJobScenarioValueChange={(id, value) => {
                        setOpensJobScenarioEntries(prev => prev.map(entry =>
                          entry.id === id ? { ...entry, value } : entry
                        ));
                      }}
                      opensToOutboundError={opensToOutboundError}
                      clearOpensToOutboundError={clearOpensToOutboundError}
                      opensRoleError={opensRoleError}
                      opensScenarioError={opensScenarioError}
                    />
                  </>
                )}
              </Tab>

              <Tab eventKey="poc-clicks" title="PoC Engagement Stats (Clicks)">
                {activeTab === 'poc-clicks' && (
                  <>
                    {pocClicksSaveMessage && <Alert variant="success" className="mb-3">{pocClicksSaveMessage}</Alert>}
                    {pocClicksValidationMessage && <Alert variant="warning" className="mb-3">{pocClicksValidationMessage}</Alert>}
                    <PoCClicksFormComponent
                      pocClicksFormData={pocClicksFormData}
                      handlePocClicksChange={handlePocClicksChange}
                      handlePocClicksNumberChange={handlePocClicksNumberChange}
                      clicksBarEntries={clicksBarEntries}
                      handleClicksBarEntryChange={handleClicksBarEntryChange}
                      savePocClicksData={savePocClicksData}
                      setActiveTab={setActiveTab}
                      formatDateForDisplay={formatDateForDisplay}
                      outboundTotalDelivered={outboundFormData.totalEmailsDelivered}
                      pocOpensTotalECsOpened={pocOpensFormData.totalECsOpened}
                      jobRoleEntries={clicksJobRoleEntries}
                      jobScenarioEntries={clicksJobScenarioEntries}
                      handleJobRoleValueChange={(id, value) => {
                        setClicksJobRoleEntries(prev => prev.map(entry =>
                          entry.id === id ? { ...entry, value } : entry
                        ));
                      }}
                      handleJobScenarioValueChange={(id, value) => {
                        setClicksJobScenarioEntries(prev => prev.map(entry =>
                          entry.id === id ? { ...entry, value } : entry
                        ));
                      }}
                      clicksToOpensError={clicksToOpensError}
                      clearClicksToOpensError={clearClicksToOpensError}
                      clicksRoleError={clicksRoleError}
                      clicksScenarioError={clicksScenarioError}
                    />
                  </>
                )}
              </Tab>
              <Tab eventKey="landing-page" title="Landing Page Performance">
                {activeTab === 'landing-page' && (
                  <>
                    {landingPageSaveMessage && <Alert variant="success" className="mb-3">{landingPageSaveMessage}</Alert>}
                    {landingPageValidationMessage && <Alert variant="warning" className="mb-3">{landingPageValidationMessage}</Alert>}
                    <LandingPageFormComponent />
                  </>
                )}
              </Tab>
              <Tab eventKey="web-vitals" title="Web Page Vitals">
                {activeTab === 'web-vitals' && (
                  <>
                    {webVitalsSaveMessage && <Alert variant="success" className="mb-3">{webVitalsSaveMessage}</Alert>}
                    {webVitalsValidationMessage && <Alert variant="warning" className="mb-3">{webVitalsValidationMessage}</Alert>}
                    <WebVitalsFormComponent />
                  </>
                )}
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default CampaignReportTabs;