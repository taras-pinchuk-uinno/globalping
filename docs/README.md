# Globalping API

**API domain**: `api.globalping.io`

**API prefix**: `/v1`

If you are implementing an application interacting with the API, please also see the
[client guidelines](CLIENT_GUIDELINES.md).

## Open Endpoints

Open endpoints require no Authentication.

### probe

- [show probe list](probes/get.md): `GET /v1/probes`

### measurement

- [post measurement](measurement/post-create.md): `POST /v1/measurements`
- [get measurement](measurement/get.md): `GET /v1/measurements/:id`

### schemas

- [Location filters](measurement/schema/location.md)
- [Measurement Request](measurement/schema/request.md)
- [Measurement Response](measurement/schema/response.md)
