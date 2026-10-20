import { Paperclip, X } from 'lucide-react';
import CategoryIcon from './CategoryIcon.jsx';
import MoneyFormatter from '../domain/MoneyFormatter.js';

export default function TransactionList({ transactions, formatter, onDelete }) {
  if (!transactions.length) {
    return <p className="empty">No hay movimientos para mostrar.</p>;
  }

  return (
    <ul className="transaction-list">
      {transactions.map((transaction) => {
        const isExpense = transaction.type === 'gasto';
        return (
          <li key={transaction.id}>
            <span className="transaction-icon" style={{ background: `${transaction.category?.color || '#94A3B8'}26`, color: transaction.category?.color || '#64748b' }}>
              <CategoryIcon name={transaction.category?.icon} size={19} />
            </span>
            <div className="transaction-detail">
              <strong>{transaction.description}</strong>
              <span>
                {transaction.category?.name || 'Sin categoría'} · {MoneyFormatter.formatDate(transaction.date)}
                {transaction.voucherUrl && (
                  <>
                    {' · '}
                    <a href={transaction.voucherUrl} target="_blank" rel="noreferrer" className="voucher-link">
                      <Paperclip size={12} aria-hidden="true" /> Comprobante
                    </a>
                  </>
                )}
              </span>
            </div>
            <strong className={isExpense ? 'amount-expense' : 'amount-income'}>
              {isExpense ? '-' : '+'} {formatter.format(transaction.amount)}
            </strong>
            {onDelete && (
              <button
                type="button"
                className="icon-button"
                aria-label={`Eliminar ${transaction.description}`}
                onClick={() => onDelete(transaction)}
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
