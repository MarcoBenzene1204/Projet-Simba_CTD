import { useEffect, useState } from "react";
import { getCurrentUser, type CurrentUser } from "@/api/auth.api";

export default function AuthTestPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        console.log("Utilisateur Spring Boot :", data);
        setUser(data);
      })
      .catch((error) => {
        console.error("Erreur API /auth/me :", error);
        setError("Impossible de récupérer l'utilisateur.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Aucun utilisateur.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Test authentification</h1>

      <div>
        <strong>Username :</strong> {user.username}
      </div>

      <div>
        <strong>Email :</strong> {user.email}
      </div>

      <div>
        <strong>Nom :</strong> {user.firstName} {user.lastName}
      </div>

      <div>
        <strong>Keycloak ID :</strong> {user.keycloakId}
      </div>

      <div>
        <strong>Rôles :</strong>

        <ul className="mt-2 list-disc pl-5">
          <li>{user.role}</li>
        </ul>
      </div>
    </div>
  );
}
