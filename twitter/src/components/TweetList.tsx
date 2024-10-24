import { type RouterOutputs } from "@/hooks/api";
import Link from "next/link";
import InfiniteScroll, { } from 'react-infinite-scroll-component';
import { ProfileImage } from "./ProfileImage";
import { useSession } from "next-auth/react";
import { VscHeart, VscHeartFilled } from 'react-icons/vsc';
import { IconHoverEffect } from "./IconHoverEffect";
import { useHeartButton, type HeartButtonProps } from "@/hooks/optimistic-updates";

type TweetItem = RouterOutputs['tweet']['getFeed']['tweets'][0];

interface TweetListProps {
  tweets?: TweetItem[];
  isError: boolean;
  isLoading: boolean;
  hasMore?: boolean;
  fetchMore: () => Promise<unknown>;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'short' });

const TweetCard = ({ id, content, user, createdAt, likedByMe, likeCount }: TweetItem) => {
  return (
    <li className="flex gap-4 border-b px-4 py-4">
      <Link href={`/profiles/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className="flex-grow">
        <div className="flex gap-1">
          <Link href={`/profiles/${user.id}`} className="font-bold hover:underline focus-visible:underline">
            {user.name}
          </Link>
          <span className="text-gray-500">-</span>
          <span className="text-gray-500">{dateFormatter.format(createdAt)}</span>
        </div>

        <p className="whitespace-pre-wrap">
          {content}
        </p>
        <HeartButton id={id} liked={likedByMe} count={likeCount} />
      </div>
    </li>
  );
}

const HeartButton = (props: HeartButtonProps) => {
  const session = useSession();
  const { _liked, _count, handleClick } = useHeartButton(props, 500);

  if (session.status != 'authenticated') {
    return (
      <div className='my-1 flex items-center gap-3 text-gray-500'>
        <VscHeart />
        <span>{props.count}</span>
      </div>
    )
  }

  const HeartIcon = _liked ? VscHeartFilled : VscHeart;
  return (
    <button
      onClick={handleClick}
      className={`group my-1 -ml-2 flex items-center gap-1 transition-colors duration-200 ${_liked
        ? 'text-red-500'
        : 'text-gray-500 hover:text-red-500 focus-visible:text-red-500'}`}>
      <IconHoverEffect red={!_liked}>
        <HeartIcon className={`transition-colors duration-200 ${_liked
          ? 'fill-red-500'
          : 'fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500'}`} />
      </IconHoverEffect>
      <span>{_count}</span>
    </button>
  )
}

export function InfiniteTweetList({ tweets, isError, isLoading, hasMore, fetchMore }: TweetListProps) {
  if (isError) return <ErrorDisplay />
  if (isLoading) return <LoadingDisplay />
  if (!tweets || tweets.length == 0) return <NoTweet />;

  return (
    <ul>
      <InfiniteScroll
        dataLength={tweets.length}
        next={fetchMore}
        hasMore={hasMore == true}
        loader={<LoadingDisplay />}>
        {tweets.map(item => <TweetCard key={item.id} {...item} />)}
      </InfiniteScroll>
    </ul>
  );
}

const LoadingDisplay = () => (
  <h1>Loading...</h1>
)

const ErrorDisplay = () => (
  <h1>Error...</h1>
)

const NoTweet = () => (
  <h2 className="my-4 text-center text-2xl text-gray-500">
    No Tweets
  </h2>
)
