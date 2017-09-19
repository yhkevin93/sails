 /*
   
   * 阿里大于短信平台
   * 1.填写app账号密码
   * 2.填写短信框架名
   * 3填写短信框架参数
   * 
   * 
   * 
   * */

 var Alidayu = require('alidayujs');

 module.exports = {

 	sendSms: function(options, done) {
 		//应用密匙 见：http://www.alidayu.com/help?spm=a3142.7802526.1.24.iEB4Yc&_t=1#create
 		var config = {
 			app_key: '23584656',
 			secret: '6a99fecc528949248754aff0fc4c992c'
 		};
 		var alidayu = new Alidayu(config);
 		//参数 见：http://open.taobao.com/doc2/apiDetail.htm?apiId=25450
 		var options = {
 			sms_free_sign_name: '身份验证',
 			sms_param: {
 				code: options.code,
 				product: '开业啦',
 			},
 			rec_num: options.phoneNumber, //多个手机号逗号隔开
 			sms_template_code: 'SMS_36835009',
 		};
 		//发送短信
 		alidayu.sms(options, function(err, result) {
 			if(err) {
 				console.log('ERROR' + err);
 			}
 			return done()
 		});
 	}

 }