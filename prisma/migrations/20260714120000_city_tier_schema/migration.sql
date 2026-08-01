-- Drop existing tables (id type change String -> Int requires rebuild)
DROP TABLE IF EXISTS "Favorite" CASCADE;
DROP TABLE IF EXISTS "WeatherCache" CASCADE;
DROP TABLE IF EXISTS "City" CASCADE;

CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'RU',
    "region" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "population" INTEGER,
    "tier" INTEGER NOT NULL,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WeatherCache" (
    "id" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeatherCache_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");
CREATE INDEX "City_name_idx" ON "City"("name");
CREATE INDEX "City_tier_idx" ON "City"("tier");
CREATE INDEX "City_country_idx" ON "City"("country");

CREATE UNIQUE INDEX "WeatherCache_cityId_key" ON "WeatherCache"("cityId");
CREATE INDEX "WeatherCache_expiresAt_idx" ON "WeatherCache"("expiresAt");

CREATE INDEX "Favorite_sessionId_idx" ON "Favorite"("sessionId");
CREATE UNIQUE INDEX "Favorite_sessionId_cityId_key" ON "Favorite"("sessionId", "cityId");

ALTER TABLE "WeatherCache" ADD CONSTRAINT "WeatherCache_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
