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
  <img src="https://badges.strrl.dev/visits/mr-sanjai-offl/AlgoVault" alt="Visitors" />
</p>

---

## 🌟 Overview

**AlgoVault** is a production-grade Chrome extension designed for software engineers who want to automate their coding journey. It seamlessly synchronizes your LeetCode submissions to a dedicated GitHub repository, creating a professionally structured portfolio of your problem-solving skills.

Unlike basic sync tools, AlgoVault is built with a **"Nuclear Stability"** architecture, ensuring it remains resilient during browser updates, extension reloads, and complex page lifecycles. It also boasts flawless **Cross-Device Synchronization** to ensure your data stays intact no matter where you code.

## 🚀 Key Features

- **⚡ Instant Auto-Sync:** Automatically pushes your "Accepted" submissions to GitHub within 1 second. Built-in verifications guarantee that *only* Accepted solutions are pushed—"Wrong Answer" or failed solutions are strictly ignored.
- **🔄 Cross-Device Synchronization:** Uses a Git-synced JSON manifest (`.algovault/manifest.json`) as the single source of truth. Your dashboard and problem stats instantly sync across all your devices (PC, laptop, etc.) without losing any historical data!
- **📁 Professional Structuring:** Organizes your code automatically by **Topic > Problem Name > Language > solution.ext**, giving your repository a clean and catchy look.
- **📊 Real-time Dashboard:** Generates and continuously updates a recruiter-friendly `README.md` in your repository root, complete with activity heatmaps and categorized problem lists.
- **🛡️ Nuclear Stability:** Hardened against "Extension context invalidated" errors using advanced zombie-state detection and defensive API wrappers.
- **🔐 Secure & Private:** Implements GitHub Device Flow for authentication. Your GitHub tokens are strictly encrypted and stored locally on your device.

## 🏗️ Architecture & Data Flow

AlgoVault is built with a highly decoupled, modern extension architecture designed for resilience and fast, asynchronous processing.

