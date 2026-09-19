import { createFileRoute } from "@tanstack/react-router";

import { getContent } from "@/content";
import { servicesSchema } from "@/content/schema";
import { seoHead } from "@/lib/seo";
import { ServicesPage } from "@/views/services";

const locale = "en" as const;
const c = getContent(locale);

export const Route = createFileRoute("/en/services")({
  component: ServicesPage,
  head: () =>
    seoHead({
      key: "services",
      locale,
      title: c.services.meta.title,
      description: c.services.meta.description,
      schema: servicesSchema(locale),
    }),
});
