import { TriangleAlert } from 'lucide-react';

export default function AlertBanner({ alert }) {
  if (!alert) return null;
  return (
    <div className="alert-banner" role="alert">
      <span className="alert-icon"><TriangleAlert size={22} aria-hidden="true" /></span>
      <div>
        <strong>Alerta de presupuesto · {alert.percentage}%</strong>
        <p>{alert.message}</p>
      </div>
    </div>
  );
}
