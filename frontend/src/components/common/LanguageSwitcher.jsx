import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();

    const languagesList = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'am', name: 'አማርኛ', flag: '🇪🇹' }
    ];

    const currentLang = languagesList.find(l => l.code === language) || languagesList[0];

    const handleLanguageChange = (langCode) => {
        setLanguage(langCode);
    };

    return (
        <Dropdown align="end">
            <Dropdown.Toggle 
                variant="outline-secondary" 
                className="d-flex align-items-center gap-2 border-0"
                style={{ 
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontWeight: 500
                }}
            >
                <FaGlobe />
                <span>{currentLang.flag} {currentLang.name}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {languagesList.map((lang) => (
                    <Dropdown.Item
                        key={lang.code}
                        active={language === lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="d-flex align-items-center gap-2"
                        style={{
                            fontWeight: language === lang.code ? 600 : 400
                        }}
                    >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                        {language === lang.code && <span className="ms-auto text-primary">✓</span>}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default LanguageSwitcher;