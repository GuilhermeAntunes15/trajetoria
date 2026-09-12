"use client";

import { useActionState } from "react";
import { setClassroomMembersAction, type AdminFormState } from "@/actions/admin.actions";
import { SubmitButton } from "@/components/common/SubmitButton";
import { Checkbox } from "@/components/ui/Checkbox";
import { admin as adminCopy } from "@/lib/copy";

export type ClassroomMemberOption = {
  id: string;
  name: string;
  hint?: string | null;
};

type ClassroomMembersFormProps = {
  classroomId: string;
  students: ClassroomMemberOption[];
  teachers: ClassroomMemberOption[];
  selectedStudentIds: string[];
  selectedTeacherIds: string[];
};

const initialState: AdminFormState = {};

export function ClassroomMembersForm({
  classroomId,
  students,
  teachers,
  selectedStudentIds,
  selectedTeacherIds,
}: ClassroomMembersFormProps) {
  const [state, formAction] = useActionState(setClassroomMembersAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="classroomId" value={classroomId} />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">{adminCopy.classStudentsTitle}</legend>
        <p className="text-xs text-muted">{adminCopy.classStudentsHint}</p>
        {students.length === 0 ? (
          <p className="text-sm text-muted">Nenhum estudante cadastrado nesta escola.</p>
        ) : (
          <div className="grid gap-2 pt-1 sm:grid-cols-2">
            {students.map((student) => (
              <Checkbox
                key={student.id}
                id={`student-${student.id}`}
                name="studentIds"
                value={student.id}
                label={student.name}
                hint={student.hint ?? undefined}
                defaultChecked={selectedStudentIds.includes(student.id)}
              />
            ))}
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">{adminCopy.classTeachersTitle}</legend>
        {teachers.length === 0 ? (
          <p className="text-sm text-muted">Nenhum professor cadastrado nesta escola.</p>
        ) : (
          <div className="grid gap-2 pt-1 sm:grid-cols-2">
            {teachers.map((teacher) => (
              <Checkbox
                key={teacher.id}
                id={`teacher-${teacher.id}`}
                name="teacherIds"
                value={teacher.id}
                label={teacher.name}
                defaultChecked={selectedTeacherIds.includes(teacher.id)}
              />
            ))}
          </div>
        )}
      </fieldset>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <SubmitButton size="sm" pendingLabel="Salvando...">
        Salvar turma
      </SubmitButton>
    </form>
  );
}
