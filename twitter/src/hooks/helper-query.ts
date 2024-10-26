import { api } from "./api";

export const apiQuery = {
  useInfiniteTweets() {
    return api.tweet.getFeed.useInfiniteQuery(
      {},
      {
        getNextPageParam: (last) => last.nextCursor,
        staleTime: 1000 * 30
      }
    );
  },

  useInfiniteFollowingTweets() {
    return api.tweet.getFeed.useInfiniteQuery(
      { onlyFollowing: true },
      {
        getNextPageParam: (last) => last.nextCursor,
        staleTime: 1000 * 30
      }
    );
  },

  useInfiniteProfileTweets(userId: string) {
    return api.tweet.getProfileFeed.useInfiniteQuery(
      { userId },
      {
        getNextPageParam: (last) => last.nextCursor,
        staleTime: 1000 * 30
      }
    );
  }
};