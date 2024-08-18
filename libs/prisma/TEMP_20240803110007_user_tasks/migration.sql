-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('IDLE', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) DEFAULT '',
    "started_at" TIMESTAMPTZ,
    "finished_at" TIMESTAMPTZ CONSTRAINT CHECK ('started_at' IS NOT NULL),
    "status" "TaskStatus" NOT NULL DEFAULT 'IDLE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tasks" (
    "user_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,
    "is_author" BOOLEAN NOT NULL DEFAULT false,
    "is_assigned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_tasks_pkey" PRIMARY KEY ("user_id","task_id")
);

-- AddForeignKey
ALTER TABLE "user_tasks" ADD CONSTRAINT "user_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tasks" ADD CONSTRAINT "user_tasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
