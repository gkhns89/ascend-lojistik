import { createFileRoute } from "@tanstack/react-router";

import { serviceRouteOptions } from "@/components/site/service-page";

export const Route = createFileRoute("/en/ship-agency")(
  serviceRouteOptions("gemi-acenteligi", "en"),
);
