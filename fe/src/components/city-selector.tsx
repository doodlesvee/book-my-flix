"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, LocateFixed, Search } from "lucide-react";

const POPULAR_CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
];

const STORAGE_KEY = "bookmyflix-city";

export function CitySelector() {
  const [open, setOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSelectedCity(saved);
    } else {
      setOpen(true);
    }
  }, []);

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem(STORAGE_KEY, city);
    setOpen(false);
    setSearch("");
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.state_district ||
            data.address?.state ||
            "Unknown";
          handleSelectCity(city);
        } catch {
          setDetecting(false);
        }
      },
      () => {
        setDetecting(false);
      },
    );
  };

  const filteredCities = POPULAR_CITIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* City badge in navbar */}
      {selectedCity && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          <MapPin className="size-3.5" />
          {selectedCity}
        </button>
      )}

      {/* City selection dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Where are you?
              </DialogTitle>
              <DialogDescription className="text-violet-100">
                Select your city to find movies and theaters nearby.
              </DialogDescription>
            </DialogHeader>

            {/* Search inside header */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-violet-300" />
              <Input
                placeholder="Search for your city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-white/20 bg-white/10 pl-9 text-white placeholder:text-violet-200 focus-visible:ring-white/30"
              />
            </div>
          </div>

          <div className="p-6">
            {/* Detect location */}
            <button
              onClick={handleDetectLocation}
              disabled={detecting}
              className="mb-4 flex w-full items-center gap-3 rounded-lg border border-dashed border-violet-300 px-4 py-3 text-left text-sm transition-colors hover:border-violet-400 hover:bg-violet-50"
            >
              <LocateFixed
                className={`size-5 text-violet-600 ${detecting ? "animate-spin" : ""}`}
              />
              <div>
                <p className="font-medium text-violet-700">
                  {detecting
                    ? "Detecting your location..."
                    : "Detect my location"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Using your browser&apos;s GPS
                </p>
              </div>
            </button>

            {/* Search results */}
            {search && filteredCities.length > 0 && (
              <div className="flex flex-col gap-1">
                {filteredCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleSelectCity(city)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-violet-50"
                  >
                    <MapPin className="size-4 text-violet-500" />
                    {city}
                  </button>
                ))}
              </div>
            )}

            {search && filteredCities.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Search className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No cities found for &ldquo;{search}&rdquo;
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
