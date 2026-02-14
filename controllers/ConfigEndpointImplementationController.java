import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/config-endpoint-implementation-controller")
public class ConfigEndpointImplementationController {
    // GET /api/v1/config
    public String handleGet() {
        return "not_implemented";
    }

}
