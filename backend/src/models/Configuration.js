const mongoose = require('mongoose');

const ConfigurationSchema = new mongoose.Schema({
    // Organization Info
    organization: {
        name: { type: String, default: '' },
        address: { type: String, default: '' },
        phone: { type: String, default: '' },
        email: { type: String, default: '' },
        website: { type: String, default: '' },
        logo: { type: String, default: '' },
        taxId: { type: String, default: '' },
        registrationNumber: { type: String, default: '' }
    },
    
    // Organization Structure
    departments: [{
        name: { type: String, required: true },
        code: { type: String, unique: true },
        description: { type: String },
        parentDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Configuration' },
        manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Positions
    positions: [{
        title: { type: String, required: true },
        code: { type: String, unique: true },
        department: { type: mongoose.Schema.Types.ObjectId, ref: 'Configuration' },
        rank: { type: String },
        description: { type: String },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Position Ranks
    positionRanks: [{
        name: { type: String, required: true },
        level: { type: Number },
        minSalary: { type: Number },
        maxSalary: { type: Number },
        description: { type: String }
    }],
    
    // Job Titles
    jobTitles: [{
        name: { type: String, required: true },
        code: { type: String, unique: true },
        description: { type: String },
        department: { type: mongoose.Schema.Types.ObjectId, ref: 'Configuration' },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Skills
    skills: [{
        name: { type: String, required: true },
        category: { type: String, enum: ['technical', 'soft', 'language', 'other'], default: 'technical' },
        description: { type: String },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Languages
    languages: [{
        name: { type: String, required: true },
        code: { type: String },
        proficiencyLevels: [{ type: String, enum: ['Basic', 'Intermediate', 'Fluent', 'Native'] }],
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Licenses
    licenses: [{
        name: { type: String, required: true },
        type: { type: String, enum: ['professional', 'driver', 'security', 'other'] },
        issuingAuthority: { type: String },
        validityPeriod: { type: Number },
        description: { type: String },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Religion Types
    religions: [{
        name: { type: String, required: true },
        description: { type: String },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Employment Status
    employmentStatus: [{
        name: { type: String, required: true },
        type: { type: String, enum: ['active', 'inactive', 'terminated', 'on_leave'] },
        description: { type: String },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Education Levels
    educationLevels: [{
        name: { type: String, required: true },
        level: { type: Number },
        description: { type: String },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Marital Status
    maritalStatus: [{
        name: { type: String, required: true },
        description: { type: String },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Training Types
    trainingTypes: [{
        name: { type: String, required: true },
        category: { type: String, enum: ['technical', 'soft_skills', 'leadership', 'compliance'] },
        description: { type: String },
        duration: { type: Number },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Leave Types
    leaveTypes: [{
        name: { type: String, required: true },
        code: { type: String, unique: true },
        daysPerYear: { type: Number },
        paid: { type: Boolean, default: true },
        carryOver: { type: Boolean, default: false },
        maxCarryOver: { type: Number },
        description: { type: String },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Termination Reasons
    terminationReasons: [{
        name: { type: String, required: true },
        category: { type: String, enum: ['voluntary', 'involuntary', 'mutual'] },
        description: { type: String },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Salary Deduction Types
    deductionTypes: [{
        name: { type: String, required: true },
        type: { type: String, enum: ['fixed', 'percentage'] },
        amount: { type: Number },
        description: { type: String },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Nations
    nations: [{
        name: { type: String, required: true },
        code: { type: String, unique: true },
        nationality: { type: String },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Titles (Mr, Ms, Dr, etc.)
    titles: [{
        name: { type: String, required: true },
        abbreviation: { type: String },
        gender: { type: String, enum: ['male', 'female', 'neutral'] },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Blood Types
    bloodTypes: [{
        name: { type: String, required: true },
        rhesusFactor: { type: String, enum: ['positive', 'negative'] },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    
    // Organization Partners
    partners: [{
        name: { type: String, required: true },
        type: { type: String, enum: ['client', 'vendor', 'government', 'ngo', 'other'] },
        contactPerson: { type: String },
        phone: { type: String },
        email: { type: String },
        address: { type: String },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Configuration', ConfigurationSchema);