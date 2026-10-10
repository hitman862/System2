import React, { useState, useEffect } from 'react';
import { CheckRecord, Screen } from '../types';
import { getAllChecks, deleteCheck, clearAllChecks, exportChecks, getStats } from '../utils/storage';

interface HistoryProps {
  onNavigate: (screen: Screen) => void;
}

export default function History({ onNavigate }: HistoryProps) {
  const [records, setRecords] = useState<CheckRecord[]>([]);
  const [stats, setStats] = useState(getStats());
  const [showExport, setShowExport] = useState(false);
  const [exportData, setExportData] = useState('');
  const [filter, setFilter] = useState<'all' | 'pre-trade' | 'urgency' | 'in-trade' | 'post-trade'>('all');

  useEffect(() => {
    setRecords(getAllChecks());
    setStats(getStats());
  }, []);

  const handleDelete = (id: string) => {
    deleteCheck(id);
    setRecords(getAllChecks());
    setStats(getStats());
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all history? This cannot be undone.')) {
      clearAllChecks();
      setRecords([]);
      setStats(getStats());
    }
  };

  const handleExport = () => {
    const data = exportChecks();
    setExportData(data);
    setShowExport(true);
  };

  const filteredRecords = filter === 'all' ? records : records.filter(r => r.checkType === filter);

  const getResultColor = (result: string) => {
    switch (result) {
      case 'proceed': return 'text-emerald-400 bg-emerald-900/30';
      case 'caution': return 'text-amber-400 bg-amber-900/30';
      case 'pause': return 'text-orange-400 bg-orange-900/30';
      case 'stop': return 'text-red-400 bg-red-900/30';
      default: return 'text-slate-400 bg-slate-800';
    }
  };

  const getCheckTypeLabel = (type: string) => {
    switch (type) {
      case 'pre-trade': return '📋 Pre-Trade';
      case 'urgency': return '⚡ Urgency';
      case 'in-trade': return '📊 In-Trade';
      case 'post-trade': return '📝 Post-Trade';
      default: return type;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => onNavigate('home')}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-xl font-bold text-white">History</h2>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-slate-500 text-xs">Total Checks</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{stats.avgEmotional}</p>
          <p className="text-slate-500 text-xs">Avg Emotional</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.pausedTrades}</p>
          <p className="text-slate-500 text-xs">Paused</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {(['all', 'pre-trade', 'urgency', 'in-trade', 'post-trade'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-slate-600 text-white'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
            }`}
          >
            {f === 'all' ? 'All' : getCheckTypeLabel(f)}
          </button>
        ))}
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">📭</span>
          <p className="text-slate-400">No checks recorded yet.</p>
          <p className="text-slate-500 text-sm mt-1">Complete a check to see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map(record => (
            <div key={record.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs text-slate-500">{formatDate(record.timestamp)}</span>
                  <p className="text-sm font-medium text-white mt-0.5">
                    {getCheckTypeLabel(record.checkType)}
                    {'symbol' in record && (record as any).symbol && (
                      <span className="text-slate-400 ml-2">• {(record as any).symbol}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors p-1"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {'result' in record && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getResultColor(record.result)}`}>
                    {record.result === 'proceed' ? '✓ Proceed' :
                     record.result === 'caution' ? '⚠ Caution' :
                     record.result === 'pause' ? '⏸ Pause' : '🛑 Stop'}
                  </span>
                )}
                {'emotionalScore' in record && (
                  <span className="text-xs text-slate-500">
                    Emotional: {(record as any).emotionalScore}
                  </span>
                )}
                {'checklistScore' in record && (
                  <span className="text-xs text-slate-500">
                    Plan: {(record as any).checklistScore}
                  </span>
                )}
                {'label' in record && (
                  <span className="text-xs text-slate-400">
                    {(record as any).label}
                  </span>
                )}
              </div>

              {'recommendation' in record && (record as any).recommendation && (
                <p className="text-slate-500 text-xs mt-2 line-clamp-2">
                  {(record as any).recommendation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleExport}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl border border-slate-700 transition-colors text-sm"
        >
          📤 Export
        </button>
        <button
          onClick={handleClearAll}
          className="flex-1 bg-slate-800 hover:bg-red-900/30 text-slate-300 hover:text-red-300 font-medium py-2.5 rounded-xl border border-slate-700 hover:border-red-700 transition-colors text-sm"
        >
          🗑 Clear All
        </button>
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 max-w-lg w-full max-h-[80vh] overflow-auto">
            <h3 className="text-white font-semibold mb-3">Export Data</h3>
            <textarea
              value={exportData}
              readOnly
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 text-xs font-mono h-64 resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportData);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg transition-colors text-sm"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowExport(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2 rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
