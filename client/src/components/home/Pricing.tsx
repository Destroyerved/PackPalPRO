import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Choose the plan that fits your group's needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="text-3xl font-bold mb-4">$0<span className="text-lg text-slate-500 font-normal">/month</span></div>
              <p className="text-slate-600 mb-6">Perfect for small groups and casual events.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Up to 5 members</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>2 active events</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Basic templates</span>
                </li>
                <li className="flex items-start text-slate-400">
                  <X className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>No PDF export</span>
                </li>
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-blue-50">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Pro Plan */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden border-2 border-primary relative transform md:scale-105">
            <div className="bg-primary text-white text-sm font-bold uppercase py-1 text-center">
              Most Popular
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-4">$9<span className="text-lg text-slate-500 font-normal">/month</span></div>
              <p className="text-slate-600 mb-6">For frequent travelers and event organizers.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Unlimited members</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>10 active events</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>All templates</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>PDF export</span>
                </li>
              </ul>
              <Button className="w-full">
                Get Pro
              </Button>
            </div>
          </div>
          
          {/* Business Plan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Business</h3>
              <div className="text-3xl font-bold mb-4">$29<span className="text-lg text-slate-500 font-normal">/month</span></div>
              <p className="text-slate-600 mb-6">For organizations managing multiple events.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Unlimited everything</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Custom templates</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>API access</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-blue-50">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
