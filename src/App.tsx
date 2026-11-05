import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { SiteProvider } from "./context/SiteContext";
import { Home } from "./pages/Home";

const AdminApp = lazy(() =>
  import("./admin/AdminApp").then((module) => ({ default: module.AdminApp })),
);
const SetupPage = lazy(() =>
  import("./pages/SetupPage").then((module) => ({ default: module.SetupPage })),
);

function RouteFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
        Memuat…
      </span>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--bg)] p-6">
      <div className="text-center">
        <div className="font-heading text-[clamp(4rem,12vw,8rem)] leading-none text-[var(--accent)]">
          404
        </div>
        <h1 className="h2 mt-3">Halaman tidak ditemukan.</h1>
        <p className="muted mt-2 text-[0.85rem]">
          Mungkin tautannya berubah, atau ada salah ketik.
        </p>
        <Link to="/" className="btn btn-primary mt-6">
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}

export function App() {
  const base = import.meta.env.BASE_URL;
  return (
    <BrowserRouter basename={base === "/" ? undefined : base.replace(/\/$/, "")}>
      <SiteProvider>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminApp />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </SiteProvider>
    </BrowserRouter>
  );
}
