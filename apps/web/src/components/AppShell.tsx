import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Waypoints } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle.js';

const sections = [
  ['/docs', 'Notebook'], ['/builder', 'Builder'], ['/convert', 'Convert'],
  ['/simulate', 'Simulate'], ['/machines', 'Machines'],
];

export function AppShell({ children }: { children?: React.ReactNode }) {
  const isCover = useLocation().pathname === '/';
  return <div className={isCover ? 'book-app cover-shell' : 'book-app'}>
    <header className="book-mast">
      <Link to="/" className="book-brand"><Waypoints aria-hidden="true" />AutomataLab</Link>
      <nav aria-label="Main navigation">{sections.map(([path, label]) =>
        <NavLink end key={path} to={path}>{label}</NavLink>
      )}</nav>
      <ThemeToggle />
    </header>
    <main className="book-page">{children ?? <Outlet />}</main>
  </div>;
}
