import type { ObjectId } from "typeorm";

export interface User {
  _id?: ObjectId;
  user_id: string;
  name: string;
  email: string;
}
