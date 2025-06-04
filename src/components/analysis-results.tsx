"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResumeAnalysisResult, AI_TAG_DESCRIPTIONS } from '@/lib/resume-analyzer';
import { CheckCircle, TrendingUp, Users, GraduationCap, Star, User, Github, Briefcase, Calendar, MapPin, Mail, Phone, Globe, Linkedin, Twitter } from 'lucide-react';

interface AnalysisResultsProps {
  result: ResumeAnalysisResult;
}

// Language-aware text labels
const getLabels = (language: 'en' | 'zh') => {
  if (language === 'zh') {
    return {
      skillAssessment: '技能展示',
      technicalSkills: '技术技能',
      softSkills: '软技能',
      strengths: '技能优势',
      identified: '具备技能',
      experienceAssessment: '经验总结',
      relevantIndustries: '相关领域',
      careerProgression: '职业发展',
      keyAchievements: '主要成就',
      educationAssessment: '教育背景',
      institutions: '毕业院校',
      degrees: '学历学位',
      majors: '专业方向',
      overallHighlights: '综合亮点',
      highlights: '候选人亮点',
      ascending: '上升趋势',
      lateral: '平稳发展',
      stable: '稳步发展',
    };
  } else {
    return {
      skillAssessment: 'Skills Overview',
      technicalSkills: 'Technical Skills',
      softSkills: 'Soft Skills',
      strengths: 'Key Strengths',
      identified: 'Demonstrated Skills',
      experienceAssessment: 'Experience Summary',
      relevantIndustries: 'Industry Focus',
      careerProgression: 'Career Development',
      keyAchievements: 'Key Achievements',
      educationAssessment: 'Educational Background',
      institutions: 'Institutions',
      degrees: 'Degrees',
      majors: 'Major Fields',
      overallHighlights: 'Overall Highlights',
      highlights: 'Candidate Highlights',
      ascending: 'Ascending',
      lateral: 'Lateral',
      stable: 'Stable',
    };
  }
};

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const labels = getLabels(result.language);

  // Helper function to get AI tag color
  const getAITagColor = (tag: string) => {
    switch (tag) {
      case 'developer': return 'bg-blue-100 text-blue-800';
      case 'researcher': return 'bg-purple-100 text-purple-800';
      case 'founder': return 'bg-green-100 text-green-800';
      case 'teacher': return 'bg-yellow-100 text-yellow-800';
      case 'designer': return 'bg-pink-100 text-pink-800';
      case 'creator': return 'bg-orange-100 text-orange-800';
      case 'practitioner': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get career progression color
  const getCareerProgressionColor = (progression: string) => {
    switch (progression) {
      case 'ascending': return 'bg-green-100 text-green-800';
      case 'stable': return 'bg-blue-100 text-blue-800';
      case 'lateral': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Professional Profile Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            {result.language === 'zh' ? 'AI人才档案' : 'AI Professional Profile'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name and AI Tag */}
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">{result.professionalProfile.name}</h2>
            <Badge className={`${getAITagColor(result.professionalProfile.ai_tag)} px-4 py-2 text-sm font-semibold rounded-xl`}>
              {result.professionalProfile.ai_tag.toUpperCase()}
            </Badge>
          </div>

          {/* AI Tag Description */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <p className="text-gray-700 leading-relaxed">
              {AI_TAG_DESCRIPTIONS[result.language][result.professionalProfile.ai_tag]}
            </p>
          </div>

          {/* Key Information Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* GitHub */}
            {result.professionalProfile.github && (
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                <Github className="w-5 h-5 text-gray-500" />
                <a 
                  href={result.professionalProfile.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm truncate font-medium"
                >
                  {result.professionalProfile.github.replace('https://github.com/', '@')}
                </a>
              </div>
            )}

            {/* Email */}
            {result.professionalProfile.email && (
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                <Mail className="w-5 h-5 text-gray-500" />
                <a 
                  href={`mailto:${result.professionalProfile.email}`}
                  className="text-blue-600 hover:text-blue-800 text-sm truncate font-medium"
                >
                  {result.professionalProfile.email}
                </a>
              </div>
            )}

            {/* Phone */}
            {result.professionalProfile.phone && (
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                <Phone className="w-5 h-5 text-gray-500" />
                <a 
                  href={`tel:${result.professionalProfile.phone}`}
                  className="text-blue-600 hover:text-blue-800 text-sm truncate font-medium"
                >
                  {result.professionalProfile.phone}
                </a>
              </div>
            )}

            {/* Website */}
            {result.professionalProfile.website && (
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                <Globe className="w-5 h-5 text-gray-500" />
                <a 
                  href={result.professionalProfile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm truncate font-medium"
                >
                  {result.professionalProfile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            {/* LinkedIn */}
            {result.professionalProfile.linkedin && (
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                <Linkedin className="w-5 h-5 text-gray-500" />
                <a 
                  href={result.professionalProfile.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm truncate font-medium"
                >
                  {result.professionalProfile.linkedin.replace('https://linkedin.com/in/', '')}
                </a>
              </div>
            )}

            {/* Twitter */}
            {result.professionalProfile.twitter && (
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                <Twitter className="w-5 h-5 text-gray-500" />
                <a 
                  href={result.professionalProfile.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm truncate font-medium"
                >
                  {result.professionalProfile.twitter.replace('https://twitter.com/', '@')}
                </a>
              </div>
            )}

            {/* Years of Experience */}
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700 font-medium">
                {result.professionalProfile.years_of_experience} {result.language === 'zh' ? '年经验' : 'years exp'}
              </span>
            </div>

            {/* Industry */}
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
              <Briefcase className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700 font-medium">{result.professionalProfile.industry}</span>
            </div>

            {/* Affiliation */}
            {result.professionalProfile.affiliation && (
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700 truncate font-medium">{result.professionalProfile.affiliation}</span>
              </div>
            )}
          </div>

          {/* Title Roles */}
          {result.professionalProfile.title_roles.length > 0 && (
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <h4 className="font-semibold text-gray-900 mb-3">
                {result.language === 'zh' ? '职位角色' : 'Professional Roles'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.professionalProfile.title_roles.map((role, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-white/80 border-gray-200">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <h4 className="font-semibold text-gray-900 mb-3">
              {result.language === 'zh' ? '专业描述' : 'Professional Summary'}
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {result.professionalProfile.description}
            </p>
          </div>

          {/* Education */}
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <h4 className="font-semibold text-gray-900 mb-3">
              {result.language === 'zh' ? '教育背景' : 'Education'}
            </h4>
            <p className="text-gray-700">
              {result.professionalProfile.latest_education}
            </p>
          </div>

          {/* Research Interests */}
          {result.professionalProfile.research_interests && result.professionalProfile.research_interests.length > 0 && (
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/50">
              <h4 className="font-semibold text-gray-900 mb-3">
                {result.language === 'zh' ? '研究兴趣' : 'Research Interests'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.professionalProfile.research_interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-white/80">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Assessment */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            {labels.skillAssessment}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Technical Skills */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              {labels.technicalSkills} {labels.strengths}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {result.skillAssessment.technicalSkills.strengths.map((skill, index) => (
                <Badge key={index} variant="outline" className="justify-center py-2 bg-green-50 border-green-200 text-green-800 hover:bg-green-100">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Soft Skills */}
          {result.skillAssessment.softSkills.identified.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {labels.softSkills} {labels.identified}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {result.skillAssessment.softSkills.identified.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="justify-center py-2 bg-blue-50 border-blue-200 text-blue-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience Assessment */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            {labels.experienceAssessment}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Relevant Industries */}
          {result.experienceAssessment.relevantIndustries.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{labels.relevantIndustries}</h3>
              <div className="flex flex-wrap gap-2">
                {result.experienceAssessment.relevantIndustries.map((industry, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200 px-4 py-2 rounded-lg">
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Career Progression */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">{labels.careerProgression}</h3>
            <Badge className={`${getCareerProgressionColor(result.experienceAssessment.careerProgression)} px-4 py-2 rounded-lg font-medium`}>
              {labels[result.experienceAssessment.careerProgression as keyof typeof labels] || result.experienceAssessment.careerProgression}
            </Badge>
          </div>

          {/* Key Achievements */}
          {result.experienceAssessment.keyAchievements.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{labels.keyAchievements}</h3>
              <ul className="space-y-2">
                {result.experienceAssessment.keyAchievements.slice(0, 5).map((achievement, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education Assessment */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {labels.educationAssessment}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Institutions */}
          {result.educationAssessment.institutions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{labels.institutions}</h3>
              <div className="flex flex-wrap gap-2">
                {result.educationAssessment.institutions.map((institution, index) => (
                  <Badge key={index} variant="outline" className="px-4 py-2 bg-purple-50 border-purple-200 text-purple-800">
                    {institution}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Degrees */}
          {result.educationAssessment.degrees.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{labels.degrees}</h3>
              <div className="flex flex-wrap gap-2">
                {result.educationAssessment.degrees.map((degree, index) => (
                  <Badge key={index} className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-4 py-2 rounded-lg">
                    {degree}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Majors */}
          {result.educationAssessment.majors.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{labels.majors}</h3>
              <div className="flex flex-wrap gap-2">
                {result.educationAssessment.majors.map((major, index) => (
                  <Badge key={index} variant="secondary" className="px-4 py-2 bg-gray-100 text-gray-800">
                    {major}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Highlights */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-100 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            {labels.overallHighlights}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {result.overallAssessment.highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="text-gray-800 leading-relaxed font-medium">{highlight}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
