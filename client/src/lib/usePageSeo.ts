import { useEffect } from "react";

interface PageSeoOptions {
  title: string;
  description?: string;
  keywords?: string;
  canonical?: string;
}

/**
 * Dynamically updates page metadata (Title, Description, Keywords, Canonical)
 * for enhanced user experience, browser tabs, bookmarks, and client SEO.
 */
export function usePageSeo({ title, description, keywords, canonical }: PageSeoOptions) {
  useEffect(() => {
    const fullTitle = title.includes("مدارس العقيق") 
      ? title 
      : `${title} | مدارس العقيق بالمدينة المنورة`;
    const prevTitle = document.title;
    document.title = fullTitle;

    // Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content");
    if (description && metaDesc) {
      metaDesc.setAttribute("content", description);
    }

    // Update Meta Keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const prevKeywords = metaKeywords?.getAttribute("content");
    if (keywords && metaKeywords) {
      metaKeywords.setAttribute("content", keywords);
    }

    // Update Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    const prevCanonical = linkCanonical?.getAttribute("href");
    if (canonical && linkCanonical) {
      linkCanonical.setAttribute("href", canonical);
    }

    return () => {
      document.title = prevTitle;
      if (prevDesc && metaDesc) metaDesc.setAttribute("content", prevDesc);
      if (prevKeywords && metaKeywords) metaKeywords.setAttribute("content", prevKeywords);
      if (prevCanonical && linkCanonical) linkCanonical.setAttribute("href", prevCanonical);
    };
  }, [title, description, keywords, canonical]);
}
