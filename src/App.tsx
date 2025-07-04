import './App.css'
import PDFTranscriber from './components/PDFTranscriber.tsx'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 HybridNotes</h1>
        <p>Paper is not obsolete.</p>
      </header>
      <main className="app-main">
        <PDFTranscriber />
      </main>
    </div>
  )
}

export default App
