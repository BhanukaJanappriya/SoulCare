import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query"; // NEW
import { getBlogPostsAPI,getPublicFeedbackAPI } from "@/api"; // NEW
import type { BlogPost, UserRole, BlogSortBy,Feedback } from "@/types"; // NEW
import {
  Stethoscope,
  Brain,
  Heart,
  Star,
  Clock,
  ArrowRight,
} from "lucide-react";
import { RoleCard } from "@/components/ui/role-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // NEW
import { Button } from "@/components/ui/button"; // NEW
import FullArticleDialog from "@/components/common/FullArticleDialog"; // NEW
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // NEW
import { Label } from "@/components/ui/label"; // NEW
import { Quote } from "lucide-react";

// --- NEW: Simplified Public Blog Card Component ---
const PublicBlogCard: React.FC<{
  post: BlogPost;
  onReadMore: (post: BlogPost) => void;
}> = ({ post, onReadMore }) => (
  <Card className="hover:shadow-xl transition-shadow border-t-4 border-t-primary/50 flex flex-col h-full">
    <CardHeader className="flex-grow">
      <div className="flex items-center gap-2 mb-2">
        {/* Display Average Rating */}
        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        <span className="text-sm font-semibold">
          {post.average_rating.toFixed(1)}{" "}
          <span className="text-xs text-muted-foreground">
            ({post.rating_count})
          </span>
        </span>
      </div>
      <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
        {post.excerpt || post.content.substring(0, 150) + "..."}
      </p>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
        </span>
        <Button
          variant="link"
          className="p-0 h-auto text-primary"
          onClick={() => onReadMore(post)}
        >
          Read More <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </CardContent>
  </Card>
);
// --- END NEW COMPONENT ---

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // --- NEW BLOG LOGIC STATE ---
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  const [sortBy, setSortBy] = useState<BlogSortBy>("newest"); // <-- NEW SORT STATE

  const handleReadMore = (post: BlogPost) => {
    setSelectedArticle(post);
    setIsArticleDialogOpen(true);
  };


  const { data: feedbacks } = useQuery<Feedback[]>({
    queryKey: ["publicFeedback"],
    queryFn: getPublicFeedbackAPI,
  });


  // Fetch latest published blogs (publicly accessible)
  const { data: blogs, isLoading: isLoadingBlogs } = useQuery<BlogPost[]>({
    queryKey: ["publicBlogs", sortBy], // <-- ADD sortBy to queryKey
    queryFn: () => getBlogPostsAPI("published", sortBy), // <-- PASS sortBy
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });
  // --- END NEW BLOG LOGIC STATE ---

  const handleRoleSelect = (role: UserRole) => {
    const navigationState = { state: { selectedRole: role } };

    if (role === "user") {
      navigate("/auth/signup", navigationState);
    } else if (role === "counselor") {
      navigate("/counselor-register", navigationState);
    } else if (role === "doctor") {
      navigate("/doctor-register", navigationState);
    } else {
      console.error("Unknown role selected:", role);
    }
  };

  // Feature lists remain the same
  const doctorFeatures = [
    "Create and manage prescriptions",
    "Video consultations with patients",
    "Patient diagnosis and treatment",
    "Medical history tracking",
    "Appointment scheduling",
    "Share medical content",
    "Write and publish blogs",
    "Progress tracking tools",
  ];

  const counselorFeatures = [
    "Therapy session management",
    "Video consultations with patients",
    "Mental health assessments",
    "Progress tracking tools",
    "Appointment scheduling",
    "Share therapeutic content",
    "Write and publish blogs",
    "Session notes and plans",
  ];

  const patientFeatures = [
    "Personalized mood tracking",
    "Interactive mental health games",
    "Guided meditation sessions",
    "Daily habit tracking",
    "Private journal & diary",
    "Book appointments with providers",
    "Stress detection & insights",
    "Community blog participation",
  ];

  return (
    // Wrap everything in a React Fragment to allow the Dialog to be a sibling
    <>
      {/* MODIFIED: min-h-[110vh] to force scroll, flex-col for content flow */}
      <div className="min-h-[110vh] healthcare-gradient flex flex-col p-4">
        <div className="w-full max-w-6xl mx-auto flex-grow flex flex-col justify-center">
          {" "}
          {/* CENTER CONTENT */}
          {/* UPDATED: Header with logo */}
          <div className="mb-12 animate-fade-in ">
            <div className="flex flex-col items-center text-center md:flex-row md:items-center md:text-center md:justify-center gap-4">
              <img
                src="/assets/SoulCare.png"
                alt="SoulCare logo"
                className="w-32 h-32 md:w-32 md:h-32 transition-transform hover:scale-105 cursor-pointer"
              />
              <div>
                <h1 className="text-5xl font-bold text-foreground text-center justify-content-center mb-4">
                  Mental Healthcare Platform
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl text-center mx-auto">
                  Connecting healthcare professionals with patients through
                  secure, modern technology for better mental health outcomes.
                </p>
              </div>
            </div>
          </div>
          {/* UPDATED: Role Selection Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl justify-items-center mx-auto">
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <RoleCard
                role="doctor"
                title="Doctor"
                description="Medical professional specializing in mental health diagnosis and treatment"
                icon={Stethoscope}
                features={doctorFeatures}
                onSelect={handleRoleSelect}
              />
            </div>

            <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <RoleCard
                role="counselor"
                title="Counselor"
                description="Licensed mental health counselor providing therapy and support"
                icon={Brain}
                features={counselorFeatures}
                onSelect={handleRoleSelect}
              />
            </div>

            <div className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <RoleCard
                role="user"
                title="Patient"
                description="Your personal journey to better mental well-being"
                icon={Heart}
                features={patientFeatures}
                onSelect={handleRoleSelect}
              />
            </div>
          </div>
          {/* Footer (Used to force minimal height on initial view) */}
          <div
            className="text-center mt-12 animate-fade-in"
            style={{ animationDelay: "0.8s" }}
          >
            <p className="text-muted-foreground">
              Secure • HIPAA Compliant • Professional • Trusted
            </p>
          </div>
        </div>
      </div>

      {/* --- MODIFIED: Public Blog Section (Appears only on scroll) --- */}
      <div className="w-full max-w-6xl mx-auto py-12 px-4">
        <div className="text-center mb-10 px-4">
          <h2 className="text-primary text-4xl font-bold text-gray-800 mb-3">
            Latest Mental Wellness Insights
          </h2>
          <p className="text-lg text-gray-600">
            Read curated articles from our licensed Doctors and Counselors.
          </p>
        </div>

        {/* NEW: Filter Section for Landing Page */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <Label htmlFor="sort" className="font-semibold text-lg">
              Filter By:
            </Label>
            <Select
              value={sortBy}
              onValueChange={(value: BlogSortBy) => setSortBy(value)}
            >
              <SelectTrigger id="sort" className="w-[180px]">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="top_rated">Top Rated</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 px-8">
          {isLoadingBlogs ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 animate-pulse rounded-lg"
                />
              ))
          ) : blogs && blogs.length > 0 ? (
            blogs
              .slice(0, 3)
              .map((post) => (
                <PublicBlogCard
                  key={post.id}
                  post={post}
                  onReadMore={handleReadMore}
                />
              ))
          ) : (
            <p className="col-span-3 text-center text-muted-foreground">
              No published articles available yet.
            </p>
          )}
        </div>

        {/* NEW: View All Button */}
        {blogs && blogs.length > 3 && (
          <div className="mt-8 text-center">
            <Button
              variant="default"
              size="lg"
              onClick={() => navigate("/blogs")}
              className="shadow-md"
            >
              View All Articles <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
      {/* --- END NEW: Public Blog Section --- */}

      <div className="w-full bg-blue py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-primary text-4xl font-bold text-center  mb-12">What Our Community Says</h2>
          
          {feedbacks && feedbacks.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-8">
                  {feedbacks.slice(0, 3).map((item) => (
                      <Card key={item.id} className="bg-slate-50 border-none shadow-sm relative overflow-hidden">
                          <CardContent className="pt-10 pb-6 px-6">
                              <Quote className="absolute top-4 left-4 w-8 h-8 text-primary/20" />
                              <p className="text-muted-foreground mb-6 italic relative z-10">"{item.content}"</p>
                              
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                      {item.user.full_name?.[0] || item.user.username[0].toUpperCase()}
                                  </div>
                                  <div>
                                      <p className="font-semibold text-sm text-foreground">{item.user.full_name || item.user.username}</p>
                                      <p className="text-xs text-muted-foreground capitalize">{item.user.role}</p>
                                  </div>
                                  <div className="ml-auto flex">
                                      {Array.from({ length: item.rating }).map((_, i) => (
                                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                      ))}
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  ))}
              </div>
          ) : (
              <p className="text-center text-muted-foreground">No testimonials yet. Be the first to share your story!</p>
          )}
        </div>
      </div>

      {/* Full Article Dialog (Enabled for public reading/engagement) */}
      <FullArticleDialog
        post={selectedArticle}
        isOpen={isArticleDialogOpen}
        onOpenChange={setIsArticleDialogOpen}
        showEngagement={true}
      />
    </>
  );
};

export default LandingPage;
