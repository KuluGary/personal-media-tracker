import { confirm, input, password } from "@inquirer/prompts";

export const prompt = {
  input: async (msg: string, defaultValue?: string) => input({ message: msg, default: defaultValue }),
  password: async (msg: string) => password({ message: msg }),
  confirm: async (msg: string) => confirm({ message: msg }),
};
