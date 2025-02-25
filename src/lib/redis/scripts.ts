import { defineScript } from 'redis';
import type { MeasurementRecord, MeasurementResultMessage } from '../../measurement/types';

type CountScript = {
	NUMBER_OF_KEYS: number;
	SCRIPT: string;
	transformArguments (this: void, key: string): Array<string>;
	transformReply (this: void, reply: number): number;
} & {
	SHA1: string;
};

export type RecordResultScript = {
	NUMBER_OF_KEYS: number;
	SCRIPT: string;
	transformArguments (this: void, measurementId: string, testId: string, data: MeasurementResultMessage['result']): string[];
	transformReply (this: void, reply: string): MeasurementRecord | null;
} & {
	SHA1: string;
};

export type RedisScripts = {
	count: CountScript;
	recordResult: RecordResultScript;
};

export const count: CountScript = defineScript({
	NUMBER_OF_KEYS: 1,
	SCRIPT: `
	local cursor = 0
	local count = 0
	repeat
		local result = redis.call('SCAN', cursor, 'MATCH', KEYS[1], 'COUNT', 1000)
		cursor = tonumber(result[1])
		local keys = result[2]
		count = count + #keys
	until cursor == 0
	return count
	`,
	transformArguments (key: string) {
		return [ key ];
	},
	transformReply (reply: number) {
		return reply;
	},
});

export const recordResult: RecordResultScript = defineScript({
	NUMBER_OF_KEYS: 4,
	SCRIPT: `
	local measurementId = KEYS[1]
	local testId = KEYS[2]
	local data = KEYS[3]
	local date = KEYS[4]
	local key = 'gp:measurement:'..measurementId

	local probesAwaiting = redis.call('GET', key..':probes_awaiting')
	if not probesAwaiting then
		return
	end

	probesAwaiting = redis.call('DECR', key..':probes_awaiting')
	redis.call('JSON.SET', key, '$.results['..testId..'].result', data)
	redis.call('JSON.SET', key, '$.updatedAt', date)

	if probesAwaiting ~= 0 then
		return
	end

	redis.call('HDEL', 'gp:in-progress', measurementId)
	redis.call('DEL', key..':probes_awaiting')
	redis.call('JSON.SET', key, '$.status', '"finished"')

	return redis.call('JSON.GET', key)
	`,
	transformArguments (measurementId, testId, data) {
		return [ measurementId, testId, JSON.stringify(data), `"${new Date().toISOString()}"` ];
	},
	transformReply (reply) {
		return JSON.parse(reply) as MeasurementRecord | null;
	},
});
