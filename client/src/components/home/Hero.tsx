import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900 mb-4">
              Group Packing Made <span className="text-primary">Simple</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8">
              Stop wondering who's bringing what. PackPal helps your group coordinate packing lists for trips, events, and projects with real-time collaboration.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-blue-700 text-white font-medium">
                  Start Packing Together
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-slate-300 hover:border-primary text-slate-700 hover:text-primary">
                Watch Demo <Play className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1502301197179-65228ab57f78?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="People collaborating on packing" 
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
