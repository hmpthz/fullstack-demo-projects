import { useSession } from "next-auth/react";
import { Button } from "./Button";
import { ProfileImage } from "./ProfileImage";
import { useCallback, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import type { Session } from "next-auth";
import { tweetMutation } from "@/hooks/api-tweet";

function updateTextAreaSize(ele?: HTMLTextAreaElement) {
  if (!ele) return;
  ele.style.height = '0';
  ele.style.height = `${ele.scrollHeight}px`;
}

export function NewTweetForm() {
  const session = useSession();
  if (session.status != 'authenticated') return null;

  return <ClientForm session={session.data} />;
}

interface ClientFormProps {
  session: Session
}

function ClientForm({ session }: ClientFormProps) {
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>();

  const initRef = useCallback((ele: HTMLTextAreaElement) => {
    updateTextAreaSize(ele);
    inputRef.current = ele;
  }, []);

  useLayoutEffect(() => {
    updateTextAreaSize(inputRef.current)
  }, [content]);

  const createTweet = tweetMutation.useCreate({
    onSuccess: (tweet => {
      setContent('');
    })
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createTweet.mutate({ content });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-b px-4 py-2">
      <div className="flex gap-4">
        <ProfileImage src={session.user.image} />
        <textarea
          ref={initRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
          placeholder="What's happening" />
      </div>
      <Button disabled={createTweet.isLoading} className="self-end">Tweet</Button>
    </form>
  )
}