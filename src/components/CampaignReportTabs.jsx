import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Card, Table, Alert, Tab, Tabs } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Custom Date Picker Component
const CustomDatePicker = ({ value, onChange, placeholder = "DD/MM/YYYY" }) => {
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef(null);

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

  const openCalendar = () => {
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'date';
    hiddenInput.style.position = 'absolute';
    hiddenInput.style.opacity = '0';
    hiddenInput.style.pointerEvents = 'none';
    document.body.appendChild(hiddenInput);

    hiddenInput.addEventListener('change', (e) => {
      if (e.target.value) {
        onChange(e.target.value);
      }
      document.body.removeChild(hiddenInput);
    });

    hiddenInput.showPicker();
  };

  return (
    <div style={{ display: 'flex', gap: '5px' }}>
      <Form.Control
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleDateChange}
        size="sm"
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

const CustomNumberInput = ({ value, onChange, placeholder = "Enter value", size = "sm" }) => {
  const [localValue, setLocalValue] = useState(value || '');

  // Sync localValue when parent value changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);           // Live typing
  };

  const handleBlur = () => {
    // Only update parent when user finishes typing (on blur)
    if (onChange) {
      onChange(localValue);
    }
  };

  // Optional: Allow live update on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();   // Trigger blur
    }
  };

  return (
    <Form.Control
      type="text"
      placeholder={placeholder}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      size={size}
      style={{ width: '100%' }}
    />
  );
};

