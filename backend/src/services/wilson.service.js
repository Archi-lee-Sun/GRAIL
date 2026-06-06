const calculateArenaPoints = (submissions) => {
    const n = submissions.length
    if(n === 0) return 0

    const scores = submissions
        .map(submission => Number(submission.composite_score))
        .filter(Number.isFinite)
    if(scores.length === 0) return 0

    const scoreCount = scores.length
    const best_composite_score = Math.max(...scores)

    const avg = scores.reduce((sum, score) => sum + score, 0) / scoreCount
    const p_hat = avg / 10
    if(p_hat === 0) return 0

    const z = 1.96
    const zSq = z * z

    const wilson = (p_hat + zSq / ( 2 * scoreCount ) - z * Math.sqrt((p_hat * (1 - p_hat)) / scoreCount + zSq / (4 * scoreCount * scoreCount))) / (1 + zSq / scoreCount)
    const arena_points = 1000 * wilson + best_composite_score * 10
    return Math.floor(arena_points)
}

module.exports = {
    calculateArenaPoints
}
