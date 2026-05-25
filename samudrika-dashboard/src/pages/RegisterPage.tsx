import { RegisterForm } from "../components/register-form";

export const RegisterPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#1C1C1E] p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>

      <p className="px-6 text-center text-xs text-white/35">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 text-white/60">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 text-white/60">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
};
