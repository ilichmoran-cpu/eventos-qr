<!DOCTYPE html>
<html lang="es">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0">

<meta
    name="theme-color"
    content="#08101f">

<meta
    name="referrer"
    content="no-referrer">

<title>Mis Entradas | Live Tickets</title>

<meta
    name="description"
    content="Accede a tus entradas digitales de Live Tickets y presenta tus códigos QR para ingresar a tus eventos.">

<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>

<link
    rel="preconnect"
    href="https://fonts.googleapis.com">

<link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin>

<link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
    rel="stylesheet">


<style>

/* ==========================================================
   GENERAL
========================================================== */

* {
    box-sizing: border-box;
}

:root {

    --bg:
        #f4f7fb;

    --dark:
        #08101f;

    --dark-soft:
        #101a31;

    --text:
        #111827;

    --muted:
        #667085;

    --line:
        #e5e7eb;

    --primary:
        #2563eb;

    --primary-dark:
        #1d4ed8;

    --primary-soft:
        #eff6ff;

    --green:
        #16a34a;

    --green-soft:
        #ecfdf5;

    --red:
        #dc2626;

    --red-soft:
        #fef2f2;

    --orange:
        #f97316;

    --orange-soft:
        #fff7ed;

    --gray:
        #64748b;
}


html {

    min-height:
        100%;

    scroll-behavior:
        smooth;

    background:
        var(--bg);
}


body {

    margin:
        0;

    min-height:
        100vh;

    font-family:
        "Inter",
        Arial,
        sans-serif;

    background:
        var(--bg);

    color:
        var(--text);

    -webkit-font-smoothing:
        antialiased;
}


button,
input {

    font-family:
        inherit;
}


button,
a {

    -webkit-tap-highlight-color:
        transparent;
}


/* ==========================================================
   HEADER
========================================================== */

.topbar {

    position:
        sticky;

    top:
        0;

    z-index:
        1000;

    background:
        rgba(8,16,31,.98);

    backdrop-filter:
        blur(18px);

    border-bottom:
        1px solid rgba(255,255,255,.08);

    box-shadow:
        0 4px 25px rgba(0,0,0,.16);
}


.nav {

    width:
        100%;

    max-width:
        1450px;

    min-height:
        76px;

    margin:
        auto;

    padding:
        0 24px;

    display:
        flex;

    align-items:
        center;

    gap:
        28px;
}


.brand {

    display:
        flex;

    align-items:
        center;

    flex-shrink:
        0;

    text-decoration:
        none;
}


.brand-logo {

    display:
        block;

    width:
        auto;

    height:
        49px;

    max-width:
        245px;

    object-fit:
        contain;
}


/* ==========================================================
   NAVIGATION
========================================================== */

.nav-links {

    margin-left:
        auto;

    display:
        flex;

    align-items:
        center;

    gap:
        26px;
}


.nav-links a {

    color:
        rgba(255,255,255,.74);

    text-decoration:
        none;

    font-size:
        12px;

    font-weight:
        600;

    transition:
        .2s;
}


.nav-links a:hover {

    color:
        white;
}


.nav-links a.active {

    color:
        white;
}


.nav-actions {

    display:
        flex;

    align-items:
        center;

    gap:
        9px;
}


.nav-pass {

    min-height:
        39px;

    padding:
        0 16px;

    display:
        inline-flex;

    align-items:
        center;

    justify-content:
        center;

    gap:
        7px;

    border:
        1px solid rgba(96,165,250,.45);

    border-radius:
        999px;

    background:
        rgba(37,99,235,.26);

    color:
        white;

    text-decoration:
        none;

    white-space:
        nowrap;

    font-size:
        10px;

    font-weight:
        800;
}


.nav-events {

    min-height:
        39px;

    padding:
        0 16px;

    display:
        inline-flex;

    align-items:
        center;

    justify-content:
        center;

    border:
        1px solid rgba(255,255,255,.15);

    border-radius:
        999px;

    background:
        transparent;

    color:
        white;

    text-decoration:
        none;

    white-space:
        nowrap;

    font-size:
        10px;

    font-weight:
        800;

    cursor:
        pointer;

    transition:
        .2s;
}


.nav-events:hover {

    background:
        rgba(255,255,255,.08);
}


#logoutButton {

    display:
        none;
}


/* ==========================================================
   LOADING
========================================================== */

.loading-screen {

    position:
        fixed;

    inset:
        0;

    z-index:
        9000;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    background:
        #f4f7fb;
}


.loading-screen.hide {

    display:
        none;
}


.loading-inner {

    text-align:
        center;
}


.spinner {

    width:
        44px;

    height:
        44px;

    margin:
        0 auto 13px;

    border:
        4px solid #dce3ec;

    border-top-color:
        var(--primary);

    border-radius:
        50%;

    animation:
        spin .75s linear infinite;
}


@keyframes spin {

    to {

        transform:
            rotate(360deg);

    }

}


.loading-inner strong {

    display:
        block;

    margin-bottom:
        4px;

    font-size:
        13px;
}


.loading-inner span {

    color:
        var(--muted);

    font-size:
        9px;
}


/* ==========================================================
   AUTH
========================================================== */

.auth-section {

    min-height:
        calc(100vh - 76px);

    padding:
        55px 18px;

    display:
        none;

    align-items:
        center;

    justify-content:
        center;

    background:

        radial-gradient(
            circle at 14% 10%,
            rgba(37,99,235,.12),
            transparent 27%
        ),

        radial-gradient(
            circle at 90% 82%,
            rgba(124,58,237,.09),
            transparent 30%
        ),

        #f4f7fb;
}


.auth-section.show {

    display:
        flex;
}


.auth-wrapper {

    width:
        min(940px,100%);

    display:
        grid;

    grid-template-columns:
        minmax(0,1fr)
        390px;

    gap:
        20px;

    align-items:
        stretch;
}


/* ==========================================================
   AUTH INTRO
========================================================== */

.auth-intro {

    position:
        relative;

    overflow:
        hidden;

    min-height:
        520px;

    padding:
        42px;

    display:
        flex;

    flex-direction:
        column;

    justify-content:
        space-between;

    border-radius:
        26px;

    background:

        radial-gradient(
            circle at 85% 12%,
            rgba(37,99,235,.46),
            transparent 34%
        ),

        radial-gradient(
            circle at 10% 90%,
            rgba(124,58,237,.18),
            transparent 30%
        ),

        linear-gradient(
            145deg,
            #08101f,
            #101c31
        );

    color:
        white;

    box-shadow:
        0 25px 70px rgba(15,23,42,.14);
}


.auth-intro-badge {

    width:
        fit-content;

    padding:
        7px 10px;

    border:
        1px solid rgba(96,165,250,.25);

    border-radius:
        999px;

    background:
        rgba(37,99,235,.17);

    color:
        #bfdbfe;

    font-size:
        8px;

    font-weight:
        900;

    letter-spacing:
        1px;
}


.auth-intro h1 {

    max-width:
        510px;

    margin:
        18px 0 13px;

    font-size:
        clamp(35px,5vw,53px);

    line-height:
        1.03;

    letter-spacing:
        -1.8px;
}


.auth-intro-copy {

    max-width:
        520px;

    margin:
        0;

    color:
        rgba(255,255,255,.60);

    font-size:
        11px;

    line-height:
        1.7;
}


.auth-benefits {

    display:
        grid;

    gap:
        9px;
}


.auth-benefit {

    padding:
        13px 14px;

    display:
        flex;

    align-items:
        center;

    gap:
        11px;

    border:
        1px solid rgba(255,255,255,.08);

    border-radius:
        13px;

    background:
        rgba(255,255,255,.05);
}


.auth-benefit-icon {

    width:
        34px;

    height:
        34px;

    flex-shrink:
        0;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    border-radius:
        10px;

    background:
        rgba(37,99,235,.24);

    font-size:
        14px;
}


.auth-benefit strong {

    display:
        block;

    margin-bottom:
        3px;

    font-size:
        9px;
}


