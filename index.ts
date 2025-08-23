#!/usr/bin/env ts-node
import inquirer from "inquirer";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function executeCommand(command: string): Promise<void> {
  try {
    console.log(`\n🔄 Executing: ${command}`);
    const { stdout, stderr } = await execAsync(command);
    
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.warn(stderr);
    }
    console.log(`✅ Command completed: ${command}\n`);
  } catch (error: any) {
    console.error(`❌ Error executing command: ${command}`);
    console.error(error.message);
  }
}

async function main() {
  // choose ORM

  console.log("Welcome to ORMZ CLI 🚀");
  const orm = await inquirer.prompt([
    {
      type: "list",
      name: "orm",
      message: "Select an ORM",
      choices: ["Prisma", "Drizzle"],
    },
  ]);

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

    const nonMigrateCommands = action.action.filter((cmd: string) => cmd !== "migrate");
    for (const command of nonMigrateCommands) {
      await executeCommand(command);
    }

    // Handle migrate submenu if selected
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

    // Execute all selected commands
    for (const command of action.action) {
      await executeCommand(command);
    }
  }

  if (orm.orm.includes("Prisma")) {
    await prismaMenu();
  } else if (orm.orm.includes("Drizzle")) {
    await drizzleMenu();
  }
}

main();
