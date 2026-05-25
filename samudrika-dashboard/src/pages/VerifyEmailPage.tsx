import { useSignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const VerifyEmailPage = () => {
  const { signUp, isLoaded, setActive } = useSignUp();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/dashboard");
      }
    } catch {
      setError("Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1C1C1E] p-6">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-sm rounded-xl border border-white/10 bg-[#2A2A2E] p-6 text-white"
      >
        <h1 className="text-xl font-bold">Verify your email</h1>
        <p className="mt-2 text-sm text-white/60">Enter the verification code sent to your email.</p>
        <input
          className="mt-5 w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-cyan-400"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Verification code"
          required
        />
        {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-md bg-white py-2 font-semibold text-black disabled:opacity-70"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>
      </form>
    </div>
  );
};
