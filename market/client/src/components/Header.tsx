import { useState } from 'react';
import { IoMenu, IoClose, IoSearch } from 'react-icons/io5';
import { SidebarMenu } from './SidebarMenu';
import { Link } from 'react-router-dom';
import { useRootStore } from '@/store/store';
import type { UserProfile } from '@/store/slice/userSlice';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile } = useRootStore('user');

  return (
    <header className='bg-slate-200 shadow-md'>
      <div className='max-w-6xl mx-auto p-3 flex justify-between items-center'>
        <Link to='/' >
          <h1 className='font-bold text-lg sm:text-2xl'>
            <span className='text-slate-500'>Harold</span>
            &nbsp;
            <span className='text-slate-700'>Estate</span>
          </h1>
        </Link>
        <SearchBar />
        <MenuButton menuOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} />
        <ul className='hidden sm:flex gap-4 items-center'>
          <NavItem href='/' name='Home' />
          <NavItem href='/about' name='About' />
          {profile
            ? <ProfileHeader profile={profile} />
            : <NavItem href='/sign-in' name='Sign In' />}
        </ul>
      </div>
      <SidebarMenu isOpen={menuOpen} closeMenu={() => setMenuOpen(false)}>
        <NavItem href='/' name='Home' />
        <NavItem href='/about' name='About' />
        {profile
          ? <ProfileSidebar profile={profile} />
          : <NavItem href='/sign-in' name='Sign In' />}
      </SidebarMenu>
    </header>
  );
}

function SearchBar() {

  return (
    <form className='flex-1 h-10 mx-4 bg-slate-100 px-2 rounded-lg flex items-center min-w-48 max-w-72'>
      <input type='text' placeholder='Search...'
        className='min-w-32 flex-1 bg-transparent focus:outline-none' />
      <IoSearch className='text-slate-600 w-6 h-6' />
    </form>
  );
}

interface MenuButtonProps {
  menuOpen: boolean;
  toggleMenu: () => void;
}
function MenuButton({ menuOpen, toggleMenu }: MenuButtonProps) {
  const Icon = menuOpen ? IoClose : IoMenu;
  return (
    <button onClick={toggleMenu} className='block sm:hidden relative z-50'>
      <Icon className='w-6 h-6' />
    </button>
  )
}

type NavInfo = { name: string, href: string };
const NavItem = ({ name, href }: NavInfo) => (
  <li>
    <Link to={href} className="text-slate-700 hover:underline">
      {name}
    </Link>
  </li>
);

type ProfileProps = { profile: UserProfile };
const ProfileHeader = ({ profile }: ProfileProps) => (
  <Link to='/profile' dir='ltr' className='h-10 flex items-center rounded-l-[20px] rounded-r-lg hover:bg-gray-300'>
    <img src={profile.avatar} className='w-10 h-10 rounded-full' />
    <p className='max-w-24 px-2 text-wrap break-words leading-3'>
      {profile.username}
    </p>
  </Link>
);
const ProfileSidebar = ({ profile }: ProfileProps) => (
  <li className='min-w-48 max-w-64'>
    <Link to='/profile' className='flex p-2 gap-2 rounded-lg justify-between items-center hover:bg-gray-300/20'>
      <img src={profile.avatar} className='w-12 h-12 rounded-full' />
      <div>
        <h3 className='text-lg font-semibold'>{profile.username}</h3>
        <p className='text-sm text-gray-600'>{profile.email}</p>
      </div>
    </Link>
  </li>
);