```mermaid
flowchart TD

subgraph group_extension["Extension contexts"]
  node_content["LeetCode content script<br/>content runtime<br/>[index.ts]"]
  node_observer["Page observer<br/>lifecycle observer<br/>[observer.ts]"]
  node_extractor["Submission extractor<br/>data extractor<br/>[extractor.ts]"]
  node_message_contracts["Shared message contracts<br/>typed protocol<br/>[messages.ts]"]
end

subgraph group_background["Background services"]
  node_service_worker{{"MV3 service worker<br/>sync coordinator<br/>[service-worker.ts]"}}
  node_message_handler["Message handler<br/>request router<br/>[messageHandler.ts]"]
  node_config_store[("Sync configuration<br/>config store<br/>[configStore.ts]")]
  node_encrypted_storage[("Encrypted storage<br/>secure storage")]
  node_history_db[("Submission history<br/>IndexedDB store<br/>[indexedDb.ts]")]
  node_manifest_store[("Artifact manifest<br/>sync manifest<br/>[manifestStore.ts]")]
  node_stats_aggregator["Stats aggregator<br/>history aggregation<br/>[aggregator.ts]"]
  node_dashboard_builder["Dashboard builder<br/>Markdown generator"]
  node_readme_builder["README builder<br/>Markdown generator<br/>[readmeBuilder.ts]"]
end

subgraph group_github["GitHub sync"]
  node_device_flow["OAuth Device Flow<br/>auth flow<br/>[deviceFlow.ts]"]
  node_github_client{{"GitHub client<br/>API boundary<br/>[client.ts]"}}
  node_file_extensions["Language file mapping<br/>path mapping<br/>[fileExtMap.ts]"]
end

subgraph group_ui["User controls"]
  node_popup["Toolbar popup<br/>React control UI<br/>[App.tsx]"]
  node_popup_sync["Popup sync hook<br/>UI sync hook<br/>[useSync.ts]"]
  node_popup_auth["Popup auth hook<br/>UI auth hook<br/>[useAuth.ts]"]
  node_options["Options page<br/>React settings UI<br/>[App.tsx]"]
end

subgraph group_delivery["Build and delivery"]
  node_vite["Vite build<br/>extension bundler<br/>[vite.config.ts]"]
  node_manifest["Chrome manifest<br/>MV3 metadata<br/>[manifest.json]"]
  node_build_workflow["Build workflow<br/>GitHub Actions<br/>[build.yml]"]
  node_release_workflow["Release workflow<br/>GitHub Actions<br/>[release.yml]"]
end

node_content -->|"uses"| node_observer
node_observer -->|"triggers extraction"| node_extractor
node_content -->|"submission events"| node_service_worker
node_message_contracts -.->|"types"| node_content
node_message_contracts -.->|"types"| node_message_handler
node_service_worker -->|"delegates requests"| node_message_handler
node_message_handler -->|"records submissions"| node_history_db
node_service_worker -->|"reads sync target"| node_config_store
node_config_store -->|"secures sensitive values"| node_encrypted_storage
node_service_worker -->|"starts login"| node_device_flow
node_device_flow -->|"stores credentials"| node_encrypted_storage
node_service_worker -->|"orchestrates sync"| node_github_client
node_config_store -->|"selects repository and branch"| node_github_client
node_history_db -->|"checks incremental state"| node_manifest_store
node_file_extensions -->|"names solution files"| node_github_client
node_history_db -->|"supplies history"| node_stats_aggregator
node_stats_aggregator -->|"provides statistics"| node_dashboard_builder
node_stats_aggregator -->|"provides activity"| node_readme_builder
node_dashboard_builder -->|"publishes dashboard"| node_github_client
node_readme_builder -->|"publishes README"| node_github_client
node_github_client -->|"records published artifacts"| node_manifest_store
node_popup -->|"uses"| node_popup_sync
node_popup -->|"uses"| node_popup_auth
node_popup_sync -->|"sync requests"| node_service_worker
node_popup_auth -->|"auth requests"| node_service_worker
node_options -->|"configuration requests"| node_service_worker
node_vite -->|"packages with"| node_manifest
node_build_workflow -->|"runs build"| node_vite
node_release_workflow -->|"uses build output"| node_build_workflow

classDef toneNeutral fill:#f8fafc,stroke:#334155,stroke-width:1.5px,color:#0f172a
classDef toneBlue fill:#dbeafe,stroke:#2563eb,stroke-width:1.5px,color:#172554
classDef toneAmber fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f
classDef toneMint fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#14532d
classDef toneRose fill:#ffe4e6,stroke:#e11d48,stroke-width:1.5px,color:#881337
classDef toneIndigo fill:#e0e7ff,stroke:#4f46e5,stroke-width:1.5px,color:#312e81
classDef toneTeal fill:#ccfbf1,stroke:#0f766e,stroke-width:1.5px,color:#134e4a
class node_content,node_observer,node_extractor,node_message_contracts toneBlue
class node_service_worker,node_message_handler,node_config_store,node_encrypted_storage,node_history_db,node_manifest_store,node_stats_aggregator,node_dashboard_builder,node_readme_builder toneAmber
class node_device_flow,node_github_client,node_file_extensions toneMint
class node_popup,node_popup_sync,node_popup_auth,node_options toneRose
class node_vite,node_manifest,node_build_workflow,node_release_workflow toneIndigo
```

## 🛠️ Quick Setup Guide

Get up and running with **AlgoVault** in less than 2 minutes:

### 1. Installation
1.  **Download:** Head over to the [Latest Releases](https://github.com/mr-sanjai-offl/AlgoVault/releases) and download the latest `.zip` file (e.g., `algovault-v1.0.3.zip`).
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

<p align="center">
  <img src="public/setup_guide.png" alt="AlgoVault Setup Guide" width="100%" />
</p>

## 🛡️ Resilience & Reliability

AlgoVault is built to handle the "Edge Cases" that break other extensions:
- **Zero Duplicates:** Strict synchronous locking prevents duplicate commits even during rapid page refreshes.
- **Context Awareness:** Proactively detects when the extension has been updated and prompts the user to refresh, preventing silent failures.
- **Atomic Operations:** Uses a job queue system with exponential backoff and GraphQL conflict resolution to ensure no submission is ever lost due to network issues.
- **Permanent IDs & Session Persistence:** Cryptographically secured extension ID and persistent local storage ensure your token and settings survive version updates!

---

<p align="center">
  Built with ❤️ for the Developer Community
</p>
