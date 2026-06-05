import { useEffect } from "react";

type SeoHeadProps = {
  title: string;
  description: string;
  canonicalPath: string;
  image?: string;
  keywords?: string[];
  schemas?: Record<string, unknown>[];
  ogType?: "website" | "article";
};

const SITE_URL = "https://www.kayrosco.al";
const DEFAULT_IMAGE = `${SITE_URL}/banner.png`;

function setMeta(selector: string, attr: "name" | "property", value: string, content: string) {
  let node = document.head.querySelector<HTMLMetaElement>(selector);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attr, value);
    document.head.appendChild(node);
  }
  node.setAttribute("content", content);
}

export default function SeoHead({
  title,
  description,
  canonicalPath,
  image = DEFAULT_IMAGE,
  keywords = [],
  schemas = [],
  ogType = "website",
}: SeoHeadProps) {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    document.title = title;

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[name="keywords"]', "name", "keywords", keywords.join(", "));
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMeta('meta[property="og:type"]', "property", "og:type", ogType);
    setMeta('meta[property="og:image"]', "property", "og:image", image);
    setMeta('meta[property="og:image:alt"]', "property", "og:image:alt", "KAYROSCO GROUP banner");
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", image);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const existingScripts = Array.from(document.head.querySelectorAll('script[data-seo-schema="true"]'));
    existingScripts.forEach((script) => script.remove());

    schemas.forEach((schema, index) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seoSchema = "true";
      script.dataset.schemaIndex = String(index);
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      const currentScripts = Array.from(document.head.querySelectorAll('script[data-seo-schema="true"]'));
      currentScripts.forEach((script) => script.remove());
    };
  }, [canonicalPath, description, image, keywords, ogType, schemas, title]);

  return null;
}
