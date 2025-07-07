import { Globe, Mail, MapPin, Phone } from "lucide-react";

export const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/lovable-uploads/aea9891e-d4df-4543-b771-163f7061a75c.png" 
                alt="AfroStrategia Foundation Logo" 
                className="h-12 w-auto"
              />
              <div>
                <h3 className="text-xl font-bold">AfroStrategia Foundation</h3>
                <p className="text-gray-400 text-sm">Pan-African Think Tank</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Strategizing Africa's digital future through research, policy innovation, and collaborative diplomacy. Building bridges between African wisdom and global digital governance.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-emerald-400" />
                <span className="text-gray-300">contact@afrostrategia.org</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-emerald-400" />
                <span className="text-gray-300">Nairobi, Kenya</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-emerald-400" />
                <span className="text-gray-300">Pan-African Operations</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Research Areas</h4>
            <ul className="space-y-3 text-gray-300">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Digital Trade & FinTech</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">AI Governance & Ethics</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Cyber Diplomacy</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Youth Digital Rights</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Connect</h4>
            <ul className="space-y-3 text-gray-300">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Partnership Opportunities</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Research Collaboration</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Policy Briefings</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Media Inquiries</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 AfroStrategia Foundation. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">Research Ethics</a>
              <a href="/admin" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">Admin</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
