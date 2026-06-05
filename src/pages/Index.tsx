import React, { useState, useEffect } from 'react';
import SeoHead from "@/components/SeoHead";
import { SITE_URL } from "@/data/seoPages";

// --- Type Definition for Page State ---
type Page = '/' | '/travel' | '/consulting' | '/tech' | '/about' | '/contact';
type DisplayPage = 'home' | 'travel' | 'consulting' | 'tech' | 'about' | 'contact';

/**
 * Maps the URL path to a simplified internal page name.
 * @param path The current window location pathname.
 * @returns The internal display name for the page.
 */
const mapPathToPageName = (path: string): DisplayPage => {
    switch(path) {
        case '/travel': return 'travel';
        case '/consulting': return 'consulting';
        case '/tech': return 'tech';
        case '/about': return 'about';
        case '/contact': return 'contact';
        case '/':
        default: return 'home';
    }
};

// --- Global Styles Component ---
const GlobalStyles = () => (
  <style jsx="true">{`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;700&family=Press+Start+2P&display=swap');

    /* --- Custom Properties (Black Mode) --- */
    :root {
        --background-dark: #0A0A0A;
        --background-med: #1A1A1A;
        --text-light: #EAEAEA;
        --text-muted: #B0BEC5;
        --accent-purple: #668dbc;
        --accent-blue: #03DAC6;
        --travel-seafoam: #7ec8bf;
        --travel-seafoam-soft: #c7d8cf;
        --travel-ink: #0b0b0d;
        --border-light: rgba(255, 255, 255, 0.1);
        --border-radius-smooth: 12px;
    }

    /* --- Base & Scroll Fix --- */
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: 'Poppins', sans-serif;
    }

    html, body {
        margin: 0;
        padding: 0;
        min-height: 100%;
        height: 100%;
        overflow-x: hidden;
        overscroll-behavior-y: none;
    }

    body {
        background-color: var(--background-dark);
        color: var(--text-light);
        line-height: 1.6;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    #root {
        min-height: 100%;
        overscroll-behavior-y: none;
    }

    ::-webkit-scrollbar { display: none; }

    /* --- Typography & Branding --- */
    h1, h2, h3 {
        color: var(--text-light);
        margin-bottom: 0.5em;
        font-family: 'Playfair Display', serif; 
    }
    h1 { font-size: clamp(3rem, 7vw, 5rem); font-weight: 700; letter-spacing: -1px; color: var(--accent-purple); }
    h2 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; color: var(--text-light); }
    h3 { font-size: 1.6rem; color: var(--accent-purple); font-weight: 600; font-family: 'Poppins', sans-serif; }
    p { line-height: 1.7; color: var(--text-muted); font-weight: 400;}
    .logo {
        color: var(--text-light);
        font-weight: 700;
        font-size: 1.5rem;
        text-decoration: none;
    }
    
    /* --- Form Elements --- */
    input[type="text"], input[type="email"], select, textarea {
        width: 100%;
        padding: 12px;
        margin-bottom: 20px;
        border: 1px solid var(--border-light);
        background-color: var(--background-dark);
        color: var(--text-light);
        border-radius: var(--border-radius-smooth);
        transition: border-color 0.2s;
    }
    input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: var(--accent-purple);
    }
    label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: var(--text-light);
    }
    textarea {
        resize: vertical;
        min-height: 120px;
    }

    /* --- Components: Buttons & Links --- */
    .button-style {
        display: inline-block;
        background-color: var(--background-med); 
        color: var(--text-light);
        border: 1px solid var(--border-light);
        border-radius: 50px; 
        padding: 12px 28px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        font-weight: 500;
        margin-top: 15px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        font-size: 0.95rem;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5); 
    }

    .button-style:hover {
        background-color: var(--accent-purple);
        color: var(--background-dark); 
        border-color: var(--accent-purple);
        transform: translateY(-1px);
        box-shadow: 0 5px 15px rgba(187, 134, 252, 0.3);
    }
    
    .primary-button {
        background-color: var(--accent-purple);
        color: var(--background-dark); 
        border-color: var(--accent-purple);
        box-shadow: none;
    }
    .primary-button:hover {
        background-color: #232323;
        border-color: #3a3a3a;
        box-shadow: none;
        color: var(--text-light);
    }

    /* --- Navbar --- */
    .navbar-wrapper {
        position: sticky;
        top: 0;
        z-index: 1000;
        background-color: var(--background-dark); 
        border-bottom: 1px solid var(--border-light);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        transition: transform 0.24s ease, opacity 0.24s ease;
    }

    .navbar-wrapper.home-header {
        position: static;
        top: auto;
        transform: none;
        opacity: 1;
        pointer-events: auto;
    }

    .navbar-wrapper.home-header.is-hidden {
        transform: none;
        opacity: 1;
        pointer-events: auto;
    }

    .navbar {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        max-width: 1300px; 
        margin: 0 auto; 
        padding: 15px 50px; 
    }

    .navbar .logo {
        position: absolute;
        left: 50px;
        top: 50%;
        transform: translateY(-50%);
    }
    
    .nav-links-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px; 
    }

    .nav-link {
        padding: 8px 0;
        border: none;
        background-color: transparent;
        margin: 0;
        color: var(--text-light);
        text-transform: none; 
        font-weight: 500;
        font-size: 1rem;
        text-decoration: none;
        cursor: pointer;
        box-shadow: none;
        transition: all 0.2s ease;
    }

    .nav-link:hover:not(.button-style) {
        color: var(--accent-purple);
        border-bottom: 2px solid var(--accent-purple);
        padding-bottom: 6px;
    }
    
    .nav-link.active {
         border-bottom: 2px solid var(--accent-purple);
         padding-bottom: 6px;
    }
    
    /* Dropdown specific styles */
    .dropdown {
        position: relative;
        display: inline-block;
    }

    .dropdown-menu {
        position: absolute;
        top: 100%; 
        left: 50%; 
        transform: translateX(-50%) translateY(10px);
        min-width: 200px;
        z-index: 1001; 
        background-color: var(--background-med); 
        border-radius: var(--border-radius-smooth);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.8);
        border: 1px solid var(--border-light);
        padding: 10px 0;
        transition: opacity 0.1s ease, transform 0.1s ease, visibility 0.1s;
    }
    
    .dropdown-menu.hidden {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateX(-50%) translateY(10px);
    }
    .dropdown-menu.visible {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateX(-50%) translateY(0);
    }
    
    .dropdown-menu a {
        padding: 10px 20px;
        display: block; 
        margin: 0;
        text-align: left;
        background-color: transparent;
        text-transform: none;
        font-size: 0.95rem;
        color: var(--text-light);
        text-decoration: none;
    }
    .dropdown-menu a:hover {
        background-color: var(--accent-purple);
        color: var(--background-dark); 
        border-bottom: none;
    }


    /* --- Main Content Layout & Page Views --- */
    .page-view {
        min-height: calc(100vh - 76px);
        position: relative; 
        z-index: 10;
        padding: 0; 
        max-width: 1300px;
        margin: 0 auto;
    }
    
    .view-content-padding {
        padding: 4rem 3rem; 
        max-width: 100%;
        margin: 0 auto;
    }
    
    section {
        padding: 60px 0;
        margin-bottom: 0;
        text-align: center;
    }

    /* --- Hero Section (3D Model) - Fully Maximized --- */
    .hero-section {
        position: relative;
        height: 100vh;
        width: 100vw;
        /* Pulls the section to the very edge of the viewport */
        margin-left: calc(50% - 50vw); 
        display: block;
        background-color: var(--background-dark);
        z-index: 1; 
        overflow: hidden;
    }

    spline-viewer {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 5;
        opacity: 1;
        pointer-events: none;
    }
    
    /* Overlay to hide 'Built with Spline' badge */
    .spline-overlay {
        position: absolute;
        bottom: 0;
        right: 0;
        background-color: var(--background-dark); 
        width: 180px; 
        height: 60px; 
        z-index: 9; 
    }
    
    /* --- Card Style --- */
    .section-card {
        background-color: var(--background-med); 
        border-radius: var(--border-radius-smooth);
        padding: 40px;
        border: 1px solid var(--border-light);
        transition: all 0.2s ease-in-out;
        margin-top: 30px;
        text-align: left;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
        position: relative;
        overflow: hidden;
    }
    
    .section-card::before { 
        content: '';
        position: absolute;
        top: -20px;
        right: -20px;
        width: 80px;
        height: 80px;
        background-color: var(--accent-blue);
        opacity: 0.15; 
        border-radius: 50%;
        transform: rotate(45deg);
        z-index: 0;
    }
    .section-card:nth-child(even)::before {
        background-color: var(--accent-purple);
        top: auto;
        bottom: -20px;
        left: -20px;
    }

    .section-card:hover {
        transform: translateY(-3px);
        border-color: var(--accent-purple);
        box-shadow: 0 10px 30px rgba(187, 134, 252, 0.25);
    }
    
    /* Grid for Solutions */
    .solutions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
    }
    
    /* Footer */
    .footer {
        padding: 50px 50px;
        background-color: var(--background-med); 
        border-top: 1px solid var(--border-light);
        text-align: center;
        font-size: 0.9rem;
        color: var(--text-muted);
        padding-bottom: 80px; 
    }

    .mobile-bottom-nav {
        display: none;
    }

    .mobile-bottom-spacer {
        display: none;
    }

    
    /* ── Expertise Cards (bigger, with image top) ───────────────────────── */
    .expertise-card {
        background-color: var(--background-med);
        border-radius: var(--border-radius-smooth);
        border: 1px solid var(--border-light);
        transition: all 0.25s ease-in-out;
        text-align: left;
        box-shadow: 0 5px 20px rgba(0,0,0,0.5);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    .expertise-card:hover {
        transform: translateY(-5px);
        border-color: var(--accent-purple);
        box-shadow: 0 16px 40px rgba(187,134,252,0.22);
    }
    .expertise-card .card-image {
        width: 100%;
        height: 230px;
        background: linear-gradient(135deg, #10101e 0%, #1a1340 60%, #0d1b2a 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        border-bottom: 1px solid var(--border-light);
        flex-shrink: 0;
    }
    .expertise-card .card-image.tech-logo-frame {
        background: #ffffff;
    }
    .expertise-card .card-image.travel-logo-frame {
        background: #C0D7C7;
    }
    .expertise-card .card-image.consulting-logo-frame {
        background: #C2C3AE;
    }
    .expertise-card .card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
    .expertise-card .card-image .consulting-logo-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    .expertise-card .card-image .travel-logo-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    .expertise-card .card-image .tech-logo-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    .expertise-card .card-image svg {
        opacity: 0.5;
    }
    .expertise-card .card-content {
        padding: 30px 32px 34px;
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    .expertise-card .card-content h3 {
        margin-bottom: 12px;
    }
    .expertise-card .card-content .tech-card-title {
        text-align: center;
        font-family: 'Press Start 2P', monospace;
        font-size: clamp(0.95rem, 1.4vw, 1.1rem);
        line-height: 1.5;
        letter-spacing: 0.04em;
        background: linear-gradient(90deg, #111111 0%, #8fd3ff 52%, #ffffff 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
    }
    .expertise-card .card-content .consulting-card-title {
        text-align: center;
        font-family: 'Playfair Display', serif;
        font-size: clamp(1.35rem, 2vw, 1.6rem);
        line-height: 1.2;
        letter-spacing: 0.02em;
        color: #8F9D84;
    }
    .expertise-card .card-content .consulting-card-title span {
        color: #D88B52;
    }
    .expertise-card .card-content p {
        flex: 1;
        margin-bottom: 22px;
    }
    .expertise-card.travel-card {
        border-color: rgba(126, 200, 191, 0.6);
        box-shadow: 0 10px 24px rgba(64, 124, 118, 0.18);
    }
    .expertise-card.travel-card:hover {
        border-color: var(--travel-seafoam);
        box-shadow: 0 18px 40px rgba(126, 200, 191, 0.2);
    }
    .expertise-card.travel-card .card-content {
        background: linear-gradient(180deg, rgba(199, 216, 207, 0.1) 0%, rgba(26, 26, 26, 0.92) 55%, rgba(26, 26, 26, 1) 100%);
    }
    .expertise-card.travel-card .travel-card-title {
        text-align: center;
        margin-bottom: 14px;
        color: var(--travel-ink);
        font-family: 'Poppins', sans-serif;
        font-size: clamp(1.2rem, 1.8vw, 1.45rem);
        font-weight: 500;
        letter-spacing: 0.34em;
        text-transform: uppercase;
    }
    .expertise-card.travel-card .travel-card-title span {
        display: block;
        margin-top: 10px;
        color: var(--travel-seafoam);
        font-size: 0.92rem;
        font-weight: 500;
        letter-spacing: 0.68em;
    }
    .expertise-card.travel-card .card-content p {
        color: #d6e6df;
    }
    .expertise-card.travel-card .button-style {
        align-self: flex-start;
        background: rgba(199, 216, 207, 0.08);
        color: var(--travel-seafoam);
        border-color: rgba(126, 200, 191, 0.6);
        box-shadow: 0 6px 18px rgba(126, 200, 191, 0.12);
    }
    .expertise-card.travel-card .button-style:hover {
        background: var(--travel-seafoam);
        color: var(--travel-ink);
        border-color: var(--travel-seafoam);
        box-shadow: 0 12px 24px rgba(126, 200, 191, 0.24);
    }

    /* ── Stats Row ───────────────────────────────────────────────────────── */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        border: 1px solid var(--border-light);
        border-radius: var(--border-radius-smooth);
        overflow: hidden;
    }
    .stat-item {
        padding: 44px 20px;
        text-align: center;
        border-right: 1px solid var(--border-light);
        background: var(--background-med);
        transition: background 0.2s;
    }
    .stat-item:last-child { border-right: none; }
    .stat-item:hover { background: #222; }
    .stat-number {
        font-size: 2.8rem;
        font-weight: 800;
        color: var(--accent-purple);
        font-family: 'Poppins', sans-serif;
        letter-spacing: -1px;
        line-height: 1;
    }
    .stat-label {
        font-size: 0.78rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1.2px;
        margin-top: 8px;
    }

    /* ── How We Work Steps ───────────────────────────────────────────────── */
    .steps-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-top: 40px;
    }
    .step-card {
        background: var(--background-med);
        border: 1px solid var(--border-light);
        border-radius: var(--border-radius-smooth);
        padding: 38px 30px 34px;
        text-align: left;
        position: relative;
        overflow: hidden;
        transition: border-color 0.2s, transform 0.2s;
    }
    .step-card:hover { border-color: #3a3a3a; transform: translateY(-3px); }
    .step-number {
        font-size: 5rem;
        font-weight: 900;
        color: var(--accent-purple);
        opacity: 0.08;
        position: absolute;
        top: 10px;
        right: 20px;
        line-height: 1;
        font-family: 'Poppins', sans-serif;
        user-select: none;
    }
    .step-icon {
        display: block;
        margin-bottom: 14px;
    }

    /* ── CTA Banner ──────────────────────────────────────────────────────── */
    .cta-banner {
        background: linear-gradient(135deg, #150a2e 0%, #16213e 55%, #0a1520 100%);
        border: 1px solid rgba(187,134,252,0.25);
        border-radius: 18px;
        padding: 72px 48px;
        text-align: center;
        position: relative;
        overflow: hidden;
        --pointer-x: 50%;
        --pointer-y: 50%;
        --pointer-opacity: 0;
    }
    .cta-banner::before {
        content: '';
        position: absolute;
        top: -80px; right: -80px;
        width: 260px; height: 260px;
        background: radial-gradient(circle, rgba(187,134,252,0.14) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
    }
    .cta-banner::after {
        content: '';
        position: absolute;
        bottom: -80px; left: -80px;
        width: 240px; height: 240px;
        background: radial-gradient(circle, rgba(3,218,198,0.09) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
    }
    .cta-pointer-effect {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        opacity: var(--pointer-opacity);
        background:
            radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(45, 67, 102, 0.34) 0%, rgba(31, 48, 76, 0.24) 14%, rgba(20, 31, 51, 0.16) 24%, transparent 36%),
            radial-gradient(circle at calc(var(--pointer-x) + 30px) calc(var(--pointer-y) - 16px), rgba(70, 98, 138, 0.16) 0%, transparent 8%),
            radial-gradient(circle at calc(var(--pointer-x) - 24px) calc(var(--pointer-y) + 22px), rgba(28, 44, 69, 0.2) 0%, transparent 7%),
            radial-gradient(circle at calc(var(--pointer-x) + 12px) calc(var(--pointer-y) + 32px), rgba(55, 78, 112, 0.14) 0%, transparent 6%);
        transition: opacity 1.6s ease-out;
        will-change: opacity, background;
    }
    .quick-contact-form {
        max-width: 620px;
        margin: 28px auto 0;
        padding: 24px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.12);
        background: linear-gradient(135deg, rgba(12, 20, 32, 0.96) 0%, rgba(18, 30, 48, 0.94) 55%, rgba(10, 18, 28, 0.96) 100%);
        text-align: left;
        position: relative;
        z-index: 1;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
        backdrop-filter: blur(10px);
    }
    .quick-contact-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
    }
    .quick-contact-full {
        grid-column: 1 / -1;
    }
    .quick-contact-form .button-style {
        margin-top: 0;
    }

    /* ── Trust / Why strip ────────────────────────────────────────────────── */
    .why-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-top: 40px;
    }
    .why-card {
        background: var(--background-med);
        border: 1px solid var(--border-light);
        border-radius: var(--border-radius-smooth);
        padding: 32px 28px;
        text-align: left;
        transition: border-color 0.2s;
    }
    .why-card:hover { border-color: rgba(255,255,255,0.18); }
    .why-icon { display: block; margin-bottom: 14px; }

    .platforms-section-title {
        font-size: clamp(1.3rem, 2.1vw, 1.8rem);
        margin-bottom: 26px;
        color: #ffffff;
        font-family: 'Playfair Display', serif;
        font-weight: 700;
    }
    .platforms-strip {
        position: relative;
        overflow: hidden;
        border-radius: 18px;
        background: linear-gradient(135deg, #111111 0%, #171326 50%, #0d1522 100%);
        padding: 22px 0;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 18px 45px rgba(0, 0, 0, 0.22);
    }
    .platform-row {
        overflow: hidden;
        margin-bottom: 14px;
    }
    .platform-row:last-child {
        margin-bottom: 0;
    }
    .platform-row-marquee {
        display: flex;
        width: max-content;
        animation: platform-row-scroll var(--row-duration) linear infinite;
    }
    .platforms-track {
        display: flex;
        align-items: center;
        gap: 18px;
        padding-right: 0;
    }
    .platform-item {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 190px;
        height: 68px;
        padding: 10px 16px;
        border-radius: 14px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
    }
    .platform-link {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        color: inherit;
    }
    .platform-logo-wrap {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
    .platform-item img {
        max-width: 132px;
        max-height: 40px;
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
    }
    .platform-item:hover {
        transform: translateY(-2px);
        background: rgba(255,255,255,0.07);
        border-color: rgba(255,255,255,0.16);
    }
    .platform-fallback {
        color: var(--text-light);
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        font-size: 0.78rem;
        text-align: center;
    }

    @keyframes platform-row-scroll {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
    }

    /* Responsive Adjustments */
    @media (max-width: 768px) {
        .navbar-wrapper.home-header {
            position: static;
            top: auto;
            transform: none;
            opacity: 1;
            pointer-events: auto;
        }

        .navbar-wrapper.home-header.is-hidden {
            transform: none;
            opacity: 1;
            pointer-events: auto;
        }

        .navbar {
            flex-direction: column;
            align-items: center; 
            justify-content: flex-start;
            position: static;
            padding: 10px 20px 12px; 
            gap: 6px; 
        }

        .navbar .logo {
            position: static;
            transform: none;
        }
        
        .nav-links-container {
            flex-wrap: wrap; 
            justify-content: center;
            margin-top: 0;
            gap: 10px 14px; 
            width: 100%; 
        }

        .logo {
            font-size: 1.85rem;
        }
        
        .view-content-padding {
            padding: 4rem 1.5rem;
        }

        .hero-section {
            height: 80vh;
            width: 100%;
            margin-left: 0;
        }

        .mobile-bottom-nav {
            position: fixed;
            left: 18px;
            right: 18px;
            bottom: 14px;
            z-index: 1200;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(18px);
            border: 1px solid rgba(18, 24, 38, 0.08);
            border-radius: 20px;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
        }

        .mobile-bottom-nav a {
            min-height: 58px;
            border-radius: 14px;
            text-decoration: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            color: #94A3B8;
            background: transparent;
            transition: background-color 0.2s ease, color 0.2s ease;
        }

        .mobile-bottom-nav a svg {
            width: 18px;
            height: 18px;
            stroke: currentColor;
            fill: none;
            stroke-width: 1.9;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        .mobile-bottom-nav a span {
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.01em;
        }

        .mobile-bottom-nav a.active {
            color: #0F766E;
            background: linear-gradient(180deg, rgba(20, 184, 166, 0.18) 0%, rgba(20, 184, 166, 0.1) 100%);
        }

        .mobile-bottom-spacer {
            display: block;
            height: 96px;
        }

        .stats-grid { grid-template-columns: repeat(2, 1fr); }
        .steps-grid { grid-template-columns: 1fr; }
        .why-grid   { grid-template-columns: 1fr; }
        .cta-banner { padding: 48px 24px; }
        .quick-contact-grid { grid-template-columns: 1fr; }
        .platform-item {
            min-width: 150px;
            height: 56px;
            padding: 8px 12px;
        }
        .platform-item img {
            max-width: 104px;
            max-height: 32px;
        }
    }
  `}</style>
);

