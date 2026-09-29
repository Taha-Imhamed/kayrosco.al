import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import SeoHead from "@/components/SeoHead";
import { SITE_URL } from "@/data/seoPages";
import ShinyText from "@/components/ShinyText";
import { getHomepageLabels, HomepageLabel } from "@/lib/supabaseApi";
import { useSiteLanguage } from "@/contexts/SiteLanguageContext";

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

// Toggle to bring Travel/Consulting service mentions back on the public site.
// Everything referencing them is kept in place, just gated behind this flag.
const SHOW_TRAVEL_CONSULTING = false;

// --- Hero video background ---
const HERO_VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4';
// Same background video used on the /tech page hero, reused behind the tech-showcase banner.
const TECH_SHOWCASE_VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4';

// --- Global Styles Component ---
const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&family=Instrument+Serif:ital,wght@0,400;1,400&family=Press+Start+2P&display=swap');
    @import url('https://api.fontshare.com/v2/css?f[]=switzer@700&display=swap');

    /* --- Custom Properties (Black Mode) --- */
    :root {
        --background-dark: #0A0A0A;
        --background-med: #1A1A1A;
        --text-light: #EAEAEA;
        --text-muted: #B0BEC5;
        --accent-purple: #C0C0C0;
        --accent-blue: #03DAC6;
        --hero-deep: #050913;
        --hero-mid: #09142a;
        --hero-blue: #38bdf8;
        --hero-violet: #7c5cff;
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
        font-family: 'Manrope', sans-serif;
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
        font-family: 'Instrument Serif', serif; 
    }
    h1 { font-size: clamp(3rem, 7vw, 5rem); font-weight: 700; letter-spacing: -1px; color: var(--accent-purple); }
    h2 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; color: var(--text-light); }
    h3 { font-size: 1.6rem; color: var(--accent-purple); font-weight: 600; font-family: 'Manrope', sans-serif; }
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
        background-color: transparent;
        border-bottom: none;
        box-shadow: none;
        transition: transform 0.24s ease, opacity 0.24s ease;
    }

    .navbar-wrapper.home-header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
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
        padding: 8px 50px;
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
        color: rgba(232, 242, 255, 0.84);
        text-transform: none; 
        font-weight: 500;
        font-size: 1rem;
        text-decoration: none;
        cursor: pointer;
        box-shadow: none;
        transition: all 0.2s ease;
    }

    .nav-link:hover:not(.button-style) {
           color: #8fd2ff;
           border-bottom: 2px solid rgba(143, 210, 255, 0.95);
        padding-bottom: 6px;
    }
    
    .nav-link.active {
            border-bottom: 2px solid rgba(143, 210, 255, 0.95);
         padding-bottom: 6px;
    }
    
    /* ── Dropdown ── */
    .dropdown {
        position: relative;
        display: inline-block;
    }

    .dropdown::after {
        content: '';
        position: absolute;
        top: 100%;
        left: -24px;
        right: -24px;
        height: 18px;
        display: none;
    }

    .dropdown.dropdown-open::after {
        display: block;
    }

    .dropdown-toggle {
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    .chevron {
        display: inline-block;
        transition: transform 0.22s ease;
        font-size: 0.82em;
        opacity: 0.9;
    }

    .dropdown.dropdown-open .chevron {
        transform: rotate(180deg) translateY(-1px);
    }

    @keyframes dropdown-in {
        from { opacity: 0; transform: translateX(-50%) translateY(18px) scale(0.94); filter: blur(10px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0)     scale(1);    filter: blur(0); }
    }

    @keyframes dropdown-item-in {
        from { opacity: 0; transform: translateY(10px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .dropdown-menu {
        position: absolute;
        top: calc(100% + 12px);
        left: 50%;
        transform: translateX(-50%);
        width: 520px;
        z-index: 1001;
        background: linear-gradient(180deg, rgba(6, 13, 29, 0.96) 0%, rgba(9, 16, 35, 0.96) 100%);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-radius: 20px;
        box-shadow: 0 26px 70px rgba(2, 8, 20, 0.62), 0 0 0 1px rgba(109, 165, 255, 0.14) inset;
        border: 1px solid rgba(109, 165, 255, 0.16);
        padding: 12px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s;
        transform-origin: top center;
    }

    /* Arrow notch */
    .dropdown-menu::before {
        content: '';
        position: absolute;
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 12px;
        height: 12px;
        background: linear-gradient(135deg, rgba(6, 13, 29, 0.96) 0%, rgba(9, 16, 35, 0.96) 100%);
        border-left: 1px solid rgba(109,165,255,0.14);
        border-top: 1px solid rgba(109,165,255,0.14);
        rotate: 45deg;
    }

    .dropdown-menu.hidden {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateX(-50%) translateY(14px) scale(0.97);
    }
    .dropdown-menu.visible {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateX(-50%) translateY(0) scale(1);
        animation: dropdown-in 0.22s ease forwards;
    }

    .dropdown-menu a {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        padding: 14px 14px;
        border-radius: 12px;
        text-decoration: none;
        background: transparent;
        border: 1px solid transparent;
        transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
        text-transform: none;
        position: relative;
        overflow: hidden;
        animation: dropdown-item-in 0.32s ease both;
    }
    .dropdown-menu a:hover {
        background: linear-gradient(135deg, rgba(41, 87, 160, 0.20) 0%, rgba(15, 28, 54, 0.35) 100%);
        border-color: rgba(124, 175, 255, 0.22);
        transform: translateY(-3px);
    }
    .dropdown-menu a:nth-child(1) { animation-delay: 0.02s; }
    .dropdown-menu a:nth-child(2) { animation-delay: 0.06s; }
    .dropdown-menu a:nth-child(3) { animation-delay: 0.10s; }
    .dropdown-menu a .dm-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 2px;
        flex-shrink: 0;
    }
    .dropdown-menu a .dm-title {
        font-size: 13px;
        font-weight: 600;
        color: #FFFFFF;
        line-height: 1.2;
        letter-spacing: -0.01em;
    }
    .dropdown-menu a .dm-desc {
        font-size: 11px;
        color: rgba(255,255,255,0.45);
        line-height: 1.4;
    }
    .dropdown-menu a .dm-arrow {
        position: absolute;
        bottom: 12px;
        right: 12px;
        opacity: 0;
        transform: translateX(-4px);
        transition: opacity 0.18s, transform 0.18s;
        color: rgba(255,255,255,0.5);
        font-size: 14px;
    }
    .dropdown-menu a:hover .dm-arrow {
        opacity: 1;
        transform: translateX(0);
        color: #8fd2ff;
    }

    /* ── Dropdown toggle chevron animation ── */
    .dropdown-toggle .chevron {
        display: inline-block;
        margin-left: 4px;
        transition: transform 0.2s ease;
        font-size: 10px;
        opacity: 0.6;
    }
    .dropdown-open .chevron {
        transform: rotate(180deg);
    }

    /* ── Global page fade-in ── */
    @keyframes page-fade-in {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0);    }
    }
    .page-view {
        animation: page-fade-in 0.35s ease forwards;
    }

    /* ── Mobile nav tap animation ── */
    @keyframes tab-pop {
        0%   { transform: scale(1);    }
        40%  { transform: scale(0.88); }
        70%  { transform: scale(1.05); }
        100% { transform: scale(1);    }
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

    /* The Sonner toast viewport renders as an empty <section>, which the
       rule above turns into a 120px in-flow block, pushing the hero down. */
    section[aria-label="Notifications alt+T"] {
        position: fixed;
        padding: 0;
        margin: 0;
        height: 0;
    }

    /* --- Hero Section - Full-screen Video - Fully Maximized --- */
    .hero-section {
        position: relative;
        height: 100vh;
        width: 100vw;
        /* Pulls the section to the very edge of the viewport */
        margin-left: calc(50% - 50vw);
        display: block;
        background-color: #000;
        /* Above .dropdown-backdrop (1299) / mobile .dropdown-menu (1300) so the
           navbar nested inside the hero still stacks correctly on mobile */
        z-index: 1400;
        overflow: hidden;
        background:
            radial-gradient(circle at 78% 42%, rgba(66, 124, 255, 0.18), transparent 26%),
            radial-gradient(circle at 88% 60%, rgba(124, 92, 255, 0.22), transparent 20%),
            linear-gradient(135deg, var(--hero-deep) 0%, #02040b 44%, var(--hero-mid) 100%);
    }

    .hero-video {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 0;
    }

    .hero-video-overlay {
        position: absolute;
        inset: 0;
        background:
            linear-gradient(90deg, rgba(2, 4, 11, 0.86) 0%, rgba(2, 4, 11, 0.62) 42%, rgba(5, 10, 24, 0.34) 100%),
            radial-gradient(circle at 76% 45%, rgba(56, 189, 248, 0.12), transparent 26%);
        z-index: 1;
        pointer-events: none;
    }

    .hero-shell {
        align-items: flex-start;
        justify-content: flex-start;
        padding-top: clamp(4.75rem, 10vh, 6.5rem);
        padding-bottom: clamp(1.5rem, 4vh, 3rem);
    }

    .hero-copy {
        max-width: 38rem;
        text-align: left;
        align-items: flex-start;
        margin-right: auto;
    }

    .hero-heading {
        font-family: 'Switzer', 'Manrope', sans-serif;
        font-weight: 700;
        letter-spacing: -0.045em;
        line-height: 0.9;
        font-size: clamp(2.75rem, 6vw, 6rem);
    }

    .hero-heading-line {
        display: block;
    }

    .hero-gradient-line {
        display: block;
        margin-top: 0.08em;
    }

    .hero-lede {
        max-width: 28rem;
        margin-top: 1.15rem;
        font-size: clamp(1.05rem, 1.6vw, 1.4375rem);
        font-weight: 400;
        line-height: 1.5;
        color: rgba(244, 247, 255, 0.88);
        text-shadow: 0 2px 14px rgba(0, 0, 0, 0.35);
    }

    .hero-cta {
        margin-top: 0.65rem;
        font-size: 1.1875rem;
        font-weight: 500;
        border: 1px solid rgba(122, 205, 255, 0.85);
        background: linear-gradient(135deg, rgba(20, 54, 110, 0.98) 0%, rgba(11, 23, 50, 0.98) 52%, rgba(30, 33, 80, 0.98) 100%);
        box-shadow: 0 18px 40px rgba(5, 16, 40, 0.45), inset 0 0 0 1px rgba(170, 206, 255, 0.16);
    }

    .hero-cta:hover {
        background: linear-gradient(135deg, rgba(30, 74, 145, 1) 0%, rgba(14, 31, 67, 1) 52%, rgba(42, 47, 108, 1) 100%);
        border-color: rgba(165, 225, 255, 1);
        box-shadow: 0 22px 50px rgba(20, 58, 120, 0.38), inset 0 0 0 1px rgba(190, 226, 255, 0.2);
    }

    .section-cta {
        background: linear-gradient(135deg, rgba(22, 61, 122, 0.98) 0%, rgba(12, 24, 54, 0.98) 55%, rgba(34, 38, 96, 0.98) 100%);
        border: 1px solid rgba(122, 205, 255, 0.75);
        color: #f4f9ff;
    }

    .section-cta:hover {
        background: linear-gradient(135deg, rgba(32, 84, 161, 1) 0%, rgba(16, 32, 71, 1) 55%, rgba(46, 52, 124, 1) 100%);
        border-color: rgba(165, 225, 255, 0.95);
        color: #ffffff;
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

    .map-embed {
        width: 100%;
        height: 360px;
        margin-top: 20px;
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid var(--border-light);
        position: relative;
        z-index: 1;
    }

    .contact-info-card {
        display: flex;
        flex-direction: column;
    }
    .contact-info-row {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 14px 0;
        text-decoration: none;
        color: inherit;
        border-bottom: 1px solid var(--border-light);
        transition: opacity 0.15s ease-in-out;
    }
    .contact-info-row:last-child {
        border-bottom: none;
    }
    .contact-info-row:hover {
        opacity: 0.75;
    }
    .contact-info-icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        color: var(--text-light);
    }
    .contact-info-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .contact-info-label {
        font-size: 0.7rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--text-muted);
    }
    .contact-info-value {
        font-size: 1.05rem;
        color: var(--text-light);
        font-family: 'Manrope', sans-serif;
    }
    .contact-info-divider {
        height: 1px;
        margin: 8px 0;
        background: var(--border-light);
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

    .founders-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 48px;
    }

    .about-card {
        background-color: #262626;
        border-color: rgba(255, 255, 255, 0.16);
    }

    .about-divider {
        max-width: 800px;
        height: 1px;
        margin: 60px auto;
        background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.18) 50%, transparent 100%);
        border: none;
    }

    .about-facts-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin: 0 auto 10px;
    }

    .about-fact-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 999px;
        border: 1px solid var(--border-light);
        background-color: #262626;
        color: var(--text-muted);
        font-size: 0.82rem;
        font-weight: 600;
        white-space: nowrap;
    }

    .founder-card {
        flex: 0 1 300px;
        max-width: 340px;
        background-color: #262626;
        border-color: rgba(255, 255, 255, 0.16);
    }

    /* Footer */
    .footer {
        padding: 50px 50px;
        background-color: #232323;
        border-top: 1px solid var(--border-light);
        text-align: center;
        font-size: 0.9rem;
        color: var(--text-muted);
        padding-bottom: 80px;
    }

    .footer-social-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 14px;
        margin-top: 24px;
    }
    .footer-social-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 1px solid var(--border-light);
        color: var(--text-muted);
        transition: color 0.15s ease-in-out, border-color 0.15s ease-in-out, transform 0.15s ease-in-out;
    }
    .footer-social-icon svg {
        width: 17px;
        height: 17px;
    }
    .footer-lang-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 20px;
    }
    .footer-lang-btn {
        padding: 6px 14px;
        border-radius: 999px;
        border: 1px solid var(--border-light);
        background: transparent;
        color: var(--text-muted);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        cursor: pointer;
        transition: color 0.15s ease-in-out, border-color 0.15s ease-in-out, background-color 0.15s ease-in-out;
    }
    .footer-lang-btn:hover {
        color: var(--text-light);
        border-color: var(--accent-purple);
    }
    .footer-lang-btn.is-active {
        color: var(--text-light);
        background: var(--accent-purple);
        border-color: var(--accent-purple);
    }

    .footer-social-icon:hover {
        color: var(--text-light);
        border-color: var(--accent-purple);
        transform: translateY(-2px);
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

    /* Plain single-column banner. Background is a flat neutral placeholder -
       swap background-color below for a background-image (cover/center)
       once you have the image you want here. */
    .tech-showcase { position: relative; overflow: hidden; padding: clamp(32px, 6vw, 72px); border-radius: 24px; border: 1px solid rgba(255,255,255,0.08); background-color: #0b0d10; isolation: isolate; }
    .tech-showcase-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
    .tech-showcase-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(4,6,10,0.86) 0%, rgba(4,6,10,0.72) 45%, rgba(4,6,10,0.92) 100%); z-index: 1; pointer-events: none; }
    .tech-showcase-content { position: relative; z-index: 2; }
    .tech-showcase-intro { text-align: center; }
    .tech-showcase-kicker { display: inline-flex; align-items: center; gap: 9px; color: rgba(255,255,255,0.55); font-family: 'JetBrains Mono', 'Geist Mono', monospace; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; }
    .tech-showcase-kicker::before { content: ""; width: 28px; height: 1px; background: rgba(255,255,255,0.35); }
    .tech-showcase-title { max-width: 600px; margin: 14px auto; color: #fff; font-family: 'JetBrains Mono', 'Geist Mono', monospace; font-weight: 700; font-size: clamp(1.6rem, 3.2vw, 2.5rem); line-height: 1.12; letter-spacing: -0.01em; }
    .tech-showcase-copy { max-width: 480px; margin: 0 auto; color: rgba(232,242,255,0.68); font-size: clamp(0.86rem, 1.3vw, 0.96rem); line-height: 1.65; }
    .tech-showcase-cta {
        display: inline-flex; align-items: center; gap: 7px; margin-top: 24px;
        padding: 9px 20px; font-size: 0.8rem;
        position: relative; overflow: hidden;
    }
    .tech-showcase-cta::after {
        content: "";
        position: absolute;
        top: 0; left: -60%;
        width: 40%; height: 100%;
        background: linear-gradient(120deg, transparent, rgba(255,255,255,0.65), transparent);
        transform: skewX(-20deg);
        transition: left 0.55s ease;
        pointer-events: none;
    }
    .tech-showcase-cta:hover {
        background-color: rgba(255,255,255,0.08);
        color: #fff;
        border-color: rgba(255,255,255,0.4);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 8px 20px rgba(0,0,0,0.35);
        transform: translateY(-1px);
    }
    .tech-showcase-cta:hover::after { left: 130%; }
    .tech-metrics { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); margin-top: 34px; border-top: 1px solid rgba(255,255,255,0.12); border-bottom: 1px solid rgba(255,255,255,0.12); }
    .tech-metric { padding: 17px 18px 14px; border-right: 1px solid rgba(255,255,255,0.12); transition: background 0.25s ease, transform 0.25s ease; }
    .tech-metric:last-child { border-right: 0; }
    .tech-metric:hover { background: rgba(255,255,255,0.04); transform: translateY(-3px); }
    .tech-metric-number { color: #fff; font-family: 'JetBrains Mono', 'Geist Mono', monospace; font-weight: 700; font-size: 2.15rem; line-height: 1; }
    .tech-metric-label { margin-top: 7px; color: rgba(232,242,255,0.52); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    @media (max-width: 760px) { .tech-metrics { grid-template-columns: repeat(2, 1fr); } .tech-metric:nth-child(2) { border-right: 0; } .tech-metric:nth-child(-n+2) { border-bottom: 1px solid rgba(255,255,255,0.12); } }
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
        background: #000000;
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
        background: linear-gradient(90deg, #111111 0%, #C0C0C0 52%, #ffffff 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
    }
    .expertise-card .card-content .consulting-card-title {
        text-align: center;
        font-family: 'Instrument Serif', serif;
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
        font-family: 'Manrope', sans-serif;
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
        background: linear-gradient(180deg, rgba(13, 20, 36, 0.96) 0%, rgba(10, 16, 31, 0.96) 100%);
        transition: transform 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
    }
    .stat-item:last-child { border-right: none; }
    .stat-item:hover {
        transform: translateY(-2px);
        background: linear-gradient(180deg, rgba(19, 31, 54, 0.98) 0%, rgba(11, 18, 36, 0.98) 100%);
        box-shadow: inset 0 0 0 1px rgba(118, 175, 255, 0.12);
    }
    .stat-number {
        font-size: 2.8rem;
        font-weight: 800;
        color: #7ccfff;
        font-family: 'Manrope', sans-serif;
        letter-spacing: -1px;
        line-height: 1;
    }
    .stat-label {
        font-size: 0.78rem;
        color: rgba(214, 231, 255, 0.72);
        text-transform: uppercase;
        letter-spacing: 1.2px;
        margin-top: 8px;
    }

    .stat-item:nth-child(2) .stat-number { color: #a78bfa; }
    .stat-item:nth-child(3) .stat-number { color: #60a5fa; }
    .stat-item:nth-child(4) .stat-number { color: #93c5fd; }

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
        font-family: 'Manrope', sans-serif;
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
        padding: 44px 36px;
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

    .homepage-labels-section {
        width: 100%;
        padding: 74px 0 18px;
        overflow: hidden;
    }
    .homepage-labels-window {
        width: 100vw;
        margin-left: calc(50% - 50vw);
        overflow: hidden;
        padding: 12px 0 18px;
    }
    .homepage-labels-track {
        --hl-item-w: clamp(210px, 28vw, 340px);
        --hl-gap: clamp(12px, 2vw, 28px);
        display: flex;
        align-items: center;
        gap: var(--hl-gap);
        width: max-content;
        will-change: transform;
        transition: transform 0.7s cubic-bezier(0.65, 0, 0.35, 1);
    }
    .homepage-label-link {
        display: block;
        flex: 0 0 var(--hl-item-w);
        color: inherit;
        text-decoration: none;
    }
    .homepage-label-card {
        position: relative;
        height: clamp(170px, 24vw, 260px);
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 16px;
        background: #151515;
        opacity: 0.52;
        transform: scale(0.88);
        transition: opacity 0.45s ease, transform 0.45s ease, border-color 0.3s ease;
        box-shadow: 0 14px 34px rgba(0,0,0,0.18);
    }
    .homepage-label-card.is-center {
        opacity: 1;
        transform: scale(1);
        border-color: rgba(143,210,255,0.48);
        box-shadow: 0 18px 44px rgba(0,0,0,0.28);
    }
    .homepage-label-card img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
        transition: transform 0.45s ease, filter 0.45s ease;
    }
    .homepage-label-card:hover img {
        transform: scale(1.06);
        filter: brightness(0.58);
    }
    .homepage-label-name {
        position: absolute;
        right: 14px;
        bottom: 14px;
        left: 14px;
        padding: 9px 11px;
        border-radius: 9px;
        background: rgba(5,9,19,0.78);
        color: #fff;
        font-size: 0.85rem;
        font-weight: 700;
        text-align: center;
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.25s ease, transform 0.25s ease;
    }
    .homepage-label-card:hover .homepage-label-name,
    .homepage-label-card.is-center .homepage-label-name {
        opacity: 1;
        transform: translateY(0);
    }
    .homepage-label-dots {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 8px;
    }
    .homepage-label-dots button {
        width: 8px;
        height: 8px;
        padding: 0;
        border: 0;
        border-radius: 50%;
        background: rgba(255,255,255,0.28);
        cursor: pointer;
        transition: width 0.2s ease, border-radius 0.2s ease, background 0.2s ease;
    }
    .homepage-label-dots button.is-active {
        width: 24px;
        border-radius: 8px;
        background: #8fd2ff;
    }
    @media (max-width: 720px) {
        .homepage-labels-track { --hl-item-w: 72vw; --hl-gap: 8px; }
    }

    .platforms-section-title {
        font-size: clamp(1.3rem, 2.1vw, 1.8rem);
        margin-bottom: 26px;
        color: #ffffff;
        font-family: 'Instrument Serif', serif;
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
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
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
            padding: 6px 20px 8px;
            gap: 4px;
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
            height: 100dvh;
            width: 100%;
            margin-left: 0;
        }

        .hero-shell {
            padding-top: 5.5rem;
        }

        .hero-copy {
            max-width: 30rem;
        }

        .hero-heading {
            font-size: clamp(2.4rem, 10.5vw, 3.95rem);
        }

        .hero-lede {
            max-width: 26rem;
            font-size: 0.98rem;
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

        /* ── Mobile dropdown: bottom sheet above the nav bar ── */
        .dropdown-menu {
            position: fixed !important;
            top: auto !important;
            bottom: 86px !important;
            left: 14px !important;
            right: 14px !important;
            width: auto !important;
            transform: none !important;
            grid-template-columns: repeat(3, 1fr) !important;
            z-index: 1300 !important;
            border-radius: 16px !important;
        }
        .dropdown-menu::before { display: none !important; }
        .dropdown-menu.hidden {
            transform: translateY(10px) !important;
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }
        .dropdown-menu.visible {
            transform: none !important;
        }
        .dropdown.dropdown-open::after {
            display: none;
        }
        /* Overlay backdrop when dropdown is open on mobile */
        .dropdown-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 1299;
            background: rgba(0,0,0,0.40);
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

const FOUNDERS: { name: string; role: string; initials: string; linkedin: string }[] = [
    { name: 'Mehmet Alkaya', role: 'Founder & CEO', initials: 'MA', linkedin: 'https://www.linkedin.com/in/mehmet-alkaya-0b351a30b/' },
    { name: 'Anas Abusefrita', role: 'Co-Founder', initials: 'AA', linkedin: 'https://www.linkedin.com/in/anas-abusefrita-1775392b8/' },
    { name: 'Mohamed Imhamed', role: 'Co-Founder', initials: 'MI', linkedin: 'https://www.linkedin.com/in/mohammed-hosin-1707402aa/' },
    { name: 'Taha Imhamed', role: 'Co-Founder', initials: 'TI', linkedin: 'https://www.linkedin.com/in/taha-imhamed/' },
];

const FounderCard: React.FC<{ founder: (typeof FOUNDERS)[number] }> = ({ founder }) => (
    <a
        href={founder.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="section-card founder-card"
        style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
        <div
            style={{
                width: 64, height: 64, margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                background: 'var(--accent-purple)',
                color: 'var(--background-dark)',
                fontWeight: 700, fontSize: '1.1rem',
            }}
        >
            {founder.initials}
        </div>
        <h3 style={{ margin: 0 }}>{founder.name}</h3>
        <p className="text-muted" style={{ marginTop: '4px' }}>{founder.role}</p>
        <span
            style={{
                marginTop: '14px',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                color: 'var(--accent-purple)', fontSize: '0.85rem', fontWeight: 600,
            }}
        >
            <ContactIcon kind="linkedin" />
            View LinkedIn
        </span>
    </a>
);

const AboutView: React.FC = () => (
    <div className="page-view">
        <div className="view-content-padding">
            <section>
                <h2>About Kayrosco Group</h2>
                <p className="text-muted" style={{ maxWidth: '800px', margin: '0 auto 40px' }}>
                    Kayrosco Group was founded on the principle of providing clear, focused, and impactful technology solutions for international clients engaging with Albania. From custom software to modern web platforms and CCTV systems, you have a single, trusted partner.
                </p>

                <hr className="about-divider" />

                <div className="solutions-grid">
                     <div className="section-card about-card">
                        <h3>Our Mission</h3>
                        <p>To be the definitive bridge between the global market and the opportunities present in the fast-developing Albanian economy.</p>
                    </div>
                    <div className="section-card about-card">
                        <h3>Our Vision</h3>
                        <p>To establish a new standard for excellence and reliability in technology services in the Western Balkans.</p>
                    </div>
                </div>

                <div className="section-card about-card" style={{ maxWidth: '800px', margin: '30px auto', textAlign: 'center' }}>
                    <h3>Our Goal</h3>
                    <p>Kayrosco Group has one goal: to change the way businesses are built and started. We manage more than one product and department under a single group, giving founders and companies a single trusted partner instead of a patchwork of vendors.</p>
                </div>

                <hr className="about-divider" />

                <h3 style={{ textAlign: 'center' }}>Our Founders</h3>
                <p className="text-muted" style={{ maxWidth: '700px', margin: '10px auto 0', textAlign: 'center' }}>
                    The team behind Kayrosco Group, across technology, consulting, and travel.
                </p>
                <div className="founders-row" style={{ marginTop: '20px' }}>
                    {FOUNDERS.slice(0, 3).map((founder) => (
                        <FounderCard key={founder.name} founder={founder} />
                    ))}
                </div>
                <div className="founders-row" style={{ marginTop: '48px' }}>
                    {FOUNDERS.slice(3).map((founder) => (
                        <FounderCard key={founder.name} founder={founder} />
                    ))}
                </div>

                <hr className="about-divider" />

                <div className="section-card about-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h3>Our Portfolio</h3>
                    <p>Kayrosco Group manages more than one product and department. Explore our full company portfolio and the projects we've delivered at{' '}
                        <a href="https://work.kayrosco.al" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>work.kayrosco.al</a>.
                    </p>
                    <a
                        href="https://work.kayrosco.al"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button-style"
                        style={{ display: 'inline-block', marginTop: '14px' }}
                    >
                        View Company Portfolio &rarr;
                    </a>
                </div>

                <hr className="about-divider" />

                <h3 style={{ textAlign: 'center' }}>Connect With Us</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
                    {[...CONTACT_DETAILS, ...CONTACT_SOCIALS].map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            target={item.href.startsWith('http') ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                borderRadius: '999px', border: '1px solid var(--border-light)',
                                padding: '10px 18px', fontSize: '0.85rem', fontWeight: 600,
                                color: 'var(--text-light)', textDecoration: 'none',
                                transition: 'border-color 0.15s ease-in-out, transform 0.15s ease-in-out',
                            }}
                        >
                            <ContactIcon kind={item.icon} />
                            {item.label}
                        </a>
                    ))}
                </div>

                <div className="section-card about-card" style={{ maxWidth: '800px', margin: '30px auto', textAlign: 'center' }}>
                    <h3>Our Hub</h3>
                    <p><strong>Main Address:</strong> Rruga 'e Kavajes', Pallati 18/A, Kati 3, Tirana, Albania 1001</p>
                    <p style={{ marginTop: '10px' }}><strong>Hours:</strong> Mon - Fri: 09:00 - 17:00</p>
                    <div className="map-embed">
                        <iframe
                            title="Kayrosco Group location"
                            src="https://www.google.com/maps?q=41.327616,19.808514&z=16&output=embed"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                    <a
                        href="https://www.google.com/maps/search/?api=1&query=41.327616,19.808514"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button-style"
                        style={{ display: 'inline-block', marginTop: '14px' }}
                    >
                        Open in Google Maps &rarr;
                    </a>
                </div>
            </section>
        </div>
    </div>
);

// --- Contact icons (inline brand SVGs, no extra dependency) ---
type ContactIconKind = 'globe' | 'mail' | 'x' | 'tiktok' | 'instagram' | 'linkedin' | 'facebook';

const ContactIcon: React.FC<{ kind: ContactIconKind }> = ({ kind }) => {
    switch (kind) {
        case 'globe':
            return (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
            );
        case 'mail':
            return (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" />
                </svg>
            );
        case 'x':
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            );
        case 'tiktok':
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
            );
        case 'instagram':
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.846-10.405a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
                </svg>
            );
        case 'linkedin':
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            );
        case 'facebook':
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 1.972-.287 1.695h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
                </svg>
            );
        default:
            return null;
    }
};

