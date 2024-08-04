import { Router } from "express";

import { db } from "../../db/db";

export const testingRouter = Router();

testingRouter.delete("/all-data", (req, res) => {
  for (const prop in db) {
    if (db.hasOwnProperty(prop)) {
      db[prop as keyof typeof db] = [];
    }
  }
  res.sendStatus(200);
});
