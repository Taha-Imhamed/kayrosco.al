import { createElement, useEffect } from "react";
import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const scriptId = "spline-viewer-notfound-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "module";
      script.src = "https://unpkg.com/@splinetool/viewer@1.12.96/build/spline-viewer.js";
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#020617",
        overflow: "hidden",
        position: "relative",
        color: "#FFFFFF",
        fontFamily: "Inter, Satoshi, Manrope, sans-serif",
      }}
    >
      <div
        key={location.pathname}
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        {createElement("spline-viewer", {
          url: "https://my.spline.design/100followers-HpeC4yvqpFIdWkhC8cInFrxI/scene.splinecode",
          style: {
            width: "100%",
            height: "100%",
            display: "block",
            pointerEvents: "auto",
          },
        })}
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(2, 6, 23, 0.06)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 14,
          bottom: 14,
          width: 168,
          height: 46,
          zIndex: 2,
          borderRadius: 14,
          background: "linear-gradient(180deg, #16181C 0%, #121316 100%)",
          boxShadow: "inset 0px -2px 0px -1px #060709, inset 0px 1px 0px rgba(255, 255, 255, 0.04)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 28,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontSize: 18,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.72)",
            fontWeight: 700,
          }}
        >
          404
        </span>
        <span
          style={{
            fontSize: 32,
            lineHeight: 0.95,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            maxWidth: 220,
          }}
        >
          get out
        </span>
        <span
          style={{
            fontSize: 18,
            lineHeight: 1,
            color: "rgba(255,255,255,0.84)",
            fontWeight: 500,
          }}
        >
          from our room pls
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: "10vh",
          right: 36,
          bottom: "8vh",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "space-between",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            fontSize: "clamp(42px, 5vw, 76px)",
            lineHeight: 0.9,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "rgba(255,255,255,0.96)",
          }}
        >
          HUH ?
        </span>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          <span
            style={{
              fontSize: "clamp(26px, 2.8vw, 44px)",
              lineHeight: 0.95,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              textAlign: "right",
              maxWidth: 260,
            }}
          >
            you shouldnt
          </span>
          <span
            style={{
              fontSize: "clamp(26px, 2.8vw, 44px)",
              lineHeight: 0.95,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              textAlign: "right",
              maxWidth: 260,
            }}
          >
            be her
          </span>
        </div>
      </div>
      <a
        href="/"
        style={{
          position: "absolute",
          right: 18,
          bottom: 18,
          zIndex: 3,
          minWidth: 138,
          height: 38,
          borderRadius: 12,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
          background: "linear-gradient(180deg, #16181C 0%, #121316 100%)",
          boxShadow: "inset 0px -2px 0px -1px #060709, inset 0px 1px 0px rgba(255, 255, 255, 0.04)",
          color: "#FFFFFF",
          textDecoration: "none",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        go back to main page
      </a>
    </div>
  );
};

export default NotFound;
