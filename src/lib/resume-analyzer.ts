import { SequentialThinking, createResumeAnalysisSteps, ThinkingStep, SequentialThinkingContext } from './sequential-thinking';

// AI tag classification constants
export const AI_TAGS = {
  developer: 'developer',
  researcher: 'researcher', 
  founder: 'founder',
  teacher: 'teacher',
  designer: 'designer',
  creator: 'creator',
  practitioner: 'practitioner'
} as const;

export type AITag = typeof AI_TAGS[keyof typeof AI_TAGS];

// AI tag descriptions for different languages
export const AI_TAG_DESCRIPTIONS = {
  zh: {
    developer: '软件开发、编程、技术项目',
    researcher: '科学研究、学术发表',
    founder: '公司或项目创始人',
    teacher: '教学、讲座',
    designer: 'UX/UI设计、产品设计',
    creator: '内容创作、艺术应用',
    practitioner: '行业应用实践者'
  },
  en: {
    developer: 'Software Development, Programming, Technical Projects',
    researcher: 'Scientific Research, Academic Publications',
    founder: 'Company or Project Founder',
    teacher: 'Teaching, Lectures',
    designer: 'UX/UI Design, Product Design',
    creator: 'Content Creation, AI Art Applications',
    practitioner: 'Industry Application Practitioner'
  }
};

// Professional profile interface
export interface ProfessionalProfile {
  name: string;
  title_roles: string[];
  affiliation: string;
  email?: string;
  phone?: string;
  github?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  photo_url?: string;
  description: string;
  ai_tag: AITag;
  latest_education: string;
  years_of_experience: number;
  industry: string;
  research_interests: string[];
}

// Enhanced resume data structures with language support
export interface PersonalInfo {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface Education {
  institution: string;
  degree: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string[];
  achievements: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  achievements: string[];
}

export interface Skill {
  category: string;
  items: string[];
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface ParsedResume {
  personalInfo: PersonalInfo;
  education: Education[];
  workExperience: WorkExperience[];
  projects: Project[];
  skills: Skill[];
  certifications: string[];
  languages: string[];
  language: 'en' | 'zh' | 'auto'; // Detected language
}

// Enhanced analysis result structures
export interface SkillAssessment {
  technicalSkills: {
    strengths: string[];
  };
  softSkills: {
    identified: string[];
  };
}

export interface ExperienceAssessment {
  relevantIndustries: string[];
  careerProgression: 'ascending' | 'lateral' | 'stable';
  keyAchievements: string[];
}

export interface EducationAssessment {
  institutions: string[];
  degrees: string[];
  majors: string[];
}

export interface OverallAssessment {
  highlights: string[];
}

export interface ResumeAnalysisResult {
  professionalProfile: ProfessionalProfile;
  skillAssessment: SkillAssessment;
  experienceAssessment: ExperienceAssessment;
  educationAssessment: EducationAssessment;
  overallAssessment: OverallAssessment;
  language: 'en' | 'zh'; // Language of the analysis results
}

export class ResumeAnalyzer {
  private thinking: SequentialThinking;
  private targetJob?: string;
  private analysisResult?: ResumeAnalysisResult;
  private resumeLanguage: 'en' | 'zh' = 'en';

  constructor(
    targetJob?: string,
    onStepUpdate?: (step: ThinkingStep, context: SequentialThinkingContext) => void
  ) {
    this.targetJob = targetJob;
    this.thinking = new SequentialThinking(createResumeAnalysisSteps(), onStepUpdate);
  }

  // Detect language of the resume text
  private detectLanguage(text: string): 'en' | 'zh' {
    // Simple language detection based on character patterns
    const chineseChars = text.match(/[\u4e00-\u9fff]/g);
    const englishWords = text.match(/[a-zA-Z]+/g);
    
    const chineseRatio = chineseChars ? chineseChars.length / text.length : 0;
    const englishRatio = englishWords ? englishWords.join('').length / text.length : 0;
    
    console.log(`Language detection - Chinese ratio: ${chineseRatio}, English ratio: ${englishRatio}`);
    
    // If Chinese characters make up more than 10% of the text, consider it Chinese
    return chineseRatio > 0.1 ? 'zh' : 'en';
  }

  // Extract JSON from potentially malformed LLM response
  private extractJsonFromResponse(content: string): unknown {
    try {
      // Try to find JSON within markdown code blocks
      const markdownMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (markdownMatch) {
        const jsonStr = markdownMatch[1];
        console.log('Found JSON within markdown block');
        return JSON.parse(jsonStr);
      }

      // Fallback to finding any JSON object
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        console.log('Found raw JSON in response');
        return JSON.parse(jsonStr);
      }

      console.warn('No JSON found in LLM response');
      return null;
    } catch (error) {
      console.error('Failed to parse JSON from LLM response:', error);
      
      // Try to fix common JSON errors
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let fixedJson = jsonMatch[0];
          // Remove trailing commas
          fixedJson = fixedJson.replace(/,\s*([}\]])/g, '$1');
          // Remove comments
          fixedJson = fixedJson.replace(/\/\/.*$/gm, '');
          
