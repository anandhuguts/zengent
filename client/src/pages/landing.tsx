import zenagentAgents from "@assets/zenagentw_1754760754148.png";
import zensarLogo from "@assets/Zensar_composite_logo_whit_ai_1754732936523.png";
import { LoginForm } from "@/components/login-form";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex">
      {/* Left Panel - Hero Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-30">
          <img 
            src={zenagentAgents} 
            alt="Zengent AI Agents" 
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-lg">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src={zensarLogo} 
              alt="Zensar Logo" 
              className="h-20 w-auto object-contain mx-auto filter brightness-0 invert"
            />
          </div>

          <h1 className="text-4xl font-bold mb-4">
            ENTERPRISE APPLICATION INTELLIGENCE
          </h1>
          <h2 className="text-xl font-medium mb-6 opacity-90">
            PLATFORM POWERED BY AI AGENTS
          </h2>
          <p className="text-lg opacity-80 leading-relaxed">
            Analyze your enterprise applications with powerful AI-driven insights and comprehensive 
            project intelligence for better decision making.
          </p>
          
          {/* Dots indicator */}
          <div className="flex justify-center space-x-2 mt-8">
            <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
            <div className="w-3 h-3 bg-white rounded-full opacity-50"></div>
            <div className="w-3 h-3 bg-white rounded-full opacity-30"></div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-96 bg-white flex flex-col justify-center items-center p-8 shadow-2xl">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">ZENGENT AI</h3>
            <p className="text-gray-600">Secure platform access</p>
          </div>
          
          <LoginForm />
          
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Prepared by Diamond Zensar Team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}