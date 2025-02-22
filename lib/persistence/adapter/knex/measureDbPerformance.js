"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = __importDefault(require("../../../log"));
const speedLog = log_1.default.color("#35feff");
function measureDbPerformance(db) {
    if (process.env.PERFORMANCE_LOGGING !== "true")
        return;
    // The map used to store the query times, where the query unique
    // identifier is the key.
    const times = {};
    // Used for keeping track of the order queries are executed.
    let count = 0;
    const printQueryWithTime = (uid) => {
        const { startTime, endTime, query } = times[uid];
        const elapsedTime = endTime - startTime;
        // I print the sql generated for a given query, as well as
        // the bindings for the queries.
        log_1.default.log(query.sql, ",", `[${query.bindings ? query.bindings.join(",") : ""}]`);
        const time = `${elapsedTime}ms`;
        speedLog(`Query response time: ${log_1.default.highlight(time)}\n`);
        // After I print out the query, I have no more use to it,
        // so I delete it from my map so it doesn't grow out of control.
        delete times[uid];
    };
    const printIfPossible = (uid) => {
        const { position } = times[uid];
        // Look of a query with a position one less than the current query
        const previousTimeUid = Object.keys(times).find(key => times[key].position === position - 1);
        // If we didn't find it, it must have been printed already and we can safely print ourselves.
        if (!previousTimeUid) {
            printQueryWithTime(uid);
        }
    };
    const printQueriesAfterGivenPosition = (position) => {
        // Look for the next query in the queue
        const nextTimeUid = Object.keys(times).find(key => times[key].position === position + 1);
        // If we find one and it is marked as finished, we can go ahead and print it
        if (nextTimeUid && times[nextTimeUid].finished) {
            const nextPosition = times[nextTimeUid].position;
            printQueryWithTime(nextTimeUid);
            // There might be more queries that need to printed, so we should keep looking...
            printQueriesAfterGivenPosition(nextPosition);
        }
    };
    db.on("query", (query) => {
        const uid = query.__knexQueryUid;
        times[uid] = {
            position: count,
            query,
            startTime: Date.now(),
            // I keep track of when a query is finished with a boolean instead of
            // presence of an end time. It makes the logic easier to read.
            finished: false
        };
        count = count + 1;
    }).on("query-response", (response, query) => {
        const uid = query.__knexQueryUid;
        times[uid].endTime = Date.now();
        times[uid].finished = true;
        const position = times[uid].position;
        // Print the current query, if I'm able
        printIfPossible(uid);
        // Check to see if queries further down the queue can be executed,
        // in case they weren't able to be printed when they first responded.
        printQueriesAfterGivenPosition(position);
    });
}
exports.default = measureDbPerformance;
//# sourceMappingURL=measureDbPerformance.js.map