type ContactLink = { label: string; value: string; href: string; icon: ContactIconKind };

const CONTACT_DETAILS: ContactLink[] = [
    { label: 'Website', value: 'kayrosco.al', href: 'https://kayrosco.al', icon: 'globe' },
    { label: 'Email', value: 'info@kayrosco.al', href: 'mailto:info@kayrosco.al', icon: 'mail' },
];

const CONTACT_SOCIALS: ContactLink[] = [
    { label: 'X (Twitter)', value: '@kayroscogroup', href: 'https://x.com/kayroscogroup', icon: 'x' },
    { label: 'TikTok', value: '@kayroscogroup', href: 'https://www.tiktok.com/@kayroscogroup', icon: 'tiktok' },
    { label: 'Instagram', value: '@kayroscogroup', href: 'https://www.instagram.com/kayroscogroup', icon: 'instagram' },
    { label: 'LinkedIn', value: '@kayroscogroup', href: 'https://www.linkedin.com/company/kayroscogroup', icon: 'linkedin' },
    { label: 'Facebook', value: '@kayroscogroup', href: 'https://www.facebook.com/kayroscogroup', icon: 'facebook' },
];

const ContactInfoRow: React.FC<{ item: ContactLink }> = ({ item }) => (
    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="contact-info-row">
        <span className="contact-info-icon"><ContactIcon kind={item.icon} /></span>
        <span className="contact-info-text">
            <span className="contact-info-label">{item.label}</span>
            <span className="contact-info-value">{item.value}</span>
        </span>
    </a>
);

