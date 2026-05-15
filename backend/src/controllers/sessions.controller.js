const {
    getLessonProgress,
    updateLessonStage,
    updateLessonStatus,
    saveTaskAttempt
} = require('../queries/sessions.queries');

const {
    getLessonBySlug,
    getLessonTasksByStage
} = require('../queries/lessons.queries');


const startSession = async (req , res , next) => {
    const {slug , stage} = req.params;
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

const checkAnswer = async (req , res , next){
    const {task_id , answer , stage} = req.params;
    const userId = req.user.id

    try {
        const task = await getTaskById(task_id);
        if(!task){
            return res.status(404).json({error : 'Task not found'})
        }

        
        if(task.stage === 2){
            const isCorrect = checkCodeAnswer(task.payload , answer);
            await saveTaskAttempt(userId , task_id , stage , answer , isCorrect , task.explanation , task.xp_reward)
            return res.json({isCorrect: isCorrect , feedback : task.explanation})
        }

        
        if(task.stage === 3 || task.stage === 4){
        // TODO: call ai.service here when ready, then saveTaskAttempt with real score + feedback
         return res.json({ feedback: 'AI grading not yet implemented' });
        }


    } catch(error){
        next(error)
    }

}

module.exports = {
    startSession,
    checkAnswer
}