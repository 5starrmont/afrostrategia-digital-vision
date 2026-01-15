
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "#about" },
    { label: "Team", href: "#team" },
    { label: "Research", href: "/research" },
    { label: "Our Blog", href: "/publications" },
    { label: "Careers", href: "/careers" },
    { label: "Partnerships", href: "#partnerships" },
    { label: "Contact", href: "#contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname === href;
  };

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleNavClick = (href: string) => {
    if (!href.startsWith('#')) {
      // For page navigation, scroll to top immediately
      window.scrollTo(0, 0);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/aea9891e-d4df-4543-b771-163f7061a75c.png" 
              alt="AfroStrategia Foundation Logo" 
              className="h-12 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">AfroStrategia Foundation</h1>
              <p className="text-xs text-gray-600">Pan-African Think Tank</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              item.href.startsWith('/') ? (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href) 
                      ? 'text-emerald-700 border-b-2 border-emerald-700' 
                      : 'text-gray-700 hover:text-emerald-700'
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <Link
                  key={item.label}
                  to={'/' + item.href}
                  onClick={(e) => {
                    if (location.pathname === '/') {
                      e.preventDefault();
                      scrollToSection(item.href);
                    }
                  }}
                  className="text-gray-700 hover:text-emerald-700 px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                item.href.startsWith('/') ? (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => {
                      handleNavClick(item.href);
                      setIsMenuOpen(false);
                    }}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.href) 
                        ? 'text-emerald-700 bg-emerald-50' 
                        : 'text-gray-700 hover:text-emerald-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.href);
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-emerald-700 px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
                  >
                    {item.label}
                  </a>
                )
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
