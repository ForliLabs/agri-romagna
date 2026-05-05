import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { createProblemResponse, withErrorHandling } from "@/lib/api-errors";
import { NotificationService } from "@/lib/notification-service";

/**
 * GET /api/notifications — Returns user's notifications and preferences.
 * POST /api/notifications — Subscribe to push, update preferences, or mark read.
 */
export const GET = withErrorHandling(async (request: Request) => {
  const { user, denied } = await authorizeRoute(request, "dashboard:view");
  if (denied) return denied;

  const [notifications, preferences, unreadCount] = await Promise.all([
    NotificationService.getUserNotifications(user!.id),
    NotificationService.getPreferences(user!.id),
    NotificationService.getUnreadCount(user!.id),
  ]);

  return createSuccessResponse(
    {
      notifications,
      preferences,
      unreadCount,
    },
    { meta: { domain: "notifications" } }
  );
});

export const POST = withErrorHandling(async (request: Request) => {
  const { user, denied } = await authorizeRoute(request, "dashboard:view");
  if (denied) return denied;

  const body = (await request.json()) as {
    action: "subscribe" | "unsubscribe" | "update-preference" | "mark-read";
    subscription?: { endpoint: string; keys: { p256dh: string; auth: string } };
    category?: string;
    preference?: Record<string, unknown>;
    notificationId?: string;
  };

  switch (body.action) {
    case "subscribe": {
      if (!body.subscription) {
        return createProblemResponse(400, "Dati mancanti", "Sottoscrizione push non fornita.");
      }
      const sub = await NotificationService.subscribe(user!.id, body.subscription);
      return createSuccessResponse({ subscription: sub }, { status: 201 });
    }

    case "unsubscribe": {
      await NotificationService.unsubscribe(user!.id);
      return createSuccessResponse({ unsubscribed: true });
    }

    case "update-preference": {
      if (!body.category) {
        return createProblemResponse(400, "Categoria mancante", "Specifica la categoria di notifica.");
      }
      const pref = await NotificationService.updatePreference(
        user!.id,
        body.category as Parameters<typeof NotificationService.updatePreference>[1],
        body.preference ?? {}
      );
      return createSuccessResponse({ preference: pref });
    }

    case "mark-read": {
      if (!body.notificationId) {
        return createProblemResponse(400, "ID mancante", "Specifica l'ID della notifica.");
      }
      await NotificationService.markAsRead(body.notificationId);
      return createSuccessResponse({ read: true });
    }

    default:
      return createProblemResponse(400, "Azione non valida", "Usa: subscribe, unsubscribe, update-preference, mark-read.");
  }
});
