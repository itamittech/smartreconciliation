import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "config_responses")
public class ConfigResponse {
    @Id
    private String logLevel;
    private String applicationName;
}
