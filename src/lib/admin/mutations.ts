import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  addCourseMaintainerFn,
  addDepartmentAdminFn,
  addSectionAccessFn,
  createClassFn,
  createCourseFn,
  createDepartmentFn,
  createQuestionFn,
  createQuestionsBulkFn,
  createSectionFn,
  deleteClassFn,
  deleteCourseFn,
  deleteDepartmentFn,
  deleteQuestionFn,
  deleteSectionFn,
  removeCourseMaintainerFn,
  removeDepartmentAdminFn,
  removeSectionAccessFn,
  updateClassFn,
  updateCourseFn,
  updateDepartmentFn,
  updateQuestionFn,
  updateSectionFn,
  updateUserRoleFn,
} from "./server"

function useAdminMutation<TInput, TOutput>(
  mutationFn: (input: { data: TInput }) => Promise<TOutput>,
  options: {
    successMessage: string
    invalidateKeys: string[][]
    onSuccess?: () => void
  },
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TInput) => mutationFn({ data }),
    onSuccess: () => {
      for (const key of options.invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key })
      }
      toast.success(options.successMessage)
      options.onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// ─── Departments ───

export function useCreateDepartment(onSuccess?: () => void) {
  return useAdminMutation(createDepartmentFn, {
    successMessage: "Dipartimento creato con successo",
    invalidateKeys: [["admin", "departments"], ["admin", "stats"], ["browse"]],
    onSuccess,
  })
}

export function useUpdateDepartment(onSuccess?: () => void) {
  return useAdminMutation(updateDepartmentFn, {
    successMessage: "Dipartimento aggiornato con successo",
    invalidateKeys: [["admin", "departments"], ["admin", "department"], ["browse"]],
    onSuccess,
  })
}

export function useDeleteDepartment(onSuccess?: () => void) {
  return useAdminMutation(deleteDepartmentFn, {
    successMessage: "Dipartimento eliminato con successo",
    invalidateKeys: [["admin", "departments"], ["admin", "stats"], ["browse"]],
    onSuccess,
  })
}

// ─── Courses ───

export function useCreateCourse(onSuccess?: () => void) {
  return useAdminMutation(createCourseFn, {
    successMessage: "Corso creato con successo",
    invalidateKeys: [
      ["admin", "department"],
      ["admin", "stats"],
      ["browse"],
    ],
    onSuccess,
  })
}

export function useUpdateCourse(onSuccess?: () => void) {
  return useAdminMutation(updateCourseFn, {
    successMessage: "Corso aggiornato con successo",
    invalidateKeys: [["admin", "department"], ["admin", "course"], ["browse"]],
    onSuccess,
  })
}

export function useDeleteCourse(onSuccess?: () => void) {
  return useAdminMutation(deleteCourseFn, {
    successMessage: "Corso eliminato con successo",
    invalidateKeys: [
      ["admin", "department"],
      ["admin", "stats"],
      ["browse"],
    ],
    onSuccess,
  })
}

// ─── Classes ───

export function useCreateClass(onSuccess?: () => void) {
  return useAdminMutation(createClassFn, {
    successMessage: "Classe creata con successo",
    invalidateKeys: [["admin", "course"], ["admin", "stats"], ["browse"]],
    onSuccess,
  })
}

export function useUpdateClass(onSuccess?: () => void) {
  return useAdminMutation(updateClassFn, {
    successMessage: "Classe aggiornata con successo",
    invalidateKeys: [["admin", "course"], ["admin", "class"], ["browse"]],
    onSuccess,
  })
}

export function useDeleteClass(onSuccess?: () => void) {
  return useAdminMutation(deleteClassFn, {
    successMessage: "Classe eliminata con successo",
    invalidateKeys: [["admin", "course"], ["admin", "stats"], ["browse"]],
    onSuccess,
  })
}

// ─── Sections ───

export function useCreateSection(onSuccess?: () => void) {
  return useAdminMutation(createSectionFn, {
    successMessage: "Sezione creata con successo",
    invalidateKeys: [["admin", "class"], ["admin", "stats"], ["admin", "privateSections"], ["browse"]],
    onSuccess,
  })
}

