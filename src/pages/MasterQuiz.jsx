import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import useStudyStore from '../store/useStudyStore.js'
import { chapters } from '../data/chapters.js'

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuestions() {
  const all = []
  chapters.forEach((ch) => {
    ch.quiz.forEach((q) => {
      all.push({ ...q, chapterId: ch.id, chapterTitle: ch.title, chapterAccent: ch.accent, chapterIcon: ch.icon })
    })
  })
  return shuffleArray(all)
}

const EXAM_DURATION = 40 * 60 // 40 minutes in seconds

export default function MasterQuiz() {
  const navigate = useNavigate()
  const addMasterQuizResult = useStudyStore((s) => s.addMasterQuizResult)

  const [questions] = useState(() => buildQuestions())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [done, setDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (done) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current)
          finishQuiz()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [done])

  const finishQuiz = useCallback(() => {
    const correctCount = answers.filter((a) => a.selected === a.correct).length
    const score = Math.round((correctCount / questions.length) * 100)

    // breakdown by chapter
    const topicBreakdown = {}
    chapters.forEach((ch) => {
      const chAnswers = answers.filter((a) => a.chapterId === ch.id)
      const chCorrect = chAnswers.filter((a) => a.selected === a.correct).length
      topicBreakdown[ch.id] = { title: ch.title, score: chAnswers.length > 0 ? Math.round((chCorrect / chAnswers.length) * 100) : null, total: chAnswers.length }
    })

    addMasterQuizResult({ score, total: questions.length, date: new Date().toISOString(), topicBreakdown })

    if (score >= 80) {
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } })
    }
    setDone(true)
  }, [answers, questions])

  function handleSelect(optionIndex) {
    if (selected !== null) return
    setSelected(optionIndex)
    const q = questions[currentIndex]
    setAnswers((a) => [
      ...a,
      { selected: optionIndex, correct: q.correct, chapterId: q.chapterId },
    ])
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      finishQuiz()
    } else {
      setCurrentIndex((i) => i + 1)
      setSelected(null)
    }
  }

  const timerHours = String(Math.floor(timeLeft / 3600)).padStart(2, '0')
  const timerMins = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0')
  const timerSecs = String(timeLeft % 60).padStart(2, '0')
  const timerColor = timeLeft < 300 ? 'text-red-400 animate-pulse' : timeLeft < 600 ? 'text-yellow-400' : 'text-white'

  if (done) {
    return <ResultsScreen answers={answers} questions={questions} navigate={navigate} />
  }

  const q = questions[currentIndex]
  const progress = (currentIndex / questions.length) * 100

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0f0f1a]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            ← Dashboard
          </button>

          <div className="text-center">
            <div className="text-xs text-slate-500 font-medium">Question {currentIndex + 1} / {questions.length}</div>
          </div>

          <div className={`font-mono text-xl font-bold tabular-nums ${timerColor}`}>
            {timerHours}:{timerMins}:{timerSecs}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-800">
          <div
            className="h-full bg-violet-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white">🎓 Master Exam Quiz</h1>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
            {q.chapterIcon} {q.chapterTitle}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Question */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6">
              <p className="text-white text-lg font-medium leading-relaxed">{q.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((option, idx) => {
                let cls = 'bg-slate-800/60 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800'
                if (selected !== null) {
                  if (idx === q.correct) cls = 'bg-green-900/50 border-green-500 text-green-200'
                  else if (idx === selected && selected !== q.correct) cls = 'bg-red-900/50 border-red-500 text-red-200'
                  else cls = 'bg-slate-800/30 border-slate-700/50 text-slate-500'
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border text-sm font-medium transition-all ${cls} ${selected === null ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'}`}
                  >
                    <span className="font-bold mr-3 opacity-60">{String.fromCharCode(65 + idx)}.</span>
                    {option}
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            {selected !== null && (
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-2xl p-5 text-sm">
                <div className="font-semibold text-blue-300 mb-1">
                  {selected === q.correct ? '✅ Correct!' : '❌ Incorrect'}
                </div>
                <p className="text-blue-200/80 leading-relaxed">{q.explanation}</p>
              </div>
            )}

            {selected !== null && (
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-violet-600 hover:bg-violet-500 transition-all"
                >
                  {currentIndex + 1 >= questions.length ? 'See Results →' : 'Next →'}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function ResultsScreen({ answers, questions, navigate }) {
  const correctCount = answers.filter((a) => a.selected === a.correct).length
  const score = Math.round((correctCount / questions.length) * 100)
  const color = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'
  const colorMap = {
    green: { text: 'text-green-400', label: '🎉 Exam Ready!' },
    yellow: { text: 'text-yellow-400', label: '📚 Getting There!' },
    red: { text: 'text-red-400', label: '💪 Keep Studying!' },
  }
  const c = colorMap[color]

  // Chapter breakdown
  const breakdown = chapters.map((ch) => {
    const chQs = questions.filter((q) => q.chapterId === ch.id)
    const chAnswers = answers.filter((a) => a.chapterId === ch.id)
    const chCorrect = chAnswers.filter((a) => a.selected === a.correct).length
    const pct = chAnswers.length > 0 ? Math.round((chCorrect / chAnswers.length) * 100) : 0
    return { ...ch, correct: chCorrect, total: chQs.length, pct }
  })

  return (
    <div className="min-h-screen bg-[#0f0f1a] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className={`text-7xl font-black tabular-nums ${c.text}`}>{score}%</div>
          <div className="text-2xl font-bold text-white">{c.label}</div>
          <p className="text-slate-400">
            {correctCount} of {questions.length} questions correct
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
            Chapter Breakdown
          </h2>
          {breakdown.map((ch) => {
            const pctColor = ch.pct >= 80 ? '#22c55e' : ch.pct >= 60 ? '#f59e0b' : '#ef4444'
            return (
              <div
                key={ch.id}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{ch.icon}</span>
                    <span className="text-sm font-medium text-slate-200 truncate">{ch.title}</span>
                  </div>
                  <span className="font-bold text-sm tabular-nums" style={{ color: pctColor }}>
                    {ch.pct}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ch.pct}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: pctColor }}
                  />
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  {ch.correct}/{ch.total} correct
                  {ch.pct < 60 && ' — ⚠️ Needs review'}
                </p>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-sm"
          >
            ← Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-500 transition-all text-sm"
          >
            🔄 Retry Quiz
          </button>
        </div>
      </div>
    </div>
  )
}