.auth-benefit span {

    display:
        block;

    color:
        rgba(255,255,255,.48);

    font-size:
        7px;

    line-height:
        1.4;
}


/* ==========================================================
   AUTH CARD
========================================================== */

.auth-card {

    overflow:
        hidden;

    align-self:
        center;

    background:
        white;

    border:
        1px solid #e5e9ef;

    border-radius:
        24px;

    box-shadow:
        0 20px 55px rgba(15,23,42,.10);
}


.auth-top {

    padding:
        27px 25px 17px;
}


.auth-badge {

    display:
        inline-flex;

    margin-bottom:
        11px;

    padding:
        6px 9px;

    background:
        #eff6ff;

    border:
        1px solid #bfdbfe;

    border-radius:
        999px;

    color:
        #1d4ed8;

    font-size:
        7px;

    font-weight:
        900;

    letter-spacing:
        .9px;
}


.auth-top h2 {

    margin:
        0 0 8px;

    font-size:
        25px;

    line-height:
        1.1;

    letter-spacing:
        -.6px;
}


.auth-top p {

    margin:
        0;

    color:
        var(--muted);

    font-size:
        9px;

    line-height:
        1.6;
}


.auth-body {

    padding:
        10px 25px 26px;
}


.form-label {

    display:
        block;

    margin-bottom:
        7px;

    color:
        #475467;

    font-size:
        8px;

    font-weight:
        900;

    letter-spacing:
        .4px;
}


.form-input {

    width:
        100%;

    min-height:
        52px;

    padding:
        0 14px;

    border:
        1px solid #d7dde5;

    border-radius:
        12px;

    outline:
        none;

    background:
        white;

    color:
        #111827;

    font-size:
        13px;
}


.form-input:focus {

    border-color:
        var(--primary);

    box-shadow:
        0 0 0 3px rgba(37,99,235,.08);
}


.code-input {

    height:
        67px;

    text-align:
        center;

    font-size:
        27px;

    font-weight:
        900;

    letter-spacing:
        10px;
}


.primary-button {

    width:
        100%;

    min-height:
        51px;

    margin-top:
        13px;

    border:
        none;

    border-radius:
        12px;

    background:
        var(--primary);

    color:
        white;

    cursor:
        pointer;

    font-size:
        10px;

    font-weight:
        900;

    transition:
        .2s;
}


.primary-button:hover:not(:disabled) {

    background:
        var(--primary-dark);

    transform:
        translateY(-1px);
}


.primary-button:disabled {

    opacity:
        .55;

    cursor:
        not-allowed;

    transform:
        none;
}


.auth-help {

    margin-top:
        11px;

    color:
        #98a2b3;

    text-align:
        center;

    font-size:
        8px;

    line-height:
        1.55;
}


.auth-error {

    display:
        none;

    margin-top:
        12px;

    padding:
        11px;

    background:
        var(--red-soft);

    border:
        1px solid #fecaca;

    border-radius:
        10px;

    color:
        #991b1b;

    text-align:
        center;

    font-size:
        9px;

    line-height:
        1.5;
}


.auth-error.show {

    display:
        block;
}


.code-email {

    margin-bottom:
        17px;

    padding:
        12px;

    background:
        #eff6ff;

    border:
        1px solid #bfdbfe;

    border-radius:
        11px;

    color:
        #1e40af;

    text-align:
        center;

    font-size:
        9px;

    line-height:
        1.6;

    word-break:
        break-word;
}


.resend-row {

    margin-top:
        13px;

    display:
        flex;

    justify-content:
        center;
}


.text-button {

    border:
        none;

    background:
        transparent;

    color:
        var(--primary);

    cursor:
        pointer;

    font-size:
        9px;

    font-weight:
        800;
}


.text-button:disabled {

    color:
        #9ca3af;

    cursor:
        not-allowed;
}


/* ==========================================================
   LIVE PASS
========================================================== */

.live-pass {

    display:
        none;
}


.live-pass.show {

    display:
        block;
}


/* ==========================================================
   LIVE PASS HERO
========================================================== */

.pass-hero {

    position:
        relative;

    overflow:
        hidden;

    background:

        radial-gradient(
            circle at 78% 15%,
            rgba(37,99,235,.42),
            transparent 30%
        ),

        radial-gradient(
            circle at 15% 90%,
            rgba(124,58,237,.16),
            transparent 30%
        ),

        linear-gradient(
            135deg,
            #08101f,
            #101c31
        );

    color:
        white;
}


.pass-hero-inner {

    width:
        100%;

    max-width:
        1320px;

    min-height:
        280px;

    margin:
        auto;

    padding:
        48px 20px;

    display:
        grid;

    grid-template-columns:
        minmax(0,1fr)
        300px;

    align-items:
        center;

    gap:
        35px;
}


.pass-hero-text {

    max-width:
        680px;
}


.pass-eyebrow {

    display:
        inline-flex;

    margin-bottom:
        11px;

    padding:
        7px 10px;

    background:
        rgba(37,99,235,.17);

    border:
        1px solid rgba(96,165,250,.20);

    border-radius:
        999px;

    color:
        #bfdbfe;

    font-size:
        8px;

    font-weight:
        900;

    letter-spacing:
        .9px;
}


.pass-hero h1 {

    margin:
        0 0 10px;

    font-size:
        clamp(34px,5vw,54px);

    letter-spacing:
        -1.8px;
}


.pass-hero p {

    max-width:
        600px;

    margin:
        0;

    color:
        rgba(255,255,255,.62);

    font-size:
        11px;

    line-height:
        1.65;
}


/* ==========================================================
   ACCOUNT CARD
========================================================== */

.pass-user {

    padding:
        20px;

    background:
        rgba(255,255,255,.07);

    border:
        1px solid rgba(255,255,255,.10);

    border-radius:
        18px;

    backdrop-filter:
        blur(12px);
}


.pass-user-label {

    display:
        block;

    margin-bottom:
        5px;

    color:
        rgba(255,255,255,.42);

    font-size:
        7px;

    font-weight:
        800;

    letter-spacing:
        .4px;
}


.pass-user-value {

    display:
        block;

    color:
        white;

    font-size:
        12px;

    font-weight:
        800;

    word-break:
        break-word;
}


.pass-user-separator {

    height:
        1px;

    margin:
        15px 0;

    background:
        rgba(255,255,255,.08);
}


.pass-stats {

    margin-top:
        16px;

    display:
        grid;

    grid-template-columns:
        repeat(2,1fr);

    gap:
        8px;
}


.pass-stat {

    padding:
        11px;

    border:
        1px solid rgba(255,255,255,.08);

    border-radius:
        11px;

    background:
        rgba(255,255,255,.04);

    text-align:
        center;
}


.pass-stat strong {

    display:
        block;

    margin-bottom:
        3px;

    color:
        white;

    font-size:
        18px;
}


.pass-stat span {

    color:
        rgba(255,255,255,.44);

    font-size:
        6px;

    font-weight:
        800;

    letter-spacing:
        .4px;
}


/* ==========================================================
   PAGE
========================================================== */

.page {

    width:
        100%;

    max-width:
        1320px;

    margin:
        auto;

    padding:
        34px 20px 80px;
}


.section-head {

    margin-bottom:
        18px;

    display:
        flex;

    justify-content:
        space-between;

    align-items:
        flex-end;

    gap:
        15px;
}


.section-head h2 {

    margin:
        0 0 5px;

    font-size:
        25px;

    letter-spacing:
        -.5px;
}


.section-head p {

    margin:
        0;

    color:
        var(--muted);

    font-size:
        9px;
}


.refresh-button {

    min-height:
        38px;

    padding:
        0 13px;

    border:
        1px solid #dbe1e8;

    border-radius:
        10px;

    background:
        white;

    color:
        #344054;

    cursor:
        pointer;

    font-size:
        8px;

    font-weight:
        800;
}


.refresh-button:hover {

    border-color:
        #bfdbfe;

    background:
        #eff6ff;

    color:
        #1d4ed8;
}


