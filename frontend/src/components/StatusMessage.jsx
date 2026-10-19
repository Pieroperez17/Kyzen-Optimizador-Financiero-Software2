export default function StatusMessage({ status }) {
  if (!status || !status.text) return null;
  return (
    <p className={`status status-${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>
      {status.text}
    </p>
  );
}
