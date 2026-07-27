"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastProvider } from "@/components/ui/Toast";
import { CinematicTransition } from "@/components/CinematicTransition";
import { QueryProvider } from "@/lib/query/QueryProvider";
import { ThemeProvider } from "@/components/app/ThemeProvider";

// All client-side context providers live here so the root layout can stay a
// pure Server Component. We do the Google client-id gating at the top: if the
// env var is unset (e.g. a fresh local clone) we just render children without
// the Google provider — the "Continue with Google" buttons hide themselves
// the same way (see lib/api/google.ts → hasGoogleClient()).
//
// The previous RouteTransition full-screen loader was replaced by
// CinematicTransition, which wraps every route in a motion.div keyed by
// pathname so navigation feels alive without the heavy overlay.
export function Providers({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const content = (
    <QueryProvider>
      <ThemeProvider>
        <ToastProvider>
          <CinematicTransition>{children}</CinematicTransition>
        </ToastProvider>
      </ThemeProvider>
    </QueryProvider>
  );

  if (!googleClientId) return content;
  return <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>;
}
