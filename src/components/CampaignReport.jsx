// CampaignReport.jsx - Updated to match screenshot exactly
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const CampaignReport = () => {
    const handleNextPage = () => {
        window.location.href = '/CampaignReportTabs';
    };

    return (
        <div style={{ 
            height: '100vh', 
            width: '100vw', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: '#e9ecef', // Background subtle gray
            overflow: 'hidden',
            fontFamily: 'sans-serif'
        }}>
            <div className="position-relative shadow-lg d-flex align-items-center"
                 style={{ 
                     backgroundColor: '#fcfaf2', // Off-white/cream background from image
                     width: '1000px',
                     height: '550px',
                     borderRadius: '4px'
                 }}>
                
                {/* Left White Section */}
                <div className="position-absolute top-0 start-0 h-100"
                     style={{ width: '28%', backgroundColor: '#ffffff', zIndex: 1 }}>
                </div>

                {/* Logo Section */}
                <div className="position-absolute top-0 end-0 p-4 text-center" style={{ zIndex: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Simplified SVG Logo mimicking the Ventes Icon */}
                        <svg width="40" height="40" viewBox="0 0 100 100">
                           <path d="M20 20 L50 50 L80 20" stroke="#0056b3" strokeWidth="12" fill="none"/>
                           <path d="M50 50 L80 80 L20 80" stroke="#28a745" strokeWidth="12" fill="none"/>
                        </svg>
                        <div style={{ fontWeight: '700', fontSize: '1.2rem', color: '#4a4a4a', letterSpacing: '2px', marginTop: '5px' }}>
                            VENTES
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#0056b3', fontWeight: 'bold' }}>
                            B2B Technologies Inc.
                        </div>
                    </div>
                </div>

                <Container fluid className="position-relative h-100 d-flex align-items-center" style={{ zIndex: 5 }}>
                    <Row className="align-items-center w-100 g-0">
                        {/* Book Mockup Section */}
                        <Col md={5} className="d-flex justify-content-center">
                            <div style={{
                                transform: 'rotate(-5deg)',
                                width: '240px',
                                boxShadow: '15px 15px 30px rgba(0,0,0,0.15)',
                                transition: '0.3s'
                            }}>
                                {/* Top Image Part of Book */}
                                <div style={{
                                    height: '160px',
                                    background: 'url("https://images.unsplash.com/photo-1536622432285-4835285d45a3?auto=format&fit=crop&w=500") center/cover',
                                    border: '1px solid #ddd',
                                    borderBottom: 'none'
                                }}></div>
                                {/* Bottom Purple Part of Book */}
                                <div className="p-3 text-white" style={{ backgroundColor: '#2d0a5e', minHeight: '130px' }}>
                                    <h4 className="fw-bold mb-2" style={{ fontSize: '1.4rem' }}>3SI</h4>
                                    <div style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
                                        <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>Improve Safety, Reduce Risk:</span><br />
                                        How GPS is the Cannabis Industry's Key to Corporate America
                                    </div>
                                </div>
                            </div>
                        </Col>

                        {/* Text Content Section */}
                        <Col md={7} className="ps-4">
                            <h1 className="fw-bold mb-3" 
                                style={{ 
                                    color: '#495057', 
                                    fontSize: '4.5rem', 
                                    lineHeight: '1.0',
                                    letterSpacing: '-1px'
                                }}>
                                Campaign<br /> Performance<br /> Report
                            </h1>
                            
                            <h2 className="fw-normal mb-4" 
                                style={{ 
                                    fontSize: '2rem', 
                                    color: '#495057',
                                    maxWidth: '90%'
                                }}>
                                "Bridging the Gap between Cannabusinesses and Insurers"
                            </h2>

                            <p className="fst-italic text-muted opacity-50 mt-5 mb-0" style={{ fontSize: '0.9rem' }}>
                                Secrets for an impressive and informative talk
                            </p>
                        </Col>
                    </Row>
                </Container>

                {/* Footer Info */}
                <div className="position-absolute bottom-0 end-0 p-4 d-flex align-items-center gap-3"
                     style={{ color: '#495057', zIndex: 20 }}>
                    <span style={{ fontSize: '1.1rem' }}>For Team 2X | Date 13/01/2022</span>
                    
                    {/* Navigation Button */}
                    <button
                        onClick={handleNextPage}
                        className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-0 border-0 shadow"
                        style={{
                            width: '45px',
                            height: '45px',
                            background: '#0d6efd',
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CampaignReport;