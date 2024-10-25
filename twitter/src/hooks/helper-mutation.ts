import type { Session } from "next-auth";
import { api, type RouterOutputs } from "./api";

export const apiMutation = {
  useCreateTweet: api.tweet.create.useMutation,
  useToggleLike: api.tweet.toggleLike.useMutation,
  useToggleFollow: api.profile.toggleFollow.useMutation,

  useCreateTweetCacheUpdate() {
    const utils = api.useUtils();
    type TweetCreated = RouterOutputs['tweet']['create'];
    type TweetQueried = RouterOutputs['tweet']['getFeed']['tweets'][0];

    return (tweet: TweetCreated, session: Session) => {
      const updater: FeedDataUpdater = (oldData) => {
        if (!oldData) return;
        const page0 = oldData.pages[0];
        if (!page0) return;

        const newTweet: TweetQueried = {
          ...tweet,
          likeCount: 0,
          likedByMe: false,
          user: {
            id: session.user.id,
            name: session.user.name || null,
            image: session.user.image || null
          }
        }
        return {
          pageParams: oldData.pageParams,
          pages: [
            {
              nextCursor: page0.nextCursor,
              tweets: [newTweet, ...page0.tweets]
            },
            ...oldData.pages.slice(1),
          ]
        };
      };
      utils.tweet.getFeed.setInfiniteData({}, updater);
    }
  },

  useToggleLikeCacheUpdate() {
    const utils = api.useUtils();

    return (tweetId: string, userId: string, liked: boolean) => {
      const updater: FeedDataUpdater = (oldData) => {
        if (!oldData) return;
        return {
          pageParams: oldData.pageParams,
          pages: oldData.pages.map(page => ({
            nextCursor: page.nextCursor,
            tweets: page.tweets.map(tweet => {
              // only change difference
              if (tweet.id == tweetId && tweet.likedByMe != liked) {
                const countModifier = liked ? 1 : -1;
                return {
                  ...tweet,
                  likeCount: tweet.likeCount + countModifier,
                  likedByMe: liked
                };
              }
              return tweet;
            })
          }))
        };
      };
      utils.tweet.getFeed.setInfiniteData({}, updater);
      utils.tweet.getFeed.setInfiniteData({ onlyFollowing: true }, updater);
      utils.tweet.getProfileFeed.setInfiniteData({ userId }, updater);
    };
  },

  useToggleFollowCacheUpdate() {
    const utils = api.useUtils();
    return (userId: string, followed: boolean) => {
      utils.profile.getById.setData({ id: userId }, (oldData) => {
        if (!oldData) return;
        // only change difference
        if (oldData.followed == followed) return oldData;
        const countModifier = followed ? 1 : -1;
        return {
          ...oldData,
          followed,
          followersCount: oldData.followersCount + countModifier
        }
      });
    }
  }
}

type FeedDataUpdater = Parameters<ReturnType<(typeof api)['useUtils']>['tweet']['getFeed']['setInfiniteData']>[1];
