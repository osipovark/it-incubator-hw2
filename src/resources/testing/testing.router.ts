import { Router } from "express";

import { db } from "../../db/db";
import { HTTP_CODES } from "../../utils/httpResponsesCodes";

export const testingRouter = Router();

testingRouter.delete("/all-data", (req, res) => {
  for (const prop in db) {
    if (db.hasOwnProperty(prop)) {
      db[prop as keyof typeof db] = [];
    }
  }
  res.sendStatus(HTTP_CODES.NO_CONTENT_204);
});
