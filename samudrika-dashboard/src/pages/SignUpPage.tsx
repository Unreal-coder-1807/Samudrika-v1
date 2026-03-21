import SignUpCard from "../components/auth/SignUpCard";
import SphereBackground from "../components/auth/SphereBackground";
import "../styles/auth.css";

export const SignUpPage = () => (
  <div
    style={{
      minHeight: "100vh",
      background: "#16162A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <SphereBackground />
    <SignUpCard />
  </div>
);
