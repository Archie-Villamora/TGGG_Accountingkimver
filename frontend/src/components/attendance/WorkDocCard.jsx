import { useMemo, useRef, useState } from 'react';
import { FileText, Paperclip, PenLine, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './WorkDocEditor.css';

/**
 * Shared Work Documentation card with rich text editing + attachments.
 * Drop-in replacement for the plain textarea cards across all role dashboards.
 */
const CustomToolbar = ({ id, onAttach }) => (
    <div id={id} className="border-b border-white/10 px-2.5 py-2 flex items-center bg-transparent">
        <div className="flex items-center flex-wrap">
            <span className="ql-formats mr-2 hidden sm:inline-flex">
                <button className="ql-bold" />
                <button className="ql-italic" />
                <button className="ql-underline" />
            </span>
            <span className="ql-formats mr-2">
                <button className="ql-list" value="ordered" />
                <button className="ql-list" value="bullet" />
            </span>
            <span className="ql-formats">
                <button className="ql-clean" />
            </span>
            <span className="w-px h-4 bg-white/10 mx-1 hidden sm:block"></span>
            <button
                type="button"
                onClick={onAttach}
                className="flex items-center justify-center p-1.5 rounded-md hover:bg-white/10 group transition"
                title="Attach file (Max 3)"
            >
                <Paperclip className="h-[18px] w-[18px] text-white/50 group-hover:text-[#FF7120] transition-colors" />
            </button>
        </div>
    </div>
);

export default function WorkDocCard({
    value = '',
    onChange,
    cardClass = 'rounded-2xl border border-white/10 bg-[#001f35]/70 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.22)]',
    placeholder = 'Example: Completed database design, attended team meeting, fixed bug #123...',
}) {
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);
    const toolbarId = useMemo(() => `toolbar-${Math.random().toString(36).substr(2, 9)}`, []);

    const quillModules = useMemo(() => ({
        toolbar: {
            container: `#${toolbarId}`
        }
    }), [toolbarId]);

    const handleAttachClick = () => {
        if (attachments.length >= 3) {
            alert("You can only upload a maximum of 3 attachments.");
            return;
        }
        fileInputRef.current?.click();
    };

    const quillFormats = ['bold', 'italic', 'underline', 'list', 'bullet'];

    const handleFileDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer?.files || e.target?.files || []);

        if (files.length) {
            setAttachments((prev) => {
                const combined = [...prev, ...files];
                if (combined.length > 3) {
                    alert("Maximum 3 attachments allowed.");
                    return combined.slice(0, 3);
                }
                return combined;
            });
        }

        // Reset input so choosing same file again works
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeAttachment = (index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const getFilePreview = (file) => {
        if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file);
        }
        return null; // Return null if not image, we'll render icon instead
    };

    return (
        <div className={`${cardClass} p-4 sm:p-6 flex flex-col`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
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
                <div className="work-doc-editor rounded-xl border border-white/10 bg-[#00273C]/60 overflow-hidden flex-1 flex flex-col relative"
                    onDrop={handleFileDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <CustomToolbar id={toolbarId} onAttach={handleAttachClick} />

                    {/* Inline Attachments Preview Map */}
                    {attachments.length > 0 && (
                        <div className="px-4 py-3 border-b border-white/10 bg-black/10 flex flex-wrap gap-3">
                            {attachments.map((file, i) => {
                                const isImage = file.type.startsWith('image/');
                                const previewUrl = isImage ? URL.createObjectURL(file) : null;
                                return (
                                    <div
                                        key={i}
                                        className="relative group rounded-lg overflow-hidden border border-white/10 bg-[#001f35] flex items-center justify-center h-14 w-20 sm:w-24 shrink-0 transition hover:border-[#FF7120]/50"
                                        title={file.name}
                                    >
                                        {isImage ? (
                                            <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-2 text-white/50">
                                                <FileText className="h-5 w-5 mb-1" />
                                                <span className="text-[0.6rem] font-semibold truncate w-full text-center">{file.name}</span>
                                            </div>
                                        )}

                                        {/* Remove Hover Button */}
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(i)}
                                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-all shadow-sm"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <ReactQuill
                        theme="snow"
                        value={value}
                        onChange={onChange}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder={placeholder}
                    />

                    {/* Hidden input accessible via paperclip toolbar button */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"
                        onChange={handleFileDrop}
                    />
                </div>

                {/* Map Portal Target */}
                <div id="map-preview-portal"></div>

                <p className="text-white/35 text-xs">You can check out anytime</p>
            </div>
        </div>
    );
}
