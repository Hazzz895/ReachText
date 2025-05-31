call npm install --save-dev typescript esbuild
call npx esbuild src/index.ts --bundle --platform=browser --format=iife --outfile=./script.js