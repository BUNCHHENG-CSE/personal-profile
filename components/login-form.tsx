"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAuthClient } from "better-auth/react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

const client = createAuthClient();

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await client.signIn.email({ email, password });
      if (result.error) throw new Error();
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Those credentials did not work. Check them and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label className="form-field">
        <span>Email address</span>
        <div className="icon-input">
          <Mail size={17} />
          <input
            className="input"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </div>
      </label>
      <label className="form-field">
        <span>Password</span>
        <div className="icon-input">
          <LockKeyhole size={17} />
          <input
            className="input"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />
          <button
            type="button"
            className="password-visibility"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </label>
      {error && (
        <div role="alert" className="notice notice-error">
          {error}
        </div>
      )}
      <button
        className="button button-primary login-submit"
        disabled={loading}
        type="submit"
      >
        <span>{loading ? "Signing in..." : "Sign in"}</span>
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
