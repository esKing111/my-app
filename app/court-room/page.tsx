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

  // Define game state and stages
  const gameStages = [
    {
      id: 1,
      name: "Boss Tasks",
      messages: [
        "Complete sprint 1",
        "Fix the title color to red",
        "Update alt text in image 1",
      ],
    },
    {
      id: 2,
      name: "Family Requests",
      messages: [
        "Pick up the kids after work",
        "Help with dinner",
      ],
    },
    {
      id: 3,
      name: "Friends Messages",
      messages: [
        "Join us for a movie",
        "Can you lend me your car?",
      ],
    },
  ];

  // Define penalties for denying tasks
  const penalties = {
    boss: "Courtroom appearance for breaking company policy",
    family: "Courtroom appearance for neglecting family duties",
    friends: "Courtroom appearance for breaking social commitments",
  };

  // Define message type
  interface Message {
    stage: string;
    message: string;
  }

  // Initialize state with correct type
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      const stage = gameStages[Math.floor(Math.random() * gameStages.length)];
      const message = stage.messages[Math.floor(Math.random() * stage.messages.length)];
      setCurrentMessages((prev) => [...prev, { stage: stage.name, message }]);
    }, 20000);

    return () => clearInterval(messageInterval);
  }, []);

  // Handle user actions and penalties
  const handleAction = (action: 'accept' | 'deny', message: Message) => {
    const stageKey = message.stage.toLowerCase() as keyof typeof penalties;
    if (action === 'deny') {
      alert(`Penalty: ${penalties[stageKey]}`);
      // Trigger court scene logic here
    } else {
      alert(`Task accepted: ${message.message}`);
    }

    // Remove the message from the queue
    setCurrentMessages((prev) => prev.filter((m) => m !== message));
  };

  // Integrate game logic with courtroom page
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
      {/* Timer and Lady Justice emblem */}
      <div
        style={{
          position: 'absolute',
          top: '19%',
          left: '16.5%',
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

      {/* Inbox UI */}
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '90%',
          height: '30%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          overflowY: 'auto',
          padding: '1rem',
        }}
      >
        <h3 style={{ marginBottom: '1rem' }}>Inbox</h3>
        {currentMessages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
              padding: '0.5rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <span>{message.message}</span>
            <div>
              <button
                onClick={() => handleAction('accept', message)}
                style={{
                  marginRight: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Accept
              </button>
              <button
                onClick={() => handleAction('deny', message)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Deny
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
