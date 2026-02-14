import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "feature_flags")
public class FeatureFlags {
    @Id
    private Boolean aiChatEnabled;
    private Boolean fileUploadEnabled;
    private Boolean bulkOperationsEnabled;
    private Boolean advancedRulesEnabled;
    private Boolean exportEnabled;
}