const ContactView: React.FC = () => (
    <div className="page-view">
        <div className="view-content-padding">
            <section>
                <h2>Let's Connect</h2>
                <p className="text-muted" style={{ maxWidth: '800px', margin: '0 auto 40px' }}>
                    Reach out today for tailored advice on your technology needs in Albania.
                </p>
                
                <form
                    className="section-card"
                    style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget);
                        const fullName = String(data.get('fullName') || '').trim();
                        const email = String(data.get('emailAddress') || '').trim();
                        const service = String(data.get('serviceInterest') || '').trim();
                        const message = String(data.get('message') || '').trim();
                        const subject = `New inquiry from ${fullName || 'website visitor'}`;
                        const body = `Name: ${fullName}\nEmail: ${email}\nService Interest: ${service || 'Not specified'}\n\nMessage:\n${message}`;
                        window.location.href = `mailto:info@kayrosco.al?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    }}
                >
                    <label htmlFor="fullName">Full Name</label>
                    <input type="text" id="fullName" name="fullName" placeholder="John Doe" required />

                    <label htmlFor="emailAddress">Email Address</label>
                    <input type="email" id="emailAddress" name="emailAddress" placeholder="you@example.com" required />

                    <label htmlFor="serviceInterest">Service Interest</label>
                    <select id="serviceInterest" name="serviceInterest">
                        <option value="">-- Select a Service --</option>
                        <option value="General">General Inquiry</option>
                        {SHOW_TRAVEL_CONSULTING && <option value="Travel">Kayrosco Travel</option>}
                        {SHOW_TRAVEL_CONSULTING && <option value="Consulting">Kayrosco Consulting (Legal/Residency)</option>}
                        <option value="Tech">Kayrosco Tech (Website/CCTV)</option>
                    </select>

                    <label htmlFor="message">Your Message</label>
                    <textarea id="message" name="message" placeholder="Tell us about your project or inquiry..." required></textarea>

                    <button
                        type="submit"
                        className="button-style primary-button"
                        style={{ width: '100%', marginTop: '30px' }}
                    >
                        Send Message
                    </button>
                </form>
                
                <div style={{ padding: '40px 0' }}>
                    <div className="section-card contact-info-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
                        {CONTACT_DETAILS.map((item) => (
                            <ContactInfoRow key={item.label} item={item} />
                        ))}
                        <div className="contact-info-divider" />
                        {CONTACT_SOCIALS.map((item) => (
                            <ContactInfoRow key={item.label} item={item} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    </div>
);

// --- Home View (Container for Hero and Main Sections) ---
const HomeView: React.FC<{ navbar?: React.ReactNode }> = ({ navbar }) => {
    const { t } = useSiteLanguage();
    const [showQuickContact, setShowQuickContact] = useState(false);
    const [ctaPointer, setCtaPointer] = useState({ x: '50%', y: '50%', active: false });
    const [homepageLabels, setHomepageLabels] = useState<HomepageLabel[]>([]);
    const [labelIndex, setLabelIndex] = useState(0);
    const [labelJumpInstant, setLabelJumpInstant] = useState(false);
    const repeatedLabels = homepageLabels.length ? [...homepageLabels, ...homepageLabels, ...homepageLabels] : [];

    useEffect(() => {
        getHomepageLabels().then(setHomepageLabels).catch(() => setHomepageLabels([]));
    }, []);

    // Start on the middle copy of the (tripled) strip so it has room to keep
    // advancing seamlessly instead of ever needing to jump backward to "restart".
    // The jump itself is done with the transition off so it isn't visible on load.
    useEffect(() => {
        if (homepageLabels.length === 0) return;
        setLabelJumpInstant(true);
        setLabelIndex(homepageLabels.length);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setLabelJumpInstant(false));
        });
    }, [homepageLabels.length]);

    useEffect(() => {
        if (homepageLabels.length < 2) return;
        const timer = window.setInterval(() => {
            setLabelIndex((current) => current + 1);
        }, 6500);
        return () => window.clearInterval(timer);
    }, [homepageLabels.length]);

    // Once the strip scrolls past the middle copy into the trailing copy, silently
    // rewind exactly one cycle (transition disabled for that single frame) back into
    // the middle copy. Because both copies are identical, the rewind is invisible and
    // the strip can keep going forever without ever visibly resetting to the start.
    useEffect(() => {
        const total = homepageLabels.length;
        if (total < 2 || labelIndex < total * 2) return;
        const rewind = window.setTimeout(() => {
            setLabelJumpInstant(true);
            setLabelIndex((current) => current - total);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setLabelJumpInstant(false));
            });
        }, 720);
        return () => window.clearTimeout(rewind);
    }, [labelIndex, homepageLabels.length]);

    const platformRows = [
        [
            { name: 'Kayrosco Group', href: '/', logo: '/lolo.png' },
            { name: 'Stripe', href: 'https://stripe.com/', logo: 'https://www.google.com/s2/favicons?sz=256&domain_url=stripe.com' },
            { name: 'PayPal', href: 'https://www.paypal.com/', logo: 'https://www.google.com/s2/favicons?sz=256&domain_url=paypal.com' },
            { name: 'Kayrosco Tech', href: '/tech', logo: '/logo 7.png' },
            { name: 'Hostinger', href: 'https://www.hostinger.com/', logo: 'https://www.google.com/s2/favicons?sz=256&domain_url=hostinger.com' },
            { name: 'Google Workspace', href: 'https://workspace.google.com/', logo: 'https://www.google.com/s2/favicons?sz=256&domain_url=workspace.google.com' },
            { name: 'Microsoft 365', href: 'https://www.office.com/', logo: 'https://www.google.com/s2/favicons?sz=256&domain_url=office.com' },
        ],
        [
            { name: 'AWS', href: 'https://aws.amazon.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg' },
            { name: 'PostgreSQL', href: 'https://www.postgresql.org/', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg' },
            { name: 'Supabase', href: 'https://supabase.com/', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/supabase-icon.png' },
            { name: 'Cloudflare', href: 'https://www.cloudflare.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Cloudflare_Logo.png' },
            { name: 'Vercel', href: 'https://vercel.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Vercel_logo_black.svg' },
            { name: 'Google Cloud Platform', href: 'https://cloud.google.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg' },
            { name: 'Microsoft Azure', href: 'https://azure.microsoft.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg' },
        ],
        [
            { name: 'Firebase', href: 'https://firebase.google.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/37/Firebase_Logo.svg' },
            { name: 'Netlify', href: 'https://www.netlify.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Netlify_logo.svg' },
            { name: 'Render', href: 'https://render.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Render_Logo.svg' },
            { name: 'MongoDB', href: 'https://www.mongodb.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg' },
            { name: 'Redis', href: 'https://redis.io/', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Redis_Logo.svg' },
            { name: 'Docker', href: 'https://www.docker.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Docker_%28container_engine%29_logo.svg' },
        ],
        [
            { name: 'GitHub', href: 'https://github.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg' },
            { name: 'Fastly', href: 'https://www.fastly.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Fastly_logo.svg' },
            { name: 'Unity', href: 'https://unity.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Official_unity_logo.png' },
            { name: 'Blender', href: 'https://www.blender.org/', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Blender_logo_no_text.svg' },
            { name: 'Steam', href: 'https://store.steampowered.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg' },
            { name: 'Discord', href: 'https://discord.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Discord_logo_2015-2021.svg' },
        ],
    ] as const;
    const rowDurations = ['34s', '42s', '50s', '58s'];
    const rowDelays = ['0s', '-1s', '-2s', '-3s'];

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
                {/* Full-screen looping video background */}
                <video
                    className="hero-video"
                    src={HERO_VIDEO_URL}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                <div className="hero-video-overlay" />

                {navbar}

                {/* Intro text, aligned with the nav row on desktop */}
                    <p
                        className="hero-anim hero-fade absolute left-4 top-6 z-10 hidden max-w-xs text-sm text-white/80 sm:left-6 lg:left-8 lg:top-7 lg:block lg:max-w-sm lg:text-base"
                        style={{ animationDelay: '0.3s' }}
                    >
                    All you need in one place.
                    </p>

                {/* "50+ Projects" badge, aligned with the nav row on desktop */}
                <p
                    className="hero-anim hero-fade absolute right-4 top-6 z-10 hidden text-sm text-white/80 sm:right-6 lg:right-8 lg:top-7 lg:block lg:text-base"
                    style={{ animationDelay: '0.3s' }}
                >
                    50+ Projects Delivered Across Albania!
                </p>

                <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pt-28">
                    {/* Top section, below nav (mobile only) */}
                    <div className="hero-anim hero-fade grid grid-cols-1 gap-4 lg:hidden" style={{ animationDelay: '0.3s' }}>
                        <p className="max-w-md text-sm text-white/80 md:text-base">
                            All you need in one place.
                        </p>
                        <p className="text-sm text-white/80 md:text-base">
                            50+ Projects Delivered Across Albania!
                        </p>
                    </div>

                    {/* Hero center content */}
                    <div className="hero-shell flex flex-1 flex-col">
                        <div className="hero-copy flex flex-col">
                        <h1
                            className="hero-heading"
                        >
                            <span className="hero-heading-line hero-anim hero-reveal text-white" style={{ animationDelay: '0.2s' }}>
                                {t('Building the future')}
                            </span>
                            <ShinyText
                                text="Delivering real impact"
                                className="hero-gradient-line hero-anim hero-reveal"
                                baseColor="#44bafc"
                                shineColor="#a78bfa"
                                speed={4}
                                spread={110}
                            />
                        </h1>
                        <p className="hero-lede hero-anim hero-fade" style={{ animationDelay: '0.45s' }}>
                            {t('We build technology that creates value and drives progress.')}
                        </p>
                        <a
                            href="/tech"
                            className="hero-cta hero-anim hero-fade group inline-flex items-center gap-2 rounded-full px-6 py-3 text-white transition-all duration-300 md:px-8 md:py-4"
                            style={{ animationDelay: '0.8s' }}
                        >
                            {t('Explore Kayrosco Tech')}
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Main Content ─────────────────────────────────────────────────── */}
            <div className="page-view">
                <div className="view-content-padding">

                    {/* ── Technology showcase ── */}
                    <section id="integrated-expertise" style={{ paddingTop: 34 }}>
                        <div className="tech-showcase animate-fade-up">
                            <video
                                className="tech-showcase-video"
                                src={TECH_SHOWCASE_VIDEO_URL}
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                            <div className="tech-showcase-overlay" />
                            <div className="tech-showcase-content">
                                <div className="tech-showcase-intro">
                                    <div className="tech-showcase-kicker">Kayrosco / Digital Systems</div>
                                    <h2 className="tech-showcase-title">{t('Technology. Driven by Vision.')}</h2>
                                    <p className="tech-showcase-copy">{t('Technology projects across industries and borders.')} <strong style={{ color: '#fff' }}>{t('Bold solutions. Real impact.')}</strong></p>
                                    <a className="button-style tech-showcase-cta" href="/tech">{t('Take a Closer Look →')} <ArrowRight size={14} /></a>
                                </div>
                                <div className="tech-metrics">
                                    <div className="tech-metric"><div className="tech-metric-number">1</div><div className="tech-metric-label">Technology Team</div></div>
                                    <div className="tech-metric"><div className="tech-metric-number">4+</div><div className="tech-metric-label">Countries Active</div></div>
                                    <div className="tech-metric"><div className="tech-metric-number">50+</div><div className="tech-metric-label">Projects Delivered</div></div>
                                    <div className="tech-metric"><div className="tech-metric-number">1</div><div className="tech-metric-label">Unified Group</div></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Why Kayrosco ── */}
                    <section style={{ paddingTop: 80 }}>
                        <div className="section-header">
                            <h2>{t('Why Kayrosco?')}</h2>
                            <p>{t('Local knowledge, global standards. One trusted partner for everything Albania.')}</p>
                        </div>
                        <div className="why-grid">
                            <div className="why-card">
                                <svg className="why-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                </svg>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-light)', fontFamily: "'Manrope', sans-serif", marginBottom: 8 }}>{t('Local Roots, Global Reach')}</h3>
                                <p style={{ fontSize: '0.9rem' }}>Born and based in Albania, we have the relationships and on-the-ground knowledge that no outsider can replicate.</p>
                            </div>
                            <div className="why-card">
                                <svg className="why-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-light)', fontFamily: "'Manrope', sans-serif", marginBottom: 8 }}>{t('One Partner, Three Disciplines')}</h3>
                                <p style={{ fontSize: '0.9rem' }}>No hand-offs, no gaps. Our divisions talk to each other so your experience is always seamless.</p>
                            </div>
                            <div className="why-card">
                                <svg className="why-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-light)', fontFamily: "'Manrope', sans-serif", marginBottom: 8 }}>{t('Transparent & Accountable')}</h3>
                                <p style={{ fontSize: '0.9rem' }}>Clear pricing, honest timelines, and a team that stands behind every commitment it makes.</p>
                            </div>
                        </div>
                    </section>

                    {homepageLabels.length > 0 && (
                        <section className="homepage-labels-section" aria-label="Kayrosco highlights">
                            <div className="homepage-labels-window">
                                <div
                                    className="homepage-labels-track"
                                    style={{
                                        transform: `translateX(calc(50vw - (${labelIndex} * (var(--hl-item-w) + var(--hl-gap))) - (var(--hl-item-w) / 2)))`,
                                        transition: labelJumpInstant ? 'none' : undefined,
                                    }}
                                >
                                    {repeatedLabels.map((label, index) => {
                                        const isCenter = index === labelIndex;
                                        const card = (
                                            <div className={`homepage-label-card ${isCenter ? 'is-center' : ''}`}>
                                                <img src={label.image_url} alt={label.name} loading="lazy" />
                                                <div className="homepage-label-name">{label.name}</div>
                                            </div>
                                        );
                                        const key = `${label.id}-${index}`;
                                        return label.link ? <a key={key} href={label.link} target="_blank" rel="noreferrer" className="homepage-label-link">{card}</a> : <div key={key} className="homepage-label-link">{card}</div>;
                                    })}
                                </div>
                            </div>
                            {homepageLabels.length > 1 && (
                                <div className="homepage-label-dots" aria-label="Choose homepage highlight">
                                    {homepageLabels.map((label, index) => {
                                        const isActive = index === labelIndex % homepageLabels.length;
                                        return <button key={label.id} type="button" aria-label={`Show ${label.name}`} aria-current={isActive} className={isActive ? 'is-active' : ''} onClick={() => setLabelIndex(homepageLabels.length + index)} />;
                                    })}
                                </div>
                            )}
                        </section>
                    )}

                    <section style={{ paddingTop: 30, paddingBottom: 10 }}>
                        <h2 className="platforms-section-title">{t('Platforms & Services')}</h2>
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
                            <h2 style={{ fontSize: 'clamp(1.4rem, 2.6vw, 2rem)', marginBottom: 10, position: 'relative', zIndex: 1 }}>
                                Building Success Starts Here
                            </h2>
                            <p style={{ maxWidth: 540, margin: '0 auto 22px', fontSize: '0.92rem', position: 'relative', zIndex: 1 }}>
                                Trusted support for investors, entrepreneurs, travelers, and organizations seeking seamless solutions across Albania.
                            </p>
                            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                                <button
                                    type="button"
                                    className="button-style primary-button"
                                    style={{ padding: '10px 24px', fontSize: '0.85rem' }}
                                    onClick={() => setShowQuickContact((current) => !current)}
                                >
                                    Get in Touch &rarr;
                                </button>
                                {SHOW_TRAVEL_CONSULTING && <a href="/consulting" className="button-style">Our Services</a>}
                            </div>
                            {showQuickContact && (
                                <form
                                    className="quick-contact-form"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const data = new FormData(e.currentTarget);
                                        const email = String(data.get('email') || '').trim();
                                        const whatsapp = String(data.get('whatsapp') || '').trim();
                                        const description = String(data.get('description') || '').trim();
                                        const subject = `New quick request from ${email || 'website visitor'}`;
                                        const body = `Email: ${email}\nWhatsApp: ${whatsapp || 'Not provided'}\n\nDescription:\n${description}`;
                                        window.location.href = `mailto:info@kayrosco.al?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                    }}
                                >
                                    <div className="quick-contact-grid">
                                        <div>
                                            <label htmlFor="quick-email">Email</label>
                                            <input id="quick-email" name="email" type="email" placeholder="you@example.com" required />
                                        </div>
                                        <div>
                                            <label htmlFor="quick-whatsapp">WhatsApp Number</label>
                                            <input id="quick-whatsapp" name="whatsapp" type="text" placeholder="+355 ..." />
                                        </div>
                                        <div className="quick-contact-full">
                                            <label htmlFor="quick-description">Description</label>
                                            <textarea id="quick-description" name="description" placeholder="Tell us what you need help with." required />
                                        </div>
                                        <div className="quick-contact-full" style={{ display: 'flex', justifyContent: 'center' }}>
                                            <button type="submit" className="button-style primary-button">Send Request</button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </section>

                    {SHOW_TRAVEL_CONSULTING && <section style={{ paddingTop: 24, paddingBottom: 30 }}>
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
                    </section>}

                </div>
            </div>
        </>
    );
};

