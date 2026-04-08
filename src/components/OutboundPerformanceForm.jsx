// OutboundPerformance.jsx
import React, { useState, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card, Table, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const OutboundPerformance = () => {
  const reportRef = useRef();

  const [formData, setFormData] = useState({
    reportTitle: 'Outbound Performance',
    startDate: '2021-12-01',
    endDate: '2021-12-31',
    totalEmailsSent: '15,283',
    totalEmailsDelivered: '8,358',
    dailyAvgSends: '387',
    totalHardBounced: '123',
    securityPerc: 17,
    safetyPerc: 38,
    othersPerc: 45,
    bounceRate: 4.8,
    ecManagers: 55,
    ecDirectors: 45
  });

  // Start with only one empty row
  const [pacingEntries, setPacingEntries] = useState([
    { date: '', value: '' }
  ]);

  const [saveMessage, setSaveMessage] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setIsSaved(false);
  };

  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...pacingEntries];
    updatedEntries[index][field] = value;
    setPacingEntries(updatedEntries);
    setIsSaved(false);
  };

  const addEntry = () => {
    setPacingEntries([...pacingEntries, { date: '', value: '' }]);
    setIsSaved(false);
  };

  const removeEntry = (index) => {
    if (pacingEntries.length > 1) {
      const updatedEntries = pacingEntries.filter((_, i) => i !== index);
      setPacingEntries(updatedEntries);
      setIsSaved(false);
    }
  };

  const handleSave = () => {
    const dataToSave = {
      formData,
      pacingEntries,
      savedAt: new Date().toISOString()
    };
    sessionStorage.setItem('outboundData', JSON.stringify(dataToSave));
    setIsSaved(true);
    setSaveMessage('Data saved successfully! You can now proceed to PoC Engagement Stats.');
    
    setTimeout(() => {
      setSaveMessage('');
    }, 3000);
  };

  const goBack = () => {
    window.location.href = '/';
  };

  const goToPoC = () => {
    if (!isSaved) {
      setSaveMessage('Please save your data first before proceeding!');
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
      return;
    }
    window.location.href = '/PoCEngagementStats';
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const getGraphData = () => {
    const validEntries = pacingEntries.filter(entry => entry.date && entry.value);
    if (validEntries.length === 0) {
      return { points: '', area: '', maxValue: 2500, values: [] };
    }
    
    const values = validEntries.map(entry => parseFloat(entry.value) || 0);
    const max = Math.max(...values, 2500);
    const w = 550, h = 150;
    const xStep = validEntries.length > 1 ? w / (validEntries.length - 1) : 0;
    const points = values.map((v, i) => `${i * xStep},${h - (v / max * h)}`).join(' ');
    const areaPoints = values.map((v, i) => `${i * xStep},${h - (v / max * h)}`).join(' ');
    return { points, area: `0,${h} ${areaPoints} ${w},${h}`, maxValue: max, values, validEntries };
  };

  const PieChartWithLabels = () => {
    const security = parseFloat(formData.securityPerc);
    const safety = parseFloat(formData.safetyPerc);
    const others = parseFloat(formData.othersPerc);
    
    const securityAngle = (security / 100) * 360;
    const safetyAngle = (safety / 100) * 360;
    const othersAngle = (others / 100) * 360;
    
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
    
    const createPieSegment = (startAngle, angle, color) => {
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
          <path d={createPieSegment(0, securityAngle, '#7d8bb1')} fill="#7d8bb1" stroke="white" strokeWidth="2" />
          <path d={createPieSegment(securityAngle, safetyAngle, '#a2bad0')} fill="#a2bad0" stroke="white" strokeWidth="2" />
          <path d={createPieSegment(securityAngle + safetyAngle, othersAngle, '#d1eef4')} fill="#d1eef4" stroke="white" strokeWidth="2" />
          <circle cx="105" cy="105" r="35" fill="#fdfbf2" />
        </svg>
        
        <div style={{ position: 'absolute', left: `${(securityLabelPos.x / 210) * 300}px`, top: `${(securityLabelPos.y / 210) * 300 - 12}px`, transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '4px 10px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 'bold', color: '#333', border: '1px solid #e0e0e0' }}>
          Security {security.toFixed(1)}%
        </div>
        <div style={{ position: 'absolute', left: `${(safetyLabelPos.x / 210) * 300}px`, top: `${(safetyLabelPos.y / 210) * 300 - 12}px`, transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '4px 10px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 'bold', color: '#333', border: '1px solid #e0e0e0' }}>
          Safety {safety.toFixed(1)}%
        </div>
        <div style={{ position: 'absolute', left: `${(othersLabelPos.x / 210) * 300}px`, top: `${(othersLabelPos.y / 210) * 300 - 12}px`, transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '4px 10px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 'bold', color: '#333', border: '1px solid #e0e0e0' }}>
          Others {others.toFixed(1)}%
        </div>
      </div>
    );
  };

  const BounceRateGauge = () => {
    const bounceRate = parseFloat(formData.bounceRate);
    const maxBounce = 10;
    const angle = (bounceRate / maxBounce) * 180;
    
    return (
      <div style={{ textAlign: 'center' }}>
        <svg width="180" height="120" viewBox="0 0 180 120">
          {/* Background arc */}
          <path 
            d="M 20 100 A 80 80 0 0 1 160 100" 
            fill="none" 
            stroke="#e0e0e0" 
            strokeWidth="15" 
            strokeLinecap="round"
          />
          {/* Foreground arc showing percentage */}
          <path 
            d="M 20 100 A 80 80 0 0 1 160 100" 
            fill="none" 
            stroke="#28a745" 
            strokeWidth="15" 
            strokeLinecap="round"
            strokeDasharray="251"
            strokeDashoffset={251 - (bounceRate / maxBounce) * 251}
          />
          {/* Needle */}
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

  const validEntries = pacingEntries.filter(entry => entry.date && entry.value);
  const graphData = getGraphData();

  return (
    <div className="vh-100 overflow-hidden d-flex flex-column" style={{ backgroundColor: '#f4f7f6' }}>
      <Container className="py-4 flex-grow-1 overflow-auto">
        <Card className="shadow-lg border-0">
          <Card.Header className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Campaign Performance Data Entry Form</h5>
            <Button variant="outline-light" size="sm" onClick={goBack}>Back to Home</Button>
          </Card.Header>
          <Card.Body className="p-4">
            {saveMessage && (
              <Alert variant={isSaved ? "success" : "warning"} className="mb-3">
                {saveMessage}
              </Alert>
            )}
            
            <Form>
              <Row className="mb-3">
                <Col md={6}><Form.Label>Report Title</Form.Label><Form.Control name="reportTitle" value={formData.reportTitle} onChange={handleChange} /></Col>
                <Col md={3}><Form.Label>Start Date</Form.Label><Form.Control type="date" name="startDate" value={formData.startDate} onChange={handleChange} /></Col>
                <Col md={3}><Form.Label>End Date</Form.Label><Form.Control type="date" name="endDate" value={formData.endDate} onChange={handleChange} /></Col>
              </Row>
              <Row className="mb-3">
                <Col md={3}><Form.Label>Total Emails Sent</Form.Label><Form.Control name="totalEmailsSent" value={formData.totalEmailsSent} onChange={handleChange} /></Col>
                <Col md={3}><Form.Label>Total Delivered</Form.Label><Form.Control name="totalEmailsDelivered" value={formData.totalEmailsDelivered} onChange={handleChange} /></Col>
                <Col md={3}><Form.Label>Avg Sends</Form.Label><Form.Control name="dailyAvgSends" value={formData.dailyAvgSends} onChange={handleChange} /></Col>
                <Col md={3}><Form.Label>Hard Bounced</Form.Label><Form.Control name="totalHardBounced" value={formData.totalHardBounced} onChange={handleChange} /></Col>
              </Row>
              <Row className="mb-3">
                <Col md={2}><Form.Label>Security %</Form.Label><Form.Control type="number" step="0.1" name="securityPerc" value={formData.securityPerc} onChange={handleChange} /></Col>
                <Col md={2}><Form.Label>Safety %</Form.Label><Form.Control type="number" step="0.1" name="safetyPerc" value={formData.safetyPerc} onChange={handleChange} /></Col>
                <Col md={2}><Form.Label>Others %</Form.Label><Form.Control type="number" step="0.1" name="othersPerc" value={formData.othersPerc} onChange={handleChange} /></Col>
                <Col md={2}><Form.Label>Bounce Rate %</Form.Label><Form.Control type="number" step="0.1" name="bounceRate" value={formData.bounceRate} onChange={handleChange} /></Col>
                <Col md={2}><Form.Label>Managers EC %</Form.Label><Form.Control name="ecManagers" value={formData.ecManagers} onChange={handleChange} /></Col>
                <Col md={2}><Form.Label>Directors EC %</Form.Label><Form.Control name="ecDirectors" value={formData.ecDirectors} onChange={handleChange} /></Col>
              </Row>
              
              {/* Dynamic Pacing Graph Data Entry - Start with ONE row */}
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
                      {pacingEntries.map((entry, index) => (
                        <tr key={index}>
                          <td>
                            <Form.Control
                              type="date"
                              value={entry.date}
                              onChange={(e) => handleEntryChange(index, 'date', e.target.value)}
                              size="sm"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              placeholder="Enter value"
                              value={entry.value}
                              onChange={(e) => handleEntryChange(index, 'value', e.target.value)}
                              size="sm"
                            />
                          </td>
                          <td className="text-center">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeEntry(index)}
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
                  onClick={addEntry}
                  className="mt-2"
                  style={{ width: '100%' }}
                >
                  + Add New Entry
                </Button>
              </Form.Group>
              
              <div className="d-flex gap-3">
                <Button variant="outline-secondary" size="lg" className="flex-grow-1 fw-bold" onClick={goBack}>Back to Home</Button>
                <Button variant="success" size="lg" className="flex-grow-1 fw-bold" onClick={handleSave}>💾 Save Data</Button>
                <Button type="button" size="lg" className="flex-grow-1 fw-bold border-0" style={{ backgroundColor: '#4db69f' }} onClick={goToPoC}>Next: PoC Engagement Stats →</Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      {/* Hidden PDF Template with Full Charts */}
      <div style={{ position: 'absolute', left: '-5000px', top: 0 }}>
        <div ref={reportRef} style={{ width: '1122px', height: '794px', backgroundColor: '#fdfbf2', padding: '40px 40px 60px 40px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ backgroundColor: '#545454', padding: '18px 40px', borderLeft: '15px solid #4db69f', marginBottom: '25px', display: 'flex', alignItems: 'baseline' }}>
            <h1 style={{ color: '#fff', margin: 0, fontSize: '44px', fontWeight: '400' }}>{formData.reportTitle}</h1>
            <span style={{ color: '#fff', marginLeft: '15px', fontSize: '24px', opacity: 0.8 }}>({formatDate(formData.startDate)} - {formatDate(formData.endDate)})</span>
          </div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* Left Column */}
            <div style={{ width: '330px' }}>
              <div style={{ backgroundColor: '#4db69f', color: '#fff', padding: '40px 10px', textAlign: 'center', height: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: '8px' }}>
                <h4 style={{ fontWeight: '400', fontSize: '24px', marginBottom: '20px' }}>Total Emails Sent</h4>
                <div style={{ fontSize: '80px', fontWeight: 'bold' }}>{formData.totalEmailsSent}</div>
              </div>
              
              {/* Pie Chart */}
              <div style={{ marginTop: '40px', marginBottom: '20px' }}>
                <PieChartWithLabels />
              </div>
            </div>

            {/* Right Column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Top Stats */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <PDFStat label="Total Emails Delivered" value={formData.totalEmailsDelivered} />
                <PDFStat label="Daily Average Sends" value={formData.dailyAvgSends} />
                <PDFStat label="Total Hard Bounced" value={formData.totalHardBounced} />
              </div>

              {/* Bounce Rate and Graph */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ width: '230px', backgroundColor: '#fff', padding: '25px', textAlign: 'center', height: '310px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h5 style={{ color: '#aaa', fontSize: '18px', fontWeight: '400' }}>Bounce Rate</h5>
                  <div style={{ marginTop: '30px' }}>
                    <BounceRateGauge />
                  </div>
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
                        <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                          No data to display
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#bbb', fontSize: '13px', paddingLeft: '45px' }}>
                    <span>{graphData.validEntries && graphData.validEntries[0]?.date ? formatDate(graphData.validEntries[0].date) : formatDate(formData.startDate)}</span>
                    <span>Daily Timeline</span>
                    <span>{graphData.validEntries && graphData.validEntries[graphData.validEntries.length - 1]?.date ? formatDate(graphData.validEntries[graphData.validEntries.length - 1].date) : formatDate(formData.endDate)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Cards */}
              <div style={{ display: 'flex', gap: '15px', marginTop: '15px', marginBottom: '10px' }}>
                <PDFStat label="EC Delivered - Managers" value={`${formData.ecManagers}%`} height="140px" />
                <PDFStat label="EC Delivered - Directors" value={`${formData.ecDirectors}%`} height="140px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutboundPerformance;