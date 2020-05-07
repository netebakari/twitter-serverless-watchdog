import * as assert from "assert";
import * as fs from "fs";
import * as Types from "../src/types";

const loadJson = (filename: string) => {
  const buffer = fs.readFileSync(`test/fixtures/${filename}`);
  return JSON.parse(buffer.toString("utf8"));
};

describe("typeGuards", () => {
  describe("AssertsConfigRecord", () => {
    it("test1", () => {
      const data = loadJson("dynamoDbRecord1.json");
      try {
        Types.AssertsConfigRecord(data);
      } catch (e) {
        assert.fail(e.toString());
      }
    });
  });
});
