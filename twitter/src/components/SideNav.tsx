import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import type { IconType } from "react-icons";
import { IconHoverEffect } from "./IconHoverEffect";
import { VscAccount, VscHome, VscSignIn, VscSignOut } from "react-icons/vsc";

type NavItemProps<T extends React.ElementType> = {
  as?: T; // This is the "as" prop that can be a string or a React component
  sub: {
    Icon: IconType;
    iconTwd?: string;
    text: string;
    textTwd?: string;
  }
} & React.ComponentPropsWithoutRef<T>; // Ensures props for the given element/component are passed

const NavItem = <T extends React.ElementType = 'div'>({ as, sub: { Icon, iconTwd = '', text, textTwd = '' }, ...props }: NavItemProps<T>) => {
  const Comp = as || 'div'; // Default to 'div' if "as" is not provided
  return (
    <li>
      <Comp className='group' {...props}>
        <IconHoverEffect>
          <span className="flex items-center gap-4">
            <Icon className={`w-8 h-8 ${iconTwd}`} />
            <span className={`hidden md:inline text-lg ${textTwd}`}>{text}</span>
          </span>
        </IconHoverEffect>
      </Comp>
    </li>
  );
};

export function SideNav() {
  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  return (
    <nav className="sticky top-0 px-2 py-4">
      <ul className="flex flex-col items-start gap-2 whitespace-nowrap">
        <NavItem as={Link} href="/"
          sub={{ Icon: VscHome, text: "Home" }} />
        {
          user !== undefined &&
          <NavItem as={Link} href={`/profiles/${user.id}`}
            sub={{ Icon: VscAccount, text: "Profile" }} />
        }
        {
          user !== undefined
            ? <NavItem as="button" onClick={() => signOut()}
              sub={{ Icon: VscSignOut, text: "Log Out", iconTwd: "fill-red-700", textTwd: "text-red-700" }} />
            : <NavItem as="button" onClick={() => signIn()}
              sub={{ Icon: VscSignIn, text: "Log In", iconTwd: "fill-green-700", textTwd: "text-green-700" }} />
        }
      </ul>
    </nav>
  )
}