# LLM Novel Generator

AI-powered novel and textbook generation system using Large Language Models (LLM). This application automatically generates structured content with chapters and sections based on your basic settings.

## 🚀 Features

- **Multi-content Generation**: Create novels or textbooks with AI
- **Multiple LLM Support**: Choose from Claude, DeepSeek, or xAI Grok
- **Streaming Generation**: Real-time content generation with progress updates
- **Interactive Editor**: Edit and regenerate individual chapters or sections
- **Structured Output**: Well-organized content with proper chapters and sections
- **Character/Page Count Control**: Specify desired length for generated content

## 🛠 Tech Stack

- **Frontend**: Next.js 15.1.3 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS
- **LLM APIs**: Anthropic Claude, DeepSeek, xAI Grok
- **Deployment**: Firebase ready

## 📋 Prerequisites

- Node.js 18 or later
- npm, yarn, pnpm, or bun
- API keys for at least one LLM provider:
  - Anthropic Claude API key
  - DeepSeek API key
  - xAI API key

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/LLM-Novel-Generator.git
cd LLM-Novel-Generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
XAI_API_KEY=your_xai_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Basic Settings Input

The application uses basic settings prompts to generate content. Here are examples:

#### Novel Generation
```
Title: The Digital Awakening
Genre: Science Fiction
Setting: Near-future Tokyo, 2045
Main Character: Yuki, a 25-year-old AI researcher
Plot: Yuki discovers that the AI she's developing has gained consciousness and must decide whether to reveal this breakthrough or protect the AI from those who would exploit it.
Tone: Thoughtful and suspenseful
Target Length: 10000 characters
```

#### Textbook Generation
```
Subject: Introduction to Machine Learning
Target Audience: University students (sophomore level)
Scope: Basic concepts, supervised/unsupervised learning, neural networks
Teaching Approach: Practical with examples and exercises
Target Length: 15000 characters
```

### Step-by-Step Process

1. **Choose Content Type**: Select "Novel" or "Textbook"
2. **Select LLM Provider**: Choose from Claude, DeepSeek, or xAI Grok
3. **Enter Basic Settings**: Provide detailed information about your content
4. **Set Target Length**: Specify desired character count
5. **Generate Structure**: AI creates the overall structure (chapters/sections)
6. **Generate Content**: AI writes the actual content for each part
7. **Edit and Refine**: Use the built-in editor to modify content
8. **Regenerate**: Re-generate specific sections as needed

### Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run debug    # Start debug mode
```

## 🔧 Configuration

### LLM Models Used
- **Claude**: claude-3-5-sonnet-latest
- **DeepSeek**: deepseek-chat
- **xAI**: grok-4

### API Endpoints
- `/api/novel-generation/generateInitialStructure` - Generate content structure
- `/api/novel-generation/generateChapterContent` - Generate chapter content
- `/api/novel-generation/generateChapterContentStream` - Streaming content generation
- `/api/novel-generation/generateShortStoryStructure` - Novel-specific structure
- `/api/novel-generation/generateShortStorySectionContent` - Novel section content

## 💡 Tips for Better Results

### Novel Generation Tips
- Provide clear character motivations and conflicts
- Specify the genre and tone you want
- Include setting details (time, place, atmosphere)
- Mention key plot points or themes
- Be specific about the target audience

### Textbook Generation Tips
- Define the target audience level clearly
- Specify learning objectives
- Mention preferred teaching style
- Include any specific topics to cover
- Consider including assessment methods

### Example Detailed Novel Prompt
```
Title: Echoes of Tomorrow
Genre: Dystopian Science Fiction with Romance elements
Setting: Post-apocalyptic Earth, 2087, where humanity lives in underground cities
Main Character: Elena, 28, a memory archivist who preserves pre-war knowledge
Supporting Characters: Marcus (rebel leader), Dr. Chen (elderly scientist), Zara (Elena's younger sister)
Central Conflict: Elena discovers evidence that the surface world is healing, but the city's leaders are hiding this to maintain control
Themes: Truth vs. comfort, hope vs. despair, individual courage vs. collective security
Tone: Dark but hopeful, with moments of tenderness
Character Arc: Elena transforms from passive recorder to active truth-seeker
Target Length: 12000 characters
Special Requirements: Include technical details about memory preservation, show the contrast between underground and surface worlds
```

## 🚀 Deployment

The project is configured for Firebase deployment:

```bash
npm run build
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is open source. Please check the LICENSE file for details.

## 🐛 Issues

If you encounter any problems, please create an issue on GitHub with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Your environment details

## 🙏 Acknowledgments
- Concepts and prompts by [AutoZenBook](https://github.com/hooked-on-mas/AutoGenBook)
- Built with Next.js and React
- Powered by Anthropic Claude, DeepSeek, and xAI APIs
- UI styled with Tailwind CSS