import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import type { Alert } from '../types';

export function Alert({ alert }: { alert: Alert }) {
    const severity = alert.alertSeverity;
    const title =
        severity.charAt(0).toUpperCase() + severity.slice(1);

    // Map severity to a Bootstrap alert-* class
    const severityClass =
        severity === 'danger'
            ? 'alert-danger'
            : severity === 'warning'
                ? 'alert-warning'
                : 'alert-info';

    return (
        <div className={`alert ${severityClass}`} role="alert">
            <h4 className="alert-heading">
                {title} for {alert.cityName}
            </h4>
            <p>{alert.alertMessage}</p>
        </div>
    );
}