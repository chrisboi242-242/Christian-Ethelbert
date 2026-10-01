"use client";
import { useEffect, useRef, useState } from "react";

export default function SignIn({ clientId }) {
  const box = useRef(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (r) => {
          const res = await fetch("/api/auth/google", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ credential: r.credential }) });
          if (res.ok) location.href = "/admin";
          else setErr("This Google account is not allowed.");
        },
      });
      window.google.accounts.id.renderButton(box.current, { theme: "filled_black", size: "large", shape: "pill" });
    };
    document.body.appendChild(s);
    return () => s.remove();
  }, [clientId]);

  return (
    <div className="si">
      <div className="si-card">
        <span className="si-mark" />
        <h1>Studio</h1>
        <p>Sign in with the Google account for this portfolio.</p>
        <div className="si-btn" ref={box} />
        {err && <p className="si-err">{err}</p>}
      </div>
      <span className="si-foot">Only the site owner can sign in here.</span>
    </div>
  );
}