import withSolid from "rollup-preset-solid";

export default withSolid({
	input: "src/index.ts",
	output: {
		file: "dist/bundle.js",
		format: "es",
		sourcemap: true,
	},
	watch: {
		include: "src/**",
	},
});
