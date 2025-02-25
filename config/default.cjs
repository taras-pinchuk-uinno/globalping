module.exports = {
	server: {
		host: 'https://api.globalping.io',
		port: 3000,
		processes: 2,
	},
	redis: {
		url: 'redis://localhost:6379',
		socket: {
			tls: false,
		},
	},
	admin: {
		key: '',
	},
	geoip: {
		cache: {
			ttl: 3 * 24 * 60 * 60 * 1000, // 24hrs
		},
	},
	maxmind: {
		accountId: '',
		licenseKey: '',
	},
	ipinfo: {
		apiKey: '',
	},
	ws: {
		fetchSocketsCacheTTL: 1000,
	},
	measurement: {
		rateLimit: 300,
		maxInProgressProbes: 5,
		// Timeout after which measurement will be marked as finished even if not all probes respond
		timeout: 30, // 30 seconds
		// measurement result TTL in redis
		resultTTL: 7 * 24 * 60 * 60, // 7 days
		limits: {
			global: 500,
			location: 200,
		},
		globalDistribution: {
			AF: 5,
			AS: 15,
			EU: 30,
			OC: 10,
			NA: 30,
			SA: 10,
		},
	},
};
