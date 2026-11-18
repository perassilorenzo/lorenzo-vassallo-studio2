import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import siteCss from "../site.css?url";
import siteBody from "../content/site-body.html?raw";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lorenzo Vassallo Studio — Interior design a Saluzzo" },
      { name: "description", content: "La tua casa è unica, rendila speciale. Progettazione di interni su misura, consulenza architettonica, product design." },
      { property: "og:title", content: "Lorenzo Vassallo Studio — Interior design" },
      { property: "og:description", content: "Progettazione di interni su misura, consulenza architettonica e product design a Saluzzo (CN)." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: siteCss }],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/js/main.js";
    document.body.appendChild(script);
    return () => script.remove();
  }, []);
  return <div dangerouslySetInnerHTML={{ __html: siteBody }} />;
}
