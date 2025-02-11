-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SupplementaryMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chatMessageId" INTEGER NOT NULL,
    "clientSideId" TEXT NOT NULL,
    "rangeStart" INTEGER NOT NULL,
    "rangeEnd" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupplementaryMessage_chatMessageId_fkey" FOREIGN KEY ("chatMessageId") REFERENCES "ChatMessage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SupplementaryMessage" ("chatMessageId", "clientSideId", "createdAt", "id", "rangeEnd", "rangeStart", "updatedAt") SELECT "chatMessageId", "clientSideId", "createdAt", "id", "rangeEnd", "rangeStart", "updatedAt" FROM "SupplementaryMessage";
DROP TABLE "SupplementaryMessage";
ALTER TABLE "new_SupplementaryMessage" RENAME TO "SupplementaryMessage";
CREATE TABLE "new_SupplementaryMessageItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "supplementaryMessageId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "cost" DECIMAL NOT NULL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupplementaryMessageItem_supplementaryMessageId_fkey" FOREIGN KEY ("supplementaryMessageId") REFERENCES "SupplementaryMessage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SupplementaryMessageItem" ("content", "cost", "createdAt", "id", "model", "role", "supplementaryMessageId", "timestamp", "updatedAt") SELECT "content", "cost", "createdAt", "id", "model", "role", "supplementaryMessageId", "timestamp", "updatedAt" FROM "SupplementaryMessageItem";
DROP TABLE "SupplementaryMessageItem";
ALTER TABLE "new_SupplementaryMessageItem" RENAME TO "SupplementaryMessageItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
