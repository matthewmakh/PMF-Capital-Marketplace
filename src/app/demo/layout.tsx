export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-950 text-white overflow-hidden">
      {children}
    </div>
  );
}
