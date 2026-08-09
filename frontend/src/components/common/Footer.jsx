import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
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
                            <span className="brand-icon">🤖</span> Ketari
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
                            <li><a href="/">{t('nav.home')}</a></li>
                            <li><a href="/jobs">{t('nav.jobs')}</a></li>
                            <li><a href="/about">{t('footer.about')}</a></li>
                            <li><a href="/contact">{t('footer.contact')}</a></li>
                        </ul>
                    </Col>
                    <Col md={3} className="mb-3 mb-md-0">
                        <h6 className="footer-heading">{t('footer.for_job_seekers')}</h6>
                        <ul className="footer-links">
                            <li><a href="/jobseeker/dashboard">{t('footer.dashboard')}</a></li>
                            <li><a href="/jobseeker/profile">{t('footer.profile')}</a></li>
                            <li><a href="/jobs">{t('footer.browse_jobs')}</a></li>
                            <li><a href="#">{t('footer.resume_tips')}</a></li>
                        </ul>
                    </Col>
                    <Col md={3}>
                        <h6 className="footer-heading">{t('footer.for_employers')}</h6>
                        <ul className="footer-links">
                            <li><a href="/employer/jobs">{t('footer.my_jobs')}</a></li>
                            <li><a href="/employer/post-job">{t('footer.post_job')}</a></li>
                            <li><a href="#">{t('footer.find_candidates')}</a></li>
                            <li><a href="#">{t('footer.pricing')}</a></li>
                        </ul>
                    </Col>
                </Row>
                <hr className="footer-divider" />
                <Row>
                    <Col className="text-center py-3">
                        <p className="footer-copyright">
                            &copy; {new Date().getFullYear()} Ketari. {t('footer.rights')} | Sidama Innovation and Technology Agency
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;