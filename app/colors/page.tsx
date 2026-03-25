// app/colors/page.tsx (delete after testing)
import { colors } from "@/app/lib/colors";

export default function ColorsTestPage() {
  return (
    <div className="min-h-screen bg-qm-bg p-8">
      <h1 className="text-qm-primary text-2xl mb-6">Color System Test</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-qm-elevated p-4 rounded-lg border border-qm-border-card">
          <p className="text-qm-primary">Primary Text</p>
          <p className="text-qm-secondary">Secondary Text</p>
          <p className="text-qm-muted">Muted Text</p>
          <p className="text-qm-faint">Faint Text</p>
        </div>
        
        <div className="bg-qm-elevated p-4 rounded-lg border border-qm-border-card">
          <p className="text-qm-accent">Accent Text</p>
          <button className="bg-qm-accent text-white px-4 py-2 rounded-full mt-2">
            Accent Button
          </button>
          <div className="bg-qm-accent-soft p-2 rounded mt-2">
            <span className="text-qm-accent">Soft Accent Background</span>
          </div>
        </div>
      </div>
      
      <div className="bg-qm-card p-4 rounded-lg border border-qm-border-card">
        <p className="text-qm-primary">Card Example</p>
        <p className="text-qm-secondary text-sm">This uses bg-qm-card</p>
      </div>
    </div>
  );
}
