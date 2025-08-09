import { Link } from "wouter";
import zensarLogo from "@assets/Zensar_composite_logo_whit_ai_1754732936523.png";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={zensarLogo} 
              alt="Zensar Logo" 
              className="h-10 w-auto object-contain"
            />
            <h1 className="text-xl font-semibold text-gray-800">Terms of Use</h1>
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            Back to Login
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Terms of Use</h2>
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Acceptance of Terms</h3>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using the Zengent AI - Enterprise Application Intelligence Platform ("the Platform"), 
                you agree to be bound by these Terms of Use and all applicable laws and regulations.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Platform Description</h3>
              <p className="text-gray-600 leading-relaxed">
                Zengent AI is an enterprise application intelligence platform that provides AI-powered analysis 
                of multi-language project architectures including Java, Python, PySpark, and Mainframe codebases.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">3. User Responsibilities</h3>
              <ul className="text-gray-600 leading-relaxed list-disc list-inside space-y-2">
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the platform only for legitimate business purposes</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Respect intellectual property rights</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">4. Data Security and Privacy</h3>
              <p className="text-gray-600 leading-relaxed">
                We implement enterprise-grade security measures to protect your data. Your code and project 
                information are processed securely and in accordance with our Privacy Policy.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">5. AI Model Usage</h3>
              <p className="text-gray-600 leading-relaxed">
                The platform supports multiple AI models including OpenAI GPT-4o, AWS Claude 3.5, Google Gemini Pro, 
                and Local LLM options. Usage is subject to respective AI provider terms and our usage policies.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">6. Limitation of Liability</h3>
              <p className="text-gray-600 leading-relaxed">
                Zensar Technologies Limited and its affiliates shall not be liable for any indirect, incidental, 
                special, or consequential damages arising from the use of this platform.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">7. Modifications</h3>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of the platform 
                constitutes acceptance of any modifications.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">8. Contact Information</h3>
              <p className="text-gray-600 leading-relaxed">
                For questions about these Terms of Use, please contact us at{" "}
                <a href="https://www.zensar.com" className="text-blue-600 hover:text-blue-800">
                  www.zensar.com
                </a>
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: January 2025 | Prepared by Diamond Zensar Team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}