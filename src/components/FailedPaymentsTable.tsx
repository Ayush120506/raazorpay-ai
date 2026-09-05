import React, { useState } from 'react';
import { FailedPayment, RecoveryStatus } from '../types';
import { 
  PhoneCall, 
  MessageSquare, 
  CheckCircle2, 
  Search, 
  ExternalLink, 
  Clock, 
  AlertCircle,
  Headphones,
  Send,
  Sparkles,
  PhoneForwarded,
  ArrowUpDown
} from 'lucide-react';

interface Props {
  payments: FailedPayment[];
  onTriggerCall: (payment: FailedPayment) => void;
  onViewCall: (payment: FailedPayment) => void;
  onViewWhatsApp: (payment: FailedPayment) => void;
  onMarkRecovered: (payment: FailedPayment) => void;
  callingPaymentId: string | null;
}

export const FailedPaymentsTable: React.FC<Props> = ({
  payments,
  onTriggerCall,
  onViewCall,
  onViewWhatsApp,
  onMarkRecovered,
  callingPaymentId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerPhone.includes(searchTerm) ||
      p.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.productName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'failed') return p.recoveryStatus === 'failed';
    if (statusFilter === 'calling') return p.recoveryStatus === 'call_in_progress' || p.recoveryStatus === 'call_queued';
    if (statusFilter === 'whatsapp') return p.recoveryStatus === 'whatsapp_link_sent';
    if (statusFilter === 'recovered') return p.recoveryStatus === 'recovered';

    return true;
  });

  const getStatusBadge = (status: RecoveryStatus) => {
    switch (status) {
      case 'recovered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Recovered
          </span>
        );
      case 'whatsapp_link_sent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/30">
            <MessageSquare className="w-3 h-3" />
            WhatsApp Sent
          </span>
        );
      case 'customer_interested':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <Sparkles className="w-3 h-3" />
            Agreed to Pay
          </span>
        );
      case 'call_in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/40 animate-pulse">
            <PhoneForwarded className="w-3 h-3 animate-bounce" />
            AI Dialing
          </span>
        );
      case 'call_queued':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Clock className="w-3 h-3" />
            Queued
          </span>
        );
      case 'failed':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
            <AlertCircle className="w-3 h-3" />
            Abandoned
          </span>
        );
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-[#080808] border border-[#222] rounded-xl shadow-2xl overflow-hidden">
      {/* Control bar: search & status filter tabs */}
      <div className="p-4 border-b border-[#222] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#080808]">
        {/* Filter pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-orange-600 text-white font-semibold shadow-[0_0_12px_rgba(234,88,12,0.3)]'
                : 'bg-[#050505] text-[#888] border border-[#222] hover:text-white hover:border-[#333]'
            }`}
          >
            All Checkouts ({payments.length})
          </button>
          <button
            onClick={() => setStatusFilter('failed')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'failed'
                ? 'bg-red-700 text-white font-semibold'
                : 'bg-[#050505] text-[#888] border border-[#222] hover:text-white hover:border-[#333]'
            }`}
          >
            Needs AI Call ({payments.filter(p => p.recoveryStatus === 'failed').length})
          </button>
          <button
            onClick={() => setStatusFilter('whatsapp')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'whatsapp'
                ? 'bg-green-700 text-white font-semibold'
                : 'bg-[#050505] text-[#888] border border-[#222] hover:text-white hover:border-[#333]'
            }`}
          >
            WhatsApp Link Sent ({payments.filter(p => p.recoveryStatus === 'whatsapp_link_sent').length})
          </button>
          <button
            onClick={() => setStatusFilter('recovered')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'recovered'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-[#050505] text-[#888] border border-[#222] hover:text-white hover:border-[#333]'
            }`}
          >
            Recovered ({payments.filter(p => p.recoveryStatus === 'recovered').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#555]" />
          <input
            type="text"
            placeholder="Search customer, phone, order..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#050505] border border-[#222] rounded pl-9 pr-3 py-1.5 text-xs text-[#EEE] placeholder-[#555] focus:outline-none focus:border-orange-500 font-sans"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#050505] border-b border-[#222] text-[#888] uppercase text-[10px] tracking-[0.2em] font-medium">
            <tr>
              <th className="py-3.5 px-5">Customer & Contact</th>
              <th className="py-3.5 px-5">Cart & Order</th>
              <th className="py-3.5 px-5">Value</th>
              <th className="py-3.5 px-5">Drop-off Reason</th>
              <th className="py-3.5 px-5">Intervention Status</th>
              <th className="py-3.5 px-5 text-right">Autonomous Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151515]">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-[#666]">
                  <AlertCircle className="w-7 h-7 mx-auto mb-2 opacity-30 text-orange-500" />
                  No checkouts match your query.
                </td>
              </tr>
            ) : (
              filteredPayments.map(payment => {
                const isCallingThis = callingPaymentId === payment.id;
                return (
                  <tr key={payment.id} className="hover:bg-[#0c0c0c] transition-colors">
                    {/* Customer */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="font-semibold text-white text-sm tracking-tight">{payment.customerName}</div>
                      <div className="text-[#888] font-mono text-[11px] mt-0.5">{payment.customerPhone}</div>
                      <div className="text-[#555] text-[11px] truncate max-w-[150px]">{payment.customerEmail}</div>
                    </td>

                    {/* Order & Product */}
                    <td className="py-3.5 px-5 max-w-[220px]">
                      <div className="font-medium text-[#DDD] truncate" title={payment.productName}>
                        {payment.productName}
                      </div>
                      <div className="text-[#777] font-mono text-[11px] flex items-center gap-1.5 mt-0.5">
                        <span className="bg-[#111] px-1.5 py-0.5 rounded text-[10px] text-[#AAA] border border-[#222]">
                          {payment.orderId}
                        </span>
                        <span className="text-[#555] text-[10px]">
                          {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="font-mono text-white text-sm font-semibold tracking-tight">
                        {formatINR(payment.amount)}
                      </div>
                      {payment.discountOffered && (
                        <div className="text-[10px] text-orange-400 font-mono mt-0.5">
                          {payment.discountOffered}
                        </div>
                      )}
                    </td>

                    {/* Failure Reason */}
                    <td className="py-3.5 px-5 max-w-[220px]">
                      <div className="text-[#AAA] text-xs line-clamp-2" title={payment.failureReason}>
                        {payment.failureReason}
                      </div>
                      <div className="text-[10px] text-[#555] font-mono mt-0.5">GATEWAY_DECLINE</div>
                    </td>

                    {/* Recovery Status */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {getStatusBadge(payment.recoveryStatus)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        {/* 1. Trigger Voice Call Button */}
                        {payment.recoveryStatus === 'failed' && (
                          <button
                            id={`btn-trigger-call-${payment.id}`}
                            onClick={() => onTriggerCall(payment)}
                            disabled={isCallingThis}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs shadow-[0_0_12px_rgba(234,88,12,0.3)] transition-all cursor-pointer disabled:opacity-50"
                            title="Trigger automated Hinglish call to customer"
                          >
                            <PhoneCall className={`w-3.5 h-3.5 ${isCallingThis ? 'animate-spin' : ''}`} />
                            <span>{isCallingThis ? 'Connecting...' : 'Call Customer'}</span>
                          </button>
                        )}

                        {/* 2. View Call Audio & Transcript Button */}
                        {payment.transcript && payment.transcript.length > 0 && (
                          <button
                            id={`btn-view-call-${payment.id}`}
                            onClick={() => onViewCall(payment)}
                            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-[#111] hover:bg-[#181818] text-orange-400 border border-[#262626] font-medium text-xs transition-all cursor-pointer"
                            title="Listen to call & inspect Hinglish transcript"
                          >
                            <Headphones className="w-3.5 h-3.5" />
                            <span>Transcript</span>
                          </button>
                        )}

                        {/* 3. View WhatsApp Message Button */}
                        {(payment.recoveryStatus === 'whatsapp_link_sent' || payment.recoveryStatus === 'recovered') && (
                          <button
                            id={`btn-view-wa-${payment.id}`}
                            onClick={() => onViewWhatsApp(payment)}
                            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-[#111] hover:bg-[#181818] text-green-400 border border-[#262626] font-medium text-xs transition-all cursor-pointer"
                            title="Inspect WhatsApp recovery message and link"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        )}

                        {/* 4. Mark as Recovered simulation */}
                        {payment.recoveryStatus === 'whatsapp_link_sent' && (
                          <button
                            id={`btn-mark-paid-${payment.id}`}
                            onClick={() => onMarkRecovered(payment)}
                            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs transition-all cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            title="Simulate customer paying via the WhatsApp link"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Simulate Paid</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
