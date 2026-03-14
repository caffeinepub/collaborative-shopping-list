import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ShoppingItem } from "../backend.d";
import { useActor } from "./useActor";

export function useGetItems() {
  const { actor, isFetching } = useActor();
  return useQuery<ShoppingItem[]>({
    queryKey: ["items"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getItems();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
    staleTime: 3000,
  });
}

export function useAddItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      quantity,
      unit,
      category,
    }: {
      name: string;
      quantity: number | null;
      unit: string | null;
      category: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addItem(name, quantity, unit, category);
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData<ShoppingItem[]>(["items"], (old) =>
        old ? [...old, newItem] : [newItem],
      );
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useTogglePurchased() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.togglePurchased(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });
      const previous = queryClient.getQueryData<ShoppingItem[]>(["items"]);
      queryClient.setQueryData<ShoppingItem[]>(["items"], (old) =>
        old
          ? old.map((item) =>
              item.id === id ? { ...item, purchased: !item.purchased } : item,
            )
          : [],
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["items"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useDeleteItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteItem(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });
      const previous = queryClient.getQueryData<ShoppingItem[]>(["items"]);
      queryClient.setQueryData<ShoppingItem[]>(["items"], (old) =>
        old ? old.filter((item) => item.id !== id) : [],
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["items"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useClearPurchased() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.clearPurchased();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["items"] });
      const previous = queryClient.getQueryData<ShoppingItem[]>(["items"]);
      queryClient.setQueryData<ShoppingItem[]>(["items"], (old) =>
        old ? old.filter((item) => !item.purchased) : [],
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["items"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}
