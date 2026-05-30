export default function Privacy() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem", fontFamily: "sans-serif", lineHeight: 1.7, color: "#1a1a1a" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>Privacy Policy</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>TowerSmith · towersmith.com · Last updated: 30 May 2026</p>

      <h2>1. Who We Are</h2>
      <p>
        TowerSmith ("we", "us", "our") is a web application operated in the United Kingdom that allows
        players of The Tower (developed by Tech Tree Games LLC) to build, manage, and share in-game
        loadouts including workshop upgrades, bots, ultimate weapons, assist modules, relics, card
        loadouts, themes, lab research, and other configurations.
      </p>
      <p>Questions about this policy: <a href="mailto:privacy@towersmith.com">privacy@towersmith.com</a></p>

      <hr style={{ margin: "2rem 0", borderColor: "#e5e5e5" }} />

      <h2>2. What Data We Collect</h2>

      <h3>2.1 Authentication Data (via Google OAuth)</h3>
      <ul>
        <li>Your name as provided by Google</li>
        <li>Your email address</li>
        <li>Your Google profile picture URL</li>
        <li>A unique identifier from Google used to recognise your account</li>
      </ul>

      <h3>2.2 User-Generated Content</h3>
      <ul>
        <li>Loadout configurations you create (workshop upgrades, bots, weapons, modules, relics, cards, themes, lab research)</li>
        <li>Build names, descriptions, and any notes you choose to add</li>
        <li>Sharing preferences (public or private)</li>
      </ul>

      <h3>2.3 Usage and Analytics Data</h3>
      <ul>
        <li>Pages visited and features used within TowerSmith</li>
        <li>Browser type, operating system, and device information</li>
        <li>IP address and approximate geographic location (country/region level)</li>
        <li>Timestamps of logins and actions</li>
      </ul>

      <hr style={{ margin: "2rem 0", borderColor: "#e5e5e5" }} />

      <h2>3. How We Use Your Data</h2>
      <ul>
        <li>To create and manage your TowerSmith account</li>
        <li>To save, display, and allow sharing of your loadout builds</li>
        <li>To identify you when you return to the service</li>
        <li>To improve the performance and features of TowerSmith</li>
        <li>To detect and prevent abuse or unauthorised access</li>
        <li>To comply with our legal obligations</li>
      </ul>
      <p>We do not use your data for advertising purposes and we do not sell your personal data to third parties.</p>

      <hr style={{ margin: "2rem 0", borderColor: "#e5e5e5" }} />

      <h2>4. Legal Basis for Processing (UK GDPR)</h2>
      <ul>
        <li><strong>Contract:</strong> to provide you with the TowerSmith service you have signed up for</li>
        <li><strong>Legitimate interests:</strong> to improve our service, ensure security, and prevent misuse</li>
        <li><strong>Consent:</strong> where you have explicitly agreed, for example when making a build publicly shareable</li>
      </ul>

      <hr style={{ margin: "2rem 0", borderColor: "#e5e5e5" }} />

      <h2>5. Data Sharing</h2>
      <p>We do not sell your personal data. We may share data with:</p>
      <ul>
        <li><strong>Supabase</strong> (our database and authentication infrastructure provider) — data is stored within their secure cloud infrastructure</li>
        <li><strong>Google</strong> (as your OAuth provider) — subject to Google's own privacy policy</li>
        <li><strong>Analytics providers</strong> — in aggregated or anonymised form only</li>
      </ul>
      <p>All third-party providers are contractually required to protect your data and process it only as instructed by us.</p>

      <hr style={{ margin: "2rem 0", borderColor: "#e5e5e5" }} />

      <h2>6. Data Retention</h2>
      <p>
        We retain your personal data for as long as your account is active. If you delete your account,
        we will delete your personal data within 30 days, except where we are required to retain it by law.
      </p>

      <hr style={{ margin: "2rem 0", borderColor: "#e5e5e5" }} />

      <h2>7. Your Rights (UK GDPR)</h2>
      <ul>
        <li><strong>Right of access</strong> — request a copy of the data we hold about you</li>
        <li><strong>Right to rectification</strong> — ask us to correct inaccurate data</li>
        <li><strong>Right to erasure</strong> — ask us to delete your data ("right to be forgotten")</li>
        <li><strong>Right to restriction</strong> — ask us to limit how we use your data</li>
        <li><strong>Right to data portability</strong> — receive your data in a machine-readable format</li>
        <li><strong>Right to object</strong> — object to processing based on legitimate interests</li>
      </ul>
      <p>
        To exercise any of these rights, email us at{" "}
        <a href="mailto:privacy@towersmith.com">privacy@towersmith.com</a>. We will respond within 30 days.
      </p>
      <p>
        You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at{" "}
        <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
      </p>

      <hr style={{ margin: "2rem 0", borderColor: "#e5e5e5" }} />

      <h2>8. Cookies</h2>
      <p>
        TowerSmith uses essential cookies to maintain your session and remember your preferences.
        We do not use third-party advertising cookies.
      </p>

      <hr style={{ margin: "2rem 0", borderColor: "#e5e5e5" }} />

      <h2>9. Security</h2>
      <p>
        We use industry-standard security measures including encrypted connections (HTTPS), secure
        authentication via Supabase, and access controls to protect your data.
      </p>

      <hr style={{ margin: "2rem 0", borderColor: "#e5e5e5" }} />

      <h2>10. Children's Privacy</h2>
      <p>
        TowerSmith is not directed at children under the age of 13. We do not knowingly collect personal
        data from children under 13. If you believe a child has provided us with personal data, please
        contact us and we will delete it promptly.
      </p>

      <hr style={{ margin: "2rem 0", borderColor: "#e5e5e5" }} />

      <h2>11. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify registered users of material
        changes by email or by displaying a notice within the application.
      </p>

      <hr style={{ margin: "2rem 0", borderColor: "#e5e5e5" }} />

      <h2>12. Contact</h2>
      <p>Privacy queries: <a href="mailto:privacy@towersmith.com">privacy@towersmith.com</a></p>
      <p>Website: <a href="https://towersmith.com">towersmith.com</a></p>
    </main>
  );
}
