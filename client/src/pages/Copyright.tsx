import Navbar from "@/components/Navbar";

export default function Copyright() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Copyright Policy / DMCA</h1>
        <p className="text-muted-foreground mb-8">
          <strong>Effective Date:</strong> February 8, 2026 | <strong>Last Updated:</strong> February 8, 2026
        </p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Respect for Intellectual Property</h2>
            <p>
              ONLYDJS respects the intellectual property rights of others and expects its users to do the same. We are committed to complying with the Digital Millennium Copyright Act (DMCA) and other applicable copyright laws.
            </p>
            <p>
              Users are solely responsible for ensuring that any content they upload to the platform does not infringe on the copyrights, trademarks, or other intellectual property rights of third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Service Provider Status</h2>
            <p>
              ONLYDJS operates as a technology and platform provider. We do not own, create, sell, or pre-approve user-generated content. We act as a service provider under the DMCA and provide a platform for users to upload and share their own original content. ONLYDJS does not promote, distribute, or commercially exploit user-generated content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. DMCA Takedown Notice Procedure</h2>
            <p>
              If you believe that your copyrighted work has been uploaded to ONLYDJS without authorization and constitutes copyright infringement, you may submit a DMCA takedown notice to our designated Copyright Agent.
            </p>
            <p>
              To be effective, your DMCA notice must include all of the following information:
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Required Elements of a Valid DMCA Notice</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>Identification of the Copyrighted Work:</strong><br />
                A description of the copyrighted work that you claim has been infringed. If multiple works are covered by a single notification, you may provide a representative list.
              </li>
              <li>
                <strong>Identification of the Infringing Material:</strong><br />
                A description of the material that you claim is infringing and that you request to be removed or disabled, including sufficient information to allow us to locate the material on the platform (such as a URL or other specific location).
              </li>
              <li>
                <strong>Your Contact Information:</strong><br />
                Your name, address, telephone number, and email address so that we can contact you.
              </li>
              <li>
                <strong>Statement of Good Faith Belief:</strong><br />
                A statement that you have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
              </li>
              <li>
                <strong>Statement of Accuracy:</strong><br />
                A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of the exclusive right that is allegedly infringed.
              </li>
              <li>
                <strong>Physical or Electronic Signature:</strong><br />
                Your physical or electronic signature.
              </li>
            </ol>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Submitting a DMCA Notice</h3>
            <p>
              Please send your DMCA takedown notice to our designated Copyright Agent at:
            </p>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p><strong>Email:</strong> <a href="mailto:dmca@onlydjss.com" className="text-primary hover:underline">dmca@onlydjss.com</a></p>
              <p><strong>Subject Line:</strong> DMCA Takedown Notice</p>
            </div>
            <p className="mt-4">
              Please note that under the DMCA, you may be liable for damages, including costs and attorneys' fees, if you knowingly materially misrepresent that material is infringing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Response to DMCA Notices</h2>
            <p>Upon receipt of a valid DMCA takedown notice, we will:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Promptly remove or disable access to the allegedly infringing material.</li>
              <li>Notify the user who uploaded the material that it has been removed or disabled.</li>
              <li>Provide the user with a copy of the DMCA notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Counter-Notification Process</h2>
            <p>
              If you believe that your content was removed or disabled as a result of mistake or misidentification, you may submit a DMCA counter-notification to our Copyright Agent.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Required Elements of a Valid Counter-Notification</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>Your Contact Information:</strong><br />
                Your name, address, telephone number, and email address.
              </li>
              <li>
                <strong>Identification of Removed Material:</strong><br />
                A description of the material that was removed or disabled and the location where it appeared before it was removed or disabled.
              </li>
              <li>
                <strong>Statement Under Penalty of Perjury:</strong><br />
                A statement under penalty of perjury that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification.
              </li>
              <li>
                <strong>Consent to Jurisdiction:</strong><br />
                A statement that you consent to the jurisdiction of the federal court in your district (or if you are outside the United States, any judicial district in which ONLYDJS may be found), and that you will accept service of process from the person who filed the original DMCA notice or an agent of that person.
              </li>
              <li>
                <strong>Physical or Electronic Signature:</strong><br />
                Your physical or electronic signature.
              </li>
            </ol>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Submitting a Counter-Notification</h3>
            <p>
              Please send your counter-notification to our Copyright Agent at:
            </p>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p><strong>Email:</strong> <a href="mailto:dmca@onlydjss.com" className="text-primary hover:underline">dmca@onlydjss.com</a></p>
              <p><strong>Subject Line:</strong> DMCA Counter-Notification</p>
            </div>
            <p className="mt-4">
              Upon receipt of a valid counter-notification, we will forward it to the party who submitted the original DMCA notice. If that party does not file a court action seeking an injunction against the user within 10-14 business days, we may restore the removed material at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Repeat Infringer Policy</h2>
            <p>
              ONLYDJS has adopted a policy of terminating, in appropriate circumstances, the accounts of users who are repeat infringers of copyright.
            </p>
            <p>
              If a user repeatedly uploads content that infringes on the copyrights of others, we reserve the right to suspend or permanently terminate that user's account without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Content Removal Upon Valid Notice</h2>
            <p>
              We will act expeditiously to remove or disable access to material that is the subject of a valid DMCA takedown notice. However, we do not pre-screen user content and are not responsible for monitoring or reviewing all content uploaded to the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. User Responsibility for Uploaded Content</h2>
            <p>
              Users are solely responsible for ensuring that any content they upload to ONLYDJS complies with applicable copyright laws and does not infringe on the rights of third parties.
            </p>
            <p>By uploading content to the platform, users represent and warrant that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>They own all rights to the content or have obtained all necessary permissions and licenses.</li>
              <li>Their content does not infringe on the intellectual property rights of any third party.</li>
              <li>They have the authority to grant ONLYDJS the license to host and display the content as described in our Terms of Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. No Liability for User Content</h2>
            <p>
              ONLYDJS does not own, control, or endorse user-generated content. We are not liable for any copyright infringement or other violations of law resulting from user-uploaded content.
            </p>
            <p>
              We act solely as a service provider and platform host. Any disputes regarding copyright infringement should be directed to the user who uploaded the content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Modifications to This Policy</h2>
            <p>
              We reserve the right to modify this Copyright Policy at any time. We will provide notice of material changes by posting the updated policy on our platform and updating the "Last Updated" date.
            </p>
            <p>
              Your continued use of the platform after changes are posted constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. DMCA Contact Information</h2>
            <p>
              For all DMCA-related inquiries, notices, and counter-notifications, please contact our designated Copyright Agent at:
            </p>
            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
              <div>
                <p><strong>Email:</strong> <a href="mailto:dmca@onlydjss.com" className="text-primary hover:underline">dmca@onlydjss.com</a></p>
              </div>
              
              <div>
                <p className="font-semibold mb-2">Mailing Addresses (for notice delivery only):</p>
                
                <div className="mb-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Mexico Office:</p>
                  <p className="text-sm">Onlydjs</p>
                  <p className="text-sm">Av. Paseo de la Reforma 404, Int. 602</p>
                  <p className="text-sm">Colonia Juárez, Cuauhtémoc</p>
                  <p className="text-sm">Ciudad de México, 06600</p>
                  <p className="text-sm">Mexico</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">United States Office:</p>
                  <p className="text-sm">Onlydjs</p>
                  <p className="text-sm">304 S. Jones Blvd #3779</p>
                  <p className="text-sm">Las Vegas, NV 89107</p>
                  <p className="text-sm">United States</p>
                </div>
              </div>
            </div>
            <p className="mt-4">
              Please ensure that your DMCA notice or counter-notification includes all required elements as outlined above. Incomplete notices may not be processed.
            </p>
          </section>

          <section className="border-t border-border pt-8 mt-8">
            <p className="text-sm text-muted-foreground">
              By using ONLYDJS, you acknowledge that you have read and understood this Copyright Policy and agree to comply with all applicable copyright laws.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
