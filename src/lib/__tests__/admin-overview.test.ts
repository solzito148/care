import { describe, expect, it } from "vitest";

import { buildAdminOverview, type AdminRecommendation } from "@/lib/data/admin";
import type { Database } from "@/lib/supabase/types";

type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
type ItemRow = Database["public"]["Tables"]["marketplace_items"]["Row"];
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

describe("buildAdminOverview", () => {
  it("cuenta pendientes, bloqueados y suscripciones por estado", () => {
    const recommendations = [{}, {}] as AdminRecommendation[];
    const services = [
      { status: "publicado" },
      { status: "bloqueado" },
    ] as ServiceRow[];
    const items = [
      { status: "bloqueado" },
      { status: "bloqueado" },
      { status: "publicado" },
    ] as ItemRow[];
    const subscriptions = [
      { status: "activa" },
      { status: "pendiente-pago" },
      { status: "activa" },
      { status: "cancelada" },
    ] as SubscriptionRow[];

    const overview = buildAdminOverview(recommendations, services, items, subscriptions);

    expect(overview).toEqual({
      pendingRecommendations: 2,
      blockedServices: 1,
      blockedItems: 2,
      pendingSubscriptions: 1,
      activeSubscriptions: 2,
    });
  });
});
