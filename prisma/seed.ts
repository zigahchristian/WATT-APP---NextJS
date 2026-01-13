"use server";
import  prisma  from "../lib/prisma";

import data from "./students.seed.json";


console.log("Starting .....",Date.now());

async function main() {
  try {
    for (const student of data.students) {
  await prisma.student.create({ data: student });
}
    console.log("success", Date.now());
  } catch (error) {
    console.log("Erro seeding the database categories", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();