// --- Page View Components (Modularized for Clarity) ---

const TravelView: React.FC = () => (
    <div className="page-view">
        <div className="view-content-padding">
            <section>
                <h2>Kayrosco Travel: Your Albanian Adventure Starts Here</h2>
                <p className="text-muted" style={{ maxWidth: '800px', margin: '0 auto 40px' }}>
                    We provide the highest quality travel logistics, ensuring a luxurious, safe, and memorable exploration of Albania's stunning landscapes and rich history.
                </p>
                <div className="solutions-grid">
                    <div className="section-card">
                        <h3>Luxury Vehicle Rentals</h3>
                        <p>Access our premium fleet of sedans and SUVs for comfortable travel across the country, complete with 24/7 roadside assistance.</p>
                    </div>
                    <div className="section-card">
                        <h3>Custom Tour Packages</h3>
                        <p>From the Albanian Riviera to historical sites like Berat and Gjirokastër, our multi-lingual guides offer personalized, immersive experiences.</p>
                    </div>
                    <div className="section-card">
                        <h3>Accommodation & Logistics</h3>
                        <p>We handle all reservations, transfers, and specific logistical requests, providing a truly stress-free, all-inclusive service.</p>
                    </div>
                </div>
            </section>
        </div>
    </div>
);

const ConsultingView: React.FC = () => (
    <div className="page-view">
        <div className="view-content-padding">
            <section>
                <h2>Kayrosco Consulting: Legal Clarity for Business</h2>
                <p className="text-muted" style={{ maxWidth: '800px', margin: '0 auto 40px' }}>
                    Our legal and business consultants specialize in navigating the complexities of establishing and operating a foreign entity in Albania.
                </p>
                <div className="solutions-grid">
                    <div className="section-card">
                        <h3>Company Formation</h3>
                        <p>Complete support for registering S.H.P.K. (LLC) or branches, ensuring full compliance with local commercial law from day one.</p>
                    </div>
                    <div className="section-card">
                        <h3>Residency & Permits</h3>
                        <p>Expert processing of temporary and permanent residency permits, work permits, and necessary bureaucratic documentation.</p>
                    </div>
                    <div className="section-card">
                        <h3>Tax & Compliance</h3>
                        <p>Ongoing guidance on VAT, payroll, and corporate taxation to keep your operations legal and optimized in the region.</p>
                    </div>
                </div>
            </section>
        </div>
    </div>
);

