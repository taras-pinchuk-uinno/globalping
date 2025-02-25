import * as path from 'node:path';
import * as url from 'node:url';

export default function wallaby () {
	const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
	return {
		testFramework: 'mocha',
		files: [
			'src/**/*.ts',
			'src/**/*.cjs',
			'config/*',
			'test/utils/**/*.ts',
			'test/mocks/**/*',
			'test/setup.ts',
			'test/types.ts',
			'package.json',
			'data/GCP_IP_RANGES.json',
			'data/AWS_IP_RANGES.json',
			'data/DOMAIN_BLACKLIST.json',
			'data/IP_BLACKLIST.json',
		],
		tests: [
			'test/tests/**/*.test.ts',
		],
		env: {
			type: 'node',
			params: {
				runner: '--experimental-specifier-resolution=node --loader '
					+ url.pathToFileURL(path.join(__dirname, 'node_modules/testdouble/lib/index.mjs')),
				env: 'NODE_ENV=test;NEW_RELIC_ENABLED=false;NEW_RELIC_LOG_ENABLED=false;FAKE_PROBE_IP=1',
			},
		},
		preprocessors: {
			'**/*.ts': file => file.content.replace(/\.ts/g, '.js'),
		},
		workers: { restart: true, initial: 1, regular: 1 },
		runMode: 'onsave',
	};
}
