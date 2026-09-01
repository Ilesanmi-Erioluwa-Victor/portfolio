"use client";
import { useEffect, useRef } from "react";

const ART_DIR = "images/";

const WORKS = [
    {
        x: 0, y: 0, w: 450, h: 500, n: "01", name: "AbS Technologies",
        label: "Website", bg: "#1a1a2e", stroke: false, dark: true, block: true,
        file: "AbS.png",
        desc: "AI-powered learning platform for students — built React frontends and Node.js backends serving 12K+ users with study engine, exam prep, and scholarship discovery.",
        link: "View Live Site", href: "https://www.abstechconnect.com/"
    },
    {
        x: 470, y: 0, w: 450, h: 500, n: "02", name: "HelloBob",
        label: "Website", bg: "#0d1117", stroke: false, dark: true, block: true,
        file: "HelloBob.png",
        desc: "Crypto wallet and web dashboard — built React interfaces for wallet balances, deposit/withdrawal flows, KYC onboarding, and P2P trade management.",
        link: "View Live Site", href: "https://hellobob.app/"
    },
    {
        x: 940, y: 0, w: 450, h: 500, n: "03", name: "digiYo",
        label: "Website", bg: "#0f172a", stroke: false, dark: true, block: true,
        file: "Digiyo.png",
        desc: "Sports social network — built responsive React and TypeScript components with real-time WebSocket updates for chat, challenges, and live feeds.",
        link: "View Live Site", href: "https://www.digiyo.com/"
    },
];

const GRID_W = 1390;

const ArrowSvg = () => (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M4.5 3.32516L8.4577 3.54232L8.6748 7.5M8.25 3.75L3.25 8.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default function WorksGrid() {
    const gridRef = useRef(null);

    useEffect(() => {
        if (typeof window === "undefined" || !gridRef.current) return;
        const grid = gridRef.current;

        function metrics() {
            const w = grid.clientWidth || 1390;
            const mobile = window.innerWidth <= 640;
            const cols = mobile ? 1 : 3;
            const gutter = mobile ? 10 : 20;
            const cardW = (w - gutter * (cols - 1)) / cols;
            return { cardW, gutter, cols, k: cardW / 450 };
        }

        function layout() {
            const { cardW, gutter, cols: colCount, k } = metrics();
            grid.style.setProperty("--k", k);

            const tiles = grid.querySelectorAll(".tile");
            const cols = new Array(colCount).fill(0);
            let deepest = 0;

            tiles.forEach((tile, i) => {
                const w = WORKS[i];
                if (!w) return;
                const c = colCount === 1 ? 0 : [0, 470, 940].indexOf(w.x);
                const y = cols[c];
                cols[c] = y + w.h * k + gutter;

                tile.style.left = c * (cardW + gutter) + "px";
                tile.style.top = y + "px";
                tile.style.width = cardW + "px";
                tile.style.height = w.h * k + "px";
                deepest = Math.max(deepest, y + w.h * k);
            });

            grid.style.height = deepest + "px";
        }

        layout();
        addEventListener("resize", layout);
        requestAnimationFrame(() => grid.classList.add("settled"));

        return () => {
            removeEventListener("resize", layout);
            grid.classList.remove("settled");
            grid.style.height = "";
        };
    }, []);

    return (
        <section className="works" id="works">
            <div className="works-head">
                <span>My Works</span>
            </div>
            <div className="works-grid settled" ref={gridRef} id="worksGrid">
                {WORKS.map((w, i) => (
                    <div
                        key={i}
                        className={"tile" + (w.dark ? " on-dark" : "")}
                        style={{
                            border: w.stroke === false ? "none" : "0.6px solid #e4e4e4",
                        }}
                    >
                        <img
                            className="tile-art"
                            src={ART_DIR + w.file}
                            alt={w.name}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => e.target.remove()}
                        />
                        {w.block !== undefined ? (
                            <div className="tile-block">
                                <div className="tile-cap">
                                    <div className="tile-id">
                                        <span className="tile-num">{w.n}</span>
                                        <span className="tile-name">{w.name}</span>
                                    </div>
                                    <span className="tile-label">{w.label}</span>
                                </div>
                                <p className="tile-desc">{w.desc}</p>
                                <a className="tile-link" href={w.href} target="_blank" rel="noopener noreferrer" aria-label={`${w.name} — view live site`}>
                                    {w.link}<ArrowSvg />
                                </a>
                            </div>
                        ) : (
                            <div className={"tile-cap fixed " + w.cap}>
                                <div className="tile-id">
                                    <span className="tile-num">{w.n}</span>
                                    <span className="tile-name">{w.name}</span>
                                </div>
                                <span className="tile-label">{w.label}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}