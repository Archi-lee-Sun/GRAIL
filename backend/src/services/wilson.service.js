const calculateArenaPoints = (submissions) => {
    const n = submissions.length
    if(n === 0) return 0

    const scores = submissions.map(s => s.composite_score)
    const best_composite_score = Math.max(...scores)

    const avg = scores.reduce((sum, s) => sum + s, 0) / n
    const p_hat = avg / 10
    if(p_hat === 0) return 0

    const z = 1.96
    const zSq = z * z

    const wilson = (p_hat + zSq / ( 2 * n ) - z * Math.sqrt((p_hat * (1 - p_hat)) / n + zSq / (4 * n * n))) / (1 + zSq / n)
    const arena_points = 1000 * wilson + best_composite_score * 10
    return Math.floor(arena_points)
}

module.exports = {
    calculateArenaPoints
}
