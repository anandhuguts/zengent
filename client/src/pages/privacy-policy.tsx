import { Link } from "wouter";
import zensarLogo from "@assets/Zensar_composite_logo_whit_ai_1754732936523.png";

export default function PrivacyPolicy() {
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
            <h1 className="text-xl font-semibold text-gray-800">Privacy Policy</h1>
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            Back to Login
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Privacy Policy</h2>
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Information We Collect</h3>
              <p className="text-gray-600 leading-relaxed">
                We collect information necessary to provide our enterprise application intelligence services:
              </p>
              <ul className="text-gray-600 leading-relaxed list-disc list-inside space-y-2 mt-3">
                <li>Account information (username, email, profile data)</li>
                <li>Project files and source code for analysis</li>
                <li>Usage analytics and platform interaction data</li>
                <li>AI analysis results and generated reports</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">2. How We Use Your Information</h3>
              <p className="text-gray-600 leading-relaxed">
                Your information is used to:
              </p>
              <ul className="text-gray-600 leading-relaxed list-disc list-inside space-y-2 mt-3">
                <li>Provide AI-powered code analysis and architectural insights</li>
                <li>Generate comprehensive project intelligence reports</li>
                <li>Improve platform functionality and user experience</li>
                <li>Ensure security and prevent unauthorized access</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">3. AI Model Processing</h3>
              <p className="text-gray-600 leading-relaxed">
                Our platform supports multiple AI processing options:
              </p>
              <ul className="text-gray-600 leading-relaxed list-disc list-inside space-y-2 mt-3">
                <li><strong>Online AI Models:</strong> OpenAI GPT-4o, AWS Claude 3.5, Google Gemini Pro</li>
                <li><strong>Local LLM Options:</strong> Complete offline processing with no external data transmission</li>
                <li>You can choose your preferred AI model for enhanced privacy control</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">4. Data Security</h3>
              <p className="text-gray-600 leading-relaxed">
                We implement enterprise-grade security measures including:
              </p>
              <ul className="text-gray-600 leading-relaxed list-disc list-inside space-y-2 mt-3">
                <li>Encrypted data transmission and storage</li>
                <li>Secure authentication and session management</li>
                <li>Regular security audits and monitoring</li>
                <li>Privacy-first local LLM processing options</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">5. Data Retention</h3>
              <p className="text-gray-600 leading-relaxed">
                We retain your data only as long as necessary to provide our services and comply with 
                legal obligations. Project analysis data is stored securely and can be deleted upon request.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">6. Third-Party Services</h3>
              <p className="text-gray-600 leading-relaxed">
                When using online AI models, your data may be processed by third-party AI providers 
                (OpenAI, AWS, Google) according to their respective privacy policies. Local LLM options 
                ensure complete data privacy with no external processing.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">7. Your Rights</h3>
              <p className="text-gray-600 leading-relaxed">
                You have the right to:
              </p>
              <ul className="text-gray-600 leading-relaxed list-disc list-inside space-y-2 mt-3">
                <li>Access and review your personal data</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Choose your preferred AI processing method</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">8. Contact Us</h3>
              <p className="text-gray-600 leading-relaxed">
                For privacy-related questions or requests, please contact us at{" "}
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