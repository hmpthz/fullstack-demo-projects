import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";

const getByIdProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx: { session, db }, input: { id } }) => {
    const currentUserId = session?.user.id;
    const profile = await db.user.findUnique({
      where: { id },
      select: {
        name: true,
        image: true,
        _count: {
          select: {
            followers: true,
            follows: true,
            tweets: true
          }
        },
        followers: {
          where: { id: currentUserId ?? '0' },
          select: { id: true }
        }
      }
    });
    if (!profile) return undefined;
    return {
      name: profile.name,
      image: profile.image,
      followersCount: profile._count.followers,
      followsCount: profile._count.follows,
      tweetsCount: profile._count.tweets,
      followed: profile.followers.length > 0
    };
  });

const toggleFollowProcedure = protectedProcedure
  .input(z.object({
    userId: z.string(),
    follow: z.boolean()
  }))
  .mutation(async ({ ctx, input: { userId, follow } }) => {
    const currentUserId = ctx.session.user.id;
    if (currentUserId == userId) {
      throw new TRPCError({ code: 'CONFLICT' });
    }
    const existingFollow = await ctx.db.user.findUnique({
      where: {
        id: userId,
        followers: { some: { id: currentUserId } }
      }
    });

    const revalidate = () => {
      ctx.revalidateSSG?.(`/profiles${userId}`);
      ctx.revalidateSSG?.(`/profiles${currentUserId}`);
    };
    if (existingFollow && !follow) {
      await ctx.db.user.update({
        where: { id: userId },
        data: {
          followers: { disconnect: { id: currentUserId } }
        }
      });
      revalidate();
    }
    else if (!existingFollow && follow) {
      await ctx.db.user.update({
        where: { id: userId },
        data: {
          followers: { connect: { id: currentUserId } }
        }
      });
      revalidate();
    }
    return { followed: follow };
  });

export const profileRouter = createTRPCRouter({
  getById: getByIdProcedure,
  toggleFollow: toggleFollowProcedure
});