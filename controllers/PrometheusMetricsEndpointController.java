import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/prometheus-metrics-endpoint-controller")
public class PrometheusMetricsEndpointController {
    // GET /metrics
    public String handleGet() {
        return "not_implemented";
    }

}
