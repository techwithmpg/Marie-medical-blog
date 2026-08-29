import { ImageResponse } from "next/og";
import { SOCIAL_FALLBACK_ALT } from "@/lib/site-url";

export const alt = SOCIAL_FALLBACK_ALT;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "#F6F1E8",
        color: "#242321",
        display: "flex",
        height: "100%",
        padding: "42px",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "#7B3F35",
          display: "flex",
          width: "12px",
        }}
      />
      <div
        style={{
          background: "#FFFDF9",
          borderBottom: "1px solid #5E5953",
          borderRight: "1px solid #5E5953",
          borderTop: "8px solid #3F5E52",
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "46px 54px 42px",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              color: "#7B3F35",
              display: "flex",
              fontFamily: "serif",
              fontSize: 25,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Evidence Folio
          </div>
          <div
            style={{
              color: "#5E5953",
              display: "flex",
              fontFamily: "sans-serif",
              fontSize: 17,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Folio 01 · Publication
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "850px",
          }}
        >
          <div
            style={{
              color: "#242321",
              display: "flex",
              fontFamily: "serif",
              fontSize: 78,
              letterSpacing: "-0.035em",
              lineHeight: 1,
            }}
          >
            Marie Medere
          </div>
          <div
            style={{
              background: "#7B3F35",
              display: "flex",
              height: "4px",
              marginBottom: "22px",
              marginTop: "26px",
              width: "110px",
            }}
          />
          <div
            style={{
              color: "#5E5953",
              display: "flex",
              fontFamily: "sans-serif",
              fontSize: 31,
              lineHeight: 1.28,
            }}
          >
            Medical Writing Portfolio &amp; Educational Blog
          </div>
        </div>

        <div
          style={{
            alignItems: "center",
            borderTop: "1px solid #3F5E52",
            color: "#3F5E52",
            display: "flex",
            fontFamily: "sans-serif",
            fontSize: 17,
            justifyContent: "space-between",
            letterSpacing: "0.12em",
            paddingTop: "18px",
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex" }}>Reference ledger</div>
          <div style={{ display: "flex" }}>
            Writing · Portfolio · Publication
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
