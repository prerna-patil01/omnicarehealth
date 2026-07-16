import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { TopNav } from "../components/TopNav";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-semibold text-primary editorial-italic">404</h1>
        <h2 className="mt-4 text-xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This corner of OmniCare doesn't exist yet.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again in a moment.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "OmniCare — One health identity, one intelligent care team" },
      {
        name: "description",
        content:
          "OmniCare is an AI-native health platform: Omni advises, humans decide. Doctors, records, pharmacy, and care in one health identity.",
      },
      { property: "og:title", content: "OmniCare — One health identity, one intelligent care team" },
      {
        property: "og:description",
        content:
          "OmniCare is an AI-native health platform: Omni advises, humans decide. Doctors, records, pharmacy, and care in one health identity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "OmniCare — One health identity, one intelligent care team" },
      { name: "twitter:description", content: "OmniCare is an AI-native health platform: Omni advises, humans decide. Doctors, records, pharmacy, and care in one health identity." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e9983435-805b-42b3-9dec-10ad2fd0b07d/id-preview-5fc2b0fe--bfbc9491-65c3-4a15-ac70-18a2911f27c4.lovable.app-1784192298429.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e9983435-805b-42b3-9dec-10ad2fd0b07d/id-preview-5fc2b0fe--bfbc9491-65c3-4a15-ac70-18a2911f27c4.lovable.app-1784192298429.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground">
        <TopNav />
        <main className="mx-auto max-w-[1400px] px-5 py-8">
          <Outlet />
        </main>
        <footer className="border-t border-border py-8 mt-12">
          <div className="mx-auto max-w-[1400px] px-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>
              <span className="editorial-italic">Omni advises.</span> You decide. Always.
            </p>
            <p>© 2026 OmniCare Health, Mumbai</p>
          </div>
        </footer>
      </div>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: "Times New Roman, serif" } }} />
    </QueryClientProvider>
  );
}
