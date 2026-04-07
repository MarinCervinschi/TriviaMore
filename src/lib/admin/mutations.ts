import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { useMutationWithToast } from "@/hooks/useMutationWithToast"

import {
  addClassToCourseFn,
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
  removeClassFromCourseFn,
  removeCourseMaintainerFn,
  removeDepartmentAdminFn,
  removeSectionAccessFn,
  deleteUserFn,
  updateClassFn,
  updateCourseClassFn,
  updateCourseFn,
  updateDepartmentFn,
  updateQuestionFn,
  updateSectionFn,
  updateUserRoleFn,
} from "./server"

// ─── Departments ───

export function useCreateDepartment(onSuccess?: () => void) {
  return useMutationWithToast(createDepartmentFn, {
    successMessage: "Dipartimento creato con successo",
    invalidateKeys: [["admin", "departments"], ["admin", "stats"], ["browse"]],
    onSuccess,
  })
}

export function useUpdateDepartment(onSuccess?: () => void) {
  return useMutationWithToast(updateDepartmentFn, {
    successMessage: "Dipartimento aggiornato con successo",
    invalidateKeys: [["admin", "departments"], ["admin", "department"], ["browse"]],
    onSuccess,
  })
}

export function useDeleteDepartment(onSuccess?: () => void) {
  return useMutationWithToast(deleteDepartmentFn, {
    successMessage: "Dipartimento eliminato con successo",
    invalidateKeys: [["admin", "departments"], ["admin", "stats"], ["browse"]],
    onSuccess,
  })
}

// ─── Courses ───

export function useCreateCourse(onSuccess?: () => void) {
  return useMutationWithToast(createCourseFn, {
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
  return useMutationWithToast(updateCourseFn, {
    successMessage: "Corso aggiornato con successo",
    invalidateKeys: [["admin", "department"], ["admin", "course"], ["browse"]],
    onSuccess,
  })
}

export function useDeleteCourse(onSuccess?: () => void) {
  return useMutationWithToast(deleteCourseFn, {
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
  return useMutationWithToast(createClassFn, {
    successMessage: "Classe creata con successo",
    invalidateKeys: [["admin", "course"], ["admin", "stats"], ["browse"]],
    onSuccess,
  })
}

export function useUpdateClass(onSuccess?: () => void) {
  return useMutationWithToast(updateClassFn, {
    successMessage: "Classe aggiornata con successo",
    invalidateKeys: [["admin", "course"], ["admin", "class"], ["browse"]],
    onSuccess,
  })
}

export function useDeleteClass(onSuccess?: () => void) {
  return useMutationWithToast(deleteClassFn, {
    successMessage: "Classe eliminata con successo",
    invalidateKeys: [["admin", "course"], ["admin", "stats"], ["browse"]],
    onSuccess,
  })
}

// ─── Course-Class Junction ───

export function useAddClassToCourse(onSuccess?: () => void) {
  return useMutationWithToast(addClassToCourseFn, {
    successMessage: "Classe collegata al corso",
    invalidateKeys: [["admin", "course"], ["admin", "class"], ["browse"]],
    onSuccess,
  })
}

export function useRemoveClassFromCourse(onSuccess?: () => void) {
  return useMutationWithToast(removeClassFromCourseFn, {
    successMessage: "Classe scollegata dal corso",
    invalidateKeys: [["admin", "course"], ["admin", "class"], ["browse"]],
    onSuccess,
  })
}

export function useUpdateCourseClass(onSuccess?: () => void) {
  return useMutationWithToast(updateCourseClassFn, {
    successMessage: "Collegamento aggiornato",
    invalidateKeys: [["admin", "course"], ["admin", "class"], ["browse"]],
    onSuccess,
  })
}

// ─── Sections ───

export function useCreateSection(onSuccess?: () => void) {
  return useMutationWithToast(createSectionFn, {
    successMessage: "Sezione creata con successo",
    invalidateKeys: [["admin", "class"], ["admin", "stats"], ["admin", "privateSections"], ["browse"]],
    onSuccess,
  })
}

export function useUpdateSection(onSuccess?: () => void) {
  return useMutationWithToast(updateSectionFn, {
    successMessage: "Sezione aggiornata con successo",
    invalidateKeys: [["admin", "class"], ["admin", "section"], ["admin", "privateSections"], ["browse"]],
    onSuccess,
  })
}

export function useDeleteSection(onSuccess?: () => void) {
  return useMutationWithToast(deleteSectionFn, {
    successMessage: "Sezione eliminata con successo",
    invalidateKeys: [["admin", "class"], ["admin", "stats"], ["admin", "privateSections"], ["browse"]],
    onSuccess,
  })
}

// ─── Questions ───

export function useCreateQuestion(onSuccess?: () => void) {
  return useMutationWithToast(createQuestionFn, {
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
  return useMutationWithToast(updateQuestionFn, {
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
  return useMutationWithToast(deleteQuestionFn, {
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

export function useDeleteUser(onSuccess?: () => void) {
  return useMutationWithToast(deleteUserFn, {
    successMessage: "Utente eliminato con successo",
    invalidateKeys: USER_INVALIDATE_KEYS,
    onSuccess,
  })
}

export function useUpdateUserRole(onSuccess?: () => void) {
  return useMutationWithToast(updateUserRoleFn, {
    successMessage: "Ruolo aggiornato con successo",
    invalidateKeys: USER_INVALIDATE_KEYS,
    onSuccess,
  })
}

export function useAddDepartmentAdmin(onSuccess?: () => void) {
  return useMutationWithToast(addDepartmentAdminFn, {
    successMessage: "Admin dipartimento aggiunto",
    invalidateKeys: USER_INVALIDATE_KEYS,
    onSuccess,
  })
}

export function useRemoveDepartmentAdmin(onSuccess?: () => void) {
  return useMutationWithToast(removeDepartmentAdminFn, {
    successMessage: "Admin dipartimento rimosso",
    invalidateKeys: USER_INVALIDATE_KEYS,
    onSuccess,
  })
}

export function useAddCourseMaintainer(onSuccess?: () => void) {
  return useMutationWithToast(addCourseMaintainerFn, {
    successMessage: "Maintainer corso aggiunto",
    invalidateKeys: USER_INVALIDATE_KEYS,
    onSuccess,
  })
}

export function useRemoveCourseMaintainer(onSuccess?: () => void) {
  return useMutationWithToast(removeCourseMaintainerFn, {
    successMessage: "Maintainer corso rimosso",
    invalidateKeys: USER_INVALIDATE_KEYS,
    onSuccess,
  })
}

export function useAddSectionAccess(onSuccess?: () => void) {
  return useMutationWithToast(addSectionAccessFn, {
    successMessage: "Accesso sezione concesso",
    invalidateKeys: USER_INVALIDATE_KEYS,
    onSuccess,
  })
}

export function useRemoveSectionAccess(onSuccess?: () => void) {
  return useMutationWithToast(removeSectionAccessFn, {
    successMessage: "Accesso sezione revocato",
    invalidateKeys: USER_INVALIDATE_KEYS,
    onSuccess,
  })
}
