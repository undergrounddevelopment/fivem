"use client"

import { useEffect, useState } from "react"
import { getCurrentHoliday } from "@/lib/holiday-theme"
import { Bell, User, Menu, X } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { LanguageSelector } from "@/components/language-selector"
import Link from "next/link"

export function SeasonalNavbar() {
  const [holiday, setHoliday] = useState(getCurrentHoliday())
  const [isOpen, setIsOpen] = useState(false)
  const { user, login } = useAuth()

  useEffect(() => {
    setHoliday(getCurrentHoliday())
  }, [])

  const color = holiday ? holiday.theme.primary : "oklch(0.75 0.15 180)"
  const isWinter = holiday?.name === "Christmas" || holiday?.name === "New Year"

  return (
    <>
      <nav className="seasonal-navbar" style={{ "--nav-color": color } as any}>
        {/* Snow pile decoration for winter */}
        {isWinter && (
          <div className="snow-pile-nav">
            <img src="https://media.tenor.com/Zy_GvzVLYPQAAAAi/snowflake.gif" alt="" className="snow-deco left" />
            <img src="https://media.tenor.com/Zy_GvzVLYPQAAAAi/snowflake.gif" alt="" className="snow-deco right" />
          </div>
        )}

        <div className="nav-container">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <div className="logo-icon">FT</div>
            <span className="logo-text">FiveM Tools</span>
            {holiday && <span className="logo-badge">{holiday.name}</span>}
          </Link>

          {/* Desktop Menu */}
          <div className="nav-menu desktop">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/scripts" className="nav-link">Scripts</Link>
            <Link href="/mlo" className="nav-link">MLO</Link>
            <Link href="/vehicles" className="nav-link">Vehicles</Link>
            <Link href="/forum" className="nav-link">Forum</Link>
            <Link href="/badges" className="nav-link">Badges</Link>
          </div>

          {/* Actions */}
          <div className="nav-actions">
            <LanguageSelector />
            
            {user ? (
              <>
                <button className="nav-icon-btn">
                  <Bell className="h-5 w-5" />
                  <span className="notification-dot" />
                </button>
                
                <Link href="/dashboard" className="nav-user">
                  <img src={user.avatar} alt="" className="user-avatar" />
                  <span className="user-name">{user.username}</span>
                </Link>
              </>
            ) : (
              <button onClick={login} className="nav-login-btn">
                <User className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}

            {/* Mobile Toggle */}
            <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mobile-menu">
            <Link href="/" className="mobile-link">Home</Link>
            <Link href="/scripts" className="mobile-link">Scripts</Link>
            <Link href="/mlo" className="mobile-link">MLO</Link>
            <Link href="/vehicles" className="mobile-link">Vehicles</Link>
            <Link href="/forum" className="mobile-link">Forum</Link>
            <Link href="/badges" className="mobile-link">Badges</Link>
          </div>
        )}

        {/* Glow Effect */}
        <div className="nav-glow" />
      </nav>

      <style jsx>{`
        .seasonal-navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: radial-gradient(
              47.2% 50% at 50.39% 88.37%,
              rgba(255, 255, 255, 0.08) 0%,
              rgba(255, 255, 255, 0) 100%
            ),
            rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
        }

        .snow-pile-nav {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }

        .snow-deco {
          position: absolute;
          width: 40px;
          height: 40px;
          opacity: 0.3;
          animation: float 3s ease-in-out infinite;
        }

        .snow-deco.left {
          left: 5%;
          top: 50%;
          transform: translateY(-50%);
        }

        .snow-deco.right {
          right: 5%;
          top: 50%;
          transform: translateY(-50%);
          animation-delay: 1.5s;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          transition: transform 0.3s ease;
        }

        .nav-logo:hover {
          transform: scale(1.05);
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--nav-color), transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          box-shadow: 0 0 20px var(--nav-color);
          position: relative;
        }

        .logo-icon::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, var(--nav-color), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .logo-text {
          font-weight: 700;
          font-size: 18px;
          background: linear-gradient(135deg, var(--nav-color), rgba(255, 255, 255, 0.9));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .logo-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          background: var(--nav-color);
          color: rgba(255, 255, 255, 0.9);
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 0 10px var(--nav-color);
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          justify-content: center;
        }

        .nav-menu.desktop {
          display: none;
        }

        @media (min-width: 768px) {
          .nav-menu.desktop {
            display: flex;
          }
        }

        .nav-link {
          padding: 8px 16px;
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .nav-link:hover {
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-link::before {
          content: "";
          position: absolute;
          bottom: -5px;
          left: 0;
          right: 0;
          height: 12px;
          background: url('https://media.tenor.com/Zy_GvzVLYPQAAAAi/snowflake.gif') center/contain no-repeat;
          opacity: 0;
          transition: all 0.4s ease;
        }

        .nav-link:hover::before {
          opacity: 0.6;
          bottom: -2px;
        }

        .nav-link::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: var(--nav-color);
          transition: width 0.3s ease;
          box-shadow: 0 0 10px var(--nav-color);
        }

        .nav-link:hover::after {
          width: 80%;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .nav-icon-btn::before {
          content: "";
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 20px;
          background: url('https://media.tenor.com/Zy_GvzVLYPQAAAAi/snowflake.gif') center/contain no-repeat;
          opacity: 0;
          transition: all 0.4s ease;
        }

        .nav-icon-btn:hover::before {
          opacity: 0.8;
          bottom: -8px;
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--nav-color);
          box-shadow: 0 0 10px var(--nav-color);
          animation: pulse 2s ease-in-out infinite;
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px 6px 6px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .nav-user:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--nav-color);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          object-fit: cover;
          border: 2px solid var(--nav-color);
        }

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          display: none;
        }

        @media (min-width: 640px) {
          .user-name {
            display: block;
          }
        }

        .nav-login-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--nav-color), transparent);
          border: 1px solid var(--nav-color);
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 20px var(--nav-color);
        }

        .nav-login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 30px var(--nav-color);
        }

        .mobile-toggle {
          display: flex;
          width: 40px;
          height: 40px;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
        }

        @media (min-width: 768px) {
          .mobile-toggle {
            display: none;
          }
        }

        .mobile-menu {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 16px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.3);
        }

        @media (min-width: 768px) {
          .mobile-menu {
            display: none;
          }
        }

        .mobile-link {
          padding: 12px 16px;
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .mobile-link:hover {
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-glow {
          position: absolute;
          inset: -100px;
          background: radial-gradient(circle at 50% 0%, var(--nav-color) 0%, transparent 50%);
          opacity: 0.1;
          z-index: -1;
          filter: blur(40px);
          pointer-events: none;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  )
}
