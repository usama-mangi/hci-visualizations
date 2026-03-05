import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateNextReview, getInitialCard } from '../utils/sm2.js'

const useStudyStore = create(
  persist(
    (set, get) => ({
      chapterProgress: {},
      flashcardSchedules: {},
      masterQuizHistory: [],

      completeRecall(chapterId) {
        set((state) => ({
          chapterProgress: {
            ...state.chapterProgress,
            [chapterId]: {
              ...state.chapterProgress[chapterId],
              recallDone: true,
            },
          },
        }))
      },

      completeChapter(chapterId) {
        set((state) => ({
          chapterProgress: {
            ...state.chapterProgress,
            [chapterId]: {
              ...state.chapterProgress[chapterId],
              completed: true,
            },
          },
        }))
      },

      updateFlashcard(chapterId, cardIndex, rating) {
        const key = `${chapterId}-${cardIndex}`
        const state = get()
        const existing = state.flashcardSchedules[key] || getInitialCard()
        const updated = calculateNextReview(existing, rating)
        set((s) => ({
          flashcardSchedules: {
            ...s.flashcardSchedules,
            [key]: updated,
          },
          chapterProgress: {
            ...s.chapterProgress,
            [chapterId]: {
              ...s.chapterProgress[chapterId],
              flashcardsDone: (s.chapterProgress[chapterId]?.flashcardsDone || 0) + 1,
            },
          },
        }))
      },

      setQuizScore(chapterId, score) {
        set((state) => ({
          chapterProgress: {
            ...state.chapterProgress,
            [chapterId]: {
              ...state.chapterProgress[chapterId],
              quizScore: score,
            },
          },
        }))
      },

      addMasterQuizResult(result) {
        set((state) => ({
          masterQuizHistory: [...state.masterQuizHistory, result],
        }))
      },

      getOverallMastery() {
        const state = get()
        const totalChapters = 8
        let totalPoints = 0
        const maxPoints = totalChapters * 3 // recallDone + quizScore>=80 + completed = 3 points per chapter

        for (let i = 1; i <= totalChapters; i++) {
          const cp = state.chapterProgress[`ch${i}`]
          if (!cp) continue
          if (cp.recallDone) totalPoints += 1
          if (cp.quizScore >= 80) totalPoints += 1
          if (cp.completed) totalPoints += 1
        }

        return Math.round((totalPoints / maxPoints) * 100)
      },
    }),
    {
      name: 'hci-study-progress',
    }
  )
)

export default useStudyStore
