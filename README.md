# AlgoVault 🚀

<p align="center">
  <img src="public/banner.png" alt="AlgoVault Banner" width="100%" />
</p>

<p align="center">
  <strong>The Ultimate LeetCode-to-GitHub Automation Engine</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Extension-blue?logo=google-chrome&logoColor=white" alt="Chrome Extension" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Manifest-V3-orange" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/GitHub-Sync-black?logo=github" alt="GitHub Sync" />
</p>

---

## 🌟 Overview

**AlgoVault** is a production-grade Chrome extension designed for software engineers who want to automate their coding journey. It seamlessly synchronizes your LeetCode submissions to a dedicated GitHub repository, creating a professionally structured portfolio of your problem-solving skills.

Unlike basic sync tools, AlgoVault is built with a **"Nuclear Stability"** architecture, ensuring it remains resilient during browser updates, extension reloads, and complex page lifecycles.

## 🚀 Key Features

- **⚡ Instant Auto-Sync:** Automatically pushes your "Accepted" submissions to GitHub within 1 second.
- **🛡️ Nuclear Stability:** Hardened against "Extension context invalidated" errors using advanced zombie-state detection and defensive API wrappers.
- **📁 Professional Structuring:** Organizes your code by **Topic > Problem Name > Language > solution.ext**.
- **📊 Real-time Dashboard:** Automatically generates and updates a recruiter-friendly `README.md` in your repository root with activity heatmaps and categorized problem lists.
- **🔐 Secure & Private:** Uses GitHub Device Flow for authentication. Your tokens are encrypted and stored locally on your device.
- **🤖 Intelligence:** (Optional) Integrated with OpenRouter for intelligent problem analysis and complexity categorization.

## 🛠️ Technical Stack

- **Core:** TypeScript, React, Vite
- **Storage:** IndexedDB (for high-volume history), `chrome.storage.local` (for state)
- **Manifest:** Version 3 (MV3) compliant
- **Styling:** Material Design 3 inspired aesthetics with Vanilla CSS/Tailwind
- **Communication:** Robust background-to-content script messaging with auto-recovery

## 📦 Installation (Developer Mode)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/AlgoVault.git
   cd AlgoVault
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```

4. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **"Developer mode"** (top right).
   - Click **"Load unpacked"** and select the `dist` folder in the project directory.

## 📖 Usage

1. Click the **AlgoVault** icon in your browser toolbar.
2. Click **"Connect GitHub"** and follow the device verification flow.
3. Select your target repository and branch in the settings.
4. Start solving on LeetCode! Your solutions will sync automatically.
5. Visit your GitHub repository to see your beautiful, auto-generated dashboard.

## 🛡️ Resilience & Reliability

AlgoVault is built to handle the "Edge Cases" that break other extensions:
- **Zero Duplicates:** Strict synchronous locking prevents duplicate commits even during rapid page refreshes.
- **Context Awareness:** Proactively detects when the extension has been updated and prompts the user to refresh, preventing silent failures.
- **Atomic Operations:** Uses a job queue system with exponential backoff to ensure no submission is ever lost due to network issues.

---

<p align="center">
  Built with ❤️ for the Developer Community
</p>
