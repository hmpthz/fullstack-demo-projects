import { NewTweetForm } from "@/components/NewTweetForm";
import { InfiniteTweetList } from "@/components/TweetList";
import { feedQuery } from "@/hooks/api-feed";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 border-b pt-2">
        <h1 className="mb-2 px-4 text-lg font-bold">Home</h1>
      </header>
      <NewTweetForm />
      <RecentTweetList />
    </>
  );
}

function RecentTweetList() {
  const result = feedQuery.useInfinite();

  return (
    <InfiniteTweetList
      tweets={result.data?.pages.flatMap((page) => page.tweets)}
      isError={result.isError}
      isLoading={result.isLoading}
      hasMore={result.hasNextPage}
      fetchMore={result.fetchNextPage} />
  )
}