import { api } from "./api";

export const tweetMutation = {
  useCreate: api.tweet.create.useMutation,

  useToggleLike(limit = 10) {
    const utils = api.useUtils();
    const { setInfiniteData } = utils.tweet.getFeed;

    const result = api.tweet.toggleLike.useMutation({
      onSuccess: ({ liked }, { tweetId }) => {
        const updateData: Parameters<typeof setInfiniteData>[1] = (oldData) => {
          if (!oldData) return;
          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map(page => ({
              nextCursor: page.nextCursor,
              tweets: page.tweets.map(tweet => {
                // only change difference
                if (tweet.id == tweetId && tweet.likedByMe != liked) {
                  return {
                    ...tweet,
                    likeCount: liked ? tweet.likeCount + 1 : tweet.likeCount - 1,
                    likedByMe: liked
                  };
                }
                return tweet;
              })
            }))
          };
        };

        setInfiniteData({ limit }, updateData);
      }
    });
    return result;
  }
}