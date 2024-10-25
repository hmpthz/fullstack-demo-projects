import { z } from "zod";

import {
  createTRPCContext,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";
import type { Prisma } from "@prisma/client";
import type { inferAsyncReturnType } from "@trpc/server";

const infiniteTweetQueryInput = {
  limit: z.number().default(10),
  cursor: z.object({
    id: z.string(),
    createdAt: z.date()
  }).optional()
};
type Context = inferAsyncReturnType<typeof createTRPCContext>;
type TweetsCursor = z.infer<(typeof infiniteTweetQueryInput.cursor)>;

async function getInfiniteTweets(ctx: Context, limit: number, cursor?: TweetsCursor, whereClause?: Prisma.TweetWhereInput) {
  const currentUserId = ctx.session?.user.id;
  const data = await ctx.db.tweet.findMany({
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    where: whereClause,
    select: {
      id: true,
      content: true,
      createdAt: true,
      _count: { select: { likes: true } },
      likes: currentUserId == undefined
        ? false
        : { where: { userId: currentUserId } },
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  });

  let nextCursor: typeof cursor | undefined;
  if (data.length > limit) {
    const nextItem = data.pop();
    if (nextItem) {
      nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
    }
  }
  return {
    tweets: data.map(({ _count: { likes: likeCount }, likes: myLike, ...props }) => ({
      ...props,
      likeCount,
      likedByMe: myLike ? myLike.length > 0 : false
    })),
    nextCursor
  };
}

const getFeedProcedure = publicProcedure
  .input(z.object({
    ...infiniteTweetQueryInput,
    onlyFollowing: z.boolean().default(false)
  }))
  .query(async ({ ctx, input: { limit, cursor, onlyFollowing } }) => {
    const currentUserId = ctx.session?.user.id;
    let whereClause: Prisma.TweetWhereInput | undefined;
    if (onlyFollowing && currentUserId != undefined) {
      whereClause = { user: { followers: { some: { id: currentUserId } } } };
    }
    return await getInfiniteTweets(ctx, limit, cursor, whereClause);
  });

const getProfileFeedProcedure = publicProcedure
  .input(z.object({
    ...infiniteTweetQueryInput,
    userId: z.string()
  }))
  .query(async ({ ctx, input: { limit, cursor, userId } }) => {
    return await getInfiniteTweets(ctx, limit, cursor, { userId });
  });

const toggleLikeProcedure = protectedProcedure
  .input(z.object({ tweetId: z.string(), liked: z.boolean() }))
  .mutation(async ({ ctx: { session, db }, input: { tweetId, liked } }) => {
    const data = { userId: session.user.id, tweetId }
    const existingLike = await db.like.findUnique({
      where: { userId_tweetId: data }
    });

    if (existingLike && !liked) {
      await db.like.delete({ where: { userId_tweetId: data } });
    }
    else if (!existingLike && liked) {
      await db.like.create({ data });
    }
    return { liked };
  });

const createProcedure = protectedProcedure
  .input(z.object({ content: z.string() }))
  .mutation(async ({ ctx, input: { content } }) => {
    const currentUserId = ctx.session.user.id;
    const data = await ctx.db.tweet.create({
      data: {
        userId: currentUserId,
        content
      }
    });
    ctx.revalidateSSG?.(`/profiles${currentUserId}`);
    return data;
  });

export const tweetRouter = createTRPCRouter({
  getFeed: getFeedProcedure,
  getProfileFeed: getProfileFeedProcedure,
  toggleLike: toggleLikeProcedure,
  create: createProcedure
});
