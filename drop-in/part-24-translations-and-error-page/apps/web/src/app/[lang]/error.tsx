"use client";

// The illustrated 500 page. It reuses the 404 page's artwork (public/assets/404)
// so the two error screens match.
import { Link } from "@/i18n/link";
import { RotateCcw, Home } from "lucide-react";
import { useEffect } from "react";
import { useDict } from "@/i18n/i18n-provider";
import { devError } from "@/lib/dev-log";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dict = useDict();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") devError(error);
  }, [error]);

  const actions = (size: "lg" | "sm") => (
    <div className={`pointer-events-auto flex flex-wrap ${size === "lg" ? "gap-4" : "gap-3 mt-8"}`}>
      <button
        type="button"
        onClick={reset}
        className={`bg-brand-gradient transition-colors flex items-center justify-center rounded-lg w-fit shadow-pill ${
          size === "lg" ? "gap-3 h-15 px-7" : "gap-2.5 h-13.5 px-6"
        }`}
      >
        <RotateCcw className="w-5 h-5 text-white" />
        <span className={`capitalize font-semibold text-white ${size === "lg" ? "text-[16px]" : "text-[15px]"}`}>
          {dict.errors.tryAgain}
        </span>
      </button>
      <Link
        href="/"
        className={`border border-border bg-white transition-colors flex items-center justify-center rounded-lg w-fit ${
          size === "lg" ? "gap-3 h-15 px-7" : "gap-2.5 h-13.5 px-6"
        }`}
      >
        <Home className="w-5 h-5 text-foreground" />
        <span className={`capitalize font-semibold text-foreground ${size === "lg" ? "text-[16px]" : "text-[15px]"}`}>
          {dict.errors.goHome}
        </span>
      </Link>
    </div>
  );

  return (
    <div className="bg-white relative w-full h-screen min-h-200 overflow-hidden">
      {/* DESKTOP VIEW */}
      <div className="hidden md:block absolute inset-0 max-w-360 mx-auto w-full h-full">
        <img alt="" className="absolute left-[-248px] top-94 w-206.25 h-206 max-w-none" src="/assets/404/ellipse-desktop-2.svg" />
        <img alt="" className="absolute left-[-351px] top-[-326px] w-206.25 h-206.25 max-w-none" src="/assets/404/ellipse-desktop-1.svg" />

        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-200 w-223.75 overflow-clip rounded-[20px]">
          <div className="absolute inset-[37.5%_10.27%_24.56%_8.94%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/assets/404/bg-desktop.svg" />
          </div>
          <div className="absolute inset-[53.57%_23.92%_11.02%_48.08%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/assets/404/main.svg" />
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col justify-between px-48 py-24 pointer-events-none z-10">
          <div className="flex flex-col gap-12 max-w-125">
            <p className="font-semibold tracking-tight text-[100px] text-foreground leading-none">500</p>
            <p className="text-[40px] text-muted-foreground leading-[1.2]">{dict.errors.somethingWentWrong}</p>
          </div>
          {actions("lg")}
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden">
        <img alt="" className="absolute left-[-153px] top-[70%] w-122.25 h-122.25 max-w-none" src="/assets/404/ellipse-mobile-2.svg" />
        <img alt="" className="absolute left-[-82px] top-[-59px] w-69 h-69 max-w-none" src="/assets/404/ellipse-mobile-1.svg" />

        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-188.25 w-107 overflow-clip rounded-[18px] opacity-80 pointer-events-none">
          <div className="absolute inset-[19.07%_10.27%_61.63%_8.94%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/assets/404/bg-mobile.svg" />
          </div>
          <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 h-70.75 w-62.5">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src="/assets/404/main.svg" />
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col justify-between px-6 py-20 pointer-events-none z-10">
          <div className="flex flex-col gap-8 max-w-100">
            <p className="font-semibold tracking-tight text-[72px] text-foreground leading-none">500</p>
            <p className="text-[32px] text-muted-foreground leading-[1.2]">{dict.errors.somethingWentWrong}</p>
          </div>
          {actions("sm")}
        </div>
      </div>
    </div>
  );
}
