import { api } from "./api";

export const apiQuery = {
  useInfiniteTweets() {
    return api.tweet.getFeed.useInfiniteQuery(
      {},
      { getNextPageParam: (last) => last.nextCursor }
    );
  },

  useInfiniteFollowingTweets() {
    return api.tweet.getFeed.useInfiniteQuery(
      { onlyFollowing: true },
      { getNextPageParam: (last) => last.nextCursor }
    );
  },

  useInfiniteProfileTweets(userId: string) {
    return api.tweet.getProfileFeed.useInfiniteQuery(
      { userId },
      { getNextPageParam: (last) => last.nextCursor }
    );
  }
};