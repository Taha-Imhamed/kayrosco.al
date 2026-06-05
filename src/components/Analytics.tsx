import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_GA_ID = "G-ER8ZH7MM7L";
const GA_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) || DEFAULT_GA_ID;
const GTM_ID = import.meta.env.VITE_GTM_ID as string | undefined;
const IS_PRODUCTION = import.meta.env.PROD;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function appendScript(src: string, id: string) {
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) return existing;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
  return script;
}

export function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (!IS_PRODUCTION) return;

  if (window.gtag && GA_ID) {
    window.gtag("event", eventName, params);
  }
}

export default function Analytics() {
  const location = useLocation();
  const hasSentInitialRouteView = useRef(false);

  useEffect(() => {
    if (!IS_PRODUCTION) return;

    if (GA_ID) {
      appendScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, "kayrosco-ga");
      window.dataLayer = window.dataLayer || [];
      window.gtag =
        window.gtag ||
        function gtag() {
          window.dataLayer?.push(arguments);
        };
      window.gtag("js", new Date());
      window.gtag("config", GA_ID);
    }

    if (GTM_ID && !document.getElementById("kayrosco-gtm-inline")) {
      window.dataLayer = window.dataLayer || [];
      const inline = document.createElement("script");
      inline.id = "kayrosco-gtm-inline";
      inline.text = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
      `;
      document.head.appendChild(inline);
    }
  }, []);

  useEffect(() => {
    if (!IS_PRODUCTION) return;

    if (!hasSentInitialRouteView.current) {
      hasSentInitialRouteView.current = true;
      return;
    }

    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    const pageLocation = window.location.href;
    const pageTitle = document.title;

    if (GA_ID && window.gtag) {
      window.gtag("event", "page_view", {
        page_path: pagePath,
        page_location: pageLocation,
        page_title: pageTitle,
        send_to: GA_ID,
      });
    }
  }, [location.hash, location.pathname, location.search]);

  return null;
}
