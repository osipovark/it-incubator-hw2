import Joi from "joi";

import { db } from "../../db/db";
import { HTTP_CODES, HttpStatusType } from "../../utils/httpResponsesCodes";
import { transformJoiError } from "../../utils/utilityFunctions";
import { BlogInputModel } from "./models/BlogInputModel";
import { BlogViewModel } from "./models/BlogViewModel";
import { APIErrorResult } from "../../utils/apiErrors";

const blogSchema = Joi.object({
  name: Joi.string().max(15).required().messages({
    "any.required": "name is required",
    "string.base": "name must be a string",
    "string.max": "name can't be longer than 15 characters",
    "string.empty": "empty string can't be used as a name",
  }),
  description: Joi.string().max(500).required().messages({
    "any.required": "description is required",
    "string.base": "description must be a string",
    "string.max": "description can't be longer than 500 characters",
    "string.empty": "empty string can't be used as a description",
  }),
  websiteUrl: Joi.string()
    .max(100)
    .pattern(
      new RegExp(
        "^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$"
      )
    )
    .required()
    .messages({
      "any.required": "websiteUrl is required",
      "string.base": "websiteUrl must be a string",
      "string.max": "websiteUrl can't be longer than 100 characters",
      "string.empty": "empty string can't be used as a websiteUrl",
      "string.pattern.base": "impossible url",
    }),
});

export const getBlogsRepository = {
  readAllBlogs(): [HttpStatusType, BlogViewModel[]] {
    return [HTTP_CODES.OK_200, db.blogs];
  },

  createBlog(
    input: BlogInputModel
  ): [HttpStatusType, BlogViewModel | APIErrorResult] {
    const { error, value } = blogSchema.validate(input, { abortEarly: false });
    let responseCode;
    let responseObject;
    if (error) {
      responseCode = HTTP_CODES.BAD_REQUEST_400;
      responseObject = transformJoiError(error);
    } else {
      responseCode = HTTP_CODES.CREATED_201;
      responseObject = {
        id:
          db.blogs.length > 0
            ? `${Math.max(...db.blogs.map((blog) => +blog.id)) + 1}`
            : "0",
        ...value,
      };
      db.blogs.push(responseObject);
    }

    return [responseCode, responseObject];
  },

  readBlogById(id: string) {
    const responseObject = db.blogs.find((b) => b.id === id);
    return responseObject
      ? [HTTP_CODES.OK_200, responseObject]
      : HTTP_CODES.NOT_FOUND_404;
  },

  updateBlogById(id: string, input: BlogInputModel) {
    const blogIndex = db.blogs.findIndex((b) => b.id === id);
    if (blogIndex === -1) {
      return HTTP_CODES.NOT_FOUND_404;
    }
    const { error, value } = blogSchema.validate(input, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return [HTTP_CODES.BAD_REQUEST_400, transformJoiError(error)];
    } else {
      db.blogs.splice(blogIndex, 1, { id, ...value });
      return HTTP_CODES.NO_CONTENT_204;
    }
  },

  deleteBlogById(id: string) {
    const blogIndex = db.blogs.findIndex((b) => b.id === id);
    if (blogIndex === -1) {
      return HTTP_CODES.NOT_FOUND_404;
    } else {
      db.blogs.splice(blogIndex, 1);
      return HTTP_CODES.NO_CONTENT_204;
    }
  },
};
