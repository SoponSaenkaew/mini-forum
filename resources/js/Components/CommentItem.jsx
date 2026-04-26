import { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

/**
 * Comment Item Component
 * @description คอมโพเนนต์แสดงผล 1 คอมเมนต์ รองรับระบบ Nested Replies (คอมเมนต์ย่อย), 
 * การกดไลก์แบบ Optimistic UI, และการกาง Inline Form ทันทีใต้ตัวมันเองเมื่อกดตอบ/แก้ไข
 * * @param {Object} props
 * @param {Object} props.comment - ข้อมูลคอมเมนต์
 * @param {Object} props.auth - ข้อมูลผู้ใช้
 * @param {Function} props.onReply - Callback เมื่อกด "ตอบกลับ"
 * @param {Function} props.onEdit - Callback เมื่อกด "แก้ไข"
 * @param {Function} props.onDelete - Callback เมื่อกด "ลบ"
 * @param {number} props.level - ระดับความลึก (ใช้คำนวณ Indentation)
 * @param {number|string|null} props.highlightId - ID ของคอมเมนต์ที่ถูกไฮไลท์
 * * ✨ Props สำหรับควบคุม Inline Form
 * @param {Object|null} props.replyingTo - ข้อมูลคอมเมนต์เป้าหมายที่กำลังจะถูกตอบ
 * @param {Object|null} props.editingComment - ข้อมูลคอมเมนต์เป้าหมายที่กำลังถูกแก้ไข
 * @param {Object} props.commentForm - Data จาก useForm ของ Inertia
 * @param {Function} props.setCommentForm - ฟังก์ชันตั้งค่าข้อมูลในฟอร์ม
 * @param {boolean} props.commentProcessing - สถานะการโหลดขณะส่งฟอร์ม
 * @param {Function} props.onCommentSubmit - ฟังก์ชันจัดการเมื่อกดยืนยันการส่งฟอร์ม
 * @param {Function} props.onCancel - ฟังก์ชันจัดการเมื่อกดยกเลิก
 * @returns {JSX.Element}
 */
export default function CommentItem({ 
    comment, auth, onReply, onEdit, onDelete, level = 0, highlightId = null,
    replyingTo, editingComment, commentForm, setCommentForm, commentProcessing, onCommentSubmit, onCancel 
}) {
    // ==========================================
    // Highlight & Auto-Expand Logic
    // ==========================================

    const checkIsTargetOrHasTarget = (item, targetId) => {
        if (!targetId) return false;
        if (item.id === targetId) return true;
        if (item.replies && item.replies.length > 0) {
            return item.replies.some(reply => checkIsTargetOrHasTarget(reply, targetId));
        }
        return false;
    };

    const isHighlighted = highlightId === comment.id;
    const shouldBeExpanded = checkIsTargetOrHasTarget(comment, highlightId);
    
    const [isExpanded, setIsExpanded] = useState(shouldBeExpanded); 

    useEffect(() => {
        if (shouldBeExpanded) setIsExpanded(true);
    }, [highlightId, shouldBeExpanded]);

    const hasReplies = comment.replies && comment.replies.length > 0;

    // ==========================================
    // Optimistic UI Logic (Comment Likes)
    // ==========================================

    const [localIsLiked, setLocalIsLiked] = useState(false);
    const [localLikeCount, setLocalLikeCount] = useState(0);

    useEffect(() => {
        setLocalIsLiked(comment.likes?.some(like => like.user_id === auth.user.id) || false);
        setLocalLikeCount(comment.likes?.length || 0);
    }, [comment.likes, auth.user.id]);

    const handleCommentLike = () => {
        setLocalIsLiked(!localIsLiked);
        setLocalLikeCount(localIsLiked ? localLikeCount - 1 : localLikeCount + 1);

        router.post(route('comments.like', comment.id), {}, { 
            preserveScroll: true, 
            preserveState: true, 
            onError: () => {
                setLocalIsLiked(localIsLiked);
                setLocalLikeCount(localLikeCount);
            }
        });
    };

    // ==========================================
    // Inline Form State Logic
    // ==========================================
    
    /** ตรวจสอบว่า "ตัวมันเอง" กำลังตกเป็นเป้าหมายของการตอบกลับ หรือแก้ไขอยู่หรือไม่ */
    const isBeingReplied = replyingTo?.id === comment.id;
    const isBeingEdited = editingComment?.id === comment.id;

    return (
        <div className={`mt-3 ${level > 0 ? 'ml-6 border-l-2 border-indigo-100 pl-4' : ''}`}>
            
            {/* กล่องหลักของคอมเมนต์ */}
            <div className={`group relative p-3 rounded-xl transition-all duration-500 ${isHighlighted ? 'bg-amber-50 border-2 border-amber-200 shadow-md scale-[1.01]' : 'hover:bg-gray-50'}`}>
                
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        
                        {/* --- ข้อมูลเจ้าของคอมเมนต์ --- */}
                        <div className="flex items-center gap-2 mb-1">
                            <Link href={route('profile.show', comment.user.id)} className="flex items-center gap-2 group/user">
                                {comment.user.avatar_url ? (
                                    <img src={`${comment.user.avatar_url}?t=${new Date().getTime()}`} className="h-6 w-6 rounded-full object-cover border border-gray-100 shadow-sm" />
                                ) : (
                                    <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] text-indigo-600 font-bold">
                                        {comment.user.name[0]}
                                    </div>
                                )}
                                <span className="font-bold text-gray-900 group-hover/user:text-indigo-600 transition-colors text-sm">
                                    {comment.user.name}
                                </span>
                            </Link>
                            
                            {comment.parent && (
                                <span className="text-[10px] text-indigo-400 font-medium">↪ @{comment.parent.user.name}</span>
                            )}
                            
                            {isHighlighted && (
                                <span className="text-[10px] bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold">TARGET</span>
                            )}
                        </div>
                        
                        {/* --- เนื้อหา (ซ่อนถ้าตัวมันเองกำลังถูกแก้ไข) --- */}
                        {!isBeingEdited && (
                            <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                        )}
                        
                        {/* --- แถบเครื่องมือ (ซ่อนถ้าตัวมันเองกำลังถูกแก้ไข) --- */}
                        {!isBeingEdited && (
                            <div className="mt-2 flex items-center gap-4 text-[10px]">
                                <span className="text-gray-400">{new Date(comment.created_at).toLocaleString('th-TH')}</span>
                                
                                <button 
                                    onClick={handleCommentLike} 
                                    className={`flex items-center gap-1 font-bold transition-all ${localIsLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'}`}
                                >
                                    <svg className="w-3 h-3" fill={localIsLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                    {localLikeCount > 0 && <span>{localLikeCount}</span>}
                                </button>

                                <button onClick={() => onReply(comment)} className="font-bold text-gray-500 hover:text-indigo-600 transition">ตอบกลับ</button>
                                
                                {comment.user_id === auth.user.id && (
                                    <button onClick={() => onEdit(comment)} className="font-bold text-gray-400 hover:text-amber-600 transition">แก้ไข</button>
                                )}

                                {hasReplies && (
                                    <button onClick={() => setIsExpanded(!isExpanded)} className="font-bold text-indigo-500 hover:text-indigo-700 transition">
                                        {isExpanded ? '🔼 ซ่อน' : `🔽 ดูการตอบกลับ (${comment.replies.length})`}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* เมนู 3 จุด (ลบ) */}
                    {comment.user_id === auth.user.id && !isBeingEdited && (
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button aria-label="เมนูจัดการคอมเมนต์" className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <button onClick={() => onDelete(comment.id)} className="block w-full px-4 py-2 text-left text-xs hover:bg-gray-50 text-red-500 font-bold">ลบ</button>
                            </Dropdown.Content>
                        </Dropdown>
                    )}
                </div>

                {/* ==========================================
                    INLINE FORM 
                    จะกางออกมาแสดงผลก็ต่อเมื่อ "ตัวมันเอง" กำลังถูกตอบกลับหรือแก้ไข
                ========================================== */}
                {(isBeingReplied || isBeingEdited) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <form onSubmit={onCommentSubmit} className="flex flex-col gap-2">
                            <textarea 
                                autoFocus // ให้เคอร์เซอร์ไปกระพริบรอพิมพ์ทันที
                                value={commentForm.content} 
                                onChange={e => setCommentForm('content', e.target.value)} 
                                placeholder={isBeingReplied ? `ตอบกลับ @${comment.user.name}...` : "แก้ไขข้อความของคุณ..."} 
                                rows="2" 
                                className="w-full border-gray-200 rounded-xl text-sm focus:ring-indigo-500 resize-y"
                            ></textarea>
                            
                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={onCancel} 
                                    className="text-[10px] font-bold text-gray-400 hover:text-gray-600 px-3"
                                >
                                    ยกเลิก
                                </button>
                                <button 
                                    disabled={commentProcessing || !commentForm.content.trim()} 
                                    className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {isBeingEdited ? 'บันทึกแก้ไข' : 'ส่งคำตอบ'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* --- Recursive Rendering --- 
                คอมเมนต์ย่อย (Replies) 
                * สำคัญ: ต้องส่งผ่าน Props ของฟอร์มทุกตัวลงไปให้ลูกหลานด้วย!
            */}
            {isExpanded && hasReplies && (
                <div className="mt-1 space-y-1">
                    {comment.replies.map(reply => (
                        <CommentItem 
                            key={reply.id} 
                            comment={reply} 
                            auth={auth} 
                            level={level + 1}
                            highlightId={highlightId}
                            
                            // ส่งต่อ Props ระบบฟอร์ม
                            replyingTo={replyingTo}
                            editingComment={editingComment}
                            commentForm={commentForm}
                            setCommentForm={setCommentForm}
                            commentProcessing={commentProcessing}
                            onCommentSubmit={onCommentSubmit}
                            onCancel={onCancel}
                            
                            // ส่งต่อ Callbacks ของปุ่มกด
                            onReply={onReply}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
