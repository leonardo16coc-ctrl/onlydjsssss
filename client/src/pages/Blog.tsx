import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Search, Calendar, User, ArrowRight, Tag } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  coverImage: string;
  slug: string;
}

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Production Tips", "Industry News", "DJ Tutorials", "Artist Spotlights", "Platform Updates"];

  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "10 Essential Production Tips for Tech House Tracks",
      excerpt: "Master the art of Tech House production with these proven techniques used by top producers. Learn about groove, basslines, and arrangement.",
      category: "Production Tips",
      author: "Marcus Chen",
      date: "Feb 15, 2026",
      readTime: "8 min read",
      coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
      slug: "tech-house-production-tips"
    },
    {
      id: 2,
      title: "The Rise of AI in Music Production: What DJs Need to Know",
      excerpt: "Explore how artificial intelligence is transforming the music industry and what it means for DJs and producers in 2026.",
      category: "Industry News",
      author: "Sarah Martinez",
      date: "Feb 12, 2026",
      readTime: "6 min read",
      coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      slug: "ai-music-production-2026"
    },
    {
      id: 3,
      title: "Harmonic Mixing 101: The Complete Guide",
      excerpt: "Learn the fundamentals of harmonic mixing using the Camelot Wheel. Create seamless transitions and keep your dancefloor moving.",
      category: "DJ Tutorials",
      author: "DJ Alex Rivera",
      date: "Feb 10, 2026",
      readTime: "12 min read",
      coverImage: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80",
      slug: "harmonic-mixing-guide"
    },
    {
      id: 4,
      title: "How to Build Your DJ Brand on Social Media",
      excerpt: "Proven strategies to grow your audience, engage fans, and land more gigs through effective social media marketing.",
      category: "Industry News",
      author: "Emma Thompson",
      date: "Feb 8, 2026",
      readTime: "10 min read",
      coverImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
      slug: "dj-social-media-strategy"
    },
    {
      id: 5,
      title: "Artist Spotlight: DJ Luna's Journey from Bedroom to Mainstage",
      excerpt: "Discover how DJ Luna went from uploading her first track on ONLYDJS to playing at major festivals worldwide in just 18 months.",
      category: "Artist Spotlights",
      author: "ONLYDJS Team",
      date: "Feb 5, 2026",
      readTime: "7 min read",
      coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
      slug: "dj-luna-success-story"
    },
    {
      id: 6,
      title: "New Feature: AI Set Generator Now Live",
      excerpt: "Create perfect DJ sets in seconds with our new AI-powered set generator. Learn how to use it and maximize your workflow.",
      category: "Platform Updates",
      author: "ONLYDJS Team",
      date: "Feb 1, 2026",
      readTime: "5 min read",
      coverImage: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80",
      slug: "ai-set-generator-launch"
    },
    {
      id: 7,
      title: "Mastering EQ: The Secret to Professional Mixes",
      excerpt: "Deep dive into EQ techniques that separate amateur mixes from professional productions. Frequency ranges, surgical cuts, and more.",
      category: "Production Tips",
      author: "Marcus Chen",
      date: "Jan 28, 2026",
      readTime: "15 min read",
      coverImage: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&q=80",
      slug: "mastering-eq-techniques"
    },
    {
      id: 8,
      title: "How to Read a Crowd: Advanced DJ Techniques",
      excerpt: "Learn the subtle art of reading energy levels, adapting your set on the fly, and keeping the dancefloor packed all night long.",
      category: "DJ Tutorials",
      author: "DJ Alex Rivera",
      date: "Jan 25, 2026",
      readTime: "9 min read",
      coverImage: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80",
      slug: "reading-crowd-dj-techniques"
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryColors: Record<string, string> = {
    "Production Tips": "cyan",
    "Industry News": "purple",
    "DJ Tutorials": "pink",
    "Artist Spotlights": "cyan",
    "Platform Updates": "purple"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ONLYDJS Blog
              </span>
            </h1>
            <p className="text-xl text-slate-300">
              Tips, tutorials, and insights for DJs and producers
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mt-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-slate-900/30">
        <div className="container">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-7xl mx-auto">
            {filteredPosts.length === 0 ? (
              <Card className="p-12 bg-slate-900/50 border-slate-800 text-center">
                <p className="text-xl text-slate-400">No articles found for "{searchQuery}"</p>
                <p className="text-sm text-slate-500 mt-2">Try a different search term or category</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => {
                  const color = categoryColors[post.category] || "cyan";
                  return (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                      <Card className="group overflow-hidden bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer h-full flex flex-col">
                        {/* Cover Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                          
                          {/* Category Badge */}
                          <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 bg-${color}-500/20 backdrop-blur-sm rounded-full text-xs font-semibold text-${color}-400 border border-${color}-500/30`}>
                              {post.category}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                            {post.excerpt}
                          </p>

                          {/* Meta */}
                          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{post.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{post.date}</span>
                              </div>
                            </div>
                            <span className="text-slate-400">{post.readTime}</span>
                          </div>

                          {/* Read More */}
                          <div className="flex items-center gap-2 text-cyan-400 font-semibold mt-4 group-hover:gap-3 transition-all">
                            <span>Read More</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-slate-900/50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Tag className="w-12 h-12 text-purple-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Never Miss an Article</h2>
            <p className="text-xl text-slate-400 mb-8">
              Get the latest DJ tips, tutorials, and industry news delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
              <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
