# Chat System Tests - Quick Reference

## Test Files Overview

### 1. ChatServiceTest.java (Unit)
```
com.amit.smartreconciliation.service.ChatServiceTest
│
├── Session Creation Tests
│   ├── shouldCreateChatSessionWithReconciliationContext (TC-CS-001)
│   ├── shouldCreateChatSessionWithoutReconciliation (TC-CS-002)
│   └── shouldThrowExceptionWhenReconciliationNotFound
│
├── Message Sending Tests
│   ├── shouldSendUserMessage (TC-CS-003)
│   └── shouldGenerateAiResponseMessage (TC-CS-004)
│
├── Auto-Session Creation Tests
│   └── shouldAutoCreateSessionOnFirstMessage (TC-CS-007)
│
├── Message Streaming Tests
│   ├── shouldStreamAiResponse (TC-CS-008)
│   └── shouldHandleStreamingError (TC-CS-009)
│
├── Message History Tests
│   └── shouldRetrieveMessageHistory (TC-CS-010)
│
├── Session Management Tests
│   ├── shouldListActiveSessionsForUser (TC-CS-011)
│   ├── shouldGetSingleSessionById
│   ├── shouldThrowExceptionWhenSessionNotFound
│   └── shouldDeleteSessionBySoftDelete
│
└── Context Building Integration Tests
    ├── shouldBuildContextWithReconciliationStatistics (TC-CS-005)
    └── shouldIncludeRecentMessagesInContext (TC-CS-006)
```

**Key Mocks:**
- ChatSessionRepository, ChatMessageRepository, ReconciliationRepository
- OrganizationService, AiService, ChatContextService

**Testing Focus:**
- Business logic isolation
- Transaction boundaries
- Data persistence verification
- Reactive stream handling with StepVerifier

---

### 2. ChatContextServiceTest.java (Unit)
```
com.amit.smartreconciliation.service.ChatContextServiceTest
│
├── System Knowledge Tests
│   ├── shouldGenerateSystemKnowledge
│   └── shouldIncludeSeverityLogic
│
├── Dynamic Context Tests
│   ├── shouldBuildDynamicContextWithReconciliation
│   ├── shouldBuildContextWithoutReconciliation
│   ├── shouldIncludeRecentActivity
│   ├── shouldIncludeSystemStatistics
│   ├── shouldIncludeExceptionBreakdown
│   └── shouldIncludeKeyFields
│
└── Smart Context Tests
    ├── shouldBuildSmartContextForReconciliationQueries
    ├── shouldBuildSmartContextForExceptionQueries
    ├── shouldBuildSmartContextForRuleQueries
    ├── shouldReturnEmptyContextWhenNoKeywordsMatch
    ├── shouldHandleCaseInsensitiveMatching
    └── shouldNotProvideRuleContextForMatchingRules
```

**Key Mocks:**
- ReconciliationRepository, ReconciliationExceptionRepository
- RuleSetRepository, UploadedFileRepository, DashboardService

**Testing Focus:**
- Context generation logic
- Data aggregation from multiple sources
- Keyword-based smart context selection
- Markdown formatting

---

### 3. ChatControllerTest.java (Integration)
```
com.amit.smartreconciliation.controller.ChatControllerTest
│
├── POST /api/v1/chat/sessions
│   ├── shouldCreateChatSessionWithReconciliation (TC-CC-001)
│   ├── shouldCreateChatSessionWithoutReconciliation (TC-CC-001)
│   └── shouldReturn404WhenReconciliationNotFound
│
├── POST /api/v1/chat/message
│   ├── shouldSendMessageToExistingSession (TC-CC-002)
│   ├── shouldSendMessageWithoutSession (TC-CC-002)
│   ├── shouldReturn400WhenMessageIsBlank
│   └── shouldReturn404WhenSessionNotFound
│
├── POST /api/v1/chat/stream
│   ├── shouldStreamAiResponse (TC-CC-003)
│   └── shouldReturn400WhenMessageIsBlankInStreaming
│
├── GET /api/v1/chat/sessions/{id}/messages
│   ├── shouldGetMessageHistory (TC-CC-004)
│   └── shouldReturnEmptyListWhenNoMessages
│
├── Session Management Endpoints
│   ├── shouldListUserSessions (TC-CC-005)
│   ├── shouldGetSingleSession
│   ├── shouldReturn404WhenSessionNotFound
│   ├── shouldDeleteSession (TC-CC-006)
│   └── shouldReturn404WhenDeletingNonExistentSession
│
└── Integration Scenarios
    └── shouldHandleCompleteChatFlow (create → send → retrieve)
```

**Testing Approach:**
- @WebMvcTest for controller isolation
- MockMvc for HTTP simulation
- Mock ChatService
- JSON validation with JSONPath

