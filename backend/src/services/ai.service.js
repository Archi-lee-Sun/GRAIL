const Groq = require('groq-sdk');
const { MOCK_AI } = require('../config/constants');
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

const mockStage3Result = {
    user_output: "This is a mock generated output from user's prompt.",
    scores: { coverage: 7, depth: 8, structure: 6 },
    feedback: {
        coverage: "Mock: You covered the main points.",
        depth: "Mock: Good detail overall.",
        structure: "Mock: Structure could be improved."
    },
    composite_score: 7.15
}

const mockStage4Result = {
    user_output: "This is a mock generated output from user's prompt.",
    scores: { clarity: 8, context: 6, specificity: 7 },
    feedback: {
        clarity: "Mock: Your prompt is clear.",
        context: "Mock: Missing some background information.",
        specificity: "Mock: Could be more specific."
    },
    composite_score: 7.1
}

const gradeStage3 = async (userPrompt, referenceOutput, scenarioContext) => {
    if(MOCK_AI){
        return mockStage3Result;
    }

    try {

        const runPromptResponse = await groqClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {role : "system" , content: 'You are a helpful assistant. Complete the task given to you'},
                {role : "user" , content : `Scenario: ${scenarioContext}\n\nPrompt: ${userPrompt}`}
            ]
        })

        const userOutput = runPromptResponse.choices[0].message.content;

        const gradingPrompt = `
            You are a strict prompt engineering evaluator. Your job is to compare a user's generated output against a reference output and judge how well the user's prompt performed.

            You must score the user output on three dimensions:
            - coverage (0-10): How completely did the output address all key points from the reference?
            - depth (0-10): How detailed and thorough is the output compared to the reference?
            - structure (0-10): How well organized and formatted is the output compared to the reference?

            Be strict. A score of 8+ should only be given for truly excellent output. Average output should score 5-6. Poor output should score below 4.

            Reference output:
            ${referenceOutput}

            User's output:
            ${userOutput}

            Respond in JSON only. No preamble, no explanation outside the JSON. Exactly this shape:
            {
                "scores": {
                    "coverage": <number>,
                    "depth": <number>,
                    "structure": <number>
                },
                "feedback": {
                    "coverage": "<specific actionable feedback>",
                    "depth": "<specific actionable feedback>",
                    "structure": "<specific actionable feedback>"
                }
            }
        `;

        const gradingResponse = await groqClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {role : "system" , content : gradingPrompt},
                {role : "user" , content : `Reference output: ${referenceOutput}\n\nUser output: ${userOutput}`}
            ]
        })

        let gradingContent;
        try {
            const rawText = gradingResponse.choices[0].message.content;
            let cleaned = rawText.trim();
            if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
            }
            gradingContent = JSON.parse(cleaned);
        } catch(err) {
            const rawText = gradingResponse.choices[0]?.message?.content || '';
            console.error('JSON parse failed. Raw response:', rawText);
            throw new Error('AI returned invalid JSON: ' + rawText.substring(0, 200));
        }
        const composite = gradingContent.scores.coverage * 0.4 + gradingContent.scores.depth * 0.35 + gradingContent.scores.structure * 0.25;

        return {
            user_output: userOutput,
            scores: gradingContent.scores,
            feedback: gradingContent.feedback,
            composite_score: parseFloat(composite.toFixed(2))
        }

    } catch(error) {
        console.error("Error grading Stage 3:", error);
        throw error;
    }
}

const gradeStage4 = async (userPrompt, scenario, rubricHints) => {
    if(MOCK_AI) return mockStage4Result;
    
    try {
        const runPromptSystem = `You are a helpful AI assistant. Your job is to complete the task given to you as accurately and thoroughly as possible. Follow the instructions in the user's prompt precisely.`;
        const runPromptResponse = await groqClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages : [
                {role : "system" , content : runPromptSystem},
                {role : "user" , content : `prompt : ${userPrompt}`}
            ]
        })
        const userOutput = runPromptResponse.choices[0].message.content;

        const gradingPrompt = `
            You are a strict prompt engineering expert and educator. Your job is to evaluate the quality of a prompt written by a student learning prompt engineering.

            You will receive:
            - The original scenario/task the student was given
            - The student's prompt they wrote
            - The actual output their prompt generated

            Evaluate the student's prompt on three dimensions:
            - clarity (0-10): Is the prompt clear and unambiguous? Would any AI understand exactly what is being asked without guessing?
            - context (0-10): Does the prompt provide sufficient background, role, audience, and situational information needed to complete the task well?
            - specificity (0-10): Does the prompt specify format, tone, length, constraints, and edge cases needed to get a precise and useful output?

            Strict grading rules:
            - 9-10: Exceptional. Near perfect prompt, nothing meaningful to improve
            - 7-8: Good. Clear intent, minor improvements possible
            - 5-6: Average. Gets the job done but missing important details
            - 3-4: Weak. Vague, missing context, output is generic
            - 0-2: Poor. Prompt is too generic to produce useful output

            Scenario the student was given:
            ${scenario}

            Student's prompt:
            ${userPrompt}

            Output the prompt generated:
            ${userOutput}

            Rubric hints:
            ${rubricHints}

            Scores must vary based on the actual quality of the student's prompt and generated output. Do not reuse default scores. Penalize missing context, vague instructions, weak constraints, and generic output.

            Respond ONLY with a JSON object. No explanation, no markdown, no extra text.
            Format:
            {
                "clarity": <0-10>,
                "context": <0-10>,
                "specificity": <0-10>,
                "feedback": {
                    "clarity": "<specific actionable feedback telling student exactly what to improve>",
                    "context": "<specific actionable feedback>",
                    "specificity": "<specific actionable feedback>"
                }
            }
        `;

        const gradingResponse = await groqClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages : [
                {role : "system" , content : gradingPrompt},
                {role : "user" , content : `Scenario: ${scenario}\n\nStudent's prompt: ${userPrompt}\n\nOutput generated: ${userOutput}\n\nRubric hints: ${rubricHints}`}
            ]
        })

        let gradingContent; 
        try {
            const rawText = gradingResponse.choices[0].message.content;
            let cleaned = rawText.trim();
            if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
            }
            gradingContent = JSON.parse(cleaned);
        } catch(err) {
            const rawText = gradingResponse.choices[0]?.message?.content || '';
            console.error('JSON parse failed. Raw response:', rawText);
            throw new Error('AI returned invalid JSON: ' + rawText.substring(0, 200));
        }

        if (!gradingContent.scores) {
            gradingContent = {
                scores: {
                    clarity: gradingContent.clarity,
                    context: gradingContent.context,
                    specificity: gradingContent.specificity
                },
                feedback: gradingContent.feedback
            };
        }

        const composite = gradingContent.scores.clarity * 0.4 + gradingContent.scores.context * 0.35 + gradingContent.scores.specificity * 0.25;

        return {
            user_output: userOutput,
            scores: gradingContent.scores,
            feedback: gradingContent.feedback,
            composite_score: parseFloat(composite.toFixed(2))
        }
            
    } catch(error) {
        console.error("Error grading Stage 4:", error);
        throw error
    }
}

module.exports = { 
    gradeStage3 , 
    gradeStage4 
}
