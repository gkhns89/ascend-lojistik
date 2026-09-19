import { createFileRoute } from "@tanstack/react-router";

import { getContent } from "@/content";
import { homeSchema } from "@/content/schema";
import { seoHead } from "@/lib/seo";
import { HomePage } from "@/views/home";

const locale = "en" as const;
const c = getContent(locale);

export const Route = createFileRoute("/en/")({
  component: HomePage,
  head: () =>
    seoHead({
      key: "home",
      locale,
      title: c.home.meta.title,
      description: c.home.meta.description,
      schema: homeSchema(locale),
    }),
});
