import { createFileRoute } from "@tanstack/react-router";

import { getContent } from "@/content";
import { digitalSchema } from "@/content/schema";
import { seoHead } from "@/lib/seo";
import { DigitalPage } from "@/views/digital";

const locale = "en" as const;
const c = getContent(locale);

export const Route = createFileRoute("/en/digital-solutions")({
  component: DigitalPage,
  head: () =>
    seoHead({
      key: "digital",
      locale,
      title: c.digital.meta.title,
      description: c.digital.meta.description,
      schema: digitalSchema(locale),
    }),
});
