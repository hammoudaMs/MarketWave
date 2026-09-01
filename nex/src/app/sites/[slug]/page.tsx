"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSiteBySlug } from "@/lib/storage";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SitePreviewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [html, setHtml] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const site = getSiteBySlug(slug);
    if (site) {
      setHtml(site.html);
      setTitle(site.title);
    }
  }, [slug]);

  if (!html) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-gray-600">Site not found. Generate it from the dashboard first.</p>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Nex
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Nex
        </Link>
        <span className="text-sm font-medium text-gray-700">{title} — Preview</span>
        <div className="w-20" />
      </div>
      <iframe
        srcDoc={html}
        title={title}
        className="flex-1 w-full border-0"
        sandbox="allow-same-origin"
      />
    </div>
  );
}
