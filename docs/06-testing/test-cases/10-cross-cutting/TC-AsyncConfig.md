# TC-AsyncConfig - Unit Tests

**Module**: Cross-Cutting Concerns
**Component**: AsyncConfig
**Test Level**: Unit Test
**Total Test Cases**: 2

---

### TC-AC-001: Configure Thread Pool Sizes

**Given** AsyncConfig is loaded
**When** the task executor is created
**Then** corePoolSize = 4, maxPoolSize = 8, queueCapacity = 100

---

### TC-AC-002: Async Methods Use Configured Executor

**Given** a method annotated with @Async
**When** the method is invoked
**Then** the configured task executor is used

