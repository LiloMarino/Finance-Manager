// Gera types/openapi.generated.ts direto do backend, sem servidor de pé (D11): o
// schema sai do stdout do export_openapi.py e chega aqui em memória.
//
// O hook `transform` é o que faz todo campo marcado com `format: "decimal"` no
// backend chegar aqui como DecimalString em vez de string solta.
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";

import openapiTS, { astToString } from "openapi-typescript";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const repoRoot = path.join(root, "..");
const target = path.join(root, "types", "openapi.generated.ts");

const schema = JSON.parse(
  execFileSync("uv", ["run", "python", "scripts/export_openapi.py"], {
    cwd: repoRoot,
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "inherit"],
  }),
);

const decimalType = ts.factory.createTypeReferenceNode("DecimalString");

const ast = await openapiTS(schema, {
  transform(schemaObject) {
    if (schemaObject.format === "decimal") return decimalType;
  },
});

let output = astToString(ast);

// O import só entra quando algum DTO realmente expõe Decimal: import não usado
// é erro sob noUnusedLocals.
if (output.includes("DecimalString")) {
  output = `import type { DecimalString } from "./decimal";\n\n${output}`;
}

await writeFile(target, output, "utf-8");
console.log("types/openapi.generated.ts gerado a partir do backend");
