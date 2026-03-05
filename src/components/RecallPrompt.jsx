import { useState, useEffect, useRef } from 'react'
import useStudyStore from '../store/useStudyStore.js'

export default function RecallPrompt({ chapter, onComplete }) {
  const [text, setText] = useState('')
  const [timeLeft, setTimeLeft] = useState(120)
  const [revealed, setRevealed] = useState(false)
  const completeRecall = useStudyStore((s) => s.completeRecall)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (revealed) return
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current)
          handleReveal()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [revealed])

  function handleReveal() {
    clearInterval(intervalRef.current)
    setRevealed(true)
    completeRecall(chapter.id)
    onComplete()
  }

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const seconds = String(timeLeft % 60).padStart(2, '0')
  const progress = ((120 - timeLeft) / 120) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-white">Brain Dump 🧠</h2>
        <p className="text-slate-400 text-sm">
          Before studying, write EVERYTHING you already know about this topic.
          No peeking!
        </p>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-between bg-slate-800/60 rounded-2xl px-6 py-4 border border-slate-700">
        <span className="text-slate-400 text-sm font-medium">Time remaining</span>
        <span
          className={`text-3xl font-mono font-bold tabular-nums ${
            timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-white'
          }`}
        >
          {minutes}:{seconds}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${progress}%`,
            backgroundColor: chapter.accent,
          }}
        />
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Write everything you know about "${chapter.title}"...\n\nDon't worry about structure — just brain dump everything! Key terms, concepts, how things relate...`}
        className="w-full h-56 bg-slate-800/60 border border-slate-700 rounded-2xl p-5 text-slate-100 placeholder-slate-500 text-sm leading-relaxed resize-none focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all"
      />

      {/* Word count */}
      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-xs">
          {text.trim().split(/\s+/).filter(Boolean).length} words written
        </span>
        <button
          onClick={handleReveal}
          className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:brightness-110 active:scale-95"
          style={{ backgroundColor: chapter.accent }}
        >
          Reveal Content →
        </button>
      </div>

      <p className="text-center text-slate-500 text-xs">
        Timer will auto-advance after 2 minutes • Press "Reveal Content" to skip
      </p>
    </div>
  )
}
