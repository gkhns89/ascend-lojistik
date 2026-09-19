import { createFileRoute } from "@tanstack/react-router";

import { getContent } from "@/content";
import { networkSchema } from "@/content/schema";
import { seoHead } from "@/lib/seo";
import { NetworkPage } from "@/views/network";

const locale = "en" as const;
const c = getContent(locale);

export const Route = createFileRoute("/en/global-network")({
  component: NetworkPage,
  head: () =>
    seoHead({
      key: "network",
      locale,
      title: c.network.meta.title,
      description: c.network.meta.description,
      schema: networkSchema(locale),
    }),
});
