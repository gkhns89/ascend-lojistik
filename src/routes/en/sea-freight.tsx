import { createFileRoute } from "@tanstack/react-router";

import { serviceRouteOptions } from "@/components/site/service-page";

export const Route = createFileRoute("/en/sea-freight")(serviceRouteOptions("denizyolu", "en"));
