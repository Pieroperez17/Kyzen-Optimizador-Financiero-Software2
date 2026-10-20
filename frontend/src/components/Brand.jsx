import Logo from './Logo.jsx';

export default function Brand() {
  return (
    <div className="brand">
      <Logo size={38} />
      <div>
        <strong>Kyzen</strong>
        <span>Optimizador financiero</span>
      </div>
    </div>
  );
}
