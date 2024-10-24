import { api } from "./api";

export const feedQuery = {
  useInfinite(limit = 10) {
    return api.tweet.getFeed.useInfiniteQuery(
      { limit },
      { getNextPageParam: (last) => last.nextCursor }
    );
  }
};