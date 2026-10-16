"use client";

import { Zap } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="public-scene scene aurora">
      <div className="setup-shell">
        <Link href="/" className="public-brand">
          <span className="public-brand-mark">
            <Zap size={18} fill="currentColor" />
          </span>
          <strong>
            Arzur Sanctum<span>.</span>
          </strong>
        </Link>
        <div className="setup-content">
          <p className="public-kicker">UNAVAILABLE</p>
          <h1>
            Something
            <br />
            <em>went wrong.</em>
          </h1>
          <p>Please try again in a moment.</p>
          <button
            className="public-button public-button-primary"
            onClick={reset}
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
