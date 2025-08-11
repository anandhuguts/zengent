import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Last updated: August 11, 2025
            </p>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="mb-4">
                Zensar Technologies Limited ("we," "our," or "us") operates the Zengent AI Enterprise 
                Application Intelligence Platform. This page informs you of our policies regarding the 
                collection, use, and disclosure of personal data when you use our Service and the choices 
                you have associated with that data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Name and contact information</li>
                <li>Email address</li>
                <li>Username and encrypted password</li>
                <li>Professional information and position</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Project Data</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Source code files uploaded for analysis</li>
                <li>Project metadata and structure information</li>
                <li>Analysis results and generated reports</li>
                <li>GitHub repository information (when connected)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Usage Data</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Log files and usage patterns</li>
                <li>Device and browser information</li>
                <li>IP addresses and session data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>To provide and maintain our Service</li>
                <li>To process and analyze uploaded code projects</li>
                <li>To generate AI-powered insights and recommendations</li>
                <li>To communicate with you about the Service</li>
                <li>To improve our Service and develop new features</li>
                <li>To ensure security and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational security measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction. 
                This includes:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure database storage with PostgreSQL</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. AI and Machine Learning</h2>
              <p className="mb-4">
                Our Service uses artificial intelligence and machine learning technologies to analyze 
                code and generate insights. Your code data may be processed by:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Local AI models running on our infrastructure</li>
                <li>Third-party AI services (OpenAI, with appropriate safeguards)</li>
                <li>Vector databases for semantic analysis</li>
              </ul>
              <p className="mb-4">
                We ensure that all AI processing complies with data protection requirements and 
                maintains the confidentiality of your source code.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Data Sharing and Disclosure</h2>
              <p className="mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and the safety of others</li>
                <li>With trusted service providers under strict confidentiality agreements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p className="mb-4">
                We retain your personal information and project data for as long as necessary to provide 
                our services and comply with legal obligations. You may request deletion of your data 
                at any time, subject to legal and technical constraints.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to data processing</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to enhance your experience. These may include:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Session cookies for authentication</li>
                <li>Functional cookies for user preferences</li>
                <li>Analytics cookies to improve our Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
              <p className="mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <p className="mb-2">
                <strong>Email:</strong> privacy@zensar.com
              </p>
              <p className="mb-2">
                <strong>Data Protection Officer:</strong> dpo@zensar.com
              </p>
              <p className="mb-2">
                <strong>Address:</strong> Zensar Technologies Limited, Hyderabad, India
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}