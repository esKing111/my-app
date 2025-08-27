import React from "react";

export default function AboutPage() {
  return (
    <section aria-label="About Page" style={{ maxWidth: 600, margin: "2rem auto", padding: "2rem", background: "var(--background)", color: "var(--foreground)", borderRadius: 8, border: "1px solid var(--foreground)" }}>
      <h2>About</h2>
      <p><strong>Name:</strong> Your Name</p>
      <p><strong>Student Number:</strong> 123456</p>
      <div style={{ margin: "1rem 0" }}>
        <strong>How to use this website:</strong>
        <ul>
          <li>Use the Home page to generate HTML5 + JS code.</li>
          <li>Copy the code and paste it into a blank file (e.g., Hello.html).</li>
          <li>Open the file in your web browser to see the result.</li>
        </ul>
      </div>
      <div style={{ margin: "1rem 0" }}>
        <strong>Demo Video:</strong>
        <div style={{ border: "1px solid var(--foreground)", borderRadius: 6, overflow: "hidden", background: "var(--background)" }}>
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Demo Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
        </div>
      </div>
    </section>
  );
}
