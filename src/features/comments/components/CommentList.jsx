import CommentCard from "./CommentCard";
import styles from "./CommentList.module.css";

function CommentList({ items = [], onEdit, onDelete, canModify, lastItemRef }) {
  return (
    <section className={styles.list}>
      {items.map((comment, idx) => (
        <CommentCard
          key={comment.comment_id}
          {...comment}
          menuItems={
            canModify?.(comment)
              ? [
                  { label: "수정", click: () => onEdit?.(comment) },
                  { label: "삭제", click: () => onDelete?.(comment) },
                ]
              : []
          }
          ref={idx === items.length - 1 ? lastItemRef : undefined}
        />
      ))}
    </section>
  );
}

export default CommentList;
