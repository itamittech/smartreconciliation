import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/prometheus-metrics-endpoint-for-reconciliation-service-controller")
public class PrometheusMetricsEndpointForReconciliationServiceController {
    // GET /metrics
    public String handleGet() {
        return "not_implemented";
    }

}
