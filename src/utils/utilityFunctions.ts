import { Request, Response, NextFunction } from "express";
import Joi from "joi";

import { APIErrorResult } from "./apiErrors";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader: string | undefined = req.get("authorization");
  if (!authHeader) {
    res.sendStatus(401);
    return;
  }
  const [kind, token] = authHeader.split(" ");
  const [username, password] = Buffer.from(token, "base64")
    .toString()
    .split(":");
  if (kind === "Basic" && username === "admin" && password === "qwerty") {
    next();
  }
  res.sendStatus(401);
};

export const transformJoiError = (error: Joi.ValidationError) => {
  const customError: APIErrorResult = {
    errorsMessages: [],
  };
  customError.errorsMessages = error.details.map((detail) => {
    return {
      message: detail.message,
      field: detail.path.join("."),
    };
  });
  customError.errorsMessages = customError.errorsMessages.filter(
    (em, i, arr) => {
      const searchArr = arr.slice(0, i);
      if (searchArr.find((item) => item.field === em.field)) return false;
      return true;
    }
  );
  return customError;
};
