import Link from "next/link";
import { getAllArticles } from "@/lib/blog-data";

export default function BlogPage() {
  const articles = getAllArticles();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl mb-4">
          Knitting Tips &amp; Guides
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Learn how to turn your favorite sweaters into custom knitting patterns
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="group block"
          >
            <article className="bg-card rounded-lg border border-border p-6 h-full transition-colors group-hover:border-primary/40">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <time dateTime={article.publishedAt}>
                  {new Date(article.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span aria-hidden="true">&middot;</span>
                <span>{article.readingTime}</span>
              </div>
              <h2 className="font-serif text-xl mb-2 group-hover:text-primary transition-colors">
                {article.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {article.excerpt}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
