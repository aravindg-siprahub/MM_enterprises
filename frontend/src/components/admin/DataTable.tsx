"use client";

import { useState } from "react";
import { Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface Props {
  columns: Column[];
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  searchPlaceholder?: string;
  selectable?: boolean;
  bulkActions?: { label: string; action: string; className?: string }[];
  onBulkAction?: (action: string, selectedIds: string[]) => void;
}

export default function DataTable({ columns, data, onEdit, onDelete, searchPlaceholder = "Search...", selectable = false, bulkActions, onBulkAction }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;

  // Filter
  const filteredData = data.filter((item) => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--border)] overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
        
        {selectable && selectedIds.size > 0 && bulkActions && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600 mr-2">{selectedIds.size} selected</span>
            {bulkActions.map(ba => (
              <button 
                key={ba.action}
                onClick={() => {
                  if (onBulkAction) onBulkAction(ba.action, Array.from(selectedIds));
                  setSelectedIds(new Set()); // Clear selection after action
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md text-white shadow-sm ${ba.className || 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {ba.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-[var(--border)]">
            <tr>
              {selectable && (
                <th className="px-6 py-3 w-10">
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(new Set(paginatedData.map(d => d.id)));
                      else setSelectedIds(new Set());
                    }}
                    checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-3">{col.label}</th>
              ))}
              {(onEdit || onDelete) && <th className="px-6 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {selectable && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(item.id)}
                        onChange={() => {
                          const newSet = new Set(selectedIds);
                          if (newSet.has(item.id)) newSet.delete(item.id);
                          else newSet.add(item.id);
                          setSelectedIds(newSet);
                        }}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-3">
                        {onEdit && (
                          <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800 transition-colors">
                            <Edit size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(item)} className="text-red-500 hover:text-red-700 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between bg-gray-50/50">
        <span className="text-sm text-gray-600">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
        </span>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium px-2">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button 
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
