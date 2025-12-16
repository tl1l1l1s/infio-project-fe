import { useState } from "react";
import { usePageRouter } from "../hooks/usePageRouter";
import Button from "../components/common/Button";
import ArticleCard from "../components/common/ArticleCard";
import Modal from "../components/common/Modal";
import styles from "./My.module.css";
import logoutIcon from "/assets/images/log-out.svg";
import settingsIcon from "/assets/images/settings.svg";
import { useFetchUser } from "../features/users/hooks";
import { useLogout } from "../features/auth/hooks";
import { useFetchThemes } from "../features/articles/hooks";
import { FALLBACK_THEME_OPTIONS } from "../constants/themes";
import formatDate from "../utils/formatDate";
import { resolveImageUrl } from "../utils/image";

// 내가 쓴 글 mock data
const myArticles = [
  {
    id: 1,
    title: "내가 쓴 글1",
    theme: "NONE",
    writtenBy: {
      nickname: "유저",
    },
    createdAt: "2021-01-01 00:00:00",
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
  },
  {
    id: 2,
    title: "내가 쓴 글2",
    theme: "NONE",
    writtenBy: {
      nickname: "유저",
    },
    createdAt: "2021-01-01 00:00:00",
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
  },
];

// 북마크한 글 mock data
const bookmarkedArticles = [
  {
    id: 1,
    title: "북마크 한 글 1",
    theme: "NONE",
    writtenBy: {
      nickname: "유저",
    },
    createdAt: "2021-01-01 00:00:00",
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
  },
  {
    id: 2,
    title: "북마크 한 글2",
    theme: "NONE",
    writtenBy: {
      nickname: "유저",
    },
    createdAt: "2021-01-01 00:00:00",
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
  },
];

function My() {
  const { data: myData } = useFetchUser();
  const { themes } = useFetchThemes();
  const profile = myData?.result || {};
  const { goToMyChange, goToHome } = usePageRouter();
  const { mutate: logout } = useLogout();
  const [isLogoutOpen, setLogoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("written");
  const themeMap = new Map((themes?.length ? themes : FALLBACK_THEME_OPTIONS).map((t) => [t.key, t.label]));

  const handleLogout = () =>
    logout(undefined, {
      onSuccess: () => goToHome(),
      onSettled: () => setLogoutOpen(false),
    });

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.profileRow}>
          <div className={styles.profile}>
            <div className={styles.avatar}>
              {profile.profile_image && <img src={resolveImageUrl(profile.profile_image)} />}
            </div>
            <h3>{profile.nickname}</h3>
            <p>가입일: {formatDate(profile.createdAt)}</p>
          </div>
          <div className={styles.profileActions}>
            <Button variant="icon" onClick={() => setLogoutOpen(true)}>
              <img src={logoutIcon} />
            </Button>
            <Button variant="icon" onClick={goToMyChange}>
              <img src={settingsIcon} />
            </Button>
          </div>
        </div>

        <div className={styles.articles}>
          <div className={styles.tabs}>
            <Button
              variant="tertiary"
              className={`${styles.tab} ${activeTab === "written" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("written")}
            >
              작성한 게시글
            </Button>
            <Button
              variant="tertiary"
              className={`${styles.tab} ${activeTab === "bookmarked" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("bookmarked")}
            >
              북마크한 게시글
            </Button>
          </div>

          <div className={styles.list}>
            {(activeTab === "written" ? myArticles : bookmarkedArticles).map((item) => (
              <ArticleCard key={item.id} className={styles.myArticle} {...item} themeMap={themeMap} />
            ))}
          </div>
        </div>
      </div>
      {isLogoutOpen && (
        <Modal
          title="로그아웃 하시겠습니까?"
          message=""
          onConfirm={handleLogout}
          onCancel={() => setLogoutOpen(false)}
        />
      )}
    </div>
  );
}

export default My;
