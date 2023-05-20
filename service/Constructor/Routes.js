import fs from 'fs';

const MAIN_DATA_PATH = './database/Main.json';

const readMain = () => JSON.parse(fs.readFileSync(MAIN_DATA_PATH));

const writeMain = (data) => fs.writeFileSync(MAIN_DATA_PATH, JSON.stringify(data));

const getExercises = (fields) => {
    if (!fields) {
        return readMain().exercises;
    }
    return readMain().exercises.map((data) =>
        fields.reduce((res, prop) => {
            res[prop] = data[prop];
            return res;
        }, {})
    );
}

const getExerciseById = (id) => {
    return getExercises().find((exercise) => exercise.id === id);
}

const addExercise = (data) => {
    const mainData = readMain();
    mainData.exercises.push({...data, exerciseData: []});
    writeMain(mainData);
}

const removeExercise = (id) => {
    const mainData = readMain();
    writeMain({
        ...mainData,
        exercises: mainData.exercises.filter((data) => data.id !== id)
    });
}

const updateExerciseData = (data) => {
    const mainData = readMain();
    const index = mainData.exercises.indexOf((data) => data.id);
    mainData.exercises.splice(index, 1, data)
    writeMain(mainData);
}

const getRoutes = (broadcast, log) => [{
    type: 'get',
    url: '/exercise-list',
    callback: ({send}) => {
        send(getExercises(['id', 'title']));
    }
}, {
    type: 'post',
    url: '/get-exercise',
    callback: ({data, send, sendStatus}) => {
        send(getExerciseById(data.id));
    }
}, {
    type: 'post',
    url: '/add-exercise',
    callback: ({data, send, sendStatus}) => {
        addExercise(data);
        sendStatus(200);
    }
}, {
    type: 'post',
    url: '/remove-exercise',
    callback: ({data, send, sendStatus}) => {
        removeExercise(data.id);
        sendStatus(200);
    }
}, {
    type: 'post',
    url: '/update-exercise',
    callback: ({data, send, sendStatus}) => {
        updateExerciseData(data);
        sendStatus(200);
    }
}]

export {
    getRoutes
}
