import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

// Preview image for LinkedIn, WhatsApp, Slack, X etc. Rendered once at build time.
export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const portrait = await readFile(join(process.cwd(), "public/images/simon-portrait.jpg"));
  const portraitSrc = `data:image/jpeg;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: "0 88px",
          background: "linear-gradient(135deg, #161a21 0%, #1d2430 100%)",
          color: "#e9ecf2",
          fontFamily: "sans-serif"
        }}
      >
        <img src={portraitSrc} width={330} height={300} style={{ borderRadius: 36, objectFit: "cover" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 30, letterSpacing: 4, textTransform: "uppercase", color: "#8b94a3" }}>Portfolio</div>
          <div style={{ fontSize: 84, lineHeight: 1, fontWeight: 600 }}>Simon Schnetzer</div>
          <div style={{ fontSize: 38, color: "#c3c9d4" }}>Frontend Developer · Salzburg</div>
          <div style={{ fontSize: 28, color: "#8b94a3", marginTop: 6 }}>React · Next.js · TypeScript · AI interfaces</div>
        </div>
      </div>
    ),
    size
  );
}
