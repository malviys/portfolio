import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sourabh Malviya — Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #111111 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "0 80px",
        }}
      >
        {/* Accent dot */}
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#5227FF",
            marginBottom: 8,
          }}
        />

        <p
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            margin: 0,
            letterSpacing: "-2px",
            lineHeight: 1.1,
          }}
        >
          Sourabh Malviya
        </p>

        <p
          style={{
            fontSize: 30,
            color: "#5227FF",
            margin: 0,
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
        >
          Senior Software Engineer
        </p>

        <p
          style={{
            fontSize: 20,
            color: "#888888",
            margin: 0,
            marginTop: 8,
          }}
        >
          malviys.com
        </p>
      </div>
    ),
    { ...size },
  );
}
