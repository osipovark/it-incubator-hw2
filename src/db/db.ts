import { BlogViewModel } from "../resources/blogs/models/BlogViewModel";
import { PostViewModel } from "../resources/posts/models/PostViewModel";

export const db: DBType = {
  blogs: [],
  posts: [],
};

type DBType = {
  blogs: BlogViewModel[];
  posts: PostViewModel[];
};
