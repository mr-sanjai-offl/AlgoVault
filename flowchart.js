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

click node_content "https://github.com/mr-sanjai-offl/algovault/blob/main/src/content/index.ts"
click node_observer "https://github.com/mr-sanjai-offl/algovault/blob/main/src/content/observer.ts"
click node_extractor "https://github.com/mr-sanjai-offl/algovault/blob/main/src/content/extractor.ts"
click node_message_contracts "https://github.com/mr-sanjai-offl/algovault/blob/main/src/shared/types/messages.ts"
click node_service_worker "https://github.com/mr-sanjai-offl/algovault/blob/main/src/background/service-worker.ts"
click node_message_handler "https://github.com/mr-sanjai-offl/algovault/blob/main/src/background/messageHandler.ts"
click node_config_store "https://github.com/mr-sanjai-offl/algovault/blob/main/src/background/storage/configStore.ts"
click node_encrypted_storage "https://github.com/mr-sanjai-offl/algovault/blob/main/src/background/storage/encryptedStorage.ts"
click node_history_db "https://github.com/mr-sanjai-offl/algovault/blob/main/src/background/storage/indexedDb.ts"
click node_manifest_store "https://github.com/mr-sanjai-offl/algovault/blob/main/src/background/manifest/manifestStore.ts"
click node_device_flow "https://github.com/mr-sanjai-offl/algovault/blob/main/src/background/auth/deviceFlow.ts"
click node_github_client "https://github.com/mr-sanjai-offl/algovault/blob/main/src/background/github/client.ts"
click node_file_extensions "https://github.com/mr-sanjai-offl/algovault/blob/main/src/shared/utils/fileExtMap.ts"
click node_stats_aggregator "https://github.com/mr-sanjai-offl/algovault/blob/main/src/background/stats/aggregator.ts"
click node_dashboard_builder "https://github.com/mr-sanjai-offl/algovault/blob/main/src/background/markdown/dashboardBuilder.ts"
click node_readme_builder "https://github.com/mr-sanjai-offl/algovault/blob/main/src/background/markdown/readmeBuilder.ts"
click node_popup "https://github.com/mr-sanjai-offl/algovault/blob/main/src/popup/App.tsx"
click node_popup_sync "https://github.com/mr-sanjai-offl/algovault/blob/main/src/popup/hooks/useSync.ts"
click node_popup_auth "https://github.com/mr-sanjai-offl/algovault/blob/main/src/popup/hooks/useAuth.ts"
click node_options "https://github.com/mr-sanjai-offl/algovault/blob/main/src/options/App.tsx"
click node_vite "https://github.com/mr-sanjai-offl/algovault/blob/main/vite.config.ts"
click node_manifest "https://github.com/mr-sanjai-offl/algovault/blob/main/public/manifest.json"
click node_build_workflow "https://github.com/mr-sanjai-offl/algovault/blob/main/.github/workflows/build.yml"
click node_release_workflow "https://github.com/mr-sanjai-offl/algovault/blob/main/.github/workflows/release.yml"

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