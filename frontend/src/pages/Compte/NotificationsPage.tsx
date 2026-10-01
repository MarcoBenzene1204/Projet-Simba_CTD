import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, CircleAlert, Clock3, FileCheck2, RefreshCw, Wallet } from "lucide-react";
import { useNavigate } from "react-router";

import { apiErrorMessage } from "@/api/api-error";
import { listNotifications, markAllNotificationsRead, markNotificationRead, type NotificationCenter, type UserNotification } from "@/api/notifications.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type NotificationFilter = "ALL" | "UNREAD" | "READ";

const emptyCenter: NotificationCenter = { notifications: [], nonLues: 0 };

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [center, setCenter] = useState<NotificationCenter>(emptyCenter);
  const [filter, setFilter] = useState<NotificationFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string>();

  const load = async () => {
    setLoading(true);
    try {
      setError(undefined);
      setCenter(await listNotifications());
    } catch (cause) {
      setError(apiErrorMessage(cause, "Impossible de charger les notifications."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const visibleNotifications = useMemo(() => center.notifications.filter((item) =>
    filter === "ALL" || (filter === "UNREAD" ? !item.lue : item.lue),
  ), [center.notifications, filter]);

  const openNotification = async (notification: UserNotification) => {
    setWorking(true);
    try {
      if (!notification.lue) {
        await markNotificationRead(notification.id);
        setCenter((current) => ({
          nonLues: Math.max(current.nonLues - 1, 0),
          notifications: current.notifications.map((item) => item.id === notification.id
            ? { ...item, lue: true, luLe: new Date().toISOString() }
            : item),
        }));
        window.dispatchEvent(new Event("simba:notifications-updated"));
      }
      if (notification.lien) navigate(notification.lien);
    } catch (cause) {
      setError(apiErrorMessage(cause, "La notification n'a pas pu être marquée comme lue."));
    } finally {
      setWorking(false);
    }
  };

  const markAllRead = async () => {
    setWorking(true);
    try {
      await markAllNotificationsRead();
      const readAt = new Date().toISOString();
      setCenter((current) => ({
        nonLues: 0,
        notifications: current.notifications.map((item) => item.lue ? item : { ...item, lue: true, luLe: readAt }),
      }));
      window.dispatchEvent(new Event("simba:notifications-updated"));
    } catch (cause) {
      setError(apiErrorMessage(cause, "Les notifications n'ont pas pu être marquées comme lues."));
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Centre de suivi</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Alertes et événements liés à vos workflows.</p>
        </div>
        {center.nonLues > 0 && <Button variant="outline" className="gap-2" onClick={() => void markAllRead()} disabled={working}><CheckCheck className="h-4 w-4" />Tout marquer comme lu</Button>}
      </header>

      <section className="flex flex-wrap items-center justify-between gap-3 border-b pb-3" aria-label="Filtres de notifications">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Afficher">
          {([
            ["ALL", "Toutes"],
            ["UNREAD", `Non lues${center.nonLues ? ` (${center.nonLues})` : ""}`],
            ["READ", "Lues"],
          ] as const).map(([value, label]) => <Button key={value} size="sm" variant={filter === value ? "default" : "outline"} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</Button>)}
        </div>
        <p className="text-xs text-muted-foreground">{center.notifications.length} notification{center.notifications.length === 1 ? "" : "s"}</p>
      </section>

      {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {loading ? <p className="py-12 text-center text-sm text-muted-foreground">Chargement des notifications…</p> : visibleNotifications.length === 0 ? (
        error ? <Card><CardContent className="flex min-h-44 flex-col items-center justify-center gap-3 p-6 text-center"><CircleAlert className="h-9 w-9 text-destructive" /><p className="font-medium">Chargement impossible</p><Button variant="outline" className="gap-2" onClick={() => void load()}><RefreshCw className="h-4 w-4" />Réessayer</Button></CardContent></Card> : <Card><CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 p-6 text-center"><CheckCheck className="h-9 w-9 text-success" /><p className="font-medium">{filter === "UNREAD" ? "Tout est à jour" : "Aucune notification"}</p><p className="max-w-md text-sm text-muted-foreground">Les alertes générées par les opérations de votre collectivité apparaîtront ici.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {visibleNotifications.map((notification) => {
            const Icon = iconForType(notification.type);
            return (
              <Card key={notification.id} className={`min-w-0 shadow-none transition-colors ${notification.lue ? "border-border/70 bg-background" : "border-primary/25 bg-primary/[0.035]"}`}>
                <CardContent className="flex min-w-0 items-start gap-3 p-4 sm:gap-4">
                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${notification.lue ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}><Icon className="h-4 w-4" /></span>
                  <button type="button" className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={() => void openNotification(notification)} disabled={working}>
                    <span className="flex flex-wrap items-center gap-2"><span className="font-medium">{notification.titre}</span>{!notification.lue && <Badge variant="secondary">Nouvelle</Badge>}</span>
                    <span className="mt-1 block break-words text-sm leading-5 text-muted-foreground">{notification.message}</span>
                    <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />{formatDate(notification.creeLe)}</span>
                  </button>
                  {notification.lien && <Button variant="ghost" size="sm" className="hidden shrink-0 sm:inline-flex" onClick={() => void openNotification(notification)} disabled={working}>Ouvrir</Button>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function iconForType(type: string) {
  if (type.includes("LIQUIDATION")) return Wallet;
  if (type.includes("MANDAT") || type.includes("ENGAGEMENT")) return FileCheck2;
  if (type.includes("REJET")) return CircleAlert;
  return Bell;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date inconnue" : new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}