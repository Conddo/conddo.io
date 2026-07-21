import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { LegalDoc } from "@/components/marketing/LegalDoc";

export const metadata: Metadata = {
  title: "Terms of Service — Conddo",
  description:
    "The terms that govern your access to and use of the Conddo platform.",
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <LegalDoc title="Terms of Service" effective="July 2026" updated="July 2026">
        <h2>1. Introduction and Acceptance</h2>
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
          use of the Conddo platform and all related services, features, and
          applications (collectively, the &ldquo;Service&rdquo;), operated by
          Conddo (RC: 9693423), a company registered under the laws of the
          Federal Republic of Nigeria (&ldquo;Conddo&rdquo;, &ldquo;we&rdquo;,
          &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
        </p>
        <p>
          By creating an account, accessing, or using the Service, you agree to
          be bound by these Terms. If you do not agree, you must not use the
          Service.
        </p>
        <p>
          These Terms apply to all users of the Service, including business
          owners who register as tenants and their customers who interact with
          tenant-powered websites.
        </p>

        <h2>2. Description of the Service</h2>
        <p>
          Conddo is an AI-native business operating system designed for
          Nigerian small and medium businesses. The Service allows registered
          tenants to:
        </p>
        <ul>
          <li>Create and manage a business website hosted on a Conddo subdomain</li>
          <li>Manage orders, bookings, and customer records</li>
          <li>Accept and track payments through integrated payment providers</li>
          <li>Manage inventory and stock levels</li>
          <li>Run marketing campaigns and automated workflows</li>
          <li>Access business analytics and performance data</li>
        </ul>
        <p>
          The Service includes an AI Provisioning feature that configures tools
          based on a plain-language business description. All AI-generated
          configurations are presented for tenant review and confirmation
          before activation. Conddo does not guarantee that AI-generated
          configurations will be perfect for every business, and tenants are
          encouraged to review and adjust configurations before use.
        </p>

        <h2>3. Account Registration</h2>
        <h3>3.1 Eligibility</h3>
        <p>
          You must be at least 18 years old to create a Conddo account. By
          registering, you confirm that you are at least 18 years old and have
          the legal capacity to enter into a binding agreement.
        </p>

        <h3>3.2 Account Creation</h3>
        <p>
          To use the Service, you must register with a valid email address and
          create a password. You agree to provide accurate, current, and
          complete information during registration and to keep your account
          information updated.
        </p>

        <h3>3.3 Account Security</h3>
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activity that occurs under your
          account. You must notify us immediately at support@getconddo.com if
          you suspect unauthorized access to your account. Conddo is not liable
          for any loss or damage arising from your failure to protect your
          account credentials.
        </p>

        <h3>3.4 Email Verification</h3>
        <p>
          After registration, you must verify your email address to unlock full
          platform access. Unverified accounts have limited access and cannot
          publish a live website, process live payments, or activate
          automations.
        </p>

        <h2>4. Subscription Plans and Billing</h2>
        <h3>4.1 Available Plans</h3>
        <p>Conddo offers the following subscription plans:</p>
        <ul>
          <li><strong>Free:</strong> &#8358;0 per month. Full platform access within a monthly credit limit of 100 credits. No credit card required.</li>
          <li><strong>Student:</strong> &#8358;3,000 per month. Full platform access with 300 credits per month. Requires verification of active student status via a valid university email address.</li>
          <li><strong>Starter:</strong> &#8358;5,000 per month. Full platform access with 500 credits per month.</li>
          <li><strong>Growth:</strong> &#8358;15,000 per month. Full platform access with 3,000 credits per month.</li>
          <li><strong>Pro:</strong> &#8358;30,000 per month. Full platform access with 10,000 credits per month.</li>
        </ul>
        <p>
          All paid plans offer quarterly billing (15% discount) and annual
          billing (30% discount) as alternatives to monthly billing. Pricing is
          subject to change with 30 days notice to existing subscribers.
        </p>

        <h3>4.2 Credits</h3>
        <p>
          Paid and free plans include a monthly credit allocation. Credits are
          consumed by specific platform actions including order processing,
          automated workflow triggers, AI-generated content, and website
          generation. Credits reset at the start of each billing cycle and do
          not roll over. Additional top-up credits can be purchased at any
          time.
        </p>

        <h3>4.3 Payment</h3>
        <p>
          Subscription payments for your Conddo plan (and any paid program
          enrolments) are processed by <strong>Paystack</strong>. By
          subscribing to a paid plan, you authorize Conddo to charge your
          payment method through Paystack on a recurring basis (monthly,
          quarterly, or annually as selected). All prices are in Nigerian Naira
          (NGN).
        </p>
        <p>
          Payments received by your business from your customers &mdash;
          including online orders, deposits, POS collections, and walk-in
          payments &mdash; are processed by <strong>Importapay</strong> and/or{" "}
          <strong>Routepay</strong>. Funds settle to the bank account you
          nominate, subject to the applicable provider&rsquo;s settlement
          schedule, fees, and Know Your Customer (KYC) checks. By enabling
          customer payments on your Conddo account, you accept the terms of
          service of the relevant payment provider(s), which apply in addition
          to these Terms.
        </p>

        <h3>4.4 Failed Payments</h3>
        <p>
          If a payment fails, we will notify you and provide a 3-day grace
          period to update your payment method. If payment is not received
          within the grace period, your account will be downgraded to the Free
          plan until payment is made. Your data will not be deleted during this
          period.
        </p>

        <h3>4.5 Refunds</h3>
        <p>
          Subscription fees are non-refundable except where required by
          Nigerian consumer protection law. If you cancel your subscription
          mid-cycle, you will retain access to your paid plan until the end of
          the current billing period.
        </p>
        <p>
          Refunds of customer payments (customer-to-tenant transactions) are
          the responsibility of the tenant. Conddo may facilitate refunds
          through the underlying payment provider but does not itself hold or
          adjudicate customer funds.
        </p>

        <h3>4.6 Student Plan Verification</h3>
        <p>
          The Student plan requires verification of active student status
          using a valid university or educational institution email address.
          Student pricing is valid for 24 months from the date of verification.
          After 24 months, re-verification is required. Conddo reserves the
          right to revoke Student pricing if verification cannot be confirmed.
        </p>

        <h2>5. Your Data and Content</h2>
        <h3>5.1 Ownership</h3>
        <p>
          You own all data, content, and information you create, upload, or
          store on the Conddo platform, including your customer records, order
          data, product listings, website content, and business information.
          Conddo does not claim any ownership rights over your data.
        </p>

        <h3>5.2 License to Conddo</h3>
        <p>
          By using the Service, you grant Conddo a limited, non-exclusive,
          worldwide license to store, process, and display your content solely
          for the purpose of providing the Service to you. This license ends
          when you delete the content or close your account.
        </p>

        <h3>5.3 Your Responsibilities as a Data Controller</h3>
        <p>
          When you collect and store your customers&rsquo; personal data on
          Conddo, you are the data controller and Conddo is the data
          processor. You are responsible for:
        </p>
        <ul>
          <li>Ensuring you have a lawful basis to collect your customers&rsquo; data</li>
          <li>Informing your customers that their data is processed on a third-party platform</li>
          <li>Responding to your customers&rsquo; data rights requests</li>
          <li>Complying with the Nigeria Data Protection Act 2023 and any other applicable data protection laws</li>
        </ul>

        <h3>5.4 Data Export</h3>
        <p>
          You may request an export of your data at any time by contacting
          support@getconddo.com. We will provide your data in a
          machine-readable format within 14 business days.
        </p>

        <h3>5.5 Data Deletion on Account Closure</h3>
        <p>
          When you close your account, your data will be retained for 90 days
          to allow for reactivation or export. After 90 days, your data will be
          permanently deleted from our systems. Transaction records may be
          retained longer as required by Nigerian financial regulations.
        </p>

        <h2>6. Acceptable Use</h2>
        <p>
          You agree to use the Service only for lawful purposes and in
          accordance with these Terms. You must not use the Service to:
        </p>
        <ul>
          <li>Violate any applicable Nigerian law or regulation</li>
          <li>Sell counterfeit, illegal, or prohibited goods or services</li>
          <li>Engage in fraudulent, deceptive, or misleading practices toward your customers</li>
          <li>Send spam, unsolicited marketing, or bulk communications without recipient consent</li>
          <li>Upload malicious code, viruses, or any software that could damage or interfere with the Service</li>
          <li>Attempt to gain unauthorized access to any part of the Service or another tenant&rsquo;s data</li>
          <li>Use the Service to process payments for illegal activities</li>
          <li>Impersonate another person or entity</li>
          <li>Engage in any activity that violates the rights of others, including intellectual property rights</li>
        </ul>
        <p>
          Conddo reserves the right to suspend or terminate accounts that
          violate these rules without prior notice in serious cases. Where
          suspicious payment activity is detected, Conddo may also pause
          settlements and cooperate with the relevant payment providers and
          regulators pending investigation.
        </p>

        <h2>7. Tenant Websites</h2>
        <h3>7.1 Subdomain</h3>
        <p>
          Each tenant receives a business website hosted at a subdomain of
          getconddo.com (e.g., yourbusiness.getconddo.com). This subdomain is
          provided for the duration of your active subscription. If your
          subscription lapses, your website will be temporarily suspended and
          restored upon renewal.
        </p>

        <h3>7.2 Custom Domains</h3>
        <p>
          Custom domain support may be available as a feature in future
          updates. Where offered, tenants are responsible for purchasing and
          maintaining their own domain names.
        </p>

        <h3>7.3 Content on Tenant Websites</h3>
        <p>
          You are solely responsible for all content published on your
          Conddo-powered website, including product descriptions, pricing,
          images, and any other information. Conddo does not review or endorse
          the content of tenant websites and is not liable for any claims
          arising from that content.
        </p>

        <h2>8. Third-Party Integrations</h2>
        <p>
          The Service integrates with third-party providers including{" "}
          <strong>Paystack</strong> (subscription payments),{" "}
          <strong>Importapay</strong> and <strong>Routepay</strong> (customer
          payments and payouts), <strong>Brevo</strong> (email and SMS),{" "}
          <strong>Meta</strong> (Facebook and Instagram publishing), and AI
          model providers. Your use of these integrations is also subject to
          the respective third-party terms and privacy policies. Conddo is not
          responsible for the availability, accuracy, or conduct of third-party
          services.
        </p>

        <h2>9. Intellectual Property</h2>
        <h3>9.1 Conddo&rsquo;s Property</h3>
        <p>
          The Conddo platform, including its software, design, brand, logo,
          features, and documentation, is owned by Conddo and protected by
          applicable intellectual property laws. Nothing in these Terms
          transfers any intellectual property rights in the platform to you.
        </p>

        <h3>9.2 Feedback</h3>
        <p>
          If you provide feedback, suggestions, or ideas about the Service,
          you grant Conddo the right to use that feedback without restriction
          or compensation to you.
        </p>

        <h2>10. Service Availability</h2>
        <p>
          We aim to keep the Service available at all times but we do not
          guarantee uninterrupted availability. The Service may be temporarily
          unavailable due to maintenance, updates, or circumstances beyond our
          control. We will make reasonable efforts to notify users of planned
          downtime in advance.
        </p>
        <p>
          Conddo is not liable for any loss or damage caused by temporary
          unavailability of the Service.
        </p>

        <h2>11. Limitation of Liability</h2>
        <p>To the fullest extent permitted by Nigerian law:</p>
        <ul>
          <li>Conddo provides the Service on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, whether express or implied</li>
          <li>Conddo is not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service</li>
          <li>Conddo is not liable for any loss of revenue, customers, data, or business opportunity resulting from Service downtime or errors</li>
          <li>Conddo&rsquo;s total liability to you for any claim arising from these Terms or the Service shall not exceed the total subscription fees you paid to Conddo in the 3 months preceding the claim</li>
        </ul>
        <p>
          Nothing in these Terms limits Conddo&rsquo;s liability for death or
          personal injury caused by our negligence, fraud, or any other
          liability that cannot be excluded by law.
        </p>

        <h2>12. Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless Conddo and its
          officers, directors, employees, and agents from and against any
          claims, damages, losses, liabilities, costs, and expenses (including
          legal fees) arising from:
        </p>
        <ul>
          <li>Your use of the Service</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any third-party rights, including intellectual property rights</li>
          <li>Any content you publish on your Conddo-powered website</li>
          <li>Any dispute between you and your customers</li>
        </ul>

        <h2>13. Suspension and Termination</h2>
        <h3>13.1 By You</h3>
        <p>
          You may cancel your subscription and close your account at any time
          through your account settings or by contacting support@getconddo.com.
          Cancellation takes effect at the end of your current billing cycle.
        </p>

        <h3>13.2 By Conddo</h3>
        <p>Conddo may suspend or terminate your account:</p>
        <ul>
          <li>Immediately if you materially breach these Terms, including engaging in illegal activity or fraudulent behaviour</li>
          <li>With 14 days notice if your account remains on a lapsed subscription without renewal</li>
          <li>With 30 days notice if Conddo decides to discontinue the Service</li>
        </ul>

        <h3>13.3 Effect of Termination</h3>
        <p>
          On termination, your access to the Service ends immediately or at
          the end of the notice period, as applicable. Your data will be
          retained for 90 days after termination, after which it will be
          permanently deleted.
        </p>

        <h2>14. Dispute Resolution</h2>
        <p>
          In the event of a dispute arising from these Terms or the Service,
          the Parties agree to first attempt resolution through good-faith
          negotiation. If the dispute is not resolved within 30 days, either
          party may refer the matter to mediation or the appropriate courts of
          the Federal Republic of Nigeria.
        </p>

        <h2>15. Governing Law</h2>
        <p>
          These Terms are governed by and construed in accordance with the
          laws of the Federal Republic of Nigeria. Any legal proceedings
          arising from these Terms shall be subject to the exclusive
          jurisdiction of the Nigerian courts.
        </p>

        <h2>16. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. When we do, we will
          update the &ldquo;Last updated&rdquo; date and notify active users by
          email at least 30 days before the changes take effect for material
          changes. Your continued use of the Service after changes take effect
          constitutes your acceptance of the updated Terms.
        </p>

        <h2>17. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us:</p>
        <ul>
          <li>Email: support@getconddo.com</li>
          <li>Legal enquiries: legal@getconddo.com</li>
          <li>Website: getconddo.com</li>
          <li>Address: Lagos State, Nigeria</li>
        </ul>

        <hr />
        <p className="text-sm text-white/50">
          Conddo Terms of Service · Effective July 2026 · getconddo.com
        </p>
      </LegalDoc>
    </MarketingShell>
  );
}
