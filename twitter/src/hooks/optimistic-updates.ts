import { useCallback, useEffect, useState } from "react";
import { apiMutation } from "./helper-mutation";
import { debounce } from "@shared/debounce";

export interface HeartButtonProps {
    tweetId: string;
    userId: string;
    liked: boolean;
    count: number;
}
export interface FollowButtonProps {
    userId: string;
    followed: boolean;
}

export function useHeartButton(props: HeartButtonProps, wait: number) {
    // internal state
    const [_liked, _setLiked] = useState(props.liked);
    const [_count, _setCount] = useState(props.count);
    // force internal state sync with prop
    useEffect(() => {
        _setLiked(props.liked);
        _setCount(props.count);
    }, [props.liked, props.count]);

    const updateCache = apiMutation.useToggleLikeCacheUpdate();
    const toggleLike = apiMutation.useToggleLike({
        onSuccess: ({ like }, { tweetId }) => {
            updateCache(tweetId, props.userId, like);
        }
    });
    // preserve the same callback
    const toggleLikeMutate = useCallback(
        // invoke API immediately, after a while invoke trailling
        debounce(
            (like: boolean) => toggleLike.mutate({ tweetId: props.tweetId, like })
            , wait, { leading: true }),
        []);

    const handleClick = () => {
        // set client side dispaly everytime no matter API has invoked or not
        // optimistic update
        _setLiked(!_liked);
        _setCount(_liked ? _count - 1 : _count + 1);
        toggleLikeMutate(!_liked);
    };

    return { _liked, _count, handleClick };
}

export function useFollowButton(props: FollowButtonProps, wait: number) {
    // internal state
    const [_followed, _setFollowed] = useState(props.followed);
    // force internal state sync with prop
    useEffect(() => {
        _setFollowed(props.followed)
    }, [props.followed]);

    const updateCache = apiMutation.useToggleFollowCacheUpdate();
    const toggleFollow = apiMutation.useToggleFollow({
        onSuccess: ({ followed }, { userId }) => {
            updateCache(userId, followed);
        }
    });
    // preserve the same callback
    const toggleFollowMutate = useCallback(
        // invoke API immediately, after a while invoke trailling
        debounce(
            (follow: boolean) => toggleFollow.mutate({ userId: props.userId, follow })
            , wait, { leading: true }),
        []);

    const handleClick = () => {
        // set client side dispaly everytime no matter API has invoked or not
        // optimistic update
        _setFollowed(!_followed);
        toggleFollowMutate(!props.followed);
    }

    return { _followed, handleClick };
}