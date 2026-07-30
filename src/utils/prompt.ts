import { input, password } from "@inquirer/prompts";

export const prompt = {
  input: async (msg: string) => input({ message: msg }),
  password: async (msg: string) => password({ message: msg }),
};
