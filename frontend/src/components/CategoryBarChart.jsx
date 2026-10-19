export default function CategoryBarChart({ categories, formatter }) {
  if (!categories.length) {
    return <p className="empty">Aún no registras gastos este mes.</p>;
  }

  const maximum = Math.max(...categories.map((category) => category.total));

  return (
    <ul className="bar-chart">
      {categories.map((category) => (
        <li key={category.name}>
          <div className="bar-label">
            <span>{category.icon} {category.name}</span>
            <strong>{formatter.format(category.total)}</strong>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${Math.max((category.total / maximum) * 100, 4)}%`, background: category.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
