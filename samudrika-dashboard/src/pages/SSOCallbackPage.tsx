import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

export const SSOCallbackPage = () => {
  return <AuthenticateWithRedirectCallback signInFallbackRedirectUrl="/dashboard" />;
};