          return JSON.parse(fixedJson);
        }
      } catch (fixError) {
        console.error('Failed to fix and parse JSON:', fixError);
      }
      
      return null;
    }
  }

  public async analyzeResume(resumeText: string): Promise<ResumeAnalysisResult> {
    // Detect language first
    this.resumeLanguage = this.detectLanguage(resumeText);
    console.log('Detected resume language:', this.resumeLanguage);

    // Set analysis context
    this.thinking.updateMetadata('resumeText', resumeText);
    this.thinking.updateMetadata('targetJob', this.targetJob);
    this.thinking.updateMetadata('language', this.resumeLanguage);

    // Define step executors
    const executors = {
      'step-0': this.parseResumeContent.bind(this),
      'step-1': this.generateProfessionalProfile.bind(this),
      'step-2': this.assessSkills.bind(this),
      'step-3': this.assessExperience.bind(this),
      'step-4': this.assessEducation.bind(this),
      'step-5': this.calculateOverallScore.bind(this),
    };

    // Execute all steps
    await this.thinking.executeAll(executors);

    // Build final result
    this.analysisResult = {
      professionalProfile: this.thinking.getStepResult('step-1') as ProfessionalProfile,
      skillAssessment: this.thinking.getStepResult('step-2') as SkillAssessment,
      experienceAssessment: this.thinking.getStepResult('step-3') as ExperienceAssessment,
      educationAssessment: this.thinking.getStepResult('step-4') as EducationAssessment,
      overallAssessment: this.thinking.getStepResult('step-5') as OverallAssessment,
      language: this.resumeLanguage,
    };

    return this.analysisResult;
  }

  private async parseResumeContent(): Promise<ParsedResume> {
    const resumeText = this.thinking.getMetadata('resumeText') as string;
    const language = this.thinking.getMetadata('language') as string;
    
    console.log('Parsing resume content with language:', language);
    console.log('Resume text length:', resumeText.length);
    
    // Simulate AI-powered parsing with language-aware prompts
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Real text parsing - extract information from actual resume text
    const personalInfo = this.extractPersonalInfo(resumeText);
    const education = this.extractEducation(resumeText);
    const workExperience = this.extractWorkExperience(resumeText);
    const projects = this.extractProjects(resumeText);
    const skills = this.extractSkills(resumeText);
    const certifications = this.extractCertifications(resumeText);
    const languages = this.extractLanguages(resumeText);
    
    const parsedResume: ParsedResume = {
      personalInfo,
      education,
      workExperience,
      projects,
      skills,
      certifications,
      languages,
      language: language as 'en' | 'zh'
    };
    
    console.log('Parsed resume:', parsedResume);
    return parsedResume;
  }

  // Extract personal information from resume text
  private extractPersonalInfo(text: string): PersonalInfo {
    const personalInfo: PersonalInfo = { name: '' };
    
    // Extract email
    const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch) personalInfo.email = emailMatch[0];
    
    // Extract phone number (improved Chinese phone pattern)
    const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}|(?:\+86[-.\s]?)?1[3-9]\d{9}|\d{11}/);
    if (phoneMatch) personalInfo.phone = phoneMatch[0];
    
    // Extract name (improved for Chinese resumes)
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      // Look for Chinese names or structured name patterns
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim();
        
        // Skip lines that contain common headers or keywords
        if (line && 
            !line.toLowerCase().includes('resume') && 
            !line.toLowerCase().includes('cv') &&
            !line.toLowerCase().includes('curriculum') &&
            !line.toLowerCase().includes('简历') &&
            !line.includes('@') &&
            !line.match(/^\d/) &&
            !line.includes('年') &&
            !line.includes('经验') &&
            line.length > 1 && 
            line.length < 20) {
          
          // Check if it looks like a Chinese name (2-4 characters, mostly Chinese)
          const chineseChars = line.match(/[\u4e00-\u9fff]/g);
          if (chineseChars && chineseChars.length >= 2 && chineseChars.length <= 4 && 
              chineseChars.length / line.length > 0.5) {
            personalInfo.name = line;
            break;
          }
          
          // Check if it looks like an English name
          if (/^[A-Za-z\s]{2,20}$/.test(line) && line.split(' ').length <= 3) {
            personalInfo.name = line;
            break;
          }
          
          // Look for name after # header
          if (line.startsWith('#') && line.length < 20) {
            const nameCandidate = line.replace(/^#+\s*/, '').trim();
            if (nameCandidate.length >= 2 && nameCandidate.length <= 10) {
              personalInfo.name = nameCandidate;
              break;
            }
          }
        }
      }
    }
    
    // Extract LinkedIn
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
    if (linkedinMatch) personalInfo.linkedin = `https://${linkedinMatch[0]}`;
    
    // Extract GitHub
    const githubMatch = text.match(/github\.com\/[\w-]+/i);
    if (githubMatch) personalInfo.github = `https://${githubMatch[0]}`;
    
    // Extract website URLs (improved pattern)
    const websiteMatches = text.match(/https?:\/\/(?!(?:github|linkedin)\.com)[\w\.-]+\.[\w\.-]+(?:\/[\w\.-]*)?/gi);
    if (websiteMatches && websiteMatches.length > 0) {
      // Take the first non-GitHub, non-LinkedIn URL
      const validWebsite = websiteMatches.find(url => 
        !url.includes('github.com') && 
        !url.includes('linkedin.com') &&
        !url.includes('twitter.com') &&
        !url.includes('@')
      );
      if (validWebsite) {
        personalInfo.website = validWebsite;
      }
    }
    
    // Extract portfolio or personal domain without protocol
    const domainMatch = text.match(/(?:portfolio|website|blog)[:\s]*([a-zA-Z0-9\.-]+\.[a-zA-Z]{2,})/i);
    if (domainMatch && !personalInfo.website) {
      personalInfo.website = `https://${domainMatch[1]}`;
    }
    
    // Extract location (look for city, state patterns)
    const locationMatch = text.match(/([A-Z][a-z]+,\s*[A-Z]{2})|([A-Z][a-z]+\s*[A-Z][a-z]+,\s*[A-Z][a-z]+)|深圳|北京|上海|广州|杭州/);
    if (locationMatch) personalInfo.location = locationMatch[0];
    
    return personalInfo;
  }

  // Extract education information
  private extractEducation(text: string): Education[] {
    const education: Education[] = [];
    const educationKeywords = /(?:university|college|institute|school|bachelor|master|phd|degree|毕业|大学|学院|学士|硕士|博士)/gi;
    
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (educationKeywords.test(line)) {
        const edu: Education = {
          institution: '',
          degree: ''
        };
        
        // Extract institution and degree from surrounding lines
        const context = lines.slice(Math.max(0, i-2), Math.min(lines.length, i+3)).join(' ');
        
        // Look for degree types
        const degreeMatch = context.match(/(bachelor|master|phd|bs|ms|ba|ma|学士|硕士|博士)[^,\n]*/gi);
        if (degreeMatch) edu.degree = degreeMatch[0].trim();
        
        // Look for institution names
        const institutionMatch = context.match(/(university|college|institute|大学|学院)[^,\n]*/gi);
        if (institutionMatch) edu.institution = institutionMatch[0].trim();
        
        // Look for graduation year
        const yearMatch = context.match(/20\d{2}/);
        if (yearMatch) edu.graduationYear = parseInt(yearMatch[0]);
        
        if (edu.institution || edu.degree) {
          education.push(edu);
        }
      }
    }
    
    return education;
  }

  // Extract work experience
  private extractWorkExperience(text: string): WorkExperience[] {
    const experience: WorkExperience[] = [];
    const language = this.thinking.getMetadata('language') as string;
    
    // Enhanced patterns for Chinese and English date formats
    const datePatterns = [
      // Standard patterns: 2019.09 ~ 2022.3, 2024.06 ~ 至今
      /(\d{4}\.?\d{1,2})\s*[-~]\s*(\d{4}\.?\d{1,2}|至今|现在|present)/gi,
      // Year range patterns: 2017.03 - 2019.06
      /(\d{4}\.?\d{1,2})\s*[-~]\s*(\d{4}\.?\d{1,2})/gi,
      // Work time patterns: 工作时间：2024.06 ~ 至今
      /工作时间[：:]\s*(\d{4}\.?\d{1,2})\s*[-~]\s*(\d{4}\.?\d{1,2}|至今|现在)/gi,
      // Time patterns: 时间：2017.03 - 2019.06  
      /时间[：:]\s*(\d{4}\.?\d{1,2})\s*[-~]\s*(\d{4}\.?\d{1,2})/gi
    ];
    
    // Also look for explicit experience statements
    const experiencePattern = /([一二三四五六七八九十\d]+)[年]([前端|后端|全栈|开发|工程师|技术]*)(开发|工作)*经验/gi;
    const expMatch = text.match(experiencePattern);
    
    if (expMatch) {
      // Extract years from text like "五年前端开发经验" or "5年工作经验"
      expMatch.forEach(match => {
        const yearMatch = match.match(/([一二三四五六七八九十\d]+)/);
        if (yearMatch) {
          const yearStr = yearMatch[1];
          let years = 0;
          
          // Convert Chinese numbers to digits
          const chineseNumbers: Record<string, number> = {
            '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
            '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
          };
          
          if (chineseNumbers[yearStr]) {
            years = chineseNumbers[yearStr];
          } else if (!isNaN(Number(yearStr))) {
            years = Number(yearStr);
          }
          
          if (years > 0) {
            // Create a synthetic work experience entry with language-appropriate defaults
            const currentYear = new Date().getFullYear();
            experience.push({
              company: language === 'zh' ? '科技公司' : 'Technology Company',
              position: language === 'zh' ? 
                       (match.includes('前端') ? '前端开发工程师' : 
                        match.includes('后端') ? '后端开发工程师' : 
                        match.includes('全栈') ? '全栈开发工程师' : '软件工程师') :
                       (match.includes('前端') || match.toLowerCase().includes('frontend') ? 'Frontend Engineer' : 
                        match.includes('后端') || match.toLowerCase().includes('backend') ? 'Backend Engineer' : 
                        match.includes('全栈') || match.toLowerCase().includes('fullstack') ? 'Full Stack Engineer' : 'Software Engineer'),
              startDate: (currentYear - years).toString(),
              endDate: currentYear.toString(),
              description: [match],
              achievements: []
            });
          }
        }
      });
    }
    
    // Extract work experience from structured format
    const allMatches: RegExpMatchArray[] = [];
    datePatterns.forEach(pattern => {
      const matches = Array.from(text.matchAll(pattern));
      allMatches.push(...matches);
    });
    
    allMatches.forEach(match => {
      const startDateStr = match[1];
      const endDateStr = match[2];
      
      // Parse start date
      const startYear = parseInt(startDateStr.split('.')[0]);
      const startMonth = startDateStr.includes('.') ? parseInt(startDateStr.split('.')[1]) || 1 : 1;
      
      // Parse end date
      let endYear = new Date().getFullYear();
      let endMonth = new Date().getMonth() + 1;
      
      if (endDateStr && !['至今', '现在', 'present'].includes(endDateStr.toLowerCase())) {
        endYear = parseInt(endDateStr.split('.')[0]);
        endMonth = endDateStr.includes('.') ? parseInt(endDateStr.split('.')[1]) || 12 : 12;
      }
      
      if (startYear && startYear > 1990 && startYear <= endYear) {
        // Find context around this date range for company and position
        const index = text.indexOf(match[0]);
        const contextStart = Math.max(0, index - 500);
        const contextEnd = Math.min(text.length, index + 500);
        const context = text.substring(contextStart, contextEnd);
        
        // Extract company and position
        let company = '';
        let position = '';
        
        // Look for company patterns
        const companyPatterns = [
          /([^。\n]*)(公司|科技|有限公司|集团|企业|Corporation|Inc|Ltd|Co)/g,
          /###\s*([^（\n]+)/g  // Markdown header format
        ];
        
        for (const pattern of companyPatterns) {
          const companyMatch = context.match(pattern);
          if (companyMatch && companyMatch[0]) {
            company = companyMatch[0].replace(/###\s*/, '').trim();
            if (company.length > 0 && company.length < 50) break;
          }
        }
        
        // Look for position patterns  
        const positionPatterns = [
          /职位[：:]\s*([^\n]+)/,
          /(前端|后端|全栈|Web3|中级|高级|资深).*?(工程师|开发|程序员|架构师)/g,
          /(技术负责人|项目经理|团队负责人)/g,
          /(Frontend|Backend|Full Stack|Senior|Junior).*?(Engineer|Developer|Architect)/gi,
          /(Tech Lead|Project Manager|Team Lead)/gi
        ];
        
        for (const pattern of positionPatterns) {
          const positionMatch = context.match(pattern);
          if (positionMatch && positionMatch[0]) {
            position = positionMatch[0].replace(/职位[：:]\s*/, '').trim();
            if (position.length > 0 && position.length < 50) break;
          }
        }
        
        // Extract description from context
        const lines = context.split('\n').filter(line => line.trim().length > 10);
        const description = lines.slice(0, 5).map(line => line.trim());
        
        experience.push({
          company: company || (language === 'zh' ? '科技公司' : 'Technology Company'),
          position: position || (language === 'zh' ? '软件工程师' : 'Software Engineer'), 
          startDate: `${startYear}.${startMonth}`,
          endDate: endDateStr === '至今' || endDateStr === '现在' || endDateStr === 'present' ? 
                   '至今' : `${endYear}.${endMonth}`,
          description: description,
          achievements: []
        });
      }
    });
    
    return experience;
  }

  // Calculate total years of experience with improved logic to handle overlapping periods
  private calculateYearsOfExperience(workExperience: WorkExperience[]): number {
    if (workExperience.length === 0) return 0;
    
    // First try to extract from experience statement
    const resumeText = this.thinking.getMetadata('resumeText') as string;
    const experiencePattern = /([一二三四五六七八九十\d]+)[年]([前端|后端|全栈|开发|工程师|技术]*)(开发|工作)*经验/gi;
    const expMatch = resumeText.match(experiencePattern);
    
    if (expMatch) {
      for (const match of expMatch) {
        const yearMatch = match.match(/([一二三四五六七八九十\d]+)/);
        if (yearMatch) {
          const yearStr = yearMatch[1];
          let years = 0;
          
          // Convert Chinese numbers to digits
          const chineseNumbers: Record<string, number> = {
            '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
            '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
          };
          
          if (chineseNumbers[yearStr]) {
            years = chineseNumbers[yearStr];
          } else if (!isNaN(Number(yearStr))) {
            years = Number(yearStr);
          }
          
          if (years > 0 && years <= 20) { // Reasonable range check
            return years;
          }
        }
      }
    }
    
    // Calculate from work experience periods (non-overlapping approach)
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Sort experiences by start date
    const sortedExperiences = workExperience
      .map(exp => {
        let startYear = currentYear;
        let startMonth = 1;
        
        if (exp.startDate.includes('.')) {
          const startParts = exp.startDate.split('.');
          startYear = parseInt(startParts[0]) || currentYear;
          startMonth = parseInt(startParts[1]) || 1;
        } else {
          startYear = parseInt(exp.startDate) || currentYear;
        }
        
        let endYear = currentYear;
        let endMonth = currentMonth;
        
        if (exp.endDate === '至今' || exp.endDate === '现在' || 
            exp.endDate.toLowerCase().includes('present')) {
          endYear = currentYear;
          endMonth = currentMonth;
        } else if (exp.endDate.includes('.')) {
          const endParts = exp.endDate.split('.');
          endYear = parseInt(endParts[0]) || currentYear;
          endMonth = parseInt(endParts[1]) || 12;
        } else {
          endYear = parseInt(exp.endDate) || currentYear;
          endMonth = 12;
        }
        
        return {
          ...exp,
          startYear,
          startMonth,
          endYear,
          endMonth,
          startDate: new Date(startYear, startMonth - 1),
          endDate: new Date(endYear, endMonth - 1)
        };
      })
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    if (sortedExperiences.length === 0) return 0;
    
    // Calculate total experience from earliest start to latest end
    const earliestStart = sortedExperiences[0];
    const latestEnd = sortedExperiences[sortedExperiences.length - 1];
    
    const totalMonths = (latestEnd.endYear - earliestStart.startYear) * 12 + 
                       (latestEnd.endMonth - earliestStart.startMonth);
    
    const years = Math.max(0, Math.floor(totalMonths / 12));
    return Math.min(years, 15); // Cap at 15 years for reasonableness
  }

  // Improve industry determination with Chinese keywords
  private determineIndustry(workExperience: WorkExperience[], skills: Skill[]): string {
    const allText = [
      ...workExperience.flatMap(exp => [exp.company, exp.position, ...exp.description]),
      ...skills.flatMap(skill => skill.items)
    ].join(' ').toLowerCase();
    
    const industryKeywords = {
      'Technology': ['tech', 'software', 'ai', 'ml', 'data', 'cloud', 'startup', 'web3', 'blockchain',
                     '科技', '软件', '人工智能', '技术', '互联网', '前端', '后端', '开发', '程序'],
      'Finance': ['finance', 'bank', 'fintech', 'trading', 'investment', 
                  '金融', '银行', '投资', '支付', '区块链'],
      'Gaming': ['game', 'gaming', 'entertainment', 'nft', 
                 '游戏', '娱乐', '电竞'],
      'E-commerce': ['ecommerce', 'retail', 'shopping', 'marketplace', 
                     '电商', '零售', '购物', '商城'],
      'Education': ['education', 'university', 'school', 'academic', 
                    '教育', '大学', '学校', '培训'],
      'Healthcare': ['health', 'medical', 'pharma', 'biotech', 
                     '医疗', '健康', '生物', '医药'],
      'Media': ['media', 'content', 'publishing', 'social', 
                '媒体', '内容', '出版', '社交']
    };
    
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => allText.includes(keyword))) {
        return industry;
      }
    }
    
    return 'Technology'; // Default to technology
  }

  // Improve project extraction for Chinese resumes
  private extractProjects(text: string): Project[] {
    const projects: Project[] = [];
    
    const lines = text.split('\n');
    
    // Look for project sections and headers
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for project section headers
      if (/项目经历|项目背景|核心项目|主要项目/.test(line)) {
        // Extract projects from following lines
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          const projectLine = lines[j].trim();
          if (projectLine.length > 10 && !projectLine.includes('项目')) {
            const project: Project = {
              name: projectLine.split('（')[0].split('(')[0].trim(),
              description: projectLine,
              technologies: [],
              achievements: []
            };
            
            // Extract technologies from context
            const context = lines.slice(j, Math.min(j + 5, lines.length)).join(' ');
            const techPattern = /(React|Vue|Angular|Node\.js|Python|Java|JavaScript|TypeScript|HTML|CSS|MongoDB|MySQL|AWS|Docker|Next\.js|Nuxt\.js|Web3|Blockchain|Solidity|ethers\.js|wagmi|viem)/gi;
            const techs = context.match(techPattern);
            if (techs) {
              project.technologies = [...new Set(techs)];
            }
            
            projects.push(project);
          }
        }
      }
      
      // Check for markdown-style project headers
      const markdownMatch = line.match(/### ([^（(]+)/);
      if (markdownMatch) {
        const projectName = markdownMatch[1].trim();
        if (projectName.length > 5 && projectName.length < 50) {
          const project: Project = {
            name: projectName,
            description: '',
            technologies: [],
            achievements: []
          };
          
          // Get description from following lines
          const context = lines.slice(i + 1, Math.min(i + 8, lines.length)).join(' ');
          project.description = context.split('\n')[0] || '';
          
          // Extract technologies
          const techPattern = /(React|Vue|Angular|Node\.js|Python|Java|JavaScript|TypeScript|HTML|CSS|MongoDB|MySQL|AWS|Docker|Next\.js|Nuxt\.js|Web3|Blockchain|Solidity|ethers\.js|wagmi|viem|UnoCSS|Tailwind)/gi;
          const techs = context.match(techPattern);
          if (techs) {
            project.technologies = [...new Set(techs)];
          }
          
          projects.push(project);
        }
      }
    }
    
    // If no projects found through structured parsing, look for specific project mentions
    if (projects.length === 0) {
      const projectKeywords = ['Wallet 后台', 'NFT商城', 'L3E7', 'Ucollex', '组件库', 'SDK'];
      
      projectKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          projects.push({
            name: keyword,
            description: `${keyword}项目开发`,
            technologies: [],
            achievements: []
          });
        }
      });
    }
    
    return projects;
  }

  // Extract skills from text
  private extractSkills(text: string): Skill[] {
    const skills: Skill[] = [];
    
    // Enhanced technical skills patterns for Chinese and English
    const technicalSkills = [
      // Frontend
      'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Next.js', 'Nuxt.js',
      'HTML', 'CSS', 'Tailwind', 'UnoCSS', 'SCSS', 'Less',
      // Backend
      'Node.js', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Go', 'Rust',
      'Express', 'Koa', 'NestJS', 'Django', 'Spring',
      // Database
      'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Elasticsearch',
      // Cloud & DevOps
      'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'GitHub', 'GitLab',
      'CI/CD', 'Jenkins', 'Linux',
      // Web3 & Blockchain
      'Web3', 'Blockchain', 'Solidity', 'ethers.js', 'wagmi', 'viem',
      // Mobile
      'React Native', 'Flutter', 'Swift', 'Kotlin',
      // Other
      'GraphQL', 'REST', 'WebSocket', 'Microservices'
    ];
    
    // Chinese technical terms mapping
    const chineseSkillsMap: Record<string, string> = {
      '前端': 'Frontend Development',
      '后端': 'Backend Development', 
      '全栈': 'Full Stack Development',
      '移动端': 'Mobile Development',
      '数据库': 'Database',
      '云计算': 'Cloud Computing',
      '微服务': 'Microservices',
      '容器化': 'Containerization',
      '自动化测试': 'Automated Testing',
      '性能优化': 'Performance Optimization',
      '架构设计': 'Architecture Design'
    };
    
    const foundTechSkills: string[] = [];
    
    // Find English technical skills
    technicalSkills.forEach(skill => {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(text)) {
        foundTechSkills.push(skill);
      }
    });
    
    // Find Chinese technical skills
    Object.entries(chineseSkillsMap).forEach(([chinese, english]) => {
      if (text.includes(chinese)) {
        foundTechSkills.push(english);
      }
    });
    
    if (foundTechSkills.length > 0) {
      skills.push({
        category: 'Technical Skills',
        items: [...new Set(foundTechSkills)], // Remove duplicates
        proficiency: 'intermediate'
      });
    }
    
    // Enhanced soft skills patterns for Chinese and English
    const softSkillsPatterns = [
      { pattern: /leadership|领导力|团队领导/gi, skill: 'Leadership' },
      { pattern: /communication|沟通能力|沟通/gi, skill: 'Communication' },
      { pattern: /teamwork|团队合作|协作/gi, skill: 'Teamwork' },
      { pattern: /problem.solving|解决问题|问题解决/gi, skill: 'Problem Solving' },
      { pattern: /project.management|项目管理/gi, skill: 'Project Management' },
      { pattern: /learning.agility|学习能力|快速学习/gi, skill: 'Learning Agility' },
      { pattern: /analytical|分析能力|分析思维/gi, skill: 'Analytical Thinking' },
      { pattern: /creativity|创新思维|创造力/gi, skill: 'Creativity' },
      { pattern: /attention.to.detail|细致|注重细节/gi, skill: 'Attention to Detail' },
      { pattern: /time.management|时间管理/gi, skill: 'Time Management' }
    ];
    
    const foundSoftSkills: string[] = [];
    softSkillsPatterns.forEach(({ pattern, skill }) => {
      if (pattern.test(text)) {
        foundSoftSkills.push(skill);
      }
    });
    
    if (foundSoftSkills.length > 0) {
      skills.push({
        category: 'Soft Skills',
        items: [...new Set(foundSoftSkills)], // Remove duplicates
        proficiency: 'intermediate'
      });
    }
    
    return skills;
  }

  // Extract certifications
  private extractCertifications(text: string): string[] {
    const certifications: string[] = [];
    const certPatterns = [
      /AWS\s+Certified/gi,
      /Google\s+Cloud/gi,
      /Microsoft\s+Certified/gi,
      /Certified\s+\w+/gi,
      /认证/gi
    ];
    
    certPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        certifications.push(...matches);
      }
    });
    
    return [...new Set(certifications)];
  }

  // Extract languages
  private extractLanguages(text: string): string[] {
    const languages: string[] = [];
    const langPatterns = [
      /English|英语/gi,
      /Chinese|中文|汉语/gi,
      /Spanish|西班牙语/gi,
      /French|法语/gi,
      /German|德语/gi,
      /Japanese|日语/gi
    ];
    
    langPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        languages.push(...matches);
      }
    });
    
    return [...new Set(languages)];
  }

  private async generateProfessionalProfile(): Promise<ProfessionalProfile> {
    const parsedResume = this.thinking.getStepResult('step-0') as ParsedResume;
    const language = this.thinking.getMetadata('language') as string;
    
    console.log('Generating professional profile based on parsed resume:', parsedResume);
    console.log('Detected language:', language);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Extract basic information
    const name = parsedResume.personalInfo.name || (language === 'zh' ? '候选人' : 'Candidate');
    const email = parsedResume.personalInfo.email;
    const phone = parsedResume.personalInfo.phone;
    const github = parsedResume.personalInfo.github;
    const website = parsedResume.personalInfo.website;
    const linkedin = parsedResume.personalInfo.linkedin;
    
    // Extract roles and affiliation from work experience
    const titleRoles: string[] = [];
    let affiliation = '';
    let industry = '';
    
    if (parsedResume.workExperience.length > 0) {
      // Get the most recent work experience
      const recentExp = parsedResume.workExperience[parsedResume.workExperience.length - 1];
      
      // Translate Chinese positions to English if needed
      if (recentExp.position) {
        const translatedPosition = this.translatePosition(recentExp.position, language);
        titleRoles.push(translatedPosition);
      }
      
      if (recentExp.company && recentExp.company !== '技术公司' && recentExp.company !== 'Technology Company') {
        affiliation = recentExp.company;
      }
      industry = this.determineIndustry(parsedResume.workExperience, parsedResume.skills);
      
      // Add other unique positions (translated)
      parsedResume.workExperience.forEach(exp => {
        if (exp.position) {
          const translatedPosition = this.translatePosition(exp.position, language);
          if (!titleRoles.includes(translatedPosition)) {
            titleRoles.push(translatedPosition);
          }
        }
      });
    }
    
    // If no structured work experience found, generate based on skills and language
    if (titleRoles.length === 0) {
      const generatedRole = this.generateRoleFromSkills(parsedResume.skills, language);
      if (generatedRole) {
        titleRoles.push(generatedRole);
      }
    }
    
    // Limit title roles to top 3
    const limitedTitleRoles = titleRoles.slice(0, 3);
    
    // Calculate years of experience
    const yearsOfExperience = this.calculateYearsOfExperience(parsedResume.workExperience);
    
    // Determine AI tag based on comprehensive analysis
    const aiTag = this.determineAITag(parsedResume);
    
    // Generate latest education string
    const latestEducation = this.generateLatestEducation(parsedResume.education, language);
    
    // Generate professional description
    const description = this.generateProfessionalDescription(parsedResume, language);
    
    // Extract research interests from skills and projects
    const researchInterests = this.extractResearchInterests(parsedResume);
    
    const professionalProfile: ProfessionalProfile = {
      name,
      title_roles: limitedTitleRoles,
      affiliation: affiliation || (language === 'zh' ? '科技行业' : 'Technology Industry'),
      email,
      phone,
      github,
      website,
      linkedin,
      twitter: undefined, // This could be populated via web search in future
      photo_url: undefined, // This could be populated via web search in future
      description,
      ai_tag: aiTag,
      latest_education: latestEducation,
      years_of_experience: yearsOfExperience,
      industry: industry || 'Technology',
      research_interests: researchInterests
    };
    
    console.log('Generated professional profile:', professionalProfile);
    return professionalProfile;
  }

  // Translate position based on target language
  private translatePosition(position: string, targetLanguage: string): string {
    const chineseToEnglish: Record<string, string> = {
      '软件工程师': 'Software Engineer',
      '前端工程师': 'Frontend Engineer', 
      '后端工程师': 'Backend Engineer',
      '全栈工程师': 'Full Stack Engineer',
      'Web3工程师': 'Web3 Engineer',
      '技术负责人': 'Tech Lead',
      '项目经理': 'Project Manager',
      '产品经理': 'Product Manager',
      '架构师': 'Software Architect',
      '开发工程师': 'Development Engineer',
      '高级工程师': 'Senior Engineer',
      '资深工程师': 'Senior Engineer'
    };
    
    const englishToChinese: Record<string, string> = Object.fromEntries(
      Object.entries(chineseToEnglish).map(([k, v]) => [v, k])
    );
    
    if (targetLanguage === 'zh') {
      // If target is Chinese, check if we need to translate from English
      return englishToChinese[position] || position;
    } else {
      // If target is English, check if we need to translate from Chinese
      return chineseToEnglish[position] || position;
    }
  }

  // Generate role from skills when no work experience is available
  private generateRoleFromSkills(skills: Skill[], language: string): string {
    const techSkills = skills
      .filter(skill => skill.category.toLowerCase().includes('technical'))
      .flatMap(skill => skill.items);
    
    // Check for specific technology patterns
    const frontendTechs = ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css'];
    const backendTechs = ['node.js', 'python', 'java', 'go', 'php', 'c#', 'spring', 'django'];
    const web3Techs = ['web3', 'blockchain', 'solidity', 'ethereum', 'smart contract'];
    
    const skillsLower = techSkills.map(s => s.toLowerCase());
    
    if (web3Techs.some(tech => skillsLower.some(skill => skill.includes(tech)))) {
      return language === 'zh' ? 'Web3工程师' : 'Web3 Engineer';
    }
    
    const hasFrontend = frontendTechs.some(tech => skillsLower.some(skill => skill.includes(tech)));
    const hasBackend = backendTechs.some(tech => skillsLower.some(skill => skill.includes(tech)));
    
    if (hasFrontend && hasBackend) {
      return language === 'zh' ? '全栈工程师' : 'Full Stack Engineer';
    } else if (hasFrontend) {
      return language === 'zh' ? '前端工程师' : 'Frontend Engineer';
    } else if (hasBackend) {
      return language === 'zh' ? '后端工程师' : 'Backend Engineer';
    }
    
    // Default fallback
    return language === 'zh' ? '软件工程师' : 'Software Engineer';
  }

  private generateProfessionalDescription(parsedResume: ParsedResume, language: string): string {
    const yearsOfExperience = this.calculateYearsOfExperience(parsedResume.workExperience);
    const techSkills = parsedResume.skills
      .filter(skill => skill.category.toLowerCase().includes('technical'))
      .flatMap(skill => skill.items)
      .slice(0, 3);
    
    let recentPosition = '';
    let recentCompany = '';
    
    if (parsedResume.workExperience.length > 0) {
      const recentExp = parsedResume.workExperience[parsedResume.workExperience.length - 1];
      recentPosition = this.translatePosition(recentExp.position, language);
      recentCompany = recentExp.company;
    }
    
    if (language === 'zh') {
      // Generate Chinese description
      let description = `我是一位`;
      
      if (recentPosition && recentCompany && recentCompany !== '技术公司') {
        description += `${recentPosition}，现任职于${recentCompany}。`;
      } else if (recentPosition) {
        description += `${recentPosition}。`;
      } else {
        description += `软件开发工程师。`;
      }
      
      if (yearsOfExperience > 0) {
        description += `拥有${yearsOfExperience}年`;
        
        if (techSkills.length > 0) {
          const skillsText = techSkills.join('、');
          if (skillsText.toLowerCase().includes('react') || skillsText.toLowerCase().includes('vue')) {
            description += `前端开发经验。专注于${skillsText}等现代前端技术栈。`;
          } else if (skillsText.toLowerCase().includes('web3') || skillsText.toLowerCase().includes('blockchain')) {
            description += `Web3开发经验。擅长${skillsText}等区块链技术。`;
          } else {
            description += `软件开发经验。熟练掌握${skillsText}等技术。`;
          }
        } else {
          description += `软件开发经验。`;
        }
      }
      
      const totalProjects = parsedResume.projects.length;
      if (totalProjects > 0) {
        description += `参与过${totalProjects}个项目的开发与维护。`;
      }
      
      return description;
    } else {
      // Generate English description
      let description = `I am a`;
      
      if (recentPosition && recentCompany && recentCompany !== '技术公司' && recentCompany !== 'Technology Company') {
        description += ` ${recentPosition} currently working at ${recentCompany}.`;
      } else if (recentPosition) {
        description += ` ${recentPosition}`;
      } else {
        description += ` Software Engineer`;
      }
      
      if (yearsOfExperience > 0) {
        description += ` with ${yearsOfExperience} year${yearsOfExperience > 1 ? 's' : ''} of experience`;
        
        if (techSkills.length > 0) {
          const skillsText = techSkills.join(', ');
          if (skillsText.toLowerCase().includes('react') || skillsText.toLowerCase().includes('vue')) {
            description += ` in frontend development. I specialize in ${skillsText} and modern frontend technologies.`;
          } else if (skillsText.toLowerCase().includes('web3') || skillsText.toLowerCase().includes('blockchain')) {
            description += ` in Web3 development. I'm skilled in ${skillsText} and blockchain technologies.`;
          } else {
            description += ` in software development. I'm proficient in ${skillsText}.`;
          }
        } else {
          description += ` in software development.`;
        }
      } else {
        description += ` focused on building quality software solutions.`;
      }
      
      const totalProjects = parsedResume.projects.length;
      if (totalProjects > 0) {
        description += ` I have contributed to ${totalProjects} project${totalProjects > 1 ? 's' : ''}.`;
      }
      
      return description;
    }
  }

  private async assessSkills(): Promise<SkillAssessment> {
    const parsedResume = this.thinking.getStepResult('step-0') as ParsedResume;
    
    console.log('Assessing skills based on parsed resume:', parsedResume);
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Extract technical skills from parsed resume
    const allTechSkills = parsedResume.skills
      .filter(skill => skill.category.toLowerCase().includes('technical'))
      .flatMap(skill => skill.items);
    
    // Extract soft skills
    const allSoftSkills = parsedResume.skills
      .filter(skill => skill.category.toLowerCase().includes('soft'))
      .flatMap(skill => skill.items);
    
    return {
      technicalSkills: {
        strengths: allTechSkills.slice(0, 8) // Show top 8 technical skills
      },
      softSkills: {
        identified: allSoftSkills.slice(0, 6) // Show top 6 soft skills
      }
    };
  }

  private async assessExperience(): Promise<ExperienceAssessment> {
    const parsedResume = this.thinking.getStepResult('step-0') as ParsedResume;
    
    console.log('Assessing experience based on parsed resume:', parsedResume);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const workExp = parsedResume.workExperience;
    
    // Extract relevant industries
    const industries = workExp.map(exp => this.determineIndustry([exp], parsedResume.skills));
    const uniqueIndustries = [...new Set(industries)];
    
    // Determine career progression
    let careerProgression: 'ascending' | 'lateral' | 'stable' = 'stable';
    if (workExp.length > 1) {
      const sortedExp = workExp.sort((a, b) => parseInt(a.startDate) - parseInt(b.startDate));
      const hasProgressiveRoles = this.analyzeCareerProgression(sortedExp);
      careerProgression = hasProgressiveRoles ? 'ascending' : 'stable';
    }
    
    // Extract key achievements from work descriptions
    const keyAchievements = workExp
      .flatMap(exp => [...exp.description, ...exp.achievements])
      .filter(achievement => achievement.length > 10)
      .slice(0, 5);
    
    return {
      relevantIndustries: uniqueIndustries,
      careerProgression,
      keyAchievements
    };
  }

  // Analyze career progression from work experience
  private analyzeCareerProgression(workExperience: WorkExperience[]): boolean {
    if (workExperience.length < 2) return false;
    
    // Simple heuristic: check for progression in role titles
    const progressionKeywords = [
      ['intern', 'junior', 'senior', 'lead', 'principal'],
      ['developer', 'senior developer', 'tech lead', 'architect'],
      ['assistant', 'associate', 'manager', 'director'],
      ['实习', '初级', '中级', '高级', '资深', '专家', '主管', '经理']
    ];
    
    for (const keywords of progressionKeywords) {
      const positions = workExperience.map(exp => exp.position.toLowerCase());
      let lastIndex = -1;
      let hasProgression = false;
      
      for (const pos of positions) {
        const currentIndex = keywords.findIndex(keyword => pos.includes(keyword));
        if (currentIndex > lastIndex && currentIndex > 0) {
          hasProgression = true;
        }
        if (currentIndex !== -1) {
          lastIndex = Math.max(lastIndex, currentIndex);
        }
      }
      
      if (hasProgression) return true;
    }
    
    return false;
  }

  private async assessEducation(): Promise<EducationAssessment> {
    const parsedResume = this.thinking.getStepResult('step-0') as ParsedResume;
    
    console.log('Assessing education based on parsed resume:', parsedResume);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const education = parsedResume.education;
    
    const institutions = education.map(edu => edu.institution).filter((inst): inst is string => Boolean(inst));
    const degrees = education.map(edu => edu.degree).filter((degree): degree is string => Boolean(degree));  
    const majors = education.map(edu => edu.major).filter((major): major is string => Boolean(major));
    
    return {
      institutions: [...new Set(institutions)],
      degrees: [...new Set(degrees)],
      majors: [...new Set(majors)]
    };
  }

  private async calculateOverallScore(): Promise<OverallAssessment> {
    const language = this.thinking.getMetadata('language') as string;
    const parsedResume = this.thinking.getStepResult('step-0') as ParsedResume;
    const skillsResult = this.thinking.getStepResult('step-2') as SkillAssessment;
    const experienceResult = this.thinking.getStepResult('step-3') as ExperienceAssessment;
    const educationResult = this.thinking.getStepResult('step-4') as EducationAssessment;
    
    console.log('Calculating overall highlights with language:', language);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const highlights: string[] = [];
    
    if (language === 'zh') {
      // Generate positive highlights in Chinese
      if (skillsResult.technicalSkills.strengths.length > 0) {
        highlights.push(`掌握${skillsResult.technicalSkills.strengths.length}项核心技术技能`);
      }
      
      if (experienceResult.relevantIndustries.length > 0) {
        const industryText = experienceResult.relevantIndustries.join('、');
        highlights.push(`在${industryText}领域有丰富经验`);
      }
      
      if (experienceResult.careerProgression === 'ascending') {
        highlights.push('职业发展呈上升趋势');
      }
      
      if (educationResult.degrees.length > 0) {
        highlights.push(`具备${educationResult.degrees.join('、')}学历背景`);
      }
      
      if (experienceResult.keyAchievements.length > 0) {
        highlights.push('工作成果丰富，有具体项目经验');
      }
      
      if (skillsResult.softSkills.identified.length > 0) {
        highlights.push('具备良好的软技能和团队协作能力');
      }
      
      const yearsOfExperience = this.calculateYearsOfExperience(parsedResume.workExperience);
      if (yearsOfExperience > 0) {
        highlights.push(`拥有${yearsOfExperience}年专业工作经验`);
      }
      
    } else {
      // Generate positive highlights in English
      if (skillsResult.technicalSkills.strengths.length > 0) {
        highlights.push(`Proficient in ${skillsResult.technicalSkills.strengths.length} core technical skills`);
      }
      
      if (experienceResult.relevantIndustries.length > 0) {
        const industryText = experienceResult.relevantIndustries.join(', ');
        highlights.push(`Rich experience in ${industryText} industry`);
      }
      
      if (experienceResult.careerProgression === 'ascending') {
        highlights.push('Demonstrated career progression and growth');
      }
      
      if (educationResult.degrees.length > 0) {
        highlights.push(`Strong educational background with ${educationResult.degrees.join(', ')} degree(s)`);
      }
      
      if (experienceResult.keyAchievements.length > 0) {
        highlights.push('Strong track record with concrete project achievements');
      }
      
      if (skillsResult.softSkills.identified.length > 0) {
        highlights.push('Well-developed soft skills and team collaboration abilities');
      }
      
      const yearsOfExperience = this.calculateYearsOfExperience(parsedResume.workExperience);
      if (yearsOfExperience > 0) {
        highlights.push(`${yearsOfExperience} years of professional experience`);
      }
    }
    
    return {
      highlights: highlights.slice(0, 6) // Limit to top 6 highlights
    };
  }

  public getThinkingContext(): SequentialThinkingContext {
    return this.thinking.getContext();
  }

  public getAnalysisResult(): ResumeAnalysisResult | undefined {
    return this.analysisResult;
  }

  // Improve AI tag determination with better priority for developers
  private determineAITag(parsedResume: ParsedResume): AITag {
    const resumeText = this.thinking.getMetadata('resumeText') as string;
    const allText = [
      resumeText,
      ...parsedResume.workExperience.flatMap(exp => [exp.position, exp.company, ...exp.description, ...exp.achievements]),
      ...parsedResume.projects.flatMap(proj => [proj.name, proj.description, ...proj.achievements]),
      ...parsedResume.skills.flatMap(skill => skill.items)
    ].join(' ').toLowerCase();
    
    // Enhanced developer indicators with higher priority
    const developerKeywords = [
      'developer', 'engineer', 'programming', 'software', 'coding', 'development', 
      'frontend', 'backend', 'fullstack', 'web development', 'mobile app', 'react', 'vue', 'angular',
      'javascript', 'typescript', 'node.js', 'python', 'java', 'web3', 'blockchain',
      '开发', '工程师', '编程', '软件', '前端', '后端', '全栈', '程序员', '技术'
    ];
    
    // Researcher indicators  
    const researcherKeywords = [
      'research', 'researcher', 'phd', 'publications', 'paper', 'academic',
      'laboratory', 'study', 'analysis', 'investigation',
      '研究', '博士', '论文', '学术', '实验室', '分析'
    ];
    
    // Founder indicators
    const founderKeywords = [
      'founder', 'startup', 'co-founder', 'entrepreneur', 'founded', 'established',
      '创始人', '创业', '联合创始人', '创立'
    ];
    
    // Teacher indicators
    const teacherKeywords = [
      'teacher', 'professor', 'lecturer', 'instructor', 'teaching', 'education',
      '教师', '教授', '讲师', '教学', '教育'
    ];
    
    // Designer indicators (be more specific to avoid false positives)
    const designerKeywords = [
      'ui designer', 'ux designer', 'graphic designer', 'product designer', 'design lead',
      '设计师', 'ui设计', 'ux设计', '产品设计', '视觉设计'
    ];
    
    // Creator indicators
    const creatorKeywords = [
      'creator', 'content creator', 'artist', 'creative director', 'generative', 'ai art',
      '创作者', '内容创作', '艺术', '创意', '生成'
    ];
    
    // Count keyword matches with weights
    const scores = {
      developer: this.countKeywords(allText, developerKeywords) * 2, // Higher weight for developers
      researcher: this.countKeywords(allText, researcherKeywords),
      founder: this.countKeywords(allText, founderKeywords),
      teacher: this.countKeywords(allText, teacherKeywords),
      designer: this.countKeywords(allText, designerKeywords),
      creator: this.countKeywords(allText, creatorKeywords)
    };
    
    console.log('AI Tag scores:', scores);
    
    // Special logic for developers - if any strong dev indicators exist, prioritize developer
    const strongDevIndicators = ['前端工程师', '后端工程师', 'web3工程师', '软件工程师', 'frontend engineer', 'backend engineer'];
    const hasStrongDevIndicator = strongDevIndicators.some(indicator => allText.includes(indicator.toLowerCase()));
    
    if (hasStrongDevIndicator || scores.developer >= 3) {
      return AI_TAGS.developer;
    }
    
    // Find the tag with highest score
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return AI_TAGS.practitioner; // Default if no matches
    
    // Return the tag with highest score, following priority order
    if (scores.developer === maxScore) return AI_TAGS.developer;
    if (scores.researcher === maxScore) return AI_TAGS.researcher;
    if (scores.founder === maxScore) return AI_TAGS.founder;
    if (scores.teacher === maxScore) return AI_TAGS.teacher;
    if (scores.designer === maxScore) return AI_TAGS.designer;
    if (scores.creator === maxScore) return AI_TAGS.creator;
    
    return AI_TAGS.practitioner;
  }

  // Count keyword occurrences
  private countKeywords(text: string, keywords: string[]): number {
    return keywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }
  
  // Generate latest education string - remove placeholder text
  private generateLatestEducation(education: Education[], language: string): string {
    if (education.length === 0) {
      return language === 'zh' ? '学历信息未提供' : 'Education not specified';
    }
    
    // Get the most recent education (highest graduation year)
    const latestEdu = education.reduce((latest, current) => {
      const currentYear = current.graduationYear || 0;
      const latestYear = latest.graduationYear || 0;
      return currentYear > latestYear ? current : latest;
    });
    
    const parts = [];
    if (latestEdu.degree) parts.push(latestEdu.degree);
    if (latestEdu.major) parts.push(language === 'zh' ? `${latestEdu.major}专业` : `in ${latestEdu.major}`);
    if (latestEdu.institution) parts.push(language === 'zh' ? `毕业于${latestEdu.institution}` : `from ${latestEdu.institution}`);
    if (latestEdu.graduationYear) parts.push(`(${latestEdu.graduationYear})`);
    
    return parts.length > 0 ? parts.join(' ') : 
           (language === 'zh' ? '学历信息不完整' : 'Education details incomplete');
  }
  
  // Extract research interests from skills and projects
  private extractResearchInterests(parsedResume: ParsedResume): string[] {
    // From technical skills
    const techSkills = parsedResume.skills
      .filter(skill => skill.category.toLowerCase().includes('technical'))
      .flatMap(skill => skill.items);
    
    // From project technologies and names
    const projectInterests = parsedResume.projects.flatMap(proj => [
      proj.name,
      ...proj.technologies
    ]);
    
    // Combine and filter unique interests
    const allInterests = [...techSkills, ...projectInterests]
      .filter(Boolean)
      .map(interest => interest.trim())
      .filter(interest => interest.length > 0);
    
    // Remove duplicates and limit to 3
    const uniqueInterests = [...new Set(allInterests)];
    
    return uniqueInterests.slice(0, 3);
  }
} 
