
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsDepartmentsOpen(false);
  }, [location]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsDepartmentsOpen(false);
    };
    
    if (isDepartmentsOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isDepartmentsOpen]);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "#about" },
    { label: "Team", href: "#team" },
    { label: "Research", href: "/research" },
    { label: "Partnerships", href: "#partnerships" },
    { label: "Contact", href: "#contact" },
  ];

  const departmentItems = [
    { label: "Digital Trade & FinTech", href: "/digital-trade" },
    { label: "AI Governance & Ethics", href: "/ai-governance" },
    { label: "Afro-Sovereignty & Cyber Diplomacy", href: "/cyber-diplomacy" },
    { label: "Youth Strategy & Digital Rights", href: "/youth-strategy" },
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

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/aea9891e-d4df-4543-b771-163f7061a75c.png" 
              alt="AfroStrategia Logo" 
              className="h-12 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">AfroStrategia</h1>
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
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href) 
                      ? 'text-emerald-700 border-b-2 border-emerald-700' 
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
                    scrollToSection(item.href);
                  }}
                  className="text-gray-700 hover:text-emerald-700 px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
                >
                  {item.label}
                </a>
              )
            ))}
            
            {/* Departments Dropdown */}
            <div className="relative">
              <button
                className="text-gray-700 hover:text-emerald-700 px-3 py-2 text-sm font-medium transition-colors flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDepartmentsOpen(!isDepartmentsOpen);
                }}
              >
                Departments
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isDepartmentsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDepartmentsOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {departmentItems.map((dept) => (
                    <Link
                      key={dept.label}
                      to={dept.href}
                      className={`block px-4 py-3 text-sm transition-colors ${
                        isActive(dept.href)
                          ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-700'
                          : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                      onClick={() => setIsDepartmentsOpen(false)}
                    >
                      {dept.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
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
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.href) 
                        ? 'text-emerald-700 bg-emerald-50' 
                        : 'text-gray-700 hover:text-emerald-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.href);
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-emerald-700 px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
                  >
                    {item.label}
                  </a>
                )
              ))}
              
              {/* Mobile Departments */}
              <div className="border-t border-gray-100 pt-2 mt-2">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Departments</p>
                {departmentItems.map((dept) => (
                  <Link
                    key={dept.label}
                    to={dept.href}
                    className={`text-sm font-medium transition-colors block px-3 py-2 ${
                      isActive(dept.href)
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-gray-700 hover:text-emerald-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {dept.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
