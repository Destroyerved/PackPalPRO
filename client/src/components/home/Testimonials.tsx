import { Star } from "lucide-react";

const testimonials = [
  {
    text: "PackPal saved our camping trip! With 12 people bringing equipment, we would have ended up with 4 stoves and no tent without it.",
    author: "Jamie Davis",
    role: "Hiking Group Organizer",
    initials: "JD"
  },
  {
    text: "We use PackPal for all our company retreats now. The role-based access ensures team leads can manage their departments' items.",
    author: "Sarah Wilson",
    role: "HR Director",
    initials: "SW"
  },
  {
    text: "As an event coordinator, I need to track what vendors are bringing. PackPal's status tracking made this incredibly easy to manage.",
    author: "Miguel Torres",
    role: "Event Planner",
    initials: "MT"
  }
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">What Our Users Say</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from groups who use PackPal.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-slate-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-slate-700 mb-6 italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center">
                <div className="bg-blue-200 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  <span className="font-medium text-primary">{testimonial.initials}</span>
                </div>
                <div>
                  <h4 className="font-medium">{testimonial.author}</h4>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
