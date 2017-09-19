/*
 
 * 微信支付文件
 * --------基础配置----------------
 * 1.把微信商户注册后把商户id输入
 * 2.把微信支付证书放到根目录下，然后取消注释读取证书
 * 
 * --------订单生成-------------
 * 3.控制器里使用WechatpayService.wechatpay(options,done);调用微信支付生成订单
 * 4.options里参数{
 *     body:支付名
 *     total_fee：支付价格
 *     spbill_create_ip:本机ip地址
 *     
 * }
 * 5.done(sign)订单生成调用成功后返回sign，直接传给前端调用
 * 
 * ------支付回调--------------
 * 6.更改微信支付回调地址
 * 7.
 * 8.修改微信回调，把前面的步奏加到回调方法里
 * 9.done(result)如果result是ture则支付成功，否则失败
 * 
 * 
 * 
 * */

var fs = require('fs')
var util = require('util')
var WXPay = require('weixin-pay');

var wxpay = WXPay({
	appid: 'wx923a7e6237fedb4a',
	mch_id: '1433985802',
	partner_key: 'bY8VPGrmTCzHrhYbhAFSUHx0Akn8gvgS', //微信商户平台API密钥
	//读取证书
//	pfx: fs.readFileSync('./apiclient_cert.p12'), //微信商户平台证书，（等需要时把微信证书放到根目录下，然后把注释取消掉就可以使用
});

module.exports = {
	wechatpay: function(options, done) {

		//如果没有参数就直接使用测试参数
		var body = options.body ? options.body : '支付测试';
		var total_fee = options.total_fee ? options.total_fee : 1;

		wxpay.createUnifiedOrder({
			body: body,
			out_trade_no: 'WX2017' + Math.random().toString().substr(2, 10),
			total_fee: total_fee, //价格，单位分	
			attach: "成都至强",
			spbill_create_ip: options.spbill_create_ip,
			notify_url: 'http://139.224.190.183/getwechat',
			trade_type: 'APP'
		}, function(err, result) {

			var time = Date.now()
				//统一下单接口返回正常的prepay_id，再按签名规范重新生成签名后，将数据传输给APP。参与签名的字段名为appId，partnerId，prepayId，nonceStr，timeStamp，package。注意：package的值格式为Sign=WXPay 

			var sign = wxpay.sign({
				appid: result.appid,
				partnerid: result.mch_id,
				prepayid: result.prepay_id,
				package: 'Sign=WXPay',
				noncestr: result.nonce_str,
				timestamp: time,
			})

			// 
			return done({
				appid: result.appid,
				partnerid: result.mch_id,
				prepayid: result.prepay_id,
				package: 'Sign=WXPay',
				noncestr: result.nonce_str,
				timestamp: time,
				sign: sign
			})
		});

	},
	getwechat: function(options, done) {
	    var sign = wxpay.sign(options);
	    console.log("sign="+sign);
	    var mysign ;
	    if(sign == options.sign){
	    	mysign = true;
	    }else{
	    	mysign = false;
	    }
	    console.log(mysign)
	    return done(mysign)
	}
}