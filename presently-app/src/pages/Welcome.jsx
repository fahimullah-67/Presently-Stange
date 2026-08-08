import { Link } from "react-router-dom";
import { BarChart3, MessageSquare, TrendingUp } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Real-time Polls",
    description: "Instant audience feedback",
  },
  {
    icon: MessageSquare,
    title: "Live Chat Display",
    description: "Curate and share messages",
  },
  {
    icon: TrendingUp,
    title: "Session Analytics",
    description: "Track engagement metrics",
  },
];

function Feature({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-6">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>

        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function TrustBadge() {
  return (
    <div className="flex items-center gap-4 rounded-full bg-white/10 px-4 py-4 backdrop-blur-sm">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-sm text-yellow-300">
            ★
          </span>
        ))}
      </div>

      <span className="text-sm text-white/90">4.9/5 from 5,000+ teams</span>
    </div>
  );
}

export default function Welcome() {
  return (
    <main className="min-h-screen bg-white">
      <div className="min-h-screen lg:grid lg:grid-cols-2">
        {/* ==================================================
            LEFT SIDE
            Desktop / Laptop ONLY
            Hidden below 1024px
        ================================================== */}

        <section
          className="
            relative hidden min-h-screen
            bg-gradient-to-br
            from-[#2D8CFF]
            to-[#1A5FCC]
            text-white
            lg:block
          "
        >
          {/* Logo */}
          <div className="absolute left-12 top-12">
            <h2 className="text-sm font-bold">Presently</h2>
          </div>

          <div className="absolute left-12 top-[15.5%] flex flex-col gap-10">
            <h1
              className="
      max-w-[560px]
      text-5xl
      font-bold
      leading-[1.2]
      tracking-tight
    "
            >
              Engage Your Audience
              <br />
              Like Never Before
            </h1>

            <div
              className="
      flex
      h-64
      w-96
      items-center
      justify-center
      rounded-2xl
      bg-white/10
    "
            >
              <TrendingUp
                className="h-32 w-32 text-white/20"
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* Trust Badge */}
          <div className="absolute bottom-12 left-12">
            <TrustBadge />
          </div>
        </section>

        {/* ==================================================
            RIGHT SIDE
            Mobile + Tablet + Desktop
        ================================================== */}

        <section
          className="
            flex
            min-h-screen
            w-full
            items-center
            justify-center
            bg-white
            px-6
            py-10
            sm:px-8
            md:px-12
            lg:px-16
          "
        >
          <div className="w-full max-w-sm ">
            {/* Logo */}
            <div className="mb-10">
              <h2 className="mb-1 text-3xl font-bold text-foreground">
                Presently
              </h2>

              <p className="text-muted-foreground text-sm">
                Live Interaction Tool
              </p>
            </div>

            {/* Welcome */}
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold text-foreground">
                Welcome to Presently
              </h1>

              <p className="text-sm leading-relaxed text-muted-foreground">
                Transform your Zoom presentations with live polls, real-time
                chat management, and instant engagement analytics.
              </p>
            </div>

            {/* Features */}
            <div className="mb-8 space-y-6">
              {features.map((feature) => (
                <Feature key={feature.title} {...feature} />
              ))}
            </div>

            {/* CTA */}
            <Link
              to="/auth"
              className="
                mb-4
                flex
                h-10
                w-full
                items-center
                justify-center
                rounded-lg
                bg-primary
                text-sm
                font-semibold
                text-white
                transition-colors
                hover:bg-[#1A5FCC]
              "
            >
              Get Started
            </Link>

            {/* Sign In */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/auth"
                className="font-semibold text-primary hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
