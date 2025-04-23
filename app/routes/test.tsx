// app/routes/test.tsx
import TestGrid from "./test.grid";

export default function TestPage() {
  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <TestGrid />
    </div>
  );
}