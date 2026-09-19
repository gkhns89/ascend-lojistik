import { createFileRoute } from "@tanstack/react-router";

import { getContent } from "@/content";
import { aboutSchema } from "@/content/schema";
import { seoHead } from "@/lib/seo";
import { AboutPage } from "@/views/about";

const locale = "en" as const;
const c = getContent(locale);

export const Route = createFileRoute("/en/about")({
  component: AboutPage,
  head: () =>
    seoHead({
      key: "about",
      locale,
      title: c.about.meta.title,
      description: c.about.meta.description,
      schema: aboutSchema(locale),
    }),
});
