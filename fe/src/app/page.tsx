import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FadeIn,
  FadeInOnScroll,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion";
import {
  Popcorn,
  Armchair,
  PartyPopper,
  Ticket,
  Star,
  MapPin,
  Play,
  Clock,
  Users,
  Film,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section — Dark Cinematic */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-violet-950 to-indigo-950 px-4 py-28 text-white md:py-40">
        {/* Background Cinema Image */}
        <Image
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070"
          alt="Cinema hall"
          fill
          className="object-cover opacity-20"
          priority
        />
        {/* Background decorations */}
        <div className="absolute inset-0 -z-0">
          <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute right-1/3 top-1/3 h-48 w-48 rounded-full bg-fuchsia-500/8 blur-2xl" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-8 text-center">
          <FadeIn delay={0}>
            <div className="flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300 backdrop-blur-sm">
              <Sparkles className="size-4" />
              Now showing — latest blockbusters!
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight md:text-7xl">
              Your Cinema,{" "}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                Your Way
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="max-w-xl text-lg text-gray-300">
              Browse movies, choose the perfect seats, and book your tickets
              instantly. The ultimate movie experience starts here.
            </p>
          </FadeIn>
          <FadeIn delay={0.45}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-white hover:from-violet-500 hover:to-indigo-500"
                asChild
              >
                <Link href="/movies">
                  <Play className="size-4" />
                  Explore Movies
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-violet-400/30 text-violet-300 hover:bg-violet-500/10 hover:text-white"
                asChild
              >
                <Link href="/login">
                  Get Started
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.6}>
            <div className="mt-4 flex divide-x divide-gray-700">
              {[
                {
                  icon: <Film className="size-4" />,
                  value: "500+",
                  label: "Movies",
                },
                {
                  icon: <MapPin className="size-4" />,
                  value: "50+",
                  label: "Theaters",
                },
                {
                  icon: <Users className="size-4" />,
                  value: "100K+",
                  label: "Happy Users",
                },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 px-6">
                  <span className="text-violet-400">{stat.icon}</span>
                  <span className="text-lg font-bold">{stat.value}</span>
                  <span className="text-sm text-gray-400">{stat.label}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20 dark:bg-gray-900">
        <div className="mx-auto w-full max-w-5xl px-4">
          <FadeInOnScroll>
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold tracking-tight">
                How It Works
              </h2>
              <p className="mt-2 text-muted-foreground">
                Book your movie in 3 simple steps
              </p>
            </div>
          </FadeInOnScroll>
          <StaggerContainer
            className="grid gap-8 md:grid-cols-3"
            staggerDelay={0.15}
          >
            {[
              {
                icon: <Popcorn className="size-7 text-violet-600" />,
                title: "Pick a Movie",
                description:
                  "Browse through the latest movies showing near you.",
                color: "bg-violet-100 dark:bg-violet-900/50",
                step: "01",
              },
              {
                icon: <Armchair className="size-7 text-indigo-600" />,
                title: "Choose Your Seats",
                description:
                  "Select your preferred seats — Silver, Gold, or Recliner.",
                color: "bg-indigo-100 dark:bg-indigo-900/50",
                step: "02",
              },
              {
                icon: <PartyPopper className="size-7 text-fuchsia-600" />,
                title: "Book & Enjoy",
                description: "Confirm your booking and head to the theater!",
                color: "bg-fuchsia-100 dark:bg-fuchsia-900/50",
                step: "03",
              },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <Card className="relative border-0 bg-white shadow-sm hover:shadow-lg transition-shadow dark:bg-gray-800">
                  <span className="absolute right-4 top-4 text-4xl font-black text-gray-100 dark:text-gray-700">
                    {item.step}
                  </span>
                  <CardContent className="flex flex-col gap-4 p-8">
                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.color}`}
                    >
                      {item.icon}
                    </span>
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <FadeInOnScroll>
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold tracking-tight">
                Why BookMyFlix?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Everything you need for the perfect movie outing
              </p>
            </div>
          </FadeInOnScroll>
          <StaggerContainer
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.1}
          >
            {[
              {
                icon: <MapPin className="size-5 text-violet-600" />,
                title: "Theaters Near You",
                description: "Find cinemas across multiple cities instantly.",
                bg: "bg-violet-50 dark:bg-violet-950/40",
              },
              {
                icon: <Armchair className="size-5 text-indigo-600" />,
                title: "Premium Seating",
                description: "Silver, Gold & Recliner options available.",
                bg: "bg-indigo-50 dark:bg-indigo-950/40",
              },
              {
                icon: <Ticket className="size-5 text-fuchsia-600" />,
                title: "Instant Booking",
                description: "Lock your seats and confirm in seconds.",
                bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
              },
              {
                icon: <Clock className="size-5 text-amber-600" />,
                title: "Flexible Showtimes",
                description: "Morning & evening slots to fit your schedule.",
                bg: "bg-amber-50 dark:bg-amber-950/40",
              },
              {
                icon: <Star className="size-5 text-rose-600" />,
                title: "Top Rated Movies",
                description: "Curated selection of the best films.",
                bg: "bg-rose-50 dark:bg-rose-950/40",
              },
              {
                icon: <Users className="size-5 text-emerald-600" />,
                title: "Group Bookings",
                description: "Book multiple seats for friends & family.",
                bg: "bg-emerald-50 dark:bg-emerald-950/40",
              },
            ].map((feature) => (
              <StaggerItem key={feature.title}>
                <div
                  className={`flex items-start gap-4 rounded-xl ${feature.bg} p-5 transition-shadow hover:shadow-md`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-20 text-white dark:from-violet-950 dark:to-indigo-950">
        <FadeInOnScroll>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready for Your Next Movie Night?
            </h2>
            <p className="max-w-lg text-lg text-violet-100">
              Join thousands of movie lovers who book their tickets with
              BookMyFlix every day.
            </p>
            <div className="flex gap-3">
              <Button
                size="lg"
                className="bg-white text-violet-700 hover:bg-violet-50"
                asChild
              >
                <Link href="/movies">
                  <Ticket className="size-4" />
                  Book Now
                </Link>
              </Button>
              <Button
                size="lg"
                className="border border-white bg-transparent text-white hover:bg-white hover:text-violet-700"
                asChild
              >
                <Link href="/login">Create Account</Link>
              </Button>
            </div>
          </div>
        </FadeInOnScroll>
      </section>
    </div>
  );
}
