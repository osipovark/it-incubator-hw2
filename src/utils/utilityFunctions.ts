import { Request, Response, NextFunction } from "express";
import Joi from "joi";

import { APIErrorResult } from "./apiErrors";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.get("authorization");
  const [username, password] = authHeader
    ? Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":")
    : ["", ""];
  if (username === "admin" && password === "qwerty") {
    next();
  } else {
    res.sendStatus(401);
  }
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
