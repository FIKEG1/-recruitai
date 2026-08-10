import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaLinkedin, FaTwitter, FaFacebook, FaYoutube } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import './Footer.css';

const Footer = () => {
    const { t } = useLanguage();
    return (
        <footer className="footer">
            <Container>
                <Row className="py-4">
                    <Col md={4} className="mb-3 mb-md-0">
                        <h5 className="footer-brand">
                            <span className="brand-icon">🤖</span> KETARI
                        </h5>
                        <p className="footer-text">
                            {t('footer.description')}
                        </p>
                        <div className="social-icons">
                            <a href="#" className="social-link"><FaLinkedin /></a>
                            <a href="#" className="social-link"><FaTwitter /></a>
                            <a href="#" className="social-link"><FaFacebook /></a>
                            <a href="#" className="social-link"><FaYoutube /></a>
                        </div>
                    </Col>
                    <Col md={2} className="mb-3 mb-md-0">
                        <h6 className="footer-heading">{t('footer.quick_links')}</h6>
                        <ul className="footer-links">
                            <li><Link to="/">{t('nav.home')}</Link></li>
                            <li><Link to="/jobs">{t('nav.jobs')}</Link></li>
                            <li><Link to="/about">{t('footer.about')}</Link></li>
                            <li><Link to="/contact">{t('footer.contact')}</Link></li>
                        </ul>
                    </Col>
                    <Col md={3} className="mb-3 mb-md-0">
                        <h6 className="footer-heading">{t('footer.for_job_seekers')}</h6>
                        <ul className="footer-links">
                            <li><Link to="/jobseeker/dashboard">{t('footer.dashboard')}</Link></li>
                            <li><Link to="/jobseeker/profile">{t('footer.profile')}</Link></li>
                            <li><Link to="/jobs">{t('footer.browse_jobs')}</Link></li>
                        </ul>
                    </Col>
                    <Col md={3}>
                        <h6 className="footer-heading">{t('footer.for_employers')}</h6>
                        <ul className="footer-links">
                            <li><Link to="/employer/jobs">{t('footer.my_jobs')}</Link></li>
                            <li><Link to="/employer/post-job">{t('footer.post_job')}</Link></li>
                            <li><Link to="/candidates">{t('footer.find_candidates')}</Link></li>
                        </ul>
                    </Col>
                </Row>
                <hr className="footer-divider" />
                <Row>
                    <Col className="text-center py-3">
                        <p className="footer-copyright">
                            &copy; {new Date().getFullYear()} KETARI. {t('footer.rights')} | Sidama Innovation and Technology Agency
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;