/* ==========================================================
   RESERVATION LIST
========================================================== */

.reservations-list {

    display:
        grid;

    gap:
        20px;
}


.reservation-card {

    overflow:
        hidden;

    background:
        white;

    border:
        1px solid #e5e9ef;

    border-radius:
        22px;

    box-shadow:
        0 10px 32px rgba(15,23,42,.055);
}


/* ==========================================================
   EVENT HEADER
========================================================== */

.event-head {

    display:
        grid;

    grid-template-columns:
        160px 1fr;

    min-height:
        190px;

    background:
        #08101f;

    color:
        white;
}


.event-image {

    width:
        160px;

    height:
        100%;

    min-height:
        190px;

    object-fit:
        cover;

    background:
        #111827;
}


.event-info {

    padding:
        25px;

    display:
        flex;

    flex-direction:
        column;

    justify-content:
        center;
}


.event-info small {

    display:
        block;

    margin-bottom:
        7px;

    color:
        #93c5fd;

    font-size:
        7px;

    font-weight:
        900;

    letter-spacing:
        .8px;
}


.event-info h3 {

    margin:
        0 0 12px;

    font-size:
        25px;

    line-height:
        1.12;
}


.event-meta {

    display:
        grid;

    gap:
        6px;

    color:
        rgba(255,255,255,.63);

    font-size:
        9px;

    line-height:
        1.5;
}


.event-actions {

    margin-top:
        17px;

    display:
        flex;

    gap:
        8px;

    flex-wrap:
        wrap;
}


.event-action {

    min-height:
        35px;

    padding:
        0 11px;

    border:
        1px solid rgba(255,255,255,.14);

    border-radius:
        9px;

    background:
        rgba(255,255,255,.07);

    color:
        white;

    cursor:
        pointer;

    font-size:
        7px;

    font-weight:
        800;
}


.event-action:hover {

    background:
        rgba(255,255,255,.13);
}


/* ==========================================================
   RESERVATION SUMMARY
========================================================== */

.order-summary {

    padding:
        15px 19px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        space-between;

    gap:
        15px;

    flex-wrap:
        wrap;

    background:
        #fafbfd;

    border-bottom:
        1px solid #e8ecf1;
}


.order-summary-left {

    display:
        flex;

    align-items:
        center;

    gap:
        18px;

    flex-wrap:
        wrap;
}


.order-info small {

    display:
        block;

    margin-bottom:
        3px;

    color:
        #98a2b3;

    font-size:
        6px;

    font-weight:
        900;

    letter-spacing:
        .3px;
}


.order-info strong {

    color:
        #111827;

    font-size:
        10px;
}


.order-total {

    color:
        #111827;

    font-size:
        16px;

    font-weight:
        900;
}


/* ==========================================================
   TICKETS
========================================================== */

.ticket-list {

    padding:
        18px;

    display:
        grid;

    grid-template-columns:
        repeat(3,minmax(0,1fr));

    gap:
        13px;
}


.ticket {

    overflow:
        hidden;

    border:
        1px solid #e5e7eb;

    border-radius:
        16px;

    background:
        white;

    transition:
        .2s;
}


.ticket:hover {

    box-shadow:
        0 10px 25px rgba(15,23,42,.07);
}


.ticket.used {

    opacity:
        .68;

    box-shadow:
        none;
}


.ticket-top {

    padding:
        15px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        space-between;

    gap:
        10px;

    background:
        #f8fafc;

    border-bottom:
        1px solid #e7ebef;
}


.ticket-name {

    color:
        #111827;

    font-size:
        9px;

    font-weight:
        900;
}


.ticket-status {

    padding:
        5px 7px;

    border-radius:
        999px;

    background:
        #dcfce7;

    color:
        #166534;

    font-size:
        6px;

    font-weight:
        900;

    letter-spacing:
        .3px;
}


.ticket-status.used {

    background:
        #f3f4f6;

    color:
        #4b5563;
}


.ticket-seat {

    padding:
        18px;

    display:
        grid;

    grid-template-columns:
        repeat(2,1fr);

    gap:
        9px;
}


.ticket-seat-box {

    padding:
        12px;

    background:
        #f7f9fc;

    border:
        1px solid #e7ebef;

    border-radius:
        10px;

    text-align:
        center;
}


.ticket-seat-box small {

    display:
        block;

    margin-bottom:
        4px;

    color:
        #667085;

    font-size:
        6px;

    font-weight:
        800;
}


.ticket-seat-box strong {

    color:
        #111827;

    font-size:
        20px;

    font-weight:
        900;
}


.ticket-button {

    width:
        calc(100% - 28px);

    min-height:
        43px;

    margin:
        0 14px 14px;

    border:
        none;

    border-radius:
        10px;

    background:
        var(--primary);

    color:
        white;

    cursor:
        pointer;

    font-size:
        8px;

    font-weight:
        900;

    transition:
        .2s;
}


.ticket-button:hover {

    background:
        var(--primary-dark);
}


.ticket-used-message {

    margin:
        0 14px 14px;

    padding:
        11px;

    background:
        #f3f4f6;

    border-radius:
        9px;

    color:
        #4b5563;

    text-align:
        center;

    font-size:
        7px;

    font-weight:
        800;

    line-height:
        1.5;
}


/* ==========================================================
   QR
========================================================== */

.qr-panel {

    display:
        none;

    margin:
        0 14px 14px;

    padding:
        16px;

    background:
        white;

    border:
        1px solid #dce3eb;

    border-radius:
        12px;

    text-align:
        center;

    box-shadow:
        inset 0 0 0 1px rgba(37,99,235,.02);
}


.qr-panel.show {

    display:
        block;
}


.qr-title {

    margin-bottom:
        11px;

    color:
        #111827;

    font-size:
        8px;

    font-weight:
        900;

    letter-spacing:
        .5px;
}


.qr-container {

    width:
        220px;

    max-width:
        100%;

    min-height:
        220px;

    margin:
        auto;

    padding:
        8px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    background:
        white;

    border:
        1px solid #e5e7eb;

    border-radius:
        12px;
}


.qr-container img,
.qr-container canvas {

    max-width:
        100%;

    height:
        auto !important;
}


.qr-warning {

    margin-top:
        11px;

    padding:
        9px;

    background:
        #fff7ed;

    border:
        1px solid #fed7aa;

    border-radius:
        8px;

    color:
        #b45309;

    font-size:
        7px;

    font-weight:
        700;

    line-height:
        1.5;
}


/* ==========================================================
   EMPTY
========================================================== */

.empty-state {

    padding:
        55px 20px;

    background:
        white;

    border:
        1px solid #e5e7eb;

    border-radius:
        20px;

    text-align:
        center;
}


.empty-icon {

    width:
        62px;

    height:
        62px;

    margin:
        0 auto 14px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    background:
        #eff6ff;

    color:
        var(--primary);

    border-radius:
        50%;

    font-size:
        25px;
}


.empty-state h3 {

    margin:
        0 0 7px;

    font-size:
        18px;
}


.empty-state p {

    max-width:
        430px;

    margin:
        0 auto 17px;

    color:
        var(--muted);

    font-size:
        9px;

    line-height:
        1.6;
}


.empty-button {

    min-height:
        39px;

    padding:
        0 14px;

    display:
        inline-flex;

    align-items:
        center;

    justify-content:
        center;

    border-radius:
        9px;

    background:
        var(--primary);

    color:
        white;

    text-decoration:
        none;

    font-size:
        8px;

    font-weight:
        900;
}


/* ==========================================================
   FOOTER
========================================================== */

.footer {

    background:
        #050b16;

    color:
        white;
}


.footer-content {

    width:
        100%;

    max-width:
        1320px;

    margin:
        auto;

    padding:
        29px 20px;

    display:
        flex;

    justify-content:
        space-between;

    align-items:
        center;

    gap:
        20px;
}


.footer-logo {

    width:
        auto;

    height:
        35px;

    max-width:
        180px;

    object-fit:
        contain;
}


