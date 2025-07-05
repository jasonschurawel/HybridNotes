# 🧠 HybridNotes - Bridge Your Paper Notes to Digital Brain

**Transform your handwritten PDF notes into structured, enhanced digital knowledge with multilingual support.**

🌐 **[Use it now online](https://jasonschurawel.github.io/HybridNotes)** - No installation required!

HybridNotes is a modern React TypeScript application that bridges the gap between traditional paper note-taking and digital knowledge management. Upload your PDF notes, select your preferred language, and watch them transform into well-structured, searchable digital content that integrates seamlessly into your digital brain workflow.

---

## 🎯 **The Problem We Solve**

Many knowledge workers, students, and researchers face the challenge of converting their handwritten or scanned PDF notes into usable digital formats. Traditional OCR solutions often produce messy, unstructured text that requires significant manual cleanup. HybridNotes solves this by:

- **Intelligent Processing**: Understands context and meaning, not just extracting text
- **Language Preservation**: Maintains your notes in German, English, French, or Russian with natural language enhancement
- **Structure Enhancement**: Transforms chaotic handwritten notes into well-organized, markdown-formatted content
- **Customizable Output**: Adapts to your specific needs with custom instructions and multiple export formats

---

## ✨ **Key Features**

### 🤖 **Smart Enhancement**
- Advanced PDF processing with intelligent text improvement
- Context-aware note enhancement and restructuring
- Custom instructions for personalized output

### 🌐 **Multilingual Support**
- **English** 🇺🇸 - Professional and academic formatting
- **German** 🇩🇪 - Native German language processing
- **French** 🇫🇷 - Proper French academic and business formatting
- **Russian** 🇷🇺 - Cyrillic text processing and enhancement

### 📁 **Flexible Export Options**
- **Save as .txt** - Plain text for universal compatibility
- **Save as .md** - Markdown for note-taking apps (Obsidian, Notion, etc.)
- **Mirror .pdf with .md** - Creates matching .md file with same name as original PDF

### 🎨 **Modern User Experience**
- Drag-and-drop PDF upload
- Real-time preview and editing
- Responsive design for all devices
- Privacy-first approach (API key stored locally)

---

## 🚀 **Quick Start**

### 🌐 **Use Online (Recommended)**

**Ready to use immediately - no installation required!**

Visit the live application: **[jasonschurawel.github.io/HybridNotes](https://jasonschurawel.github.io/HybridNotes)**

✅ **Instant access** - works directly in your browser  
✅ **No setup required** - just visit the link and start using  
✅ **Always up-to-date** - automatically updated with latest features  
✅ **Cross-platform** - works on Windows, Mac, Linux, mobile devices  
✅ **Secure** - your files and API key stay in your browser (nothing uploaded to servers)  

Simply:
1. 🔗 **Visit** [jasonschurawel.github.io/HybridNotes](https://jasonschurawel.github.io/HybridNotes)
2. 🔑 **Enter your API key** ([Get one here](https://makersuite.google.com/app/apikey))
3. 📄 **Upload your PDF** and transform your notes!

---

### 🛠️ **Local Development Setup**

Want to modify the code or run it locally? Follow these steps:

### Prerequisites
- Node.js (version 18 or higher)
- API key for text processing ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hybridnotes.git
   cd hybridnotes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

---

## 📖 **How to Use**

### 1. **Setup**
- Enter your API key for text processing
- Select your preferred output language
- Add any specific instructions for note processing

### 2. **Upload & Process**
- Drag and drop your PDF file or click to upload
- The system will analyze and enhance your notes automatically
- Review the improved content in the preview

### 3. **Export & Use**
- Choose your export format (TXT, MD, or Mirror PDF)
- Import into your digital note-taking system
- Enjoy structured, searchable content

---

## 🛠️ **Technology Stack**

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite for fast development
- **Text Processing**: Advanced language processing for note enhancement
- **PDF Processing**: PDF.js for reliable text extraction
- **File Operations**: FileSaver.js for downloads
- **Styling**: Modern CSS3 with glassmorphism design

---

## 🎯 **Use Cases**

### 📚 **Students**
- Convert handwritten lecture notes to digital study materials
- Create searchable archives of academic content
- Prepare formatted notes for collaborative study

### 🔬 **Researchers**
- Digitize research notes and field observations
- Structure interview transcripts and meeting notes
- Create reference materials for publications

### 💼 **Professionals**
- Transform meeting notes into actionable documents
- Archive important handwritten records
- Create searchable knowledge bases

### 🧠 **Knowledge Workers**
- Build personal knowledge management systems
- Integrate with tools like Obsidian, Notion, or Roam
- Create interconnected digital note networks

---

## 🔧 **Advanced Configuration**

### **Custom Instructions**
Use the "Additional Context" field to provide specific instructions:
```
Focus on creating bullet-point summaries
Emphasize key concepts for exam preparation
Format as a study guide with clear sections
Extract only action items and decisions
```

### **Language-Specific Processing**
Each language option provides native processing:
- **Grammar and style** corrections
- **Cultural context** awareness
- **Academic formatting** standards
- **Professional terminology** usage

---

## 📁 **Project Structure**

```
src/
├── components/           # React components
│   ├── PDFTranscriber.tsx     # Main orchestrator
│   ├── FileUpload.tsx         # Drag-drop upload
│   ├── TextPreview.tsx        # Content preview
│   ├── APIKeyInput.tsx        # Secure API key input
│   ├── LanguageSelector.tsx   # Language selection
│   ├── AdditionalNotes.tsx    # Custom instructions
│   └── SaveOptions.tsx        # Export options
├── services/            # External integrations
│   ├── geminiService.ts       # Text processing service
│   └── pdfService.ts          # PDF processing
└── assets/             # Static resources
```

---

## 🚀 **Development**

### **Available Scripts**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### **Build for Production**
```bash
npm run build
```
Built files will be in the `dist/` directory, ready for deployment.

---

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with descriptive messages**
   ```bash
   git commit -m 'Add amazing feature for better note processing'
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### **Development Guidelines**
- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Test with different PDF types and languages

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ **Important Notes**

### **API Usage & Costs**
- Text processing API usage may incur costs based on your usage
- Monitor your API usage in [Google Cloud Console](https://console.cloud.google.com/)
- Free tier available for moderate usage

### **Privacy & Security**
- Your API key is stored locally in your browser
- PDF files are processed securely through the processing API
- No data is stored on our servers

### **Compatibility**
- Modern browsers with ES6+ support required
- PDF files should be text-based (not pure images)
- Large PDF files may take longer to process

---

## 🆘 **Troubleshooting**

### **Common Issues**

**"Failed to process PDF"**
- Check if PDF is password-protected
- Try with a smaller PDF file first

**"API Key Invalid"**
- Verify your API key is correct
- Check API key permissions in Google Cloud Console
- Ensure billing is enabled for your Google Cloud project

**"Processing takes too long"**
- Large PDFs require more processing time
- Check your internet connection
- Consider splitting large documents

### **Getting Help**

1. **Check the browser console** for detailed error messages
2. **Verify your setup** using the troubleshooting steps above
3. **Open an issue** on GitHub with:
   - Browser and OS information
   - Error messages from console
   - Steps to reproduce the problem

---

## 🔮 **Future Roadmap**

- [ ] **Offline processing capabilities** for independence, security and confidential data
- [ ] **Support for multiple API Services** (not only Google...)

---

**Transform your notes. Enhance your knowledge. Bridge the gap between paper and digital.**
