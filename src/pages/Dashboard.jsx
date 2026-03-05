import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStudyStore from '../store/useStudyStore.js'
import { chapters } from '../data/chapters.js'

export default function Dashboard() {
  const navigate = useNavigate()
  const chapterProgress = useStudyStore((s) => s.chapterProgress)
  const getOverallMastery = useStudyStore((s) => s.getOverallMastery)
  const mastery = getOverallMastery()

  const [timeLeft, setTimeLeft] = useState(getTimeUntilExam())

  function getTimeUntilExam() {
    const now = new Date()
    const exam = new Date()
    exam.setDate(now.getDate() + 1)
    exam.setHours(9, 0, 0, 0)
    return Math.max(0, Math.floor((exam - now) / 1000))
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilExam())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0')
  const seconds = String(timeLeft % 60).padStart(2, '0')

  function getChapterStatus(chapterId) {
    const cp = chapterProgress[chapterId]
    if (!cp) return 'not-started'
    if (cp.completed) return 'complete'
    if (cp.recallDone || cp.flashcardsDone > 0 || cp.quizScore > 0) return 'in-progress'
    return 'not-started'
  }

  const masteryColor =
    mastery >= 70 ? '#22c55e' : mastery >= 40 ? '#f59e0b' : '#6366f1'

  return (
    <div className="min-h-screen bg-[#0f0f1a] px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-700/40 rounded-full px-4 py-1.5 text-xs text-violet-300 font-medium">
            📚 HCI Exam Prep
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Human Computer Interaction
          </h1>
          <p className="text-slate-400 text-sm">Your personal study companion</p>
        </motion.div>

        {/* Countdown + Mastery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Countdown */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6 text-center">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
              ⏰ Exam in
            </p>
            <div className="font-mono text-4xl font-black text-white tabular-nums">
              {hours}:{minutes}:{seconds}
            </div>
            <p className="text-slate-500 text-xs mt-2">Tomorrow at 9:00 AM — you've got this!</p>
          </div>

          {/* Mastery */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                📊 Overall Mastery
              </p>
              <span
                className="text-2xl font-black tabular-nums"
                style={{ color: masteryColor }}
              >
                {mastery}%
              </span>
            </div>
            <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${mastery}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: masteryColor }}
              />
            </div>
            <p className="text-slate-500 text-xs mt-2">
              {mastery < 40
                ? 'Keep going — every chapter you complete matters!'
                : mastery < 70
                ? 'Great progress! Keep pushing through the chapters.'
                : 'Amazing! You\'re well prepared 🎉'}
            </p>
          </div>
        </motion.div>

        {/* Chapter Grid */}
        <div>
          <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-widest mb-4">
            Chapters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {chapters.map((chapter, i) => {
              const status = getChapterStatus(chapter.id)
              const cp = chapterProgress[chapter.id] || {}

              return (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.4 }}
                  className="group relative bg-slate-800/50 border rounded-3xl p-5 cursor-pointer hover:bg-slate-800/80 transition-all"
                  style={{ borderColor: `${chapter.accent}40` }}
                  onClick={() => navigate(`/chapter/${chapter.id}`)}
                >
                  {/* Accent glow */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ boxShadow: `inset 0 0 40px ${chapter.accent}10` }}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: `${chapter.accent}20` }}
                      >
                        {chapter.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="text-xs font-semibold"
                            style={{ color: chapter.accent }}
                          >
                            Ch.{chapter.number}
                          </span>
                          <StatusBadge status={status} />
                        </div>
                        <h3 className="text-white font-semibold text-sm leading-tight truncate">
                          {chapter.title}
                        </h3>
                        <p className="text-slate-500 text-xs mt-0.5 truncate">
                          {chapter.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>⏱ {chapter.estimatedTime}m</span>
                      <span>🃏 {chapter.flashcards.length} cards</span>
                      {cp.quizScore > 0 && (
                        <span
                          className="font-semibold"
                          style={{ color: cp.quizScore >= 80 ? '#22c55e' : cp.quizScore >= 60 ? '#f59e0b' : '#ef4444' }}
                        >
                          Quiz: {cp.quizScore}%
                        </span>
                      )}
                    </div>
                    <button
                      className="text-xs font-bold px-4 py-1.5 rounded-xl transition-all hover:brightness-110"
                      style={{
                        backgroundColor: `${chapter.accent}25`,
                        color: chapter.accent,
                      }}
                    >
                      Study →
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Audio Podcast */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-slate-800/50 border border-slate-700 rounded-3xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-900/50 flex items-center justify-center text-xl">🎧</div>
            <div>
              <p className="text-white font-semibold text-sm">HCI Exam Prep Podcast</p>
              <p className="text-slate-500 text-xs">AI-generated deep dive — listen while you study</p>
            </div>
          </div>
          <audio controls className="w-full" style={{ filter: 'invert(1) hue-rotate(180deg) brightness(0.8)' }}>
            <source src="/assets/hci-podcast.mp3" type="audio/mpeg" />
            Your browser does not support audio playback.
          </audio>
        </motion.div>

        {/* Bottom actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <button
            onClick={() => navigate('/master-quiz')}
            className="flex-1 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all text-sm shadow-lg shadow-violet-900/30"
          >
            🎓 Master Exam Quiz — All 40 Questions
          </button>
          <a
            href="https://notebooklm.google.com/notebook/deaa1c60-20d6-409d-b3cb-e8965da7c12c"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-4 rounded-2xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-sm text-center"
          >
            🔗 Open NotebookLM
          </a>
        </motion.div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    'not-started': { label: 'Not Started', cls: 'bg-slate-700/60 text-slate-400' },
    'in-progress': { label: 'In Progress', cls: 'bg-amber-900/40 text-amber-400' },
    complete: { label: 'Complete ✓', cls: 'bg-green-900/40 text-green-400' },
  }
  const { label, cls } = map[status] || map['not-started']
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  )
}
