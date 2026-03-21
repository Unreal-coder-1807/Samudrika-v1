import SignInCard from "../components/auth/SignInCard";
import SphereBackground from "../components/auth/SphereBackground";
import "../styles/auth.css";

export const SignInPage = () => (
  <div
    style={{
      minHeight: "100vh",
      background: "#16162A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      fontFamily: "Inter, system-ui, sans-serif",
    }}
  >
    <SphereBackground />
    <SignInCard />
  </div>
);
