import { useMemo } from "react";
import { posts } from "../../data/blog/posts.js";

export function usePost(slug) {
  return useMemo(() => posts.find((post) => post.slug === slug), [slug]);
}

