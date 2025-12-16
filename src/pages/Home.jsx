import { useMemo } from "react";
import { usePageRouter } from "../hooks/usePageRouter";
import ArticleCard from "../components/common/ArticleCard";
import Button from "../components/common/Button";
import { useFetchArticles, useFetchThemes } from "../features/articles/hooks";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { FALLBACK_THEME_OPTIONS } from "../constants/themes";
import styles from "./Home.module.css";
import trendingIcon from "/assets/images/trending.svg";
import plusIcon from "/assets/images/plus.svg";

// trending 임시 mock data
const trending = [
  {
    id: 999,
    title: "한정판 스티커 받았습니다 ㅎㅎ",
    theme: "NONE",
    writtenBy: {
      nickname: "레어닉",
    },
    createdAt: "2025-11-30 09:30",
    viewCount: 15,
    likeCount: 2,
    commentCount: 0,
  },
  {
    id: 998,
    title: "유저 추천해요",
    theme: "NONE",
    writtenBy: {
      nickname: "추천",
      profile_image: "/uploads/articles/landscape.jpg",
    },
    createdAt: "2025-12-04 12:10",
    viewCount: 13,
    likeCount: 2,
    commentCount: 2,
  },
  {
    id: 997,
    title: "인텔리제이 테마 추천",
    theme: "NONE",
    writtenBy: {
      nickname: "정복",
    },
    createdAt: "2025-12-05 14:10",
    viewCount: 12,
    likeCount: 2,
    commentCount: 2,
  },
];

function Home() {
  const { goToArticleWrite } = usePageRouter();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFetchArticles();
  const { themes } = useFetchThemes();

  const articles = useMemo(
    () => data?.pages?.flatMap((page) => (page?.result?.articles ? page.result.articles : [])) ?? [],
    [data]
  );

  const themeMap = useMemo(() => {
    const source = themes?.length ? themes : FALLBACK_THEME_OPTIONS;
    return new Map(source.map((t) => [t.key, t.label]));
  }, [themes]);

  const loadMoreRef = useIntersectionObserver(
    () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    { threshold: 1.0 }
  );

  return (
    <div className={styles.wrapper}>
      <main className={styles.container}>
        <section className={styles.articleList}>
          {articles.map((item) => (
            <ArticleCard key={item.article_id} {...item} themeMap={themeMap} />
          ))}
          {hasNextPage && <div ref={loadMoreRef}>Loading...</div>}
          {isFetchingNextPage && <div>Loading...</div>}
        </section>

        <section className={styles.trendingList}>
          <div className={styles.trendingTitle}>
            <img src={trendingIcon} />
            <h3>인기 게시글</h3>
          </div>
          {trending.map((item) => (
            <ArticleCard key={item.id} {...item} themeMap={themeMap} />
          ))}
        </section>
      </main>

      <Button variant="primary" className={styles.writeButton} onClick={goToArticleWrite}>
        <img src={plusIcon} />
        <span>글쓰기</span>
      </Button>
    </div>
  );
}

export default Home;
