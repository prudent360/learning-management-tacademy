-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DiscussionComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentId" TEXT,
    CONSTRAINT "DiscussionComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DiscussionComment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DiscussionComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DiscussionComment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DiscussionComment" ("content", "createdAt", "id", "lessonId", "userId") SELECT "content", "createdAt", "id", "lessonId", "userId" FROM "DiscussionComment";
DROP TABLE "DiscussionComment";
ALTER TABLE "new_DiscussionComment" RENAME TO "DiscussionComment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

