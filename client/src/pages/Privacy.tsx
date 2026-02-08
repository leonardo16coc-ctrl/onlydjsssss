import Navbar from "@/components/Navbar";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          <strong>Effective Date:</strong> February 8, 2026 | <strong>Last Updated:</strong> February 8, 2026
        </p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              ONLYDJS ("we," "us," or "our") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our subscription-based SaaS platform.
            </p>
            <p>
              By using ONLYDJS, you consent to the practices described in this Privacy Policy. If you do not agree with this policy, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us and information that is automatically collected when you use our platform.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, username, and password.</li>
              <li><strong>Payment Information:</strong> We collect payment information necessary to process your subscription, including credit card details or other payment method information. Payment processing is handled by third-party payment processors, and we do not store full payment card details on our servers.</li>
              <li><strong>Profile Information:</strong> You may choose to provide additional information such as a profile picture, bio, or other details.</li>
              <li><strong>User Content:</strong> Any content you upload to the platform, including audio files, images, and text.</li>
              <li><strong>Communications:</strong> If you contact us for support or other inquiries, we collect the information you provide in those communications.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage Data:</strong> We collect information about how you interact with the platform, including pages visited, features used, and time spent on the platform.</li>
              <li><strong>Device Information:</strong> We collect information about the device you use to access the platform, including device type, operating system, browser type, IP address, and unique device identifiers.</li>
              <li><strong>Log Data:</strong> Our servers automatically record information when you use the platform, including access times, pages viewed, and referring URLs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>To Provide and Maintain the Platform:</strong> To operate, maintain, and improve our platform and services.</li>
              <li><strong>To Process Transactions:</strong> To process your subscription payments and manage your account.</li>
              <li><strong>To Communicate with You:</strong> To send you service-related notices, updates, security alerts, and support messages.</li>
              <li><strong>To Personalize Your Experience:</strong> To customize content and features based on your preferences and usage patterns.</li>
              <li><strong>To Ensure Security:</strong> To detect, prevent, and address technical issues, fraud, and security vulnerabilities.</li>
              <li><strong>To Comply with Legal Obligations:</strong> To comply with applicable laws, regulations, and legal processes.</li>
              <li><strong>To Improve Our Services:</strong> To analyze usage trends and gather demographic information to improve our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to collect information about your activity on our platform.
            </p>
            <p>
              <strong>Cookies</strong> are small data files stored on your device that help us recognize you and remember your preferences.
            </p>
            <p><strong>Types of Cookies We Use:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Necessary for the platform to function properly, including authentication and security.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the platform so we can improve it.</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences for a better user experience.</li>
            </ul>
            <p>
              You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. How We Share Your Information</h2>
            <p>
              We do not sell, rent, or trade your personal information to third parties. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf, such as payment processing, data hosting, analytics, and customer support. These providers are contractually obligated to protect your information and use it only for the purposes for which it was disclosed.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities, such as a court order or subpoena.</li>
              <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will provide notice before your information is transferred and becomes subject to a different privacy policy.</li>
              <li><strong>Protection of Rights:</strong> We may disclose information to protect the rights, property, or safety of ONLYDJS, our users, or others, including enforcing our Terms of Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <p>
              We implement reasonable administrative, technical, and physical security measures to protect your information from unauthorized access, disclosure, alteration, or destruction.
            </p>
            <p>
              However, no method of transmission over the internet or electronic storage is completely secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.
            </p>
            <p>
              When you cancel your subscription or delete your account, we will delete or anonymize your personal information within a reasonable timeframe, except where we are required to retain it for legal or regulatory purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Your Rights and Choices</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> You may request access to the personal information we hold about you.</li>
              <li><strong>Correction:</strong> You may request that we correct inaccurate or incomplete information.</li>
              <li><strong>Deletion:</strong> You may request that we delete your personal information, subject to certain exceptions.</li>
              <li><strong>Objection:</strong> You may object to our processing of your information in certain circumstances.</li>
              <li><strong>Data Portability:</strong> You may request a copy of your information in a structured, commonly used, and machine-readable format.</li>
              <li><strong>Withdraw Consent:</strong> If we process your information based on your consent, you may withdraw that consent at any time.</li>
            </ul>
            <p>
              To exercise these rights, please contact us at the email address provided below. We will respond to your request in accordance with applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Third-Party Services</h2>
            <p>
              Our platform may contain links to third-party websites or services that are not operated by us. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party services you access.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p>
              ONLYDJS is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected information from a child under 18, we will take steps to delete that information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country.
            </p>
            <p>
              By using ONLYDJS, you consent to the transfer of your information to other countries in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes by posting the updated policy on our platform and updating the "Last Updated" date.
            </p>
            <p>
              Your continued use of the platform after changes are posted constitutes your acceptance of the revised Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> <a href="mailto:privacy@onlydjss.com" className="text-primary hover:underline">privacy@onlydjss.com</a>
            </p>
          </section>

          <section className="border-t border-border pt-8 mt-8">
            <p className="text-sm text-muted-foreground">
              By using ONLYDJS, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
