from flask import Flask, jsonify, request
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'AI Service is running'})

@app.route('/api/parse-resume', methods=['POST'])
def parse_resume():
    data = request.json
    text = data.get('text', '')
    
    result = {
        'success': True,
        'data': {
            'name': text.split('\n')[0] if text else '',
            'email': extract_email(text),
            'skills': extract_skills(text),
            'education': extract_education(text),
            'work_experience': extract_experience(text)
        }
    }
    return jsonify(result)

def extract_email(text):
    pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(pattern, text)
    return match.group(0) if match else ''

def extract_skills(text):
    common_skills = ['python', 'java', 'javascript', 'react', 'node.js', 'mongodb', 
                     'sql', 'html', 'css', 'bootstrap', 'django', 'flask',
                     'machine learning', 'ai', 'data science', 'cloud', 'aws',
                     'c++', 'c#', 'ruby', 'php', 'docker', 'kubernetes', 'git']
    found_skills = []
    text_lower = text.lower()
    for skill in common_skills:
        if skill in text_lower:
            found_skills.append(skill)
    return found_skills

def extract_education(text):
    education = []
    lines = text.split('\n')
    for line in lines:
        line_lower = line.lower()
        if any(word in line_lower for word in ['university', 'college', 'institute', 
                                                 'bachelor', 'master', 'phd', 'diploma',
                                                 'b.sc', 'm.sc', 'bcs', 'mcs']):
            education.append({'institution': line.strip()})
    return education

def extract_experience(text):
    experience = []
    lines = text.split('\n')
    for line in lines:
        line_lower = line.lower()
        if any(word in line_lower for word in ['experience', 'developer', 'engineer', 
                                                 'manager', 'analyst', 'worked', 'position']):
            if len(line.strip()) > 10:
                experience.append({'company': line.strip()})
    return experience

@app.route('/api/match-score', methods=['POST'])
def calculate_match_score():
    data = request.json
    job = data.get('job', {})
    candidate = data.get('candidate', {})
    
    # Simple match score calculation
    job_skills = job.get('requirements', {}).get('skills', [])
    candidate_skills = candidate.get('skills', [])
    
    if job_skills and candidate_skills:
        matching = len(set([s.lower() for s in job_skills]) & set([s.lower() for s in candidate_skills]))
        score = int((matching / len(job_skills)) * 100) if job_skills else 0
    else:
        score = 50
    
    return jsonify({
        'success': True, 
        'score': min(score, 100),
        'details': {
            'skills_match': score,
            'message': 'Match score calculated'
        }
    })

@app.route('/api/recommend-jobs', methods=['POST'])
def recommend_jobs():
    data = request.json
    candidate = data.get('candidate', {})
    jobs = data.get('jobs', [])
    
    recommendations = []
    for job in jobs:
        job_skills = job.get('requirements', {}).get('skills', [])
        candidate_skills = candidate.get('skills', [])
        
        if job_skills and candidate_skills:
            matching = len(set([s.lower() for s in job_skills]) & set([s.lower() for s in candidate_skills]))
            score = int((matching / len(job_skills)) * 100) if job_skills else 0
        else:
            score = 50
        
        recommendations.append({
            'job': job,
            'matchScore': min(score, 100)
        })
    
    recommendations.sort(key=lambda x: x['matchScore'], reverse=True)
    
    return jsonify({
        'success': True,
        'recommendations': recommendations[:10]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
