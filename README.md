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

## 🛠️ Quick Setup Guide

Get up and running with **AlgoVault** in less than 2 minutes:

### 1. Installation
1.  **Download:** Head over to the [Latest Releases](https://github.com/mr-sanjai-offl/AlgoVault/releases) and download the `algovault-v1.0.2.zip` (or the newest version).
2.  **Extract:** Unzip the downloaded file into a folder on your computer.
3.  **Load to Chrome:**
    - Open Chrome and navigate to `chrome://extensions/`.
    - Enable **Developer Mode** (toggle in the top-right corner).
    - Click **Load unpacked** and select the folder where you extracted the extension.

### 2. Authentication & Linking
1.  **Connect GitHub:** Open the AlgoVault popup from your browser toolbar and click **Connect GitHub**. 
2.  **Verify Device:** A verification code will appear. Click the link to open the GitHub activation page, paste the code, and authorize the extension.
3.  **Link Repository:** Once authenticated, go to the **Settings** tab in the extension popup. Select the repository and branch where you want your solutions stored.

### 3. Start Syncing
1.  Navigate to any problem on [LeetCode](https://leetcode.com/problemset/all/).
2.  Solve the problem and hit **Submit**.
3.  **Done!** Once your solution is **Accepted**, AlgoVault will instantly push your code to GitHub and update your repository dashboard automatically.

## 🛡️ Resilience & Reliability

AlgoVault is built to handle the "Edge Cases" that break other extensions:
- **Zero Duplicates:** Strict synchronous locking prevents duplicate commits even during rapid page refreshes.
- **Context Awareness:** Proactively detects when the extension has been updated and prompts the user to refresh, preventing silent failures.
- **Atomic Operations:** Uses a job queue system with exponential backoff to ensure no submission is ever lost due to network issues.

---

<p align="center">
  Built with ❤️ for the Developer Community
</p>
