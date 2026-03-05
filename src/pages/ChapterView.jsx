import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useHotkeys } from 'react-hotkeys-hook'
import confetti from 'canvas-confetti'
import useStudyStore from '../store/useStudyStore.js'
import { chapters } from '../data/chapters.js'
import RecallPrompt from '../components/RecallPrompt.jsx'
import FlashcardDeck from '../components/FlashcardDeck.jsx'
import QuizView from '../components/QuizView.jsx'

const TABS = [
  { id: 'recall', label: '📝 Recall' },
  { id: 'visual', label: '👁 Visual' },
  { id: 'slides', label: '📊 Slides' },
  { id: 'flashcards', label: '🃏 Flashcards' },
  { id: 'quiz', label: '❓ Quiz' },
  { id: 'complete', label: '✅ Complete' },
]

export default function ChapterView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const chapter = chapters.find((c) => c.id === id)
  const [activeTab, setActiveTab] = useState(0)
  const completeChapter = useStudyStore((s) => s.completeChapter)

  useHotkeys('left', () => setActiveTab((t) => Math.max(0, t - 1)), [])
  useHotkeys('right', () => setActiveTab((t) => Math.min(TABS.length - 1, t + 1)), [])

  useEffect(() => {
    if (activeTab === TABS.length - 1) {
      completeChapter(chapter.id)
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: [chapter.accent, '#ffffff', '#a78bfa'],
      })
    }
  }, [activeTab])

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Chapter not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-[#0f0f1a]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ backgroundColor: `${chapter.accent}25` }}
            >
              {chapter.icon}
            </div>
            <div>
              <span
                className="text-xs font-semibold"
                style={{ color: chapter.accent }}
              >
                Chapter {chapter.number}
              </span>
              <h1 className="text-white font-bold text-sm leading-tight">
                {chapter.title}
              </h1>
            </div>
          </div>

          <span className="text-slate-500 text-xs hidden sm:block">← → to navigate</span>
        </div>

        {/* Tab bar */}
        <div className="max-w-4xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(i)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === i
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              style={
                activeTab === i
                  ? { backgroundColor: `${chapter.accent}30`, color: chapter.accent }
                  : {}
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 0 && (
              <RecallPrompt
                chapter={chapter}
                onComplete={() => setActiveTab(1)}
              />
            )}
            {activeTab === 1 && <VisualSummary chapter={chapter} />}
            {activeTab === 2 && <SlidesViewer />}
            {activeTab === 3 && (
              <FlashcardDeck
                chapterId={chapter.id}
                cards={chapter.flashcards}
                chapter={chapter}
                onComplete={() => setActiveTab(4)}
              />
            )}
            {activeTab === 4 && (
              <QuizView
                chapterId={chapter.id}
                questions={chapter.quiz}
                chapter={chapter}
                onComplete={() => setActiveTab(5)}
              />
            )}
            {activeTab === 5 && (
              <CompleteScreen chapter={chapter} navigate={navigate} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function VisualSummary({ chapter }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-3">📖 Chapter Summary</h2>
        <p className="text-slate-300 leading-relaxed text-sm bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
          {chapter.summary}
        </p>
      </div>

      <div>
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
          🔑 Key Concepts
        </h3>
        <div className="flex flex-wrap gap-2">
          {chapter.keyConcepts.map((concept, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${chapter.accent}20`,
                color: chapter.accent,
                border: `1px solid ${chapter.accent}40`,
              }}
            >
              {concept}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
          📌 Key Points
        </h3>
        <ul className="space-y-2">
          {chapter.bullets.map((bullet, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 text-sm text-slate-300 bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3"
            >
              <span className="flex-shrink-0">{bullet.slice(0, 2)}</span>
              <span>{bullet.slice(2).trim()}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* HCI Infographic */}
      <div>
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
          🖼️ HCI Visual Overview
        </h3>
        <img
          src="/assets/hci-infographic.png"
          alt="HCI Infographic"
          className="w-full rounded-2xl border border-slate-700"
        />
      </div>
    </div>
  )
}

function SlidesViewer() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-xl font-bold text-white">📊 Exam Prep Slides</h2>
      <p className="text-slate-400 text-sm">Full slide deck covering all HCI topics — scroll through or open full screen.</p>
      <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900" style={{ height: '75vh' }}>
        <object
          data="/assets/hci-slides.pdf"
          type="application/pdf"
          className="w-full h-full"
        >
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
            <span className="text-4xl">📄</span>
            <p className="text-sm">PDF viewer not available in your browser.</p>
            <a
              href="/assets/hci-slides.pdf"
              download
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Download Slides PDF
            </a>
          </div>
        </object>
      </div>
    </div>
  )
}

function CompleteScreen({ chapter, navigate }) {
  return (
    <div className="max-w-xl mx-auto text-center space-y-8 py-8">
      <div
        className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl"
        style={{ backgroundColor: `${chapter.accent}25`, border: `2px solid ${chapter.accent}50` }}
      >
        🏆
      </div>
      <div>
        <h2 className="text-3xl font-extrabold text-white mb-2">Chapter Complete!</h2>
        <p className="text-slate-400">
          You've finished Chapter {chapter.number}: {chapter.title}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 text-center">
          <div className="text-2xl mb-1">📝</div>
          <div className="text-xs text-slate-400">Recall</div>
          <div className="text-green-400 text-xs font-semibold mt-0.5">Done ✓</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 text-center">
          <div className="text-2xl mb-1">🃏</div>
          <div className="text-xs text-slate-400">Flashcards</div>
          <div className="text-green-400 text-xs font-semibold mt-0.5">{chapter.flashcards.length} cards ✓</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 text-center">
          <div className="text-2xl mb-1">❓</div>
          <div className="text-xs text-slate-400">Quiz</div>
          <div className="text-green-400 text-xs font-semibold mt-0.5">Done ✓</div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-sm"
        >
          ← Dashboard
        </button>
        <button
          onClick={() => navigate('/master-quiz')}
          className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:brightness-110 text-sm"
          style={{ backgroundColor: chapter.accent }}
        >
          🎓 Master Quiz →
        </button>
      </div>
    </div>
  )
}
