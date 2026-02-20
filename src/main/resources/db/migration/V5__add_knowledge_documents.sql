-- Knowledge Documents tracking table
-- Stores metadata for uploaded knowledge files (actual vectors live in Spring AI's vector_store table)
CREATE TABLE knowledge_documents (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    domain VARCHAR(50) NOT NULL,
    file_type VARCHAR(10) NOT NULL,
    chunk_count INTEGER DEFAULT 0,
    organization_id BIGINT NOT NULL REFERENCES organizations(id),
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_knowledge_documents_org ON knowledge_documents(organization_id);
CREATE INDEX idx_knowledge_documents_domain ON knowledge_documents(domain);
