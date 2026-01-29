import React from "react";
import { Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-pink-200 md:pt-6 md:pb-2 pt-3 pb-1 shadow-pink-300">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-orange-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <Zap size={16} fill="currentColor" />
              </div>
              <span className="font-extrabold text-xl text-gray-900 tracking-tight">
                Nexora
              </span>
            </div>
            <p className="text-sm text-gray-400 font-medium">
              Your journey, curated perfectly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 font-medium">
            <p>© {new Date().getFullYear()} Nexora Inc. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
