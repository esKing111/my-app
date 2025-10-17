"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function CourtRoomPage() {
  // Timer state (seconds)
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate clock hands
  const now = new Date(seconds * 1000);
  const sec = now.getUTCSeconds();
  const min = now.getUTCMinutes();
  const hour = now.getUTCHours() % 12;
  const secAngle = sec * 6;
  const minAngle = min * 6 + sec * 0.1;
  const hourAngle = hour * 30 + min * 0.5;

  return (
    <main
      style={{
        height: '100vh',
        width: '100vw',
        backgroundImage: 'url(/courtroom-bg.jpg)',
        backgroundSize: '100vw 100vh',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
      aria-label="Court Room Page"
    >
      {/* Visually hidden image for accessibility */}
      <Image
        src="/courtroom-bg.jpg"
        alt="Courtroom background with judge's desk and scales of justice"
        fill
        style={{ display: 'none' }}
        priority
      />

      {/* Digital wall clock beside the window */}
      <div
        style={{
          position: 'absolute',
          top: '19%', // visually aligns with the window's vertical center
          left: '16.5%', // closer to the window's right edge
          zIndex: 2,
          width: 120,
          height: 120,
          background: 'radial-gradient(circle at 60% 40%, #fffbe9 70%, #e7d3b1 100%)',
          borderRadius: '50%',
          boxShadow: '0 4px 16px 2px rgba(120, 80, 30, 0.18), 0 0 0 10px #e7d3b1, 0 0 0 16px #b48a5a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '5px solid #b48a5a',
          fontFamily: 'monospace',
          transition: 'box-shadow 0.2s',
          boxSizing: 'border-box',
        }}
        aria-label="Wall digital clock timer"
      >
        <span
          style={{
            fontSize: '2.8rem',
            color: '#7a5c2e',
            letterSpacing: '2px',
            fontWeight: 700,
            textShadow: '0 1px 2px #fffbe9',
            userSelect: 'none',
            width: '100%',
            textAlign: 'center',
            lineHeight: 1,
          }}
        >
          {String(Math.floor((seconds / 60) % 60)).padStart(2, '0')}
          :
          {String(seconds % 60).padStart(2, '0')}
        </span>
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '2rem', height: '100%', width: '100%' }}>
        <h2>Court Room</h2>
        <p>This page is under construction.</p>
      </div>
      {/* Lady Justice emblem on the wall */}
      <div style={{ position: 'absolute', right: '8%', top: '14%', zIndex: 10 }}>
        <Image
          src="/lady-justice.jpg"
          alt="Lady Justice emblem"
          width={120}
          height={120}
          style={{ borderRadius: '50%' }}
          priority
        />
      </div>
    </main>
  );
}
