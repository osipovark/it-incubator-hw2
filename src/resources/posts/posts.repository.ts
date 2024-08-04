import Joi from "joi";

import { db } from "../../db/db";
import { HTTP_CODES, HttpStatusType } from "../../utils/httpResponsesCodes";
import { transformJoiError } from "../../utils/utilityFunctions";
import { PostInputModel } from "./models/PostInputModel";
import { PostViewModel } from "./models/PostViewModel";
import { APIErrorResult } from "../../utils/apiErrors";

const postSchema = Joi.object({
  title: Joi.string().max(30).required().messages({
    "any.required": "title is required",
    "string.base": "title must be a string",
    "string.max": "title can't be longer than 30 characters",
    "string.empty": "empty string can't be used as a title",
  }),
  shortDescription: Joi.string().max(100).required().messages({
    "any.required": "shortDescription is required",
    "string.base": "shortDescription must be a string",
    "string.max": "shortDescription can't be longer than 100 characters",
    "string.empty": "empty string can't be used as a shortDescription",
  }),
  content: Joi.string().max(1000).required().messages({
    "any.required": "content is required",
    "string.base": "content must be a string",
    "string.max": "content can't be longer than 1000 characters",
    "string.empty": "empty string can't be used as a content",
  }),
  blogId: Joi.string().required().messages({
    "any.required": "blogId is required",
    "string.base": "blogId must be a string",
    "string.empty": "empty string can't be used as a blogId",
  }),
});

export const getPostsRepository = {
  readAllPosts(): [HttpStatusType, PostViewModel[]] {
    return [HTTP_CODES.OK_200, db.posts];
  },

  createPost(
    input: PostInputModel
  ): [HttpStatusType, PostViewModel | APIErrorResult] {
    const { error, value } = postSchema.validate(input, { abortEarly: false });
    const isBlogExistent =
      db.blogs.findIndex((b) => b.id === input.blogId) !== -1;
    let responseCode;
    let responseObject;
    if (error || !isBlogExistent) {
      responseCode = HTTP_CODES.BAD_REQUEST_400;
      const validationErrorsMessages = error
        ? transformJoiError(error).errorsMessages
        : [];
      const blogNonExistentErrorsMessages = !isBlogExistent
        ? [
            {
              message:
                "there is no blog with an id value of blogId in the database",
              field: "blogId",
            },
          ]
        : [];
      responseObject = {
        errorsMessages: [
          ...validationErrorsMessages,
          ...blogNonExistentErrorsMessages,
        ],
      };
    } else {
      responseCode = HTTP_CODES.CREATED_201;
      responseObject = {
        id:
          db.posts.length > 0
            ? `${Math.max(...db.posts.map((p) => +p.id)) + 1}`
            : "0",
        ...value,
      };
      db.posts.push(responseObject);
    }

    return [responseCode, responseObject];
  },

  readPostById(id: string) {
    const responseObject = db.posts.find((p) => p.id === id);
    return responseObject
      ? [HTTP_CODES.OK_200, responseObject]
      : HTTP_CODES.NOT_FOUND_404;
  },

  updatePostById(
    id: string,
    input: PostInputModel
  ): HttpStatusType | [HttpStatusType, APIErrorResult] {
    const postIndex = db.posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return HTTP_CODES.NOT_FOUND_404;
    }
    const { error, value } = postSchema.validate(input, { abortEarly: false });
    const isBlogExistent =
      db.blogs.findIndex((b) => b.id === input.blogId) !== -1;
    let responseCode;
    let responseObject;
    if (error || !isBlogExistent) {
      responseCode = HTTP_CODES.BAD_REQUEST_400;
      const validationErrorsMessages = error
        ? transformJoiError(error).errorsMessages
        : [];
      const blogNonExistentErrorsMessages = !isBlogExistent
        ? [
            {
              message:
                "there is no blog with an id value of blogId in the database",
              field: "blogId",
            },
          ]
        : [];
      responseObject = {
        errorsMessages: [
          ...validationErrorsMessages,
          ...blogNonExistentErrorsMessages,
        ],
      };
      return [responseCode, responseObject];
    } else {
      db.posts.splice(postIndex, 1, { id, ...value });
      return HTTP_CODES.NO_CONTENT_204;
    }
  },

  deletePostById(id: string): HttpStatusType {
    const postIndex = db.posts.findIndex((p) => p.id === id);
    if (postIndex === -1) {
      return HTTP_CODES.NOT_FOUND_404;
    } else {
      db.posts.splice(postIndex, 1);
      return HTTP_CODES.NO_CONTENT_204;
    }
  },
};
