import { Metadata } from 'next';
import Link from 'next/link';
import { Brain, Clock, ArrowRight, Calendar } from 'lucide-react';
import { BLOG_POSTS, getFeaturedBlogs, getBlogCategories } from '@/lib/data/blogs';

export const metadata: Metadata = {
  title: 'Brain Training Blog | MindForge - Tips for Memory, Focus & Cognitive Health',
  description: 'Discover science-backed tips for improving memory, focus, and cognitive function. Expert articles on brain training, neuroplasticity, mental exercises, and brain health.',
  keywords: 'brain training, memory improvement, cognitive health, focus tips, neuroplasticity, mental exercises, brain games, mind training',
  openGraph: {
    title: 'Brain Training Blog | MindForge',
    description: 'Science-backed tips for improving memory, focus, and cognitive function.',
    type: 'website',
  },
};

export default function BlogPage() {
  const featuredPosts = getFeaturedBlogs();
  const categories = getBlogCategories();
  const recentPosts = BLOG_POSTS.slice(0, 9);

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header */}
      <header className="bg-navy-800/50 border-b border-navy-700">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Brain Training <span className="text-electric-500">Blog</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Science-backed insights on memory improvement, cognitive enhancement, and brain health.
            Learn how to unlock your mind's full potential.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Link
            href="/blog"
            className="px-4 py-2 bg-electric-500 text-white rounded-full text-sm font-medium"
          >
            All Posts
          </Link>
          {categories.map(category => (
            <Link
              key={category}
              href={`/blog/category/${category.toLowerCase().replace(' ', '-')}`}
              className="px-4 py-2 bg-navy-700 text-gray-300 hover:bg-navy-600 rounded-full text-sm font-medium transition-colors"
            >
              {category}
            </Link>
          ))}
        </div>

        {/* Featured Posts */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8">Featured Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredPosts.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <article className="bg-navy-800 border border-navy-700 rounded-2xl overflow-hidden hover:border-electric-500/50 transition-all h-full flex flex-col">
                  <div className="h-48 bg-gradient-to-br from-electric-500/20 to-memory/20 flex items-center justify-center">
                    <Brain className="w-16 h-16 text-electric-500/50" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-xs font-medium text-electric-400 uppercase tracking-wider mb-2">
                      {post.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-electric-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readingTime} min read</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* All Posts */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-8">Latest Articles</h2>
          <div className="grid gap-6">
            {recentPosts.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <article className="bg-navy-800 border border-navy-700 rounded-xl p-6 hover:border-electric-500/50 transition-all flex gap-6">
                  <div className="hidden sm:flex w-32 h-32 bg-gradient-to-br from-electric-500/20 to-memory/20 rounded-xl items-center justify-center flex-shrink-0">
                    <Brain className="w-12 h-12 text-electric-500/50" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-medium text-electric-400 uppercase tracking-wider">
                        {post.category}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className="text-xs text-gray-500">{post.readingTime} min read</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-electric-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        By {post.author} • {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-electric-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read More <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center bg-gradient-to-r from-electric-500/10 to-memory/10 rounded-2xl p-12 border border-electric-500/20">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Train Your Brain?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Put what you've learned into practice. Start your personalized brain training program today and unlock your cognitive potential.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 bg-electric-500 hover:bg-electric-400 text-white font-semibold rounded-xl transition-colors"
          >
            Start Training Free <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-navy-800/50 border-t border-navy-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-electric-500" />
                <span className="text-xl font-bold text-white">MindForge</span>
              </div>
              <p className="text-gray-400 text-sm">
                Science-based brain training to improve memory, focus, and cognitive function.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/games" className="hover:text-white">Brain Games</Link></li>
                <li><Link href="/training" className="hover:text-white">Daily Training</Link></li>
                <li><Link href="/progress" className="hover:text-white">Progress Tracking</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/blog/science-of-brain-training-does-it-really-work" className="hover:text-white">Science</Link></li>
                <li><Link href="/blog/how-to-improve-memory-10-proven-techniques" className="hover:text-white">Memory Tips</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-navy-700 mt-8 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} MindForge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
