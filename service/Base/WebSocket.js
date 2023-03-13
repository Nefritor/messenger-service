export const getBroadcaster = (wss) =>
    (data, selector) => {
        wss.clients.forEach((client) => {
            if (!selector || selector(client)) {
                client.send(JSON.stringify(data));
            }
        })
    }