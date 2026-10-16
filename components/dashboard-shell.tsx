"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createAuthClient } from "better-auth/react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  ChevronsUpDown,
  House,
  LogOut,
  Mail,
  Palette,
  Settings2,
  UserRound,
  Zap,
} from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";

const client = createAuthClient();
const navigation = [
  { label: "Overview", href: "/dashboard", icon: House },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound },
  { label: "Themes", href: "/dashboard/themes", icon: Palette },
  { label: "Messages", href: "/dashboard/messages", icon: Mail },
  { label: "Settings", href: "/dashboard/settings", icon: Settings2 },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const current =
    navigation.find((item) => item.href === pathname) || navigation[0];

  async function signOut() {
    await client.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <Link
          href="/dashboard"
          className="dashboard-brand"
          aria-label="Profile Studio home"
        >
          <span className="dashboard-brand-mark">
            <Zap size={19} fill="currentColor" strokeWidth={2.5} />
          </span>
          <span className="dashboard-brand-copy">
            <strong>Arzur Sanctum</strong>
            <small>PROFILE STUDIO</small>
          </span>
        </Link>

        <div className="workspace-picker" aria-label="Current workspace">
          <div className="workspace-avatar">
            <UserRound size={17} />
          </div>
          <div>
            <strong>My workspace</strong>
            <span>Personal profile</span>
          </div>
          <ChevronsUpDown size={15} className="workspace-chevron" />
        </div>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className={`dashboard-nav-link${pathname === item.href ? " active" : ""}`}
                href={item.href}
                key={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
                {pathname === item.href && <span className="nav-active-dot" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <Activity size={15} />
            <span>Profile controls</span>
            <span className="status-led" />
          </div>
          <Link href="/" className="sidebar-utility">
            View public profile <ArrowUpRight size={16} />
          </Link>
          <button className="sidebar-utility" type="button" onClick={signOut}>
            Sign out <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="dashboard-frame">
        <div className="dashboard-topbar">
          <div className="dashboard-breadcrumb">
            <span>Workspace</span>
            <span className="crumb-divider">/</span>
            <strong>{current.label}</strong>
          </div>
          <div className="topbar-right">
            <span className="topbar-live">
              <i /> STUDIO ONLINE
            </span>
            <ModeToggle />
            <span className="topbar-avatar">
              <UserRound size={17} />
            </span>
          </div>
        </div>
        <main className="dashmain" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
