import { createEntityClient } from "../utils/entityWrapper";
import schema from "./Birthday.json";
export const Birthday = createEntityClient("Birthday", schema);
