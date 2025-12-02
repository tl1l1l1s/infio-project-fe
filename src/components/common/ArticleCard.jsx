import Theme from "./Theme";
import formatDate from "../../utils/formatDate";
import eyeIcon from "../../../public/assets/images/eye.svg";
import heartIcon from "../../../public/assets/images/heart.svg";
import messageIcon from "../../../public/assets/images/message-square.svg";
import styles from "./ArticleCard.module.css";
import { Link } from "react-router-dom";

function ArticleCard({ article_id, title, writtenBy, createdAt, viewCount, likeCount, commentCount, theme }) {
  return (
    <Link className={styles.articleCard} to={`/articles/${article_id}`}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{title}</h2>
        <Theme theme={theme} />
      </div>

      <div className={styles.cardMeta}>
        <div className={styles.cardAuthor}>
          <span className={styles.avatar}></span>
          <span className={styles.name}>{writtenBy?.nickname}</span>

          <time className={styles.cardTime} dateTime={createdAt}>
            {formatDate(createdAt)}
          </time>
        </div>

        <div className={styles.cardStats}>
          <span className={styles.cardStatItem}>
            <img className={styles.cardStatIcon} src={heartIcon} />
            {likeCount}
          </span>
          <span className={styles.cardStatItem}>
            <img className={styles.cardStatIcon} src={messageIcon} />
            {commentCount}
          </span>
          <span className={styles.cardStatItem}>
            <img className={styles.cardStatIcon} src={eyeIcon} />
            {viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ArticleCard;
