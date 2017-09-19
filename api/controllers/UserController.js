/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	_config: {
		actions: false,
		shortcuts: false,
		rest: false
	},
	welcome: function(req, res) {
		res.json({
			welcome: "welcome to kv's sails"
		})
	},
	signup: function(req, res) {
		User.create(req.allParams()).exec(function(err, user) {
			if(err) {
				res.json({
					err: err
				})
			}

			res.json({
				result: '注册成功',
				user: user
			})

		})

	},
	login: function(req, res) {

		passport.authenticate('local', function(err, user, info) {
			if((err) || (!user)) {
				return res.send({
					message: info.message,
					user: user
				});
			}
			req.logIn(user, function(err) {
				if(err) res.send(err);
				return res.send({
					message: info.message,
					user: user
				});
			});

		})(req, res);
	},

	logout: function(req, res) {
		req.logout();
		res.redirect('/');
	}
};

var passport = require('passport');