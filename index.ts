#!/usr/bin/env ts-node
import inquirer from "inquirer";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import { join } from "path";

const execAsync = promisify(exec);

// Function to detect Drizzle config files
function detectDrizzleConfig(): boolean {
  const drizzleConfigFiles = [
    "drizzle.config.ts",
    "drizzle.config.js", 
    "drizzle.config.json",
    "drizzle.config.mjs"
  ];
  
  return drizzleConfigFiles.some(configFile => existsSync(configFile));
}

// Function to detect Prisma config files
function detectPrismaConfig(): boolean {
  const prismaConfigPaths = [
    join("prisma", "schema.prisma"),
    "schema.prisma",
    join("prisma", "schema.prisma.ts"),
    "schema.prisma.ts"
  ];
  
  return prismaConfigPaths.some(configPath => existsSync(configPath));
}

async function executeCommand(command: string): Promise<void> {
  try {
    console.log(`\n Executing: ${command}`);
    const { stdout, stderr } = await execAsync(command);
    
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.warn(stderr);
    }
    console.log(`Command completed: ${command}\n`);
  } catch (error: any) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
  }
}

async function main() {
  const hasDrizzleConfig = detectDrizzleConfig();
  const hasPrismaConfig = detectPrismaConfig();
  
  let selectedOrm: string;
  if (hasDrizzleConfig && !hasPrismaConfig) {
    selectedOrm = "Drizzle";
  } else if (hasPrismaConfig && !hasDrizzleConfig) {
    selectedOrm = "Prisma";
  } else {
     const orm = await inquirer.prompt([
      {
        type: "list",
        name: "orm",
        message: "Select an ORM",
        choices: ["Prisma", "Drizzle"],
      },
    ]);
    selectedOrm = orm.orm;
  }

  // Prisma Menu
  async function prismaMenu() {
    const action = await inquirer.prompt([
      {
        type: "checkbox",
        name: "action",
        message: "Select Prisma action: ",
        choices: [
          {
            name: "push",
            value: "npx prisma db push",
          },
          {
            name: "generate",
            value: "npx prisma generate",
          },
          {
            name: "pull",
            value: "npx prisma db pull",
          },
          {
            name: "validate",
            value: "npx prisma validate",
          },
          {
            name: "format",
            value: "npx prisma format",
          },
          {
            name: "studio",
            value: "npx prisma studio",
          },
          {
            name: "migrate",
            value: "migrate",
          },
        ],
      },
    ]);

    if (action.action.length === 0) {
      console.log("No action selected");
      return;
    }

    const nonMigrateCommands = action.action.filter((cmd: string) => cmd !== "migrate");
    for (const command of nonMigrateCommands) {
      await executeCommand(command);
    }

    if (action.action.includes("migrate")) {
      const migrateAction = await inquirer.prompt([
        {
          type: "list",
          name: "migrateCommand",
          message: "Select migrate action:",
          choices: [
            {
              name: "migrate dev",
              value: "npx prisma migrate dev",
            },
            {
              name: "migrate deploy",
              value: "npx prisma migrate deploy",
            },
            {
              name: "migrate reset",
              value: "npx prisma migrate reset",
            },
            {
              name: "migrate status",
              value: "npx prisma migrate status",
            },
            {
              name: "migrate diff",
              value: "npx prisma migrate diff",
            },
          ],
        },
      ]);

      await executeCommand(migrateAction.migrateCommand);
    }
  }

  // Drizzle Menu
  async function drizzleMenu(){
    const action = await inquirer.prompt([
      {
        type: "checkbox",
        name: "action",
        message: "Select Drizzle action: ",
        choices: [
            {
                name: "generate",
                value: "npx drizzle-kit generate"
            },
            {
                name: "migrate",
                value: "npx drizzle-kit migrate"
            },
            {
                name: "push",
                value: "npx drizzle-kit push"
            },
            {
                name: "pull",
                value: "npx drizzle-kit pull"
            },
            {
                name: "studio",
                value: "npx drizzle-kit studio"
            },
            {
                name: "generate",
                value: "npx drizzle-kit generate"
            },
        ]
      },
    ]);

    if (action.action.length === 0) {
      console.log("No action selected");
      return;
    }

    for (const command of action.action) {
      await executeCommand(command);
    }
  }

  if (selectedOrm.includes("Prisma")) {
    await prismaMenu();
  } else if (selectedOrm.includes("Drizzle")) {
    await drizzleMenu();
  }
}

main().catch(error => {
    console.log("\n Goodbye! 👋");
    process.exit(1);
});
