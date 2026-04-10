"use client";
import { FadeIn, SlideIn, CountUp, ProgressFill } from "./animations";
import {
  DollarSign, TrendingUp, Users, Briefcase, Shield, ShieldCheck,
  MapPin, Clock, AlertTriangle, CheckCircle2, ArrowUpRight,
  FileText, Wallet, BarChart3, CircleDollarSign, KeyRound,
} from "lucide-react";

// ================================================================
// SCENE 1: HERO
// ================================================================
export function SceneHero({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <FadeIn show={active} delay={200}>
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-navy-600 mb-8 mx-auto">
          <span className="text-2xl font-bold text-white">PMF</span>
        </div>
      </FadeIn>
      <FadeIn show={active} delay={600}>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Capital Marketplace</h1>
      </FadeIn>
      <FadeIn show={active} delay={1000}>
        <p className="text-xl text-navy-200 mb-3">Internal Syndication & Portfolio Management Platform</p>
      </FadeIn>
      <FadeIn show={active} delay={1400}>
        <p className="text-base text-navy-300/70 max-w-lg">Transform incoming MCA deal flow into structured investment opportunities for your office.</p>
      </FadeIn>
      <FadeIn show={active} delay={2000}>
        <div className="mt-10 flex gap-4 text-sm text-navy-400">
          {["Deal Intake", "Syndication", "Payment Tracking", "Portfolio Management"].map((t, i) => (
            <span key={i} className="rounded-full border border-navy-700 px-3 py-1">{t}</span>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 2: ADMIN DASHBOARD
// ================================================================
export function SceneAdminDashboard({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">Admin Dashboard</p>
        <h2 className="text-2xl font-bold text-white mb-6">Office Command Center</h2>
      </FadeIn>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Capital Deployed", value: 2400000, prefix: "$", icon: DollarSign, color: "text-white" },
          { label: "Total Collected", value: 1800000, prefix: "$", icon: TrendingUp, color: "text-profit" },
          { label: "Active Deals", value: 12, icon: Briefcase, color: "text-white" },
          { label: "Active Users", value: 8, icon: Users, color: "text-white" },
        ].map((card, i) => (
          <SlideIn key={i} show={active} delay={300 + i * 200}>
            <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider text-navy-400">{card.label}</span>
                <card.icon className="h-4 w-4 text-navy-500" />
              </div>
              <p className={`text-xl font-bold tabular-nums ${card.color}`}>
                <CountUp end={card.value} prefix={card.prefix || ""} show={active} delay={500 + i * 200} />
              </p>
            </div>
          </SlideIn>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <SlideIn show={active} delay={1200}>
          <div className="flex items-center gap-3 rounded-xl bg-navy-800/50 border border-navy-600/30 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-700"><FileText className="h-4 w-4 text-navy-300" /></div>
            <div><p className="text-sm font-semibold text-navy-200">3 deals pending review</p><p className="text-xs text-navy-500">Click to review</p></div>
          </div>
        </SlideIn>
        <SlideIn show={active} delay={1400}>
          <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20"><AlertTriangle className="h-4 w-4 text-amber-400" /></div>
            <div><p className="text-sm font-semibold text-amber-300">1 delinquent deal</p><p className="text-xs text-amber-500/70">Requires attention</p></div>
          </div>
        </SlideIn>
        <SlideIn show={active} delay={1600}>
          <div className="flex items-center gap-3 rounded-xl bg-navy-800/50 border border-navy-600/30 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-700"><Wallet className="h-4 w-4 text-navy-300" /></div>
            <div><p className="text-sm font-semibold text-navy-200">2 payouts awaiting</p><p className="text-xs text-navy-500">Click to review</p></div>
          </div>
        </SlideIn>
      </div>

      <FadeIn show={active} delay={2000}>
        <p className="text-sm text-navy-400 text-center">Real-time visibility into every aspect of your office operations.</p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 3: DEAL MARKETPLACE
// ================================================================
export function SceneDealMarketplace({ active }: { active: boolean }) {
  const deals = [
    { name: "Metro Quick Mart LLC", industry: "Retail", state: "NY", amount: 50000, factor: 1.35, filled: 81, returnPct: 35, investors: 3 },
    { name: "Bella's Italian Kitchen", industry: "Restaurant", state: "NJ", amount: 35000, factor: 1.35, filled: 96, returnPct: 35, investors: 4 },
    { name: "Greenfield Medical Supply", industry: "Healthcare", state: "MA", amount: 60000, factor: 1.30, filled: 45, returnPct: 30, investors: 1 },
  ];
  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">Deal Marketplace</p>
        <h2 className="text-2xl font-bold text-white mb-6">Live Syndication Opportunities</h2>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-3">
        {deals.map((d, i) => (
          <SlideIn key={i} show={active} delay={400 + i * 300}>
            <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
              <div className="bg-navy-800/50 px-4 py-3 border-b border-navy-700/30">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">{d.name}</h3>
                  <span className="rounded-md bg-profit/15 px-2 py-0.5 text-xs font-bold text-profit">{d.returnPct}%</span>
                </div>
                <div className="mt-1 flex gap-2 text-[11px] text-navy-400">
                  <span className="flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />{d.industry}</span>
                  <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{d.state}</span>
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="grid grid-cols-2 gap-2 text-center mb-3">
                  <div className="rounded-lg bg-navy-800/70 px-2 py-1.5">
                    <p className="text-[10px] uppercase text-navy-500">Amount</p>
                    <p className="text-sm font-bold text-white">${(d.amount / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="rounded-lg bg-navy-800/70 px-2 py-1.5">
                    <p className="text-[10px] uppercase text-navy-500">Factor</p>
                    <p className="text-sm font-bold text-white">{d.factor}x</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-navy-400 flex items-center gap-1"><Users className="h-3 w-3" />{d.investors}</span>
                  <span className={`font-bold ${d.filled >= 90 ? "text-profit" : "text-navy-300"}`}>
                    <CountUp end={d.filled} suffix="%" show={active} delay={1000 + i * 300} />
                  </span>
                </div>
                <ProgressFill value={d.filled} delay={800 + i * 300} color={d.filled >= 90 ? "bg-profit" : "bg-navy-500"} show={active} />
              </div>
            </div>
          </SlideIn>
        ))}
      </div>

      <FadeIn show={active} delay={2200}>
        <p className="text-sm text-navy-400 text-center mt-6">Browse, evaluate, and invest in deals — with full transparency on terms and progress.</p>
      </FadeIn>
    </div>
  );
}

// ================================================================
// SCENE 4: DEAL DETAIL
// ================================================================
export function SceneDealDetail({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">Deal Detail</p>
        <h2 className="text-2xl font-bold text-white mb-2">Metro Quick Mart LLC</h2>
        <div className="flex gap-3 text-xs text-navy-400 mb-5">
          <span className="rounded-full bg-profit/15 px-2 py-0.5 text-profit font-semibold">Active — Repaying</span>
          <span>Retail</span><span>NY</span><span>180-day term</span>
        </div>
      </FadeIn>

      <SlideIn show={active} delay={400}>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-px rounded-xl overflow-hidden bg-navy-700/30 mb-5">
          {[
            { label: "Funded", value: "$50,000" }, { label: "Payback", value: "$67,500" },
            { label: "Factor", value: "1.35x" }, { label: "Return", value: "35%", color: "text-profit" },
            { label: "Collected", value: "$42,000", color: "text-profit" }, { label: "Remaining", value: "$25,500" },
          ].map((c, i) => (
            <div key={i} className="bg-navy-900/80 px-3 py-3 text-center">
              <p className="text-[10px] uppercase text-navy-500">{c.label}</p>
              <p className={`text-sm font-bold mt-0.5 ${c.color || "text-white"}`}>{c.value}</p>
            </div>
          ))}
        </div>
      </SlideIn>

      <SlideIn show={active} delay={800}>
        <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 px-5 py-4 mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-navy-300 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-navy-500" />Repayment Progress</span>
            <span className="font-bold text-navy-200"><CountUp end={62} suffix="%" show={active} delay={1200} /></span>
          </div>
          <ProgressFill value={62} delay={1000} color="bg-navy-400" show={active} className="h-3" />
          <div className="flex justify-between text-xs mt-2 text-navy-500">
            <span>Principal: 84% recovered</span>
            <span>~24 payments to break-even</span>
          </div>
        </div>
      </SlideIn>

      <div className="grid sm:grid-cols-2 gap-4">
        <SlideIn show={active} delay={1400}>
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-4">
            <p className="text-xs uppercase tracking-wider text-navy-500 mb-3">Syndicate</p>
            {[
              { name: "Michael Torres", pct: 60, amount: "$30,000", returned: "$25,200" },
              { name: "Jessica Park", pct: 40, amount: "$20,000", returned: "$16,800" },
            ].map((inv, i) => (
              <FadeIn key={i} show={active} delay={1800 + i * 300}>
                <div className="flex items-center gap-3 py-2 border-b border-navy-800/50 last:border-0">
                  <div className="h-8 w-8 rounded-full bg-navy-700 flex items-center justify-center text-xs font-bold text-navy-300">{inv.name.split(" ").map(n => n[0]).join("")}</div>
                  <div className="flex-1"><p className="text-sm font-medium text-white">{inv.name}</p><p className="text-xs text-navy-500">{inv.pct}% ownership</p></div>
                  <div className="text-right"><p className="text-sm font-bold text-white">{inv.amount}</p><p className="text-xs text-profit">+{inv.returned}</p></div>
                </div>
              </FadeIn>
            ))}
          </div>
        </SlideIn>

        <SlideIn show={active} delay={1600}>
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-4">
            <p className="text-xs uppercase tracking-wider text-navy-500 mb-3">Deal Health</p>
            {[
              { label: "Collection Rate", value: "62.2%", color: "text-navy-200" },
              { label: "Break-even", value: "~24 payments", color: "text-navy-300" },
              { label: "Missed Payments", value: "0", color: "text-profit" },
              { label: "Days Active", value: "156", color: "text-navy-200" },
            ].map((m, i) => (
              <FadeIn key={i} show={active} delay={2000 + i * 200}>
                <div className="flex justify-between py-1.5 text-sm">
                  <span className="text-navy-500">{m.label}</span>
                  <span className={`font-semibold ${m.color}`}>{m.value}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </SlideIn>
      </div>
    </div>
  );
}

// ================================================================
// SCENE 5: PAYMENT DISTRIBUTION
// ================================================================
export function ScenePayment({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-4xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">Payment Processing</p>
        <h2 className="text-2xl font-bold text-white mb-6">Pro-Rata Distribution Engine</h2>
      </FadeIn>

      <div className="grid sm:grid-cols-2 gap-6">
        <SlideIn show={active} delay={300}>
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-5">
            <p className="text-sm font-semibold text-navy-300 mb-4">Payment Received</p>
            <div className="rounded-lg bg-navy-800/70 px-4 py-6 text-center mb-4">
              <p className="text-3xl font-bold text-profit">
                +$<CountUp end={375} show={active} delay={600} />.00
              </p>
              <p className="text-xs text-navy-500 mt-1">Daily ACH — Metro Quick Mart</p>
            </div>
            <FadeIn show={active} delay={1500}>
              <div className="flex items-center gap-2 rounded-lg bg-profit/10 border border-profit/20 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-profit" />
                <span className="text-sm text-profit font-medium">Distributed to 2 investors</span>
              </div>
            </FadeIn>
          </div>
        </SlideIn>

        <SlideIn show={active} delay={600}>
          <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-5">
            <p className="text-sm font-semibold text-navy-300 mb-4">Distribution Breakdown</p>
            {[
              { name: "Michael Torres", pct: 60, amount: 225, principal: 225, profit: 0 },
              { name: "Jessica Park", pct: 40, amount: 150, principal: 150, profit: 0 },
            ].map((inv, i) => (
              <FadeIn key={i} show={active} delay={1200 + i * 400}>
                <div className="py-3 border-b border-navy-800/50 last:border-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white font-medium">{inv.name}</span>
                    <span className="text-profit font-bold">+${inv.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-navy-500">
                    <span>{inv.pct}% share</span>
                    <span>Principal: ${inv.principal.toFixed(2)}</span>
                    <span>Profit: ${inv.profit.toFixed(2)}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
            <FadeIn show={active} delay={2200}>
              <div className="mt-3 pt-3 border-t border-navy-700/50 text-xs text-navy-500">
                <p>Principal recovers first. Once invested amount is returned, all subsequent distributions flow as profit.</p>
              </div>
            </FadeIn>
          </div>
        </SlideIn>
      </div>
    </div>
  );
}

// ================================================================
// SCENE 6: PORTFOLIO
// ================================================================
export function ScenePortfolio({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">Investor Portfolio</p>
        <h2 className="text-2xl font-bold text-white mb-6">Real-Time Investment Tracking</h2>
      </FadeIn>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Invested", value: 87500, prefix: "$" },
          { label: "Total Returned", value: 42300, prefix: "$", color: "text-profit" },
          { label: "Profit Earned", value: 12100, prefix: "$", color: "text-profit" },
          { label: "Available Balance", value: 8400, prefix: "$" },
        ].map((c, i) => (
          <SlideIn key={i} show={active} delay={300 + i * 200}>
            <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-4">
              <p className="text-[11px] uppercase text-navy-500 mb-1">{c.label}</p>
              <p className={`text-xl font-bold ${c.color || "text-white"}`}>
                <CountUp end={c.value} prefix={c.prefix} show={active} delay={500 + i * 200} />
              </p>
            </div>
          </SlideIn>
        ))}
      </div>

      <SlideIn show={active} delay={1200}>
        <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 px-5 py-4 mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-navy-300">Principal Recovery</span>
            <span className="font-bold text-navy-200"><CountUp end={72} suffix="%" show={active} delay={1500} /></span>
          </div>
          <ProgressFill value={72} delay={1400} color="bg-navy-400" show={active} className="h-3" />
        </div>
      </SlideIn>

      <SlideIn show={active} delay={1600}>
        <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-navy-700/30">
            <p className="text-xs uppercase tracking-wider text-navy-500">Holdings</p>
          </div>
          {[
            { name: "Metro Quick Mart", status: "Active", invested: "$30,000", profit: "$4,200", recovery: 84 },
            { name: "Sunrise Laundromat", status: "Paid Off", invested: "$12,000", profit: "$4,200", recovery: 100 },
            { name: "Bella's Italian Kitchen", status: "Open", invested: "$15,000", profit: "$0", recovery: 0 },
          ].map((h, i) => (
            <FadeIn key={i} show={active} delay={2000 + i * 300}>
              <div className="flex items-center gap-4 px-5 py-3 border-b border-navy-800/30 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{h.name}</p>
                  <span className={`text-xs ${h.status === "Paid Off" ? "text-profit" : h.status === "Active" ? "text-navy-300" : "text-navy-500"}`}>{h.status}</span>
                </div>
                <div className="text-right text-sm">
                  <p className="text-white font-medium">{h.invested}</p>
                  <p className={h.profit !== "$0" ? "text-profit text-xs" : "text-navy-600 text-xs"}>+{h.profit}</p>
                </div>
                <div className="w-20">
                  <ProgressFill value={h.recovery} delay={2200 + i * 300} color={h.recovery >= 100 ? "bg-profit" : "bg-navy-500"} show={active} className="h-1.5" />
                  <p className="text-[10px] text-navy-500 text-right mt-0.5">{h.recovery}%</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </SlideIn>
    </div>
  );
}

// ================================================================
// SCENE 7: PAYOUTS
// ================================================================
export function ScenePayouts({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-4xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">Payout System</p>
        <h2 className="text-2xl font-bold text-white mb-6">Request, Approve, Disburse</h2>
      </FadeIn>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { step: "1", label: "Request", desc: "Rep submits payout from available balance", icon: Wallet, delay: 400 },
          { step: "2", label: "Approve", desc: "Admin reviews and approves the request", icon: CheckCircle2, delay: 800 },
          { step: "3", label: "Disburse", desc: "Funds sent to linked bank via ACH", icon: ArrowUpRight, delay: 1200 },
        ].map((s) => (
          <SlideIn key={s.step} show={active} delay={s.delay}>
            <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 mx-auto mb-3">
                <s.icon className="h-5 w-5 text-navy-300" />
              </div>
              <p className="text-sm font-bold text-white mb-1">Step {s.step}: {s.label}</p>
              <p className="text-xs text-navy-500">{s.desc}</p>
            </div>
          </SlideIn>
        ))}
      </div>

      <SlideIn show={active} delay={1600}>
        <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-5">
          <p className="text-xs uppercase text-navy-500 mb-3">Payout Flow</p>
          <div className="flex items-center justify-between">
            {["Pending", "Approved", "Completed"].map((status, i) => (
              <FadeIn key={status} show={active} delay={2000 + i * 600}>
                <div className="flex flex-col items-center">
                  <div className={`rounded-full px-3 py-1 text-xs font-bold ${i === 2 ? "bg-profit/15 text-profit" : i === 1 ? "bg-navy-700 text-navy-200" : "bg-amber-500/15 text-amber-400"}`}>
                    {status}
                  </div>
                  {i < 2 && <div className="h-px w-16 bg-navy-700 mt-2" />}
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn show={active} delay={3600}>
            <div className="mt-4 text-center">
              <p className="text-2xl font-bold text-profit">$5,000.00</p>
              <p className="text-xs text-navy-500 mt-1">Deposited to Chase ****4521</p>
            </div>
          </FadeIn>
        </div>
      </SlideIn>
    </div>
  );
}

// ================================================================
// SCENE 8: SECURITY
// ================================================================
export function SceneSecurity({ active }: { active: boolean }) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-4xl mx-auto">
      <FadeIn show={active} delay={0}>
        <p className="text-xs uppercase tracking-widest text-navy-400 mb-1">Security & Controls</p>
        <h2 className="text-2xl font-bold text-white mb-6">Enterprise-Grade Protection</h2>
      </FadeIn>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: ShieldCheck, label: "Two-Factor Auth", desc: "TOTP + recovery codes" },
          { icon: KeyRound, label: "Encrypted Data", desc: "AES-256-GCM at rest" },
          { icon: FileText, label: "Audit Trail", desc: "Every action logged" },
          { icon: Users, label: "Role-Based Access", desc: "5 permission levels" },
        ].map((f, i) => (
          <SlideIn key={i} show={active} delay={300 + i * 200}>
            <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 p-4 text-center">
              <f.icon className="h-6 w-6 text-navy-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">{f.label}</p>
              <p className="text-[11px] text-navy-500 mt-0.5">{f.desc}</p>
            </div>
          </SlideIn>
        ))}
      </div>

      <SlideIn show={active} delay={1200}>
        <div className="rounded-xl bg-navy-900/80 border border-navy-700/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-navy-700/30">
            <p className="text-xs uppercase tracking-wider text-navy-500">Audit Log Preview</p>
          </div>
          {[
            { action: "PAYMENT POSTED", actor: "Sarah Chen", detail: "Metro Quick Mart — $375.00", time: "2 min ago" },
            { action: "DEAL PUBLISHED", actor: "James Morrison", detail: "Summit Auto Repair — $75,000", time: "1 hour ago" },
            { action: "PAYOUT APPROVED", actor: "James Morrison", detail: "Michael Torres — $5,000", time: "3 hours ago" },
            { action: "MFA ENABLED", actor: "Jessica Park", detail: "Two-factor authentication", time: "Yesterday" },
          ].map((log, i) => (
            <FadeIn key={i} show={active} delay={1600 + i * 300}>
              <div className="flex items-center gap-4 px-5 py-2.5 border-b border-navy-800/30 last:border-0">
                <span className="rounded-md bg-navy-800 px-2 py-0.5 text-[10px] font-semibold text-navy-300 whitespace-nowrap">{log.action}</span>
                <span className="text-sm text-navy-300 flex-1">{log.actor}</span>
                <span className="text-xs text-navy-500 hidden sm:block">{log.detail}</span>
                <span className="text-xs text-navy-600 whitespace-nowrap">{log.time}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </SlideIn>
    </div>
  );
}

// ================================================================
// SCENE 9: CLOSING
// ================================================================
export function SceneClosing({ active }: { active: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <FadeIn show={active} delay={200}>
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-navy-600 mb-8 mx-auto">
          <span className="text-2xl font-bold text-white">PMF</span>
        </div>
      </FadeIn>
      <FadeIn show={active} delay={600}>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Built for Premier Merchant Funding</h2>
      </FadeIn>
      <FadeIn show={active} delay={1000}>
        <p className="text-lg text-navy-300 mb-8 max-w-lg">A private syndication platform that transforms deal flow into structured investment opportunities.</p>
      </FadeIn>
      <FadeIn show={active} delay={1400}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { value: "9", label: "Deal Statuses" },
            { value: "5", label: "User Roles" },
            { value: "Pro-Rata", label: "Distribution" },
            { value: "Plaid", label: "Bank Integration" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl bg-navy-900/60 border border-navy-700/40 px-4 py-3">
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-navy-500">{s.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>
      <FadeIn show={active} delay={2000}>
        <p className="text-navy-400 text-sm">Ready to get started?</p>
      </FadeIn>
    </div>
  );
}