.footer-links {

    display:
        flex;

    align-items:
        center;

    gap:
        18px;
}


.footer-links a {

    color:
        rgba(255,255,255,.52);

    text-decoration:
        none;

    font-size:
        8px;
}


.footer-links a:hover {

    color:
        white;
}


.footer-copy {

    color:
        rgba(255,255,255,.36);

    font-size:
        8px;
}


/* ==========================================================
   TOAST
========================================================== */

.toast {

    position:
        fixed;

    right:
        18px;

    bottom:
        18px;

    z-index:
        10000;

    width:
        min(390px,calc(100% - 36px));

    display:
        none;

    padding:
        14px 16px;

    border-radius:
        12px;

    background:
        #08101f;

    color:
        white;

    box-shadow:
        0 18px 50px rgba(0,0,0,.25);

    font-size:
        9px;

    line-height:
        1.55;
}


.toast.show {

    display:
        block;
}


.toast.error {

    background:
        #991b1b;
}


/* ==========================================================
   TABLET
========================================================== */

@media(max-width:1000px) {

    .auth-wrapper {

        grid-template-columns:
            1fr 370px;
    }


    .ticket-list {

        grid-template-columns:
            repeat(2,1fr);
    }

}


/* ==========================================================
   MOBILE
========================================================== */

@media(max-width:760px) {

    .nav {

        min-height:
            64px;

        padding:
            0 12px;

        gap:
            8px;
    }


    .brand-logo {

        height:
            34px;

        max-width:
            170px;
    }


    .nav-links {

        display:
            none;
    }


    .nav-actions {

        margin-left:
            auto;

        gap:
            5px;
    }


    .nav-pass {

        min-height:
            36px;

        padding:
            0 10px;

        font-size:
            8px;
    }


    .nav-events {

        min-height:
            36px;

        padding:
            0 10px;

        font-size:
            7px;
    }


    .auth-section {

        min-height:
            calc(100vh - 64px);

        padding:
            25px 11px;
    }


    .auth-wrapper {

        display:
            grid;

        grid-template-columns:
            1fr;

        gap:
            13px;
    }


    .auth-intro {

        min-height:
            0;

        padding:
            27px 21px;

        border-radius:
            20px;
    }


    .auth-intro h1 {

        margin-top:
            13px;

        font-size:
            31px;
    }


    .auth-intro-copy {

        font-size:
            9px;
    }


    .auth-benefits {

        margin-top:
            24px;

        grid-template-columns:
            repeat(3,1fr);

        gap:
            6px;
    }


    .auth-benefit {

        padding:
            10px;

        display:
            block;

        text-align:
            center;
    }


    .auth-benefit-icon {

        margin:
            0 auto 7px;
    }


    .auth-benefit span {

        display:
            none;
    }


    .auth-card {

        border-radius:
            19px;
    }


    .auth-top {

        padding:
            22px 19px 13px;
    }


    .auth-body {

        padding:
            8px 19px 22px;
    }


    .pass-hero-inner {

        min-height:
            auto;

        padding:
            34px 14px;

        grid-template-columns:
            1fr;

        gap:
            24px;
    }


    .pass-user {

        width:
            100%;
    }


    .page {

        padding:
            23px 10px 60px;
    }


    .section-head {

        align-items:
            center;
    }


    .event-head {

        grid-template-columns:
            105px 1fr;

        min-height:
            155px;
    }


    .event-image {

        width:
            105px;

        min-height:
            155px;
    }


    .event-info {

        padding:
            17px 14px;
    }


    .event-info h3 {

        font-size:
            18px;
    }


    .event-action {

        min-height:
            32px;
    }


    .ticket-list {

        grid-template-columns:
            1fr;

        padding:
            12px;
    }


    .footer-content {

        padding:
            25px 15px;

        display:
            grid;

        gap:
            13px;
    }


    .footer-links {

        flex-wrap:
            wrap;

        gap:
            11px;
    }

}


/* ==========================================================
   SMALL MOBILE
========================================================== */

@media(max-width:430px) {

    .nav-events {

        display:
            none;
    }


    .event-head {

        grid-template-columns:
            90px 1fr;
    }


    .event-image {

        width:
            90px;
    }


    .event-meta {

        font-size:
            8px;
    }


    .event-actions {

        gap:
            5px;
    }


    .auth-benefits {

        grid-template-columns:
            1fr;
    }


    .auth-benefit {

        display:
            flex;

        text-align:
            left;
    }


    .auth-benefit-icon {

        margin:
            0;
    }


    .auth-benefit span {

        display:
            block;
    }


    .section-head h2 {

        font-size:
            21px;
    }

}

</style>

</head>


<body>


<!-- ======================================================
     TOAST
====================================================== -->

<div
    class="toast"
    id="toast">
</div>


<!-- ======================================================
     LOADING
====================================================== -->

<div
    class="loading-screen"
    id="loadingScreen">

    <div class="loading-inner">

        <div class="spinner">
        </div>

        <strong>
            Cargando Live Pass
        </strong>

        <span>
            Buscando tus entradas...
        </span>

    </div>

</div>


<!-- ======================================================
     HEADER
====================================================== -->

<header class="topbar">

    <div class="nav">


        <a
            href="index.html"
            class="brand">

            <img
                src="LIVE_TICKETS_BLANCO.png"
                class="brand-logo"
                alt="Live Tickets">

        </a>


        <nav class="nav-links">

            <a href="index.html#eventos">
                Eventos
            </a>

            <a
                href="mis-entradas.html"
                class="active">

                Live Pass

            </a>

            <a href="index.html#como-funciona">
                Cómo funciona
            </a>

        </nav>


        <div class="nav-actions">


            <a
                href="mis-entradas.html"
                class="nav-pass">

                🎟 MIS ENTRADAS

            </a>


            <a
                href="index.html#eventos"
                class="nav-events"
                id="eventsButton">

                VER EVENTOS

            </a>


            <button
                type="button"
                class="nav-events"
                id="logoutButton"
                onclick="logoutLivePass()">

                CERRAR SESIÓN

            </button>


        </div>


    </div>

</header>


<!-- ======================================================
     EMAIL SCREEN
====================================================== -->

<section
    class="auth-section"
    id="emailScreen">


    <div class="auth-wrapper">


        <!-- ==================================================
             INTRO
        =================================================== -->

        <div class="auth-intro">


            <div>

                <div class="auth-intro-badge">

                    LIVE PASS

                </div>


                <h1>

                    Tus entradas.
                    Siempre contigo.

                </h1>


                <p class="auth-intro-copy">

                    Accede a todas tus compras de Live Tickets
                    desde cualquier dispositivo. No necesitas
                    crear una contraseña.

                </p>

            </div>


            <div class="auth-benefits">


                <div class="auth-benefit">

                    <div class="auth-benefit-icon">
                        ✉
                    </div>

                    <div>

                        <strong>
                            Acceso por correo
                        </strong>

                        <span>
                            Recibe un código temporal de seguridad.
                        </span>

                    </div>

                </div>


                <div class="auth-benefit">

                    <div class="auth-benefit-icon">
                        🎟
                    </div>

                    <div>

                        <strong>
                            Todas tus entradas
                        </strong>

                        <span>
                            Tus compras confirmadas en un solo lugar.
                        </span>

                    </div>

                </div>


                <div class="auth-benefit">

                    <div class="auth-benefit-icon">
                        ▦
                    </div>

                    <div>

                        <strong>
                            QR para ingresar
                        </strong>

                        <span>
                            Presenta tu código directamente desde tu teléfono.
                        </span>

                    </div>

                </div>


            </div>


        </div>


        <!-- ==================================================
             LOGIN
        =================================================== -->

        <div class="auth-card">


            <div class="auth-top">


                <div class="auth-badge">

                    ACCESO SEGURO

                </div>


                <h2>

                    Mis Entradas

                </h2>


                <p>

                    Ingresa el correo utilizado al realizar tu compra.

                </p>


            </div>


            <div class="auth-body">


                <label class="form-label">

                    CORREO ELECTRÓNICO

                </label>


                <input
                    type="email"
                    id="emailInput"
                    class="form-input"
                    placeholder="cliente@gmail.com"
                    autocomplete="email"
                    inputmode="email"
                    autocapitalize="none"
                    spellcheck="false">


                <button
                    type="button"
                    class="primary-button"
                    id="requestCodeButton"
                    onclick="requestCode()">

                    ENVIAR CÓDIGO

                </button>


                <div class="auth-help">

                    Te enviaremos un código de 6 números.
                    El código tendrá una duración de 10 minutos.

                </div>


                <div
                    class="auth-error"
                    id="emailError">
                </div>


            </div>


        </div>


    </div>