export function useUpdateSection(onSuccess?: () => void) {
  return useAdminMutation(updateSectionFn, {
    successMessage: "Sezione aggiornata con successo",
    invalidateKeys: [["admin", "class"], ["admin", "section"], ["admin", "privateSections"], ["browse"]],
    onSuccess,
  })
}

export function useDeleteSection(onSuccess?: () => void) {
  return useAdminMutation(deleteSectionFn, {
    successMessage: "Sezione eliminata con successo",
    invalidateKeys: [["admin", "class"], ["admin", "stats"], ["admin", "privateSections"], ["browse"]],
    onSuccess,
  })
}

// ─── Questions ───

export function useCreateQuestion(onSuccess?: () => void) {
  return useAdminMutation(createQuestionFn, {
    successMessage: "Domanda creata con successo",
    invalidateKeys: [["admin", "section"], ["admin", "stats"], ["browse"]],
    onSuccess,
  })
}

export function useCreateQuestionsBulk(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      data: Parameters<typeof createQuestionsBulkFn>[0]["data"],
    ) => createQuestionsBulkFn({ data }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "section"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] })
      queryClient.invalidateQueries({ queryKey: ["browse"] })
      toast.success(`${result.length} domande create con successo`)
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateQuestion(onSuccess?: () => void) {
  return useAdminMutation(updateQuestionFn, {
    successMessage: "Domanda aggiornata con successo",
    invalidateKeys: [
      ["admin", "section"],
      ["admin", "question"],
      ["browse"],
    ],
    onSuccess,
  })
}

export function useDeleteQuestion(onSuccess?: () => void) {
  return useAdminMutation(deleteQuestionFn, {
    successMessage: "Domanda eliminata con successo",
    invalidateKeys: [["admin", "section"], ["admin", "stats"], ["browse"]],
    onSuccess,
  })
}

// ─── Users ───

const USER_INVALIDATE_KEYS = [
  ["admin", "users"],
  ["admin", "user"],
  ["admin", "userStats"],
]

export function useUpdateUserRole(onSuccess?: () => void) {
  return useAdminMutation(updateUserRoleFn, {
    successMessage: "Ruolo aggiornato con successo",
    invalidateKeys: USER_INVALIDATE_KEYS,
    onSuccess,
  })
}

export function useAddDepartmentAdmin(onSuccess?: () => void) {
  return useAdminMutation(addDepartmentAdminFn, {
    successMessage: "Admin dipartimento aggiunto",
    invalidateKeys: USER_INVALIDATE_KEYS,
    onSuccess,
  })
}

export function useRemoveDepartmentAdmin(onSuccess?: () => void) {
  return useAdminMutation(removeDepartmentAdminFn, {
    successMessage: "Admin dipartimento rimosso",
    invalidateKeys: USER_INVALIDATE_KEYS,
    onSuccess,
  })
}

export function useAddCourseMaintainer(onSuccess?: () => void) {
  return useAdminMutation(addCourseMaintainerFn, {
    successMessage: "Maintainer corso aggiunto",
    invalidateKeys: USER_INVALIDATE_KEYS,
    onSuccess,
  })
}

export function useRemoveCourseMaintainer(onSuccess?: () => void) {
  return useAdminMutation(removeCourseMaintainerFn, {
    successMessage: "Maintainer corso rimosso",
    invalidateKeys: USER_INVALIDATE_KEYS,
    onSuccess,
  })
}

export function useAddSectionAccess(onSuccess?: () => void) {
  return useAdminMutation(addSectionAccessFn, {
    successMessage: "Accesso sezione concesso",
    invalidateKeys: USER_INVALIDATE_KEYS,
    onSuccess,
  })
}

export function useRemoveSectionAccess(onSuccess?: () => void) {
  return useAdminMutation(removeSectionAccessFn, {
    successMessage: "Accesso sezione revocato",
    invalidateKeys: USER_INVALIDATE_KEYS,
    onSuccess,
  })
}
