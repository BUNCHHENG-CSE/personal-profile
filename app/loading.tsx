import { Zap } from "lucide-react";
import Link from "next/link";

export default function Loading() {
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
          <p className="public-kicker">LOADING PROFILE</p>
          <h1>
            Just a<br />
            <em>moment.</em>
          </h1>
          <p>Putting this space together.</p>
        </div>
      </div>
    </main>
  );
}
