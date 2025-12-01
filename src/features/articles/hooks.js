import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { fetchArticles, fetchArticle, createArticle, updateArticle, deleteArticle } from "../../api/articles";
import { showToast } from "../../lib/toast";

export function useFetchArticles({ page }) {
  return useInfiniteQuery({
    queryKey: ["articles", { page }],
    queryFn: ({ pageParam = 1 }) => fetchArticles({ page: pageParam, size: 7 }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.currentPage + 1 : undefined;
    },
    onError: () => {
      showToast("게시글을 불러오지 못했습니다.", { type: "error" });
    },
  });
}

export function useFetchArticle(articleId) {
  return useQuery({
    queryKey: ["article", articleId],
    queryFn: () => fetchArticle(articleId),
    enabled: !!articleId,
    onError: () => {
      showToast("게시글을 불러오지 못했습니다.", { type: "error" });
    },
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, imageFile }) => createArticle(payload, imageFile),
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      showToast("게시글이 등록되었습니다.", { type: "info" });
    },
    onError: () => {
      showToast("게시글 등록에 실패했습니다. 잠시 후 다시 시도해주세요.", { type: "error" });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ articleId, payload, imageFile }) => updateArticle(articleId, payload, imageFile),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["article", variables.articleId] });
      showToast("게시글이 수정되었습니다.", { type: "info" });
    },
    onError: () => {
      showToast("게시글 수정에 실패했습니다. 잠시 후 다시 시도해주세요.", { type: "error" });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articleId) => deleteArticle(articleId),
    onSuccess: (_, articleId) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["article", articleId] });
      showToast("게시글이 삭제되었습니다.", { type: "info" });
    },
    onError: () => {
      showToast("게시글 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.", { type: "error" });
    },
  });
}
