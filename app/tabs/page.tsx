"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

// Simple type
type Tab = { id: string; title: string; content: string };

const MAX_TABS = 15;
const STORAGE_KEY = "tabs_builder_state";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function defaultTabs(): Tab[] {
  return [
    { id: uid(), title: "Step 1", content: "Step 1: Describe instructions here" },
    { id: uid(), title: "Step 2", content: "Step 2: Add details" },
  ];
}

export default function TabsBuilderPage() {
  const [tabs, setTabs] = useState<Tab[]>(defaultTabs());
  const [active, setActive] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Tab[];
        if (Array.isArray(parsed) && parsed.length) setTabs(parsed.slice(0, MAX_TABS));
      } catch {}
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  }, [tabs]);

  // Ensure a valid active tab
  useEffect(() => {
    if (!active && tabs.length) setActive(tabs[0].id);
    else if (active && !tabs.find(t => t.id === active)) setActive(tabs[0]?.id ?? null);
  }, [tabs, active]);

  const addTab = () => {
    if (tabs.length >= MAX_TABS) return alert(`Max ${MAX_TABS} tabs`);
    setTabs(prev => [...prev, { id: uid(), title: `Step ${prev.length + 1}`, content: "" }]);
  };

  const removeTab = (id: string) => {
    if (tabs.length <= 1) return alert("At least one tab required");
    setTabs(prev => prev.filter(t => t.id !== id));
  };

  const updateTab = (id: string, patch: Partial<Tab>) => {
    setTabs(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
  };

  // Generate standalone HTML with inline CSS + JS
  const output = useMemo(() => {
    const headings = tabs
      .map((t, idx) =>
        `<button id="tab-${t.id}" role="tab" aria-selected="${idx === 0}" aria-controls="panel-${t.id}" 
          style="padding:6px 10px; border:1px solid #333; background:${idx === 0 ? '#e6e6e6' : '#f7f7f7'}; cursor:pointer; ${idx === 0 ? 'outline:2px solid #333;' : 'outline:none;'}">${escapeHtml(t.title)}</button>`
      )
      .join("\n");

    const panels = tabs
      .map((t, idx) =>
        `<div id="panel-${t.id}" role="tabpanel" aria-labelledby="tab-${t.id}" style="border:1px solid #333; padding:12px; min-height:120px; display:${idx === 0 ? 'block' : 'none'};">${escapeHtml(t.content).replace(/\n/g, "<br/>")}</div>`
      )
      .join("\n");

    const script = `
      (function(){
        var btns = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
        var panels = Array.prototype.slice.call(document.querySelectorAll('[role="tabpanel"]'));
        function styleBtn(b, selected){
          b.setAttribute('aria-selected', String(selected));
          b.style.outline = selected ? '2px solid #333' : 'none';
          b.style.background = selected ? '#e6e6e6' : '#f7f7f7';
        }
        function select(index){
          for(var i=0;i<btns.length;i++){
            styleBtn(btns[i], i===index);
            panels[i].style.display = i===index ? 'block' : 'none';
          }
        }
        btns.forEach(function(btn, i){
          btn.addEventListener('click', function(){ select(i); });
          btn.addEventListener('keydown', function(e){
            if(e.key==='ArrowRight') select((i+1)%btns.length);
            if(e.key==='ArrowLeft') select((i-1+btns.length)%btns.length);
          });
        });
      })();
    `;

  return `<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\"/>\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>\n<title>Tabs</title>\n</head>\n<body style=\"font-family:Arial, Helvetica, sans-serif; padding:16px; background:#ffffff; color:#171717;\">\n<div role=\"tablist\" aria-label=\"Tabs\" style=\"display:flex; gap:8px; margin-bottom:12px;\">\n${headings}\n</div>\n${panels}\n<script>${script}</script>\n</body>\n</html>`;
  }, [tabs]);

  // Update iframe preview when output changes
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(output);
        doc.close();
      }
    }
  }, [output]);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    alert("Generated code copied to clipboard.");
  };

  return (
    <section aria-label="Tabs Builder" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <h2 style={{ marginBottom: 8 }}>Tabs</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <strong>Tabs Headers:</strong>
          <button aria-label="Add tab" onClick={addTab} disabled={tabs.length>=MAX_TABS} style={{ padding: "4px 8px"}}>+</button>
          <span>({tabs.length}/{MAX_TABS})</span>
        </div>
        <div>
          {tabs.map((t, idx) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <input
                aria-label={`Tab ${idx+1} title`}
                value={t.title}
                onChange={(e)=>updateTab(t.id, { title: e.target.value })}
                style={{ padding: 4, minWidth: 140 }}
              />
              <button aria-label={`Remove ${t.title}`} onClick={()=>removeTab(t.id)} disabled={tabs.length<=1}>-</button>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: 16 }}>Tabs Content</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ minWidth: 140 }}>
            {tabs.map(t => (
              <div key={t.id} style={{ marginBottom: 8 }}>
                <button
                  onClick={()=>setActive(t.id)}
                  style={{ padding: "6px 8px", border: active===t.id? "2px solid #333":"1px solid #ccc", background: active===t.id?"#eee":"transparent", width: "100%", textAlign: "left" }}
                >{t.title}</button>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            {active && (
              <textarea
                aria-label="Active tab content"
                value={tabs.find(t=>t.id===active)?.content || ""}
                onChange={(e)=>updateTab(active, { content: e.target.value })}
                rows={12}
                style={{ width: "100%", background:"var(--background)", color:"var(--foreground)", border:"1px solid var(--foreground)" }}
              />
            )}
          </div>
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button onClick={copy}>Copy Output</button>
          <button onClick={()=>setTabs(defaultTabs())}>Reset to Default</button>
          <button onClick={()=>{ localStorage.removeItem(STORAGE_KEY); setTabs(defaultTabs()); }}>Clear Storage</button>
        </div>
      </div>

      <div>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="output" style={{ marginRight: 8 }}><strong>Output</strong></label>
          <textarea id="output" readOnly value={output} rows={10} style={{ width: "100%", fontFamily: "monospace", background: "var(--background)", color: "var(--foreground)", border: "1px solid var(--foreground)" }} />
        </div>
        <div>
          <strong>Preview</strong>
          <div style={{ border: "2px solid var(--foreground)", marginTop: 8, background: "var(--background)", color: "var(--foreground)" }}>
            <iframe ref={iframeRef} title="Preview" style={{ width: "100%", height: 300, border: 0 }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function escapeHtml(str: string) {
  return str
    .replaceAll(/&/g, "&amp;")
    .replaceAll(/</g, "&lt;")
    .replaceAll(/>/g, "&gt;")
    .replaceAll(/"/g, "&quot;")
    .replaceAll(/'/g, "&#039;");
}
