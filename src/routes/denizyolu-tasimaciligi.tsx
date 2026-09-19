import { createFileRoute } from "@tanstack/react-router";

import { serviceRouteOptions } from "@/components/site/service-page";

export const Route = createFileRoute("/denizyolu-tasimaciligi")(
  serviceRouteOptions("denizyolu", "tr"),
);
