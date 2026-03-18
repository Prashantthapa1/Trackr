/**
 * app/page.tsx
 *
 * Landing page with green design system styling and enhanced animations.
 */
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Receipt, Users, Target, Sparkles } from "lucide-react";
import { LandingNavEffects } from "@/components/LandingNavEffects";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavEffects />

      {/* Navigation */}
      <header id="landing-nav" className="fixed left-0 right-0 top-0 z-50 border-b border-transparent bg-transparent transition-all duration-400">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25">
              <Receipt className="h-5 w-5" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">Trackr</span>
            <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse-dot" />
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="nav-link">Features</a>
            <a href="#stats" className="nav-link">Results</a>
            <a href="#pricing" className="nav-link">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>
                Get Started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="landing-hero relative">
          {/* Animated Background Blobs */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="hero-blob one absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-green-400/30 to-green-500/40 blur-[80px] animate-float-blob" />
            <div className="hero-blob two absolute -bottom-24 -left-24 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-green-200/30 to-green-400/30 blur-[80px] animate-float-blob-delayed" />
            <div className="hero-blob three absolute top-1/2 left-1/3 h-[200px] w-[200px] rounded-full bg-green-400/20 blur-[80px] animate-float-blob-slow" />
            <div className="hero-grid" />
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="animate-fade-up">
              <span className="hero-badge mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse-dot" />
                Now in beta — join 10,000+ teams
              </span>
            </div>

            {/* Title */}
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl animate-fade-up-delay-1">
              Track expenses with{" "}
              <span className="text-gradient-green accent-underline">smarter workflows</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground font-body animate-fade-up-delay-2">
              Trackr brings your team, expenses, and insights into one living workspace —
              so you can focus on what actually moves the needle.
            </p>

            {/* Actions */}
            <div className="mt-8 flex justify-center gap-4 animate-fade-up-delay-3">
              <Link href="/register">
                <Button size="lg">
                  Start free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign in
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-10 animate-fade-up-delay-4">
              <div className="avatar-stack justify-center">
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #86efac, #22c55e)' }}>AS</div>
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #4ade80, #16a34a)' }}>JK</div>
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #bbf7d0, #22c55e)' }}>MR</div>
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #86efac, #15803d)' }}>TL</div>
              </div>
              <div className="stars mt-2">★★★★★</div>
              <p className="text-sm text-muted-foreground mt-1">Loved by 10,000+ teams worldwide</p>
            </div>

            {/* Dashboard Mockup */}
            <div className="dashboard-mockup mt-12 mx-auto max-w-3xl animate-fade-up-delay-5">
              <div className="mock-bar">
                <div className="mock-dot" style={{ background: '#ff6b6b' }} />
                <div className="mock-dot" style={{ background: '#ffd93d' }} />
                <div className="mock-dot" style={{ background: '#4ade80' }} />
                <div className="flex-1 h-2 bg-green-500/10 rounded ml-3" />
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                <div className="mock-card">
                  <div className="mock-label">Total Spent</div>
                  <div className="mock-value">$12.4k</div>
                </div>
                <div className="mock-card">
                  <div className="mock-label">Budget Left</div>
                  <div className="mock-value">$7.6k</div>
                </div>
                <div className="mock-card">
                  <div className="mock-label">Savings</div>
                  <div className="mock-value text-green-600">+18%</div>
                </div>
                <div className="mock-chart col-span-3 h-24">
                  <div className="bar-item" style={{ height: '45%' }} />
                  <div className="bar-item" style={{ height: '60%', animationDelay: '1.05s' }} />
                  <div className="bar-item" style={{ height: '50%', animationDelay: '1.1s' }} />
                  <div className="bar-item" style={{ height: '75%', animationDelay: '1.15s' }} />
                  <div className="bar-item" style={{ height: '65%', animationDelay: '1.2s' }} />
                  <div className="bar-item" style={{ height: '85%', animationDelay: '1.25s', opacity: 0.7 }} />
                  <div className="bar-item" style={{ height: '90%', animationDelay: '1.3s' }} />
                  <div className="bar-item" style={{ height: '80%', animationDelay: '1.35s', opacity: 0.75 }} />
                  <div className="bar-item" style={{ height: '95%', animationDelay: '1.4s' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logos Section */}
        <div className="py-8 px-6 border-y border-green-200/30 dark:border-green-800/20 bg-green-50/50 dark:bg-green-900/10">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground mb-6">
            Trusted by teams at
          </p>
          <div className="flex justify-center items-center gap-10 flex-wrap max-w-4xl mx-auto">
            {['Acme Corp', 'Horizon', 'Streamline', 'Apex Labs', 'Catalyst', 'Vertex'].map((name) => (
              <span key={name} className="font-heading font-bold text-muted-foreground/40 hover:text-green-600 transition-colors cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        <section id="features" className="landing-section section-light">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <span className="section-label">Features</span>
              <h2 className="section-title">
                Everything your team needs<br />to move faster
              </h2>
              <p className="section-sub mx-auto max-w-xl">
                From expense logging to analytics, Trackr handles the complex so your team stays focused.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Receipt, title: "Smart Tracking", desc: "Log expenses in seconds with AI-powered categorization and receipt uploads." },
                { icon: BarChart3, title: "Live Analytics", desc: "Real-time dashboards give your team instant clarity on spending patterns." },
                { icon: Users, title: "Team Collaboration", desc: "Multiplayer workspaces with shared budgets and activity tracking." },
                { icon: Target, title: "Budget Goals", desc: "Set spending limits and get alerts before overspending on any category." },
                { icon: Sparkles, title: "AI Insights", desc: "Get smart recommendations to optimize spending and find savings." },
                { icon: ArrowRight, title: "Easy Export", desc: "One-click PDF and CSV exports for accounting and reporting." },
              ].map((feature, i) => (
                <div
                  key={feature.title}
                  className="feature-card scroll-reveal"
                  data-delay={`${(i % 3) * 100}`}
                >
                  <div className="feature-icon">
                    <feature.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section id="stats" className="landing-section stats-section">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
              {[
                { value: "10k+", label: "Teams using Trackr daily" },
                { value: "98%", label: "Customer satisfaction score" },
                { value: "3.4x", label: "Average productivity boost" },
                { value: "28h", label: "Saved per team per month" },
              ].map((stat, i) => (
                <div key={stat.value} className="scroll-reveal" data-delay={`${i * 100}`}>
                  <div className="font-heading text-5xl font-extrabold text-gradient-green">{stat.value}</div>
                  <p className="mt-2 text-sm text-green-200">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="landing-section section-green">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <span className="section-label">Pricing</span>
              <h2 className="section-title">Simple, honest pricing</h2>
              <p className="section-sub mx-auto">No surprises. No hidden fees. Cancel anytime.</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
              {/* Free */}
              <div className="pricing-card scroll-reveal">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Starter</p>
                <p className="mt-4 font-heading text-4xl font-extrabold text-foreground">$0</p>
                <p className="text-sm text-muted-foreground">Free forever · up to 3 users</p>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 50 expenses per month</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Basic categories</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Single workspace</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Community support</li>
                </ul>
                <Link href="/register" className="block mt-8">
                  <Button className="w-full" variant="outline">Get started free</Button>
                </Link>
              </div>

              {/* Pro - Featured */}
              <div className="pricing-card featured scroll-reveal" data-delay="100">
                <span className="absolute right-4 top-4 rounded-full bg-green-400 px-3 py-1 text-xs font-bold text-green-900">Most Popular</span>
                <p className="text-sm font-semibold text-green-400 uppercase tracking-wide">Growth</p>
                <p className="mt-4 font-heading text-4xl font-extrabold text-white">$19</p>
                <p className="text-sm text-green-200">per month · up to 10 users</p>
                <ul className="mt-6 space-y-3 text-sm text-green-100">
                  <li className="flex items-center gap-2"><span>✓</span> Unlimited expenses</li>
                  <li className="flex items-center gap-2"><span>✓</span> Advanced analytics</li>
                  <li className="flex items-center gap-2"><span>✓</span> Team workspaces</li>
                  <li className="flex items-center gap-2"><span>✓</span> Priority support</li>
                  <li className="flex items-center gap-2"><span>✓</span> AI-powered insights</li>
                </ul>
                <Link href="/register" className="block mt-8">
                  <Button className="w-full bg-white text-green-700 hover:bg-green-50 hover:text-green-800">
                    Start 14-day trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Enterprise */}
              <div className="pricing-card scroll-reveal" data-delay="200">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Enterprise</p>
                <p className="mt-4 font-heading text-4xl font-extrabold text-foreground">Custom</p>
                <p className="text-sm text-muted-foreground">Unlimited users · SLA included</p>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Everything in Growth</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> SSO & SAML</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Custom integrations</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Dedicated CSM</li>
                </ul>
                <Link href="/register" className="block mt-8">
                  <Button className="w-full" variant="outline">Get started</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="landing-section section-dark text-center">
          <div className="max-w-4xl mx-auto relative z-10 scroll-reveal">
            <span className="inline-flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-1.5 text-sm font-semibold text-green-400 mb-6">
              <Sparkles className="h-4 w-4" />
              Get started today
            </span>
            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Ready to grow at<br />a different pace?
            </h2>
            <p className="mt-4 text-lg text-green-200/70 max-w-2xl mx-auto">
              Join thousands of teams who moved faster, worked smarter, and never looked back.
              Your first 14 days are on us.
            </p>
            <div className="mt-8">
              <Link href="/register">
                <Button size="lg">
                  Start free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-green-200/50">
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-green-200/50 dark:border-green-800/30 py-8 px-6 bg-background">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse-dot" />
            <span className="font-heading font-bold text-muted-foreground">Trackr</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Trackr. Built as a portfolio project.
          </p>
        </div>
      </footer>
    </div>
  );
}
