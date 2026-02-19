import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Briefcase, MapPin, Clock, DollarSign, Heart, Zap, Users, Globe, Coffee, Laptop, Plane, GraduationCap } from "lucide-react";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
}

export default function Careers() {
  const jobs: Job[] = [
    {
      id: 1,
      title: "Senior Full-Stack Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$120K - $180K",
      description: "Build the future of music distribution. Work with React, Node.js, and cutting-edge AI technologies."
    },
    {
      id: 2,
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      salary: "$100K - $150K",
      description: "Design beautiful, intuitive experiences for DJs worldwide. Own the end-to-end design process."
    },
    {
      id: 3,
      title: "AI/ML Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$140K - $200K",
      description: "Build AI models for music analysis, recommendation systems, and automated set generation."
    },
    {
      id: 4,
      title: "Community Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      salary: "$70K - $100K",
      description: "Grow and engage our community of 10K+ DJs. Manage Discord, social media, and events."
    },
    {
      id: 5,
      title: "Content Marketing Lead",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      salary: "$90K - $130K",
      description: "Create compelling content that resonates with DJs. Blog, tutorials, case studies, and more."
    },
    {
      id: 6,
      title: "Customer Success Manager",
      department: "Support",
      location: "Remote",
      type: "Full-time",
      salary: "$60K - $90K",
      description: "Help DJs succeed on our platform. Provide world-class support and build relationships."
    }
  ];

  const benefits = [
    {
      icon: Laptop,
      title: "Remote First",
      description: "Work from anywhere in the world. We're a fully distributed team."
    },
    {
      icon: DollarSign,
      title: "Competitive Salary",
      description: "Top-of-market compensation with equity options for all employees."
    },
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health, dental, and vision insurance for you and your family."
    },
    {
      icon: Plane,
      title: "Unlimited PTO",
      description: "Take the time you need to recharge. We trust you to manage your time."
    },
    {
      icon: GraduationCap,
      title: "Learning Budget",
      description: "$2,000/year for courses, conferences, and professional development."
    },
    {
      icon: Coffee,
      title: "Home Office Setup",
      description: "$1,500 to build your dream remote workspace."
    },
    {
      icon: Users,
      title: "Team Retreats",
      description: "Annual all-hands gatherings in amazing locations around the world."
    },
    {
      icon: Zap,
      title: "Latest Tech",
      description: "MacBook Pro, monitors, and any tools you need to do your best work."
    }
  ];

  const values = [
    {
      title: "Creator First",
      description: "Every decision we make starts with: \"Is this good for DJs?\" We exist to serve our community."
    },
    {
      title: "Move Fast",
      description: "We ship quickly, iterate based on feedback, and aren't afraid to experiment. Speed is a feature."
    },
    {
      title: "Own It",
      description: "Take ownership of your work. We hire smart people and trust them to make great decisions."
    },
    {
      title: "Stay Humble",
      description: "We're building something big, but we stay grounded. No egos, just great work."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-cyan-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Join Our Team
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Help us build the operating system for the next generation of DJs. We're a remote-first team passionate about music, technology, and empowering creators.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-900/50">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-white">Our Values</h2>
              <p className="text-xl text-slate-400">What drives us every day</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, idx) => (
                <Card key={idx} className="p-6 bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all text-center">
                  <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-white">Benefits & Perks</h2>
              <p className="text-xl text-slate-400">We take care of our team</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, idx) => {
                const colors = ["cyan", "purple", "pink"];
                const color = colors[idx % 3];
                return (
                  <Card key={idx} className="p-6 bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all">
                    <div className={`w-12 h-12 bg-${color}-500/10 rounded-xl flex items-center justify-center mb-4`}>
                      <benefit.icon className={`w-6 h-6 text-${color}-400`} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{benefit.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-slate-900/50">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-white">Open Positions</h2>
              <p className="text-xl text-slate-400">Find your next role</p>
            </div>

            <div className="space-y-6">
              {jobs.map((job) => (
                <Card key={job.id} className="p-6 bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{job.department}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{job.salary}</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg whitespace-nowrap">
                      Apply Now
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{job.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-white">Our Hiring Process</h2>
              <p className="text-xl text-slate-400">What to expect when you apply</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Apply", description: "Submit your application and tell us why you're excited about ONLYDJS." },
                { step: "2", title: "Screen", description: "Quick 30-minute call to learn about your background and answer questions." },
                { step: "3", title: "Interview", description: "2-3 interviews with team members. Mix of technical and cultural fit." },
                { step: "4", title: "Offer", description: "If it's a match, we'll send you an offer within 48 hours!" }
              ].map((stage, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                    {stage.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{stage.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{stage.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900/50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Globe className="w-12 h-12 text-purple-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Don't see a perfect fit?</h2>
            <p className="text-xl text-slate-400 mb-8">
              We're always looking for talented people. Send us your resume and let's talk!
            </p>
            <a
              href="mailto:careers@onlydjs.com"
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
