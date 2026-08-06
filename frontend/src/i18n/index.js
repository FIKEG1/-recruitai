// IMPORT MUST BE AT THE TOP
import am from './am.json';

// Available languages
export const languages = {
    am: { 
        name: 'አማርኛ', 
        nativeName: 'አማርኛ', 
        translation: am 
    },
    en: { 
        name: 'English', 
        nativeName: 'English', 
        translation: {} 
    }
};

// Current language
let currentLanguage = 'en';

// English translations
const enTranslations = {
    "app": {
        "title": "RecruitAI - Job Platform",
        "welcome": "Welcome",
        "tagline": "Intelligent Job Matching and Recruitment Automation Platform"
    },
    "nav": {
        "home": "Home",
        "jobs": "Jobs",
        "internships": "Internships",
        "login": "Login",
        "register": "Register",
        "logout": "Logout",
        "dashboard": "Dashboard",
        "profile": "Profile",
        "post_job": "Post Job",
        "manage_users": "Manage Users"
    },
    "home": {
        "hero_title": "Find the Perfect Talent or Job",
        "hero_subtitle": "Intelligent job matching and recruitment automation platform for the Sidama Innovation and Technology Agency.",
        "get_started": "Get Started",
        "browse_jobs": "Browse Jobs",
        "job_openings": "Job Openings",
        "candidates": "Candidates",
        "placements": "Successful Placements",
        "companies": "Companies",
        "features_title": "Key Features",
        "features_subtitle": "Powered by Artificial Intelligence for smarter recruitment",
        "smart_search": "Smart Job Search",
        "smart_search_desc": "Find the perfect job with AI-powered recommendations",
        "resume_parsing": "Resume Parsing",
        "resume_parsing_desc": "Automatically extract skills and experience from resumes",
        "ai_matching": "AI Matching",
        "ai_matching_desc": "Get matched with jobs that fit your profile",
        "how_it_works": "How It Works",
        "step1_title": "Create Account",
        "step1_desc": "Sign up as a job seeker or employer",
        "step2_title": "Build Profile",
        "step2_desc": "Upload your resume and complete your profile",
        "step3_title": "Get Matched",
        "step3_desc": "AI finds the best jobs or candidates for you",
        "step4_title": "Apply & Hire",
        "step4_desc": "Apply with one click or review top candidates",
        "hero_badge": "AI-Powered Recruitment",
        "hero_image_title": "AI-Powered Matching",
        "hero_image_desc": "Find the best matches for your profile using intelligent algorithms",
        "analytics_title": "Analytics",
        "analytics_desc": "Track application status and recruitment metrics",
        "default_employment_type": "Full-Time",
        "default_company": "Sidama Innovation and Technology Agency",
        "default_location": "Hawassa",
        "default_department": "ICT",
        "cta_title": "Ready to Transform Your Recruitment?",
        "cta_text": "Join RecruitAI today and experience the power of AI-driven recruitment."
    },
    "auth": {
        "login_title": "Welcome Back",
        "login_subtitle": "Sign in to your RecruitAI account",
        "register_title": "Create Account",
        "register_subtitle": "Join RecruitAI and find your perfect job",
        "email": "Email Address",
        "email_placeholder": "Enter your email",
        "password": "Password",
        "password_placeholder": "Enter your password",
        "confirm_password": "Confirm Password",
        "name": "Full Name",
        "name_placeholder": "Enter your full name",
        "phone": "Phone Number",
        "location": "Location",
        "role": "I am a",
        "job_seeker": "Job Seeker",
        "employer": "Employer",
        "admin": "Admin",
        "remember_me": "Remember me",
        "forgot_password": "Forgot Password?",
        "sign_in": "Sign In",
        "sign_up": "Sign Up",
        "no_account": "Don't have an account?",
        "has_account": "Already have an account?",
        "sign_up_link": "Sign Up",
        "sign_in_link": "Sign In",
        "terms": "By continuing, you agree to our Terms of Service and Privacy Policy",
        "login_error": "Login failed. Please try again."
    },
    "jobs": {
        "title": "Browse Jobs",
        "search": "Search by job title, department, or keyword...",
        "location": "Location",
        "filters": "Filters",
        "active": "Active",
        "reset": "Reset Filters",
        "employment_type": "Employment Type",
        "all_types": "All Types",
        "full_time": "Full-Time",
        "part_time": "Part-Time",
        "contract": "Contract",
        "internship": "Internship",
        "min_salary": "Min Salary",
        "max_salary": "Max Salary",
        "no_jobs": "No jobs found",
        "no_jobs_desc": "Try adjusting your search filters",
        "deadline": "Deadline",
        "apply_now": "Apply Now",
        "found": "Found",
        "jobs_found": "jobs"
    },
    "apply": {
        "title": "Apply for {{title}}",
        "back": "Back",
        "department": "Department",
        "employment_type": "Employment Type",
        "location": "Location",
        "deadline": "Deadline",
        "select_resume": "Select Resume",
        "upload_resume": "Upload Resume",
        "supported_formats": "Supported: PDF, DOCX (Max 5MB)",
        "no_resumes": "No resumes uploaded yet",
        "upload_above": "Upload a resume using the button above",
        "cover_letter": "Cover Letter",
        "cover_letter_placeholder": "Write a brief cover letter explaining why you're a good fit for this position...",
        "submit": "Submit Application",
        "cancel": "Cancel",
        "submitting": "Submitting...",
        "submitted": "Application Submitted!",
        "submitted_desc": "Your application for <strong>{{title}}</strong> has been submitted successfully.",
        "status_notification": "You will be notified about the status of your application.",
        "go_dashboard": "Go to Dashboard",
        "ai_match": "AI Match Score",
        "ai_match_desc": "How well your profile matches this job",
        "excellent_match": "Excellent Match!",
        "good_match": "Good Match",
        "fair_match": "Fair Match",
        "low_match": "Low Match",
        "skills": "Skills",
        "education": "Education",
        "experience": "Experience",
        "upload_resume_required": "Please upload a resume before applying"
    },
    "profile": {
        "title": "My Profile",
        "personal_info": "Personal Information",
        "full_name": "Full Name",
        "email": "Email",
        "phone": "Phone Number",
        "bio": "About You",
        "bio_placeholder": "Tell us about yourself...",
        "skills": "Skills",
        "skills_placeholder": "Enter a skill (e.g., Python, Java)",
        "add_skill": "Add Skill",
        "no_skills": "No skills added yet",
        "education": "Education",
        "institution": "Institution",
        "degree": "Degree",
        "field_of_study": "Field of Study",
        "graduation_year": "Graduation Year",
        "add_education": "Add Education",
        "no_education": "No education added yet",
        "experience": "Experience",
        "company": "Company",
        "position": "Position",
        "start_date": "Start Date",
        "end_date": "End Date",
        "description": "Description",
        "add_experience": "Add Experience",
        "no_experience": "No work experience added yet",
        "save_changes": "Save Changes",
        "resume_management": "Resume Management",
        "supported_formats": "Supported: PDF, DOCX (Max 5MB)",
        "default": "Default",
        "set_default": "Set as default",
        "delete": "Delete",
        "uploading": "Uploading...",
        "no_resumes": "No resumes uploaded yet"
    },
    "dashboard": {
        "welcome": "Welcome back, {{name}}!",
        "welcome_desc": "Here's an overview of your job applications and recruitment status",
        "total_applications": "Total Applications",
        "pending": "Pending",
        "shortlisted": "Shortlisted",
        "interviewed": "Interviewed",
        "offered": "Offered",
        "rejected": "Rejected",
        "opportunities": "Looking for new opportunities?",
        "opportunities_desc": "Browse available job openings and apply now",
        "browse_jobs": "Browse Jobs →",
        "recent_applications": "Recent Applications",
        "total": "total",
        "no_applications": "No applications yet",
        "no_applications_desc": "Start applying to jobs to see them here",
        "complete_profile": "Complete Your Profile",
        "complete_profile_desc": "Add more details to get better job recommendations",
        "update_profile": "Update Profile"
    },
    "internships": {
        "title": "Internship Programs",
        "subtitle": "Find the perfect internship to kickstart your career",
        "loading": "Loading internships...",
        "search_placeholder": "Search by title, department, or keyword...",
        "location_placeholder": "Location",
        "filters": "Filters",
        "active": "Active",
        "internship_type": "Internship Type",
        "all_types": "All Types",
        "paid": "Paid",
        "unpaid": "Unpaid",
        "stipend": "Stipend",
        "credit": "Credit",
        "duration": "Duration",
        "all_durations": "All Durations",
        "months_3": "3 Months",
        "months_6": "6 Months",
        "months_9": "9 Months",
        "months_12": "12 Months",
        "flexible": "Flexible",
        "field_of_study": "Field of Study",
        "field_of_study_placeholder": "e.g., Computer Science",
        "min_gpa": "Min GPA",
        "min_gpa_placeholder": "e.g., 3.0",
        "reset_filters": "Reset Filters",
        "found_count": "Found {{count}} internship{{plural}}",
        "no_results": "No internships found",
        "no_results_desc": "Try adjusting your search filters",
        "clear_filters": "Clear Filters",
        "year_any": "Any Year",
        "deadline": "Deadline:",
        "apply_now": "Apply Now",
        "benefits": "Benefits:",
        "positions": "positions"
    },
    "common": {
        "loading": "Loading...",
        "error": "An error occurred",
        "success": "Success",
        "cancel": "Cancel",
        "save": "Save",
        "delete": "Delete",
        "edit": "Edit",
        "view": "View",
        "search": "Search",
        "filter": "Filter",
        "reset": "Reset",
        "apply": "Apply",
        "confirm": "Confirm",
        "back": "Back",
        "next": "Next",
        "previous": "Previous",
        "page": "Page",
        "of": "of",
        "status": "Status"
    },
    "footer": {
        "description": "Intelligent Job Matching and Recruitment Automation Platform for the Sidama Innovation and Technology Agency.",
        "quick_links": "Quick Links",
        "about": "About",
        "contact": "Contact",
        "for_job_seekers": "For Job Seekers",
        "dashboard": "Dashboard",
        "profile": "Profile",
        "browse_jobs": "Browse Jobs",
        "resume_tips": "Resume Tips",
        "for_employers": "For Employers",
        "my_jobs": "My Jobs",
        "post_job": "Post a Job",
        "find_candidates": "Find Candidates",
        "pricing": "Pricing",
        "rights": "All rights reserved"
    }
};

