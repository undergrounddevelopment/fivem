import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ElectricCardProps {
  children: ReactNode;
  className?: string;
}

export function ElectricCard({ children, className = "" }: ElectricCardProps) {
  return (
    <div className={`electric-card-container ${className}`}>
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="turbulent-displace">
            <feTurbulence baseFrequency="0.02" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
        </defs>
      </svg>
      
      <div className="card-container">
        <div className="inner-container">
          <div className="border-outer">
            <motion.div 
              className="main-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="glow-layer-1" />
              <div className="glow-layer-2" />
              <div className="overlay-1" />
              <div className="overlay-2" />
              <div className="background-glow" />
              
              <div className="content-container">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ElectricButton({ children, onClick, className = "" }: { 
  children: ReactNode; 
  onClick?: () => void; 
  className?: string; 
}) {
  return (
    <motion.button
      className={`scrollbar-glass ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}