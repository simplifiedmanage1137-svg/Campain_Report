// CampaignReport.jsx - Updated to match screenshot exactly
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const CampaignReport = () => {
    const navigate = useNavigate();
    const handleNextPage = () => {
        navigate('/campaign-report-tabs');
    };

    return (
        <div style={{ 
            height: '100vh', 
            width: '100vw', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: '#e9ecef',
            overflow: 'hidden',
            fontFamily: 'sans-serif'
        }}>
            <div className="position-relative shadow-lg d-flex align-items-center"
                 style={{ 
                     backgroundColor: '#fcfaf2',
                     width: '1000px',
                     height: '550px',
                     borderRadius: '4px'
                 }}>
                
                {/* Left White Section */}
                <div className="position-absolute top-0 start-0 h-100"
                     style={{ width: '28%', backgroundColor: '#ffffff', zIndex: 1 }}>
                </div>

                {/* Logo Section - Updated with your image */}
                <div className="position-absolute top-0 end-0 p-4 text-center" style={{ zIndex: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img 
                            src="https://b2b-oldbackup.b2bindemand.com/wp-content/uploads/2024/12/B2BinDemand-Logo-1.png.webp"
                            alt="B2BinDemand Logo"
                            style={{
                                width: '220px',
                                height: '53px',
                                objectFit: 'contain',
                                marginBottom: '5px'
                            }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                // Optional: Add fallback text if image fails to load
                                const parent = e.target.parentElement;
                                const fallback = document.createElement('div');
                                fallback.style.width = '80px';
                                fallback.style.height = '80px';
                                fallback.style.backgroundColor = '#4db69f';
                                fallback.style.borderRadius = '12px';
                                fallback.style.display = 'flex';
                                fallback.style.alignItems = 'center';
                                fallback.style.justifyContent = 'center';
                                fallback.style.marginBottom = '5px';
                                fallback.innerHTML = '<span style="color: white; font-size: 24px; font-weight: bold;">B2B</span>';
                                parent.insertBefore(fallback, e.target);
                                e.target.remove();
                            }}
                        />
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