// Main Application Component
const App: React.FC = () => {
    const { t, language, setLanguage } = useSiteLanguage();
    const [currentPath, setCurrentPath] = useState<Page>(
        (window.location.pathname as Page) || '/'
    );
    const [isMobileViewport, setIsMobileViewport] = useState(
        () => typeof window !== 'undefined' && window.innerWidth <= 1024
    );
    const currentPageName = mapPathToPageName(currentPath);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [footerClicks, setFooterClicks] = useState(0);
    const footerClickResetRef = useRef<number | null>(null);
    const [headerVisible, setHeaderVisible] = useState(true);

    useEffect(() => {
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

    useEffect(() => {
        document.documentElement.classList.add('no-site-zoom');
        return () => {
            document.documentElement.classList.remove('no-site-zoom');
        };
    }, []);

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

    /* --- Shared Navbar (transparent; lives inside the hero on the home page) --- */
    const navbarElement = (
        <div className={`navbar-wrapper ${currentPageName === 'home' ? `home-header ${headerVisible ? '' : 'is-hidden'}` : ''}`}>
            <nav className="navbar">
                <div className="nav-links-container">

                    <a className={`nav-link ${getLinkClass('/')}`} href="/">{t('Home')}</a>

                    {/* Dropdown Menu (hover-to-open disabled; toggle links straight to /tech) */}
                    <div
                        className={`dropdown ${isDropdownOpen ? 'dropdown-open' : ''}`}
                    >
                        <a
                            className={`nav-link dropdown-toggle ${getLinkClass('solutions')}`}
                            href="/tech"
                        >
                            {t('Kayrosco Tech')} <span className="chevron">▾</span>
                        </a>

                        <div className={`dropdown-menu ${isDropdownOpen ? 'visible' : 'hidden'}`}>
                            <a href="/tech">
                                <div className="dm-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                                        <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                                    </svg>
                                </div>
                                <span className="dm-title">{t('Tech Solutions')}</span>
                                <span className="dm-desc">{t('Software & cloud systems')}</span>
                                <span className="dm-arrow">→</span>
                            </a>
                        </div>
                    </div>

                    <a className={`nav-link ${getLinkClass('/about')}`} href="/about">{t('About Us')}</a>
                    <a className={`nav-link button-style primary-button ${getLinkClass('/contact')}`} href="/contact">{t('Contact')}</a>
                </div>
            </nav>
        </div>
    );

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
            default: return <HomeView navbar={navbarElement} />;
        }
    };

    const handleFooterKayroscoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const nextClickCount = footerClicks + 1;
        setFooterClicks(nextClickCount);

        if (footerClickResetRef.current !== null) {
            window.clearTimeout(footerClickResetRef.current);
        }
        footerClickResetRef.current = window.setTimeout(() => setFooterClicks(0), 1500);

        if (nextClickCount >= 3) {
            setFooterClicks(0);
            window.location.href = "/memo/login";
        }
    };

    const seoMap = {
        home: {
            title: "Kayrosco Group | Technology Services in Albania",
            description: "Professional technology services in Albania — custom software, modern web platforms, and CCTV systems.",
            canonicalPath: "/",
            schemas: [
                {
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    name: "KAYROSCO GROUP",
                    url: SITE_URL,
                    logo: `${SITE_URL}/lolo.png`,
                    image: `${SITE_URL}/banner.png`,
                    description: "KAYROSCO GROUP provides technology services in Albania.",
                    areaServed: [
                        { "@type": "Country", name: "Albania" },
                        { "@type": "Country", name: "Turkey" },
                    ],
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
                    areaServed: [
                        { "@type": "Country", name: "Albania" },
                        { "@type": "Country", name: "Turkey" },
                    ],
                },
            ],
        },
        about: {
            title: "About Kayrosco Group | Albania-Based Technology Company",
            description: "Learn about Kayrosco Group and its technology services in Albania.",
            canonicalPath: "/about",
            schemas: [],
        },
        contact: {
            title: "Contact Kayrosco | Technology Services",
            description: "Contact Kayrosco Group for technology services in Albania.",
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
                    areaServed: [
                        { "@type": "Country", name: "Albania" },
                        { "@type": "Country", name: "Turkey" },
                    ],
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
                keywords={["Kayrosco Group", "Albania business services", "technology services Albania"]}
                schemas={activeSeo.schemas}
            />
            {/* Inject Global Styles */}
            <GlobalStyles />
            
            {/* Navbar (transparent, lives inside the hero on the home page) */}
            {isMobileViewport && isDropdownOpen && (
                <div className="dropdown-backdrop" onClick={() => setIsDropdownOpen(false)} />
            )}
            {currentPageName !== 'home' && navbarElement}

            {/* Render the currently active page view */}
            {renderPage()}
            {isMobileViewport && (
                <>
                    <div style={{ height: 68 }}></div>
                    <nav
                        aria-label="Mobile Navigation"
                        style={{
                            position: 'fixed',
                            left: 14,
                            right: 14,
                            bottom: 8,
                            zIndex: 1500,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: 6,
                            padding: 6,
                            background: 'rgba(26, 33, 47, 0.94)',
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
                                minHeight: 46,
                                borderRadius: 12,
                                textDecoration: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 3,
                                color: '#FFFFFF',
                                background: currentPath === '/' ? 'linear-gradient(160deg, rgba(192,192,192,0.18) 0%, rgba(192,192,192,0.08) 100%)' : 'transparent',
                                border: currentPath === '/' ? '1px solid rgba(192,192,192,0.25)' : '1px solid transparent',
                                transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.15s ease',
                            }}
                            onMouseDown={(e) => { (e.currentTarget as HTMLAnchorElement).style.animation = 'tab-pop 0.28s ease'; }}
                            onAnimationEnd={(e) => { (e.currentTarget as HTMLAnchorElement).style.animation = ''; }}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 20, height: 20, stroke: '#FFFFFF', fill: 'none' }}>
                                <path d="M4 10.5 12 4l8 6.5" />
                                <path d="M6.5 9.75V20h11V9.75" />
                                <path d="M10 20v-5h4v5" />
                            </svg>
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.01em' }}>{t('Home')}</span>
                        </a>
                        <a
                            href="/#integrated-expertise"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPageName === 'home') {
                                    document.getElementById('integrated-expertise')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                } else {
                                    window.location.href = '/#integrated-expertise';
                                }
                            }}
                            style={{
                                minHeight: 46, borderRadius: 12, textDecoration: 'none',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                                color: '#FFFFFF',
                                background: ['/travel','/consulting','/tech'].includes(currentPath) ? 'linear-gradient(160deg, rgba(192,192,192,0.18) 0%, rgba(192,192,192,0.08) 100%)' : 'transparent',
                                border: ['/travel','/consulting','/tech'].includes(currentPath) ? '1px solid rgba(192,192,192,0.25)' : '1px solid transparent',
                                transition: 'background 0.2s ease, border-color 0.2s ease',
                            }}
                            onMouseDown={(e) => { (e.currentTarget as HTMLAnchorElement).style.animation = 'tab-pop 0.28s ease'; }}
                            onAnimationEnd={(e) => { (e.currentTarget as HTMLAnchorElement).style.animation = ''; }}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 20, height: 20, stroke: '#FFFFFF', fill: 'none' }}>
                                <rect x="4.5" y="5" width="6" height="6" rx="1.2" />
                                <rect x="13.5" y="5" width="6" height="6" rx="1.2" />
                                <rect x="4.5" y="14" width="6" height="6" rx="1.2" />
                                <rect x="13.5" y="14" width="6" height="6" rx="1.2" />
                            </svg>
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.01em' }}>{t('Companies')}</span>
                        </a>
                        <a
                            className={getLinkClass('/about')}
                            href="/about"
                            style={{
                                minHeight: 46, borderRadius: 12, textDecoration: 'none',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                                color: '#FFFFFF',
                                background: currentPath === '/about' ? 'linear-gradient(160deg, rgba(192,192,192,0.18) 0%, rgba(192,192,192,0.08) 100%)' : 'transparent',
                                border: currentPath === '/about' ? '1px solid rgba(192,192,192,0.25)' : '1px solid transparent',
                                transition: 'background 0.2s ease, border-color 0.2s ease',
                            }}
                            onMouseDown={(e) => { (e.currentTarget as HTMLAnchorElement).style.animation = 'tab-pop 0.28s ease'; }}
                            onAnimationEnd={(e) => { (e.currentTarget as HTMLAnchorElement).style.animation = ''; }}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 20, height: 20, stroke: '#FFFFFF', fill: 'none' }}>
                                <circle cx="12" cy="8" r="3" />
                                <path d="M6 19c1.5-3 4-4.5 6-4.5s4.5 1.5 6 4.5" />
                            </svg>
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.01em' }}>{t('About Us')}</span>
                        </a>
                        <a
                            className={getLinkClass('/contact')}
                            href="/contact"
                            style={{
                                minHeight: 46, borderRadius: 12, textDecoration: 'none',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                                color: '#FFFFFF',
                                background: currentPath === '/contact' ? 'linear-gradient(160deg, rgba(192,192,192,0.18) 0%, rgba(192,192,192,0.08) 100%)' : 'transparent',
                                border: currentPath === '/contact' ? '1px solid rgba(192,192,192,0.25)' : '1px solid transparent',
                                transition: 'background 0.2s ease, border-color 0.2s ease',
                            }}
                            onMouseDown={(e) => { (e.currentTarget as HTMLAnchorElement).style.animation = 'tab-pop 0.28s ease'; }}
                            onAnimationEnd={(e) => { (e.currentTarget as HTMLAnchorElement).style.animation = ''; }}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 20, height: 20, stroke: '#FFFFFF', fill: 'none' }}>
                                <path d="M6.6 4.8h2.6l1.2 3.1-1.6 1.6a14 14 0 0 0 5.3 5.3l1.6-1.6 3.1 1.2v2.6a1.6 1.6 0 0 1-1.7 1.6A15.5 15.5 0 0 1 5 6.5 1.6 1.6 0 0 1 6.6 4.8Z" />
                            </svg>
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.01em' }}>{t('Contact')}</span>
                        </a>
                        <button
                            type="button"
                            aria-label="Change language"
                            onClick={() => setLanguage(language === 'en' ? 'ar' : language === 'ar' ? 'tr' : 'en')}
                            style={{
                                minHeight: 46, borderRadius: 12, border: '1px solid transparent',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                                color: '#FFFFFF', background: 'transparent', cursor: 'pointer',
                                transition: 'background 0.2s ease, border-color 0.2s ease',
                            }}
                            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.animation = 'tab-pop 0.28s ease'; }}
                            onAnimationEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.animation = ''; }}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 20, height: 20, stroke: '#FFFFFF', fill: 'none' }}>
                                <circle cx="12" cy="12" r="9" />
                                <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
                            </svg>
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.01em' }}>{language.toUpperCase()}</span>
                        </button>
                    </nav>
                </>
            )}
            
            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <a href="/" className="logo" onClick={handleFooterKayroscoClick} style={{ cursor: 'default' }}>KAYROSCO</a>
                    <div className="footer-social-row">
                        {[...CONTACT_DETAILS, ...CONTACT_SOCIALS].map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                target={item.href.startsWith('http') ? '_blank' : undefined}
                                rel="noopener noreferrer"
                                className="footer-social-icon"
                                aria-label={item.label}
                                title={item.label}
                            >
                                <ContactIcon kind={item.icon} />
                            </a>
                        ))}
                    </div>
                    <div className="footer-lang-row" aria-label="Choose language">
                        {(['en', 'ar', 'tr'] as const).map((lng) => (
                            <button
                                key={lng}
                                type="button"
                                className={`footer-lang-btn ${language === lng ? 'is-active' : ''}`}
                                onClick={() => setLanguage(lng)}
                            >
                                {lng.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <div className="footer-links" style={{marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center'}}>
                        {SHOW_TRAVEL_CONSULTING && <a href="/travel" className="text-sm text-muted hover:text-accent-purple">Travel Services</a>}
                        {SHOW_TRAVEL_CONSULTING && <span className="text-muted">|</span>}
                        {SHOW_TRAVEL_CONSULTING && <a href="/consulting" className="text-sm text-muted hover:text-accent-purple">Consulting</a>}
                        {SHOW_TRAVEL_CONSULTING && <span className="text-muted">|</span>}
                        <a href="/tech" className="text-sm text-muted hover:text-accent-purple">{t('Tech Solutions')}</a>
                        <span className="text-muted">|</span>
                        <a href="/partners" className="text-sm text-muted hover:text-accent-purple">{t('Partners')}</a>
                        <span className="text-muted">|</span>
                        <a href="/privacy-policy" className="text-sm text-muted hover:text-accent-purple">Privacy Policy</a>
                    </div>
                </div>
                <p className="copyright" style={{marginTop: '20px'}}>© 2026 Kayrosco. All rights reserved. | Global Bridge to Albania.</p>
            </footer>
        </>
    );
};

export default App;
