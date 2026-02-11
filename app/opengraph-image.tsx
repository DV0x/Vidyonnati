import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Vidyonnati Foundation — Scholarships for Meritorious Students"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 40%, #fff7ed 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(90deg, #ea580c, #f97316, #ea580c)",
          }}
        />

        {/* Decorative circle */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(249, 115, 22, 0.08)",
          }}
        />

        {/* Logo icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            background: "#ea580c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
            <path d="M22 10v6" />
            <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: "800",
            color: "#111827",
            textAlign: "center",
            lineHeight: 1.1,
            display: "flex",
            gap: "16px",
          }}
        >
          <span>Vidyonnati</span>
          <span style={{ color: "#ea580c" }}>Foundation</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "24px",
            color: "#6b7280",
            textAlign: "center",
            marginTop: "16px",
            maxWidth: "800px",
          }}
        >
          Scholarships for Meritorious Students from Government High Schools in Rural Andhra Pradesh
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "40px",
            padding: "20px 48px",
            background: "white",
            borderRadius: "16px",
            border: "1px solid #fed7aa",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "36px", fontWeight: "800", color: "#ea580c" }}>69</span>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>Students Supported</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "36px", fontWeight: "800", color: "#ea580c" }}>Rs. 13.1L</span>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>Disbursed</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "36px", fontWeight: "800", color: "#ea580c" }}>4</span>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>Years</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "36px", fontWeight: "800", color: "#ea580c" }}>3</span>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>Mandals</span>
          </div>
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            fontSize: "16px",
            color: "#9ca3af",
          }}
        >
          vidyonnatifoundation.org
        </div>
      </div>
    ),
    { ...size }
  )
}
