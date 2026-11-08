import React from 'react';
import {
  X,
  Terminal,
  Server,
  Cloud,
  ShieldCheck,
  Cpu,
  KeyRound,
  ExternalLink,
  Layers,
  Copy,
  Check,
} from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0A1128] border border-cyan-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100 cyber-glow-sm max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close guide modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Server className="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Vasisox Nexus AI Deployment &amp; Running Guide
            </h2>
            <p className="text-xs text-slate-400">
              Complete technical specification for local development, production hosting, and cloud sync.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-300">
          {/* Section 1: Running Locally */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>1. Local Development Quickstart</span>
              </h3>
              <button
                onClick={() =>
                  copyCode(
                    'git clone <repository_url>\ncd vasisox-nexus-ai\nnpm install\nnpm run dev',
                    'local'
                  )
                }
                className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
              >
                {copiedSection === 'local' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'local' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Run the full-stack application (Express API backend with Vite development middleware) on Node.js 20+:
            </p>
            <div className="bg-black/80 rounded-lg p-3 font-mono text-xs text-cyan-300 overflow-x-auto">
              <p className="text-slate-500"># 1. Install dependencies</p>
              <p>npm install</p>
              <p className="text-slate-500 mt-2"># 2. Start full-stack development server</p>
              <p>npm run dev</p>
              <p className="text-slate-500 mt-2"># The application will listen on http://localhost:3000</p>
            </div>
          </div>

          {/* Section 2: Environment Variables */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-yellow-400" />
              <span>2. Environment Variables &amp; Gemini API</span>
            </h3>
            <p className="text-xs text-slate-400">
              Create a <code className="text-cyan-300 font-mono">.env</code> file in the project root:
            </p>
            <div className="bg-black/80 rounded-lg p-3 font-mono text-xs text-yellow-200 overflow-x-auto space-y-1">
              <p><span className="text-slate-500"># Required for live Gemini 3.8 Flash model</span></p>
              <p>GEMINI_API_KEY=&quot;your_google_ai_studio_api_key&quot;</p>
              <p className="mt-2"><span className="text-slate-500"># Server port (defaults to 3000)</span></p>
              <p>PORT=3000</p>
              <p className="mt-2"><span className="text-slate-500"># Optional production host URL</span></p>
              <p>APP_URL=&quot;https://your-domain.run.app&quot;</p>
            </div>
            <p className="text-[11px] text-slate-400">
              * Note: If <code className="text-cyan-300 font-mono">GEMINI_API_KEY</code> is not provided, Vasisox Nexus AI automatically transitions into a clearly labelled <strong>Intelligent Demo Mode</strong> with pre-computed academic and productivity reasoning.
            </p>
          </div>

          {/* Section 3: Production Build & Cloud Run / Container Deployment */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-400" />
              <span>3. Production Build &amp; Deployment (Google Cloud Run / Docker)</span>
            </h3>
            <p className="text-xs text-slate-400">
              To build and launch the production container:
            </p>
            <div className="bg-black/80 rounded-lg p-3 font-mono text-xs text-blue-200 overflow-x-auto">
              <p className="text-slate-500"># Build client bundle with Vite</p>
              <p>npm run build</p>
              <p className="text-slate-500 mt-2"># Start production Node.js server</p>
              <p>npm start</p>
            </div>
            <p className="text-[11px] text-slate-400">
              In Google Cloud Run or Docker, set <code className="text-cyan-300 font-mono">NODE_ENV=production</code>. Express serves the pre-compiled assets from <code className="text-cyan-300 font-mono">/dist</code> alongside the Gemini AI API endpoints.
            </p>
          </div>

          {/* Section 4: Firebase Authentication & Cross-Device Sync */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>4. Cloud Authentication &amp; Multi-Device Data Sync</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vasisox Nexus AI is provisioned with Google Cloud Firestore and Firebase Authentication.
              Users can sign up using email/password or Google Single Sign-On. When authenticated, tasks, study schedules, revision intervals, and financial logs continuously synchronize in real time to:
            </p>
            <div className="bg-black/80 rounded-lg p-2.5 font-mono text-xs text-emerald-300">
              /users/{'{userId}'}/syncState/nexus
            </div>
            <p className="text-[11px] text-slate-400">
              If unauthenticated, all records are stored in browser LocalStorage (<code className="text-cyan-300 font-mono">vasisox_nexus_data_v1</code>) and can be exported as a JSON backup at any time.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
