### 🔧 Engineering Decision: Summarization Algorithm

Decision: I implemented a custom frequency-based summarization algorithm (using TF-IDF concepts) instead of using an external AI API or legacy NPM packages.

Reasoning:

Reliability: It ensures the application runs offline and within the Docker container without requiring the reviewer to obtain external API keys.

Performance: It runs in O(n) time, adding negligible latency to the blog creation endpoint.

Security: Eliminates the risk of dependency vulnerabilities found in unmaintained packages like node-summary.