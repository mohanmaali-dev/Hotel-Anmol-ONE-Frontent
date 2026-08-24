import { FiAlertCircle, FiClock, FiCreditCard, FiDollarSign } from 'react-icons/fi'

import { formatCurrency } from '../../utils/orderFormatters.js'
import ReportSummary from './ReportSummary.jsx'

function PaymentReport({ summary = {} }) {
  return <div className="space-y-5">
    <ReportSummary items={[
      { label: 'Cash Amount', value: formatCurrency(summary.cashAmount), icon: FiDollarSign },
      { label: 'UPI Amount', value: formatCurrency(summary.upiAmount), icon: FiCreditCard, color: 'bg-violet-50 text-violet-700' },
      { label: 'Card Amount', value: formatCurrency(summary.cardAmount), icon: FiCreditCard, color: 'bg-cyan-50 text-cyan-700' },
      { label: 'Paid Amount', value: formatCurrency(summary.paidAmount), icon: FiDollarSign, color: 'bg-emerald-50 text-emerald-700' },
      { label: 'Partial Amount', value: formatCurrency(summary.partialAmount), icon: FiClock, color: 'bg-amber-50 text-amber-700' },
      { label: 'Due / Not Paid', value: formatCurrency(summary.dueNotPaidAmount), icon: FiAlertCircle, color: 'bg-rose-50 text-rose-700' },
    ]} />
  </div>
}

export default PaymentReport