// Add English translations to languages
languages.en.translation = enTranslations;

// Get translation
export const t = (key, params = {}) => {
    const translations = languages[currentLanguage]?.translation;
    if (!translations) return key;

    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
        if (value && value[k] !== undefined) {
            value = value[k];
        } else {
            return key;
        }
    }

    if (typeof value === 'string' && params) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
            return params[paramKey] || match;
        });
    }

    return value || key;
};

// Set language
export const setLanguage = (lang) => {
    if (languages[lang]) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        return true;
    }
    return false;
};

// Get current language
export const getLanguage = () => {
    return currentLanguage;
};

// Initialize language from localStorage
export const initLanguage = () => {
    const saved = localStorage.getItem('language');
    if (saved && languages[saved]) {
        currentLanguage = saved;
    }
    return currentLanguage;
};

// Load translations for a language
export const loadTranslations = async (lang) => {
    if (languages[lang] && Object.keys(languages[lang].translation || {}).length > 0) {
        return languages[lang].translation;
    }

    if (lang === 'en') {
        return languages.en.translation;
    }

    try {
        const response = await fetch(`/i18n/${lang}.json`);
        const data = await response.json();
        languages[lang].translation = data;
        return data;
    } catch (error) {
        console.error(`Failed to load translations for ${lang}:`, error);
        return null;
    }
};