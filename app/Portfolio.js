"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Tag = ({ t }) => <span className={"tag" + (t.toLowerCase() === "live" ? " r" : "")}>{t}</span>;

const fadeUp = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const Sec = ({ id, l, children }) => (
  <section className="sec" id={id}>
    <motion.div className="w" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
      <motion.div className="m" variants={fadeUp}>{l.tag}</motion.div>
      <motion.h2 variants={fadeUp}>{l.title}</motion.h2>
      {children}
    </motion.div>
  </section>
);

export default function Portfolio({ c }) {
  const p = c.profile, L = c.labels;
  const [q, setQ] = useState(0);
  const [open, setOpen] = useState(() => c.projects.map((x) => !!x.open));
  const [pal, setPal] = useState(false);
  const [clk, setClk] = useState("--:--");

  useEffect(() => {
    const tick = () => setClk(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }));
    tick(); const t = setInterval(tick, 30000);
    const key = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setPal((v) => !v); } if (e.key === "Escape") setPal(false); };
    document.addEventListener("keydown", key);
    return () => { clearInterval(t); document.removeEventListener("keydown", key); };
  }, []);

  const nav = [["ask", L.ask], ["work", L.work], ["stack", L.stack], ["path", L.path], ["how", L.how], ["contact", L.contact]];
  const mail = "mailto:" + p.email;

  return (<>
    <div className="top"><div className="w">
      <a className="brand" href="#top">{p.name}</a>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span className="pill hide" tabIndex={0}><i /><span className="pill-txt">{p.status} · {clk} Lagos</span></span>
        <button className="k" onClick={() => setPal(true)} aria-label="Open navigation menu">Jump to ⌘K</button>
      </div>
    </div></div>

    <main id="top">
      <section className="hero"><div className="w">
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.div className="m" variants={fadeUp}>{p.role}</motion.div>
          <motion.h1 variants={fadeUp}>{p.first}<br /><span>{p.last}</span></motion.h1>
          <motion.p className="l" variants={fadeUp}>{p.tagline}</motion.p>
          <motion.div variants={fadeUp}>
            <motion.a className="bt" href={mail} whileHover={{ y: -3 }} whileTap={{ y: 0 }}>{p.primaryButton}</motion.a>
            <motion.a className="bt g" href="#work" whileHover={{ y: -3 }} whileTap={{ y: 0 }}>{p.secondaryButton}</motion.a>
          </motion.div>
        </motion.div>
        {p.photo ? (
          <motion.div className="phw" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            {p.arrows !== false && (p.callouts || []).slice(0, 4).map((t, i) => t ? (
              <div key={i}>
                <svg className={"ar2 s" + i} viewBox="0 0 72 72" aria-hidden="true" style={{ "--d": `${0.4 + i * 0.35}s` }}>
                  <path className="c" pathLength="1" d="M8 10Q60 6 62 58" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                  <path className="h" d="M52 46L62 58L72 47" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className={"co s" + i} style={{ "--d": `${0.3 + i * 0.35}s` }}>{t}</span>
              </div>) : null)}
            <img className="ph" src={p.photo} alt={p.name} />
          </motion.div>) : null}
      </div></section>

      <Sec id="ask" l={L.ask}><div className="qa">
        <div className="chips">{c.ask.map((x, i) => (
          <motion.button key={i} aria-pressed={q === i} onClick={() => setQ(i)} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>{x.q}</motion.button>))}
        </div>
        <div className="ans" aria-live="polite">
          <span className="m">Answer</span>
          <AnimatePresence mode="wait">
            <motion.div key={q} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {c.ask[q]?.a}
            </motion.div>
          </AnimatePresence>
        </div>
      </div></Sec>

      <Sec id="work" l={L.work}><div className="cases">{c.projects.map((x, i) => (
        <motion.div className="case" key={i} variants={fadeUp}>
          <button aria-expanded={!!open[i]} onClick={() => setOpen(open.map((v, j) => (j === i ? !v : v)))}>
            <span className="n">{String(i + 1).padStart(2, "0")}</span>
            <span><h3>{x.title}</h3>{x.tags.map((t, k) => <Tag key={k} t={t} />)}</span>
            <motion.span className="pl" animate={{ rotate: open[i] ? 45 : 0 }}>+</motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open[i] && (
              <motion.div className="bd" style={{ display: "grid" }}
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}>
                {x.problem && <div><h4>Problem</h4><p>{x.problem}</p></div>}
                {x.built && <div><h4>What I built</h4><p>{x.built}</p></div>}
                {x.statusText && <div><h4>Status</h4><p>{x.statusText}</p></div>}
                {x.stack && <div><h4>Stack</h4><p>{x.stack}</p></div>}
                {x.linkUrl && <div><h4>See it</h4><p><a href={x.linkUrl}>{x.linkLabel || x.linkUrl}</a></p></div>}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>))}
      </div></Sec>

      <Sec id="stack" l={L.stack}><div className="stack">{c.stack.map((g, i) => (
        <motion.div key={i} variants={fadeUp}><h3 style={{ fontSize: 18, marginBottom: 8 }}>{g.group}</h3>{g.tags.map((t, k) => <span className="tag" key={k}>{t}</span>)}</motion.div>))}
      </div></Sec>

      <Sec id="path" l={L.path}><ul className="tl">{c.timeline.map((x, i) => (
        <motion.li key={i} variants={fadeUp}><b>{x.when}</b><p>{x.what}</p></motion.li>))}</ul></Sec>

      <Sec id="how" l={L.how}><div className="pr">{c.principles.map((x, i) => (
        <motion.div key={i} variants={fadeUp}>
          <span className="pn">{String(i + 1).padStart(2, "0")}</span>
          <h3>{x.title}</h3><p>{x.text}</p>
        </motion.div>))}</div></Sec>
    </main>

    <section className="ct" id="contact"><div className="w">
      <div className="ct-copy">
        <div className="m" style={{ color: "#fff" }}>{L.contact.tag}</div>
        <h2>{L.contact.title}</h2>
        <p style={{ margin: "18px 0 22px", opacity: 0.9, maxWidth: "40ch" }}>{c.contact.note}</p>
        <motion.a className="bt" href={mail} whileHover={{ y: -3 }} whileTap={{ y: 0 }}>{p.email}</motion.a>
        {c.contact.demoUrl && <motion.a className="bt g" href={c.contact.demoUrl} whileHover={{ y: -3 }} whileTap={{ y: 0 }}>{c.contact.demoLabel}</motion.a>}
        <p style={{ margin: "22px 0 0" }}>{c.socials.map((s, i) => <motion.a key={i} className="bt g" href={s.url} whileHover={{ y: -3 }} whileTap={{ y: 0 }}>{s.label}</motion.a>)}</p>
      </div>
    </div></section>
    <footer><div className="w">© {new Date().getFullYear()} {p.name}</div></footer>

    {pal && <div id="pal" className="on" role="dialog" aria-label="Jump to section" onClick={() => setPal(false)}><div>
      {nav.map(([id, l], i) => <a key={id} href={"#" + id}>{l.title.replace(/[.]$/, "")} <span className="m">{String(i + 1).padStart(2, "0")}</span></a>)}
    </div></div>}
  </>);
}