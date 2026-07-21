-- CreateTable
CREATE TABLE "CourseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseCategory_name_key" ON "CourseCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCategory_slug_key" ON "CourseCategory"("slug");


-- Backfill: seed the category names already in use by existing courses so the
-- new admin picker isn't empty and existing courses keep matching by name.
INSERT INTO "CourseCategory" ("id", "name", "slug", "createdAt")
SELECT gen_random_uuid()::text, c.category,
  lower(regexp_replace(regexp_replace(c.category, '[^a-zA-Z0-9\s-]', '', 'g'), '[\s_]+', '-', 'g')),
  CURRENT_TIMESTAMP
FROM (SELECT DISTINCT category FROM "Course") c
ON CONFLICT ("name") DO NOTHING;
