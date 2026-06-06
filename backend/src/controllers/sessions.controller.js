const {
    getLessonProgress,
    updateLessonStage,
    updateLessonStatus,
    saveTaskAttempt ,
    updateTaskAttemptScore,
    getTaskAttemptsByStage,
    addXpToUser,
    getExistingAttempt
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

const {
    updateSRS
} = require('../services/srs.service');

const {
    unlockVaultEntries
} = require('../queries/vault.queries');

const STAGE_34_PASS_THRESHOLD = 5.0;

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

        const isReplayingCompletedStage = progress.status === 'complete' || progress.current_stage > stage;

        if(!isReplayingCompletedStage && progress.current_stage !== stage){
            return res.status(403).json({error : 'mismatched stage'});
        }
        
        if(!isReplayingCompletedStage && progress.status === 'unlocked'){
            await updateLessonStatus(userId, lesson.id, 'in_progress');
        }

        if(stage === 1){
            const concept_markdown = lesson.concept_markdown;
            return res.json({ concept_markdown})
        }

        if(stage === 3 || stage === 4){
            const tasks = await getLessonTasksByStage(lesson.id, stage);
            const existingAttempts = await getTaskAttemptsByStage(userId, lesson.id, stage);
            const passedTaskIds = existingAttempts
                .filter(a => Number(a.score) >= STAGE_34_PASS_THRESHOLD)
                .map(a => a.task_id);
            const tasksWithStatus = tasks.map(task => ({
                ...task,
                already_passed: passedTaskIds.includes(task.id)
            }));

            return res.json({ tasks: tasksWithStatus });
        }

        const tasks = await getLessonTasksByStage(lesson.id , stage)
        return res.json({ tasks })
    } catch(error){
        next(error)
    }
}

const checkStage2Answer = (task, answer) => {
    switch(task.task_type) {
        case 'which_better':
        case 'true_false':
            return task.payload.correct === answer;
        case 'fill_blank':
            return task.payload.correct_index === answer;
        case 'whats_wrong':
            return task.payload.correct_index === answer;
        case 'rank':
            return JSON.stringify(task.payload.correct_order) === JSON.stringify(answer.map(Number));
    }
}

const checkAnswer = async (req , res , next) => {
    const {task_id , answer} = req.body;
    const userId = req.user.id

    try {
        const task = await getTaskById(task_id);
        if(!task){
            return res.status(404).json({error : 'Task not found'})
        }

        const existing = await getExistingAttempt(userId, task_id);
        if (existing) {
            if(task.stage === 2){
                const isCorrect = checkStage2Answer(task, answer);
                await updateTaskAttemptScore(task_id, userId, isCorrect ? 1 : 0, { explanation: task.payload.explanation });
                return res.json({ isCorrect, feedback: { explanation: task.payload.explanation }, practice: true });
            }
            if(task.stage === 3 || task.stage === 4){
                const gradingResult = task.stage === 3
                    ? await gradeStage3(answer, task.payload.reference_output, task.payload.scenario_context)
                    : await gradeStage4(answer, task.payload.scenario, task.payload.rubric_hints);

                await updateTaskAttemptScore(task_id, userId, gradingResult.composite_score, gradingResult.feedback);

                return res.json({
                    passed: gradingResult.composite_score >= STAGE_34_PASS_THRESHOLD,
                    feedback: gradingResult.feedback,
                    scores: gradingResult.scores,
                    user_output: gradingResult.user_output,
                    composite_score: gradingResult.composite_score,
                    practice: true
                });
            }
        }

        
        if(task.stage === 2){
            const isCorrect = checkStage2Answer(task , answer);
            await saveTaskAttempt(userId , task_id , task.stage , { answer } , isCorrect ? 1 : 0 , { explanation: task.payload.explanation } , task.xp_reward)
            return res.json({isCorrect: isCorrect , feedback : { explanation: task.payload.explanation }})
        }

        
        if(task.stage === 3 || task.stage === 4){
            if(task.stage === 3){
                const gradingResult = await gradeStage3(answer, task.payload.reference_output, task.payload.scenario_context)
                await saveTaskAttempt(userId , task_id , task.stage , {answer} , gradingResult.composite_score , gradingResult.feedback , task.xp_reward)
                return res.json({passed: gradingResult.composite_score >= STAGE_34_PASS_THRESHOLD , feedback : gradingResult.feedback , scores: gradingResult.scores , user_output: gradingResult.user_output , composite_score: gradingResult.composite_score})
            } else {
                const gradingResult = await gradeStage4(answer, task.payload.scenario, task.payload.rubric_hints)
                await saveTaskAttempt(userId , task_id , task.stage , {answer} , gradingResult.composite_score , gradingResult.feedback , task.xp_reward)
                return res.json({passed: gradingResult.composite_score >= STAGE_34_PASS_THRESHOLD , feedback : gradingResult.feedback , scores: gradingResult.scores , user_output: gradingResult.user_output , composite_score: gradingResult.composite_score})
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

        const stageInt = parseInt(stage);

        const progress = await getLessonProgress(userId, lesson.id);
        if (progress.status === 'complete') {
            return res.status(400).json({ error: 'Lesson already completed' });
        }

        if (progress.current_stage !== stageInt) {
            return res.status(400).json({ error: 'Stage already completed' });
        }

        const tasks_attempts = await getTaskAttemptsByStage(userId , lesson.id , stageInt)
        
        if(tasks_attempts.length < stagetasksnumbers[stageInt] ){
            return res.status(400).json({error : 'Not all tasks attempted'})
        }

        if (stageInt === 2) {
            const requiredPassed = Math.ceil(stagetasksnumbers[2] * 0.8); 

            const stage2PassedAttempts = tasks_attempts.filter(
                attempt => Number(attempt.score) === 1
            );

            if (stage2PassedAttempts.length < requiredPassed) {
                return res.status(400).json({
                    error: `You need at least ${requiredPassed} correct answers to complete this stage. You have ${stage2PassedAttempts.length}.`
                });
            }
        } else {
            const passedAttempts = tasks_attempts.filter(
                attempt => Number(attempt.score) >= STAGE_34_PASS_THRESHOLD
            );

            if(passedAttempts.length < stagetasksnumbers[stageInt]){
                return res.status(400).json({
                    error: `You must pass all tasks with a score of at least ${STAGE_34_PASS_THRESHOLD} to complete this stage. You have ${passedAttempts.length}.`
                });
            }
        }

        await updateStreak(userId);

        let totalXpEarned = 0;
        tasks_attempts.forEach(attempt => {
            totalXpEarned += attempt.xp_earned
        })
        await addXpToUser(userId , totalXpEarned)

        if(stageInt < 4){
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

            await unlockVaultEntries(userId, lesson.id);
            await updateSRS(userId, lesson.id, 3);
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
 
