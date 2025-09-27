import prisma from "../src/db/prisma.js";

async function main() {
  const jobDescription = `
  Product Engineer (Backend) 2025
  - Build backend services with Node.js/Django/Rails
  - Experience with databases, APIs, cloud
  - Familiarity with LLMs, prompt design, RAG
  - Handle async jobs, retries, error handling
  `;

  const rubric = `
  Scoring Rubric:
  CV Match Rate: Skills, experience, achievements, cultural fit (1-5)
  Project Deliverable:
  - Correctness (30%)
  - Code Quality (25%)
  - Resilience (20%)
  - Documentation (15%)
  - Creativity (10%)
  `;

  await prisma.$executeRaw`DELETE FROM "JobData"`;

  await prisma.jobData.createMany({
    data: [
      { type: "job", content: jobDescription },
      { type: "rubric", content: rubric },
    ],
  });

  console.log("✅ Seed data inserted!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
