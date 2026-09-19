import { createFileRoute } from "@tanstack/react-router";

import { getContent } from "@/content";
import { contactSchema } from "@/content/schema";
import { seoHead } from "@/lib/seo";
import { ContactPage } from "@/views/contact";

const locale = "en" as const;
const c = getContent(locale);

export const Route = createFileRoute("/en/contact")({
  component: ContactPage,
  head: () =>
    seoHead({
      key: "contact",
      locale,
      title: c.contact.meta.title,
      description: c.contact.meta.description,
      schema: contactSchema(locale),
    }),
});
