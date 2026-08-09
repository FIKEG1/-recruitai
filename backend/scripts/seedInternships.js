const mongoose = require('mongoose');
const Job = require('../src/models/Job');
const User = require('../src/models/User');

require('dotenv').config();

const internships = [
    {
        title: 'Software Development Intern',
        department: 'ICT',
        description: 'Join our ICT team to work on cutting-edge software projects. You will gain hands-on experience in web development, mobile applications, and database management.',
        requirements: {
            education: 'Currently pursuing BSc in Computer Science or related field',
            experience: 'No prior experience required',
            skills: ['JavaScript', 'React', 'Node.js', 'Python'],
            qualifications: ['Strong problem-solving skills', 'Good communication', 'Team player']
        },
        employmentType: 'Internship',
        isInternship: true,
        internshipType: 'Paid',
        internshipDuration: '6 Months',
        numberOfPositions: 3,
        academicRequirements: {
            fieldOfStudy: ['Computer Science', 'Software Engineering', 'Information Systems'],
            minimumGPA: 3.0,
            yearOfStudy: '3rd Year',
            university: ''
        },
        benefits: ['Monthly stipend', 'Mentorship', 'Real project experience', 'Potential full-time offer'],
        location: 'Hawassa',
        salary: { min: 3000, max: 5000, currency: 'ETB' },
        applicationDeadline: new Date('2025-12-31'),
        status: 'open'
    },
    {
        title: 'Data Science Intern',
        department: 'ICT',
        description: 'Work with our data analytics team to analyze business data and create insights. You will learn data visualization, machine learning, and statistical analysis.',
        requirements: {
            education: 'Currently pursuing BSc in Data Science, Computer Science, or Statistics',
            experience: 'Familiarity with Python and data analysis tools',
            skills: ['Python', 'SQL', 'Machine Learning', 'Data Visualization'],
            qualifications: ['Analytical mindset', 'Attention to detail', 'Strong math background']
        },
        employmentType: 'Internship',
        isInternship: true,
        internshipType: 'Stipend',
        internshipDuration: '3 Months',
        numberOfPositions: 2,
        academicRequirements: {
            fieldOfStudy: ['Data Science', 'Computer Science', 'Statistics', 'Mathematics'],
            minimumGPA: 3.2,
            yearOfStudy: '4th Year',
            university: ''
        },
        benefits: ['Transport allowance', 'Training programs', 'Certificate of completion'],
        location: 'Hawassa',
        salary: { min: 2000, max: 3500, currency: 'ETB' },
        applicationDeadline: new Date('2025-11-30'),
        status: 'open'
    },
    {
        title: 'Marketing Intern',
        department: 'Administration',
        description: 'Assist our marketing team in creating campaigns, managing social media, and analyzing market trends. Great opportunity to learn digital marketing.',
        requirements: {
            education: 'Currently pursuing degree in Marketing, Business, or Communications',
            experience: 'Social media experience is a plus',
            skills: ['Social Media Marketing', 'Content Creation', 'Basic Design', 'Communication'],
            qualifications: ['Creative mindset', 'Good writing skills', 'Social media savvy']
        },
        employmentType: 'Internship',
        isInternship: true,
        internshipType: 'Unpaid',
        internshipDuration: 'Flexible',
        numberOfPositions: 5,
        academicRequirements: {
            fieldOfStudy: ['Marketing', 'Business Administration', 'Communications', 'Journalism'],
            minimumGPA: 2.5,
            yearOfStudy: 'Any',
            university: ''
        },
        benefits: ['Flexible schedule', 'Portfolio building', 'Networking opportunities'],
        location: 'Hawassa',
        salary: { min: 0, max: 0, currency: 'ETB' },
        applicationDeadline: new Date('2026-01-15'),
        status: 'open'
    },
    {
        title: 'HR Management Intern',
        department: 'HR',
        description: 'Learn human resources management by assisting with recruitment, employee relations, and HR administration. Perfect for students interested in HR careers.',
        requirements: {
            education: 'Currently pursuing degree in Human Resources, Management, or Psychology',
            experience: 'No experience required',
            skills: ['Communication', 'Organization', 'Microsoft Office', 'Interpersonal Skills'],
            qualifications: ['People-oriented', 'Confidentiality', 'Problem-solving']
        },
        employmentType: 'Internship',
        isInternship: true,
        internshipType: 'Credit',
        internshipDuration: '12 Months',
        numberOfPositions: 2,
        academicRequirements: {
            fieldOfStudy: ['Human Resources', 'Management', 'Psychology', 'Business Administration'],
            minimumGPA: 2.8,
            yearOfStudy: 'Graduate',
            university: ''
        },
        benefits: ['Academic credit', 'HR certification training', 'Full-time consideration'],
        location: 'Hawassa',
        salary: { min: 0, max: 0, currency: 'ETB' },
        applicationDeadline: new Date('2025-10-31'),
        status: 'open'
    },
    {
        title: 'Network Administration Intern',
        department: 'ICT',
        description: 'Support our IT infrastructure by assisting with network configuration, troubleshooting, and security. Gain practical experience in enterprise networking.',
        requirements: {
            education: 'Currently pursuing degree in Computer Science, Information Technology, or Network Engineering',
            experience: 'Basic networking knowledge',
            skills: ['Networking', 'Linux', 'Windows Server', 'Troubleshooting'],
            qualifications: ['Technical aptitude', 'Detail-oriented', 'Problem solver']
        },
        employmentType: 'Internship',
        isInternship: true,
        internshipType: 'Paid',
        internshipDuration: '9 Months',
        numberOfPositions: 2,
        academicRequirements: {
            fieldOfStudy: ['Computer Science', 'Information Technology', 'Network Engineering'],
            minimumGPA: 3.0,
            yearOfStudy: '4th Year',
            university: ''
        },
        benefits: ['Competitive stipend', 'Network equipment training', 'Industry certifications'],
        location: 'Hawassa',
        salary: { min: 4000, max: 6000, currency: 'ETB' },
        applicationDeadline: new Date('2025-12-15'),
        status: 'open'
    }
];

async function seedInternships() {
    try {
        console.log('Connecting to MongoDB...');
        // Use the same connection string as the backend
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/recruitment-platform';
        console.log('Using MongoDB URI:', mongoUri);
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
        console.log('Database name:', mongoose.connection.name);

        // Find an employer user to assign as the employer
        const employer = await User.findOne({ role: 'employer' });
        if (!employer) {
            console.log('No employer found. Creating a default employer...');
            const newEmployer = await User.create({
                name: 'SITA HR',
                email: 'hr@sita.gov.et',
                password: 'password123',
                role: 'employer',
                company: 'Sidama Innovation and Technology Agency',
                phone: '+251911000000'
            });
            console.log('Created employer:', newEmployer.email);
        }

        const employerUser = employer || await User.findOne({ role: 'employer' });
        console.log('Using employer:', employerUser.email);

        // Clear existing internships
        const existingCount = await Job.countDocuments({ isInternship: true });
        console.log(`Found ${existingCount} existing internships`);
        
        if (existingCount > 0) {
            await Job.deleteMany({ isInternship: true });
            console.log('Cleared existing internships');
        }

        // Create internships
        console.log('Creating internships...');
        for (const internship of internships) {
            internship.employer = employerUser._id;
            const created = await Job.create(internship);
            console.log(`✓ Created: ${created.title}`);
        }

        const totalCount = await Job.countDocuments({ isInternship: true });
        console.log(`\n✅ Successfully seeded ${totalCount} internships!`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding internships:', error);
        process.exit(1);
    }
}

seedInternships();
