import { useState, useEffect } from 'react'; // ✨ อย่าลืม import useEffect นะคะ!
import { Link } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

export default function CommentItem({ comment, auth, onReply, onEdit, onDelete, level = 0, highlightId = null }) {
    
    // ✨ ฟังก์ชันเช็คว่าคอมเมนต์นี้ หรือลูกๆ ของมัน มีตัวที่ถูกไฮไลท์ซ่อนอยู่ไหม
    const checkIsTargetOrHasTarget = (item, targetId) => {
        if (!targetId) return false;
        if (item.id === targetId) return true;
        if (item.replies && item.replies.length > 0) {
            return item.replies.some(reply => checkIsTargetOrHasTarget(reply, targetId));
        }
        return false;
    };

    // ✨ ตรวจสอบว่าเป็นคอมเมนต์ที่ต้องการไฮไลท์หรือไม่
    const isHighlighted = highlightId === comment.id;
    
    // ✨ เช็คว่าควรจะกางออกไหม (กางถ้าตัวเองหรือลูกหลานถูกไฮไลท์)
    const shouldBeExpanded = checkIsTargetOrHasTarget(comment, highlightId);
    const [isExpanded, setIsExpanded] = useState(shouldBeExpanded); 

    // ✨ อัปเดตสถานะการกางอัตโนมัติเมื่อเป้าหมาย (highlightId) เปลี่ยนแปลง
    useEffect(() => {
        if (shouldBeExpanded) {
            setIsExpanded(true);
        }
    }, [highlightId, shouldBeExpanded]);

    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
        <div className={`mt-3 ${level > 0 ? 'ml-6 border-l-2 border-indigo-100 pl-4' : ''}`}>
            {/* ส่วนแสดงผลตัวคอมเมนต์ พร้อมเอฟเฟกต์ไฮไลท์สีทองถ้า ID ตรงกัน */}
            <div className={`group relative p-3 rounded-xl transition-all duration-500 ${
                isHighlighted ? 'bg-amber-50 border-2 border-amber-200 shadow-md scale-[1.01]' : 'hover:bg-gray-50'
            }`}>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Link href={route('profile.show', comment.user.id)} className="font-bold text-indigo-600 hover:underline text-sm">
                                {comment.user.name}
                            </Link>
                            {comment.parent && <span className="text-[10px] text-indigo-400 font-medium">↪ @{comment.parent.user.name}</span>}
                            {isHighlighted && <span className="text-[10px] bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold">TARGET</span>}
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                        <div className="mt-2 flex items-center gap-4 text-[10px]">
                            <span className="text-gray-400">{new Date(comment.created_at).toLocaleString('th-TH')}</span>
                            <button onClick={() => onReply(comment)} className="font-bold text-gray-500 hover:text-indigo-600 transition">ตอบกลับ</button>
                            {hasReplies && (
                                <button onClick={() => setIsExpanded(!isExpanded)} className="font-bold text-indigo-500 hover:text-indigo-700 transition">
                                    {isExpanded ? '🔼 ซ่อน' : `🔽 ดูการตอบกลับ (${comment.replies.length})`}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* เมนูจัดการ (เฉพาะเจ้าของ) */}
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

            {/* ✨ การแสดงผลแบบ Recursion สำหรับการตอบกลับหลายชั้น */}
            {isExpanded && hasReplies && (
                <div className="mt-1 space-y-1">
                    {comment.replies.map(reply => (
                        <CommentItem 
                            key={reply.id} 
                            comment={reply} 
                            auth={auth} 
                            onReply={onReply} 
                            onEdit={onEdit} 
                            onDelete={onDelete}
                            level={level + 1} 
                            highlightId={highlightId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}