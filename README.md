# AI Resume Analyzer & Professional Profile Generator

An intelligent resume analysis system that transforms resumes into powerful professional profiles using advanced AI-powered sequential thinking methodology. Generate DINQ cards with comprehensive candidate insights and highlights.

## ✨ Key Features

### 🎯 AI-Powered Professional Profiling
- **Smart AI Tagging**: Automatically classifies professionals (Developer, Researcher, Founder, Teacher, Designer, Creator, Practitioner)
- **Intelligent Career Analysis**: Generates comprehensive professional summaries and role identification
- **Contact Information Extraction**: Automatically detects and displays email, phone, GitHub, LinkedIn, website, and other contact details
- **Multi-language Support**: Seamlessly handles both English and Chinese resumes with language-appropriate analysis

### 🧠 Sequential Thinking Architecture
- Based on [Model Context Protocol Sequential Thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking) framework
- **6-Step Analysis Process**:
  1. Resume Content Parsing
  2. Professional Profile Generation  
  3. Skills Assessment
  4. Experience Evaluation
  5. Education Background Analysis
  6. Overall Highlights Generation
- Transparent, step-by-step reasoning with real-time progress visualization

### 📊 Comprehensive Analysis Engine
- **Skills Showcase**: Technical and soft skills identification with strength-focused assessment
- **Experience Summary**: Career progression analysis, industry focus, and key achievements
- **Education Overview**: Institution, degree, and major field extraction
- **Positive-Only Approach**: Highlights strengths and achievements without negative assessments

### 🎨 Modern Glassmorphism UI
- **Beautiful Upload Interface**: Gradient backgrounds with drag-and-drop file support
- **Glassmorphism Design**: Backdrop blur effects with modern card layouts
- **Responsive Layout**: Mobile-first design with seamless cross-device experience
- **Interactive Elements**: Smooth animations and hover effects

### 📄 Advanced File Processing
- **Multi-format Support**: PDF, DOC, DOCX, TXT file upload
- **Intelligent Text Extraction**: Advanced parsing for both structured and unstructured resumes
- **Contact Detection**: Automatic extraction of GitHub, email, phone, LinkedIn, and website URLs
- **File Size Support**: Up to 10MB file uploads

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **UI Framework**: Shadcn UI + Radix UI + Tailwind CSS 4
- **AI Integration**: AI SDK + OpenAI (@ai-sdk/openai)
- **File Processing**: Advanced PDF and document parsing (pdf-parse)
- **State Management**: React Hooks with optimized performance
- **Package Manager**: pnpm
- **Design System**: Modern glassmorphism with responsive components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd resume-analyzer

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 📖 How to Use

### 1. Upload Resume
- **Drag & Drop**: Simply drag your resume file into the upload area
- **File Selection**: Click "Upload" to browse and select your resume
- **Supported Formats**: PDF, DOC, DOCX, TXT (up to 10MB)

### 2. Generate Profile
- Click "Generation Profile" to start the AI analysis
- Watch the real-time sequential thinking process
- See each analysis step complete with visual feedback

### 3. View Results
- **Professional Profile**: Complete AI-generated professional summary
- **Contact Information**: Automatically extracted contact details
- **Skills Overview**: Technical and soft skills identification
- **Experience Summary**: Career highlights and industry focus
- **Education Background**: Academic credentials and achievements
- **Overall Highlights**: Key strengths and professional advantages

## 🏗️ Project Architecture

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Main application page
│   ├── layout.tsx           # Root layout component
│   ├── globals.css          # Global styles and design system
│   └── api/                 # API routes
│       └── upload-resume/   # File upload endpoint
├── components/              # React components
│   ├── ui/                  # Shadcn UI components
│   │   ├── button.tsx       # Button component
│   │   ├── card.tsx         # Card components
│   │   ├── badge.tsx        # Badge component
│   │   └── ...              # Other UI primitives
│   ├── thinking-steps.tsx   # Sequential thinking visualization
│   └── analysis-results.tsx # Results display component
└── lib/                     # Core business logic
    ├── sequential-thinking.ts # Sequential thinking engine
    ├── resume-analyzer.ts    # Main analysis engine
    └── utils.ts             # Utility functions
```

## 🔧 Core Components

### Sequential Thinking Engine
- **Step Management**: Handles the 6-step analysis workflow
- **Progress Tracking**: Real-time updates with visual feedback
- **Error Handling**: Robust error recovery and user feedback
- **Data Flow**: Seamless data transfer between analysis steps

### Resume Analyzer
- **Language Detection**: Automatic Chinese/English language identification
- **Content Parsing**: Advanced text extraction and structuring
- **AI Classification**: Intelligent professional tagging and categorization
- **Profile Generation**: Comprehensive professional summary creation

### Analysis Components
- **Skills Assessment**: Technology stack and soft skills identification
- **Experience Evaluation**: Career progression and achievement analysis
- **Education Processing**: Academic background and credential extraction
- **Contact Extraction**: Multi-platform contact information detection

## 🎨 Design Philosophy

### Glassmorphism UI
- **Backdrop Blur Effects**: Modern glass-like interface elements
- **Gradient Backgrounds**: Beautiful color transitions and depth
- **Card-based Layout**: Clean, organized information presentation
- **Interactive Feedback**: Smooth animations and hover states

### User Experience
- **Intuitive Upload**: Drag-and-drop with clear visual feedback
- **Progress Transparency**: Real-time analysis step visualization
- **Information Hierarchy**: Clear organization of professional data
- **Responsive Design**: Seamless experience across all devices

## 🌟 Key Differentiators

1. **Positive-Only Analysis**: Focus on strengths and achievements, no negative feedback
2. **AI Professional Tagging**: Intelligent categorization of professional types
3. **Multi-language Intelligence**: Seamless handling of Chinese and English content
4. **Contact Information Extraction**: Comprehensive contact detail detection
5. **Modern UI Design**: Glassmorphism with beautiful visual effects
6. **Sequential Thinking**: Transparent AI reasoning process

## 🔮 Roadmap

- [x] **AI Model Integration**: AI SDK + OpenAI integration for enhanced analysis
- [ ] **Real-time AI Processing**: Connect with live AI models for dynamic analysis
- [ ] **Export Functionality**: PDF/PNG export of professional profiles
- [ ] **Batch Processing**: Multiple resume analysis capabilities
- [ ] **Template System**: Professional profile template options
- [ ] **API Integration**: LinkedIn and GitHub profile enrichment
- [ ] **Analytics Dashboard**: Usage statistics and insights
- [ ] **Advanced AI Models**: Claude, Gemini, and other model support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://github.com/modelcontextprotocol/servers) for the Sequential Thinking framework
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first styling approach

---

**Transform your resume into a powerful professional profile with AI-powered intelligence.**