// Speed Visualization Data Input Component
const SpeedDataInput = ({ value, onChange, placeholder = "Time (s)", size = "sm" }) => {
  return (
    <Form.Control
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size={size}
    />
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

  // Outbound Form State
  const [outboundFormData, setOutboundFormData] = useState({
    reportTitle: '',
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

  const handleBackToCampaign = () => {
    window.location.href = '/';
  };

  // Validate Outbound Form
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
    if (!outboundFormData.totalEmailsSent) {
      setOutboundValidationMessage('Please enter Total Emails Sent');
      return false;
    }
    if (!outboundFormData.totalEmailsDelivered) {
      setOutboundValidationMessage('Please enter Total Emails Delivered');
      return false;
    }
    if (!outboundFormData.dailyAvgSends) {
      setOutboundValidationMessage('Please enter Daily Average Sends');
      return false;
    }
    if (!outboundFormData.totalHardBounced) {
      setOutboundValidationMessage('Please enter Total Hard Bounced');
      return false;
    }

    const hasValidPacing = pacingEntries.some(entry => entry.date && entry.value);
    if (!hasValidPacing) {
      setOutboundValidationMessage('Please add at least one entry in Daily Pacing Dynamic Data');
      return false;
    }

    setOutboundValidationMessage('');
    return true;
  };

  // Validate PoC Opens Form
  const validatePocOpensForm = () => {
    if (!pocOpensFormData.reportTitle) {
      setPocOpensValidationMessage('Please enter Report Title');
      return false;
    }
    if (!pocOpensFormData.totalECsOpened) {
      setPocOpensValidationMessage('Please enter Total ECs Opened');
      return false;
    }

    const hasValidBar = opensBarEntries.some(entry => entry.date && entry.value);
    if (!hasValidBar) {
      setPocOpensValidationMessage('Please add at least one entry in Bar Chart Values');
      return false;
    }

    setPocOpensValidationMessage('');
    return true;
  };

  // Validate PoC Clicks Form
  const validatePocClicksForm = () => {
    if (!pocClicksFormData.reportTitle) {
      setPocClicksValidationMessage('Please enter Report Title');
      return false;
    }
    if (!pocClicksFormData.totalECsClicked) {
      setPocClicksValidationMessage('Please enter Total ECs Clicked');
      return false;
    }

    const hasValidBar = clicksBarEntries.some(entry => entry.date && entry.value);
    if (!hasValidBar) {
      setPocClicksValidationMessage('Please add at least one entry in Bar Chart Values');
      return false;
    }

    setPocClicksValidationMessage('');
    return true;
  };

  // Validate Landing Page Form
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

  // Validate Web Vitals Form
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

  // Outbound Functions
  const handleOutboundChange = useCallback((e) => {
    const { name, value } = e.target;
    setOutboundFormData(prev => ({ ...prev, [name]: value }));
    setIsOutboundSaved(false);
    setOutboundValidationMessage('');
  }, []);

  const handleOutboundNumberChange = useCallback((name, value) => {
    setOutboundFormData(prev => ({ ...prev, [name]: value }));
    setIsOutboundSaved(false);
    setOutboundValidationMessage('');
  }, []);

  const handleOutboundDateChange = useCallback((field, value) => {
    setOutboundFormData(prev => ({ ...prev, [field]: value }));
    setIsOutboundSaved(false);
    setOutboundValidationMessage('');
  }, []);

  const handlePacingEntryChange = useCallback((id, field, value) => {
    setPacingEntries(prev => {
      return prev.map(entry => {
        if (entry.id === id) {
          return { ...entry, [field]: value };
        }
        return entry;
      });
    });
    setIsOutboundSaved(false);
    setOutboundValidationMessage('');
  }, []);

  const addPacingEntry = () => {
    setPacingEntries(prev => [...prev, { id: Date.now(), date: '', value: '' }]);
    setIsOutboundSaved(false);
  };

  const removePacingEntry = (id) => {
    if (pacingEntries.length > 1) {
      setPacingEntries(prev => prev.filter(entry => entry.id !== id));
      setIsOutboundSaved(false);
    }
  };

  const saveOutboundData = () => {
    if (!validateOutboundForm()) {
      return;
    }

    const dataToSave = {
      formData: outboundFormData,
      pacingEntries,
      savedAt: new Date().toISOString()
    };
    setOutboundData(dataToSave);
    setIsOutboundSaved(true);
    setOutboundSaveMessage('Outbound data saved successfully!');
    setTimeout(() => setOutboundSaveMessage(''), 3000);
    setActiveTab('poc-opens');
  };

  // PoC Opens Functions
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

  const handleOpensBarEntryChange = useCallback((id, field, value) => {
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
  }, []);

  const addOpensBarEntry = () => {
    setOpensBarEntries(prev => [...prev, { id: Date.now(), date: '', value: '' }]);
    setIsPocOpensSaved(false);
  };

  const removeOpensBarEntry = (id) => {
    if (opensBarEntries.length > 1) {
      setOpensBarEntries(prev => prev.filter(entry => entry.id !== id));
      setIsPocOpensSaved(false);
    }
  };

  const savePocOpensData = () => {
    if (!validatePocOpensForm()) {
      return;
    }

    const dataToSave = {
      formData: pocOpensFormData,
      barEntries: opensBarEntries,
      savedAt: new Date().toISOString()
    };
    setPocOpensData(dataToSave);
    setIsPocOpensSaved(true);
    setPocOpensSaveMessage('PoC Opens data saved successfully!');
    setTimeout(() => setPocOpensSaveMessage(''), 3000);
    setActiveTab('poc-clicks');
  };

  // PoC Clicks Functions
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

  const handleClicksBarEntryChange = useCallback((id, field, value) => {
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
  }, []);

  const addClicksBarEntry = () => {
    setClicksBarEntries(prev => [...prev, { id: Date.now(), date: '', value: '' }]);
    setIsPocClicksSaved(false);
  };

  const removeClicksBarEntry = (id) => {
    if (clicksBarEntries.length > 1) {
      setClicksBarEntries(prev => prev.filter(entry => entry.id !== id));
      setIsPocClicksSaved(false);
    }
  };

  const savePocClicksData = () => {
    if (!validatePocClicksForm()) {
      return;
    }

    const dataToSave = {
      formData: pocClicksFormData,
      barEntries: clicksBarEntries,
      savedAt: new Date().toISOString()
    };
    setPocClicksData(dataToSave);
    setIsPocClicksSaved(true);
    setPocClicksSaveMessage('PoC Clicks data saved successfully!');
    setTimeout(() => setPocClicksSaveMessage(''), 3000);
    setActiveTab('landing-page');
  };

  // Landing Page Functions
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

  // Web Vitals Functions
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
      // Validate file size (optional - limit to 5MB)
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

    // Ensure screenshot is properly stored
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

  const generateCompletePDF = async () => {
    if (!isOutboundSaved || !isPocOpensSaved || !isPocClicksSaved || !isLandingPageSaved || !isWebVitalsSaved) {
      alert('Please save all data (Outbound, PoC Opens, PoC Clicks, Landing Page, and Web Page Vitals) before generating PDF!');
      return;
    }

    // Check if all data is available
    if (!outboundData || !pocOpensData || !pocClicksData || !landingPageData || !webVitalsData) {
      alert('Some data is missing. Please ensure all sections have been saved.');
      return;
    }

    // Create PDF with proper dimensions (A4 Landscape)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    try {
      // Helper function to add page with proper scaling
      const addPageToPDF = async (elementCreator, pdfDoc) => {
        const element = elementCreator();
        document.body.appendChild(element);

        // Get element dimensions
        const width = element.offsetWidth;
        const height = element.offsetHeight;

        // Calculate scale to fit on A4 landscape (297mm x 210mm)
        const pdfWidth = 297;
        const pdfHeight = 210;
        const scale = Math.min(pdfWidth / (width / 3.78), pdfHeight / (height / 3.78));

        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          logging: false,
          allowTaint: false,
          backgroundColor: '#fdfbf2',
          windowWidth: width,
          windowHeight: height
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        // Center the image vertically if it's shorter than page
        const yOffset = Math.max(0, (pdfHeight - imgHeight) / 2);

        pdfDoc.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
        document.body.removeChild(element);
      };

      // Campaign Page
      await addPageToPDF(createCampaignPage, pdf);

      // Outbound Page
      pdf.addPage();
      await addPageToPDF(createOutboundPage, pdf);

      // PoC Opens Page
      pdf.addPage();
      await addPageToPDF(createPocOpensPage, pdf);

      // PoC Clicks Page
      pdf.addPage();
      await addPageToPDF(createPocClicksPage, pdf);

      // Landing Page
      pdf.addPage();
      await addPageToPDF(createLandingPage, pdf);

      // Web Vitals Page
      pdf.addPage();
      await addPageToPDF(createWebVitalsPage, pdf);

      // Save the PDF
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
    div.style.backgroundColor = '#fdfbf2';
    div.style.padding = '40px';
    div.style.boxSizing = 'border-box';
    div.style.fontFamily = 'Arial, sans-serif';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.innerHTML = `
    <div style="background-color: #545454; padding: 18px 40px; border-left: 15px solid #4db69f; margin-bottom: 80px;">
      <h1 style="color: #fff; margin: 0; font-size: 44px; font-weight: 400;">Campaign Performance Report</h1>
    </div>
    
    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <!-- Main Title -->
      <h1 style="color: #444a53; font-size: 52px; margin: 0 0 30px 0; font-weight: bold; text-align: center;">Campaign<br/>Performance<br/>Report</h1>
      
      <!-- Subtitle -->
      <h3 style="color: #444a53; font-size: 22px; font-weight: normal; margin: 20px 0 50px 0; text-align: center;">"Bridging the Gap between Cannabusinesses and Insurers"</h3>
      
      <!-- Footer Info -->
      <p style="color: #888; margin-top: 40px; font-style: italic; font-size: 14px;">For Team 2X | Date 13/01/2022</p>
    </div>
  `;
    return div;
  };

  const createOutboundPage = () => {
    const data = outboundData;
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear().toString().slice(-2)}`;
    };

    const validEntries = data.pacingEntries.filter(e => e.date && e.value);
    const values = validEntries.map(entry => parseFloat(entry.value) || 0);
    const maxValue = Math.max(...values, 2500);
    const w = 550, h = 150;
    const xStep = validEntries.length > 1 ? w / (validEntries.length - 1) : 0;
    const points = values.map((v, i) => `${i * xStep},${h - (v / maxValue * h)}`).join(' ');
    const areaPoints = values.map((v, i) => `${i * xStep},${h - (v / maxValue * h)}`).join(' ');
    const area = `0,${h} ${areaPoints} ${w},${h}`;

    const security = parseFloat(data.formData.securityPerc);
    const safety = parseFloat(data.formData.safetyPerc);
    const others = parseFloat(data.formData.othersPerc);
    const securityAngle = (security / 100) * 360;
    const safetyAngle = (safety / 100) * 360;
    const othersAngle = (others / 100) * 360;
    const securityMidAngle = securityAngle / 2;
    const safetyMidAngle = securityAngle + (safetyAngle / 2);
    const othersMidAngle = securityAngle + safetyAngle + (othersAngle / 2);

    const getLabelPosition = (midAngle, distance) => {
      const rad = (midAngle - 90) * Math.PI / 180;
      return { x: 105 + (distance * Math.cos(rad)), y: 105 + (distance * Math.sin(rad)) };
    };

    const securityLabelPos = getLabelPosition(securityMidAngle, 115);
    const safetyLabelPos = getLabelPosition(safetyMidAngle, 115);
    const othersLabelPos = getLabelPosition(othersMidAngle, 115);

    const createPieSegment = (startAngle, angle) => {
      if (angle <= 0 || isNaN(angle) || isNaN(startAngle)) {
        return '';
      }
      const endAngle = startAngle + angle;
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;
      const x1 = 105 + 80 * Math.cos(startRad);
      const y1 = 105 + 80 * Math.sin(startRad);
      const x2 = 105 + 80 * Math.cos(endRad);
      const y2 = 105 + 80 * Math.sin(endRad);
      const largeArc = angle > 180 ? 1 : 0;
      return `M 105,105 L ${x1},${y1} A 80,80 0 ${largeArc},1 ${x2},${y2} Z`;
    };

    const bounceRate = parseFloat(data.formData.bounceRate) || 0;
    const maxBounce = 10;
    const bounceDashoffset = 251 - (bounceRate / maxBounce) * 251;

    const div = document.createElement('div');
    div.style.width = '1122px';
    div.style.height = '794px';
    div.style.backgroundColor = '#fdfbf2';
    div.style.padding = '40px';
    div.style.boxSizing = 'border-box';
    div.style.fontFamily = 'Arial, sans-serif';
    div.innerHTML = `
      <div style="background-color: #545454; padding: 18px 40px; border-left: 15px solid #4db69f; margin-bottom: 25px;">
        <h1 style="color: #fff; margin: 0; font-size: 44px; font-weight: 400;">Outbound Performance</h1>
        <span style="color: #fff; margin-left: 15px; font-size: 24px;">(${formatDate(data.formData.startDate)} - ${formatDate(data.formData.endDate)})</span>
      </div>
      <div style="display: flex; gap: 20px;">
        <div style="width: 330px;">
          <div style="background-color: #4db69f; color: #fff; padding: 40px 20px; text-align: center; border-radius: 8px;">
            <h4 style="font-weight: 400; font-size: 24px; margin-bottom: 20px;">Total Emails Sent</h4>
            <div style="font-size: 80px; font-weight: bold;">${data.formData.totalEmailsSent}</div>
          </div>
          <div style="margin-top: 40px; position: relative; width: 300px; height: 300px; margin: 40px auto 0;">
            <svg width="300" height="300" viewBox="0 0 210 210">
              ${securityAngle > 0 ? `<path d="${createPieSegment(0, securityAngle)}" fill="#7d8bb1" stroke="white" stroke-width="2" />` : ''}
              ${safetyAngle > 0 ? `<path d="${createPieSegment(securityAngle, safetyAngle)}" fill="#a2bad0" stroke="white" stroke-width="2" />` : ''}
              ${othersAngle > 0 ? `<path d="${createPieSegment(securityAngle + safetyAngle, othersAngle)}" fill="#d1eef4" stroke="white" stroke-width="2" />` : ''}
              <circle cx="105" cy="105" r="35" fill="#fdfbf2" />
            </svg>
            <div style="position: absolute; left: ${(securityLabelPos.x / 210) * 300}px; top: ${(securityLabelPos.y / 210) * 300 - 12}px; transform: translate(-50%, -50%); background: white; padding: 4px 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); white-space: nowrap; font-size: 11px; font-weight: bold; border: 1px solid #e0e0e0;">Security ${security.toFixed(1)}%</div>
            <div style="position: absolute; left: ${(safetyLabelPos.x / 210) * 300}px; top: ${(safetyLabelPos.y / 210) * 300 - 12}px; transform: translate(-50%, -50%); background: white; padding: 4px 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); white-space: nowrap; font-size: 11px; font-weight: bold; border: 1px solid #e0e0e0;">Safety ${safety.toFixed(1)}%</div>
            <div style="position: absolute; left: ${(othersLabelPos.x / 210) * 300}px; top: ${(othersLabelPos.y / 210) * 300 - 12}px; transform: translate(-50%, -50%); background: white; padding: 4px 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); white-space: nowrap; font-size: 11px; font-weight: bold; border: 1px solid #e0e0e0;">Others ${others.toFixed(1)}%</div>
          </div>
        </div>
        <div style="flex: 1;">
          <div style="display: flex; gap: 15px; margin-bottom: 15px;">
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
          <div style="display: flex; gap: 15px; margin-bottom: 15px;">
            <div style="width: 230px; background: #fff; padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h5 style="color: #aaa;">Bounce Rate</h5>
              <div style="text-align: center;">
                <svg width="180" height="120" viewBox="0 0 180 120">
                  <path d="M 20 100 A 80 80 0 0 1 160 100" fill="none" stroke="#e0e0e0" stroke-width="15" stroke-linecap="round" />
                  <path d="M 20 100 A 80 80 0 0 1 160 100" fill="none" stroke="#28a745" stroke-width="15" stroke-linecap="round" stroke-dasharray="251" stroke-dashoffset="${bounceDashoffset}" />
                  <line x1="90" y1="100" x2="90" y2="50" stroke="#28a745" stroke-width="3" stroke-linecap="round" transform="rotate(${(bounceRate / maxBounce) * 180 - 90}, 90, 100)" />
                  <circle cx="90" cy="100" r="8" fill="#28a745" />
                </svg>
                <div style="font-size: 48px; font-weight: bold; color: #444; margin-top: 10px;">${bounceRate}%</div>
              </div>
            </div>
            <div style="flex: 1; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h5 style="color: #aaa; text-align: right;">Daily Pacing Dynamic</h5>
              <div style="display: flex; margin-top: 15px;">
                <div style="height: 150px; display: flex; flex-direction: column; justify-content: space-between; font-size: 12px; color: #bbb; padding-right: 12px;">
                  <span>${maxValue}</span>
                  <span>${Math.floor(maxValue / 2)}</span>
                  <span>0</span>
                </div>
                <div style="flex: 1; border-left: 1px solid #eee; border-bottom: 1px solid #eee;">
                  <svg width="100%" height="150" viewBox="0 0 550 150" preserveAspectRatio="none">
                    <polyline points="${area}" fill="#9bd9cc" fill-opacity="0.4" />
                    <polyline points="${points}" fill="none" stroke="#4db69f" stroke-width="3" />
                  </svg>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 10px; color: #bbb; font-size: 13px; padding-left: 45px;">
                <span>${validEntries[0]?.date ? formatDate(validEntries[0].date) : formatDate(data.formData.startDate)}</span>
                <span>Daily Timeline</span>
                <span>${validEntries[validEntries.length - 1]?.date ? formatDate(validEntries[validEntries.length - 1].date) : formatDate(data.formData.endDate)}</span>
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 15px;">
            <div style="flex: 1; background: #fff; padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h5 style="color: #aaa;">EC Delivered - Managers</h5>
              <div style="font-size: 48px; font-weight: bold;">${data.formData.ecManagers}%</div>
            </div>
            <div style="flex: 1; background: #fff; padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h5 style="color: #aaa;">EC Delivered - Directors</h5>
              <div style="font-size: 48px; font-weight: bold;">${data.formData.ecDirectors}%</div>
            </div>
          </div>
        </div>
      </div>
    `;
    return div;
  };

  const createPocOpensPage = () => {
    const data = pocOpensData;
    const formatDateForDisplayFn = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
    };

    const validEntries = data.barEntries.filter(entry => entry.date && entry.value);
    const bars = validEntries.map(entry => ({
      label: formatDateForDisplayFn(entry.date),
      value: parseInt(entry.value) || 0
    }));

    const security = parseFloat(data.formData.securityPerc);
    const safety = parseFloat(data.formData.safetyPerc);
    const others = parseFloat(data.formData.othersPerc);
    const securityAngle = (security / 100) * 360;
    const safetyAngle = (safety / 100) * 360;
    const othersAngle = (others / 100) * 360;
    const securityMidAngle = securityAngle / 2;
    const safetyMidAngle = securityAngle + (safetyAngle / 2);
    const othersMidAngle = securityAngle + safetyAngle + (othersAngle / 2);

    const getLabelPosition = (midAngle, distance) => {
      const rad = (midAngle - 90) * Math.PI / 180;
      return { x: 100 + (distance * Math.cos(rad)), y: 100 + (distance * Math.sin(rad)) };
    };

    const securityLabelPos = getLabelPosition(securityMidAngle, 115);
    const safetyLabelPos = getLabelPosition(safetyMidAngle, 115);
    const othersLabelPos = getLabelPosition(othersMidAngle, 115);

    const createPieSegment = (startAngle, angle) => {
      if (angle <= 0 || isNaN(angle) || isNaN(startAngle)) {
        return '';
      }
      const endAngle = startAngle + angle;
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;
      const x1 = 100 + 80 * Math.cos(startRad);
      const y1 = 100 + 80 * Math.sin(startRad);
      const x2 = 100 + 80 * Math.cos(endRad);
      const y2 = 100 + 80 * Math.sin(endRad);
      const largeArc = angle > 180 ? 1 : 0;
      return `M 100,100 L ${x1},${y1} A 80,80 0 ${largeArc},1 ${x2},${y2} Z`;
    };

    const div = document.createElement('div');
    div.style.width = '1122px';
    div.style.height = '794px';
    div.style.backgroundColor = '#fdfbf2';
    div.style.padding = '40px';
    div.style.boxSizing = 'border-box';
    div.style.fontFamily = 'Arial, sans-serif';

    let barChartHtml = '';
    if (bars.length > 0) {
      const maxValue = Math.max(...bars.map(b => b.value), 1);
      barChartHtml = bars.map((bar, i) => {
        const percentage = (bar.value / maxValue) * 100;
        return `
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
            <div style="width: 70px; font-size: 11px; color: #666;">${bar.label}</div>
            <div style="flex: 1; background-color: #f0f0f0; height: 28px; border-radius: 3px; overflow: hidden;">
              <div style="width: ${percentage}%; background-color: #4db69f; height: 100%;"></div>
            </div>
            <div style="width: 40px; font-size: 11px; color: #666; text-align: right;">${bar.value}</div>
          </div>
        `;
      }).join('');
    } else {
      barChartHtml = '<div style="text-align: center; padding: 40px; color: #999;">No data to display. Add entries using the form above.</div>';
    }

    div.innerHTML = `
      <div style="background-color: #545454; padding: 15px 40px; border-left: 15px solid #4db69f; margin-bottom: 25px; display: flex; align-items: baseline;">
        <h1 style="color: #fff; margin: 0; font-size: 48px; font-weight: 400;">${data.formData.reportTitle}</h1>
        <span style="color: #fff; margin-left: 15px; font-size: 24px; opacity: 0.8;">${data.formData.reportSubtitle}</span>
      </div>
      <div style="display: flex; gap: 20px;">
        <div style="width: 340px; display: flex; flex-direction: column; gap: 30px;">
          <div style="background-color: #4db69f; color: #fff; padding: 30px 10px; text-align: center; border-radius: 8px;">
            <h4 style="font-weight: 400; font-size: 22px; margin-bottom: 15px;">Total ECs Opened</h4>
            <div style="font-size: 72px; font-weight: bold;">${data.formData.totalECsOpened}</div>
          </div>
          <div style="position: relative; width: 300px; height: 300px; margin: 0 auto;">
            <svg width="300" height="300" viewBox="0 0 200 200">
              ${securityAngle > 0 ? `<path d="${createPieSegment(0, securityAngle)}" fill="#7d8bb1" stroke="white" stroke-width="2" />` : ''}
              ${safetyAngle > 0 ? `<path d="${createPieSegment(securityAngle, safetyAngle)}" fill="#a2bad0" stroke="white" stroke-width="2" />` : ''}
              ${othersAngle > 0 ? `<path d="${createPieSegment(securityAngle + safetyAngle, othersAngle)}" fill="#d1eef4" stroke="white" stroke-width="2" />` : ''}
              <circle cx="100" cy="100" r="35" fill="#fdfbf2" />
            </svg>
            <div style="position: absolute; left: ${(securityLabelPos.x / 200) * 300}px; top: ${(securityLabelPos.y / 200) * 300 - 12}px; transform: translate(-50%, -50%); background: white; padding: 4px 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); white-space: nowrap; font-size: 11px; font-weight: bold; border: 1px solid #e0e0e0;">Security ${security}%</div>
            <div style="position: absolute; left: ${(safetyLabelPos.x / 200) * 300}px; top: ${(safetyLabelPos.y / 200) * 300 - 12}px; transform: translate(-50%, -50%); background: white; padding: 4px 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); white-space: nowrap; font-size: 11px; font-weight: bold; border: 1px solid #e0e0e0;">Safety ${safety}%</div>
            <div style="position: absolute; left: ${(othersLabelPos.x / 200) * 300}px; top: ${(othersLabelPos.y / 200) * 300 - 12}px; transform: translate(-50%, -50%); background: white; padding: 4px 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); white-space: nowrap; font-size: 11px; font-weight: bold; border: 1px solid #e0e0e0;">Others ${others}%</div>
          </div>
        </div>
        <div style="width: 240px; display: flex; flex-direction: column; gap: 15px;">
          <div style="background-color: #fff; padding: 25px 20px; text-align: center; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h5 style="color: #aaa; font-size: 18px; font-weight: 400; margin-bottom: 10px;">EC Open Ratio</h5>
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="65" fill="transparent" stroke="#e0e0e0" stroke-width="12" />
              <circle cx="75" cy="75" r="65" fill="transparent" stroke="#76e5eb" stroke-width="12" stroke-dasharray="${2 * Math.PI * 65}" stroke-dashoffset="${2 * Math.PI * 65 * (1 - data.formData.ecOpenRatio / 100)}" stroke-linecap="round" transform="rotate(-90 75 75)" />
              <text x="75" y="82" text-anchor="middle" font-size="24" font-weight="bold" fill="#444">${data.formData.ecOpenRatio}%</text>
            </svg>
          </div>
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <span style="font-size: 16px; color: #888;">Open Manager</span>
            <span style="font-size: 40px; font-weight: bold; color: #333;">${data.formData.openManager}%</span>
          </div>
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <span style="font-size: 16px; color: #888;">Open Director</span>
            <span style="font-size: 40px; font-weight: bold; color: #333;">${data.formData.openDirector}%</span>
          </div>
        </div>
        <div style="flex: 1; background-color: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align: right; margin-bottom: 25px; color: #aaa; font-size: 14px;">Daily Pacing Dynamic</div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${barChartHtml}
          </div>
        </div>
      </div>
    `;
    return div;
  };

  const createPocClicksPage = () => {
    const data = pocClicksData;
    const formatDateForDisplayFn = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
    };

    const validEntries = data.barEntries.filter(entry => entry.date && entry.value);
    const bars = validEntries.map(entry => ({
      label: formatDateForDisplayFn(entry.date),
      value: parseInt(entry.value) || 0
    }));

    const security = parseFloat(data.formData.securityPerc);
    const safety = parseFloat(data.formData.safetyPerc);
    const others = parseFloat(data.formData.othersPerc);
    const securityAngle = (security / 100) * 360;
    const safetyAngle = (safety / 100) * 360;
    const othersAngle = (others / 100) * 360;
    const securityMidAngle = securityAngle / 2;
    const safetyMidAngle = securityAngle + (safetyAngle / 2);
    const othersMidAngle = securityAngle + safetyAngle + (othersAngle / 2);

    const getLabelPosition = (midAngle, distance) => {
      const rad = (midAngle - 90) * Math.PI / 180;
      return { x: 100 + (distance * Math.cos(rad)), y: 100 + (distance * Math.sin(rad)) };
    };

    const securityLabelPos = getLabelPosition(securityMidAngle, 115);
    const safetyLabelPos = getLabelPosition(safetyMidAngle, 115);
    const othersLabelPos = getLabelPosition(othersMidAngle, 115);

    const createPieSegment = (startAngle, angle) => {
      if (angle <= 0 || isNaN(angle) || isNaN(startAngle)) {
        return '';
      }
      const endAngle = startAngle + angle;
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;
      const x1 = 100 + 80 * Math.cos(startRad);
      const y1 = 100 + 80 * Math.sin(startRad);
      const x2 = 100 + 80 * Math.cos(endRad);
      const y2 = 100 + 80 * Math.sin(endRad);
      const largeArc = angle > 180 ? 1 : 0;
      return `M 100,100 L ${x1},${y1} A 80,80 0 ${largeArc},1 ${x2},${y2} Z`;
    };

    const div = document.createElement('div');
    div.style.width = '1122px';
    div.style.height = '794px';
    div.style.backgroundColor = '#fdfbf2';
    div.style.padding = '40px';
    div.style.boxSizing = 'border-box';
    div.style.fontFamily = 'Arial, sans-serif';

    let barChartHtml = '';
    if (bars.length > 0) {
      const maxValue = Math.max(...bars.map(b => b.value), 1);
      barChartHtml = bars.map((bar, i) => {
        const percentage = (bar.value / maxValue) * 100;
        return `
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
            <div style="width: 70px; font-size: 11px; color: #666;">${bar.label}</div>
            <div style="flex: 1; background-color: #f0f0f0; height: 28px; border-radius: 3px; overflow: hidden;">
              <div style="width: ${percentage}%; background-color: #4db69f; height: 100%;"></div>
            </div>
            <div style="width: 40px; font-size: 11px; color: #666; text-align: right;">${bar.value}</div>
          </div>
        `;
      }).join('');
    } else {
      barChartHtml = '<div style="text-align: center; padding: 40px; color: #999;">No data to display. Add entries using the form above.</div>';
    }

    div.innerHTML = `
      <div style="background-color: #545454; padding: 15px 40px; border-left: 15px solid #4db69f; margin-bottom: 25px; display: flex; align-items: baseline;">
        <h1 style="color: #fff; margin: 0; font-size: 48px; font-weight: 400;">${data.formData.reportTitle}</h1>
        <span style="color: #fff; margin-left: 15px; font-size: 24px; opacity: 0.8;">${data.formData.reportSubtitle}</span>
      </div>
      <div style="display: flex; gap: 20px;">
        <div style="width: 340px; display: flex; flex-direction: column; gap: 30px;">
          <div style="background-color: #4db69f; color: #fff; padding: 30px 10px; text-align: center; border-radius: 8px;">
            <h4 style="font-weight: 400; font-size: 22px; margin-bottom: 15px;">Total ECs Clicked</h4>
            <div style="font-size: 72px; font-weight: bold;">${data.formData.totalECsClicked}</div>
          </div>
          <div style="position: relative; width: 300px; height: 300px; margin: 0 auto;">
            <svg width="300" height="300" viewBox="0 0 200 200">
              ${securityAngle > 0 ? `<path d="${createPieSegment(0, securityAngle)}" fill="#7d8bb1" stroke="white" stroke-width="2" />` : ''}
              ${safetyAngle > 0 ? `<path d="${createPieSegment(securityAngle, safetyAngle)}" fill="#a2bad0" stroke="white" stroke-width="2" />` : ''}
              ${othersAngle > 0 ? `<path d="${createPieSegment(securityAngle + safetyAngle, othersAngle)}" fill="#d1eef4" stroke="white" stroke-width="2" />` : ''}
              <circle cx="100" cy="100" r="35" fill="#fdfbf2" />
            </svg>
            <div style="position: absolute; left: ${(securityLabelPos.x / 200) * 300}px; top: ${(securityLabelPos.y / 200) * 300 - 12}px; transform: translate(-50%, -50%); background: white; padding: 4px 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); white-space: nowrap; font-size: 11px; font-weight: bold; border: 1px solid #e0e0e0;">Security ${security}%</div>
            <div style="position: absolute; left: ${(safetyLabelPos.x / 200) * 300}px; top: ${(safetyLabelPos.y / 200) * 300 - 12}px; transform: translate(-50%, -50%); background: white; padding: 4px 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); white-space: nowrap; font-size: 11px; font-weight: bold; border: 1px solid #e0e0e0;">Safety ${safety}%</div>
            <div style="position: absolute; left: ${(othersLabelPos.x / 200) * 300}px; top: ${(othersLabelPos.y / 200) * 300 - 12}px; transform: translate(-50%, -50%); background: white; padding: 4px 10px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); white-space: nowrap; font-size: 11px; font-weight: bold; border: 1px solid #e0e0e0;">Others ${others}%</div>
          </div>
        </div>
        <div style="width: 240px; display: flex; flex-direction: column; gap: 15px;">
          <div style="background-color: #fff; padding: 25px 20px; text-align: center; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h5 style="color: #aaa; font-size: 18px; font-weight: 400; margin-bottom: 10px;">EC Click Ratio</h5>
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="65" fill="transparent" stroke="#e0e0e0" stroke-width="12" />
              <circle cx="75" cy="75" r="65" fill="transparent" stroke="#76e5eb" stroke-width="12" stroke-dasharray="${2 * Math.PI * 65}" stroke-dashoffset="${2 * Math.PI * 65 * (1 - data.formData.ecClickRatio / 100)}" stroke-linecap="round" transform="rotate(-90 75 75)" />
              <text x="75" y="82" text-anchor="middle" font-size="24" font-weight="bold" fill="#444">${data.formData.ecClickRatio}%</text>
            </svg>
          </div>
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <span style="font-size: 16px; color: #888;">Clicks Manager</span>
            <span style="font-size: 40px; font-weight: bold; color: #333;">${data.formData.clicksManager}%</span>
          </div>
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <span style="font-size: 16px; color: #888;">Clicks Director</span>
            <span style="font-size: 40px; font-weight: bold; color: #333;">${data.formData.clicksDirector}%</span>
          </div>
        </div>
        <div style="flex: 1; background-color: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align: right; margin-bottom: 25px; color: #aaa; font-size: 14px;">Daily Pacing Dynamic</div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${barChartHtml}
          </div>
        </div>
      </div>
    `;
    return div;
  };

  const createLandingPage = () => {
    const data = landingPageData;

    const locationData = data.stateEntries
      .filter(entry => entry.state && entry.value)
      .map(entry => ({
        state: entry.state,
        value: parseInt(entry.value) || 0
      }));

    const maxValue = Math.max(...locationData.map(d => d.value), 1);
    const chartHeight = 200;
    const chartWidth = 700;
    const barWidth = Math.min(35, (chartWidth / locationData.length) - 10);
    const startX = 60;

    let barsSvg = '';
    if (locationData.length > 0) {
      barsSvg = locationData.map((item, index) => {
        const barHeight = (item.value / maxValue) * chartHeight;
        const x = startX + (index * (barWidth + 15));
        const y = chartHeight - barHeight + 30;
        return `
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#4db69f" rx="3" />
          <text x="${x + barWidth / 2}" y="${chartHeight + 40}" text-anchor="middle" font-size="10" fill="#666">${item.state}</text>
          <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-size="9" fill="#4db69f" font-weight="bold">${item.value}</text>
        `;
      }).join('');
    }

    const div = document.createElement('div');
    div.style.width = '1122px';
    div.style.height = '794px';
    div.style.backgroundColor = '#fdfbf2';
    div.style.padding = '40px';
    div.style.boxSizing = 'border-box';
    div.style.fontFamily = 'Arial, sans-serif';

    div.innerHTML = `
      <div style="background-color: #545454; padding: 18px 40px; border-left: 15px solid #4db69f; margin-bottom: 25px;">
        <h1 style="color: #fff; margin: 0; font-size: 44px; font-weight: 400;">${data.formData.reportTitle}</h1>
      </div>
      
      <div style="display: flex; gap: 30px; margin-top: 20px;">
        <div style="flex: 2;">
          <div style="background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h4 style="color: #444; margin-bottom: 20px; font-weight: 500; text-align: center;">Audience Location Overview</h4>
            <div style="position: relative; min-height: 280px;">
              ${locationData.length > 0 ? `
                <svg width="100%" height="280" viewBox="0 0 800 280" preserveAspectRatio="xMidYMid meet">
                  <line x1="40" y1="30" x2="40" y2="${chartHeight + 30}" stroke="#ccc" stroke-width="1" />
                  <line x1="40" y1="${chartHeight + 30}" x2="${chartWidth + 50}" y2="${chartHeight + 30}" stroke="#ccc" stroke-width="1" />
                  <text x="30" y="30" text-anchor="end" font-size="10" fill="#999">${maxValue}</text>
                  <text x="30" y="${chartHeight / 4 + 30}" text-anchor="end" font-size="10" fill="#999">${Math.floor(maxValue * 0.75)}</text>
                  <text x="30" y="${chartHeight / 2 + 30}" text-anchor="end" font-size="10" fill="#999">${Math.floor(maxValue * 0.5)}</text>
                  <text x="30" y="${chartHeight * 3 / 4 + 30}" text-anchor="end" font-size="10" fill="#999">${Math.floor(maxValue * 0.25)}</text>
                  <text x="30" y="${chartHeight + 30}" text-anchor="end" font-size="10" fill="#999">0</text>
                  ${barsSvg}
                </svg>
              ` : '<div style="text-align: center; padding: 80px; color: #999;">No location data available</div>'}
            </div>
          </div>
        </div>
        
        <div style="flex: 1;">
          <div style="display: flex; gap: 15px; margin-bottom: 15px;">
            <div style="flex: 1; background: #fff; padding: 20px; text-align: center; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              <h5 style="color: #aaa; font-size: 14px; margin-bottom: 10px;">Total Users</h5>
              <div style="font-size: 42px; font-weight: bold; color: #333;">${data.formData.totalUsers}</div>
            </div>
            <div style="flex: 1; background: #fff; padding: 20px; text-align: center; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              <h5 style="color: #aaa; font-size: 14px; margin-bottom: 10px;">Avg. Session</h5>
              <div style="font-size: 42px; font-weight: bold; color: #333;">${data.formData.avgSession}</div>
            </div>
          </div>
          
          <div style="display: flex; gap: 15px; margin-bottom: 15px;">
            <div style="flex: 1; background: #fff; padding: 20px; text-align: center; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              <h5 style="color: #aaa; font-size: 14px; margin-bottom: 10px;">Bounced Users</h5>
              <div style="font-size: 42px; font-weight: bold; color: #333;">${data.formData.bouncedUsers}</div>
            </div>
            <div style="flex: 1; background: #fff; padding: 20px; text-align: center; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              <h5 style="color: #aaa; font-size: 14px; margin-bottom: 10px;">Form Downloads</h5>
              <div style="font-size: 42px; font-weight: bold; color: #333;">${data.formData.formDownloads}</div>
            </div>
          </div>
          
          <div style="background: #fff; padding: 20px; text-align: center; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h5 style="color: #aaa; font-size: 14px; margin-bottom: 10px;">Bounce Rate</h5>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="transparent" stroke="#e0e0e0" stroke-width="12" />
              <circle cx="60" cy="60" r="50" fill="transparent" stroke="#f39c12" stroke-width="12" 
                stroke-dasharray="${2 * Math.PI * 50}" 
                stroke-dashoffset="${2 * Math.PI * 50 * (1 - parseFloat(data.formData.bounceRate) / 100)}" 
                stroke-linecap="round" transform="rotate(-90 60 60)" />
              <text x="60" y="70" text-anchor="middle" font-size="24" font-weight="bold" fill="#333">${data.formData.bounceRate}%</text>
            </svg>
          </div>
        </div>
      </div>
    `;
    return div;
  };

  const createWebVitalsPage = () => {
    const data = webVitalsData;

    // Check if data exists
    if (!data || !data.formData) {
      const div = document.createElement('div');
      div.style.width = '1122px';
      div.style.minHeight = '794px';
      div.style.backgroundColor = '#fdfbf2';
      div.style.padding = '40px';
      div.style.boxSizing = 'border-box';
      div.style.fontFamily = 'Arial, sans-serif';
      div.innerHTML = `
      <div style="background-color: #545454; padding: 18px 40px; border-left: 15px solid #4db69f; margin-bottom: 25px;">
        <h1 style="color: #fff; margin: 0; font-size: 44px; font-weight: 400;">Web Page Vitals</h1>
      </div>
      <div style="text-align: center; padding: 100px; color: #999;">
        No data available. Please save the Web Vitals data first.
      </div>
    `;
      return div;
    }

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
      <div style="background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-top: 20px;">
        <h4 style="color: #444; margin-bottom: 15px; font-weight: 500;">Screenshot Preview</h4>
        <div style="text-align: center; background: #f5f5f5; border-radius: 8px; padding: 20px; min-height: 300px; display: flex; align-items: center; justify-content: center;">
          <img 
            src="${data.screenshotImage}" 
            style="max-width: 100%; max-height: 400px; width: auto; height: auto; object-fit: contain; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" 
            alt="Screenshot"
            crossorigin="anonymous"
          />
        </div>
      </div>
    `;
    } else {
      screenshotHtml = `
      <div style="background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-top: 20px;">
        <h4 style="color: #444; margin-bottom: 15px; font-weight: 500;">Screenshot Preview</h4>
        <div style="text-align: center; padding: 60px; color: #999; background: #f5f5f5; border-radius: 8px;">
          No screenshot uploaded
        </div>
      </div>
    `;
    }

    // Speed visualization data
    const speedValues = speedEntries.map(entry => parseFloat(entry.value) || 0);
    const maxSpeed = Math.max(...speedValues, 5);

    let speedBarsHtml = '';
    if (speedValues.length > 0) {
      speedBarsHtml = `
      <div style="margin-top: 30px; background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h4 style="color: #444; margin-bottom: 20px; font-weight: 500;">Speed Visualization</h4>
        <div style="display: flex; align-items: flex-end; gap: 8px; height: 200px; margin-bottom: 20px;">
          ${speedValues.map((value, index) => {
        const heightPercent = (value / maxSpeed) * 100;
        return `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                <div style="height: ${heightPercent}%; width: 100%; background-color: #4db69f; border-radius: 4px 4px 0 0; min-height: 4px;"></div>
                <div style="margin-top: 8px; font-size: 11px; color: #666; transform: rotate(-45deg); transform-origin: top left; white-space: nowrap;">${value}s</div>
              </div>
            `;
      }).join('')}
        </div>
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
          Page Load Time Progression
        </div>
      </div>
    `;
    }

    div.innerHTML = `
    <div style="background-color: #545454; padding: 18px 40px; border-left: 15px solid #4db69f; margin-bottom: 25px;">
      <h1 style="color: #fff; margin: 0; font-size: 44px; font-weight: 400;">${data.formData.reportTitle || 'Web Page Vitals'}</h1>
    </div>
    
    <!-- Top Metrics Row -->
    <div style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 200px; background: #fff; padding: 25px; text-align: center; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h5 style="color: #aaa; font-size: 14px; margin-bottom: 10px;">Avg. Page Load Speed</h5>
        <div style="font-size: 48px; font-weight: bold; color: #333;">${data.formData.avgPageLoadSpeed || '0'}s</div>
      </div>
      <div style="flex: 1; min-width: 200px; background: #fff; padding: 25px; text-align: center; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h5 style="color: #aaa; font-size: 14px; margin-bottom: 10px;">Structure Metric</h5>
        <div style="font-size: 48px; font-weight: bold; color: #333;">${data.formData.structureMetrix || '0'}%</div>
      </div>
      <div style="flex: 1; min-width: 200px; background: #fff; padding: 25px; text-align: center; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h5 style="color: #aaa; font-size: 14px; margin-bottom: 10px;">Largest Element (LCP)</h5>
        <div style="font-size: 48px; font-weight: bold; color: #333;">${data.formData.largestElementLCP || '0'}s</div>
      </div>
      <div style="flex: 1; min-width: 200px; background: #fff; padding: 25px; text-align: center; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h5 style="color: #aaa; font-size: 14px; margin-bottom: 10px;">TBT Script Blocks</h5>
        <div style="font-size: 48px; font-weight: bold; color: #333;">${data.formData.tbtScriptBlocks || '0'}MS</div>
      </div>
    </div>
    
    ${screenshotHtml}
    ${speedBarsHtml}
  `;
    return div;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Add this BEFORE the CampaignReportTabs component
  const CustomTextInput = ({ value, onChange, placeholder = "e.g. FL, OK, NY", size = "sm" }) => {
    const [localValue, setLocalValue] = useState(value || '');

    useEffect(() => {
      setLocalValue(value || '');
    }, [value]);

    const handleChange = (e) => {
      setLocalValue(e.target.value);
    };

    const handleBlur = () => {
      onChange(localValue);
    };

    return (
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        size={size}
      />
    );
  };

  const getGraphData = () => {
    const validEntries = pacingEntries.filter(entry => entry.date && entry.value);
    if (validEntries.length === 0) {
      return { points: '', area: '', maxValue: 2500, values: [], validEntries: [] };
    }

    const values = validEntries.map(entry => parseFloat(entry.value) || 0);
    const max = Math.max(...values, 2500);
    const w = 550, h = 150;
    const xStep = validEntries.length > 1 ? w / (validEntries.length - 1) : 0;
    const points = values.map((v, i) => `${i * xStep},${h - (v / max * h)}`).join(' ');
    const areaPoints = values.map((v, i) => `${i * xStep},${h - (v / max * h)}`).join(' ');
    return { points, area: `0,${h} ${areaPoints} ${w},${h}`, maxValue: max, values, validEntries };
  };

  const graphData = getGraphData();

  const PieChartWithLabels = () => {
    const security = parseFloat(outboundFormData.securityPerc) || 0;
    const safety = parseFloat(outboundFormData.safetyPerc) || 0;
    const others = parseFloat(outboundFormData.othersPerc) || 0;

    const total = security + safety + others;
    const securityPercent = total > 0 ? (security / total) * 100 : 0;
    const safetyPercent = total > 0 ? (safety / total) * 100 : 0;
    const othersPercent = total > 0 ? (others / total) * 100 : 0;

    const securityAngle = (securityPercent / 100) * 360;
    const safetyAngle = (safetyPercent / 100) * 360;
    const othersAngle = (othersPercent / 100) * 360;

    const securityMidAngle = securityAngle / 2;
    const safetyMidAngle = securityAngle + (safetyAngle / 2);
    const othersMidAngle = securityAngle + safetyAngle + (othersAngle / 2);

    const getLabelPosition = (midAngle, distance) => {
      const rad = (midAngle - 90) * Math.PI / 180;
      return {
        x: 105 + (distance * Math.cos(rad)),
        y: 105 + (distance * Math.sin(rad))
      };
    };

    const securityLabelPos = getLabelPosition(securityMidAngle, 115);
    const safetyLabelPos = getLabelPosition(safetyMidAngle, 115);
    const othersLabelPos = getLabelPosition(othersMidAngle, 115);

    const createPieSegment = (startAngle, angle) => {
      if (angle <= 0 || isNaN(angle) || isNaN(startAngle)) {
        return '';
      }
      const endAngle = startAngle + angle;
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;
      const x1 = 105 + 80 * Math.cos(startRad);
      const y1 = 105 + 80 * Math.sin(startRad);
      const x2 = 105 + 80 * Math.cos(endRad);
      const y2 = 105 + 80 * Math.sin(endRad);
      const largeArc = angle > 180 ? 1 : 0;
      return `M 105,105 L ${x1},${y1} A 80,80 0 ${largeArc},1 ${x2},${y2} Z`;
    };

    return (
      <div style={{ position: 'relative', width: '300px', height: '300px', margin: '0 auto' }}>
        <svg width="300" height="300" viewBox="0 0 210 210">
          {securityAngle > 0 && <path d={createPieSegment(0, securityAngle)} fill="#7d8bb1" stroke="white" strokeWidth="2" />}
          {safetyAngle > 0 && <path d={createPieSegment(securityAngle, safetyAngle)} fill="#a2bad0" stroke="white" strokeWidth="2" />}
          {othersAngle > 0 && <path d={createPieSegment(securityAngle + safetyAngle, othersAngle)} fill="#d1eef4" stroke="white" strokeWidth="2" />}
          <circle cx="105" cy="105" r="35" fill="#fdfbf2" />
        </svg>

        {!isNaN(securityLabelPos.x) && !isNaN(securityLabelPos.y) && (
          <div style={{ position: 'absolute', left: `${(securityLabelPos.x / 210) * 300}px`, top: `${(securityLabelPos.y / 210) * 300 - 12}px`, transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '4px 10px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 'bold', color: '#333', border: '1px solid #e0e0e0' }}>
            Security {securityPercent.toFixed(1)}%
          </div>
        )}
        {!isNaN(safetyLabelPos.x) && !isNaN(safetyLabelPos.y) && (
          <div style={{ position: 'absolute', left: `${(safetyLabelPos.x / 210) * 300}px`, top: `${(safetyLabelPos.y / 210) * 300 - 12}px`, transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '4px 10px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 'bold', color: '#333', border: '1px solid #e0e0e0' }}>
            Safety {safetyPercent.toFixed(1)}%
          </div>
        )}
        {!isNaN(othersLabelPos.x) && !isNaN(othersLabelPos.y) && (
          <div style={{ position: 'absolute', left: `${(othersLabelPos.x / 210) * 300}px`, top: `${(othersLabelPos.y / 210) * 300 - 12}px`, transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '4px 10px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 'bold', color: '#333', border: '1px solid #e0e0e0' }}>
            Others {othersPercent.toFixed(1)}%
          </div>
        )}
      </div>
    );
  };

  const BounceRateGauge = () => {
    const bounceRate = parseFloat(outboundFormData.bounceRate) || 0;
    const maxBounce = 10;
    const angle = Math.min(Math.max((bounceRate / maxBounce) * 180, 0), 180);
    const dashoffset = 251 - (bounceRate / maxBounce) * 251;

    return (
      <div style={{ textAlign: 'center' }}>
        <svg width="180" height="120" viewBox="0 0 180 120">
          <path
            d="M 20 100 A 80 80 0 0 1 160 100"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 160 100"
            fill="none"
            stroke="#28a745"
            strokeWidth="15"
            strokeLinecap="round"
            strokeDasharray="251"
            strokeDashoffset={dashoffset}
          />
          <line
            x1="90"
            y1="100"
            x2="90"
            y2="50"
            stroke="#28a745"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${angle - 90}, 90, 100)`}
          />
          <circle cx="90" cy="100" r="8" fill="#28a745" />
        </svg>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#444', marginTop: '10px' }}>
          {bounceRate}%
        </div>
      </div>
    );
  };

  const PDFStat = ({ label, value, height = '145px' }) => (
    <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', textAlign: 'center', height: height, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h5 style={{ color: '#aaa', fontSize: '16px', fontWeight: '400', marginBottom: '8px' }}>{label}</h5>
      <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#444' }}>{value}</div>
    </div>
  );

  const OutboundForm = () => (
    <>
      <Row className="mb-3">
        <Col md={6}><Form.Label>Report Title</Form.Label>
        <Form.Control name="reportTitle" 
        value={outboundFormData.reportTitle} onChange={handleOutboundChange} />
        </Col>
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
          <CustomNumberInput
            value={outboundFormData.totalEmailsSent}
            onChange={(value) => handleOutboundNumberChange('totalEmailsSent', value)}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Total Delivered</Form.Label>
          <CustomNumberInput
            value={outboundFormData.totalEmailsDelivered}
            onChange={(value) => handleOutboundNumberChange('totalEmailsDelivered', value)}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Avg Sends</Form.Label>
          <CustomNumberInput
            value={outboundFormData.dailyAvgSends}
            onChange={(value) => handleOutboundNumberChange('dailyAvgSends', value)}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Hard Bounced</Form.Label>
          <CustomNumberInput
            value={outboundFormData.totalHardBounced}
            onChange={(value) => handleOutboundNumberChange('totalHardBounced', value)}
          />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={2}>
          <Form.Label>Security %</Form.Label>
          <CustomNumberInput
            value={outboundFormData.securityPerc}
            onChange={(value) => handleOutboundNumberChange('securityPerc', value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Safety %</Form.Label>
          <CustomNumberInput
            value={outboundFormData.safetyPerc}
            onChange={(value) => handleOutboundNumberChange('safetyPerc', value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Others %</Form.Label>
          <CustomNumberInput
            value={outboundFormData.othersPerc}
            onChange={(value) => handleOutboundNumberChange('othersPerc', value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Bounce Rate %</Form.Label>
          <CustomNumberInput
            value={outboundFormData.bounceRate}
            onChange={(value) => handleOutboundNumberChange('bounceRate', value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Managers EC %</Form.Label>
          <CustomNumberInput
            value={outboundFormData.ecManagers}
            onChange={(value) => handleOutboundNumberChange('ecManagers', value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Directors EC %</Form.Label>
          <CustomNumberInput
            value={outboundFormData.ecDirectors}
            onChange={(value) => handleOutboundNumberChange('ecDirectors', value)}
          />
        </Col>
      </Row>

      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">Daily Pacing Dynamic Data</Form.Label>
        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px' }}>
          <Table responsive bordered size="sm">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Date</th>
                <th style={{ width: '45%' }}>Value</th>
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

      <div className="d-flex gap-3">
        <Button variant="outline-secondary" size="lg" className="flex-grow-1 fw-bold" onClick={handleBackToCampaign}>Back to Campaign</Button>
        <Button variant="success" size="lg" className="flex-grow-1 fw-bold" onClick={saveOutboundData}>💾 Save & Next</Button>
      </div>
    </>
  );

  const PoCOpensForm = () => (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Label>Report Title</Form.Label>
          <Form.Control
            name="reportTitle"
            value={pocOpensFormData.reportTitle}
            onChange={handlePocOpensChange}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Subtitle</Form.Label>
          <Form.Control
            name="reportSubtitle"
            value={pocOpensFormData.reportSubtitle}
            onChange={handlePocOpensChange}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Total ECs Opened</Form.Label>
          <CustomNumberInput
            value={pocOpensFormData.totalECsOpened}
            onChange={(value) => handlePocOpensNumberChange('totalECsOpened', value)}
            placeholder="e.g. 1319 or 1,319"
          />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={2}>
          <Form.Label>EC Open Ratio %</Form.Label>
          <CustomNumberInput
            value={pocOpensFormData.ecOpenRatio}
            onChange={(value) => handlePocOpensNumberChange('ecOpenRatio', value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Open Manager %</Form.Label>
          <CustomNumberInput
            value={pocOpensFormData.openManager}
            onChange={(value) => handlePocOpensNumberChange('openManager', value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Open Director %</Form.Label>
          <CustomNumberInput
            value={pocOpensFormData.openDirector}
            onChange={(value) => handlePocOpensNumberChange('openDirector', value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Security %</Form.Label>
          <CustomNumberInput
            value={pocOpensFormData.securityPerc}
            onChange={(value) => handlePocOpensNumberChange('securityPerc', value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Safety %</Form.Label>
          <CustomNumberInput
            value={pocOpensFormData.safetyPerc}
            onChange={(value) => handlePocOpensNumberChange('safetyPerc', value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Others %</Form.Label>
          <CustomNumberInput
            value={pocOpensFormData.othersPerc}
            onChange={(value) => handlePocOpensNumberChange('othersPerc', value)}
          />
        </Col>
      </Row>

      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">Bar Chart Values (Date & Value)</Form.Label>
        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px' }}>
          <Table responsive bordered size="sm">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Date</th>
                <th style={{ width: '45%' }}>Value</th>
                <th style={{ width: '10%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {opensBarEntries.map((entry) => (
                <tr key={entry.id}>
                  <td style={{ width: '45%' }}>
                    <CustomDatePicker
                      value={entry.date}
                      onChange={(value) => handleOpensBarEntryChange(entry.id, 'date', value)}
                    />
                  </td>
                  <td style={{ width: '45%' }}>
                    <CustomNumberInput
                      value={entry.value}
                      onChange={(value) => handleOpensBarEntryChange(entry.id, 'value', value)}
                    />
                  </td>
                  <td className="text-center" style={{ width: '10%' }}>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeOpensBarEntry(entry.id)}
                      disabled={opensBarEntries.length === 1}
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
          onClick={addOpensBarEntry}
          className="mt-2"
          style={{ width: '100%' }}
        >
          + Add New Entry
        </Button>
      </Form.Group>

      <div className="d-flex gap-3">
        <Button variant="outline-secondary" size="lg" className="flex-grow-1 fw-bold" onClick={() => setActiveTab('outbound')}>← Back</Button>
        <Button variant="success" size="lg" className="flex-grow-1 fw-bold" onClick={savePocOpensData}>💾 Save & Next</Button>
      </div>
    </>
  );
  const PoCClicksForm = () => (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Label>Report Title</Form.Label>
          <Form.Control
            name="reportTitle"
            value={pocClicksFormData.reportTitle}
            onChange={handlePocClicksChange}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Subtitle</Form.Label>
          <Form.Control
            name="reportSubtitle"
            value={pocClicksFormData.reportSubtitle}
            onChange={handlePocClicksChange}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Total ECs Clicked</Form.Label>
          <CustomNumberInput
            value={pocClicksFormData.totalECsClicked}
            onChange={(value) => handlePocClicksNumberChange('totalECsClicked', value)}
            placeholder="e.g. 223"
          />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={2}>
          <Form.Label>EC Click Ratio %</Form.Label>
          <CustomNumberInput
            value={pocClicksFormData.ecClickRatio}
            onChange={(value) => handlePocClicksNumberChange('ecClickRatio', value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Clicks Manager %</Form.Label>
          <CustomNumberInput
            value={pocClicksFormData.clicksManager}
            onChange={(value) => handlePocClicksNumberChange('clicksManager', value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Clicks Director %</Form.Label>
          <CustomNumberInput
            value={pocClicksFormData.clicksDirector}
            onChange={(value) => handlePocClicksNumberChange('clicksDirector', value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Security %</Form.Label>
          <CustomNumberInput
            value={pocClicksFormData.securityPerc}
            onChange={(value) => handlePocClicksNumberChange('securityPerc', value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Safety %</Form.Label>
          <CustomNumberInput
            value={pocClicksFormData.safetyPerc}
            onChange={(value) => handlePocClicksNumberChange('safetyPerc', value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Others %</Form.Label>
          <CustomNumberInput
            value={pocClicksFormData.othersPerc}
            onChange={(value) => handlePocClicksNumberChange('othersPerc', value)}
          />
        </Col>
      </Row>

      <Form.Group className="mb-4">
        <Form.Label className="fw-bold">Bar Chart Values (Date & Value)</Form.Label>
        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px' }}>
          <Table responsive bordered size="sm">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Date</th>
                <th style={{ width: '45%' }}>Value</th>
                <th style={{ width: '10%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {clicksBarEntries.map((entry) => (
                <tr key={entry.id}>
                  <td style={{ width: '45%' }}>
                    <CustomDatePicker
                      value={entry.date}
                      onChange={(value) => handleClicksBarEntryChange(entry.id, 'date', value)}
                    />
                  </td>
                  <td style={{ width: '45%' }}>
                    <CustomNumberInput
                      value={entry.value}
                      onChange={(value) => handleClicksBarEntryChange(entry.id, 'value', value)}
                    />
                  </td>
                  <td className="text-center" style={{ width: '10%' }}>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeClicksBarEntry(entry.id)}
                      disabled={clicksBarEntries.length === 1}
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
          onClick={addClicksBarEntry}
          className="mt-2"
          style={{ width: '100%' }}
        >
          + Add New Entry
        </Button>
      </Form.Group>

      <div className="d-flex gap-3">
        <Button variant="outline-secondary" size="lg" className="flex-grow-1 fw-bold" onClick={() => setActiveTab('poc-opens')}>← Back</Button>
        <Button variant="success" size="lg" className="flex-grow-1 fw-bold" onClick={savePocClicksData}>💾 Save & Next</Button>
      </div>
    </>
  );

  const LandingPageForm = () => (
    <>
      <Row className="mb-3">
        <Col md={12}>
          <Form.Label>Report Title</Form.Label>
          <Form.Control
            name="reportTitle"
            value={landingPageFormData.reportTitle}
            onChange={handleLandingPageChange}
          />
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
          <CustomNumberInput
            value={landingPageFormData.bounceRate}
            onChange={(value) => handleLandingPageNumberChange('bounceRate', value)}
            placeholder="e.g. 72"
          />
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
              {stateEntries.map((entry) => (
                <tr key={entry.id}>
                  <td style={{ width: '70%' }}>
                    <CustomTextInput
                      value={entry.state}
                      onChange={(newValue) => handleStateEntryChange(entry.id, 'state', newValue)}
                      placeholder="e.g. FL, OK, NY"
                    />
                  </td>
                  <td style={{ width: '20%' }}>
                    <CustomNumberInput
                      value={entry.value}
                      onChange={(newValue) => handleStateEntryChange(entry.id, 'value', newValue)}
                      placeholder="e.g. 45"
                    />
                  </td>
                  <td className="text-center" style={{ width: '10%' }}>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeStateEntry(entry.id)}
                      disabled={stateEntries.length === 1}
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
          onClick={addStateEntry}
          className="mt-2"
          style={{ width: '100%' }}
        >
          + Add New Location
        </Button>
        <small className="text-muted mt-2 d-block">Add states/regions with their values to display in the bar chart</small>
      </Form.Group>

      <div className="d-flex gap-3">
        <Button variant="outline-secondary" size="lg" className="flex-grow-1 fw-bold" onClick={() => setActiveTab('poc-clicks')}>← Back</Button>
        <Button variant="success" size="lg" className="flex-grow-1 fw-bold" onClick={saveLandingPageData}>💾 Save & Next</Button>
      </div>
    </>
  );

  const WebVitalsForm = () => (
    <>
      <Row className="mb-3">
        <Col md={12}>
          <Form.Label>Report Title</Form.Label>
          <Form.Control
            name="reportTitle"
            value={webVitalsFormData.reportTitle}
            onChange={handleWebVitalsChange}
          />
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
            <small className="text-muted d-block mt-1">Screenshot will appear in the PDF</small>
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
                {OutboundForm()}
              </Tab>
              <Tab eventKey="poc-opens" title="PoC Engagement Stats (Opens)">
                {pocOpensSaveMessage && <Alert variant="success" className="mb-3">{pocOpensSaveMessage}</Alert>}
                {pocOpensValidationMessage && <Alert variant="warning" className="mb-3">{pocOpensValidationMessage}</Alert>}
                {PoCOpensForm()}
              </Tab>
              <Tab eventKey="poc-clicks" title="PoC Engagement Stats (Clicks)">
                {pocClicksSaveMessage && <Alert variant="success" className="mb-3">{pocClicksSaveMessage}</Alert>}
                {pocClicksValidationMessage && <Alert variant="warning" className="mb-3">{pocClicksValidationMessage}</Alert>}
                {PoCClicksForm()}
              </Tab>
              <Tab eventKey="landing-page" title="Landing Page Performance">
                {landingPageSaveMessage && <Alert variant="success" className="mb-3">{landingPageSaveMessage}</Alert>}
                {landingPageValidationMessage && <Alert variant="warning" className="mb-3">{landingPageValidationMessage}</Alert>}
                {LandingPageForm()}
              </Tab>
              <Tab eventKey="web-vitals" title="Web Page Vitals">
                {webVitalsSaveMessage && <Alert variant="success" className="mb-3">{webVitalsSaveMessage}</Alert>}
                {webVitalsValidationMessage && <Alert variant="warning" className="mb-3">{webVitalsValidationMessage}</Alert>}
                {WebVitalsForm()}
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>

      {/* Hidden preview for Outbound */}
      <div style={{ position: 'absolute', left: '-5000px', top: 0 }}>
        <div style={{ width: '1122px', height: '794px', backgroundColor: '#fdfbf2', padding: '40px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ backgroundColor: '#545454', padding: '18px 40px', borderLeft: '15px solid #4db69f', marginBottom: '25px', display: 'flex', alignItems: 'baseline' }}>
            <h1 style={{ color: '#fff', margin: 0, fontSize: '44px', fontWeight: '400' }}>{outboundFormData.reportTitle}</h1>
            <span style={{ color: '#fff', marginLeft: '15px', fontSize: '24px', opacity: 0.8 }}>({formatDate(outboundFormData.startDate)} - {formatDate(outboundFormData.endDate)})</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ width: '330px' }}>
              <div style={{ backgroundColor: '#4db69f', color: '#fff', padding: '40px 10px', textAlign: 'center', height: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: '8px' }}>
                <h4 style={{ fontWeight: '400', fontSize: '24px', marginBottom: '20px' }}>Total Emails Sent</h4>
                <div style={{ fontSize: '80px', fontWeight: 'bold' }}>{outboundFormData.totalEmailsSent}</div>
              </div>
              <div style={{ marginTop: '40px', marginBottom: '20px' }}>
                {PieChartWithLabels()}
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                {PDFStat({ label: 'Total Emails Delivered', value: outboundFormData.totalEmailsDelivered })}
                {PDFStat({ label: 'Daily Average Sends', value: outboundFormData.dailyAvgSends })}
                {PDFStat({ label: 'Total Hard Bounced', value: outboundFormData.totalHardBounced })}
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ width: '280px', background: '#fff', padding: '20px', textAlign: 'center', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: '310px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h5 style={{ color: '#aaa', marginBottom: '15px', fontSize: '18px' }}>Bounce Rate</h5>
                  {BounceRateGauge()}
                </div>
                <div style={{ flex: 1, backgroundColor: '#fff', padding: '25px', height: '310px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h5 style={{ color: '#aaa', textAlign: 'right', fontSize: '18px' }}>Daily Pacing Dynamic</h5>
                  <div style={{ display: 'flex', marginTop: '15px' }}>
                    <div style={{ height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '12px', color: '#bbb', paddingRight: '12px' }}>
                      <span>{graphData.maxValue}</span>
                      <span>{Math.floor(graphData.maxValue / 2)}</span>
                      <span>0</span>
                    </div>
                    <div style={{ flex: 1, borderLeft: '1px solid #eee', borderBottom: '1px solid #eee' }}>
                      {graphData.validEntries && graphData.validEntries.length > 0 ? (
                        <svg width="100%" height="150" viewBox="0 0 550 150" preserveAspectRatio="none">
                          <polyline points={graphData.area} fill="#9bd9cc" fillOpacity="0.4" />
                          <polyline points={graphData.points} fill="none" stroke="#4db69f" strokeWidth="3" />
                        </svg>
                      ) : (
                        <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>No data to display</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#bbb', fontSize: '13px', paddingLeft: '45px' }}>
                    <span>{graphData.validEntries && graphData.validEntries[0]?.date ? formatDate(graphData.validEntries[0].date) : formatDate(outboundFormData.startDate)}</span>
                    <span>Daily Timeline</span>
                    <span>{graphData.validEntries && graphData.validEntries[graphData.validEntries.length - 1]?.date ? formatDate(graphData.validEntries[graphData.validEntries.length - 1].date) : formatDate(outboundFormData.endDate)}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '15px', marginBottom: '10px' }}>
                {PDFStat({ label: 'EC Delivered - Managers', value: `${outboundFormData.ecManagers}%`, height: '140px' })}
                {PDFStat({ label: 'EC Delivered - Directors', value: `${outboundFormData.ecDirectors}%`, height: '140px' })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignReportTabs;