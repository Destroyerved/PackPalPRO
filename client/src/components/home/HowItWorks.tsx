import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How PackPal Works</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            A simple process designed to make group coordination effortless.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 text-primary w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Create Event</h3>
            <p className="text-slate-600">Set up your event or trip and invite your group members with specific roles.</p>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 text-primary w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Add Items & Assign</h3>
            <p className="text-slate-600">Create your packing list with categories and assign items to group members.</p>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 text-primary w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Track Progress</h3>
            <p className="text-slate-600">Monitor packing status in real-time and ensure everything is ready for your event.</p>
          </div>
        </div>
        
        <div className="mt-16">
          <div className="bg-slate-100 rounded-lg p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">See PackPal in Action</h3>
                <p className="text-slate-600 mb-6">
                  Watch how PackPal helps coordinate a camping trip for a group of 8 friends, ensuring nobody forgets the essentials.
                </p>
                <Button className="bg-primary hover:bg-blue-700 text-white font-medium">
                  <Play className="mr-2 h-4 w-4" /> Watch Demo
                </Button>
              </div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="PackPal demo" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-primary bg-opacity-80 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                    <Play className="text-white h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
