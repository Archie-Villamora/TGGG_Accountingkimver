import React, { useEffect, useState } from 'react';
import { Package, RefreshCcw, FileText, Search, Calendar, User, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import materialRequestService from '../../../services/materialRequestService';
import MaterialRequestFormModal from '../../../components/modals/MaterialRequestFormModal';

const cardClass = 'rounded-2xl border border-white/10 bg-[#001f35]/70 backdrop-blur-md shadow-lg';

const AccountingMaterialRequestPage = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);


  const fetchRequests = async () => {
    setLoading(true);
    const result = await materialRequestService.getMaterialRequests();
    if (result.success) {
      const data = Array.isArray(result.data) ? result.data : (result.data?.results || []);
      setRequests(data);
    } else {
      toast.error(`Failed to load material requests: ${result.error}`);
    }
    setLoading(false);
  };

  const filteredRequests = requests.filter(req => 
    req.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.created_by_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.id.toString().includes(searchQuery)
  );

  useEffect(() => {
    // Auto-select the first request if none is selected
    if (filteredRequests.length > 0 && !selectedRequest) {
      setSelectedRequest(filteredRequests[0]);
    }
  }, [filteredRequests, selectedRequest]);

  const openModal = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Package className="h-6 w-6 text-[#FF7120]" />
              Approved Material Requests
            </h1>
            <p className="text-white/60 text-sm mt-1">Review and print finalized material requisition forms for procurement.</p>
          </div>
          <button
            onClick={fetchRequests}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="p-4 border-b border-white/10 bg-white/5 text-sm font-bold">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by project, requester, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#001f35] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder:text-white/30 outline-none focus:border-[#FF7120]/50 transition"
            />
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Left Section: Request List */}
            <div className="lg:col-span-1">
              <div className="flex flex-col h-full bg-black/20 rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <h2 className="text-lg font-bold text-white">Approved Requests</h2>
                  <p className="text-xs text-white/50">{filteredRequests.length} total</p>
                </div>
                
                <div className="p-3 overflow-y-auto max-h-[700px] space-y-2 pr-1">
                  {loading ? (
                    <div className="py-10 text-center text-white/50 text-sm font-bold">Loading requests...</div>
                  ) : filteredRequests.length === 0 ? (
                    <div className="py-10 text-center text-white/40 text-sm font-medium">No approved requests found.</div>
                  ) : (
                    filteredRequests.map((request) => (
                      <button
                        key={request.id}
                        type="button"
                        onClick={() => setSelectedRequest(request)}
                        className={`w-full text-left p-4 rounded-xl border transition ${
                          selectedRequest?.id === request.id 
                            ? 'bg-[#FF7120]/10 border-[#FF7120]/50 shadow-[0_0_15px_rgba(255,113,32,0.15)]' 
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-white truncate text-sm">{request.project_name}</h3>
                        </div>
                        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-black">M.R-{request.id} • {(request.priority || 'Normal').toUpperCase()}</p>
                        
                        <div className="mt-3 grid gap-1.5 text-xs text-white/60">
                           <div className="flex items-center gap-2 min-w-0">
                              <User className="w-3.5 h-3.5 shrink-0 text-white/40" /> 
                              <span className="truncate">{request.created_by_name || 'System User'}</span>
                           </div>
                           <div className="flex items-center gap-2 min-w-0">
                              <Calendar className="w-3.5 h-3.5 shrink-0 text-white/40" /> 
                              <span className="truncate">{new Date(request.request_date).toLocaleDateString()}</span>
                           </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Section: Request Details */}
            <div className="lg:col-span-2">
              <div className="flex flex-col h-full bg-black/20 rounded-xl border border-white/10 p-6">
                {!selectedRequest && !loading ? (
                  <div className="h-full flex flex-col items-center justify-center py-20">
                    <Package className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 font-medium font-bold">Select an approved request to view details.</p>
                  </div>
                ) : selectedRequest ? (
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-3 mb-6">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-[#FF7120]/70" />
                          <h3 className="text-2xl font-bold text-white truncate">{selectedRequest.project_name}</h3>
                        </div>
                        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-black">Requisition ID: M.R-{selectedRequest.id}</p>
                      </div>
                      <button
                        onClick={() => openModal(selectedRequest)}
                        className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-[#FF7120] text-white rounded-xl text-xs font-black shadow-lg shadow-[#FF7120]/20 hover:scale-105 transition-transform active:scale-95"
                      >
                        <FileText className="h-4 w-4" />
                        VIEW FORM
                      </button>
                    </div>

                    {/* Split Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Left Block: Info */}
                      <div className="space-y-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-wider">Requester Personnel</span>
                          <div className="flex items-center gap-2 text-sm text-white/90">
                            <User className="h-4 w-4 text-[#FF7120]/50" />
                            <span className="font-bold">{selectedRequest.created_by_name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-white/40 uppercase tracking-tight">{selectedRequest.requester_role || 'Staff'}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 mt-2">
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-wider">Date Requested</span>
                          <div className="flex items-center gap-2 text-sm text-white/90">
                            <Calendar className="h-4 w-4 text-[#FF7120]/50" />
                            <span className="font-bold">{new Date(selectedRequest.request_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Audit */}
                      <div className="space-y-3 p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-emerald-400/40 uppercase tracking-wider">Studio Head Approval</span>
                          <div className="text-sm font-bold text-emerald-400/90 italic">
                            {selectedRequest.reviewed_by_studio_head_name || 'System Approved'}
                          </div>
                          <span className="text-[10px] text-emerald-400/30">
                            {selectedRequest.studio_head_reviewed_at ? new Date(selectedRequest.studio_head_reviewed_at).toLocaleString() : ''}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 mt-2">
                          <span className="text-[10px] font-black text-emerald-400/40 uppercase tracking-wider">President / CEO Approval</span>
                          <div className="text-sm font-bold text-emerald-400/90 italic">
                            {selectedRequest.reviewed_by_ceo_name || 'Final Approval'}
                          </div>
                          <span className="text-[10px] text-emerald-400/30">
                            {selectedRequest.ceo_reviewed_at ? new Date(selectedRequest.ceo_reviewed_at).toLocaleString() : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Location */}
                    <div className="mb-6 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-sm text-white/70 font-bold italic">
                      <MapPin className="h-4 w-4 text-[#FF7120]/50 shrink-0" />
                      <span className="truncate break-words w-full">Delivery Location: {selectedRequest.delivery_location || 'Not Specified'}</span>
                    </div>

                    {/* Material Preview */}
                    <div className="mb-6 p-5 rounded-xl bg-[#FF7120]/5 border border-[#FF7120]/10 border-dashed flex-1">
                      <div className="flex items-center justify-between mb-4 border-b border-[#FF7120]/10 pb-3">
                         <span className="text-[10px] font-black text-[#FF7120]/60 uppercase tracking-widest">Material Items Preview</span>
                         <span className="text-[10px] font-black bg-[#FF7120]/10 text-[#FF7120] px-3 py-1 rounded-full uppercase tracking-widest">{selectedRequest.items?.length || 0} TOTAL</span>
                      </div>
                      <div className="space-y-3">
                        {selectedRequest.items?.slice(0, 5).map((item, idx) => (
                          <div key={item.id} className="flex justify-between items-center text-sm font-bold text-white/80 bg-black/10 p-2 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-white/20 font-black"># {idx + 1}</span>
                              <span>{item.name}</span>
                            </div>
                            <span className="text-[#FF7120]">{item.quantity} {item.unit}</span>
                          </div>
                        ))}
                        {selectedRequest.items?.length > 5 && (
                          <p className="text-[10px] text-white/30 font-black mt-4 text-center tracking-[0.3em] uppercase cursor-default">
                            + {selectedRequest.items.length - 5} MORE ITEMS IN PRINTABLE FORM
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black px-3 py-1.5 bg-emerald-500 text-white rounded-lg uppercase tracking-widest shadow-lg shadow-emerald-500/20">Approved</span>
                        <span className="text-[10px] font-black px-3 py-1.5 bg-white/5 text-white/60 rounded-lg border border-white/10 uppercase tracking-widest">A4 Ready</span>
                      </div>
                      <span className="text-xs text-white/40 font-black tracking-widest uppercase">{selectedRequest.items?.length || 0} ITEMS TOTAL</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MaterialRequestFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
        userRole="accounting"
      />
    </div>
  );
};

export default AccountingMaterialRequestPage;
