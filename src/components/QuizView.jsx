import { useState } from 'react'
import useStudyStore from '../store/useStudyStore.js'

export default function QuizView({ chapterId, questions, chapter, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [done, setDone] = useState(false)
  const setQuizScore = useStudyStore((s) => s.setQuizScore)

  const total = questions.length
  const progress = (currentIndex / total) * 100
  const q = questions[currentIndex]

  function handleSelect(optionIndex) {
    if (selected !== null) return
    setSelected(optionIndex)
    setAnswers((a) => [...a, { selected: optionIndex, correct: q.correct }])
  }

  function handleNext() {
    if (currentIndex + 1 >= total) {
      const score = Math.round(
        (answers.filter((a) => a.selected === a.correct).length / total) * 100
      )
      setQuizScore(chapterId, score)
      setDone(true)
      onComplete(score)
    } else {
      setCurrentIndex((i) => i + 1)
      setSelected(null)
    }
  }

  function handleRetry() {
    setCurrentIndex(0)
    setSelected(null)
    setAnswers([])
    setDone(false)
  }

  if (done) {
    const correctCount = answers.filter((a) => a.selected === a.correct).length
    const score = Math.round((correctCount / total) * 100)
    const color = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'
    const colorMap = {
      green: { text: 'text-green-400', bg: 'bg-green-900/40', border: 'border-green-700/50', label: '🎉 Excellent!' },
      yellow: { text: 'text-yellow-400', bg: 'bg-yellow-900/40', border: 'border-yellow-700/50', label: '👍 Good effort' },
      red: { text: 'text-red-400', bg: 'bg-red-900/40', border: 'border-red-700/50', label: '📚 Keep studying' },
    }
    const c = colorMap[color]

    return (
      <div className="max-w-xl mx-auto text-center space-y-8">
        <div>
          <div className={`text-6xl font-black ${c.text} mb-2`}>{score}%</div>
          <div className="text-xl font-bold text-white">{c.label}</div>
          <p className="text-slate-400 text-sm mt-1">
            {correctCount} of {total} questions correct
          </p>
        </div>

        <div className={`${c.bg} ${c.border} border rounded-2xl p-6`}>
          <div className="space-y-2">
            {answers.map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span>{a.selected === a.correct ? '✅' : '❌'}</span>
                <span className="text-slate-300 truncate">
                  Q{i + 1}: {questions[i].question.slice(0, 60)}...
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-slate-700 text-white hover:bg-slate-600 transition-all"
          >
            🔄 Retry
          </button>
          <button
            onClick={() => onComplete(score)}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110"
            style={{ backgroundColor: chapter.accent }}
          >
            Continue →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm font-medium">
          Question {currentIndex + 1} of {total}
        </span>
        <span className="text-slate-500 text-xs">
          {answers.filter((a) => a.selected === a.correct).length} correct so far
        </span>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: chapter.accent }}
        />
      </div>

      {/* Question */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6">
        <p className="text-white text-lg font-medium leading-relaxed">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {q.options.map((option, idx) => {
          let style = 'bg-slate-800/60 border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800'
          if (selected !== null) {
            if (idx === q.correct) {
              style = 'bg-green-900/50 border-green-500 text-green-200'
            } else if (idx === selected && selected !== q.correct) {
              style = 'bg-red-900/50 border-red-500 text-red-200'
            } else {
              style = 'bg-slate-800/30 border-slate-700/50 text-slate-500'
            }
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-5 py-4 rounded-2xl border text-sm font-medium transition-all ${style} ${
                selected === null ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
              }`}
            >
              <span className="font-bold mr-3 opacity-60">
                {String.fromCharCode(65 + idx)}.
              </span>
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

      {/* Next button */}
      {selected !== null && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 active:scale-95"
            style={{ backgroundColor: chapter.accent }}
          >
            {currentIndex + 1 >= total ? 'See Results →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  )
}
