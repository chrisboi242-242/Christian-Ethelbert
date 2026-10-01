"use client";
import { useState } from "react";

const blank = (v) => Array.isArray(v) ? [] : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)])) : typeof v === "boolean" ? false : "";

function resize(file, max = 640) {
  return new Promise((res, rej) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement("canvas"); cv.width = img.width * s; cv.height = img.height * s;
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url); res(cv.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = rej; img.src = url;
  });
}

const SECTIONS = [
  { id: "profile", n: "01", label: "Profile" },
  { id: "ask", n: "02", label: "Ask me", key: "ask" },
  { id: "work", n: "03", label: "Work", key: "work" },
  { id: "stack", n: "04", label: "Stack", key: "stack" },
  { id: "path", n: "05", label: "Path", key: "path" },
  { id: "how", n: "06", label: "Principles", key: "how" },
  { id: "contact", n: "07", label: "Contact", key: "contact" },
];

function Field({ label, value, onChange, long }) {
  return (
    <div className="stu-field">
      <label>{label}</label>
      {long ? <textarea value={value} onChange={(e) => onChange(e.target.value)} /> : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

function Chips({ items, onChange, max }) {
  const [draft, setDraft] = useState("");
  const add = () => { if (!draft.trim() || (max && items.length >= max)) return; onChange([...items, draft.trim()]); setDraft(""); };
  return (
    <div>
      <div className="stu-row">
        {items.map((t, i) => (
          <span className="stu-chip" key={i}>{t}<button onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove">×</button></span>
        ))}
      </div>
      {(!max || items.length < max) && (
        <div className="stu-additem" style={{ marginTop: 8 }}>
          <input type="text" placeholder="Add..." value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
          <button className="sm" onClick={add}>Add</button>
        </div>
      )}
    </div>
  );
}

function ListEditor({ items, onChange, empty, render }) {
  const move = (i, d) => { const a = [...items]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; onChange(a); };
  const update = (i, v) => onChange(items.map((x, j) => (j === i ? v : x)));
  const del = (i) => onChange(items.filter((_, j) => j !== i));
  return (
    <div>
      {items.map((it, i) => (
        <div className="stu-item" key={i}>
          <div className="stu-itembar">
            <button className="sm" onClick={() => move(i, -1)}>↑</button>
            <button className="sm" onClick={() => move(i, 1)}>↓</button>
            <button className="sm" onClick={() => del(i)}>Delete</button>
          </div>
          {render(it, (v) => update(i, v))}
        </div>
      ))}
      <button className="sm" style={{ marginTop: items.length ? 14 : 0 }} onClick={() => onChange([...items, empty])}>+ Add</button>
    </div>
  );
}

export default function Editor({ initial }) {
  const [data, setData] = useState(initial);
  const [active, setActive] = useState("profile");
  const [railOpen, setRailOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k, v) => setData({ ...data, [k]: v });
  const p = data.profile, sec = SECTIONS.find((s) => s.id === active);
  const lbl = sec.key ? data.labels[sec.key] : null;
  const setLbl = (v) => setData({ ...data, labels: { ...data.labels, [sec.key]: v } });

  async function save() {
    setMsg("Saving…");
    const r = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setMsg(r.ok ? "Saved. Your live site updates within seconds." : r.status === 401 ? "Session expired. Sign in again." : r.status === 503 ? "Could not reach the database. Check your connection and try again." : "Save failed. Check the fields and try again.");
  }

  return (
    <div className="stu">
      <nav className={"stu-rail" + (railOpen ? " open" : "")}>
        {SECTIONS.map((s) => (
          <button key={s.id} aria-current={active === s.id} onClick={() => { setActive(s.id); setRailOpen(false); }}>
            <span className="num">{s.n}</span>{s.label}
          </button>
        ))}
      </nav>

      <div className="stu-main">
        <div className="stu-top">
          <button className="k stu-menu-btn" onClick={() => setRailOpen(!railOpen)}>☰ Sections</button>
          <span style={{ fontWeight: 700 }}>Studio</span>
          <div style={{ display: "flex", gap: 10 }}>
            <a className="k" href="/" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>View site</a>
            <button className="k" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/"; }}>Sign out</button>
          </div>
        </div>

        <div className="stu-tag">{sec.n} · {sec.label.toUpperCase()}</div>
        <h1 className="stu-h1">Edit {sec.label.toLowerCase()}</h1>

        {lbl && (
          <div className="stu-card">
            <Field label="Section tag" value={lbl.tag} onChange={(v) => setLbl({ ...lbl, tag: v })} />
            <Field label="Section title" value={lbl.title} onChange={(v) => setLbl({ ...lbl, title: v })} />
          </div>
        )}

        {active === "profile" && (
          <>
            <div className="stu-card">
              {p.photo && <img className="stu-photo" src={p.photo} alt="" />}
              <div className="stu-row">
                <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files[0]; if (f) set("profile", { ...p, photo: await resize(f) }); }} />
                {p.photo && <button className="sm" onClick={() => set("profile", { ...p, photo: "" })}>Remove photo</button>}
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, color: "var(--mut)" }}>
                <input type="checkbox" checked={p.arrows !== false} onChange={(e) => set("profile", { ...p, arrows: e.target.checked })} /> Show floating arrows
              </label>
              <div className="stu-field" style={{ marginTop: 14 }}>
                <label>Notes on the arrows (up to 4)</label>
                <Chips items={p.callouts || []} max={4} onChange={(v) => set("profile", { ...p, callouts: v })} />
              </div>
            </div>
            <div className="stu-card">
              <Field label="First name" value={p.first} onChange={(v) => set("profile", { ...p, first: v })} />
              <Field label="Last name" value={p.last} onChange={(v) => set("profile", { ...p, last: v })} />
              <Field label="Role line" value={p.role} onChange={(v) => set("profile", { ...p, role: v })} />
              <Field label="Tagline" long value={p.tagline} onChange={(v) => set("profile", { ...p, tagline: v })} />
              <Field label="Status" value={p.status} onChange={(v) => set("profile", { ...p, status: v })} />
              <Field label="Email" value={p.email} onChange={(v) => set("profile", { ...p, email: v })} />
              <Field label="Primary button" value={p.primaryButton} onChange={(v) => set("profile", { ...p, primaryButton: v })} />
              <Field label="Secondary button" value={p.secondaryButton} onChange={(v) => set("profile", { ...p, secondaryButton: v })} />
            </div>
          </>
        )}

        {active === "ask" && (
          <div className="stu-card">
            <ListEditor items={data.ask} onChange={(v) => set("ask", v)} empty={{ q: "", a: "" }} render={(it, upd) => (<>
              <Field label="Question" value={it.q} onChange={(v) => upd({ ...it, q: v })} />
              <Field label="Answer" long value={it.a} onChange={(v) => upd({ ...it, a: v })} />
            </>)} />
          </div>
        )}

        {active === "work" && (
          <div className="stu-card">
            <ListEditor items={data.projects} onChange={(v) => set("projects", v)} empty={blank(data.projects[0]) || { title: "", tags: [], open: false, problem: "", built: "", statusText: "", stack: "", linkLabel: "", linkUrl: "" }} render={(it, upd) => (<>
              <Field label="Title" value={it.title} onChange={(v) => upd({ ...it, title: v })} />
              <div className="stu-field"><label>Tags</label><Chips items={it.tags} onChange={(v) => upd({ ...it, tags: v })} /></div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 12px", fontSize: 13, color: "var(--mut)" }}>
                <input type="checkbox" checked={!!it.open} onChange={(e) => upd({ ...it, open: e.target.checked })} /> Open by default on the site
              </label>
              <Field label="Problem" long value={it.problem} onChange={(v) => upd({ ...it, problem: v })} />
              <Field label="What I built" long value={it.built} onChange={(v) => upd({ ...it, built: v })} />
              <Field label="Status" long value={it.statusText} onChange={(v) => upd({ ...it, statusText: v })} />
              <Field label="Stack" value={it.stack} onChange={(v) => upd({ ...it, stack: v })} />
              <Field label="Link label" value={it.linkLabel} onChange={(v) => upd({ ...it, linkLabel: v })} />
              <Field label="Link URL" value={it.linkUrl} onChange={(v) => upd({ ...it, linkUrl: v })} />
            </>)} />
          </div>
        )}

        {active === "stack" && (
          <div className="stu-card">
            <ListEditor items={data.stack} onChange={(v) => set("stack", v)} empty={{ group: "", tags: [] }} render={(it, upd) => (<>
              <Field label="Group name" value={it.group} onChange={(v) => upd({ ...it, group: v })} />
              <div className="stu-field"><label>Tags</label><Chips items={it.tags} onChange={(v) => upd({ ...it, tags: v })} /></div>
            </>)} />
          </div>
        )}

        {active === "path" && (
          <div className="stu-card">
            <ListEditor items={data.timeline} onChange={(v) => set("timeline", v)} empty={{ when: "", what: "" }} render={(it, upd) => (<>
              <Field label="When" value={it.when} onChange={(v) => upd({ ...it, when: v })} />
              <Field label="What" long value={it.what} onChange={(v) => upd({ ...it, what: v })} />
            </>)} />
          </div>
        )}

        {active === "how" && (
          <div className="stu-card">
            <ListEditor items={data.principles} onChange={(v) => set("principles", v)} empty={{ title: "", text: "" }} render={(it, upd) => (<>
              <Field label="Title" value={it.title} onChange={(v) => upd({ ...it, title: v })} />
              <Field label="Text" long value={it.text} onChange={(v) => upd({ ...it, text: v })} />
            </>)} />
          </div>
        )}

        {active === "contact" && (
          <>
            <div className="stu-card">
              <Field label="Note" long value={data.contact.note} onChange={(v) => set("contact", { ...data.contact, note: v })} />
              <Field label="Demo button label" value={data.contact.demoLabel} onChange={(v) => set("contact", { ...data.contact, demoLabel: v })} />
              <Field label="Demo URL" value={data.contact.demoUrl} onChange={(v) => set("contact", { ...data.contact, demoUrl: v })} />
            </div>
            <div className="stu-card">
              <ListEditor items={data.socials} onChange={(v) => set("socials", v)} empty={{ label: "", url: "" }} render={(it, upd) => (<>
                <Field label="Label" value={it.label} onChange={(v) => upd({ ...it, label: v })} />
                <Field label="URL" value={it.url} onChange={(v) => upd({ ...it, url: v })} />
              </>)} />
            </div>
          </>
        )}
      </div>

      <div className="stu-bar">
        <span style={{ fontSize: 13, marginRight: "auto" }}>{msg}</span>
        <button className="bt" onClick={save}>Save changes</button>
      </div>
    </div>
  );
}