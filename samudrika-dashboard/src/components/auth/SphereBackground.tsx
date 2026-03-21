export default function SphereBackground() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-70px",
          left: "-50px",
          width: "240px",
          height: "240px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, #F06AFB 0%, #A020F0 40%, #5A0ABE 70%, #2D0060 100%)",
          boxShadow:
            "inset -24px -24px 50px rgba(0,0,0,0.55), inset 12px 12px 35px rgba(255,255,255,0.18), 0 0 80px rgba(200,50,255,0.25)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "60px",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 38% 32%, #707070 0%, #383838 45%, #141414 100%)",
          boxShadow:
            "inset -14px -14px 35px rgba(0,0,0,0.75), inset 8px 8px 22px rgba(255,255,255,0.07), 0 0 40px rgba(0,0,0,0.6)",
        }}
      />
    </div>
  );
}
