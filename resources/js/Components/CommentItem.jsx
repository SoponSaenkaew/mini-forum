import { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react'; // ✨ ต้องมี router นะคะ
import Dropdown from '@/Components/Dropdown';

export default function CommentItem({ comment, auth, onReply, onEdit, onDelete, level = 0, highlightId = null }) {
    
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

    // ✨ สถานะการกดไลก์คอมเมนต์
    const isLiked = comment.likes?.some(like => like.user_id === auth.user.id);
    const likeCount = comment.likes?.length || 0;

    return (
        <div className={`mt-3 ${level > 0 ? 'ml-6 border-l-2 border-indigo-100 pl-4' : ''}`}>
            <div className={`group relative p-3 rounded-xl transition-all duration-500 ${isHighlighted ? 'bg-amber-50 border-2 border-amber-200 shadow-md scale-[1.01]' : 'hover:bg-gray-50'}`}>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Link href={route('profile.show', comment.user.id)} className="font-bold text-indigo-600 hover:underline text-sm">{comment.user.name}</Link>
                            {comment.parent && <span className="text-[10px] text-indigo-400 font-medium">↪ @{comment.parent.user.name}</span>}
                            {isHighlighted && <span className="text-[10px] bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold">TARGET</span>}
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                        
                        <div className="mt-2 flex items-center gap-4 text-[10px]">
                            <span className="text-gray-400">{new Date(comment.created_at).toLocaleString('th-TH')}</span>
                            
                            {/* ✨ ปุ่มไลก์คอมเมนต์จิ๋วๆ */}
                            <button 
                                onClick={() => router.post(route('comments.like', comment.id), {}, { preserveScroll: true })} 
                                className={`flex items-center gap-1 font-bold transition-all ${isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'}`}
                            >
                                <svg className="w-3 h-3" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                </svg>
                                {likeCount > 0 && <span>{likeCount}</span>}
                            </button>

                            <button onClick={() => onReply(comment)} className="font-bold text-gray-500 hover:text-indigo-600 transition">ตอบกลับ</button>
                            {hasReplies && (
                                <button onClick={() => setIsExpanded(!isExpanded)} className="font-bold text-indigo-500 hover:text-indigo-700 transition">
                                    {isExpanded ? '🔼 ซ่อน' : `🔽 ดูการตอบกลับ (${comment.replies.length})`}
                                </button>
                            )}
                        </div>
                    </div>

                    {comment.user_id === auth.user.id && (
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <button onClick={() => onEdit(comment)} className="block w-full px-4 py-2 text-left text-xs hover:bg-gray-50 text-gray-700">แก้ไข</button>
                                <button onClick={() => onDelete(comment.id)} className="block w-full px-4 py-2 text-left text-xs hover:bg-gray-50 text-red-500 font-bold">ลบ</button>
                            </Dropdown.Content>
                        </Dropdown>
                    )}
                </div>
            </div>

            {isExpanded && hasReplies && (
                <div className="mt-1 space-y-1">
                    {comment.replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply} auth={auth} onReply={onReply} onEdit={onEdit} onDelete={onDelete} level={level + 1} highlightId={highlightId} />
                    ))}
                </div>
            )}
        </div>
    );
}