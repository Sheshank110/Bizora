import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IconArrowRight,
  IconCheck,
  IconFolder,
  IconReceipt,
  IconUsers,
  IconChartBar,
  IconSearch,
  IconCircleDot,
  IconCalendar,
  IconCash,
  IconSparkles,
} from '@tabler/icons-react';
import Logo from './Logo';
import { ROUTES } from '../../constants';

/**
 * LayeredBrowserHeroMockup — Signature Layered Windows Hero Visual
 * Matches the reference design structure with layered browser window frames,
 * window control buttons (● ● ●), inner grid structure, and spotlight glow,
 * fully styled in clean white/monochrome theme.
 */
export const GlassmorphismHeroMockup = ({ onOpenDemo, isDemoLoading }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="relative w-full max-w-6xl mx-auto mt-12 sm:mt-16 mb-20 px-2 sm:px-4">
      {/* Ambient Radial Spotlight Glow behind windows */}
      <div 
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[80%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.02)_40%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.02)_40%,transparent_70%)] blur-3xl pointer-events-none"
      />

      {/* Main Desktop Window Frame */}
      <div className="relative bg-[#FFFFFF] dark:bg-[#0A0A0A] rounded-2xl sm:rounded-3xl border border-neutral-200/60 dark:border-white/10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.1),0_0_1px_1px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8),0_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden transition-all">
        {/* Browser Top Window Bar (3 Window Control Dots) */}
        <div className="bg-[#F7F7F7] dark:bg-[#141414] px-4 sm:px-6 py-3 flex items-center justify-between select-none border-b border-neutral-200/40 dark:border-neutral-800/80">
          {/* Window Control Buttons */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E0E0E0] dark:bg-[#2A2A2A]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E0E0E0] dark:bg-[#2A2A2A]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E0E0E0] dark:bg-[#2A2A2A]" />
            <span className="hidden sm:inline-block ml-3 text-[11px] font-mono text-[var(--text-muted)]">
              bizora.app/workspace/operations
            </span>
          </div>

          {/* Central Mock Tab / Breadcrumb */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#EFEFEF] dark:bg-[#1E1E1E] text-[11px] font-medium text-[var(--text-secondary)]">
            <IconSparkles size={12} className="text-[#2563EB]" />
            <span>Enterprise Workspace &bull; v2.4</span>
          </div>

          {/* Right Action Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDemo}
              disabled={isDemoLoading}
              className="text-[11px] font-semibold px-3 py-1 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors"
            >
              {isDemoLoading ? 'Launching...' : 'Interactive Live Demo'}
            </button>
          </div>
        </div>

        {/* Window Inner Content with Geometric Grid Canvas */}
        <div className="p-4 sm:p-7 space-y-6">
          {/* Top Interface Header & Tab Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <div className="flex items-center gap-3">
              <Logo to={ROUTES.HOME} variant="horizontal" size="sm" />
              <span className="text-xs px-2 py-0.5 rounded bg-[#EFEFEF] dark:bg-[#181818] text-[var(--text-muted)] font-mono">
                Acme Global Inc.
              </span>
            </div>

            {/* Interactive Module Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F5F5F5] dark:bg-[#161616] text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-white dark:bg-[#222222] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Executive Overview
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'projects'
                    ? 'bg-white dark:bg-[#222222] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Kanban Delivery
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'invoices'
                    ? 'bg-white dark:bg-[#222222] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Cashflow &amp; Invoices
              </button>
            </div>
          </div>

          {/* Dynamic Content Based on Active Tab */}
          {activeTab === 'overview' && (
            <>
              {/* 4 Core Metrics Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-xl bg-[#F9F9F9] dark:bg-[#121212]">
                  <span className="text-xs text-[var(--text-muted)] block">Monthly Revenue</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1 block font-mono">
                    $48,290.00
                  </span>
                  <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
                    +14.2% vs previous cycle
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F9F9F9] dark:bg-[#121212]">
                  <span className="text-xs text-[var(--text-muted)] block">Active Engagements</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1 block font-mono">
                    24 Projects
                  </span>
                  <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
                    8 milestones due this week
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F9F9F9] dark:bg-[#121212]">
                  <span className="text-xs text-[var(--text-muted)] block">Throughput Rate</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1 block font-mono">
                    92.4%
                  </span>
                  <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
                    +6% efficiency gain
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F9F9F9] dark:bg-[#121212]">
                  <span className="text-xs text-[var(--text-muted)] block">Active Clients</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1 block font-mono">
                    342 Accounts
                  </span>
                  <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
                    Multi-tenant isolation active
                  </span>
                </div>
              </div>

              {/* Operations Live Data Table */}
              <div className="rounded-xl bg-[#F9F9F9] dark:bg-[#121212] p-4 sm:p-5">
                <div className="flex items-center justify-between pb-3 mb-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                      Live Operations &amp; Delivery Stream
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Synchronized across all workspace members in real time
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Stream
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-semibold">
                        <th className="py-2.5 font-medium">Deliverable</th>
                        <th className="py-2.5 font-medium">Client Account</th>
                        <th className="py-2.5 font-medium">Status</th>
                        <th className="py-2.5 font-medium">Velocity</th>
                        <th className="py-2.5 font-medium text-right">Settlement</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--text-secondary)]">
                      <tr className="hover:bg-white dark:hover:bg-[#1A1A1A] transition-colors rounded">
                        <td className="py-3 font-medium text-[var(--text-primary)]">
                          Enterprise Operations Portal
                        </td>
                        <td className="py-3">Vanguard FinTech Ltd.</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-[#EFEFEF] dark:bg-[#181818] text-[var(--text-primary)] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            In Progress
                          </span>
                        </td>
                        <td className="py-3 font-mono">84%</td>
                        <td className="py-3 text-right font-medium text-[var(--text-primary)] font-mono">
                          $24,000.00
                        </td>
                      </tr>
                      <tr className="hover:bg-white dark:hover:bg-[#1A1A1A] transition-colors rounded">
                        <td className="py-3 font-medium text-[var(--text-primary)]">
                          Logistics Supply Chain Engine
                        </td>
                        <td className="py-3">Nexus Retail Labs</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-[#EFEFEF] dark:bg-[#181818] text-[var(--text-primary)] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Review Pending
                          </span>
                        </td>
                        <td className="py-3 font-mono">92%</td>
                        <td className="py-3 text-right font-medium text-[var(--text-primary)] font-mono">
                          $18,500.00
                        </td>
                      </tr>
                      <tr className="hover:bg-white dark:hover:bg-[#1A1A1A] transition-colors rounded">
                        <td className="py-3 font-medium text-[var(--text-primary)]">
                          Regulatory Compliance Audit
                        </td>
                        <td className="py-3">Apex Medical Capital</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-[#EFEFEF] dark:bg-[#181818] text-[var(--text-primary)] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Delivered
                          </span>
                        </td>
                        <td className="py-3 font-mono">100%</td>
                        <td className="py-3 text-right font-medium text-[var(--text-primary)] font-mono">
                          $32,400.00
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'projects' && (
            <>
              {/* 4 Delivery Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-xl bg-[#F9F9F9] dark:bg-[#121212]">
                  <span className="text-xs text-[var(--text-muted)] block">Active Sprints</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1 block font-mono">
                    6 Sprints
                  </span>
                  <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
                    2 completing this week
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F9F9F9] dark:bg-[#121212]">
                  <span className="text-xs text-[var(--text-muted)] block">In-Flight Tasks</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1 block font-mono">
                    38 Tasks
                  </span>
                  <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
                    12 in review / QA
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F9F9F9] dark:bg-[#121212]">
                  <span className="text-xs text-[var(--text-muted)] block">Milestone Accuracy</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1 block font-mono">
                    99.4%
                  </span>
                  <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
                    Zero delayed deadlines
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F9F9F9] dark:bg-[#121212]">
                  <span className="text-xs text-[var(--text-muted)] block">Team Velocity</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1 block font-mono">
                    42 pts/wk
                  </span>
                  <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
                    +18% velocity gain
                  </span>
                </div>
              </div>

              {/* Kanban Delivery Board Preview */}
              <div className="rounded-xl bg-[#F9F9F9] dark:bg-[#121212] p-4 sm:p-5">
                <div className="flex items-center justify-between pb-3 mb-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                      Kanban Project Delivery Board
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Multi-tenant cross-functional deliverable orchestration
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    Sprint 14 &bull; 87% Complete
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Column 1: Backlog / To Do */}
                  <div className="p-3 rounded-lg bg-white dark:bg-[#161616] space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)] pb-1 border-b border-neutral-100 dark:border-neutral-800">
                      <span>To Do</span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-[var(--text-muted)] font-mono">2</span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#FAFAFA] dark:bg-[#1A1A1A] space-y-2 border border-neutral-100 dark:border-neutral-800/60">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-[var(--text-primary)]">Architecture</span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">Due in 3d</span>
                      </div>
                      <p className="text-xs font-medium text-[var(--text-primary)]">
                        AI Analytics Engine Hook
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Stream aggregation worker pipeline
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#FAFAFA] dark:bg-[#1A1A1A] space-y-2 border border-neutral-100 dark:border-neutral-800/60">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-[var(--text-primary)]">Billing</span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">Due in 5d</span>
                      </div>
                      <p className="text-xs font-medium text-[var(--text-primary)]">
                        Stripe Auto-Tax Settlement
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Automated threshold calculations
                      </p>
                    </div>
                  </div>

                  {/* Column 2: In Progress */}
                  <div className="p-3 rounded-lg bg-white dark:bg-[#161616] space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)] pb-1 border-b border-neutral-100 dark:border-neutral-800">
                      <span>In Progress</span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-[var(--text-muted)] font-mono">2</span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#FAFAFA] dark:bg-[#1A1A1A] space-y-2 border border-neutral-100 dark:border-neutral-800/60">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-[var(--text-primary)]">Security</span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">85% done</span>
                      </div>
                      <p className="text-xs font-medium text-[var(--text-primary)]">
                        Enterprise Multi-Tenant Isolation
                      </p>
                      <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#FAFAFA] dark:bg-[#1A1A1A] space-y-2 border border-neutral-100 dark:border-neutral-800/60">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-[var(--text-primary)]">Feature</span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">60% done</span>
                      </div>
                      <p className="text-xs font-medium text-[var(--text-primary)]">
                        Client Portal Custom Domain
                      </p>
                      <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Completed */}
                  <div className="p-3 rounded-lg bg-white dark:bg-[#161616] space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)] pb-1 border-b border-neutral-100 dark:border-neutral-800">
                      <span>Completed</span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-[var(--text-muted)] font-mono">2</span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#FAFAFA] dark:bg-[#1A1A1A] space-y-2 border border-neutral-100 dark:border-neutral-800/60 opacity-90">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-200 dark:bg-neutral-800 text-[var(--text-secondary)]">RBAC v2</span>
                        <span className="text-[10px] text-emerald-500 font-mono">&check; Verified</span>
                      </div>
                      <p className="text-xs font-medium text-[var(--text-primary)]">
                        Role-Based Access Control
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Audited and deployed to staging
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#FAFAFA] dark:bg-[#1A1A1A] space-y-2 border border-neutral-100 dark:border-neutral-800/60 opacity-90">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-200 dark:bg-neutral-800 text-[var(--text-secondary)]">Export</span>
                        <span className="text-[10px] text-emerald-500 font-mono">&check; Verified</span>
                      </div>
                      <p className="text-xs font-medium text-[var(--text-primary)]">
                        Itemized Tax Invoice Generator
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        PDF engine integrated with webhook
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'invoices' && (
            <>
              {/* 4 Financial Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-xl bg-[#F9F9F9] dark:bg-[#121212]">
                  <span className="text-xs text-[var(--text-muted)] block">Collected MTD</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1 block font-mono">
                    $56,400.00
                  </span>
                  <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
                    +18.4% collection velocity
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F9F9F9] dark:bg-[#121212]">
                  <span className="text-xs text-[var(--text-muted)] block">Outstanding AR</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1 block font-mono">
                    $18,500.00
                  </span>
                  <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
                    1 invoice pending review
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F9F9F9] dark:bg-[#121212]">
                  <span className="text-xs text-[var(--text-muted)] block">Settlement Time</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1 block font-mono">
                    4.2x Faster
                  </span>
                  <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
                    Automated bank reconciliation
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F9F9F9] dark:bg-[#121212]">
                  <span className="text-xs text-[var(--text-muted)] block">Operating Margin</span>
                  <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1 block font-mono">
                    74.2%
                  </span>
                  <span className="text-xs text-[var(--text-muted)] mt-1 inline-block">
                    Healthy capital efficiency
                  </span>
                </div>
              </div>

              {/* Invoices & Settlements Ledger */}
              <div className="rounded-xl bg-[#F9F9F9] dark:bg-[#121212] p-4 sm:p-5">
                <div className="flex items-center justify-between pb-3 mb-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                      Cashflow Ledger &amp; Invoices
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Direct automated settlements via Stripe &amp; bank webhooks
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Auto-Sync Active
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-semibold">
                        <th className="py-2.5 font-medium">Invoice ID</th>
                        <th className="py-2.5 font-medium">Client Account</th>
                        <th className="py-2.5 font-medium">Due Date</th>
                        <th className="py-2.5 font-medium">Status</th>
                        <th className="py-2.5 font-medium">Method</th>
                        <th className="py-2.5 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--text-secondary)]">
                      <tr className="hover:bg-white dark:hover:bg-[#1A1A1A] transition-colors rounded">
                        <td className="py-3 font-mono font-medium text-[var(--text-primary)]">
                          #INV-2026-088
                        </td>
                        <td className="py-3">Vanguard FinTech Ltd.</td>
                        <td className="py-3 font-mono text-[var(--text-muted)]">Oct 15, 2026</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-[#EFEFEF] dark:bg-[#181818] text-[var(--text-primary)] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Settled
                          </span>
                        </td>
                        <td className="py-3 text-[var(--text-muted)]">Instant Stripe ACH</td>
                        <td className="py-3 text-right font-medium text-[var(--text-primary)] font-mono">
                          $24,000.00
                        </td>
                      </tr>
                      <tr className="hover:bg-white dark:hover:bg-[#1A1A1A] transition-colors rounded">
                        <td className="py-3 font-mono font-medium text-[var(--text-primary)]">
                          #INV-2026-089
                        </td>
                        <td className="py-3">Nexus Retail Labs</td>
                        <td className="py-3 font-mono text-[var(--text-muted)]">Oct 18, 2026</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-[#EFEFEF] dark:bg-[#181818] text-[var(--text-primary)] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Review Pending
                          </span>
                        </td>
                        <td className="py-3 text-[var(--text-muted)]">Net-14 Webhook</td>
                        <td className="py-3 text-right font-medium text-[var(--text-primary)] font-mono">
                          $18,500.00
                        </td>
                      </tr>
                      <tr className="hover:bg-white dark:hover:bg-[#1A1A1A] transition-colors rounded">
                        <td className="py-3 font-mono font-medium text-[var(--text-primary)]">
                          #INV-2026-090
                        </td>
                        <td className="py-3">Apex Medical Capital</td>
                        <td className="py-3 font-mono text-[var(--text-muted)]">Oct 12, 2026</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-[#EFEFEF] dark:bg-[#181818] text-[var(--text-primary)] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Settled
                          </span>
                        </td>
                        <td className="py-3 text-[var(--text-muted)]">Wire Transfer</td>
                        <td className="py-3 text-right font-medium text-[var(--text-primary)] font-mono">
                          $32,400.00
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlassmorphismHeroMockup;