</section>


<!-- ======================================================
     CODE SCREEN
====================================================== -->

<section
    class="auth-section"
    id="codeScreen">


    <div class="auth-wrapper">


        <!-- ==================================================
             INTRO
        =================================================== -->

        <div class="auth-intro">


            <div>

                <div class="auth-intro-badge">

                    VERIFICACIÓN

                </div>


                <h1>

                    Un paso más.

                </h1>


                <p class="auth-intro-copy">

                    Revisa tu correo e ingresa el código de
                    seguridad que acabamos de enviarte.

                </p>

            </div>


            <div class="auth-benefits">


                <div class="auth-benefit">

                    <div class="auth-benefit-icon">
                        🔒
                    </div>

                    <div>

                        <strong>
                            Código temporal
                        </strong>

                        <span>
                            El acceso solamente funciona durante un tiempo limitado.
                        </span>

                    </div>

                </div>


                <div class="auth-benefit">

                    <div class="auth-benefit-icon">
                        ✓
                    </div>

                    <div>

                        <strong>
                            Verificación de identidad
                        </strong>

                        <span>
                            Tus entradas solamente se muestran después de verificar tu correo.
                        </span>

                    </div>

                </div>


                <div class="auth-benefit">

                    <div class="auth-benefit-icon">
                        🎟
                    </div>

                    <div>

                        <strong>
                            Acceso inmediato
                        </strong>

                        <span>
                            Después de verificar el código verás tus entradas.
                        </span>

                    </div>

                </div>


            </div>


        </div>


        <!-- ==================================================
             CODE CARD
        =================================================== -->

        <div class="auth-card">


            <div class="auth-top">


                <div class="auth-badge">

                    CÓDIGO DE SEGURIDAD

                </div>


                <h2>

                    Revisa tu correo

                </h2>


                <p>

                    Ingresa los 6 números que te enviamos.

                </p>


            </div>


            <div class="auth-body">


                <div
                    class="code-email"
                    id="codeEmailText">
                </div>


                <label class="form-label">

                    CÓDIGO DE SEGURIDAD

                </label>


                <input
                    type="text"
                    id="codeInput"
                    class="form-input code-input"
                    placeholder="000000"
                    inputmode="numeric"
                    autocomplete="one-time-code"
                    maxlength="6">


                <button
                    type="button"
                    class="primary-button"
                    id="verifyCodeButton"
                    onclick="verifyCode()">

                    VER MIS ENTRADAS

                </button>


                <div
                    class="auth-error"
                    id="codeError">
                </div>


                <div class="resend-row">

                    <button
                        type="button"
                        class="text-button"
                        id="resendButton"
                        onclick="resendCode()"
                        disabled>

                        REENVIAR CÓDIGO EN 60s

                    </button>

                </div>


                <div class="resend-row">

                    <button
                        type="button"
                        class="text-button"
                        onclick="changeEmail()">

                        USAR OTRO CORREO

                    </button>

                </div>


            </div>


        </div>


    </div>

</section>


<!-- ======================================================
     LIVE PASS
====================================================== -->

<div
    class="live-pass"
    id="livePass">


<!-- ======================================================
     LIVE PASS HERO
====================================================== -->

<section class="pass-hero">


    <div class="pass-hero-inner">


        <div class="pass-hero-text">


            <div class="pass-eyebrow">

                LIVE PASS

            </div>


            <h1>

                Mis Entradas

            </h1>


            <p>

                Todos tus boletos de Live Tickets en un solo lugar.
                Presenta el QR correspondiente al ingresar.
                Cada código es individual y permite un solo acceso.

            </p>


        </div>


        <div class="pass-user">


            <span class="pass-user-label">

                TITULAR

            </span>


            <strong
                class="pass-user-value"
                id="passName">

                Cliente Live Tickets

            </strong>


            <div class="pass-user-separator">
            </div>


            <span class="pass-user-label">

                CUENTA LIVE PASS

            </span>


            <strong
                class="pass-user-value"
                id="passEmail">

                —

            </strong>


            <div class="pass-stats">


                <div class="pass-stat">

                    <strong id="passReservations">
                        0
                    </strong>

                    <span>
                        COMPRAS
                    </span>

                </div>


                <div class="pass-stat">

                    <strong id="passTickets">
                        0
                    </strong>

                    <span>
                        ENTRADAS
                    </span>

                </div>


            </div>


        </div>


    </div>


</section>


<!-- ======================================================
     PURCHASES
====================================================== -->

<main class="page">


    <div class="section-head">


        <div>

            <h2>
                Tus compras
            </h2>

            <p>
                Aquí aparecen únicamente tus compras confirmadas.
            </p>

        </div>


        <button
            type="button"
            class="refresh-button"
            id="refreshButton"
            onclick="refreshLivePass()">

            ↻ ACTUALIZAR

        </button>


    </div>


    <div
        class="reservations-list"
        id="reservationsList">
    </div>


</main>


<!-- ======================================================
     FOOTER
====================================================== -->

<footer class="footer">


    <div class="footer-content">


        <img
            src="LIVE_TICKETS_BLANCO.png"
            alt="Live Tickets"
            class="footer-logo">


        <div class="footer-links">

            <a href="index.html#eventos">
                Eventos
            </a>

            <a href="mis-entradas.html">
                Mis Entradas
            </a>

            <a href="index.html#como-funciona">
                Cómo funciona
            </a>

        </div>


        <div class="footer-copy">

            © 2026 Live Tickets · Honduras

        </div>


    </div>


</footer>


</div>


<script>

/* ==========================================================
   STATE
========================================================== */

let activeEmail =
    "";


let resendTimer =
    null;


let resendSeconds =
    0;


let livePassData =
    null;


const generatedQR =
    new Set();


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


/* ==========================================================
   VALID EMAIL
========================================================== */

function validEmail(value) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            String(
                value || ""
            )
            .trim()
        );

}


/* ==========================================================
   MONEY
========================================================== */

function money(value) {

    return "L " +

        Number(
            value || 0
        )
        .toLocaleString(
            "es-HN",
            {
                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2
            }
        );

}


/* ==========================================================
   DATE
========================================================== */

function formatDate(value) {

    if (!value) {

        return "Fecha por confirmar";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Fecha por confirmar";

    }


    return new Intl.DateTimeFormat(
        "es-HN",
        {
            weekday:
                "long",

            day:
                "2-digit",

            month:
                "long",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit",

            timeZone:
                "America/Tegucigalpa"
        }
    )
    .format(
        date
    );

}


/* ==========================================================
   SHORT DATE
========================================================== */

function formatShortDate(value) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return new Intl.DateTimeFormat(
        "es-HN",
        {
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            timeZone:
                "America/Tegucigalpa"
        }
    )
    .format(
        date
    );

}


/* ==========================================================
   SAFE JSON RESPONSE

   Evita mensajes como:
   Unexpected token...
   cuando un servidor devuelve HTML o texto.
========================================================== */

async function readJSONResponse(response) {

    const text =
        await response.text();


    if (!text) {

        return {};

    }


    try {

        return JSON.parse(
            text
        );

    }

    catch(error) {


        console.error(
            "Respuesta no JSON:",
            text
        );


        throw new Error(

            response.ok

            ?

            "El servidor devolvió una respuesta no válida."

            :

            "No fue posible completar la solicitud. Intenta nuevamente."

        );

    }

}


