import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { LegalDoc } from "@/components/marketing/LegalDoc";

export const metadata: Metadata = {
  title: "Privacy Policy — Conddo",
  description:
    "How Conddo collects, uses, stores, and protects your information under the Nigeria Data Protection Act 2023.",
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <LegalDoc title="Privacy Policy" effective="July 2026" updated="July 2026">
        <h2>1. Introduction</h2>
        <p>
          Welcome to Conddo. Conddo (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
          &ldquo;our&rdquo;) is a business operating system for Nigerian small
          and medium businesses, operated by Conddo (RC: 9693423), a company
          duly registered under the laws of the Federal Republic of Nigeria.
        </p>
        <p>
          This Privacy Policy explains how we collect, use, store, protect, and
          share information about you when you use our platform at
          getconddo.com and any related services, applications, and tenant
          websites hosted on our platform (collectively, the &ldquo;Service&rdquo;).
        </p>
        <p>
          By accessing or using the Service, you confirm that you have read,
          understood, and agree to this Privacy Policy. If you do not agree,
          please do not use the Service.
        </p>
        <p>
          We are committed to protecting your personal data in accordance with
          the Nigeria Data Protection Act 2023 (NDPA) and the Nigeria Data
          Protection Regulation (NDPR). Where applicable, we also observe the
          principles of the General Data Protection Regulation (GDPR).
        </p>

        <h2>2. Who This Policy Applies To</h2>
        <p>This Privacy Policy applies to two types of users:</p>
        <ul>
          <li>
            <strong>Tenants:</strong> business owners who register and use
            Conddo to manage their business operations, customers, orders,
            payments, inventory, and marketing.
          </li>
          <li>
            <strong>End users:</strong> customers of Conddo tenants who
            interact with a business website, place orders, or make payments
            through a Conddo-powered tenant site.
          </li>
        </ul>
        <p>
          Where this policy distinguishes between these groups, we will say so
          clearly. Where we refer to &ldquo;you&rdquo; generally, the policy
          applies to both groups.
        </p>

        <h2>3. Information We Collect</h2>
        <h3>3.1 Information You Give Us Directly</h3>
        <p>When you register as a tenant or use the Service, we collect:</p>
        <ul>
          <li>Account information: your name, business name, business email address, phone number, and password</li>
          <li>Business information: your business description, industry vertical, business address, and operational details you provide during onboarding</li>
          <li>Profile and brand information: your business logo, brand colors, and website content</li>
          <li>Communications: messages you send us through support channels</li>
        </ul>

        <h3>3.2 Information We Collect Automatically</h3>
        <p>When you use the Service, we automatically collect:</p>
        <ul>
          <li>Usage data: pages visited, features used, actions taken within the platform, and session duration</li>
          <li>Device and technical information: IP address, browser type, operating system, and device identifiers</li>
          <li>Log data: server logs, error reports, and activity timestamps</li>
        </ul>

        <h3>3.3 Information Related to Your Customers (Tenant Data)</h3>
        <p>
          When you use Conddo to manage your business, you may store your
          customers&rsquo; data on our platform, including:
        </p>
        <ul>
          <li>Customer names, phone numbers, and email addresses</li>
          <li>Order history, product preferences, and transaction records</li>
          <li>Delivery addresses and contact details</li>
        </ul>
        <p>
          You, as the tenant, are the data controller for your customers&rsquo;
          information. Conddo acts as a data processor on your behalf. You are
          responsible for ensuring you have the appropriate legal basis to
          collect and store your customers&rsquo; data, and for informing them
          that their data may be processed on a third-party platform.
        </p>

        <h3>3.4 Payment Information</h3>
        <p>
          Conddo does not collect, store, or process payment card details
          directly. Payments on the platform are handled by regulated
          third-party payment providers, and card details are entered directly
          into their secure interfaces. We receive only transaction
          confirmations and reference numbers, not card numbers, CVV, or expiry
          dates.
        </p>
        <p>Payments are processed as follows:</p>
        <ul>
          <li>
            <strong>Conddo subscriptions (tenant &rarr; Conddo):</strong>{" "}
            Subscription payments for your Conddo plan and program enrolments
            are processed by <strong>Paystack</strong>, licensed by the Central
            Bank of Nigeria. Review Paystack&rsquo;s privacy policy at
            paystack.com.
          </li>
          <li>
            <strong>Customer payments (customer &rarr; tenant):</strong>{" "}
            Payments made by end users to a tenant &mdash; including online
            orders, deposits, POS collections, and walk-in payments &mdash; are
            processed by <strong>Importapay</strong> and/or{" "}
            <strong>Routepay</strong>, both licensed under the Central Bank of
            Nigeria payment regulations. Review their respective privacy
            policies at importapay.com and routepay.com.
          </li>
        </ul>
        <p>
          These payment providers may collect additional information as
          required by Nigerian financial regulations, including Know Your
          Customer (KYC) and Anti-Money Laundering (AML) checks. Their handling
          of that information is governed by their own privacy policies.
        </p>

        <h3>3.5 Social Media Data</h3>
        <p>
          If you connect your Facebook Page or Instagram Business account to
          Conddo&rsquo;s marketing module, we collect:
        </p>
        <ul>
          <li>Your Facebook Page ID and Instagram Business account ID</li>
          <li>Access tokens required to publish content on your behalf</li>
          <li>Basic page and account metadata (page name, follower count, account status)</li>
        </ul>
        <p>
          We use this information solely to publish content you create and
          schedule within Conddo to your connected social media accounts. We do
          not use your social media data for advertising or share it with third
          parties. You can revoke Conddo&rsquo;s access to your social media
          accounts at any time through your Facebook or Instagram settings.
        </p>

        <h2>4. How We Use Your Information</h2>
        <p>We use the information we collect for the following purposes:</p>
        <ul>
          <li>To create and manage your Conddo account</li>
          <li>To provide, operate, and improve the Service</li>
          <li>To configure your business platform using our AI Provisioning Service, which processes your business description to recommend the right tools for your business</li>
          <li>To send you transactional communications including account verification emails, payment confirmations, and service notifications</li>
          <li>To send you marketing communications about Conddo features, updates, and offers, where you have given us permission to do so. You can opt out of marketing communications at any time.</li>
          <li>To send you SMS notifications where you have provided your phone number and consented to SMS communication</li>
          <li>To process your subscription payments through Paystack, and to route customer payments through Importapay and Routepay</li>
          <li>To respond to your support requests and enquiries</li>
          <li>To detect, investigate, and prevent fraudulent or unauthorized activity</li>
          <li>To comply with our legal obligations under Nigerian law</li>
          <li>To analyze how the Service is used so we can improve it</li>
        </ul>

        <h2>5. Legal Basis for Processing</h2>
        <p>We process your personal data on the following legal bases under the NDPA and NDPR:</p>
        <ul>
          <li><strong>Contract:</strong> processing necessary to provide the Service you have subscribed to</li>
          <li><strong>Consent:</strong> for marketing communications and SMS notifications, where you have explicitly opted in</li>
          <li><strong>Legitimate interests:</strong> for platform security, fraud prevention, and service improvement, where these interests are not overridden by your rights</li>
          <li><strong>Legal obligation:</strong> where we are required to process data to comply with Nigerian law</li>
        </ul>

        <h2>6. Data Ownership</h2>
        <p>You own your data. This means:</p>
        <ul>
          <li>All business data you create on Conddo, including your customer records, order history, inventory, and business content, belongs to you</li>
          <li>Conddo does not claim any ownership or rights over your business data</li>
          <li>You may export or request a copy of your data at any time by contacting us at privacy@getconddo.com</li>
          <li>If you close your Conddo account, we will retain your data for 90 days to allow for reactivation or export, after which it will be permanently deleted from our systems</li>
        </ul>
        <p>
          We process your data as a data processor acting on your instructions,
          not as an owner of that data.
        </p>

        <h2>7. Data Sharing and Disclosure</h2>
        <p>
          We do not sell your personal data. We do not share your data with
          third parties for advertising purposes. We may share your data only
          in the following circumstances:
        </p>
        <ul>
          <li>
            <strong>Service providers:</strong> we share data with trusted
            third-party providers who help us operate the Service, including{" "}
            <strong>Paystack</strong> (subscription payments),{" "}
            <strong>Importapay</strong> and <strong>Routepay</strong> (customer
            payments and payouts to tenants), <strong>Brevo</strong> (email and
            SMS delivery), <strong>Amazon Web Services</strong> (cloud
            infrastructure and storage), and <strong>Sentry</strong> (error
            monitoring). These providers are contractually bound to process
            your data only as instructed by us and to maintain appropriate
            security standards.
          </li>
          <li>
            <strong>AI processing:</strong> when you use our AI Provisioning
            Service or marketing automation features, your business description
            and content may be processed by third-party AI model providers
            including Anthropic and DeepSeek. These providers process data only
            as part of generating responses and do not retain your data for
            their own purposes beyond what their individual privacy policies
            specify.
          </li>
          <li>
            <strong>Legal requirements:</strong> we may disclose your data
            where required by law, court order, or government authority in
            Nigeria, including financial regulators and law enforcement in
            connection with fraud investigations or anti-money-laundering
            obligations.
          </li>
          <li>
            <strong>Business transfers:</strong> in the event of a merger,
            acquisition, or sale of substantially all of our assets, your data
            may be transferred to the acquiring entity, subject to the same
            privacy protections.
          </li>
          <li>
            <strong>With your consent:</strong> we may share data for any other
            purpose with your explicit consent.
          </li>
        </ul>

        <h2>8. Data Security</h2>
        <p>We take the security of your data seriously and implement the following measures:</p>
        <ul>
          <li>All data is encrypted in transit using TLS (HTTPS)</li>
          <li>Tenant data is isolated using Row Level Security in our database, meaning no tenant can access another tenant&rsquo;s data</li>
          <li>Access to production systems is restricted to authorized personnel only</li>
          <li>We use industry-standard cloud infrastructure on AWS with appropriate security configurations</li>
          <li>We monitor our systems for unauthorized access and suspicious activity using Sentry and AWS CloudWatch</li>
        </ul>
        <p>
          No system is completely secure. While we work hard to protect your
          data, we cannot guarantee absolute security. If we become aware of a
          data breach that affects your personal data, we will notify you in
          accordance with our obligations under the NDPA.
        </p>

        <h2>9. Data Retention</h2>
        <p>
          We retain your personal data for as long as your account is active
          or as needed to provide the Service. Specifically:
        </p>
        <ul>
          <li>Account data is retained for the duration of your subscription and for 90 days after account closure</li>
          <li>Transaction records are retained for 7 years as required by Nigerian financial regulations</li>
          <li>Marketing opt-out records are retained indefinitely so we do not contact you after you have opted out</li>
          <li>Log data and usage analytics are retained for 12 months</li>
        </ul>

        <h2>10. Your Rights</h2>
        <p>Under the Nigeria Data Protection Act 2023, you have the following rights:</p>
        <ul>
          <li><strong>Right to access:</strong> you can request a copy of the personal data we hold about you</li>
          <li><strong>Right to rectification:</strong> you can ask us to correct inaccurate or incomplete data</li>
          <li><strong>Right to erasure:</strong> you can ask us to delete your personal data, subject to legal retention requirements</li>
          <li><strong>Right to data portability:</strong> you can request your data in a structured, machine-readable format</li>
          <li><strong>Right to object:</strong> you can object to processing based on legitimate interests, including direct marketing</li>
          <li><strong>Right to withdraw consent:</strong> where processing is based on consent, you can withdraw it at any time without affecting the lawfulness of prior processing</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at privacy@getconddo.com.
          We will respond within 30 days.
        </p>

        <h2>11. Cookies</h2>
        <p>
          We use essential cookies to keep you logged in and maintain your
          session on the platform. We do not currently use tracking or
          advertising cookies. If we introduce additional cookies in the
          future, we will update this policy and ask for your consent where
          required.
        </p>

        <h2>12. Children&rsquo;s Privacy</h2>
        <p>
          The Service is not directed at children under the age of 18. We do
          not knowingly collect personal data from children. If you believe a
          child has provided us with personal data, please contact us at
          privacy@getconddo.com and we will delete it promptly.
        </p>

        <h2>13. International Data Transfers</h2>
        <p>
          Your data is primarily stored and processed in Nigeria on AWS
          infrastructure. Some of our third-party service providers (including
          Anthropic, DeepSeek, and Brevo) may process data outside Nigeria.
          Where this occurs, we ensure appropriate safeguards are in place
          consistent with the NDPA requirements for cross-border data
          transfers.
        </p>

        <h2>14. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, we
          will update the &ldquo;Last updated&rdquo; date at the top of this
          document and notify active users by email. Your continued use of the
          Service after any changes constitutes your acceptance of the updated
          policy.
        </p>

        <h2>15. Contact Us</h2>
        <p>
          If you have any questions, concerns, or requests regarding this
          Privacy Policy or how we handle your data, please contact us:
        </p>
        <ul>
          <li>Email: privacy@getconddo.com</li>
          <li>Website: getconddo.com</li>
          <li>Address: Lagos, Nigeria</li>
        </ul>
        <p>
          If you are not satisfied with our response, you have the right to
          lodge a complaint with the Nigeria Data Protection Commission (NDPC)
          at ndpc.gov.ng.
        </p>

        <hr />
        <p className="text-sm text-white/50">
          Conddo Privacy Policy · Effective July 2026 · getconddo.com
        </p>
      </LegalDoc>
    </MarketingShell>
  );
}
