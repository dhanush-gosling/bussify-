const Route = require("../models/Route");

async function findJourney(source, destination) {

    // Load all route segments
    const routes = await Route.find()
        .populate("bus")
        .populate("fromStop")
        .populate("toStop");

    // Build graph
    const graph = {};

    for (const route of routes) {

        const from = route.fromStop.stopName;
        const to = route.toStop.stopName;

        if (!graph[from])
            graph[from] = [];

        graph[from].push({

            nextStop: to,

            busId: route.bus._id,

            busNumber: route.bus.busNumber,

            distance: route.distance,

            fare: route.fare
        });

    }

    // BFS Queue
    const queue = [];

    queue.push({

        stop: source,

        path: []

    });

    const visited = new Set();

    while (queue.length > 0) {

        const current = queue.shift();

        if (current.stop === destination) {

            return current.path;

        }

        if (visited.has(current.stop))
            continue;

        visited.add(current.stop);

        const neighbours = graph[current.stop] || [];

        for (const neighbour of neighbours) {

            queue.push({

                stop: neighbour.nextStop,

                path: [

                    ...current.path,

                    {

                        busId: neighbour.busId,

                        busNumber: neighbour.busNumber,

                        source: current.stop,

                        destination: neighbour.nextStop,

                        fare: neighbour.fare,

                        distance: neighbour.distance
                    }

                ]

            });

        }

    }

    return [];

}

module.exports = {

    findJourney

};