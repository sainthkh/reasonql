const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { jwtSecret } = require('./keys');
const User = require('../model/User');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = jwtSecret;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      let user = User.findById(jwt_payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    })
  );
};
