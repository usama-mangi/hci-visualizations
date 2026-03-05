import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import ChapterView from './pages/ChapterView.jsx'
import MasterQuiz from './pages/MasterQuiz.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-slate-100">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chapter/:id" element={<ChapterView />} />
        <Route path="/master-quiz" element={<MasterQuiz />} />
      </Routes>
    </div>
  )
}
