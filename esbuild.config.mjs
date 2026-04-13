import esbuild from "esbuild";
import process from "process";
import builtins from "module";

const prod = process.argv[2] === "production";

const nodeBuiltins = builtins.builtinModules.flatMap((m) => [m, `node:${m}`]);

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/*",
    "@lezer/*",
    ...nodeBuiltins,
  ],
  format: "cjs",
  target: "es2018",
  platform: "node",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
  minify: prod,
});

if (prod) {
  await context.rebuild();
  process.exit(0);
} else {
  await context.watch();
}
