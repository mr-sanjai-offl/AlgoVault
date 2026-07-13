# AlgoVault v1.0.3: Cross-Device Sync & Stability Update 🛡️

This update introduces seamless cross-device synchronization and focuses on long-term reliability for our users.

## ✨ New Features & Improvements

- **🔄 Cross-Device Synchronization:** Introduced a Git-synced JSON manifest (`.algovault/manifest.json`) as the single source of truth. Your dashboard and stats now instantly synchronize across all your devices (PC, laptop, etc.) without losing any historical data!
- **🛡️ Permanent Extension ID:** Added a cryptographic key to the manifest. This ensures your extension ID stays the same forever, preventing "duplicate extension" issues in Chrome.
- **🔐 Session Persistence:** Updates will no longer log you out! Your GitHub token and settings are now safely preserved between version updates.
- **📁 Robust Language Support:** Finalized the fix for Java and SQL file extensions (saving as `.java` and `.sql` correctly).
- **🚀 Real-Time Synchronization:** Seamlessly pushes "Accepted" solutions to your repository within 1 second of detection.
- **🛡️ Nuclear Stability Architecture:** Built with an advanced safety layer to handle extension context invalidation, ensuring the extension remains silent and stable during browser updates.
- **📁 Organized Hierarchy:** Automatically structures your repository by **Topic > Problem Name > Language**, supporting multiple solutions per problem.
- **📊 Automated Dashboarding:** Injects a recruiter-ready `README.md` into your root with activity heatmaps and categorized problem lists.
- **🔐 Secure Authentication:** Implements GitHub Device Flow for secure, encrypted token management on your local device.
- **🎨 Modern UI/UX:** A sleek, Material 3 inspired dashboard for tracking your stats, streaks, and sync history.

## 🛠️ Internal Improvements

- **Cross-Device Safety:** Atomic commits with GraphQL SHA conflict resolution ensure zero data loss when multiple devices sync simultaneously.
- **Zero-Duplicate Logic:** Synchronous "In-Flight" locking prevents duplicate commits during rapid page transitions.
- **Metadata Recovery:** Multi-tiered extraction (GraphQL + DOM + Title) ensures accurate problem naming even on slow networks.
- **Zombie Script Protection:** Automatic state tracking gracefully clears UI elements when the extension context is destroyed.

## 📖 Documentation

- **[AlgoVault 🚀 User Guide](./AlgoVault%20%F0%9F%9A%80%20User%20Guide.pdf.pdf)**: Comprehensive guide on setting up and maximizing your use of AlgoVault.

## 📦 Getting Started

1. Download the `algovault-1.0.3.zip` from the assets below.
2. Unzip the file.
3. Open Chrome and go to `chrome://extensions/`.
4. Enable **Developer Mode**.
5. Click **Load Unpacked** and select the unzipped folder.

---
*Built with technical excellence for the developer community. Keep coding!*

**Full Changelog**: https://github.com/mr-sanjai-offl/AlgoVault/compare/v1.0.2...v1.0.3
