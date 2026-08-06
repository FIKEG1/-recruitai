// Calculate match score between job and candidate
exports.calculateMatchScore = async (job, candidateData) => {
    let score = 0;
    let totalWeight = 0;

    // 1. Skills matching (40% weight)
    const skillWeight = 0.4;
    totalWeight += skillWeight;
    
    const jobSkills = job.requirements?.skills || [];
    const candidateSkills = candidateData?.skills || [];
    
    if (jobSkills.length > 0 && candidateSkills.length > 0) {
        const matchingSkills = jobSkills.filter(skill => 
            candidateSkills.some(cSkill => 
                cSkill.toLowerCase().includes(skill.toLowerCase()) || 
                skill.toLowerCase().includes(cSkill.toLowerCase())
            )
        );
        const skillScore = (matchingSkills.length / jobSkills.length) * 100;
        score += skillScore * skillWeight;
    } else if (jobSkills.length === 0) {
        score += 100 * skillWeight;
    }

    // 2. Education matching (25% weight)
    const educationWeight = 0.25;
    totalWeight += educationWeight;
    
    const jobEducation = job.requirements?.education || '';
    const candidateEducation = candidateData?.education || [];
    
    if (jobEducation && candidateEducation.length > 0) {
        let educationScore = 0;
        const jobEducationLower = jobEducation.toLowerCase();
        for (const edu of candidateEducation) {
            const candidateEduStr = `${edu.degree || ''} ${edu.field || ''} ${edu.institution || ''}`.toLowerCase();
            if (candidateEduStr.includes(jobEducationLower) || jobEducationLower.includes(candidateEduStr)) {
                educationScore = 100;
                break;
            }
        }
        score += educationScore * educationWeight;
    } else {
        score += 100 * educationWeight;
    }

    // 3. Experience matching (25% weight)
    const experienceWeight = 0.25;
    totalWeight += experienceWeight;
    
    const jobExperience = job.requirements?.experience || '';
    const candidateExperience = candidateData?.workExperience || [];
    
    if (jobExperience && candidateExperience.length > 0) {
        let experienceScore = 50;
        const yearsMatch = jobExperience.match(/(\d+)/);
        if (yearsMatch) {
            const requiredYears = parseInt(yearsMatch[1]);
            let totalExperience = candidateExperience.length * 1.5;
            experienceScore = Math.min((totalExperience / requiredYears) * 100, 100);
        }
        score += experienceScore * experienceWeight;
    } else if (!jobExperience) {
        score += 100 * experienceWeight;
    }

    // 4. Location matching (10% weight)
    const locationWeight = 0.1;
    totalWeight += locationWeight;
    
    const jobLocation = job.location || '';
    const candidateLocation = candidateData?.location || '';
    
    if (jobLocation && candidateLocation) {
        const locationScore = jobLocation.toLowerCase().includes(candidateLocation.toLowerCase()) ||
            candidateLocation.toLowerCase().includes(jobLocation.toLowerCase()) ? 100 : 50;
        score += locationScore * locationWeight;
    } else {
        score += 50 * locationWeight;
    }

    return Math.round(score);
};

// Match candidates for a job
exports.matchCandidates = async (job, candidates, existingApplicantIds) => {
    const matchedCandidates = [];
    
    for (const candidate of candidates) {
        if (existingApplicantIds.includes(candidate._id.toString())) {
            continue;
        }

        const score = await exports.calculateMatchScore(job, candidate.profile);
        
        matchedCandidates.push({
            candidate: {
                id: candidate._id,
                name: candidate.name,
                email: candidate.email,
                profile: candidate.profile
            },
            matchScore: score,
            skills: candidate.profile?.skills || [],
            education: candidate.profile?.education || [],
            experience: candidate.profile?.workExperience || []
        });
    }

    return matchedCandidates.sort((a, b) => b.matchScore - a.matchScore);
};