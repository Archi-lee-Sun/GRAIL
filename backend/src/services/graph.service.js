const { 
    getAllDependencies,
    getCompletedLessons
} = require('../queries/graph.queries');


const buildGraph = (dependencies) => {
    const graph = {}

    for (const edge of dependencies) {

        const parent = edge.depends_on_id
        const child = edge.lesson_id

        if(!graph[parent]){
            graph[parent] = []
        }
        graph[parent].push(child)
    }

    return graph
}


const getLearningPath = async (userId, targetLessonId) => {
    const dependencies = await getAllDependencies();
    const completedLessons = await getCompletedLessons(userId);
    const graph = buildGraph(dependencies);
    const queue = []
    const visited = new Set();
    const prev = {}
    const path = []
    for (const lesson of completedLessons){
        queue.push(lesson.lesson_id)
        visited.add(lesson.lesson_id)
    }
    
    while(queue.length > 0){
        const current = queue.shift()

        if(current === targetLessonId){
            let node = current
            while(node !== undefined){
                path.push(node)
                node = prev[node]
            }
            return path.reverse()
        }

        for(const neighbour of graph[current] || []){
            if(!visited.has(neighbour)){
                queue.push(neighbour)
                visited.add(neighbour)
                prev[neighbour] = current
            }
        }
    }

    return null
}

module.exports =  {
    getLearningPath
}
