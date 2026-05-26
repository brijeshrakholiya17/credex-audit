# Application Architecture

## Core Workflows

### 1. Audit Summary Generation Flow
This flow details how the user's form input is processed through the audit engine and summarized by the AI.

```mermaid
sequenceDiagram
    participant F as Form (SubscriptionForm)
    participant E as auditEngine (Client)
    participant R as Results UI (AuditResults)
    participant API as Next.js API (/generate-summary)
    participant AI as Gemini 2.5 Flash

    F->>E: Submit SpendFormData
    E-->>F: Return AuditResult (Savings, Recs)
    F->>R: Render Results Component
    R->>API: POST { teamSize, totalSpend, savings, ... }
    API->>AI: Generate Content with CFO Prompt
    AI-->>API: Return 100-word Summary
    API-->>R: Return JSON { summary }
    R->>R: Display AI Summary Card
```

### 2. Share URL Generation Flow
This flow details how a shareable URL is created and saved to the database.

```mermaid
sequenceDiagram
    participant R as Results UI (AuditResults)
    participant API as Next.js API (/audits/share)
    participant DB as Supabase Database

    R->>R: User clicks "Share results"
    R->>R: Generate UUID (shareId)
    R->>API: POST { id: shareId, result: AuditResult }
    API->>DB: INSERT INTO shared_audits
    DB-->>API: Success
    API-->>R: 200 OK
    R->>R: Copy `https://domain.com/share/{shareId}` to clipboard
```
