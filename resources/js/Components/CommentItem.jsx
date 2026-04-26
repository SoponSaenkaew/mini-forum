import { useState, useEffect, memo } from 'react';
import { Link, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

/**
 * @component CommentItem
 * @description คอมโพเนนต์แสดงผลความคิดเห็น (Comment) แบบลำดับชั้น (Recursive) 
 * รองรับการอัปเดตแบบเรียลไทม์, Optimistic UI สำหรับการจัดการยอดถูกใจ 
 * และปรับปรุงประสิทธิภาพตามมาตรฐาน Lighthouse (Performance & Accessibility)
 */
const CommentItem = memo(({ 
    comment, auth, onReply, onEdit, onDelete, level = 0, highlightId = null,
    replyingTo, editingComment, commentForm, setCommentForm, commentProcessing, onCommentSubmit, onCancel 
}) => {
    // ==========================================
    // 1. ตรรกะการเน้นข้อความและการขยายอัตโนมัติ (Highlight & Auto-Expand Logic)
    // ==========================================

    /**
     * @function checkIsTargetOrHasTarget
     * @description ตรวจสอบว่าคอมเมนต์ปัจจุบันหรือคอมเมนต์ย่อยเป็นเป้าหมายของการค้นหาหรือไม่
     */
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
    // 2. ตรรกะส่วนติดต่อผู้ใช้แบบตอบสนองทันที (Optimistic UI - Comment Likes)
    // ==========================================

    const [localIsLiked, setLocalIsLiked] = useState(false);
    const [localLikeCount, setLocalLikeCount] = useState(0);

    useEffect(() => {
        setLocalIsLiked(comment.likes?.some(like => like.user_id === auth.user.id) || false);
        setLocalLikeCount(comment.likes?.length || 0);
    }, [comment.likes, auth.user.id]);

    /**
     * @function handleCommentLike
     * @description จัดการการกดถูกใจคอมเมนต์ โดยอัปเดต UI ทันทีและส่งข้อมูลไปยังเซิร์ฟเวอร์เบื้องหลัง
     */
    const handleCommentLike = () => {
        const previousLiked = localIsLiked;
        const previousCount = localLikeCount;

        setLocalIsLiked(!localIsLiked);
        setLocalLikeCount(localIsLiked ? localLikeCount - 1 : localLikeCount + 1);

        router.post(route('comments.like', comment.id), {}, { 
            preserveScroll: true, 
            preserveState: true, 
            onError: () => {
                // คืนค่ากลับหากเซิร์ฟเวอร์ตอบกลับข้อผิดพลาด
                setLocalIsLiked(previousLiked);
                setLocalLikeCount(previousCount);
            }
        });
    };

    // ==========================================
    // 3. การแสดงผลและสถานะส่วนติดต่อผู้ใช้ (UI State & Accessibility)
    // ==========================================
    
    const isBeingReplied = replyingTo?.id === comment.id;
    const isBeingEdited = editingComment?.id === comment.id;

    return (
        <div className={`mt-3 ${level > 0 ? 'ml-6 border-l-2 border-indigo-100 pl-4' : ''}`}>
            
            {/* กล่องแสดงเนื้อหาคอมเมนต์ (Main Comment Card) */}
            <div 
                className={`group relative p-3 rounded-xl transition-all duration-500 ${
                    isHighlighted ? 'bg-amber-50 border-2 border-amber-200 shadow-md scale-[1.01]' : 'hover:bg-gray-50'
                }`}
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        
                        {/* ข้อมูลประจำตัวผู้ใช้งาน (User Metadata Section) */}
                        <div className="flex items-center gap-2 mb-1">
                            <Link href={route('profile.show', comment.user.id)} className="flex items-center gap-2 group/user focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md">
                                {comment.user.avatar_url ? (
                                    <img 
                                        src={comment.user.avatar_url} 
                                        loading="lazy"
                                        decoding="async"
                                        width="24"
                                        height="24"
                                        className="h-6 w-6 rounded-full object-cover border border-gray-100 shadow-sm"
                                        alt={`โปรไฟล์ของ ${comment.user.name}`}
                                    />
                                ) : (
                                    <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] text-indigo-600 font-bold" aria-hidden="true">
                                        {comment.user.name[0]}
                                    </div>
                                )}
                                <span className="font-bold text-gray-900 group-hover/user:text-indigo-600 transition-colors text-sm">
                                    {comment.user.name}
                                </span>
                            </Link>
                            
                            {comment.parent && (
                                <span className="text-[10px] text-indigo-500 font-bold" aria-label={`ตอบกลับถึง ${comment.parent.user.name}`}>
                                    ↪ @{comment.parent.user.name}
                                </span>
                            )}
                            
                            {isHighlighted && (
                                <span className="text-[10px] bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold">เป้าหมาย</span>
                            )}
                        </div>
                        
                        {/* พื้นที่แสดงเนื้อหา (Comment Content Area) */}
                        {!isBeingEdited && (
                            <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                        )}
                        
                        {/* แถบเครื่องมือปฏิสัมพันธ์ (Interactive Toolbars) */}
                        {!isBeingEdited && (
                            <div className="mt-2 flex items-center gap-3 text-[10px]">
                                <span className="text-gray-500 font-medium">
                                    {new Date(comment.created_at).toLocaleString('th-TH')}
                                </span>
                                
                                <button 
                                    onClick={handleCommentLike} 
                                    aria-label={localIsLiked ? "ยกเลิกถูกใจคอมเมนต์" : "ถูกใจคอมเมนต์"}
                                    className={`flex items-center gap-1 font-bold transition-all p-1.5 -m-1.5 min-h-[32px] min-w-[32px] rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                                        localIsLiked ? 'text-rose-500' : 'text-gray-500 hover:text-rose-400'
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5" fill={localIsLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                    {localLikeCount > 0 && <span>{localLikeCount}</span>}
                                </button>

                                <button 
                                    onClick={() => onReply(comment)} 
                                    className="font-bold text-gray-600 hover:text-indigo-600 transition p-1.5 -m-1.5 min-h-[32px] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    ตอบกลับ
                                </button>
                                
                                {comment.user_id === auth.user.id && (
                                    <button 
                                        onClick={() => onEdit(comment)} 
                                        className="font-bold text-gray-600 hover:text-amber-600 transition p-1.5 -m-1.5 min-h-[32px] rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        แก้ไข
                                    </button>
                                )}

                                {hasReplies && (
                                    <button 
                                        onClick={() => setIsExpanded(!isExpanded)} 
                                        aria-expanded={isExpanded}
                                        className="font-bold text-indigo-600 hover:text-indigo-700 transition p-1.5 -m-1.5 min-h-[32px] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {isExpanded ? '🔼 ซ่อนการตอบกลับ' : `🔽 ดูการตอบกลับ (${comment.replies.length})`}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* เมนูตัวเลือกเพิ่มเติม (Options Dropdown) */}
                    {comment.user_id === auth.user.id && !isBeingEdited && (
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button 
                                    aria-label="จัดการตัวเลือกคอมเมนต์"
                                    className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <button 
                                    onClick={() => onDelete(comment.id)} 
                                    className="block w-full px-4 py-2 text-left text-xs hover:bg-gray-50 text-red-600 font-bold focus:outline-none focus:bg-red-50"
                                >
                                    ลบข้อมูล
                                </button>
                            </Dropdown.Content>
                        </Dropdown>
                    )}
                </div>

                {/* แบบฟอร์มตอบกลับ/แก้ไขภายใน (Inline Interaction Form) */}
                {(isBeingReplied || isBeingEdited) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <form onSubmit={onCommentSubmit} className="flex flex-col gap-2">
                            <label htmlFor={`comment-input-${comment.id}`} className="sr-only">
                                {isBeingReplied ? 'พิมพ์คำตอบกลับ' : 'แก้ไขข้อความ'}
                            </label>
                            <textarea 
                                id={`comment-input-${comment.id}`}
                                autoFocus 
                                value={commentForm.content} 
                                onChange={e => setCommentForm('content', e.target.value)} 
                                placeholder={isBeingReplied ? `ตอบกลับ @${comment.user.name}...` : "แก้ไขข้อความของคุณ..."} 
                                rows="2" 
                                className="w-full border-gray-200 rounded-xl text-sm focus:ring-indigo-500 resize-y"
                            />
                            
                            <div className="flex justify-end gap-2 mt-1">
                                <button 
                                    type="button" 
                                    onClick={onCancel} 
                                    className="text-xs font-bold text-gray-500 hover:text-gray-700 px-4 py-2 min-h-[44px] rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    aria-label="ยกเลิกการกระทำ"
                                >
                                    ยกเลิก
                                </button>
                                <button 
                                    disabled={commentProcessing || !commentForm.content.trim()} 
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-xs font-bold transition hover:bg-indigo-700 disabled:opacity-50 shadow-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    {isBeingEdited ? 'บันทึกการแก้ไข' : 'ส่งคำตอบกลับ'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* การแสดงผลคอมเมนต์ย่อย (Recursive Sub-comments Rendering) */}
            {isExpanded && hasReplies && (
                <div className="mt-1 space-y-1" role="group" aria-label={`การตอบกลับถึงคอมเมนต์ของ ${comment.user.name}`}>
                    {comment.replies.map(reply => (
                        <CommentItem 
                            key={reply.id} 
                            comment={reply} 
                            auth={auth} 
                            level={level + 1}
                            highlightId={highlightId}
                            replyingTo={replyingTo}
                            editingComment={editingComment}
                            commentForm={commentForm}
                            setCommentForm={setCommentForm}
                            commentProcessing={commentProcessing}
                            onCommentSubmit={onCommentSubmit}
                            onCancel={onCancel}
                            onReply={onReply}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

export default CommentItem;
