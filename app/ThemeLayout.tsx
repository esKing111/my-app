"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const STUDENT_NAME = "Elon Shrestha";
const STUDENT_NUMBER = "21740764";

function getCurrentDate() {
  return new Date().toLocaleDateString();
}



export default function ThemeLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const tabs = [
  { name: "Tabs", href: "/tabs" },
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Escape Room", href: "/escape-room" },
    { name: "Coding Races", href: "/coding-races" },
    { name: "Court Room", href: "/court-room" },
  ];
  const [activeTab, setActiveTab] = useState(pathname || "/");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme === "dark") setDarkMode(true);
    const savedTab = window.localStorage.getItem("activeTab");
    if (savedTab) setActiveTab(savedTab);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    window.localStorage.setItem("activeTab", activeTab);
    if (pathname !== activeTab) router.push(activeTab);
    // eslint-disable-next-line
  }, [activeTab]);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className={darkMode ? "dark" : "light"}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem",
          borderBottom: "2px solid var(--foreground)",
          background: "var(--background)",
          color: "var(--foreground)",
          position: "relative",
        }}
        aria-label="Main header"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span aria-label="Student Number" style={{ fontWeight: "bold" }}>{STUDENT_NUMBER}</span>
          <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Title</span>
        </div>
        <nav aria-label="Main menu" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          {/* Tabs row (always visible for quick access) */}
          <div
            role="tablist"
            aria-label="Navigation Tabs"
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              position: "static",
            }}
          >
            {tabs.map(tab => (
              <button
                key={tab.href}
                role="tab"
                aria-selected={activeTab === tab.href}
                tabIndex={0}
                style={{
                  padding: "0.5rem 1rem",
                  border: activeTab === tab.href ? "2px solid var(--foreground)" : "1px solid var(--foreground)",
                  background: activeTab === tab.href ? (darkMode ? "#444" : "#eee") : "transparent",
                  color: "var(--foreground)",
                  borderRadius: 4,
                  fontWeight: activeTab === tab.href ? "bold" : "normal",
                  cursor: "pointer",
                  outline: "none",
                }}
                onClick={() => {
                  setActiveTab(tab.href);
                  setMenuOpen(false);
                }}
                aria-label={tab.name}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Dark mode toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>Dark Mode</span>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode((d: boolean) => !d)}
              aria-checked={darkMode}
              aria-label="Toggle dark mode"
              style={{ width: "2rem", height: "1rem" }}
            />
          </label>

          {/* Hamburger menu button (placed to the right of Dark Mode) with CSS transform animation */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="header-menu"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              marginRight: "1rem",
              width: 32,
              height: 28,
              display: "inline-flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
            }}
            onClick={() => setMenuOpen((open) => !open)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setMenuOpen((open) => !open);
              }
            }}
          >
            {/* Three bars that morph into an X using transforms */}
      <span
              aria-hidden
              style={{
                display: "block",
                width: 24,
                height: 2,
        background: "var(--foreground)",
                borderRadius: 2,
                transition: "transform 180ms ease",
                transform: menuOpen ? "translateY(6px) rotate(45deg)" : "translateY(0) rotate(0)",
              }}
            />
            <span
              aria-hidden
              style={{
                display: "block",
                width: 24,
                height: 2,
        background: "var(--foreground)",
                borderRadius: 2,
                transition: "opacity 180ms ease, transform 180ms ease",
                opacity: menuOpen ? 0 : 1,
                transform: menuOpen ? "scaleX(0.5)" : "scaleX(1)",
              }}
            />
            <span
              aria-hidden
              style={{
                display: "block",
                width: 24,
                height: 2,
        background: "var(--foreground)",
                borderRadius: 2,
                transition: "transform 180ms ease",
                transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "translateY(0) rotate(0)",
              }}
            />
          </button>

          {/* Dropdown menu content for hamburger */}
          <div
            id="header-menu"
            ref={menuRef}
            role="menu"
            aria-hidden={!menuOpen}
            style={{
              display: "flex",
              flexDirection: "column",
              position: "absolute",
              right: "1rem",
              top: "3.5rem",
              background: "var(--background)",
              color: "var(--foreground)",
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: "0.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              zIndex: 200,
              minWidth: "180px",
              gap: "0.25rem",
              transform: menuOpen ? "scale(1)" : "scale(0.95)",
              transformOrigin: "top right",
              transition: "transform 160ms ease, opacity 160ms ease",
              opacity: menuOpen ? 1 : 0,
              pointerEvents: menuOpen ? "auto" : "none",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.href}
                role="menuitem"
                onClick={() => {
                  setActiveTab(tab.href);
                  setMenuOpen(false);
                }}
                style={{
                  textAlign: "left",
                  padding: "0.5rem 0.75rem",
                  border: "none",
      background: activeTab === tab.href ? (darkMode ? "#333" : "#eee") : "transparent",
      color: "var(--foreground)",
                  cursor: "pointer",
                  borderRadius: 6,
                }}
                aria-label={`Go to ${tab.name}`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </nav>
      </header>
      <main style={{ minHeight: "70vh", padding: "2rem" }}>{children}</main>
      <footer
        style={{
    borderTop: "2px solid var(--foreground)",
          padding: "1rem",
          textAlign: "center",
    background: "var(--background)",
    color: "var(--foreground)",
        }}
        aria-label="Footer"
      >
        <div>
          &copy; {STUDENT_NAME}, {STUDENT_NUMBER}, {getCurrentDate()}
        </div>
      </footer>
    </div>
  );
}
