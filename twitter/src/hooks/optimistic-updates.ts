import { useCallback, useEffect, useState } from "react";
import { tweetMutation } from "./api-tweet";
import { debounce } from "@utils/debounce";

export interface HeartButtonProps {
    id: string;
    liked: boolean;
    count: number;
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

    const toggleLike = tweetMutation.useToggleLike();
    // preserve the same callback
    const toggleLikeMutate = useCallback(
        // invoke API immediately, after a while invoke trailling
        debounce(
            (id: string, liked: boolean) => toggleLike.mutate({ tweetId: id, liked })
            , wait, { leading: true }),
        []);

    const handleClick = () => {
        // set client side dispaly everytime no matter API has invoked or not
        // optimistic update
        _setLiked(!_liked);
        _setCount(_liked ? _count - 1 : _count + 1);
        toggleLikeMutate(props.id, !_liked);
    };

    return { _liked, _count, handleClick };
}