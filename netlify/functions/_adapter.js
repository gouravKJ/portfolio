export function runHandler(handler, request, context) {
  return new Promise((resolve, reject) => {
    const url = new URL(request.url)

    const req = {
      method: request.method,
      url: `${url.pathname}${url.search}`,
      headers: Object.fromEntries(request.headers.entries()),
      socket: { remoteAddress: context?.ip || 'unknown' },
    }

    const res = {
      statusCode: 200,
      headers: {},
      setHeader(name, value) {
        this.headers[name.toLowerCase()] = value
      },
      end(body) {
        resolve(
          new Response(body ?? null, {
            status: this.statusCode,
            headers: this.headers,
          })
        )
      },
    }

    const invoke = () => {
      Promise.resolve(handler(req, res)).catch(reject)
    }

    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      request
        .text()
        .then((body) => {
          req.body = body
          invoke()
        })
        .catch(reject)
      return
    }

    invoke()
  })
}
