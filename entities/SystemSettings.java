import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "system_settings")
public class SystemSettings {
    @Id
    private String maxFileSize;
    private String supportedFileTypes;
    private Integer maxRecordsPerFile;
    private Integer defaultPageSize;
    private Integer maxPageSize;
    private Integer sessionTimeoutMinutes;
}
