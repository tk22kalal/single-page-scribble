
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";
import { HorizontalAd } from "@/components/ads/HorizontalAd";
import { InArticleAd } from "@/components/ads/InArticleAd";
import { MultiplexHorizontalAd } from "@/components/ads/MultiplexHorizontalAd";
import { VerticalAd } from "@/components/ads/VerticalAd";

const Blog = () => {
  useEffect(() => {
    // Update document title and meta tags for SEO
    document.title = "Medical Education Blog - Latest Updates & Study Guides | MedquizAI";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Access comprehensive medical education resources, study guides, and exam preparation tips for NEET PG, INICET, USMLE, and more. Stay updated with the latest in medical education.");
    }

    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    
    if (ogTitle) {
      ogTitle.setAttribute("content", "Medical Education Blog - Latest Updates & Study Guides | MedquizAI");
    }
    if (ogDescription) {
      ogDescription.setAttribute("content", "Access comprehensive medical education resources, study guides, and exam preparation tips for NEET PG, INICET, USMLE, and more.");
    }

    // Handle hash navigation when component mounts
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const hash = e.currentTarget.hash;
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', hash);
    }
  };

  return (
    <div className="min-h-screen bg-medbg dark:bg-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-medblue dark:text-white mb-8 text-center">
            Medical Education Resource Hub - Latest Updates & Study Guides
          </h1>

          {/* Horizontal Ad at the top */}
          <div className="mb-8">
            <HorizontalAd />
          </div>

          {/* Table of Contents */}
          <div className="mb-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-medblue dark:text-white mb-4">Quick Navigation</h2>
            <ScrollArea className="h-[200px]">
              <ul className="space-y-2">
                <li>
                  <a href="#neet-pg" onClick={handleHashClick} className="text-gray-700 dark:text-gray-300 hover:text-medblue">NEET PG 2024: Complete Preparation Strategy & Important Topics</a>
                </li>
                <li>
                  <a href="#usmle" onClick={handleHashClick} className="text-gray-700 dark:text-gray-300 hover:text-medblue">USMLE Step 1: High-Yield Topics & Question Bank Analysis</a>
                </li>
                <li>
                  <a href="#inicet" onClick={handleHashClick} className="text-gray-700 dark:text-gray-300 hover:text-medblue">INICET: Subject-wise Preparation Guide & Previous Year Analysis</a>
                </li>
                <li>
                  <a href="#clinical-skills" onClick={handleHashClick} className="text-gray-700 dark:text-gray-300 hover:text-medblue">Essential Clinical Skills for Medical Practitioners</a>
                </li>
                <li>
                  <a href="#research" onClick={handleHashClick} className="text-gray-700 dark:text-gray-300 hover:text-medblue">Medical Research & Publication Strategies</a>
                </li>
                <li>
                  <a href="#career" onClick={handleHashClick} className="text-gray-700 dark:text-gray-300 hover:text-medblue">Specialized Medical Career Paths & Opportunities</a>
                </li>
              </ul>
            </ScrollArea>
          </div>
          
          {/* In-Article Ad */}
          <div className="mb-8">
            <InArticleAd />
          </div>
          
          {/* Featured Blog Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <a href="/pages/neetpg.html" id="neet-pg" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden scroll-mt-24 hover:shadow-xl transition-shadow">
              <img src="/Your paragraph text (1).png" alt="NEET PG 2024 Preparation Guide" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-medblue dark:text-white mb-3">
                  NEET PG 2024: Complete Preparation Strategy & Important Topics
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Comprehensive guide covering high-yield topics for NEET PG 2024. Includes subject-wise weightage analysis, previous year question patterns, and expert-recommended study resources. Master clinical subjects with our proven preparation strategy.
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>15 min read</span>
                  <span className="mx-2">•</span>
                  <span>Updated March 15, 2024</span>
                </div>
              </div>
            </a>

            <div id="usmle" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden scroll-mt-24">
              <img src="/Your paragraph text (2).png" alt="USMLE Step 1 Guide" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-medblue dark:text-white mb-3">
                  USMLE Step 1: High-Yield Topics & Question Bank Analysis
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  In-depth analysis of First Aid topics, UWorld question patterns, and NBME self-assessments. Learn effective strategies for tackling biochemistry, pathology, and pharmacology questions. Includes comprehensive study schedule and resources.
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>18 min read</span>
                  <span className="mx-2">•</span>
                  <span>Updated March 12, 2024</span>
                </div>
              </div>
            </div>

            <div id="inicet" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden scroll-mt-24">
              <img src="/Your paragraph text (3).png" alt="INICET Preparation Guide" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-medblue dark:text-white mb-3">
                  INICET: Subject-wise Preparation Guide & Previous Year Analysis
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Expert-curated preparation strategy for INICET, focusing on anatomy, physiology, and biochemistry. Includes detailed analysis of previous year questions, important topics, and recommended reference books for each subject.
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>12 min read</span>
                  <span className="mx-2">•</span>
                  <span>Updated March 10, 2024</span>
                </div>
              </div>
            </div>
          </div>

          {/* MultiplexHorizontal Ad */}
          <div className="mb-8">
            <MultiplexHorizontalAd />
          </div>

          {/* Additional Blog Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div id="clinical-skills" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden scroll-mt-24">
              <img src="/Your paragraph text (4).png" alt="Clinical Skills Development" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-medblue dark:text-white mb-3">
                  Essential Clinical Skills for Medical Practitioners
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Master crucial clinical examination techniques, patient communication skills, and diagnostic approaches. Learn systematic physical examination methods, case presentation skills, and effective documentation practices for clinical rotations.
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>20 min read</span>
                  <span className="mx-2">•</span>
                  <span>Updated March 8, 2024</span>
                </div>
              </div>
            </div>

            <div id="research" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden scroll-mt-24">
              <img src="/Your paragraph text (5).png" alt="Medical Research Guide" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-medblue dark:text-white mb-3">
                  Medical Research & Publication Strategies
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Comprehensive guide to conducting medical research, writing impactful papers, and publishing in high-impact journals. Learn research methodology, statistical analysis, and manuscript preparation techniques from experienced researchers.
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>16 min read</span>
                  <span className="mx-2">•</span>
                  <span>Updated March 5, 2024</span>
                </div>
              </div>
            </div>

            <div id="career" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden scroll-mt-24">
              <img src="/Your paragraph text (6).png" alt="Medical Career Guide" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-medblue dark:text-white mb-3">
                  Specialized Medical Career Paths & Opportunities
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Explore diverse medical specializations, fellowship opportunities, and career development paths. Detailed insights into emerging medical fields, salary trends, and work-life balance across different specialties.
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>14 min read</span>
                  <span className="mx-2">•</span>
                  <span>Updated March 3, 2024</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Vertical Ad at the bottom */}
          <div className="mt-12">
            <VerticalAd />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
