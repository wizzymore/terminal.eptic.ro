import "./style.css";
import { $ } from "./globals";
import "./commands/init";
import { commands, loadCommands, writeLine } from "./commands/init";

const commandInput = $<HTMLInputElement>("#command-input");

class CommandsHistory {
  private history: string[] = [];
  private index: number = 0;
  public lastCommand: string = "test";

  getHistory(): string[] {
    return this.history.concat();
  }

  getIndex(): string {
    return this.history[this.index] || this.lastCommand;
  }

  moveUp(): void {
    if (this.index > 0) {
      this.index--;
    }
  }

  moveDown(): void {
    if (this.index < this.history.length) {
      this.index++;
    }
  }

  addToHistory(command: string): void {
    this.history.push(command);
  }

  resetIndex(): void {
    this.index = this.history.length;
  }
}

const commandsHistory = new CommandsHistory();

let isUsingHistory = false;

const handleCommandInput = function (e: KeyboardEvent) {
  let index: string;

  switch (e.key) {
    case "Enter":
      isUsingHistory = false;
      const input = commandInput.value.trim();

      if (!input) {
        return;
      }

      commandsHistory.addToHistory(input);

      if (commands.has(input)) {
        commands.get(input)!();
      } else {
        writeLine(
          `Command not found '${input}'. For a list of commands type <span class="command">'help'</span>.`,
          "command-not-found"
        );
      }
      break;
    case "ArrowUp":
      e.preventDefault();
      if (!isUsingHistory) {
        commandsHistory.lastCommand = commandInput.value;
        commandsHistory.resetIndex();
        isUsingHistory = true;
      }
      commandsHistory.moveUp();
      index = commandsHistory.getIndex();
      if (index) {
        commandInput.value = index;
      }
      break;
    case "ArrowDown":
      e.preventDefault();
      if (!isUsingHistory) {
        commandsHistory.lastCommand = commandInput.value;
        commandsHistory.resetIndex();
        isUsingHistory = true;
      }
      commandsHistory.moveDown();
      index = commandsHistory.getIndex();
      if (index) {
        commandInput.value = index;
      }
      break;
    default:
      isUsingHistory = false;
  }
};

const bootstrap = async () => {
  await loadCommands();

  commandInput.addEventListener("keydown", handleCommandInput);

  window.addEventListener("click", function () {
    commandInput.focus();
  });

  let mutationTimeout: number | null;
  const mutation = new MutationObserver(() => {
    $<HTMLDivElement>("#line").hidden = true;
    if (mutationTimeout) {
      clearTimeout(mutationTimeout);
      $<HTMLDivElement>("#line").hidden = false;
      commandInput.focus();
      $<HTMLDivElement>("#line").hidden = true;
    }
    mutationTimeout = setTimeout(() => {
      $<HTMLDivElement>("#line").hidden = false;
      commandInput.value = "";
      commandInput.focus();
    }, 200);
  });

  mutation.observe($("#terminal"), {
    childList: true,
  });

  // Show the initial Header Banner
  if ("banner" in commands) {
    commands.get("banner")!();
  }

  $("#app").classList.remove("loading");
  $("#loader").remove();
};

window.onload = bootstrap;
