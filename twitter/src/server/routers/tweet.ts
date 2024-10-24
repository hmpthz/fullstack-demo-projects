import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";

const getFeedProcedure = publicProcedure
  .input(z.object({
    limit: z.number().default(10),
    cursor: z.object({
      id: z.string(),
      createdAt: z.date()
    }).optional()
  }))
  .query(async ({ ctx: { session, db }, input: { limit, cursor } }) => {
    const currentUserId = session?.user.id;
    const data = await db.tweet.findMany({
      take: limit + 1,
      cursor: cursor ? { createdAt_id: cursor } : undefined,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
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
  .mutation(async ({ ctx: { session, db }, input: { content } }) => {
    return await db.tweet.create({
      data: {
        userId: session.user.id,
        content
      }
    });
  });

export const tweetRouter = createTRPCRouter({
  getFeed: getFeedProcedure,
  toggleLike: toggleLikeProcedure,
  create: createProcedure
});
