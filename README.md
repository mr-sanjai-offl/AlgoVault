# AlgoVault v2 🚀

<p align="center">
  <img src="public/banner.png" alt="AlgoVault Banner" width="100%" />
</p>

<p align="center">
  <strong>The Ultimate Multi-Platform Competitive Programming Automation Engine</strong>
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

**AlgoVault v2** is a production-grade Chrome extension designed for software engineers and competitive programmers. It seamlessly synchronizes your **LeetCode** and **Codeforces** submissions to a dedicated GitHub repository, creating a professionally structured portfolio of your coding journey.

Unlike basic sync tools, AlgoVault is built with a **"Nuclear Stability"** architecture. It implements aggressive race-condition locking, zero-duplicate guards, and robust background sync loops, ensuring your data is always pristine even during rapid coding sessions or weak networks.

## 🚀 Key Features

- **🌐 Multi-Platform Support:** Seamlessly syncs solutions from both **LeetCode** and **Codeforces**, natively extracting runtime, memory, language, and problem metadata.
- **⚡ Instant Auto-Sync:** Automatically pushes your "Accepted" submissions to GitHub within 1 second. Fast DOM-locking guarantees that *only* Accepted solutions are pushed, with zero duplicates.
- **🔄 Cross-Device Synchronization:** Uses a Git-synced JSON manifest (`.algovault/manifest.json`) as the single source of truth. Your stats and dashboards sync instantly across all devices.
- **➕ In-App Repository Creation:** Create a brand new, SEO-optimized public GitHub repository (e.g., `algovault-solutions`) directly from the extension settings with a single click.
- **📊 Dynamic Master Dashboard:** AlgoVault automatically builds and continuously updates a `README.md` at the root of your repository. This recruiter-ready dashboard combines real-time SVG heatmaps and statistics for both platforms side-by-side.
- **📁 Professional Structuring:** Organizes your code automatically by `Platform > Topic > Problem Name > Language > solution.ext`.
- **🔐 Secure & Private:** Implements GitHub Device Flow or fast-web OAuth. Your GitHub tokens are strictly encrypted and stored locally on your device.

## 🏗️ Architecture & Data Flow

AlgoVault is built with a highly decoupled, modern extension architecture designed for resilience, modularity, and fast asynchronous processing.

```mermaid
flowchart TD

subgraph group_extension["Extension Contexts (Content Scripts)"]
  node_content["Content Loaders<br/>[index.ts, codeforces.ts]"]
  node_observer["DOM Lifecycle Observer<br/>[observer.ts]"]
  node_extractor["Metadata Extractor<br/>Language/Runtime/Memory"]
end

subgraph group_background["Background Service Worker"]
  node_service_worker{{"Sync Coordinator<br/>[service-worker.ts]"}}
  node_message_handler["Message Dispatcher<br/>[messageHandler.ts]"]
  node_platforms["Platform Adapters<br/>[LeetCode, Codeforces]"]
  
  node_history_db[("IndexedDB Queue<br/>[indexedDb.ts]")]
  node_manifest_store[("JSON Sync Manifest<br/>[manifestStore.ts]")]
  
  node_dashboard_builder["Dashboard Engine<br/>[dashboardBuilder.ts]"]
end

subgraph group_github["GitHub Cloud"]
  node_github_client{{"GitHub GraphQL API<br/>[client.ts]"}}
  node_repo_manager["Repository Manager<br/>(Create/Update/Topics)"]
end

subgraph group_ui["User Interface (React)"]
  node_popup["Live Dashboard<br/>[DashboardPage.tsx]"]
  node_settings["Configuration & Repo Creation<br/>[SettingsPage.tsx]"]
end

node_content -->|"In-Flight Locked Sync"| node_observer
node_observer -->|"Extracts Submission"| node_extractor
node_extractor -->|"Dispatches EVENT"| node_service_worker

node_service_worker -->|"Routes to"| node_message_handler
node_message_handler -->|"Delegates to"| node_platforms
node_message_handler -->|"Enqueues"| node_history_db

node_history_db -->|"Process Job"| node_manifest_store
node_manifest_store -->|"Aggregates Stats"| node_dashboard_builder

node_settings -->|"Creates Repo"| node_repo_manager
node_repo_manager -->|"Creates File & Branch"| node_github_client
node_dashboard_builder -->|"Builds Markdown"| node_github_client

node_popup -->|"Reads"| node_history_db

classDef toneNeutral fill:#f8fafc,stroke:#334155,stroke-width:1.5px,color:#0f172a
classDef toneBlue fill:#dbeafe,stroke:#2563eb,stroke-width:1.5px,color:#172554
classDef toneAmber fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f
classDef toneMint fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#14532d
classDef toneRose fill:#ffe4e6,stroke:#e11d48,stroke-width:1.5px,color:#881337

class node_content,node_observer,node_extractor toneBlue
class node_service_worker,node_message_handler,node_platforms,node_history_db,node_manifest_store,node_dashboard_builder toneAmber
class node_github_client,node_repo_manager toneMint
class node_popup,node_settings toneRose
```

## 🛠️ Quick Setup Guide

Get up and running with **AlgoVault v2** in less than 2 minutes:

### 1. Installation
1.  **Download:** Head over to the [Latest Releases](https://github.com/mr-sanjai-offl/AlgoVault/releases) and download the latest `.zip` file (e.g., `algovault-2.0.0.zip`).
2.  **Extract:** Unzip the downloaded file into a folder on your computer.
3.  **Load to Chrome:**
    - Open Chrome and navigate to `chrome://extensions/`.
    - Enable **Developer Mode** (toggle in the top-right corner).
    - Click **Load unpacked** and select the folder where you extracted the extension.

### 2. Authentication & Repository Creation
1.  **Connect GitHub:** Open the AlgoVault popup from your browser toolbar and click **Connect GitHub** to securely authorize the extension.
2.  **Create a Repository:** Once authenticated, go to the **Settings** tab. Click **Create New Repository**, enter a name (e.g. `algovault-solutions`), and click Create. It will instantly generate a public repository populated with SEO topics.
3.  *(Optional)* Or select an existing repository from the dropdown.

### 3. Start Syncing!
1.  Navigate to any problem on [LeetCode](https://leetcode.com/) or [Codeforces](https://codeforces.com/).
2.  Solve the problem and hit **Submit**.
3.  **Done!** Once your solution is **Accepted**, AlgoVault will instantly push your code to GitHub and update your Root Dashboard!

<p align="center">
  <img src="public/setup_guide.png" alt="AlgoVault Setup Guide" width="100%" />
</p>

## 🛡️ Production-Grade Reliability

AlgoVault is built to handle the edge cases that break basic extensions:
- **Zero Duplicates:** A strict synchronous `inFlightSubmissionId` lock completely nullifies the risk of double-syncing caused by React DOM jitter.
- **Graceful Error Handling:** Uses a dedicated background mutex (`activeJobs`) to guarantee that asynchronous GitHub API pushes never collide or overwrite each other.
- **Atomic Operations:** Integrates GitHub GraphQL conflict resolution to ensure no submission is lost due to network lag.

---

<p align="center">
  Built with ❤️ for the Developer Community
</p>
