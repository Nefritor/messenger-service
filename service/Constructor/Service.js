const serviceList = [{
    id: 'constructor',
    tables: [{
        id: 'Exercises',
        methods: [{
            id: 'getList',
            handler: () => {}
        }]
    }]
}]

const getService = (serviceName) => {
    return serviceList.find((id) => serviceName.id === id);
}

const callback = ({data, send, sendStatus}) => {
    if (!data.service) {
        return sendStatus(404);
    }
    const service = getService(data.service);
}
