import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const out = {};
for (const m of ["school","user","studentProfile","teacherProfile","classroom","classroomTeacher","project","projectMember","projectEvidence","skill","projectSkill","projectValidation","event","eventProject","badge","userBadge","certificate","notification","auditLog"]) {
  out[m] = await p[m].count();
}
console.log(JSON.stringify(out));
await p.$disconnect();
