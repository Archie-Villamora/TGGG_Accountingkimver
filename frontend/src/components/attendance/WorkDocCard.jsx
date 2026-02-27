import { useMemo, useRef, useState } from 'react';
import { FileText, Paperclip, PenLine, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './WorkDocEditor.css';

/**
 * Shared Work Documentation card with rich text editing + attachments.
 * Drop-in replacement for the plain textarea cards across all role dashboards.
 */
export default function WorkDocCard({
    value = '',
    onChange,
    cardClass = 'rounded-2xl border border-white/10 bg-[#001f35]/70 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.22)]',
    placeholder = 'Example: Completed database design, attended team meeting, fixed bug #123...',
}) {
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);

    const quillModules = useMemo(() => ({
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean'],
        ],
    }), []);

    const quillFormats = ['bold', 'italic', 'underline', 'list', 'bullet'];

    const handleFileDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer?.files || e.target?.files || []);
        if (files.length) setAttachments((prev) => [...prev, ...files]);
    };

    const removeAttachment = (index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className={`${cardClass} p-4 sm:p-6 flex flex-col`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="grid place-items-center h-10 w-10 rounded-xl bg-blue-500/15 text-blue-300 shrink-0">
                        <PenLine className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold tracking-tight text-[clamp(0.95rem,2.4vw,1.1rem)]">
                            Work Documentation
                        </h3>
                        <p className="mt-0.5 text-white/50 text-sm">
                            Optional in the morning, recommended before Time Out.
                        </p>
                    </div>
                </div>
                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border bg-white/5 text-white/70 border-white/10">
                    <FileText className="h-3.5 w-3.5 mr-1 inline" />
                    Daily Log
                </span>
            </div>

            <div className="mt-5 space-y-4 flex-1 flex flex-col">
                <label className="block text-white/60 text-sm font-semibold">
                    What did you accomplish today?{' '}
                    <span className="font-normal text-white/40">(Optional for morning)</span>
                </label>

                {/* Rich Text Editor */}
                <div className="work-doc-editor rounded-xl border border-white/10 bg-[#00273C]/60 overflow-hidden flex-1 flex flex-col">
                    <ReactQuill
                        theme="snow"
                        value={value}
                        onChange={onChange}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder={placeholder}
                    />
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                    <p className="text-white/50 text-sm font-semibold italic">Attachments (Optional)</p>

                    {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {attachments.map((file, i) => (
                                <div
                                    key={i}
                                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70"
                                >
                                    <Paperclip className="h-3 w-3 text-white/40" />
                                    <span className="max-w-[120px] truncate">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeAttachment(i)}
                                        className="p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-red-400 transition"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div
                        className="rounded-xl border-2 border-dashed border-[#FF7120]/30 bg-[#FF7120]/[0.03] hover:bg-[#FF7120]/[0.06] hover:border-[#FF7120]/50 transition cursor-pointer flex items-center justify-center gap-2 py-3.5"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                    >
                        <Paperclip className="h-4 w-4 text-[#FF7120]/60" />
                        <span className="text-sm text-white/50 font-medium">
                            Attach files (PDF, Word, Excel, Images)
                        </span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"
                            onChange={handleFileDrop}
                        />
                    </div>
                </div>

                <p className="text-white/35 text-xs">You can check out anytime</p>
            </div>
        </div>
    );
}
