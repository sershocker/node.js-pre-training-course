#!/usr/bin/env ts-node
// CLI entry for Task 10 – placeholder only

import { ToDoManager } from "./todo-manager";

async function main() {
  const manager = new ToDoManager();
  await manager.init();

  const [, , command, arg1, arg2] = process.argv;

  switch (command) {
    case "add":
      if (!arg1) {
        console.error("ERROR: You need to write at least one argument (title: string) for add");
      }
      await manager.add(arg1, arg2);
      break;

    case "complete":
      if (!arg1) {
        console.error("ERROR: You need to write at least one argument (id: number) for complete");
      }
      await manager.complete(Number(arg1));
      break;

    case "list":
      console.log(await manager.list());
      break;

    case "help":
      console.log("add <title> <?description> \n complete <id> \n list");
      break;

    default:
      console.log('Incorrect input. Use "-help" to get list of commands');
  }
}

main().catch((error) => console.error("ERROR", error));
//console.log('CLI not implemented yet');
