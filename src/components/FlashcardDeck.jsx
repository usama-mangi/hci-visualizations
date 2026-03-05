import { useState, useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import useStudyStore from '../store/useStudyStore.js'

export default function FlashcardDeck({ chapterId, cards, chapter, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [rated, setRated] = useState(false)
  const [done, setDone] = useState(false)
  const [ratings, setRatings] = useState([])
  const updateFlashcard = useStudyStore((s) => s.updateFlashcard)

  const total = cards.length
  const progress = (currentIndex / total) * 100

  const flip = useCallback(() => {
    if (!done) setIsFlipped((f) => !f)
  }, [done])

  const rate = useCallback(
    (rating) => {
      if (!isFlipped || rated) return
      updateFlashcard(chapterId, currentIndex, rating)
      setRatings((r) => [...r, rating])
      setRated(true)

      setTimeout(() => {
        if (currentIndex + 1 >= total) {
          setDone(true)
        } else {
          setCurrentIndex((i) => i + 1)
          setIsFlipped(false)
          setRated(false)
        }
      }, 400)
    },
    [isFlipped, rated, currentIndex, total, chapterId, updateFlashcard]
  )

  useHotkeys('space', (e) => { e.preventDefault(); flip() }, [flip])
  useHotkeys('1', () => rate(0), [rate])
  useHotkeys('2', () => rate(1), [rate])
  useHotkeys('3', () => rate(2), [rate])

  if (done) {
    const easyCount = ratings.filter((r) => r === 2).length
    const hardCount = ratings.filter((r) => r === 1).length
    const againCount = ratings.filter((r) => r === 0).length
    return (
      <div className="max-w-xl mx-auto text-center space-y-8">
        <div className="text-6xl">🎉</div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Deck Complete!</h2>
          <p className="text-slate-400">You reviewed all {total} flashcards</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-900/40 border border-green-700/50 rounded-2xl p-4">
            <div className="text-2xl font-bold text-green-400">{easyCount}</div>
            <div className="text-green-300 text-sm mt-1">Easy ✅</div>
          </div>
          <div className="bg-yellow-900/40 border border-yellow-700/50 rounded-2xl p-4">
            <div className="text-2xl font-bold text-yellow-400">{hardCount}</div>
            <div className="text-yellow-300 text-sm mt-1">Hard 😅</div>
          </div>
          <div className="bg-red-900/40 border border-red-700/50 rounded-2xl p-4">
            <div className="text-2xl font-bold text-red-400">{againCount}</div>
            <div className="text-red-300 text-sm mt-1">Again 🔁</div>
          </div>
        </div>
        <button
          onClick={onComplete}
          className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:brightness-110 active:scale-95"
          style={{ backgroundColor: chapter.accent }}
        >
          Continue to Quiz →
        </button>
      </div>
    )
  }

  const card = cards[currentIndex]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm font-medium">
          Card {currentIndex + 1} of {total}
        </span>
        <span className="text-slate-500 text-xs">
          Space = flip • 1=Again • 2=Hard • 3=Easy
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: chapter.accent }}
        />
      </div>

      {/* Flip card */}
      <div
        className="card-flip-container w-full cursor-pointer select-none"
        style={{ height: '280px' }}
        onClick={flip}
      >
        <div className={`card-inner w-full h-full ${isFlipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="card-front bg-slate-800 border border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center">
            <div
              className="text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
              style={{ color: chapter.accent, backgroundColor: `${chapter.accent}20` }}
            >
              Question
            </div>
            <p className="text-white text-lg font-medium text-center leading-relaxed">
              {card.question}
            </p>
            <p className="text-slate-500 text-xs mt-6">Click to reveal answer</p>
          </div>

          {/* Back */}
          <div
            className="card-back bg-slate-900 rounded-3xl p-8 flex flex-col items-center justify-center border"
            style={{
              borderColor: `${chapter.accent}60`,
            }}
          >
            <div
              className="text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
              style={{ color: chapter.accent, backgroundColor: `${chapter.accent}30` }}
            >
              Answer
            </div>
            <p className="text-slate-100 text-base text-center leading-relaxed whitespace-pre-line">
              {card.answer}
            </p>
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      <div
        className={`grid grid-cols-3 gap-3 transition-all duration-300 ${
          isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <button
          onClick={() => rate(0)}
          disabled={rated}
          className="py-3 px-4 rounded-xl font-semibold text-sm bg-red-900/50 border border-red-700/50 text-red-300 hover:bg-red-800/60 transition-all active:scale-95 disabled:opacity-40"
        >
          🔁 Again <span className="text-xs opacity-60 ml-1">[1]</span>
        </button>
        <button
          onClick={() => rate(1)}
          disabled={rated}
          className="py-3 px-4 rounded-xl font-semibold text-sm bg-yellow-900/50 border border-yellow-700/50 text-yellow-300 hover:bg-yellow-800/60 transition-all active:scale-95 disabled:opacity-40"
        >
          😅 Hard <span className="text-xs opacity-60 ml-1">[2]</span>
        </button>
        <button
          onClick={() => rate(2)}
          disabled={rated}
          className="py-3 px-4 rounded-xl font-semibold text-sm bg-green-900/50 border border-green-700/50 text-green-300 hover:bg-green-800/60 transition-all active:scale-95 disabled:opacity-40"
        >
          ✅ Easy <span className="text-xs opacity-60 ml-1">[3]</span>
        </button>
      </div>

      {!isFlipped && (
        <p className="text-center text-slate-500 text-xs">
          Click the card (or press Space) to reveal the answer
        </p>
      )}
    </div>
  )
}
