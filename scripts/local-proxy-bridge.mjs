/**
 * Lightweight local HTTP/HTTPS CONNECT proxy -> SOCKS5 (192.168.43.1:1080) bridge.
 * Used automatically when Windows Proxifier has node.exe set to Direct on a SOCKS5 Wi-Fi bridge.
 */
import http from "node:http"
import net from "node:net"
import { URL } from "node:url"

const SOCKS_HOST = process.env.SOCKS_PROXY_HOST || "192.168.43.1"
const SOCKS_PORT = Number(process.env.SOCKS_PROXY_PORT || 1080)
const BRIDGE_PORT = Number(process.env.LOCAL_HTTP_PROXY_PORT || 10809)

export function connectViaSocks5(targetHost, targetPort) {
  return new Promise((resolve, reject) => {
    const sock = net.connect(SOCKS_PORT, SOCKS_HOST)
    let stage = 0

    const onError = (err) => {
      sock.destroy()
      reject(err)
    }
    sock.once("error", onError)

    sock.once("connect", () => {
      // SOCKS5 greeting: version 5, 1 auth method, 0x00 (no auth)
      sock.write(Buffer.from([0x05, 0x01, 0x00]))
    })

    sock.on("data", (chunk) => {
      if (stage === 0) {
        if (chunk[0] !== 0x05 || chunk[1] !== 0x00) {
          sock.destroy()
          return reject(new Error("SOCKS5 auth rejected"))
        }
        stage = 1
        // Domain name connect request (0x03) so remote SOCKS5 resolves DNS
        const hostBuf = Buffer.from(targetHost, "utf8")
        const portBuf = Buffer.alloc(2)
        portBuf.writeUInt16BE(Number(targetPort), 0)
        const req = Buffer.concat([
          Buffer.from([0x05, 0x01, 0x00, 0x03, hostBuf.length]),
          hostBuf,
          portBuf,
        ])
        sock.write(req)
      } else if (stage === 1) {
        if (chunk[0] !== 0x05 || chunk[1] !== 0x00) {
          sock.destroy()
          return reject(new Error(`SOCKS5 connect failed (code ${chunk[1]})`))
        }
        stage = 2
        sock.removeAllListeners("data")
        sock.removeListener("error", onError)
        resolve(sock)
      }
    })
  })
}

export async function startLocalProxyBridge(port = BRIDGE_PORT) {
  // Check if SOCKS5 at 192.168.43.1:1080 is reachable
  const socksReachable = await new Promise((resolve) => {
    const s = net.connect(SOCKS_PORT, SOCKS_HOST)
    s.setTimeout(800)
    s.once("connect", () => {
      s.destroy()
      resolve(true)
    })
    s.once("timeout", () => {
      s.destroy()
      resolve(false)
    })
    s.once("error", () => {
      s.destroy()
      resolve(false)
    })
  })

  if (!socksReachable) {
    return null
  }

  const server = http.createServer(async (req, res) => {
    try {
      const parsed = new URL(req.url)
      const targetPort = parsed.port || (parsed.protocol === "https:" ? 443 : 80)
      const remote = await connectViaSocks5(parsed.hostname, targetPort)

      const pathWithQuery = (parsed.pathname || "/") + (parsed.search || "")
      const headerLines = [`${req.method} ${pathWithQuery} HTTP/${req.httpVersion}`]
      for (let i = 0; i < req.rawHeaders.length; i += 2) {
        const k = req.rawHeaders[i]
        const v = req.rawHeaders[i + 1]
        if (k.toLowerCase() !== "proxy-connection") {
          headerLines.push(`${k}: ${v}`)
        }
      }
      headerLines.push("\r\n")
      remote.write(headerLines.join("\r\n"))
      req.pipe(remote)
      remote.pipe(res)
      remote.on("error", () => res.destroy())
      req.on("error", () => remote.destroy())
    } catch {
      res.writeHead(502)
      res.end("Bad Gateway")
    }
  })

  server.on("connect", async (req, clientSocket, head) => {
    try {
      const [host, portStr] = req.url.split(":")
      const portNum = Number(portStr) || 443
      const remote = await connectViaSocks5(host, portNum)
      clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n")
      if (head && head.length > 0) {
        remote.write(head)
      }
      remote.pipe(clientSocket)
      clientSocket.pipe(remote)
      remote.on("error", () => clientSocket.destroy())
      clientSocket.on("error", () => remote.destroy())
    } catch {
      clientSocket.write("HTTP/1.1 502 Bad Gateway\r\n\r\n")
      clientSocket.destroy()
    }
  })

  return new Promise((resolve) => {
    server.once("error", () => {
      // Port already in use by another bridge instance
      resolve(`http://127.0.0.1:${port}`)
    })
    server.listen(port, "127.0.0.1", () => {
      resolve(`http://127.0.0.1:${port}`)
    })
  })
}

if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  startLocalProxyBridge().then((url) => {
    if (url) {
      console.log(`Local HTTP->SOCKS5 proxy bridge listening on ${url}`)
    } else {
      console.log("SOCKS5 proxy not active; running direct.")
    }
  })
}
