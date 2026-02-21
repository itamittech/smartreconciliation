# Plan: Reconciliation Pipelines (N-Way / Chained Matching)

**Date:** 2026-02-21
**Status:** Brainstorming / Architectural Design
**Goal:** Evolve the 1-to-1 matching engine into a "Reconciliation Stream" capable of handling complex, multi-source workflows (e.g., E-commerce settlements).

---

## 1. Problem Statement
The current engine is strictly **Point-to-Point** (Source File vs. Target File). Real-world scenarios, particularly in E-commerce and Supply Chain, require **N-Way Reconciliation**:
- **Example:** `Orders` vs `Marketplace` → `Unmatched Orders` vs `Payment Gateway` → `Unmatched Items` vs `Bank Statement`.
- Users currently have to manually download unmatched results from one job and upload them as a source for the next, which is inefficient and error-prone.

## 2. Proposed Solution: "The Pipeline Model"
Instead of building a massive "N-Way" engine that matches 4 files at once, we will implement **Pipeline Chaining**. The output of one reconciliation (specifically the unmatched records) becomes the automated input for the next.

### Key Components:
1.  **Reconciliation Stream:** A grouping entity that manages a sequence of reconciliation "Steps".
2.  **Generic Input Resolver:** A layer that allows a Reconciliation to fetch data from raw uploads, external data sources, or *previous reconciliation results*.
3.  **Materialized Intermediate Artifacts:** Automatic generation of CSV files for unmatched records to ensure traceability and reuse of existing file-parsing logic.

---

## 3. Detailed Architecture

### 3.1 Data Model Changes
The `Reconciliation` entity will be updated to support polymorphic inputs.

| Field | Type | Description |
|---|---|---|
| `sourceInputType` | Enum | `FILE`, `RECONCILIATION_RESULT`, `DATA_SOURCE` |
| `sourceInputId` | Long | ID of the specific input resource |
| `streamId` | Long (FK) | Reference to the parent `ReconciliationStream` |
| `stepOrder` | Integer | Position in the pipeline |

### 3.2 New Services
- **`InputResolverService`:** Handles the logic of "Where is my data?". If the type is `RECONCILIATION_RESULT`, it looks up the parent job and fetches its generated "Unmatched" file.
- **`FileGeneratorService`:** Converts `List<Map<String, Object>>` (unmatched records) into physical CSV files stored in the `uploads/` directory.

---

## 4. Implementation Roadmap

### Phase 1: Backend Foundation (Addictive Changes)
- Update `Reconciliation` entity with new nullable input fields.
- Implement `InputResolverService` skeleton.
- Update `ReconciliationService` to prefer generic inputs over deprecated `sourceFile`/`targetFile` fields.

### Phase 2: Materialization Glue
- Implement `writeCSV` logic in `FileParserService`.
- Implement `registerGeneratedFile` in `FileUploadService`.
- Configure `ReconciliationService` to auto-generate unmatched record files upon completion.

### Phase 3: UX & Streams
- Create `ReconciliationStream` entity and API.
- **Stream Dashboard:** A high-level view showing the status of an entire business process (e.g., "Month-End E-commerce Sync").
- **Workflow Wizard:** A UI flow that guides users through configuring multiple steps at once.

---

## 5. Verification Plan
- **TDD:** New test cases in `docs/06-testing/test-cases/11-future-improvements/` for chained logic.
- **Performance:** Ensure materializing CSVs doesn't significantly latency for large (100k+) datasets.
- **Traceability:** Verify that intermediate "Virtual Files" are visible and downloadable by users for audit purposes.
