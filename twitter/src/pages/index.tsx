import { NewTweetForm } from "@/components/NewTweetForm";
import { InfiniteTweetList } from "@/components/TweetList";
import { apiQuery } from "@/hooks/helper-query";
import { useSession } from "next-auth/react";
import { useState } from "react";

const tabs = ['Recent', 'Following'] as const;
type TabsName = typeof tabs[number];

export default function Home() {
  const tabState = useState<TabsName>('Recent');

  return (
    <>
      <header className="sticky top-0 z-10 border-b pt-2 bg-white/90">
        <h1 className="mb-2 px-4 text-lg font-bold">Home</h1>
        <Tabs tabState={tabState} />
      </header>
      <NewTweetForm />
      <main>
        {tabState[0] == 'Recent' ? <RecentTweetList /> : <FollowingTweetList />}
      </main>
    </>
  );
}

function Tabs({ tabState }: { tabState: ReactState<TabsName> }) {
  const session = useSession();
  if (session.status != 'authenticated') return null;

  const [tab, setTab] = tabState;
  return (
    <div className="flex">
      {tabs.map(name => (
        <button key={name} onClick={() => setTab(name)}
          className={`flex-grow p-2 hover:bg-gray-200 focus-visible:bg-gray-200 border-b-4 ${tab == name ? 'border-blue-500 font-bold' : 'border-white/10'}`}>
          {name}
        </button>
      ))}
    </div>
  )
}

function RecentTweetList() {
  const result = apiQuery.useInfiniteTweets();

  return (
    <InfiniteTweetList
      tweets={result.data?.pages.flatMap((page) => page.tweets)}
      isError={result.isError}
      isLoading={result.isLoading}
      hasMore={result.hasNextPage}
      fetchMore={result.fetchNextPage} />
  )
}

function FollowingTweetList() {
  const result = apiQuery.useInfiniteFollowingTweets();

  return (
    <InfiniteTweetList
      tweets={result.data?.pages.flatMap((page) => page.tweets)}
      isError={result.isError}
      isLoading={result.isLoading}
      hasMore={result.hasNextPage}
      fetchMore={result.fetchNextPage} />
  )
}