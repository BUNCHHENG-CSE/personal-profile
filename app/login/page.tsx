import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Sparkles, Zap } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { ModeToggle } from "@/components/mode-toggle";

export default function Login() {
  return (
    <main className="login-layout">
      <section className="login-showcase">
        <Link href="/" className="dashboard-brand light-brand">
          <span className="dashboard-brand-mark">
            <Zap size={19} fill="currentColor" />
          </span>
          <span className="dashboard-brand-copy">
            <strong>Arzur Sanctum</strong>
            <small>PROFILE STUDIO</small>
          </span>
        </Link>
        <div className="login-orbit orbit-one" />
        <div className="login-orbit orbit-two" />
        <div className="login-star star-one">✦</div>
        <div className="login-star star-two">✧</div>
        <div className="login-showcase-content">
          <div className="login-kicker">
            <Sparkles size={16} /> YOUR SPACE, YOUR SIGNAL
          </div>
          <h1>
            Make a<br />
            lasting <em>impression.</em>
          </h1>
          <p>One personal corner of the internet, shaped entirely by you.</p>
          <div className="login-showcase-line">
            <span>CREATE. CONNECT. EXPRESS.</span>
            <ArrowUpRight size={18} />
          </div>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-panel-top">
          <Link href="/" className="back-link">
            <ArrowLeft size={17} /> Back to profile
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <ModeToggle />
            <span>PRIVATE ACCESS</span>
          </div>
        </div>
        <div className="login-panel-inner">
          <div className="login-icon">
            <Zap size={22} fill="currentColor" />
          </div>
          <p className="section-kicker">
            <span /> WELCOME BACK
          </p>
          <h2>
            Sign in to your
            <br />
            <span>studio.</span>
          </h2>
          <p className="login-description">
            Manage your profile, follow your audience, and keep everything
            feeling like you.
          </p>
          <LoginForm />
          <p className="login-help">
            This area is for the profile owner only. Public registration is
            closed.
          </p>
        </div>
        <div className="login-panel-footer">
          <span>© {new Date().getFullYear()} afterglow</span>
          <span>Made for your corner of the web.</span>
        </div>
      </section>
    </main>
  );
}
