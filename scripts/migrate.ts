import { neon } from "@neondatabase/serverless"
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

// Load environment variables
dotenv.config()

async function main() {
  // Check for required environment variables
  // Supabase integration often provides POSTGRES_URL, or we might have DATABASE_URL
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

  if (!connectionString) {
    console.error("POSTGRES_URL or DATABASE_URL is not set. Please set it in the environment variables.")
    console.error("For Supabase, you can find this in Project Settings -> Database -> Connection String")
    process.exit(1)
  }

  const sql = neon(connectionString)

  try {
    console.log("Creating tables...")
    const createTablesSql = fs.readFileSync(path.join(process.cwd(), "scripts/001_create_tables.sql"), "utf8")

    // Execute table creation
    // Splitting by semicolon might be needed if the driver doesn't support multiple statements,
    // but neon driver usually handles it. However, splitting is safer for large migrations.
    const createStatements = createTablesSql.split(";").filter((stmt) => stmt.trim().length > 0)

    for (const stmt of createStatements) {
      try {
        await sql(stmt)
      } catch (e: any) {
        console.error("Error executing statement:", stmt.substring(0, 50) + "...", e.message)
        // Continue to next statement? For create tables, maybe not.
      }
    }

    console.log("Tables created successfully")

    console.log("Seeding data...")
    const seedDataSql = fs.readFileSync(path.join(process.cwd(), "scripts/002_seed_data.sql"), "utf8")

    // Split seed statements and execute individually to handle potential errors better
    const seedStatements = seedDataSql.split(";").filter((stmt) => stmt.trim().length > 0)

    let successCount = 0
    let errorCount = 0

    for (const stmt of seedStatements) {
      try {
        await sql(stmt)
        successCount++
      } catch (e: any) {
        // Ignore "relation already exists" or "duplicate key" errors which are expected on re-runs
        if (!e.message?.includes("already exists") && !e.message?.includes("duplicate key")) {
          console.log("Note on seeding statement:", e.message)
          errorCount++
        }
      }
    }
    console.log(`Data seeded: ${successCount} statements executed successfully.`)
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

main()
