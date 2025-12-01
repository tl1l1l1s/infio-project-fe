import { useMemo } from "react";
import { usePageRouter } from "../hooks/usePageRouter";
import ArticleCard from "../components/common/ArticleCard";
import Button from "../components/common/Button";
import { useFetchArticles } from "../features/articles/hooks";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import styles from "./Home.module.css";
import trendingIcon from "../../public/assets/images/trending.svg";
import plusIcon from "../../public/assets/images/plus.svg";

// trending 임시 mock data
const trending = [
  {
    id: 3,
    title: "인기 글",
    theme: "Lorem",
    writtenBy: {
      nickname: "작성자",
    },
    createdAt: "2021-01-03 09:30",
    viewCount: 10,
    likeCount: 5,
    commentCount: 1,
  },
  {
    id: 4,
    title: "Hot Topic",
    theme: "None",
    writtenBy: {
      nickname: "작성자",
    },
    createdAt: "2021-01-04 14:10",
    viewCount: 8,
    likeCount: 2,
    commentCount: 4,
  },
  {
    id: 5,
    title: "Hot Topic",
    theme: "None",
    writtenBy: {
      nickname: "작성자",
    },
    createdAt: "2021-01-04 14:10",
    viewCount: 8,
    likeCount: 2,
    commentCount: 4,
  },
];

function Home() {
  const { goToArticleWrite } = usePageRouter();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFetchArticles({ page: 1 });

  const articles = useMemo(
    () => data?.pages?.flatMap((page) => (page?.result?.articles ? page.result.articles : [])) ?? [],
    [data]
  );

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
            <ArticleCard key={item.article_id} {...item} />
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
            <ArticleCard key={item.id} {...item} />
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
