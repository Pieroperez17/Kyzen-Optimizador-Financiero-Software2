import jsonWebToken from 'jsonwebtoken';

export default class TokenService {
  constructor({ secret, expiration }) {
    this.secret = secret;
    this.expiration = expiration;
  }

  create(user) {
    return jsonWebToken.sign({ id: user.id, email: user.email }, this.secret, { expiresIn: this.expiration });
  }

  verify(token) {
    return jsonWebToken.verify(token, this.secret);
  }
}
