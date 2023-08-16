/**
 * Ideally if we had strong type safety between backend and database we could
 * infer the input and output types to only include the possible values and not
 * be generics, but settings that up seems like overkill for this task
 */

import { Database } from "bun:sqlite";

// Connect to the pre-built SQLite database
const db = new Database("/database/db.sqlite");

/**
 *
 * @returns A list of all stop names in the database
 */
export const getAllStopsFromDatabase = () =>
  db.query("SELECT name FROM stop").all() as string[];

/**
 *
 * @returns A list of all route names in the database
 */
export const getAllRoutes = () =>
  db.query("SELECT name FROM route").all() as string[];

/**
 *
 * @param $start Name of the stop where we start our journey
 * @returns A list of all possible routes taken from the provided start point
 */
export const getAllPossibleRoutes = ($start: string) =>
  // Not entirely sure why prettier wants to format it like this - need to look into my settings later
  db
    .query(
      `
			SELECT route_stop.sort_order, route_stop.route_id, route.name
			FROM route_stop
			LEFT JOIN route ON route.id = route_stop.route_id
			WHERE stop_id = (SELECT id FROM stop WHERE name = $start)
			`
    )
    .all({ $start }) as Array<{
    sort_order: number;
    name: string;
    route_id: number;
  }>;

/**
 *
 * @param $start Name of the stop where we start our journey
 * @returns An object containing paths as keys and possible stops as values from the provided start point
 */
export const getAllPossibleDestinations = ($start) => {
  const paths = getAllPossibleRoutes($start);
  // We could probably merge both of these SQL queries into one,
  // but I believe doing so would significantly reduce readability
  const getPossibleDestinations = db.prepare(`
		SELECT stop.name
		FROM route_stop
		LEFT JOIN stop ON stop.id = route_stop.stop_id
		WHERE route_stop.route_id = $route_id
			AND route_stop.sort_order > $sort_order
		ORDER BY route_stop.sort_order
	`);
  const query = db.transaction((paths) =>
    Object.fromEntries(
      paths.map(
        ({ sort_order, route_id, name }) => [
          name,
          getPossibleDestinations
            .all({
              $sort_order: sort_order,
              $route_id: route_id,
            })
            .map(({ name }) => name, []),
        ],
        {}
      )
    )
  );
  return query(paths) as { [key: string]: Array<string> };
};
