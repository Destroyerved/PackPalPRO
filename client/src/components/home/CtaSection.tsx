import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CtaSection() {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Organize Your Next Event?</h2>
        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of groups who've made packing and logistics stress-free with PackPal.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/register">
            <Button size="lg" variant="secondary" className="bg-white hover:bg-blue-50 text-primary">
              Get Started Free
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="border-blue-300 hover:border-white text-white">
            Schedule Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
