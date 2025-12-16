import { Link } from "react-router-dom";
import Theme from "./Theme";
import formatDate from "../../utils/formatDate";
import { resolveImageUrl } from "../../utils/image";
import { THEME_LABEL_MAP } from "../../constants/themes";
import eyeIcon from "/assets/images/eye.svg";
import heartIcon from "/assets/images/heart.svg";
import messageIcon from "/assets/images/message-square.svg";
import styles from "./ArticleCard.module.css";

function ArticleCard({
  article_id,
  title,
  writtenBy,
  createdAt,
  viewCount,
  likeCount,
  commentCount,
  theme = "NONE",
  themeMap,
  className = "",
}) {
  const themeKey = theme || "NONE";
  const mapLabel =
    (themeMap instanceof Map && themeMap.get(themeKey)) ||
    (themeMap && typeof themeMap === "object" ? themeMap[themeKey] : undefined);
  const fallbackLabel = THEME_LABEL_MAP[themeKey];
  const themeLabel = mapLabel || fallbackLabel || themeKey || "알 수 없음";
  return (
    <Link className={`${styles.articleCard} ${className}`} to={`/articles/${article_id}`}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{title}</h2>
        <Theme theme={themeLabel} />
      </div>

      <div className={styles.cardMeta}>
        <div className={styles.cardAuthor}>
          <span className={styles.avatar}>
            {writtenBy?.profile_image ? <img src={resolveImageUrl(writtenBy?.profile_image)} /> : null}
          </span>
          <span className={styles.name}>{writtenBy?.nickname}</span>

          <time className={styles.cardTime} dateTime={createdAt}>
            {formatDate(createdAt)}
          </time>
        </div>

        <div className={styles.cardStats}>
          <span className={styles.cardStatItem}>
            <img className={styles.cardStatIcon} src={heartIcon} />
            {likeCount ?? 0}
          </span>
          <span className={styles.cardStatItem}>
            <img className={styles.cardStatIcon} src={messageIcon} />
            {commentCount ?? 0}
          </span>
          <span className={styles.cardStatItem}>
            <img className={styles.cardStatIcon} src={eyeIcon} />
            {viewCount ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ArticleCard;
