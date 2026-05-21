# HybridNotes: Bridge Your Paper Notes to Digital Brain

HybridNotes is a modern React/TypeScript application that transforms handwritten or scanned PDF notes into structured, semantic Markdown. Unlike traditional OCR tools that output chaotic, raw text, this platform utilizes context-aware linguistic processing to clean up formatting anomalies and restructure content for direct integration into personal knowledge graphs like Obsidian, Notion, or Roam Research.

🌐 **[Launch Live Application](https://jasonschurawel.github.io/HybridNotes)** (Zero installation required)

---

## Core Architecture

The platform operates on a privacy-first, serverless architecture that executes entirely within the client's browser. No document data or cryptographic keys are ever transmitted to external servers. 

The underlying processing core natively handles multilingual workflows for English, German, French, and Russian, applying grammar corrections and academic formatting standards. For optimal performance, the system dynamically adapts to file sizes: standard documents under 15 Megabytes use direct streaming, while heavy payloads up to 2 Gigabytes are managed via automated file-chunking pipelines.

---

## Quick Start & Local Setup

The production build is fully optimized for immediate browser execution. Users only need to input their local API credentials, configure the target language, and drop the PDF into the interface.

To modify, extend, or run the codebase in a local development environment, execute the following routine:

```bash
git clone [https://github.com/jasonschurawel/hybridnotes.git](https://github.com/jasonschurawel/hybridnotes.git)
cd hybridnotes
npm install
npm run dev
```
Once the local Vite server boots up, the development environment is accessible at `http://localhost:5173`.

---

## Directory & Script Mapping

The repository isolates presentation layers from the core extraction engines. The user interface is orchestrated by `PDFTranscriber.tsx`, supported by independent modules for file uploads, markdown previews, local credential encryption, and file serialization. The underlying translation and parsing logic is strictly separated into dedicated service layers for LLM prompt engineering and PDF.js extraction.

Project lifecycles and compilation pipelines are governed by standard automation scripts:

```bash
npm run build    # Compiles and optimizes assets into the /dist folder
npm run preview  # Locally serves the production-ready build
npm run lint     # Executes syntax and code quality validation
```

---

## Troubleshooting & Advanced Prompts

Advanced layout tuning can be achieved directly through the interface by passing explicit commands to the processing engine. The system natively parses behavioral instructions, such as requests to isolate technical terminology into an index or extract action items into structured checkboxes.

If the system refuses a document, ensure the source file is unencrypted and free of password profiles. For massive files near the 2 Gigabyte limit, ensure your network connection remains stable during processing and monitor the browser console logs for real-time heartbeat metrics and performance indicators.

---

## License & Roadmap

Distributed under the MIT Open Source License. Future updates focus on complete client-side offline processing for confidential or air-gapped workflows, alongside a modular provider layer to support alternative local Large Language Model backends.
