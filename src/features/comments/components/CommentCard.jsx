import { forwardRef } from "react";
import formatDate from "../../../utils/formatDate";
import ActionMenu from "../../../components/common/ActionMenu";
import styles from "./CommentCard.module.css";

const CommentCard = forwardRef(function CommentCard({ writtenBy, createdAt, content, menuItems = [] }, ref) {
  return (
    <article className={styles.card} ref={ref}>
      <div className={styles.avatar}>{writtenBy?.profile_image ? <img src={writtenBy?.profile_image} /> : null}</div>
      <div className={styles.content}>
        <div className={styles.metaRow}>
          <div className={styles.meta}>
            <span className={styles.name}>{writtenBy.nickname}</span>
            <time>{formatDate(createdAt)}</time>
          </div>
          {menuItems?.length ? <ActionMenu items={menuItems} /> : null}
        </div>
        <p className={styles.body}>{content}</p>
      </div>
    </article>
  );
});

export default CommentCard;
