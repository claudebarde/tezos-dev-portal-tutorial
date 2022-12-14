As we are building a web app with the Svelte framework, the steps to set up the project will be very similar to the ones you would follow to set up any other web app.

In this tutorial, we will make a Svelte SPA, so we won't need SvelteKit, which will also make our life easier.

The first thing to do, installing Svelte with TypeScript and Vite:

```
npm create vite@latest lb-dex -- --template svelte-ts
cd lb-dex
npm install
```

Next, we will install all the dependencies we need for the dapp:

```
npm install --save-dev sass
npm install @taquito/taquito @taquito/beacon-wallet
```

Sass is a development-only dependency, `@taquito/taquito`  is the NPM package for the Taquito library and `@taquito/beacon-wallet` is the NPM package that contains Beacon with some little configuration to make it easier to plug into Taquito.

There are a couple of other libraries we need to install:

```
npm install --save-dev buffer events vite-compatible-readable-stream
```

These libraries are required to be able to run Beacon in a Svelte app. We will see down below how to use them.

Once everything has been installed, we have to set up the right configuration.

In your `app` folder, you will see the `vite.config.js` file, it's the file that contains the configuration that Vite needs to run and bundle your app. Make the following changes:

```javascript=
import { defineConfig, mergeConfig } from "vite";
import path from "path";
import { svelte } from "@sveltejs/vite-plugin-svelte";  

export default ({ command }) => {
	const isBuild = command === "build";
	
	return defineConfig({
		plugins: [svelte()],
			define: {
				global: {}
			},
		build: {
			target: "esnext",
			commonjsOptions: {
				transformMixedEsModules: true
			}
		},
		server: {
			port: 4000
		},
		resolve: {
			alias: {
				"@airgap/beacon-sdk": path.resolve(
					path.resolve(),
					`./node_modules/@airgap/beacon-sdk/dist/${
					isBuild ? "esm" : "cjs"
					}/index.js`
				),
				// polyfills
				"readable-stream": "vite-compatible-readable-stream",
				stream: "vite-compatible-readable-stream"
			}
		}
	});
};
```

Here are a few changes we made to the template configuration given by Vite:
- We set `global` to `{}` and we will later provide the `global` object in our HTML file
- We provide a path to the Beacon SDK 
- We provide polyfills for `readable-stream` and `stream` 

Once these changes have been done, there is a last step to finish setting up the project: we have to update the HTML file where the JavaScript code will be injected.

Here is what you should have:

```html=
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<link rel="icon" href="/favicon.ico" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<script>
			const global = globalThis;
		</script>
		<script type="module">
			import { Buffer } from "buffer";
			window.Buffer = Buffer;
		</script>
		<title>Liquidity Baking DEX</title>
	</head>
	<body>
		<script type="module" src="/src/main.ts"></script>
	</body>
</html>
```

In the first `script` tag, we set the `global` variable to `globalThis`. Then, in a second `script` tag with a `module` type, we import `Buffer` from the `buffer` library and add it to the `window` global object.

> *Note: this configuration is required to run the Beacon SDK with a Svelte app. Taquito works completely out of the box and doesn't require any settings.*

Once we updated the configuration in the `vite.config.js` file and in the `index.html` file, our project is successfully set up! You can run `npm run dev` in your terminal at the root of the project to check that everything works properly, the dapp should be running on `http://localhost:4000`

Now, let's start writing some code and setting up the dapp!