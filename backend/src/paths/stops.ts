import {
  getAllPossibleDestinations,
  getAllStopsFromDatabase,
} from "../controllers/database_controller";

export const getAllStops = (c) => c.json(getAllStopsFromDatabase());
export const getAllDestinations = async (c) => {
  const { from } = await c.req.json();
  // Should really add some error handling & feedback about malformed queries here
  return c.json(getAllPossibleDestinations(from));
};