/* ==========================================================
   TOAST
========================================================== */

function showToast(
    message,
    type = ""
) {

    const toast =
        document
        .getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.className =
        `toast show ${type}`;


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(
            () => {

                toast.className =
                    "toast";

            },
            4500
        );

}


/* ==========================================================
   ERROR
========================================================== */

function showError(
    elementId,
    message
) {

    const element =
        document
        .getElementById(
            elementId
        );


    element.textContent =
        message;


    element.classList.add(
        "show"
    );

}


/* ==========================================================
   CLEAR ERROR
========================================================== */

function clearError(
    elementId
) {

    const element =
        document
        .getElementById(
            elementId
        );


    element.textContent =
        "";


    element.classList.remove(
        "show"
    );

}


/* ==========================================================
   SCREENS
========================================================== */

function hideAllScreens() {

    document
        .getElementById(
            "emailScreen"
        )
        .classList
        .remove(
            "show"
        );


    document
        .getElementById(
            "codeScreen"
        )
        .classList
        .remove(
            "show"
        );


    document
        .getElementById(
            "livePass"
        )
        .classList
        .remove(
            "show"
        );

}


/* ==========================================================
   EMAIL SCREEN
========================================================== */

function showEmailScreen() {

    hideAllScreens();


    document
        .getElementById(
            "logoutButton"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "eventsButton"
        )
        .style.display =
        "inline-flex";


    document
        .getElementById(
            "emailScreen"
        )
        .classList
        .add(
            "show"
        );


    setTimeout(
        () => {

            document
                .getElementById(
                    "emailInput"
                )
                .focus();

        },
        100
    );

}


/* ==========================================================
   CODE SCREEN
========================================================== */

function showCodeScreen() {

    hideAllScreens();


    document
        .getElementById(
            "logoutButton"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "eventsButton"
        )
        .style.display =
        "inline-flex";


    document
        .getElementById(
            "codeScreen"
        )
        .classList
        .add(
            "show"
        );


    document
        .getElementById(
            "codeEmailText"
        )
        .textContent =

        `Enviamos el código a ${activeEmail}`;


    document
        .getElementById(
            "codeInput"
        )
        .value =
        "";


    setTimeout(
        () => {

            document
                .getElementById(
                    "codeInput"
                )
                .focus();

        },
        100
    );

}


/* ==========================================================
   LIVE PASS SCREEN
========================================================== */

function showLivePass() {

    hideAllScreens();


    document
        .getElementById(
            "eventsButton"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "logoutButton"
        )
        .style.display =
        "inline-flex";


    document
        .getElementById(
            "livePass"
        )
        .classList
        .add(
            "show"
        );

}


/* ==========================================================
   REQUEST CODE
========================================================== */

async function requestCode() {

    clearError(
        "emailError"
    );


    const input =
        document
        .getElementById(
            "emailInput"
        );


    const email =
        input
        .value
        .trim()
        .toLowerCase();


    if (
        !validEmail(
            email
        )
    ) {

        showError(
            "emailError",
            "Ingresa un correo electrónico válido."
        );

        return;

    }


    const button =
        document
        .getElementById(
            "requestCodeButton"
        );


    button.disabled =
        true;


    button.textContent =
        "ENVIANDO...";


    try {


        const response =
            await fetch(
                "/api/solicitar-codigo",
                {

                    method:
                        "POST",

                    credentials:
                        "same-origin",

                    headers:
                        {
                            "Content-Type":
                                "application/json"
                        },

                    body:
                        JSON.stringify(
                            {
                                email:
                                    email
                            }
                        )

                }
            );


        const result =
            await readJSONResponse(
                response
            );


        if (
            !response.ok
            ||
            result.success !== true
        ) {

            throw new Error(
                result.message
                ||
                "No fue posible enviar el código."
            );

        }


        activeEmail =
            email;


        showCodeScreen();


        startResendCountdown(
            Number(
                result.resend_in
                ||
                60
            )
        );


    }

    catch(error) {


        console.error(
            "requestCode:",
            error
        );


        showError(
            "emailError",
            error.message
            ||
            "No fue posible enviar el código."
        );


    }

    finally {


        button.disabled =
            false;


        button.textContent =
            "ENVIAR CÓDIGO";

    }

}


/* ==========================================================
   VERIFY CODE
========================================================== */

async function verifyCode() {

    clearError(
        "codeError"
    );


    const code =
        document
        .getElementById(
            "codeInput"
        )
        .value
        .replace(
            /\D/g,
            ""
        );


    if (
        code.length !==
        6
    ) {

        showError(
            "codeError",
            "Ingresa los 6 números del código."
        );

        return;

    }


    const button =
        document
        .getElementById(
            "verifyCodeButton"
        );


    button.disabled =
        true;


    button.textContent =
        "VERIFICANDO...";


    try {


        const response =
            await fetch(
                "/api/verificar-codigo",
                {

                    method:
                        "POST",

                    credentials:
                        "same-origin",

                    headers:
                        {
                            "Content-Type":
                                "application/json"
                        },

                    body:
                        JSON.stringify(
                            {

                                email:
                                    activeEmail,

                                codigo:
                                    code

                            }
                        )

                }
            );


        const result =
            await readJSONResponse(
                response
            );


        if (
            !response.ok
            ||
            result.success !== true
        ) {

            throw new Error(
                result.message
                ||
                "Código incorrecto."
            );

        }


        showToast(
            "✓ Identidad verificada correctamente."
        );


        const loaded =
            await loadLivePass();


        if (!loaded) {

            throw new Error(
                "No fue posible cargar tus entradas."
            );

        }


    }

    catch(error) {


        console.error(
            "verifyCode:",
            error
        );


        showError(
            "codeError",
            error.message
            ||
            "No fue posible verificar el código."
        );


    }

    finally {


        button.disabled =
            false;


        button.textContent =
            "VER MIS ENTRADAS";

    }

}


/* ==========================================================
   RESEND CODE
========================================================== */

async function resendCode() {

    if (
        resendSeconds >
        0
    ) {

        return;

    }


    const button =
        document
        .getElementById(
            "resendButton"
        );


    button.disabled =
        true;


    button.textContent =
        "REENVIANDO...";


    try {


        const response =
            await fetch(
                "/api/solicitar-codigo",
                {

                    method:
                        "POST",

                    credentials:
                        "same-origin",

                    headers:
                        {
                            "Content-Type":
                                "application/json"
                        },

                    body:
                        JSON.stringify(
                            {
                                email:
                                    activeEmail
                            }
                        )

                }
            );


        const result =
            await readJSONResponse(
                response
            );


        if (
            !response.ok
            ||
            result.success !== true
        ) {

            throw new Error(
                result.message
                ||
                "No fue posible reenviar el código."
            );

        }


        document
            .getElementById(
                "codeInput"
            )
            .value =
            "";


        clearError(
            "codeError"
        );


        showToast(
            "Código enviado nuevamente."
        );


        startResendCountdown(
            Number(
                result.resend_in
                ||
                60
            )
        );


    }

    catch(error) {


        console.error(
            "resendCode:",
            error
        );


        showError(
            "codeError",
            error.message
            ||
            "No fue posible reenviar el código."
        );


        button.disabled =
            false;


        button.textContent =
            "REENVIAR CÓDIGO";

    }

}


/* ==========================================================
   RESEND COUNTDOWN
========================================================== */

function startResendCountdown(seconds) {

    clearInterval(
        resendTimer
    );


    resendSeconds =
        Math.max(
            0,
            Number(
                seconds
                ||
                60
            )
        );


    const button =
        document
        .getElementById(
            "resendButton"
        );


    function render() {


        if (
            resendSeconds <=
            0
        ) {

            button.disabled =
                false;


            button.textContent =
                "REENVIAR CÓDIGO";


            clearInterval(
                resendTimer
            );


            return;

        }


        button.disabled =
            true;


        button.textContent =

            `REENVIAR CÓDIGO EN ${resendSeconds}s`;


        resendSeconds--;

    }


    render();


    resendTimer =
        setInterval(
            render,
            1000
        );

}


