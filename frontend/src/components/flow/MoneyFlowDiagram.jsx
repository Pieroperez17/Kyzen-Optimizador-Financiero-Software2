import { useMemo } from 'react';
import { PiggyBank, TrendingUp, Wallet } from 'lucide-react';
import FlowBuilder from '../../domain/FlowBuilder.js';
import FlowCanvas from './FlowCanvas.jsx';

const MAXIMUM_CATEGORIES = 4;

export default function MoneyFlowDiagram({ summary, formatter }) {
  const { nodes, edges } = useMemo(() => {
    const categories = summary.expensesByCategory.slice(0, MAXIMUM_CATEGORIES);
    const savings = summary.monthlyIncome - summary.monthlyExpense;
    const destinations = [
      ...categories.map((category) => ({
        identifier: `category-${category.name}`,
        title: category.name,
        amount: category.total,
        color: category.color,
        iconName: category.icon
      })),
      ...(savings > 0
        ? [{ identifier: 'savings', title: 'Disponible', amount: savings, color: '#10b981', icon: PiggyBank }]
        : [])
    ];

    const middleRow = Math.max(destinations.length - 1, 0) / 2;
    const maximum = Math.max(...destinations.map((destination) => destination.amount), summary.monthlyIncome, 1);
    const isOverBudget = summary.budgetStatus.level === 'red';
    const builder = new FlowBuilder()
      .addNode('income', 0, middleRow, {
        title: 'Ingresos',
        subtitle: formatter.format(summary.monthlyIncome),
        icon: TrendingUp,
        color: '#10b981',
        variant: 'income',
        hasOutput: true
      })
      .addNode('month', 1, middleRow, {
        title: 'Tu mes',
        subtitle: summary.monthlyBudget
          ? `${summary.budgetStatus.percentage}% del presupuesto`
          : `Gastos: ${formatter.format(summary.monthlyExpense)}`,
        icon: Wallet,
        color: isOverBudget ? '#dc2626' : '#4f46e5',
        variant: isOverBudget ? 'danger' : 'primary',
        hasInput: true,
        hasOutput: true
      })
      .connect('income', 'month', { color: '#10b981', weight: FlowBuilder.weightFor(summary.monthlyIncome, maximum) });

    destinations.forEach((destination, index) => {
      builder
        .addNode(destination.identifier, 2, index, {
          title: destination.title,
          subtitle: formatter.format(destination.amount),
          icon: destination.icon,
          iconName: destination.iconName,
          color: destination.color,
          hasInput: true
        })
        .connect('month', destination.identifier, {
          color: destination.color,
          weight: FlowBuilder.weightFor(destination.amount, maximum)
        });
    });

    return builder.build();
  }, [summary, formatter]);

  if (!summary.monthlyIncome && !summary.monthlyExpense) {
    return <p className="empty">Registra tus ingresos y gastos para ver cómo fluye tu dinero este mes.</p>;
  }

  return <FlowCanvas nodes={nodes} edges={edges} className="flow-canvas-dashboard" />;
}
