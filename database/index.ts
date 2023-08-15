import Database from "bun:sqlite";
import names from "./names.json";

// Types should also be defined in a separate file in most cases
type Routes = { [key: string]: Array<string> };

/**
 * These should really be in an independent util/helpers
 * or integrated into object types in a larger project
 */
const randomIntInRange = (max: number, min = 0) =>
  Math.floor(Math.random() * (max - min) + min);

const shuffleArray = (array: Array<unknown>) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const db = new Database("/generated/db.sqlite");

/**
 * For this much sql you should really use an actual .sql file
 * but for a small test task this is fine
 */

db.run(`
DROP TABLE IF EXISTS stop;
DROP TABLE IF EXISTS route;
DROP TABLE IF EXISTS route_stop;
`);

db.run(`
CREATE TABLE IF NOT EXISTS stop(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name CHAR(100) NULL,
	UNIQUE(name)
)`);

db.run(`
CREATE TABLE IF NOT EXISTS route(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name CHAR(100) NULL,
	UNIQUE(name)
)`);

db.run(`
CREATE TABLE IF NOT EXISTS route_stop(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	sort_order INTEGER NULL,
	route_id INTEGER NOT NULL,
	stop_id INTEGER NOT NULL,
	FOREIGN KEY(route_id) REFERENCES route(id),
	FOREIGN KEY(stop_id) REFERENCES stop(id)
)
`);

// Generate stops
const selected_stops = new Set<string>();
while (selected_stops.size < 100) {
  selected_stops.add(names[randomIntInRange(names.length)]);
}

// Generate routes
const routes: Routes = {};
for (let i = 0; i < 15; i++) {
  const stops = Array.from(selected_stops);
  shuffleArray(stops);
  const selected = stops.slice(0, randomIntInRange(12, 5));
  const first = selected[0];
  const last = selected[selected.length - 1];
  routes[`${first} to ${last}`] = Array.from(selected); // Make a copy of the array
  selected.reverse();
  routes[`${last} to ${first}`] = selected;
}

// Create the stops db generator
const insertStop = db.prepare("INSERT INTO stop (name) VALUES ($stop)");
const insertStops = db.transaction((stops) => {
  for (const $stop of stops) insertStop.run({ $stop });
});

// Create the routes db generator
const insertRoute = db.prepare("INSERT INTO route (name) VALUES ($route)");
const insertRoutes = db.transaction((routes) => {
  for (const $route of routes) insertRoute.run({ $route });
});

// Create the route_stops db generator
const insertRouteStop =
  db.prepare(`INSERT INTO route_stop (sort_order, route_id, stop_id)
VALUES (
	$index,
	(SELECT id FROM route WHERE name = $route),
	(SELECT id FROM stop WHERE name = $stop)
)
`);
const insertRouteStops = db.transaction((routes) => {
  for (const [$route, stops] of Object.entries(routes)) {
    for (const [$index, $stop] of (stops as Array<string>).entries()) {
      insertRouteStop.run({ $index, $stop, $route });
    }
  }
});

// Execute the generators
insertStops(selected_stops);
insertRoutes(Object.keys(routes));
insertRouteStops(routes);