/* ==========================================================
   CHANGE EMAIL
========================================================== */

function changeEmail() {

    clearInterval(
        resendTimer
    );


    activeEmail =
        "";


    document
        .getElementById(
            "codeInput"
        )
        .value =
        "";


    clearError(
        "codeError"
    );


    showEmailScreen();

}


/* ==========================================================
   LOAD LIVE PASS
========================================================== */

async function loadLivePass() {

    try {


        const response =
            await fetch(
                "/api/mis-entradas",
                {

                    method:
                        "GET",

                    credentials:
                        "same-origin",

                    cache:
                        "no-store"

                }
            );


        if (
            response.status ===
            401
        ) {

            livePassData =
                null;


            showEmailScreen();


            return false;

        }


        const result =
            await readJSONResponse(
                response
            );


        if (
            !response.ok
            ||
            result.success !== true
        ) {

            throw new Error(
                result.message
                ||
                "No fue posible cargar tus entradas."
            );

        }


        livePassData =
            result;


        generatedQR.clear();


        renderLivePass();


        showLivePass();


        return true;


    }

    catch(error) {


        console.error(
            "loadLivePass:",
            error
        );


        showToast(
            error.message
            ||
            "No fue posible cargar tus entradas.",
            "error"
        );


        return false;

    }

}


/* ==========================================================
   REFRESH LIVE PASS
========================================================== */

async function refreshLivePass() {

    const button =
        document
        .getElementById(
            "refreshButton"
        );


    button.disabled =
        true;


    button.textContent =
        "ACTUALIZANDO...";


    try {


        const success =
            await loadLivePass();


        if (success) {

            showToast(
                "✓ Tus entradas están actualizadas."
            );

        }


    }

    finally {


        button.disabled =
            false;


        button.textContent =
            "↻ ACTUALIZAR";

    }

}


/* ==========================================================
   RENDER LIVE PASS
========================================================== */