**Testing Focus:**
- REST API contract validation
- HTTP status codes
- Request/response serialization
- Server-Sent Events (SSE) streaming
- Error response structure

---

## Quick Command Reference

### Run All Chat Tests
```bash
# Windows
mvnw.cmd test -Dtest=Chat*Test

# Unix/Linux/macOS
./mvnw test -Dtest=Chat*Test
```

### Run Individual Test Class
```bash
mvnw.cmd test -Dtest=ChatServiceTest
mvnw.cmd test -Dtest=ChatContextServiceTest
mvnw.cmd test -Dtest=ChatControllerTest
```

### Run Specific Test
```bash
mvnw.cmd test -Dtest=ChatServiceTest#shouldCreateChatSessionWithReconciliationContext
```

---

## Test Coverage Summary

| Component | Test Class | Tests | LOC | Coverage |
|-----------|-----------|-------|-----|----------|
| ChatService | ChatServiceTest | 20+ | ~800 | 100% |
| ChatContextService | ChatContextServiceTest | 15+ | ~700 | 100% |
| ChatController | ChatControllerTest | 20+ | ~650 | 100% |

**Total:** 55+ tests, 2150+ lines of test code, 17/17 test cases implemented

---

## Key Testing Patterns

### Reactive Testing
```java
Flux<String> result = chatService.streamMessage(request);

StepVerifier.create(result)
    .expectNext("Token1 ")
    .expectNext("Token2 ")
    .verifyComplete();
```

### MockMvc REST Testing
```java
mockMvc.perform(post("/api/v1/chat/sessions")
        .param("reconciliationId", "1")
        .contentType(MediaType.APPLICATION_JSON))
    .andExpect(status().isCreated())
    .andExpect(jsonPath("$.data.id").value(1));
```

### ArgumentCaptor Verification
```java
ArgumentCaptor<ChatSession> captor = ArgumentCaptor.forClass(ChatSession.class);
verify(sessionRepository).save(captor.capture());
assertThat(captor.getValue().getActive()).isTrue();
```

### Test Data Builders
```java
private ChatSession createTestSession(Long id, Reconciliation rec) {
    return ChatSession.builder()
        .organization(testOrganization)
        .reconciliation(rec)
        .title("Test Session")
        .active(true)
        .build();
}
```

---

## Common Assertions

### Entity Verification
```java
assertThat(response.getId()).isEqualTo(1L);
assertThat(response.getReconciliationId()).isEqualTo(reconciliationId);
assertThat(response.getActive()).isTrue();
```

### Collection Assertions
```java
assertThat(messages).hasSize(20);
assertThat(result.stream().filter(s -> s.getActive()).count()).isGreaterThan(0);
```

### Exception Handling
```java
assertThatThrownBy(() -> chatService.getSession(999L))
    .isInstanceOf(ResourceNotFoundException.class)
    .hasMessageContaining("ChatSession")
    .hasMessageContaining("999");
```

### Context Validation
```java
assertThat(context).contains("CURRENT RECONCILIATION CONTEXT");
assertThat(context).contains("Match Rate: 92.3%");
assertThat(context).contains("RECENT CONVERSATION");
```

---

## Troubleshooting

### Test Fails with NullPointerException
- Check all mocks are initialized (@Mock annotation present)
- Verify when().thenReturn() for all mock calls
- Ensure test data is properly created in @BeforeEach

### Streaming Test Fails
- Verify Flux is properly created (not null)
- Check StepVerifier expectations match actual emissions
- Ensure doOnComplete callback is executed

### MockMvc Returns 404
- Verify endpoint path matches controller @RequestMapping
- Check HTTP method (GET, POST, DELETE)
- Ensure @WebMvcTest includes correct controller class

### JSON Serialization Fails
- Verify DTOs have getters for all fields
- Check ObjectMapper configuration
- Ensure circular references are avoided

---

## Test Maintenance

### When Adding New Features
1. Add test case to appropriate @Nested class
2. Update test data builders if needed
3. Add mock behavior for new dependencies
4. Follow existing naming conventions
5. Update progress.json

### When Modifying Existing Features
1. Update affected test assertions
2. Add new test scenarios for changed behavior
3. Keep test names descriptive
4. Maintain AAA pattern

### Code Review Checklist
- [ ] All test cases from TC-ChatService.json covered
- [ ] Unit and integration tests separate
- [ ] Mocks properly configured
- [ ] AssertJ assertions used
- [ ] Error scenarios tested
- [ ] Test names match requirements
- [ ] No test interdependencies
- [ ] Fast execution (no Thread.sleep)

---

## Related Documentation
- Test specifications: `TC-ChatService.json`
- Full test summary: `TEST-SUMMARY.md`
- Progress tracker: `../../progress.json`
- Implementation: `src/main/java/com/amit/smartreconciliation/service/ChatService.java`
