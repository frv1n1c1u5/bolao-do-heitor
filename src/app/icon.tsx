import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, rgb(15, 118, 110), rgb(8, 47, 73) 70%)",
          color: "white",
          fontSize: 180,
          fontWeight: 800,
          borderRadius: 96,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 30,
            borderRadius: 84,
            border: "12px solid rgba(255,255,255,0.12)",
          }}
        />
        H
      </div>
    ),
    size,
  );
}
