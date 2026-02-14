import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "config_responses")
public class ConfigResponse {
    @Id
    private String apiVersion;
    private String buildVersion;
    private String environment;
    private String featureFlags;
    private String systemSettings;
    private String organizationId;
    private String timestamp;
}
