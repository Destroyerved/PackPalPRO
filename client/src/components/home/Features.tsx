import { 
  Users, 
  ListChecks, 
  ClipboardCheck, 
  RefreshCw, 
  AlertTriangle, 
  Download 
} from "lucide-react";

const features = [
  {
    icon: <Users className="h-8 w-8" />,
    title: "Role-based Access",
    description: "Assign roles (Owner, Admin, Member, Viewer) to control who can add, edit, or manage items."
  },
  {
    icon: <ListChecks className="h-8 w-8" />,
    title: "Categorized Checklists",
    description: "Group items into categories like Tech, Hygiene, Food, and create custom categories."
  },
  {
    icon: <ClipboardCheck className="h-8 w-8" />,
    title: "Item Status Tracking",
    description: "Track items from \"To Pack\" to \"Packed\" to \"Delivered\" with color-coded visual cues."
  },
  {
    icon: <RefreshCw className="h-8 w-8" />,
    title: "Real-time Updates",
    description: "Changes sync instantly across all devices, keeping everyone aligned and preventing overwrites."
  },
  {
    icon: <AlertTriangle className="h-8 w-8" />,
    title: "Conflict Alerts",
    description: "Get warnings when multiple users add the same item, with suggestions for merging or reassigning."
  },
  {
    icon: <Download className="h-8 w-8" />,
    title: "Export & Templates",
    description: "Export lists to PDF and use pre-loaded templates for quick checklist creation."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-16 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Powerful Features for Effortless Coordination</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            PackPal combines smart organization with collaborative tools to make group packing stress-free.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a href="#" className="text-primary hover:text-blue-700 font-medium inline-flex items-center">
            View all features <span className="ml-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
