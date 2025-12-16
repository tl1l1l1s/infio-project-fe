import { useParams } from "react-router-dom";
import ArticleForm from "../features/articles/components/ArticleForm";
import { useFetchArticle, useUpdateArticle, useFetchThemes } from "../features/articles/hooks";
import { usePageRouter } from "../hooks/usePageRouter";
import { FALLBACK_THEME_OPTIONS } from "../constants/themes";

function ArticleEdit() {
  const { articleId } = useParams();
  const { goToArticleDetail, goBack } = usePageRouter();
  const { data: articleData, isPending } = useFetchArticle(articleId);
  const { themes, isLoading: isThemeLoading } = useFetchThemes();
  const { mutate: updateArticle } = useUpdateArticle();

  if (isPending || isThemeLoading) return <div>Loading...</div>;

  const initialValues = {
    theme: articleData?.result?.theme ?? "NONE",
    title: articleData?.result?.title ?? "",
    content: articleData?.result?.content ?? "",
    imageSrc: articleData?.result?.article_image ?? "",
  };

  const handleSubmit = ({ payload, imageFile }) => {
    updateArticle(
      { articleId, payload, imageFile },
      {
        onSuccess: () => {
          goToArticleDetail(articleId);
        },
      }
    );
  };

  return (
    <ArticleForm
      mode="edit"
      submitLabel="수정"
      cancelLabel="취소"
      initialValues={initialValues}
      themes={themes.length > 0 ? themes : FALLBACK_THEME_OPTIONS}
      onSubmit={handleSubmit}
      onCancel={goBack}
    />
  );
}

export default ArticleEdit;
