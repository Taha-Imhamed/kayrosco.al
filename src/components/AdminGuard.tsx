import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#cfc8b9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter Tight', 'Inter', sans-serif",
          fontSize: 14,
          color: "#7a756a",
        }}
      >
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/memo/login" replace />;
  }

  return <>{children}</>;
}
