import * as dotenv from "dotenv";
dotenv.config();

const getEnv = (name: string): string => {
  const result = process.env[name];
  if (result === undefined) {
    throw new Error(`environment variable "${name}" not defined`);
  }
  return result;
};

const getEnvAsInt = (name: string): number => {
  const value = getEnv(name);
  if (value === "0" || /^(-?[1-9][0-9]*)$/.test(value)) {
    return +value;
  } else {
    throw new Error(`environment variable "${name}" not an integer`);
  }
};

// const hoge = getEnvAsInt("HOGE");
// const fuga = getEnv("FUGA");
// export { hoge, fuga };
