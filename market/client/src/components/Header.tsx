import { useState } from 'react';
import { IoMenu, IoClose, IoSearch } from 'react-icons/io5';
import { SidebarMenu } from './SidebarMenu';
import { Link } from 'react-router-dom';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(true);

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
        <ul className='hidden sm:flex gap-4'>
          <NavItem href='/' name='Home' />
          <NavItem href='/about' name='About' />
          <NavItem href='/sign-in' name='Sign In' />
        </ul>
      </div>
      <SidebarMenu isOpen={menuOpen} closeMenu={() => setMenuOpen(false)}>
        <NavItem href='/' name='Home' />
        <NavItem href='/about' name='About' />
        <NavItem href='/sign-in' name='Sign In' />
      </SidebarMenu>
    </header>
  );
}

function SearchBar() {

  return (
    <form className='bg-slate-100 px-2 rounded-lg flex items-center'>
      <input type='text' placeholder='Search...'
        className='h-10 bg-transparent focus:outline-none w-40 sm:w-64' />
      <IoSearch className='text-slate-600 w-6 h-6' />
    </form>
  );
}

type MenuButtonProps = { menuOpen: boolean, toggleMenu: () => void };

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
