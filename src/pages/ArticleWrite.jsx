import ArticleForm from "../features/articles/components/ArticleForm";
import { useCreateArticle, useFetchThemes } from "../features/articles/hooks";
import { usePageRouter } from "../hooks/usePageRouter";
import { FALLBACK_THEME_OPTIONS } from "../constants/themes";

function ArticleWrite() {
  const { mutate: createArticle } = useCreateArticle();
  const { goToArticleDetail, goBack } = usePageRouter();
  const { themes } = useFetchThemes();

  const handleSubmit = ({ payload, imageFile }) => {
    createArticle(
      { payload, imageFile },
      {
        onSuccess: (data) => {
          const newId = data?.result?.article_id || data?.result?.articleId || data?.article_id || data?.articleId;
          if (newId) {
            goToArticleDetail(newId);
          }
        },
      }
    );
  };

  return (
    <ArticleForm
      mode="create"
      submitLabel="작성"
      cancelLabel="취소"
      themes={themes.length > 0 ? themes : FALLBACK_THEME_OPTIONS}
      onSubmit={handleSubmit}
      onCancel={goBack}
    />
  );
}

export default ArticleWrite;
