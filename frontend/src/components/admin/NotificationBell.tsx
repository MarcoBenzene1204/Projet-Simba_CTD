import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router";

import { listNotifications } from "@/api/notifications.api";
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      void listNotifications(1)
        .then((center) => { if (active) setUnreadCount(center.nonLues); })
        .catch(() => { if (active) setUnreadCount(0); });
    };
    refresh();
    const interval = window.setInterval(refresh, 60_000);
    window.addEventListener("simba:notifications-updated", refresh);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("simba:notifications-updated", refresh);
    };
  }, []);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative shrink-0"
      aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} non lue(s)` : "Notifications"}
      onClick={() => navigate("/dashboard/notifications")}
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && <span className="absolute right-0.5 top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
    </Button>
  );
}