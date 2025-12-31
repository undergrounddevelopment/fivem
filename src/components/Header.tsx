import React from 'react'
import Link from 'next/link'

const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="container">
        <nav className="navbar">
          <ul className="nav-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/market">Market</Link></li>
            <li><Link href="/forum">Forum</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;