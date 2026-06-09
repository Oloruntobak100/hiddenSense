import { describe, expect, it } from "vitest";
import { csvRowsToObjects, parseCsv } from "@/lib/admin/parse-csv";

describe("parseCsv", () => {
  it("parses quoted fields with commas", () => {
    const rows = parseCsv('name,note\n"Evening Spritz","Citrus, bright"\n');
    expect(rows).toEqual([
      ["name", "note"],
      ["Evening Spritz", "Citrus, bright"],
    ]);
  });

  it("maps header row to records", () => {
    const { records } = csvRowsToObjects(parseCsv("drink_name,food_name\nSpritz,Crudo\n"));
    expect(records).toEqual([{ drink_name: "Spritz", food_name: "Crudo" }]);
  });
});
