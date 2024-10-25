import { Button } from "@/components/Button";
import { IconHoverEffect } from "@/components/IconHoverEffect";
import { ProfileImage } from "@/components/ProfileImage";
import { InfiniteTweetList } from "@/components/TweetList";
import { api } from "@/hooks/api";
import { apiQuery } from "@/hooks/helper-query";
import type { FollowButtonProps } from "@/hooks/optimistic-updates";
import { ssgHelper } from "@/server/ssgHelper";
import type { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from "next";
import { useSession } from "next-auth/react";
import ErrorPage from "next/error";
import Head from "next/head";
import Link from "next/link";
import { VscArrowLeft } from "react-icons/vsc";

const Profile: NextPage<StaticProps> = ({ id }) => {
  const { data } = api.profile.getById.useQuery({ id });
  if (!data) {
    return <ErrorPage statusCode={404} />
  }

  return (
    <>
      <Head>
        <title>{`Twitter Clone - ${data.name}`}</title>
      </Head>
      <header className="sticky top-0 z-10 px-4 py-2 flex gap-2 items-center border-b bg-white/90">
        <Link href='..' className="group">
          <IconHoverEffect>
            <VscArrowLeft className="w-6 h-6" />
          </IconHoverEffect>
        </Link>
        <ProfileImage src={data.image} className="flex-shrink-0" />
        <div className="flex-grow">
          <h1 className="text-lg font-bold">{data.name}</h1>
          <div className="text-gray-500">
            {`
              ${data.tweetsCount} ${getPlural(data.tweetsCount, 'Tweet', 'Tweets')}
               - ${data.followersCount} ${getPlural(data.followersCount, 'Follower', 'Followers')}
               - ${data.followsCount} Following
            `}
          </div>
        </div>
        <HeaderButton userId={id} followed={data.followed} />
      </header>
      <main>
        <ProfileTweetList id={id} />
      </main>
    </>
  );
}


function HeaderButton(props: FollowButtonProps) {
  const session = useSession();
  if (session.status != 'authenticated') return null;
  return session.data.user.id == props.userId
    ? (<Button small>Edit Profile</Button>)
    : (<FollowButton {...props} />);
}

function FollowButton(props: FollowButtonProps) {

  return (
    <Button small gray={props.followed}>
      {props.followed ? 'Unfollow' : 'Follow'}
    </Button>
  )
}

function ProfileTweetList({ id }: { id: string }) {
  const result = apiQuery.useInfiniteProfileTweets(id);

  return (
    <InfiniteTweetList
      tweets={result.data?.pages.flatMap((page) => page.tweets)}
      isError={result.isError}
      isLoading={result.isLoading}
      hasMore={result.hasNextPage}
      fetchMore={result.fetchNextPage} />
  )
}

function getPlural(num: number, one: string, many: string) {
  return num > 1 ? many : one;
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: 'blocking'
});

export const getStaticProps = async (context: GetStaticPropsContext<{ id: string }>) => {
  const userId = context.params?.id;
  if (userId == undefined) {
    return {
      redirect: { destination: '/' }
    }
  }

  const ssg = ssgHelper();
  await ssg.profile.getById.prefetch({ id: userId });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id: userId
    }
  }
}

type StaticProps = InferGetStaticPropsType<typeof getStaticProps>;

export default Profile;