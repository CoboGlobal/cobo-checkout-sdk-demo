const axios = require('axios');
const crypto = require('crypto');
const nacl = require('tweetnacl');
const qs = require('querystring');

class CoboAPI {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = 'https://api.dev.cobo.com';
    // this.baseUrl = 'https://api.cobo.com';
  }

  _generateSignature(method, path, params = {}, body = '') {
    const timestamp = Date.now().toString();

    const paramStr = qs.stringify(params);
    const strToSign = [
      method.toUpperCase(),
      path,
      timestamp,
      paramStr,
      body
    ].join('|');

    const hash = crypto.createHash('sha256').update(strToSign).digest();
    const doubleHash = crypto.createHash('sha256').update(hash).digest();

    const secretBytes = Buffer.from(this.apiSecret, 'hex');
    const keyPair = nacl.sign.keyPair.fromSeed(secretBytes);
    const signature = nacl.sign.detached(doubleHash, keyPair.secretKey);

    return {
      timestamp,
      signature: Buffer.from(signature).toString('hex')
    };
  }

  _getHeaders(method, path, params = {}, bodyObj = null) {
    const body = bodyObj ? JSON.stringify(bodyObj) : '';
    const { timestamp, signature } = this._generateSignature(method, path, params, body);

    return {
      'Biz-Api-Key': this.apiKey,
      'Biz-Api-Nonce': timestamp,
      'Biz-Api-Signature': signature
    };
  }

  async paymentTokenExchange() {
    const method = 'POST';
    const path = '/v2/oauth/permission_token/exchange';
    const body = {
      permission_type: 'payment_orders_payin'
    };
    const headers = this._getHeaders(method, path, {}, body);
    const url = this.baseUrl + path;

    try {
      const response = await axios.post(url, body, { headers });
      return response.data;
    } catch (error) {
      console.error('Request failed:', error.response?.data || error.message);
      return null;
    }
  }
}

(async () => {
  const apiKey = '';
  const apiSecret = '';

  const cobo = new CoboAPI(apiKey, apiSecret);
  const result = await cobo.paymentTokenExchange();
  console.log(result);
})();
