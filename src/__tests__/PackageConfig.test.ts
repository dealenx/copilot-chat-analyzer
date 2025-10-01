import { readFileSync } from "fs";
import { join } from "path";

describe("Package.json Configuration Tests", () => {
  let packageJson: any;

  beforeAll(() => {
    const packagePath = join(process.cwd(), "package.json");
    const packageContent = readFileSync(packagePath, "utf-8");
    packageJson = JSON.parse(packageContent);
  });

  test("should have correct module type", () => {
    expect(packageJson.type).toBe("module");
  });

  test("should have correct main entry points", () => {
    expect(packageJson.main).toBe("dist/index.cjs");
    expect(packageJson.module).toBe("dist/index.mjs");
    expect(packageJson.types).toBe("dist/index.d.ts");
  });

  test("should have correct exports configuration", () => {
    const exports = packageJson.exports;

    expect(exports).toBeDefined();
    expect(exports["."]).toBeDefined();

    const mainExport = exports["."];
    expect(mainExport.types).toBe("./dist/index.d.ts");
    expect(mainExport.import).toBe("./dist/index.mjs");
    expect(mainExport.require).toBe("./dist/index.cjs");
    expect(mainExport.default).toBe("./dist/index.mjs");
  });

  test("should include dist folder in files", () => {
    expect(packageJson.files).toContain("dist");
  });

  test("should have build script", () => {
    expect(packageJson.scripts.build).toBeDefined();
    expect(packageJson.scripts.build).toBe("tsup");
  });
});
