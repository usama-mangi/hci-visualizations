// SM-2 Spaced Repetition Algorithm
export function getInitialCard() {
  return {
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: new Date().toISOString().split('T')[0],
  }
}

export function calculateNextReview(card, rating) {
  // rating: 0 = Again, 1 = Hard, 2 = Easy
  let { interval, easeFactor, repetitions } = card

  if (rating === 0) {
    // Again: reset
    repetitions = 0
    interval = 1
  } else if (rating === 1) {
    // Hard: slight penalty
    easeFactor = Math.max(1.3, easeFactor - 0.15)
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 3
    } else {
      interval = Math.round(interval * 1.2)
    }
    repetitions += 1
  } else {
    // Easy
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 4
    } else {
      interval = Math.round(interval * easeFactor)
    }
    easeFactor = Math.max(1.3, easeFactor + 0.1)
    repetitions += 1
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return {
    interval,
    easeFactor,
    repetitions,
    nextReview: nextReview.toISOString().split('T')[0],
  }
}

export function isDue(card) {
  if (!card || !card.nextReview) return true
  const today = new Date().toISOString().split('T')[0]
  return card.nextReview <= today
}