function renderLivePass() {

    if (!livePassData) {

        return;

    }


    const reservations =
        livePassData.reservas
        ||
        [];


    const ticketCount =
        reservations
        .reduce(
            (
                total,
                reservation
            ) => {

                return (
                    total
                    +
                    (
                        reservation.boletos
                        ||
                        []
                    )
                    .length
                );

            },
            0
        );


    document
        .getElementById(
            "passName"
        )
        .textContent =

        livePassData.nombre
        ||
        "Cliente Live Tickets";


    document
        .getElementById(
            "passEmail"
        )
        .textContent =

        livePassData.email
        ||
        "—";


    document
        .getElementById(
            "passReservations"
        )
        .textContent =

        Number(
            livePassData.cantidad_reservas
            ??
            reservations.length
        );


    document
        .getElementById(
            "passTickets"
        )
        .textContent =

        Number(
            livePassData.cantidad_boletos
            ??
            ticketCount
        );


    const list =
        document
        .getElementById(
            "reservationsList"
        );


    if (
        !reservations.length
    ) {

        list.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">

                    🎟

                </div>

                <h3>

                    Todavía no encontramos entradas

                </h3>

                <p>

                    Cuando realices una compra confirmada
                    utilizando este correo electrónico,
                    tus entradas aparecerán automáticamente aquí.

                </p>

                <a
                    href="index.html#eventos"
                    class="empty-button">

                    VER EVENTOS

                </a>

            </div>

        `;


        return;

    }


    list.innerHTML =
        reservations
        .map(
            (
                reservation,
                reservationIndex
            ) => {


                const event =
                    reservation.evento
                    ||
                    {};


                const image =
                    event.flyer_url
                    ||
                    "FLYER%201080X1350.png";


                const tickets =
                    reservation.boletos
                    ||
                    [];


                const ticketsHTML =
                    tickets
                    .map(
                        (
                            ticket,
                            ticketIndex
                        ) => {


                            const uniqueId =
                                `qr-${reservation.id}-${ticket.id}-${ticketIndex}`;


                            const used =
                                ticket.utilizado ===
                                true;


                            const safeToken =
                                String(
                                    ticket.token
                                    ||
                                    ""
                                );


                            return `

                                <div class="ticket ${used ? "used" : ""}">


                                    <div class="ticket-top">


                                        <div class="ticket-name">

                                            ENTRADA ${ticketIndex + 1}

                                        </div>


                                        <div
                                            class="ticket-status ${used ? "used" : ""}">

                                            ${
                                                used
                                                ?
                                                "UTILIZADA"
                                                :
                                                "VÁLIDA"
                                            }

                                        </div>


                                    </div>


                                    <div class="ticket-seat">


                                        <div class="ticket-seat-box">

                                            <small>
                                                MESA
                                            </small>

                                            <strong>

                                                ${escapeHTML(
                                                    ticket.mesa
                                                    ??
                                                    "—"
                                                )}

                                            </strong>

                                        </div>


                                        <div class="ticket-seat-box">

                                            <small>
                                                ASIENTO
                                            </small>

                                            <strong>

                                                ${escapeHTML(
                                                    ticket.asiento
                                                    ??
                                                    "—"
                                                )}

                                            </strong>

                                        </div>


                                    </div>


                                    ${
                                        used

                                        ?

                                        `

                                            <div class="ticket-used-message">

                                                ✓ Esta entrada ya fue utilizada

                                                ${
                                                    ticket.fecha_ingreso
                                                    ?

                                                    `<br>${escapeHTML(
                                                        formatDate(
                                                            ticket.fecha_ingreso
                                                        )
                                                    )}`

                                                    :

                                                    ""
                                                }

                                            </div>

                                        `

                                        :

                                        `

                                            <button
                                                type="button"
                                                class="ticket-button"
                                                id="button-${uniqueId}"
                                                data-qr-id="${uniqueId}"
                                                data-token="${escapeHTML(safeToken)}"
                                                onclick="toggleQRFromButton(this)">

                                                MOSTRAR QR

                                            </button>


                                            <div
                                                class="qr-panel"
                                                id="panel-${uniqueId}">


                                                <div class="qr-title">

                                                    CÓDIGO DE ACCESO

                                                </div>


                                                <div
                                                    class="qr-container"
                                                    id="${uniqueId}">
                                                </div>


                                                <div class="qr-warning">

                                                    🔒 No compartas este código QR.
                                                    Cada entrada permite un solo ingreso
                                                    y la primera validación será la válida.

                                                </div>


                                            </div>

                                        `
                                    }


                                </div>

                            `;

                        }
                    )
                    .join("");


                return `

                    <article class="reservation-card">


                        <div class="event-head">


                            <img
                                class="event-image"
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(
                                    event.nombre
                                    ||
                                    "Evento"
                                )}"
                                onerror="this.src='FLYER%201080X1350.png'">


                            <div class="event-info">


                                <small>

                                    ✓ COMPRA CONFIRMADA

                                </small>


                                <h3>

                                    ${escapeHTML(
                                        event.nombre
                                        ||
                                        "Evento"
                                    )}

                                </h3>


                                <div class="event-meta">


                                    <div>

                                        📅
                                        ${escapeHTML(
                                            formatDate(
                                                event.fecha
                                            )
                                        )}

                                    </div>


                                    <div>

                                        📍
                                        ${escapeHTML(
                                            event.lugar
                                            ||
                                            "Lugar por confirmar"
                                        )}

                                    </div>


                                </div>


                                <div class="event-actions">


                                    <button
                                        type="button"
                                        class="event-action"
                                        onclick="addToCalendar(${reservationIndex})">

                                        + CALENDARIO

                                    </button>


                                    ${
                                        event.lugar

                                        ?

                                        `

                                            <button
                                                type="button"
                                                class="event-action"
                                                onclick="openLocation(${reservationIndex})">

                                                CÓMO LLEGAR

                                            </button>

                                        `

                                        :

                                        ""
                                    }


                                </div>


                            </div>


                        </div>


                        <div class="order-summary">


                            <div class="order-summary-left">


                                <div class="order-info">

                                    <small>
                                        RESERVA
                                    </small>

                                    <strong>

                                        ${escapeHTML(
                                            reservation.codigo
                                            ||
                                            "—"
                                        )}

                                    </strong>

                                </div>


                                <div class="order-info">

                                    <small>
                                        ENTRADAS
                                    </small>

                                    <strong>

                                        ${tickets.length}

                                    </strong>

                                </div>


                                <div class="order-info">

                                    <small>
                                        COMPRA
                                    </small>

                                    <strong>

                                        ${escapeHTML(
                                            formatShortDate(
                                                reservation.paid_at
                                            )
                                        )}

                                    </strong>

                                </div>


                            </div>


                            <div class="order-total">

                                ${money(
                                    reservation.total_reserva
                                )}

                            </div>


                        </div>


                        <div class="ticket-list">

                            ${ticketsHTML}

                        </div>


                    </article>

                `;

            }
        )
        .join("");

}


/* ==========================================================
   QR BUTTON
========================================================== */

function toggleQRFromButton(button) {

    const id =
        button.dataset.qrId;


    const token =
        button.dataset.token;


    toggleQR(
        id,
        token
    );

}


/* ==========================================================
   QR
========================================================== */

function toggleQR(
    id,
    token
) {

    const panel =
        document
        .getElementById(
            `panel-${id}`
        );


    const button =
        document
        .getElementById(
            `button-${id}`
        );


    if (
        !panel
        ||
        !token
    ) {

        return;

    }


    const showing =
        panel.classList
        .contains(
            "show"
        );


    if (showing) {


        panel.classList
            .remove(
                "show"
            );


        if (button) {

            button.textContent =
                "MOSTRAR QR";

        }


        return;

    }


    panel.classList
        .add(
            "show"
        );


    if (button) {

        button.textContent =
            "OCULTAR QR";

    }


    if (
        !generatedQR.has(
            id
        )
    ) {


        const target =
            document
            .getElementById(
                id
            );


        if (!target) {

            return;

        }


        target.innerHTML =
            "";


        new QRCode(
            target,
            {

                text:
                    String(
                        token
                    ),

                width:
                    220,

                height:
                    220,

                correctLevel:
                    QRCode.CorrectLevel.H

            }
        );


        generatedQR.add(
            id
        );

    }

}


/* ==========================================================
   MAPS
========================================================== */

function openLocation(
    reservationIndex
) {

    const reservation =
        livePassData?.reservas
        ?.[reservationIndex];


    const place =
        reservation?.evento?.lugar;


    if (!place) {

        return;

    }


    const url =

        "https://www.google.com/maps/search/?api=1&query="

        +

        encodeURIComponent(
            place
        );


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* ==========================================================
   ICS ESCAPE
========================================================== */

function escapeICS(value) {

    return String(
        value
        ||
        ""
    )
    .replaceAll("\\", "\\\\")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;")
    .replaceAll("\n", "\\n");

}


/* ==========================================================
   ICS DATE
========================================================== */

function formatICSDate(date) {

    const pad =
        value =>
            String(
                value
            )
            .padStart(
                2,
                "0"
            );


    return (

        date.getUTCFullYear()

        +

        pad(
            date.getUTCMonth()
            +
            1
        )

        +

        pad(
            date.getUTCDate()
        )

        +

        "T"

        +

        pad(
            date.getUTCHours()
        )

        +

        pad(
            date.getUTCMinutes()
        )

        +

        pad(
            date.getUTCSeconds()
        )

        +

        "Z"

    );

}


/* ==========================================================
   CALENDAR
========================================================== */

function addToCalendar(
    reservationIndex
) {

    const reservation =
        livePassData?.reservas
        ?.[reservationIndex];


    const event =
        reservation?.evento;


    if (
        !event?.fecha
    ) {

        showToast(
            "Este evento todavía no tiene fecha confirmada.",
            "error"
        );

        return;

    }


    const start =
        new Date(
            event.fecha
        );


    if (
        Number.isNaN(
            start.getTime()
        )
    ) {

        showToast(
            "La fecha del evento no es válida.",
            "error"
        );

        return;

    }


    /*
    Duración estimada:
    4 horas.
    */

    const end =
        new Date(
            start.getTime()
            +
            4
            *
            60
            *
            60
            *
            1000
        );


    const now =
        new Date();


    const content =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Live Tickets Honduras//Live Pass//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}-${reservation.id}@liveticketshn.com
DTSTAMP:${formatICSDate(now)}
DTSTART:${formatICSDate(start)}
DTEND:${formatICSDate(end)}
SUMMARY:${escapeICS(event.nombre)}
LOCATION:${escapeICS(event.lugar)}
DESCRIPTION:${escapeICS("Evento adquirido mediante Live Tickets. Reserva " + reservation.codigo)}
END:VEVENT
END:VCALENDAR`;


    const blob =
        new Blob(
            [
                content
            ],
            {
                type:
                    "text/calendar;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `live-tickets-${reservation.codigo}.ics`;


    document.body
        .appendChild(
            link
        );


    link.click();


    link.remove();


    setTimeout(
        () => {

            URL.revokeObjectURL(
                url
            );

        },
        1500
    );

}


/* ==========================================================
   LOGOUT
========================================================== */

async function logoutLivePass() {

    const button =
        document
        .getElementById(
            "logoutButton"
        );


    button.disabled =
        true;


    try {


        const response =
            await fetch(
                "/api/cerrar-sesion-cliente",
                {

                    method:
                        "POST",

                    credentials:
                        "same-origin"

                }
            );


        /*
        Intentamos leer la respuesta,
        pero no bloqueamos el logout si falla.
        */

        try {

            await readJSONResponse(
                response
            );

        }

        catch(error) {

            console.warn(
                "Respuesta logout:",
                error
            );

        }


    }

    catch(error) {


        console.warn(
            "logoutLivePass:",
            error
        );

    }


    livePassData =
        null;


    activeEmail =
        "";


    generatedQR.clear();


    clearInterval(
        resendTimer
    );


    document
        .getElementById(
            "emailInput"
        )
        .value =
        "";


    document
        .getElementById(
            "codeInput"
        )
        .value =
        "";


    showEmailScreen();


    showToast(
        "Sesión cerrada correctamente."
    );


    button.disabled =
        false;

}


/* ==========================================================
   CODE INPUT
========================================================== */

document
    .getElementById(
        "codeInput"
    )
    .addEventListener(
        "input",
        function() {


            this.value =
                this.value
                .replace(
                    /\D/g,
                    ""
                )
                .slice(
                    0,
                    6
                );


            clearError(
                "codeError"
            );

        }
    );


/* ==========================================================
   EMAIL INPUT
========================================================== */

document
    .getElementById(
        "emailInput"
    )
    .addEventListener(
        "input",
        () => {

            clearError(
                "emailError"
            );

        }
    );


/* ==========================================================
   ENTER
========================================================== */

document.addEventListener(
    "keydown",
    event => {


        if (
            event.key !==
            "Enter"
        ) {

            return;

        }


        if (
            document
            .getElementById(
                "emailScreen"
            )
            .classList
            .contains(
                "show"
            )
        ) {

            requestCode();

            return;

        }


        if (
            document
            .getElementById(
                "codeScreen"
            )
            .classList
            .contains(
                "show"
            )
        ) {

            verifyCode();

        }

    }
);


/* ==========================================================
   INITIALIZE
========================================================== */

async function initialize() {

    try {


        const authenticated =
            await loadLivePass();


        if (!authenticated) {

            showEmailScreen();

        }


    }

    catch(error) {


        console.error(
            "initialize:",
            error
        );


        showEmailScreen();


    }

    finally {


        document
            .getElementById(
                "loadingScreen"
            )
            .classList
            .add(
                "hide"
            );

    }

}


initialize();

</script>


</body>

</html>
