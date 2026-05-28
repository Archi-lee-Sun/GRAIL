const {
    calculateArenaPoints
} = require('../services/wilson.service')

const {
    getCurrentChallenge,
    insertSubmission,
    getUserSubmissionsForChallenge,
    getChallengeParticipants
} = require('../queries/arena.queries')

const {
    gradeStage4
} = require('../services/ai.service')

const {
    getUserById
} = require('../queries/users.queries')


const getChallenge = async (req , res , next) => {
    try {
        const current_challenge = await getCurrentChallenge()
        res.json({current_challenge: current_challenge})
    } catch(error){
        next(error)
    }
}


const submitArena = async (req , res , next) => {
    const userId = req.user.id
    const {prompt_text} = req.body
    const {challenge_id} = req.params

    try {
        const current_challenge = await getCurrentChallenge()
        const {scenario , rubric_hints} = current_challenge
        const ai_grade = await gradeStage4(prompt_text , scenario , rubric_hints)
        const submission = await insertSubmission(userId , challenge_id , prompt_text , ai_grade.scores.clarity , ai_grade.scores.context , ai_grade.scores.specificity , ai_grade.composite_score ,ai_grade.feedback)
        res.json({result: submission})
    } catch(error){
        next(error)
    }
}

const getLeaderboard = async (req , res , next) => {
    const {challenge_id} = req.params

    try {
        let score = []
        const participants_id = await getChallengeParticipants(challenge_id)
        for(const id of participants_id){
            const submissions = await getUserSubmissionsForChallenge(id.user_id , challenge_id)
            const arena_point = calculateArenaPoints(submissions)
            const { username } = await getUserById(id.user_id)
            score.push({username , arena_point})
        }
        score.sort((a, b) => b.arena_point - a.arena_point)
        res.json({leaderBoard: score})
    } catch(error){
        next(error)
    }
}

module.exports = {
    getChallenge,
    submitArena , 
    getLeaderboard
}