const TechView: React.FC = () => (
    <div className="page-view">
        <div className="view-content-padding">
            <section>
                <h2>Kayrosco Tech: Secure Digital & Physical Presence</h2>
                <p className="text-muted" style={{ maxWidth: '800px', margin: '0 auto 40px' }}>
                    Building secure, high-performance digital foundations and ensuring the physical security of your assets in Albania.
                </p>
                <div className="solutions-grid">
                    <div className="section-card">
                        <h3>Web & E-Commerce Development</h3>
                        <p>Modern, responsive, and scalable website and e-commerce platforms designed for optimal performance in the Balkan market.</p>
                    </div>
                    <div className="section-card">
                        <h3>Enterprise System Integration</h3>
                        <p>Connecting your existing international business systems with local Albanian infrastructure for seamless operations.</p>
                    </div>
                    <div className="section-card">
                        <h3>Security & CCTV Systems</h3>
                        <p>Professional installation and maintenance of high-definition surveillance and security systems for business and residential clients.</p>
                    </div>
                </div>
            </section>
        </div>
    </div>
);

const AboutView: React.FC = () => (
    <div className="page-view">
        <div className="view-content-padding">
            <section>
                <h2>About Kayrosco Group</h2>
                <p className="text-muted" style={{ maxWidth: '800px', margin: '0 auto 40px' }}>
                    Kayrosco Group was founded on the principle of providing clear, focused, and impactful solutions for international clients engaging with Albania. Our integrated service model ensures that whether your needs are related to tourism, business formation, legal compliance, or technology, you have a single, trusted partner.
                </p>
            
                <div className="solutions-grid">
                     <div className="section-card">
                        <h3>Our Mission</h3>
                        <p>To be the definitive bridge between the global market and the opportunities present in the fast-developing Albanian economy.</p>
                    </div>
                    <div className="section-card">
                        <h3>Our Vision</h3>
                        <p>To establish a new standard for excellence and reliability in integrated business and travel services in the Western Balkans.</p>
                    </div>
                </div>

                <div className="section-card" style={{ maxWidth: '800px', margin: '30px auto', textAlign: 'center' }}>
                    <h3>Our Hub</h3>
                    <p><strong>Main Address:</strong> Rruga 'e Kavajes', Pallati 18/A, Kati 3, Tirana, Albania 1001</p>
                    <p style={{ marginTop: '10px' }}><strong>Hours:</strong> Mon - Fri: 09:00 - 17:00</p>
                    <div className="map-placeholder">
                        <p>Interactive Map Placeholder (Google Maps)</p>
                    </div>
                </div>
            </section>
        </div>
    </div>
);

