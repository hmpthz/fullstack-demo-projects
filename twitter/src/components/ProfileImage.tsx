import Image from "next/image";
import { VscAccount } from "react-icons/vsc";

interface ProfileImageProps extends ClassProps {
  src?: string | null;
}

export function ProfileImage({ src, className = '' }: ProfileImageProps) {
  return (
    <div className={`relative h-12 w-12 overflow-hidden rounded-full ${className}`}>
      {src
        ? <Image src={src} alt="profile image" quality={100} fill sizes="256px" />
        : <VscAccount className="w-full h-full" />}
    </div>
  );
}