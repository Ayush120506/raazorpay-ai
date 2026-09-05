import React from 'react';
import { FailedPayment } from '../types';
import { DollarSign, PhoneOutgoing, MessageSquareText, CheckCircle2, TrendingUp } from 'lucide-react';

interface Props {
  payments: FailedPayment[];
}

export const MetricsBar: React.FC<Props> = ({ payments }) => {
  const totalFailedAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const recoveredPayments = payments.filter(p => p.recoveryStatus === 'recovered');
  const totalRecoveredAmount = recoveredPayments.reduce((sum, p) => sum + p.amount, 0);
  const recoveryRate = totalFailedAmount > 0 
    ? Math.round((totalRecoveredAmount / totalFailedAmount) * 100) 
    : 0;

  const callsPlaced = payments.filter(p => 
    p.recoveryStatus === 'call_in_progress' || 
    p.recoveryStatus === 'customer_interested' || 
    p.recoveryStatus === 'whatsapp_link_sent' || 
    p.recoveryStatus === 'recovered'
  ).length;

  const whatsappSent = payments.filter(p => 
    p.recoveryStatus === 'whatsapp_link_sent' || 
    p.recoveryStatus === 'recovered'
  ).length;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 border border-[#222] bg-[#080808]/80 divide-x divide-y md:divide-y-0 divide-[#222] rounded-xl overflow-hidden shadow-2xl">
      {/* Metric 1: Abandoned Value */}
      <div className="p-5 md:p-6 flex flex-col justify-between hover:bg-[#0c0c0c] transition-colors">
        <div className="flex items-center justify-between text-[#777]">
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">Abandoned Value</span>
          <span className="text-red-500/70 font-mono text-[10px]">[LOSS]</span>
        </div>
        <div className="mt-3">
          <div className="text-2xl md:text-3xl font-light tracking-tighter text-white font-mono">
            {formatINR(totalFailedAmount)}
          </div>
          <div className="mt-1 text-[11px] text-[#666] font-mono">
            {payments.length} checkouts
          </div>
        </div>
      </div>

      {/* Metric 2: Recovered Revenue */}
      <div className="p-5 md:p-6 flex flex-col justify-between bg-emerald-950/10 hover:bg-emerald-950/20 transition-colors">
        <div className="flex items-center justify-between text-emerald-400">
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">Recovered Revenue</span>
          <span className="text-emerald-400 font-mono text-[10px]">[SALVAGED]</span>
        </div>
        <div className="mt-3">
          <div className="text-2xl md:text-3xl font-light tracking-tighter text-emerald-400 font-mono">
            {formatINR(totalRecoveredAmount)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-500/70 font-medium">
            Autonomous Voice + UPI
          </div>
        </div>
      </div>

      {/* Metric 3: Efficiency / Rate */}
      <div className="p-5 md:p-6 flex flex-col justify-between hover:bg-[#0c0c0c] transition-colors">
        <div className="flex items-center justify-between text-[#777]">
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">Efficiency Rate</span>
          <span className="text-orange-400 font-mono text-[10px]">{recoveryRate}%</span>
        </div>
        <div className="mt-3">
          <div className="text-2xl md:text-3xl font-light tracking-tighter text-white">
            {recoveryRate}.0%
          </div>
          <div className="mt-1 text-[11px] text-[#666]">
            {recoveredPayments.length} of {payments.length} salvaged
          </div>
        </div>
      </div>

      {/* Metric 4: Call Volume */}
      <div className="p-5 md:p-6 flex flex-col justify-between hover:bg-[#0c0c0c] transition-colors">
        <div className="flex items-center justify-between text-[#777]">
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">Voice Dials</span>
          <span className="text-cyan-400 font-mono text-[10px]">HINGLISH</span>
        </div>
        <div className="mt-3">
          <div className="text-2xl md:text-3xl font-light tracking-tighter text-white font-mono">
            {callsPlaced}
          </div>
          <div className="mt-1 text-[11px] text-[#666]">
            Deepgram + Llama-3.3
          </div>
        </div>
      </div>

      {/* Metric 5: WhatsApp Links */}
      <div className="p-5 md:p-6 flex flex-col justify-between hover:bg-[#0c0c0c] transition-colors col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-[#777]">
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">WhatsApp 1-Tap</span>
          <span className="text-green-400 font-mono text-[10px]">META API</span>
        </div>
        <div className="mt-3">
          <div className="text-2xl md:text-3xl font-light tracking-tighter text-white font-mono">
            {whatsappSent}
          </div>
          <div className="mt-1 text-[11px] text-[#666]">
            1-Click UPI dispatch
          </div>
        </div>
      </div>
    </div>
  );
};
