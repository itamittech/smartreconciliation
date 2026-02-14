import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/add-config-endpoint-controller")
public class AddConfigEndpointController {
    // GET /config
    public String handleGet() {
        return "not_implemented";
    }

}
