"use client";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/config";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    fetch(`${API_BASE_URL}/api/admin/inquiries`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        setInquiries(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const token = localStorage.getItem("admin_token");
    try {
      await fetch(`${API_BASE_URL}/api/admin/inquiries/${id}/status?status=${newStatus}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      setInquiries(inquiries.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
    } catch(err) {
      alert("Failed to update status");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold font-playfair text-white mb-1">Customer Inquiries</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage quote requests and customer contacts.</p>
        </div>
      </div>

      <div className="glass-card border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-[var(--text-secondary)]">
          <thead className="bg-[var(--surface-elevated)] text-[var(--text-muted)] uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Customer Info</th>
              <th className="px-6 py-4 font-medium">Message</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[var(--text-muted)]">Loading inquiries...</td>
              </tr>
            ) : inquiries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[var(--text-muted)]">No inquiries yet.</td>
              </tr>
            ) : (
              inquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(inq.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{inq.customer_name}</div>
                    <div className="text-xs">{inq.phone}</div>
                    {inq.email && <div className="text-xs">{inq.email}</div>}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate">{inq.message}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={inq.status}
                      onChange={(e) => updateStatus(inq.id, e.target.value)}
                      className="bg-[var(--surface-card)] border border-[var(--border)] text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-[var(--gold-500)]"
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
