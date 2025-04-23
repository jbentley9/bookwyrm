import { Outlet } from "react-router";
import type { ReactNode } from "react";

interface GridLayoutProps {
  children: ReactNode;
}

export default function GridLayout({ children }: GridLayoutProps) {
  return (
    <div style={{ 
      width: '100%',
      height: '100vh',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {children}
    </div>
  );
} 