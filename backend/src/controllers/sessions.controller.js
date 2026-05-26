const {
    getLessonProgress,
    updateLessonStage,
    updateLessonStatus,
    saveTaskAttempt ,
    getTaskAttemptsByStage,
    addXpToUser
} = require('../queries/sessions.queries');

const {
    getLessonBySlug,
    getLessonTasksByStage,
    getTaskById
} = require('../queries/lessons.queries');

const {
    gradeStage3 ,
    gradeStage4 
} = require('../services/ai.service');

const stagetasksnumbers = {
    2 : 5 ,
    3: 2 , 
    4 : 1 
}

const { 
    getDirectDependents, 
    checkAllDepsComplete 
} = require('../queries/graph.queries');

const {
    updateStreak 
} = require('../services/streak.service');


const startSession = async (req , res , next) => {
    const {slug} = req.params;
    const stage = parseInt(req.params.stage);
    const userId = req.user.id

    try {

        const lesson = await getLessonBySlug(slug, userId);
        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        const progress = await getLessonProgress(userId, lesson.id);
        if(progress.status === 'locked'){
            return res.status(403).json({ error: 'Lesson is locked' });
        }

        if(progress.current_stage !== stage){
            return res.status(403).json({error : 'mismatched stage'});
        }
        
        if(progress.status === 'unlocked'){
            await updateLessonStatus(userId, lesson.id, 'in_progress');
        }

        if(stage === 1){
            const concept_markdown = lesson.concept_markdown;
            return res.json({ concept_markdown})
        }

        const tasks = await getLessonTasksByStage(lesson.id , stage)
        return res.json({ tasks })
    } catch(error){
        next(error)
    }
}

const checkStage2Answer = (task, answer) => {
    return task.payload.correct === answer;
}

const checkAnswer = async (req , res , next) => {
    const {task_id , answer} = req.body;
    const userId = req.user.id

    try {
        const task = await getTaskById(task_id);
        if(!task){
            return res.status(404).json({error : 'Task not found'})
        }

        
        if(task.stage === 2){
            const isCorrect = checkStage2Answer(task , answer);
            await saveTaskAttempt(userId , task_id , task.stage , { answer } , isCorrect , { explanation: task.payload.explanation } , task.xp_reward)
            return res.json({isCorrect: isCorrect , feedback : { explanation: task.payload.explanation }})
        }

        
        if(task.stage === 3 || task.stage === 4){
            if(task.stage === 3){
                const gradingResult = await gradeStage3(answer, task.payload.reference_output, task.payload.scenario_context)
                await saveTaskAttempt(userId , task_id , task.stage , {answer} , gradingResult.composite_score , gradingResult.feedback , task.xp_reward)
                return res.json({passed: gradingResult.composite_score >= 7 , feedback : gradingResult.feedback , scores: gradingResult.scores , user_output: gradingResult.user_output , composite_score: gradingResult.composite_score})
            } else {
                const gradingResult = await gradeStage4(answer, task.payload.scenario, task.payload.rubric_hints)
                await saveTaskAttempt(userId , task_id , task.stage , {answer} , gradingResult.composite_score , gradingResult.feedback , task.xp_reward)
                return res.json({passed: gradingResult.composite_score >= 7 , feedback : gradingResult.feedback , scores: gradingResult.scores , user_output: gradingResult.user_output , composite_score: gradingResult.composite_score})
            }
        }
    } catch(error){
        next(error)
    }

}

const completeStage = async (req , res , next) => {
    const {slug , stage} = req.params;
    const userId = req.user.id

    try{
        const lesson = await getLessonBySlug(slug , userId)
        if(!lesson){
            return res.status(404).json({error : 'Lesson not found'})
        }

        const tasks_attempts = await getTaskAttemptsByStage(userId , lesson.id , stage)
        
        const stageInt = parseInt(stage);
        
        if(tasks_attempts.length < stagetasksnumbers[stageInt] ){
            return res.status(400).json({error : 'Not all tasks attempted'})
        }

        await updateStreak(userId);

        let totalXpEarned = 0;
        tasks_attempts.forEach(attempt => {
            totalXpEarned += attempt.xp_earned
        })
        await addXpToUser(userId , totalXpEarned)

        if(stage < 4){
            await updateLessonStage(userId , lesson.id , stageInt + 1)
        } else {
            await updateLessonStatus(userId , lesson.id , 'complete')
            const dependents = await getDirectDependents(lesson.id);
            for(const dependent of dependents){
                const allComplete = await checkAllDepsComplete(userId, dependent.lesson_id);
                if(allComplete){
                    await updateLessonStatus(userId, dependent.lesson_id, 'unlocked');
                }
            }
        }

        return res.json({
            xp_earned: totalXpEarned,
            new_stage: stageInt < 4 ? stageInt + 1 : stageInt,
            lesson_completed: stageInt === 4
        })
    }catch(error){
        next(error)
    }
}

module.exports = {
    startSession,
    checkAnswer,
    completeStage
}
 