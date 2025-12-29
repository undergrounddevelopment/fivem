vercel --prodimport React from 'react';

const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="container">
        <nav className="navbar">
          <ul className="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="/market">Market</a></li>
            <li><a href="/forum">Forum</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;