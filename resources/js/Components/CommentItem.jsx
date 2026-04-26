import { useState, useEffect, memo } from 'react';
import { Link, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

/**
 * @component CommentItem
 * @description คอมโพเนนต์แสดงผลความคิดเห็น (Comment) แบบ Recursive สนับสนุนระบบ Real-time, 
 * Optimistic UI สำหรับการถูกใจ และปรับปรุงความสามารถในการเข้าถึง (Accessibility) ตามมาตรฐาน WCAG
 */
const CommentItem = memo(({ 
    comment, auth, onReply, onEdit, onDelete, level = 0, highlightId = null,
    replyingTo, editingComment, commentForm, setCommentForm, commentProcessing, onCommentSubmit, onCancel 
}) => {
    // ==========================================
    // 1. Highlight & Auto-Expand Logic
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
    // 2. Optimistic UI Logic (Comment Likes)
    // ==========================================

    const [localIsLiked, setLocalIsLiked] = useState(false);
    const [localLikeCount, setLocalLikeCount] = useState(0);

    useEffect(() => {
        setLocalIsLiked(comment.likes?.some(like => like.user_id === auth.user.id) || false);
        setLocalLikeCount(comment.likes?.length || 0);
    }, [comment.likes, auth.user.id]);

    const handleCommentLike = () => {
        const previousLiked = localIsLiked;
        const previousCount = localLikeCount;

        setLocalIsLiked(!localIsLiked);
        setLocalLikeCount(localIsLiked ? localLikeCount - 1 : localLikeCount + 1);

        router.post(route('comments.like', comment.id), {}, { 
            preserveScroll: true, 
            preserveState: true, 
            onError: () => {
                setLocalIsLiked(previousLiked);
                setLocalLikeCount(previousCount);
            }
        });
    };

    // ==========================================
    // 3. Accessibility & UI State
    // ==========================================
    
    const isBeingReplied = replyingTo?.id === comment.id;
    const isBeingEdited = editingComment?.id === comment.id;

    return (
        <div className={`mt-3 ${level > 0 ? 'ml-6 border-l-2 border-indigo-100 pl-4' : ''}`}>
            
            {/* Main Comment Card */}
            <div 
                className={`group relative p-3 rounded-xl transition-all duration-500 ${
                    isHighlighted ? 'bg-amber-50 border-2 border-amber-200 shadow-md scale-[1.01]' : 'hover:bg-gray-50'
                }`}
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        
                        {/* User Metadata Section */}
                        <div className="flex items-center gap-2 mb-1">
                            <Link href={route('profile.show', comment.user.id)} className="flex items-center gap-2 group/user">
                                {comment.user.avatar_url ? (
                                    <img 
                                        src={`${comment.user.avatar_url}?t=${new Date().getTime()}`} 
                                        className="h-6 w-6 rounded-full object-cover border border-gray-100 shadow-sm"
                                        alt={`โปรไฟล์ของ ${comment.user.name}`} // [Optimization] เพิ่ม Alt text
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
                                <span className="text-[10px] bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold">TARGET</span>
                            )}
                        </div>
                        
                        {/* Comment Content Area */}
                        {!isBeingEdited && (
                            <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                        )}
                        
                        {/* Interactive Toolbars */}
                        {!isBeingEdited && (
                            <div className="mt-2 flex items-center gap-4 text-[10px]">
                                <span className="text-gray-500 font-medium"> {/* [Optimization] ปรับความเข้มสีเพื่อ Contrast */}
                                    {new Date(comment.created_at).toLocaleString('th-TH')}
                                </span>
                                
                                <button 
                                    onClick={handleCommentLike} 
                                    aria-label={localIsLiked ? "เลิกถูกใจคอมเมนต์" : "ถูกใจคอมเมนต์"} // [Optimization] Accessible Name
                                    className={`flex items-center gap-1 font-bold transition-all p-1 -m-1 ${ // [Optimization] ขยาย Touch Target
                                        localIsLiked ? 'text-rose-500' : 'text-gray-500 hover:text-rose-400'
                                    }`}
                                >
                                    <svg className="w-3 h-3" fill={localIsLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                    {localLikeCount > 0 && <span>{localLikeCount}</span>}
                                </button>

                                <button 
                                    onClick={() => onReply(comment)} 
                                    className="font-bold text-gray-600 hover:text-indigo-600 transition p-1 -m-1" // [Optimization] เพิ่มพื้นที่สัมผัสและสี
                                >
                                    ตอบกลับ
                                </button>
                                
                                {comment.user_id === auth.user.id && (
                                    <button 
                                        onClick={() => onEdit(comment)} 
                                        className="font-bold text-gray-600 hover:text-amber-600 transition p-1 -m-1"
                                    >
                                        แก้ไข
                                    </button>
                                )}

                                {hasReplies && (
                                    <button 
                                        onClick={() => setIsExpanded(!isExpanded)} 
                                        aria-expanded={isExpanded}
                                        className="font-bold text-indigo-600 hover:text-indigo-700 transition p-1 -m-1"
                                    >
                                        {isExpanded ? '🔼 ซ่อน' : `🔽 ดูการตอบกลับ (${comment.replies.length})`}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Options Dropdown */}
                    {comment.user_id === auth.user.id && !isBeingEdited && (
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button 
                                    aria-label="จัดการตัวเลือกคอมเมนต์" // [Optimization] เพิ่ม Accessible Name
                                    className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition p-2 -m-2"
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <button 
                                    onClick={() => onDelete(comment.id)} 
                                    className="block w-full px-4 py-2 text-left text-xs hover:bg-gray-50 text-red-600 font-bold"
                                >
                                    ลบข้อมูล
                                </button>
                            </Dropdown.Content>
                        </Dropdown>
                    )}
                </div>

                {/* Inline Interaction Form */}
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
                            
                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={onCancel} 
                                    className="text-[10px] font-bold text-gray-500 hover:text-gray-700 px-3 py-2"
                                    aria-label="ยกเลิกการกระทำ"
                                >
                                    ยกเลิก
                                </button>
                                <button 
                                    disabled={commentProcessing || !commentForm.content.trim()} 
                                    className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
                                >
                                    {isBeingEdited ? 'บันทึกแก้ไข' : 'ส่งคำตอบ'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Recursive Sub-comments Rendering */}
            {isExpanded && hasReplies && (
                <div className="mt-1 space-y-1" role="group" aria-label="การตอบกลับ">
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
