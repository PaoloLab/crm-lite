-- CreateTable
CREATE TABLE "roles" (
    "roleId" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "users" (
    "userId" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "companies" (
    "companyId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "piva" TEXT NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE "contacts" (
    "contactId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "companyId" INTEGER,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("contactId")
);

-- CreateTable
CREATE TABLE "deal_states" (
    "dealStateId" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "deal_states_pkey" PRIMARY KEY ("dealStateId")
);

-- CreateTable
CREATE TABLE "deals" (
    "dealId" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateLastModified" TIMESTAMP(3) NOT NULL,
    "dealStateId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "contactId" INTEGER NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("dealId")
);

-- CreateTable
CREATE TABLE "activity_types" (
    "activityTypeId" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "activity_types_pkey" PRIMARY KEY ("activityTypeId")
);

-- CreateTable
CREATE TABLE "activities" (
    "activityId" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dealId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "activityTypeId" INTEGER NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("activityId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "companies_piva_key" ON "companies"("piva");

-- CreateIndex
CREATE UNIQUE INDEX "deal_states_code_key" ON "deal_states"("code");

-- CreateIndex
CREATE UNIQUE INDEX "deal_states_slug_key" ON "deal_states"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "activity_types_code_key" ON "activity_types"("code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("roleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("companyId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_dealStateId_fkey" FOREIGN KEY ("dealStateId") REFERENCES "deal_states"("dealStateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("contactId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("dealId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_activityTypeId_fkey" FOREIGN KEY ("activityTypeId") REFERENCES "activity_types"("activityTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;