const ContactView: React.FC = () => (
    <div className="page-view">
        <div className="view-content-padding">
            <section>
                <h2>Let's Connect</h2>
                <p className="text-muted" style={{ maxWidth: '800px', margin: '0 auto 40px' }}>
                    Reach out today for tailored advice on your business, travel, or legal requirements in Albania.
                </p>
                
                <form 
                    className="section-card" 
                    style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}
                    onSubmit={(e) => e.preventDefault()}
                >
                    <label htmlFor="fullName">Full Name</label>
                    <input type="text" id="fullName" placeholder="John Doe" />
                    
                    <label htmlFor="emailAddress">Email Address</label>
                    <input type="email" id="emailAddress" placeholder="you@example.com" />
                    
                    <label htmlFor="serviceInterest">Service Interest</label>
                    <select id="serviceInterest">
                        <option value="">-- Select a Service --</option>
                        <option value="General">General Inquiry</option>
                        <option value="Travel">Kayrosco Travel</option>
                        <option value="Consulting">Kayrosco Consulting (Legal/Residency)</option>
                        <option value="Tech">Kayrosco Tech (Website/CCTV)</option>
                    </select>

                    <label htmlFor="message">Your Message</label>
                    <textarea id="message" placeholder="Tell us about your project or inquiry..."></textarea>
                    
                    <button 
                        type="submit" 
                        className="button-style primary-button" 
                        style={{ width: '100%', marginTop: '30px' }}
                    >
                        Send Message
                    </button>
                </form>
                
                <div style={{ padding: '40px 0' }}>
                    <div className="solutions-grid" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div className="section-card" style={{margin: 0, padding: '20px', textAlign: 'center'}}>
                            <strong>Email Us</strong>
                            <p>info@kayrosco.com</p>
                        </div>
                        <div className="section-card" style={{margin: 0, padding: '20px', textAlign: 'center'}}>
                            <strong>Call Us</strong>
                            <p>+355 42 XXX XXXX</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
);

