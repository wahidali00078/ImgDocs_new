/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { getUserConversionHistory, ConversionRecord } from '../lib/dbHelper';
import { FileText, Calendar, Compass, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';

interface UserHistoryProps {
  userId: string;
}

export default function UserHistory({ userId }: UserHistoryProps) {
  const [history, setHistory] = useState<ConversionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    const records = await getUserConversionHistory(userId);
    setHistory(records);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const getToolLabel = (tool: string) => {
    switch (tool) {
      case 'jpg_to_pdf': return 'JPG to PDF';
      case 'pdf_to_jpg': return 'PDF to JPG';
      case 'compress': return 'Compress Image';
      case 'resize': return 'Resize Image';
      default: return 'Document tool';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md" id="user-history-dashboard">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div>
          <h3 className="font-display text-xl font-bold text-slate-800">Your Conversion Logs</h3>
          <p className="text-xs text-slate-400 mt-1">
            Secure tracking of processed documents in your session history.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition-colors"
          title="Refresh logs"
          id="refresh-logs-btn"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <span className="text-sm font-medium">Loading history logs...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
          <div className="mb-3 rounded-full bg-slate-50 p-3 text-slate-300">
            <Compass className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-600">No conversions recorded yet</p>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Convert or compress a file above and your action logs will instantly appear here!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-1">Tool Used</th>
                <th className="py-3 px-1">File Name</th>
                <th className="py-3 px-1">Size</th>
                <th className="py-3 px-1">Pages/Items</th>
                <th className="py-3 px-1 text-right">Processed On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-600">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-1">
                    <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {getToolLabel(record.tool)}
                    </span>
                  </td>
                  <td className="py-3 px-1 max-w-[200px] truncate font-display font-medium text-slate-800" title={record.fileName}>
                    {record.fileName}
                  </td>
                  <td className="py-3 px-1 font-mono text-[11px] text-slate-500">
                    {record.fileSize}
                  </td>
                  <td className="py-3 px-1 text-slate-500">
                    {record.pageCount} {record.pageCount === 1 ? 'item' : 'items'}
                  </td>
                  <td className="py-3 px-1 text-right font-mono text-[10px] text-slate-400">
                    {record.timestamp ? new Date(record.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-start gap-1.5 rounded-lg bg-emerald-50/50 border border-emerald-100 p-3 mt-4 text-[10px] font-medium text-emerald-800">
            <ShieldAlert className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Privacy Note: ImgDocs never stores original image files on servers. This dashboard lists names and page metrics only.</span>
          </div>
        </div>
      )}
    </div>
  );
}
