import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Brain, Clock, Calendar, ArrowLeft, ArrowRight, Tag, User } from 'lucide-react';
import { BLOG_POSTS, getBlogBySlug } from '@/lib/data/blogs';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | MindForge Blog',
    };
  }

  return {
    title: `${post.title} | MindForge Blog`,
    description: post.description,
    keywords: post.tags.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export async function generateStaticParams() {
  return BLOG_POSTS.map(post => ({
    slug: post.slug,
  }));
}

function parseMarkdownToHtml(content: string): string {
  return content
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mt-10 mb-4">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-white mt-8 mb-3">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold text-white mt-6 mb-2">$1</h4>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 text-gray-300">$1</li>')
    .replace(/(<li.*<\/li>)\n(?=<li)/g, '$1')
    .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 text-gray-300"><span class="font-semibold text-electric-400">$1.</span> $2</li>')
    .replace(/\n\n/g, '</p><p class="text-gray-300 leading-relaxed mb-4">')
    .replace(/^(?!<[hulo])(.+)$/gim, '<p class="text-gray-300 leading-relaxed mb-4">$1</p>');
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const currentIndex = BLOG_POSTS.findIndex(p => p.slug === slug);
  const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const nextPost = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;

  const relatedPosts = BLOG_POSTS
    .filter(p => p.slug !== slug && (p.category === post.category || p.tags.some(t => post.tags.includes(t))))
    .slice(0, 3);

  const contentHtml = parseMarkdownToHtml(post.content);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    publisher: {
      '@type': 'Organization',
      name: 'MindForge',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mindforge.app/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://mindforge.app/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-navy-900">
        {/* Header */}
        <header className="bg-navy-800/50 border-b border-navy-700 sticky top-0 z-50 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="p-2 bg-electric-500/10 rounded-xl">
                  <Brain className="w-6 h-6 text-electric-500" />
                </div>
                <span className="text-xl font-bold text-white">MindForge</span>
              </Link>
              <nav className="flex items-center gap-6">
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/games" className="text-gray-300 hover:text-white transition-colors">
                  Games
                </Link>
                <Link href="/blog" className="text-electric-400 font-medium">
                  Blog
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link href="/blog" className="text-gray-400 hover:text-electric-400 flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
          </nav>

          {/* Article Header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Link
                href={`/blog/category/${post.category.toLowerCase().replace(' ', '-')}`}
                className="text-sm font-medium text-electric-400 uppercase tracking-wider hover:text-electric-300"
              >
                {post.category}
              </Link>
              <span className="text-gray-600">•</span>
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <Clock className="w-4 h-4" /> {post.readingTime} min read
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-gray-400 mb-6">
              {post.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400 border-t border-b border-navy-700 py-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <span className="text-gray-600">•</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
              </div>
              {post.updatedAt !== post.publishedAt && (
                <>
                  <span className="text-gray-600">•</span>
                  <span>Updated: {new Date(post.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </>
              )}
            </div>
          </header>

          {/* Article Content */}
          <article
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-navy-700">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-gray-400" />
              {post.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag.replace(' ', '-')}`}
                  className="px-3 py-1 bg-navy-700 text-gray-300 hover:bg-navy-600 hover:text-white rounded-full text-sm transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-12 grid grid-cols-2 gap-4">
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="p-4 bg-navy-800 border border-navy-700 rounded-xl hover:border-electric-500/50 transition-colors group"
              >
                <span className="text-xs text-gray-500 uppercase tracking-wider">Previous</span>
                <p className="text-white font-medium mt-1 group-hover:text-electric-400 transition-colors line-clamp-2">
                  {prevPost.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="p-4 bg-navy-800 border border-navy-700 rounded-xl hover:border-electric-500/50 transition-colors group text-right"
              >
                <span className="text-xs text-gray-500 uppercase tracking-wider">Next</span>
                <p className="text-white font-medium mt-1 group-hover:text-electric-400 transition-colors line-clamp-2">
                  {nextPost.title}
                </p>
              </Link>
            )}
          </nav>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map(relatedPost => (
                  <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className="group">
                    <article className="bg-navy-800 border border-navy-700 rounded-xl p-4 hover:border-electric-500/50 transition-all h-full">
                      <span className="text-xs font-medium text-electric-400 uppercase tracking-wider">
                        {relatedPost.category}
                      </span>
                      <h3 className="text-white font-semibold mt-2 group-hover:text-electric-400 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                        {relatedPost.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
                        <Clock className="w-3 h-3" />
                        <span>{relatedPost.readingTime} min read</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="mt-16 text-center bg-gradient-to-r from-electric-500/10 to-memory/10 rounded-2xl p-10 border border-electric-500/20">
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to Train Your Brain?
            </h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Apply what you've learned with our science-based brain training games.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-electric-500 hover:bg-electric-400 text-white font-semibold rounded-xl transition-colors"
            >
              Start Training Free <ArrowRight className="w-5 h-5" />
            </Link>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-navy-800/50 border-t border-navy-700 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} MindForge. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
