import { useEffect, useRef, useState } from "react";
import Layout from "./Layout/Layout";
import AuthModal from "./Pages/AuthModal";
import { apiFetch } from "./utils/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [isBootstrappingAuth, setIsBootstrappingAuth] = useState(true);
  const hasBootstrappedRef = useRef(false);

  const decodeJwtPayload = (token) => {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length < 2) return null;

    try {
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const paddedBase64 = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
      const payloadJson = atob(paddedBase64);
      return JSON.parse(payloadJson);
    } catch (error) {
      console.warn("Unable to decode JWT payload:", error);
      return null;
    }
  };

  const extractUserFromPayload = (payload) => {
    if (!payload || typeof payload !== "object") return null;

    const nestedUser = payload.user || payload.data?.user;
    if (nestedUser?.email) return nestedUser;

    if (payload.email) {
      return {
        email: payload.email,
      };
    }

    const tokenPayload = decodeJwtPayload(payload.accessToken);
    if (tokenPayload) {
      const emailFromToken =
        tokenPayload.email || tokenPayload.user?.email || tokenPayload.username;

      if (emailFromToken) {
        return {
          email: emailFromToken,
          _id: tokenPayload._id || tokenPayload.sub,
        };
      }
    }

    return null;
  };

  const bootstrapSession = async () => {
    try {
      const refreshResponse = await apiFetch("/api/v1/user/refresh-token", {
        method: "POST",
      });

      if (refreshResponse.status === 401 || refreshResponse.status === 403) {
        // Expected when no refresh cookie/session exists.
        setUser(null);
        return;
      }

      if (!refreshResponse.ok) {
        throw new Error("Refresh token request failed");
      }

      const refreshPayload = await refreshResponse.json();
      const refreshedUser = extractUserFromPayload(refreshPayload);

      if (!refreshedUser) {
        // Refresh succeeded but backend response does not include a resolvable identity.
        throw new Error(
          "Session refreshed but no user identity was returned. Include user/email in refresh response or in access token payload.",
        );
      }

      setUser(refreshedUser);
    } catch (error) {
      console.warn("Session bootstrap failed. User must login again.", error);
      setUser(null);
    } finally {
      setIsBootstrappingAuth(false);
    }
  };

  useEffect(() => {
    if (hasBootstrappedRef.current) {
      return;
    }
    hasBootstrappedRef.current = true;
    bootstrapSession();
  }, []);

  const handleLoginSuccess = (userInfo) => {
    setUser(userInfo);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      {isBootstrappingAuth ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-600">Restoring session...</p>
        </div>
      ) : !user ? (
        <AuthModal onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="bg-gray-50">
          <Layout userEmail={user.email} onLogout={handleLogout} />
        </div>
      )}
    </>
  );
}
