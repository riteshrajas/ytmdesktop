const API_ROUTES = {
	TRACK_CURRENT: "api/track",
	TRACK_CURRENT_STATE: "api/track/state",
	TRACK_LIKE: "api/track/like",
	TRACK_DISLIKE: "api/track/dislike",
	TRACK_ACCENT: "api/track/accent",
	TRACK_CONTROL_NEXT: "api/track/next",
	TRACK_CONTROL_PREV: "api/track/prev",
	TRACK_CONTROL_FORWARD: "api/track/forward",
	TRACK_CONTROL_BACKWARD: "api/track/backward",
	TRACK_CONTROL_PLAY: "api/track/play",
	TRACK_CONTROL_SEEK: "api/track/seek",
	TRACK_CONTROL_PAUSE: "api/track/pause",
	TRACK_CONTROL_TOGGLE_PLAY: "api/track/toggle-play-state",
	TRACK_CONTROL_REPEAT: "api/track/repeat",
	TRACK_CONTROL_SHUFFLE: "api/track/shuffle",
	TRACK_SOCKET: "api/socket",
} as const;

function getRoutesOriginal() {
	return Object.values(API_ROUTES).map((x) => x.replace(/^\/?api\//, ""));
}

const cachedRoutes = Object.values(API_ROUTES).map((x) => x.replace(/^\/?api\//, ""));
function getRoutesOptimized() {
	return cachedRoutes;
}

const ITERATIONS = 1_000_000;

console.log(`Running benchmark with ${ITERATIONS} iterations...`);

console.time("Original");
for (let i = 0; i < ITERATIONS; i++) {
	getRoutesOriginal();
}
console.timeEnd("Original");

console.time("Optimized");
for (let i = 0; i < ITERATIONS; i++) {
	getRoutesOptimized();
}
console.timeEnd("Optimized");
