import type {Server} from 'node:http';
import {expect} from 'chai';
import request, {type SuperTest, type Test} from 'supertest';

import {getTestServer} from '../../../utils/http.js';
import {addFakeProbe, deleteFakeProbe} from '../../../utils/ws.js';

describe('Create measurement', function () {
	this.timeout(15_000);

	let app: Server;
	let requestAgent: SuperTest<Test>;

	before(async () => {
		app = await getTestServer();
		requestAgent = request(app);
	});

	describe('probes not connected', () => {
		it('should respond with error', async () => {
			await requestAgent.post('/v1/measurements')
				.send({
					type: 'ping',
					target: 'example.com',
					locations: [{country: 'US'}],
					measurementOptions: {
						packets: 4,
					},
					limit: 2,
				})
				.expect(422)
				.expect(response => {
					expect(response.body).to.deep.equal({
						error: {
							message: 'No suitable probes found',
							type: 'no_probes_found',
						},
					});
				});
		});
	});

	describe('probes connected', () => {
		before(async () => {
			await addFakeProbe('fake-probe-US', {
				location: {continent: 'NA', country: 'US'},
				tags: [{type: 'system', value: 'tag-value'}],
				index: ['na', 'us', 'tag value'],
			});
		});

		after(() => {
			deleteFakeProbe('fake-probe-US');
		});

		it('should create measurement with global limit', async () => {
			await requestAgent.post('/v1/measurements')
				.send({
					type: 'ping',
					target: 'example.com',
					locations: [{country: 'US'}],
					measurementOptions: {
						packets: 4,
					},
					limit: 2,
				})
				.expect(202)
				.expect(({body, header}) => {
					expect(body.id).to.exist;
					expect(header.location).to.exist;
					expect(body.probesCount).to.equal(1);
				});
		});

		it('should create measurement with location limit', async () => {
			await requestAgent.post('/v1/measurements')
				.send({
					type: 'ping',
					target: 'example.com',
					locations: [{country: 'US', limit: 2}],
					measurementOptions: {
						packets: 4,
					},
				})
				.expect(202)
				.expect(({body, header}) => {
					expect(body.id).to.exist;
					expect(header.location).to.exist;
					expect(body.probesCount).to.equal(1);
				});
		});

		it('should create measurement for globally distributed probes', async () => {
			await requestAgent.post('/v1/measurements')
				.send({
					type: 'ping',
					target: 'example.com',
					measurementOptions: {
						packets: 4,
					},
					limit: 2,
				})
				.expect(202)
				.expect(({body, header}) => {
					expect(body.id).to.exist;
					expect(header.location).to.exist;
					expect(body.probesCount).to.equal(1);
				});
		});

		it('should create measurement with "magic: world" location', async () => {
			await requestAgent.post('/v1/measurements')
				.send({
					type: 'ping',
					target: 'example.com',
					locations: [{magic: 'world', limit: 2}],
					measurementOptions: {
						packets: 4,
					},
				})
				.expect(202)
				.expect(({body, header}) => {
					expect(body.id).to.exist;
					expect(header.location).to.exist;
					expect(body.probesCount).to.equal(1);
				});
		});

		it('should create measurement with "magic" value in any case', async () => {
			await requestAgent.post('/v1/measurements')
				.send({
					type: 'ping',
					target: 'example.com',
					locations: [{magic: 'Na'}],
					measurementOptions: {
						packets: 4,
					},
				})
				.expect(202)
				.expect(({body, header}) => {
					expect(body.id).to.exist;
					expect(header.location).to.exist;
					expect(body.probesCount).to.equal(1);
				});
		});

		it('should create measurement with partial tag value "magic: TaG-v" location', async () => {
			await requestAgent.post('/v1/measurements')
				.send({
					type: 'ping',
					target: 'example.com',
					locations: [{magic: 'TaG-v', limit: 2}],
					measurementOptions: {
						packets: 4,
					},
				})
				.expect(202)
				.expect(({body, header}) => {
					expect(body.id).to.exist;
					expect(header.location).to.exist;
					expect(body.probesCount).to.equal(1);
				});
		});

		it('should not create measurement with "magic: non-existing-tag" location', async () => {
			await requestAgent.post('/v1/measurements')
				.send({
					type: 'ping',
					target: 'example.com',
					locations: [{magic: 'non-existing-tag', limit: 2}],
					measurementOptions: {
						packets: 4,
					},
				})
				.expect(422)
				.expect(response => {
					expect(response.body).to.deep.equal({
						error: {
							message: 'No suitable probes found',
							type: 'no_probes_found',
						},
					});
				});
		});

		it('should create measurement with "tags: [tag-value]" location', async () => {
			await requestAgent.post('/v1/measurements')
				.send({
					type: 'ping',
					target: 'example.com',
					locations: [{tags: ['tag-value'], limit: 2}],
					measurementOptions: {
						packets: 4,
					},
				})
				.expect(202)
				.expect(({body, header}) => {
					expect(body.id).to.exist;
					expect(header.location).to.exist;
					expect(body.probesCount).to.equal(1);
				});
		});
	});
});
