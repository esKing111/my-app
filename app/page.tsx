
"use client";
import React, { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const [html, setHtml] = useState(`<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\"/>
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>
  <title>Hello</title>
  <script>
    window.addEventListener('DOMContentLoaded', function(){
      console.log('Hello from inline JS');
    });
  </script>
  
  
</head>
<body style=\"font-family: Arial, Helvetica, sans-serif; padding: 16px; background:#ffffff; color:#171717;\">
  <h1 style=\"margin:0 0 12px 0;\">Hello, World!</h1>
  <p>This is a minimal example with <strong>inline CSS</strong> and inline JS.</p>
</body>
</html>`);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) { doc.open(); doc.write(html); doc.close(); }
    }
  }, [html]);

  const copy = async () => {
    await navigator.clipboard.writeText(html);
    alert("Code copied to clipboard!");
  };

  return (
    <section aria-label="Home Page" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <h2>Output HTML5 + JS + Inline CSS (No Classes)</h2>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={16}
          style={{ width: "100%", fontFamily: "monospace", fontSize: "0.9rem", background:"var(--background)", color:"var(--foreground)", border:"1px solid var(--foreground)" }}
          aria-label="Generated full HTML document"
        />
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button onClick={copy}>Copy Code</button>
        </div>
      </div>
      <div>
        <strong>Preview</strong>
        <div style={{ border: "2px solid var(--foreground)", marginTop: 8, background: "var(--background)", color: "var(--foreground)" }}>
          <iframe ref={iframeRef} title="Preview" style={{ width: "100%", height: 360, border: 0 }} />
        </div>
      </div>
    </section>
  );
}
