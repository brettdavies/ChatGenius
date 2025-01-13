import https from 'https';

interface HttpsRequestOptions {
  hostname: string;
  path: string;
  method: string;
  headers?: Record<string, string>;
}

export function httpsRequest(options: HttpsRequestOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: options.hostname,
      path: options.path,
      method: options.method,
      headers: options.headers
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
        } else {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
} 