// --- Home View (Container for Hero and Main Sections) ---
const HomeView: React.FC = () => {
    const SplineViewer = 'spline-viewer';
    const [showQuickContact, setShowQuickContact] = useState(false);
    const [showMoreExpertise, setShowMoreExpertise] = useState(false);
    const [ctaPointer, setCtaPointer] = useState({ x: '50%', y: '50%', active: false });
    const platformRows = [
        [
            { name: 'Kayrosco Group', href: '/', logo: '/lolo.png' },
            { name: 'Turkish Airlines', href: 'https://www.turkishairlines.com/', logo: 'https://www.google.com/s2/favicons?sz=256&domain_url=turkishairlines.com' },
            { name: 'Pegasus Airlines', href: 'https://www.flypgs.com/', logo: 'https://www.google.com/s2/favicons?sz=256&domain_url=flypgs.com' },
            { name: 'Stripe', href: 'https://stripe.com/', logo: 'https://www.google.com/s2/favicons?sz=256&domain_url=stripe.com' },
            { name: 'PayPal', href: 'https://www.paypal.com/', logo: 'https://www.google.com/s2/favicons?sz=256&domain_url=paypal.com' },
        ],
        [
            { name: 'Kayrosco Tech', href: '/tech', logo: '/logo 7.png' },
            { name: 'Amazon Web Services', href: 'https://aws.amazon.com/', logo: 'https://www.google.com/s2/favicons?sz=256&domain_url=aws.amazon.com' },
            { name: 'Google Cloud', href: 'https://cloud.google.com/', logo: 'https://www.google.com/s2/favicons?sz=256&domain_url=cloud.google.com' },
            { name: 'Hostinger', href: 'https://www.hostinger.com/', logo: 'https://www.google.com/s2/favicons?sz=256&domain_url=hostinger.com' },
            { name: 'Vercel', href: 'https://vercel.com/', logo: 'https://www.google.com/s2/favicons?sz=256&domain_url=vercel.com' },
        ],
        [
            { name: 'Kayrosco Group', href: '/', logo: '/lolo.png' },
            { name: 'Kayrosco Tech', href: '/tech', logo: '/logo 7.png' },
            { name: 'e-Albania', href: 'https://e-albania.al/', logo: 'https://www.google.com/s2/favicons?sz=256&domain_url=e-albania.al' },
            { name: 'Google Workspace', href: 'https://workspace.google.com/', logo: 'https://www.google.com/s2/favicons?sz=256&domain_url=workspace.google.com' },
            { name: 'Microsoft 365', href: 'https://www.office.com/', logo: 'https://www.google.com/s2/favicons?sz=256&domain_url=office.com' },
        ],
    ] as const;
    const rowDurations = ['34s', '42s', '50s'];
    const rowDelays = ['0s', '-1s', '-2s'];

    const renderPlatformItem = (platform: { name: string; href: string; logo: string }, key: string, hideFromTabOrder = false) => (
        <div className="platform-item" key={key}>
            <a className="platform-link" href={platform.href} target="_blank" rel="noreferrer" tabIndex={hideFromTabOrder ? -1 : undefined}>
                <div className="platform-logo-wrap">
                    <img
                        src={platform.logo}
                        alt={`${platform.name} logo`}
                        onError={(event) => {
                            const target = event.currentTarget;
                            target.style.display = 'none';
                            const next = target.nextElementSibling as HTMLSpanElement | null;
                            if (next) next.style.display = 'inline-block';
                        }}
                    />
                    <span className="platform-fallback" style={{ display: 'none' }}>{platform.name}</span>
                </div>
            </a>
        </div>
    );

    return (
        <>
            {/* ── Hero Section ─────────────────────────────────────────────────── */}
            <header className="hero-section">
                <SplineViewer url="https://prod.spline.design/LXf1X0FWeQcVWk8c/scene.splinecode" />
                {/* Badge hider */}
                <div className="spline-overlay"></div>
            </header>

            {/* ── Main Content ─────────────────────────────────────────────────── */}
            <div className="page-view">
                <div className="view-content-padding">

                    {/* Gateway intro */}
                    <section>
                        <div className="section-header">
                            <h2>Built as a Group. Driven by Vision.</h2>
                            <p>Kayrosco Group brings multiple companies together under one name, delivering projects across industries and across borders. <strong>Bold structure. Real reach.</strong></p>
                            <a className="button-style primary-button" href="#integrated-expertise">
                                Take a Closer Look &rarr;
                            </a>
                        </div>
                    </section>

                    {/* ── Stats ── */}
                    <section style={{ padding: '10px 0 70px' }}>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-number">3+</div>
                                <div className="stat-label">Owned Companies</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">4+</div>
                                <div className="stat-label">Countries Active</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">50+</div>
                                <div className="stat-label">Projects Delivered</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">1</div>
                                <div className="stat-label">Unified Group</div>
                            </div>
                        </div>
                    </section>

                    {/* ── Integrated Expertise — bigger cards with image ── */}
                    <section id="integrated-expertise">
                        <div className="section-header">
                            <h2>Integrated Expertise</h2>
                            <p>Three specialized companies, one unified mission: simplifying your ventures in Albania.</p>
                        </div>

                        <div className="solutions-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: 40 }}>
                            {/* Travel */}
                            <div className="expertise-card travel-card">
                                <div className="card-image travel-logo-frame">
                                    <img className="travel-logo-image" src="/logo 11 (final travel ).png" alt="Kayrosco Travel logo" />
                                </div>
                                <div className="card-content">
                                    <h3 className="travel-card-title">Kayrosco <span>Travel</span></h3>
                                    <p>Experience Albania with premium rentals, expert multi-lingual guides, and complete end-to-end logistics support tailored to every journey.</p>
                                    <a className="button-style" href="/travel">Discover More &rarr;</a>
                                </div>
                            </div>

                            {/* Consulting */}
                            <div className="expertise-card">
                                <div className="card-image consulting-logo-frame">
                                    <img className="consulting-logo-image" src="/logo kc finall.png" alt="Kayrosco Consulting logo" />
                                </div>
                                <div className="card-content">
                                    <h3 className="consulting-card-title">Kayrosco <span>Consulting</span></h3>
                                    <p>Navigate the Albanian regulatory environment with expert guidance on company formation, residency permits, and full legal compliance.</p>
                                    <a className="button-style" href="/consulting">Get Started &rarr;</a>
                                </div>
                            </div>

                            {/* Tech */}
                            <div className="expertise-card">
                                <div className="card-image tech-logo-frame">
                                    <img className="tech-logo-image" src="/logo 7.png" alt="Kayrosco Tech logo" />
                                </div>
                                <div className="card-content">
                                    <h3 className="tech-card-title">Kayrosco Tech</h3>
                                    <p>Power your digital presence and physical security with custom software, modern web platforms, and professional CCTV systems.</p>
                                    <a className="button-style" href="/tech">Innovate &rarr;</a>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                            <button
                                type="button"
                                className="button-style"
                                onClick={() => setShowMoreExpertise((current) => !current)}
                            >
                                {showMoreExpertise ? 'Show less' : 'Show more'}
                            </button>
                        </div>

                        {showMoreExpertise && (
                            <div className="solutions-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginTop: 24 }}>
                                {[1, 2, 3].map((item) => (
                                    <div key={`soon-company-${item}`} className="expertise-card">
                                        <div className="card-image" style={{ background: 'linear-gradient(180deg, rgba(102, 141, 188, 0.12), rgba(255,255,255,0.03))' }}>
                                            <img
                                                src="/soon.png"
                                                alt={`Coming soon company ${item}`}
                                            />
                                        </div>
                                        <div className="card-content" style={{ textAlign: 'center' }}>
                                            <h3 style={{ marginBottom: 0 }}>Coming Soon</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ── Why Kayrosco ── */}
                    <section style={{ paddingTop: 80 }}>
                        <div className="section-header">
                            <h2>Why Kayrosco?</h2>
                            <p>Local knowledge, global standards. One trusted partner for everything Albania.</p>
                        </div>
                        <div className="why-grid">
                            <div className="why-card">
                                <svg className="why-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                </svg>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-light)', fontFamily: "'Poppins', sans-serif", marginBottom: 8 }}>Local Roots, Global Reach</h3>
                                <p style={{ fontSize: '0.9rem' }}>Born and based in Albania, we have the relationships and on-the-ground knowledge that no outsider can replicate.</p>
                            </div>
                            <div className="why-card">
                                <svg className="why-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-light)', fontFamily: "'Poppins', sans-serif", marginBottom: 8 }}>One Partner, Three Disciplines</h3>
                                <p style={{ fontSize: '0.9rem' }}>No hand-offs, no gaps. Our divisions talk to each other so your experience is always seamless.</p>
                            </div>
                            <div className="why-card">
                                <svg className="why-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-light)', fontFamily: "'Poppins', sans-serif", marginBottom: 8 }}>Transparent & Accountable</h3>
                                <p style={{ fontSize: '0.9rem' }}>Clear pricing, honest timelines, and a team that stands behind every commitment it makes.</p>
                            </div>
                        </div>
                    </section>

                    <section style={{ paddingTop: 30, paddingBottom: 10 }}>
                        <h2 className="platforms-section-title">Platforms & Services</h2>
                        <div className="platforms-strip">
                            {platformRows.map((row, rowIndex) => (
                                <div
                                    className="platform-row"
                                    key={`row-${rowIndex}`}
                                    style={{
                                        ['--row-duration' as any]: rowDurations[rowIndex],
                                        ['animationDelay' as any]: rowDelays[rowIndex],
                                    }}
                                >
                                    <div className="platform-row-marquee" style={{ animationDelay: rowDelays[rowIndex] }}>
                                        <div className="platforms-track">
                                            {row.map((platform) => renderPlatformItem(platform, `row-${rowIndex}-${platform.name}`))}
                                        </div>
                                        <div className="platforms-track" aria-hidden="true">
                                            {row.map((platform) => renderPlatformItem(platform, `row-copy-${rowIndex}-${platform.name}`, true))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── CTA Banner ── */}
                    <section style={{ paddingTop: 80, paddingBottom: 20 }}>
                        <div
                            className="cta-banner"
                            style={{
                                ['--pointer-x' as any]: ctaPointer.x,
                                ['--pointer-y' as any]: ctaPointer.y,
                                ['--pointer-opacity' as any]: ctaPointer.active ? 1 : 0,
                            }}
                            onMouseMove={(event) => {
                                const rect = event.currentTarget.getBoundingClientRect();
                                setCtaPointer({
                                    x: `${event.clientX - rect.left}px`,
                                    y: `${event.clientY - rect.top}px`,
                                    active: true,
                                });
                            }}
                            onMouseLeave={() => setCtaPointer((current) => ({ ...current, active: false }))}
                        >
                            <div className="cta-pointer-effect"></div>
                            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', marginBottom: 16, position: 'relative', zIndex: 1 }}>
                                Building Success Starts Here
                            </h2>
                            <p style={{ maxWidth: 640, margin: '0 auto 36px', fontSize: '1.05rem', position: 'relative', zIndex: 1 }}>
                                Trusted support for investors, entrepreneurs, travelers, and organizations seeking seamless solutions across Albania.
                            </p>
                            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                                <button
                                    type="button"
                                    className="button-style primary-button"
                                    onClick={() => setShowQuickContact((current) => !current)}
                                >
                                    Get in Touch &rarr;
                                </button>
                                <a href="/consulting" className="button-style">Our Services</a>
                            </div>
                            {showQuickContact && (
                                <form className="quick-contact-form" onSubmit={(e) => e.preventDefault()}>
                                    <div className="quick-contact-grid">
                                        <div>
                                            <label htmlFor="quick-email">Email</label>
                                            <input id="quick-email" name="email" type="email" placeholder="you@example.com" />
                                        </div>
                                        <div>
                                            <label htmlFor="quick-whatsapp">WhatsApp Number</label>
                                            <input id="quick-whatsapp" name="whatsapp" type="text" placeholder="+355 ..." />
                                        </div>
                                        <div className="quick-contact-full">
                                            <label htmlFor="quick-description">Description</label>
                                            <textarea id="quick-description" name="description" placeholder="Tell us what you need help with." />
                                        </div>
                                        <div className="quick-contact-full" style={{ display: 'flex', justifyContent: 'center' }}>
                                            <button type="submit" className="button-style primary-button">Send Request</button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </section>

                    <section style={{ paddingTop: 24, paddingBottom: 30 }}>
                        <details className="section-card" style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'left', padding: '18px 22px' }}>
                            <summary style={{ cursor: 'pointer', listStyle: 'none', fontSize: '1rem', fontWeight: 700, color: 'var(--text-light)' }}>
                                More about KAYROSCO GROUP in Albania
                            </summary>
                            <div style={{ marginTop: 18 }}>
                                <p style={{ marginBottom: 14, color: 'var(--text-muted)' }}>
                                    Search-friendly company overview for technology, consulting, travel, legal, residency, tourism, and business support in Albania.
                                </p>
                                <p>
                                    KAYROSCO GROUP is a multi-service company in Albania focused on delivering practical support for businesses, entrepreneurs, investors, residents, tourists, and international clients who need reliable help on the ground. Our group brings together technology services, consulting services, travel services, digital support, and business assistance under one brand so clients can work with one coordinated team instead of searching for different providers. For companies entering Albania, for foreign clients exploring the Albanian market, and for individuals who need direct support with travel or legal-administrative processes, KAYROSCO GROUP offers a clear and professional starting point.
                                </p>
                                <p>
                                    Through Kayrosco Consulting, we support company formation in Albania, business consulting, legal guidance, residency and permit assistance, compliance help, documentation support, and guidance for Albanian public services. This is especially important for foreign entrepreneurs, remote business owners, investors, and families who need help understanding local procedures. Many people search online for Albania consulting, Albania legal services, business setup in Albania, company registration in Albania, residency permits in Albania, visa support in Albania, or help with Albanian documents. KAYROSCO GROUP is built to answer those needs with clear communication, organized service flows, and direct coordination.
                                </p>
                                <p>
                                    Through Kayrosco Travel, we provide travel services in Albania designed for comfort, flexibility, and local knowledge. This includes travel planning, tourism logistics, custom travel assistance, visitor support, transportation coordination, and trip organization for guests who want a smoother experience in Albania. People looking for Albania travel services, Albania tourism support, Albanian travel planning, local travel assistance, airport coordination, destination guidance, or business travel in Albania need a provider that understands both international expectations and local realities. KAYROSCO GROUP combines that local presence with a broader service ecosystem, making it easier for tourists, business travelers, and relocation clients to manage their time in the country.
                                </p>
                                <p>
                                    Through Kayrosco Tech, we develop digital solutions for modern businesses that need visibility, automation, security, and online growth. Our technology services include website development, software development, digital product design, business websites, modern UI and UX support, and customized technical solutions for companies in Albania and beyond. Search engines value websites that explain their services clearly, and clients do too. For that reason, KAYROSCO GROUP presents its technology capability as part of a larger business support structure: we do not only build digital tools, we also understand the operational, legal, and communication side of running a company in Albania.
                                </p>
                                <p>
                                    What makes KAYROSCO GROUP different is integration. A client may start with tourism support and later need residency guidance. A business may begin with consulting and then require a website, digital systems, or travel coordination for partners and staff. An investor may need business consulting, document support, and local technology execution at the same time. Instead of sending clients from one disconnected provider to another, KAYROSCO GROUP creates one connected service journey across consulting, travel, and technology. This is valuable not only for convenience, but also for speed, consistency, and trust.
                                </p>
                                <p>
                                    For search visibility, it is important that KAYROSCO GROUP is clearly associated with Albania business services, Albania consulting, Albania travel, Albania legal assistance, Albania residency support, web development in Albania, software solutions in Albania, tourism support in Albania, and integrated business services in Albania. The company serves local and international audiences looking for dependable execution, responsive communication, and a practical understanding of how to operate, travel, invest, or grow inside Albania. Whether someone is searching for a consulting company in Albania, a travel company in Albania, a tech company in Albania, or a single group that can coordinate all three, KAYROSCO GROUP is positioned to meet that need with structured, professional, and cross-functional support.
                                </p>
                            </div>
                        </details>
                    </section>

                </div>
            </div>
        </>
    );
};

// Main Application Component
const App: React.FC = () => {
    const [currentPath, setCurrentPath] = useState<Page>(
        (window.location.pathname as Page) || '/'
    );
    const [isMobileViewport, setIsMobileViewport] = useState(
        () => typeof window !== 'undefined' && window.innerWidth <= 1024
    );
    const currentPageName = mapPathToPageName(currentPath);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [footerClicks, setFooterClicks] = useState(0);
    const [headerVisible, setHeaderVisible] = useState(true);

    // Effect to handle the dynamic loading of the Spline viewer script (if on home page)
    useEffect(() => {
        const scriptId = 'spline-viewer-script';
        if (currentPageName === 'home' && !document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.type = 'module';
            script.src = 'https://unpkg.com/@splinetool/viewer/build/spline-viewer.js';
            document.head.appendChild(script);
        }
        
        // Listener for browser history changes (back/forward buttons)
        const handlePopState = () => {
            setCurrentPath(window.location.pathname as Page);
        };
        const handleResize = () => {
            setIsMobileViewport(window.innerWidth <= 1024);
        };
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        setHeaderVisible(true);

        let touchStartY = 0;
        let lastScrollTop = 0;
        const getScrollTop = () => window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const handleTouchStart = (event: TouchEvent) => {
            touchStartY = event.touches[0]?.clientY ?? 0;
        };
        const handleTouchMove = (event: TouchEvent) => {
            const currentY = event.touches[0]?.clientY ?? 0;
            const pullingDown = currentY > touchStartY;
            if (getScrollTop() <= 0 && pullingDown) {
                event.preventDefault();
                window.scrollTo(0, 0);
            }
        };
        const handleWheel = (event: WheelEvent) => {
            if (getScrollTop() <= 0 && event.deltaY < 0) {
                event.preventDefault();
                window.scrollTo(0, 0);
            }
        };
        const handleScrollClamp = () => {
            const scrollTop = getScrollTop();
            if (scrollTop < 0) {
                window.scrollTo(0, 0);
            }
            if (currentPageName === 'home') {
                if (isMobileViewport) {
                    setHeaderVisible(scrollTop <= 12);
                } else if (scrollTop <= 12) {
                    setHeaderVisible(true);
                } else if (scrollTop > lastScrollTop + 6) {
                    setHeaderVisible(false);
                } else if (scrollTop < lastScrollTop - 6) {
                    setHeaderVisible(true);
                }
                lastScrollTop = Math.max(scrollTop, 0);
            }
        };
        window.addEventListener('popstate', handlePopState);
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScrollClamp, { passive: true });
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('wheel', handleWheel, { passive: false });
        
        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScrollClamp);
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('wheel', handleWheel);
        };
    }, [currentPageName, isMobileViewport]); 

    /**
     * Determines if a navigation link should have the 'active' class.
     */
    const getLinkClass = (page: Page | 'solutions') => {
        const companyPaths: Page[] = ['/travel', '/consulting', '/tech'];
        if (page === 'solutions') {
            return companyPaths.includes(currentPath) ? 'active' : '';
        }
        return currentPath === page ? 'active' : '';
    };

    /**
     * Renders the corresponding page view based on the current URL path.
     */
    const renderPage = () => {
        switch (currentPageName) {
            case 'travel': return <TravelView />;
            case 'consulting': return <ConsultingView />;
            case 'tech': return <TechView />;
            case 'about': return <AboutView />;
            case 'contact': return <ContactView />;
            case 'home':
            default: return <HomeView />;
        }
    };

    const handleFooterKayroscoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.location.href = "/memo/login";
    };

    const seoMap = {
        home: {
            title: "Kayrosco Group | Technology, Consulting & Travel Services in Albania",
            description: "Professional technology, consulting and travel services in Albania. Company registration, residency permits, software development, travel planning and more.",
            canonicalPath: "/",
            schemas: [
                {
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    name: "KAYROSCO GROUP",
                    url: SITE_URL,
                    logo: `${SITE_URL}/lolo.png`,
                    image: `${SITE_URL}/banner.png`,
                    description: "KAYROSCO GROUP provides technology, consulting, and travel services in Albania.",
                },
                {
                    "@context": "https://schema.org",
                    "@type": "LocalBusiness",
                    name: "KAYROSCO GROUP",
                    url: SITE_URL,
                    image: `${SITE_URL}/banner.png`,
                    address: {
                        "@type": "PostalAddress",
                        streetAddress: "Rruga e Kavajes, Pallati 18/A, Kati 3",
                        addressLocality: "Tirana",
                        addressCountry: "Albania",
                    },
                },
            ],
        },
        about: {
            title: "About Kayrosco Group | Albania-Based Technology, Consulting & Travel Company",
            description: "Learn about Kayrosco Group and its integrated approach to consulting, travel and technology services in Albania.",
            canonicalPath: "/about",
            schemas: [],
        },
        contact: {
            title: "Contact Kayrosco | Technology, Travel & Consulting Services",
            description: "Contact Kayrosco Group for technology, consulting and travel services in Albania.",
            canonicalPath: "/contact",
            schemas: [
                {
                    "@context": "https://schema.org",
                    "@type": "LocalBusiness",
                    name: "KAYROSCO GROUP",
                    url: `${SITE_URL}/contact`,
                    image: `${SITE_URL}/banner.png`,
                    address: {
                        "@type": "PostalAddress",
                        streetAddress: "Rruga e Kavajes, Pallati 18/A, Kati 3",
                        addressLocality: "Tirana",
                        addressCountry: "Albania",
                    },
                },
            ],
        },
    } as const;
    const activeSeo = seoMap[currentPageName] ?? seoMap.home;
    
    return (
        <>
            <SeoHead
                title={activeSeo.title}
                description={activeSeo.description}
                canonicalPath={activeSeo.canonicalPath}
                keywords={["Kayrosco Group", "Albania business services", "technology services Albania", "consulting Albania", "travel Albania"]}
                schemas={activeSeo.schemas}
            />
            {/* Inject Global Styles */}
            <GlobalStyles />
            
            {/* Navbar Wrapper */}
            <div className={`navbar-wrapper ${currentPageName === 'home' ? `home-header ${headerVisible ? '' : 'is-hidden'}` : ''}`}>
                <nav className="navbar">
                    <a href="/" className="logo">KAYROSCO</a>
                    
                    <div className="nav-links-container">
                        
                        <a className={`nav-link ${getLinkClass('/')}`} href="/">Home</a>
                        
                        {/* Dropdown Menu */}
                        <div 
                            className="dropdown" 
                            onMouseEnter={() => setIsDropdownOpen(true)}
                            onMouseLeave={() => setIsDropdownOpen(false)}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                        >
                            <a 
                                className={`nav-link dropdown-toggle ${getLinkClass('solutions')}`}
                                href="#"
                                onClick={(e) => { e.preventDefault(); setIsDropdownOpen(!isDropdownOpen); }}
                            >
                                Our Companies
                            </a>
                            
                            <div className={`dropdown-menu ${isDropdownOpen ? 'visible' : 'hidden'}`}>
                                <a href="/travel">Travel Services</a>
                                <a href="/consulting">Consulting & Legal</a>
                                <a href="/tech">Tech Solutions</a>
                            </div>
                        </div>
                        
                        <a className={`nav-link ${getLinkClass('/about')}`} href="/about">About Us</a>
                        <a className={`nav-link button-style primary-button ${getLinkClass('/contact')}`} href="/contact">Contact</a>
                    </div>
                </nav>
            </div>

            {/* Render the currently active page view */}
            {renderPage()}
            {currentPageName === 'home' && isMobileViewport && (
                <>
                    <div style={{ height: 68 }}></div>
                    <nav
                        aria-label="Mobile Navigation"
                        style={{
                            position: 'fixed',
                            left: 14,
                            right: 14,
                            bottom: 8,
                            zIndex: 1200,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 6,
                            padding: 6,
                            background: 'rgba(13, 19, 31, 0.94)',
                            backdropFilter: 'blur(18px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: 16,
                            boxShadow: '0 10px 24px rgba(0, 0, 0, 0.24)',
                        }}
                    >
                        <a
                            className={getLinkClass('/')}
                            href="/"
                            style={{
                                minHeight: 42,
                                borderRadius: 10,
                                textDecoration: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                color: '#FFFFFF',
                                background: currentPath === '/' ? 'linear-gradient(180deg, rgba(102, 141, 188, 0.2) 0%, rgba(102, 141, 188, 0.1) 100%)' : 'transparent',
                                border: currentPath === '/' ? '1px solid rgba(102, 141, 188, 0.28)' : '1px solid transparent',
                            }}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 20, height: 20, stroke: '#FFFFFF', fill: 'none' }}>
                                <path d="M4 10.5 12 4l8 6.5" />
                                <path d="M6.5 9.75V20h11V9.75" />
                                <path d="M10 20v-5h4v5" />
                            </svg>
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.01em' }}>Home</span>
                        </a>
                        <a
                            href="#integrated-expertise"
                            style={{
                                minHeight: 42,
                                borderRadius: 10,
                                textDecoration: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                color: '#FFFFFF',
                                background: 'transparent',
                                border: '1px solid transparent',
                            }}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 20, height: 20, stroke: '#FFFFFF', fill: 'none' }}>
                                <rect x="4.5" y="5" width="6" height="6" rx="1.2" />
                                <rect x="13.5" y="5" width="6" height="6" rx="1.2" />
                                <rect x="4.5" y="14" width="6" height="6" rx="1.2" />
                                <rect x="13.5" y="14" width="6" height="6" rx="1.2" />
                            </svg>
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.01em' }}>Companies</span>
                        </a>
                        <a
                            className={getLinkClass('/about')}
                            href="/about"
                            style={{
                                minHeight: 42,
                                borderRadius: 10,
                                textDecoration: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                color: '#FFFFFF',
                                background: currentPath === '/about' ? 'linear-gradient(180deg, rgba(102, 141, 188, 0.2) 0%, rgba(102, 141, 188, 0.1) 100%)' : 'transparent',
                                border: currentPath === '/about' ? '1px solid rgba(102, 141, 188, 0.28)' : '1px solid transparent',
                            }}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 20, height: 20, stroke: '#FFFFFF', fill: 'none' }}>
                                <circle cx="12" cy="8" r="3" />
                                <path d="M6 19c1.5-3 4-4.5 6-4.5s4.5 1.5 6 4.5" />
                            </svg>
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.01em' }}>About</span>
                        </a>
                        <a
                            className={getLinkClass('/contact')}
                            href="/contact"
                            style={{
                                minHeight: 42,
                                borderRadius: 10,
                                textDecoration: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                color: '#FFFFFF',
                                background: currentPath === '/contact' ? 'linear-gradient(180deg, rgba(102, 141, 188, 0.2) 0%, rgba(102, 141, 188, 0.1) 100%)' : 'transparent',
                                border: currentPath === '/contact' ? '1px solid rgba(102, 141, 188, 0.28)' : '1px solid transparent',
                            }}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 20, height: 20, stroke: '#FFFFFF', fill: 'none' }}>
                                <path d="M6.6 4.8h2.6l1.2 3.1-1.6 1.6a14 14 0 0 0 5.3 5.3l1.6-1.6 3.1 1.2v2.6a1.6 1.6 0 0 1-1.7 1.6A15.5 15.5 0 0 1 5 6.5 1.6 1.6 0 0 1 6.6 4.8Z" />
                            </svg>
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.01em' }}>Contact</span>
                        </a>
                    </nav>
                </>
            )}
            
            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <a href="/" className="logo" onClick={handleFooterKayroscoClick}>KAYROSCO</a>
                    <div className="footer-links" style={{marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center'}}>
                        <a href="/travel" className="text-sm text-muted hover:text-accent-purple">Travel Services</a>
                        <span className="text-muted">|</span>
                        <a href="/consulting" className="text-sm text-muted hover:text-accent-purple">Consulting</a>
                        <span className="text-muted">|</span>
                        <a href="/tech" className="text-sm text-muted hover:text-accent-purple">Tech Solutions</a>
                        <span className="text-muted">|</span>
                        <a href="/partners" className="text-sm text-muted hover:text-accent-purple">Partners</a>
                    </div>
                </div>
                <p className="copyright" style={{marginTop: '20px'}}>© 2024 Kayrosco. All rights reserved. | Global Bridge to Albania.</p>
            </footer>
        </>
    );
};

export default App;
