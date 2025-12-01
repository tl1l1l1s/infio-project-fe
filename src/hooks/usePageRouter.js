import { useNavigate } from "react-router-dom";

export const usePageRouter = () => {
  const navigate = useNavigate();

  return {
    goBack: () => navigate(-1),
    goToHome: () => navigate("/"),
    goToLogin: () => navigate("/login"),
    goToMyPage: () => navigate("/my"),
    goToArticleWrite: () => navigate("/articles/write"),
    goToArticleEdit: (articleId) => navigate(`/articles/${articleId}/edit`),
    goToArticleDetail: (articleId) => navigate(`/articles/${articleId}`),
    goToMyChange: () => navigate("/my/change"),
  };
};
