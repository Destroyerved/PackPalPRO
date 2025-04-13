import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <a className="text-primary text-2xl font-bold">PackPal</a>
            </Link>
          </div>
          
          {/* Main Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-slate-600 hover:text-primary font-medium">Features</a>
            <a href="#how-it-works" className="text-slate-600 hover:text-primary font-medium">How It Works</a>
            <a href="#pricing" className="text-slate-600 hover:text-primary font-medium">Pricing</a>
            <a href="#contact" className="text-slate-600 hover:text-primary font-medium">Contact</a>
          </nav>
          
          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:block text-primary hover:text-primary-dark font-medium">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-blue-700 text-white font-medium">
                Get Started
              </Button>
            </Link>
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              <a 
                href="#features" 
                className="text-slate-600 hover:text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="text-slate-600 hover:text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#pricing" 
                className="text-slate-600 hover:text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a 
                href="#contact" 
                className="text-slate-600 hover:text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <Link href="/login">
                <a className="text-primary hover:text-primary-dark font-medium">Log In</a>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
