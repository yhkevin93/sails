/*
 
 * 支付宝支付
 * -------------基础配置---------------------
 * 1.修改支付宝配置(需要修改项：{
 *   1.1合作者身份ID,partner
 *   1.2通知回调地址,notify_url
 *   1.3卖家账号，seller_id
 * })
 * 2.把支付宝私钥和公钥放到根目录下方便调用
 * 
 * -----------订单生成-----------------
 * 3.控制器调用AlipayService.alipay(option,done)
 * 4.option参数{
 * 	 4.1body：商品描述
 *   4.2total_fee：商品价格
 *   4.3subject:商品名
 * }
 * 5.done(sign)订单生成调用成功后返回sign，直接传给前端调用
 * 
 * ----------支付回调-------------
 * 6.控制器里调用AlipayService.getAlipay(option,done)
 * 7.option参数{
 * 	 7.1 params，支付宝服务器发来的支付数据
 * }
 * 8.done(result)如果result是ture则支付成功，否则失败
 * 
 * */

var crypto = require('crypto');
var fs = require('fs')
var https = require("https");

//支付宝必须配置
var AlipayConfig = {
	//服务接口名
	service: 'mobile.securitypay.pay',
	//合作者身份ID
	partner: '2088121264567235',
	//编码
	_input_charset: 'UTF-8',
	//签名方式
	sign_type: 'RSA',
	//签名
	sign: '',
	//异步通知路径
	notify_url: '139.224.190.183:1337/getalipay',
	//订单号（简单的：时间戳生成
	out_trade_no: '0829145412-6177',
	//商品名
	subject: '傻逼支付宝',
	//支付类型
	payment_type: '1',
	//卖家账号
	seller_id: '2156081@qq.com',
	//金额（前端获取
	total_fee: 0.01,
	//商品描述
	body: '傻逼支付宝'
}

//获取有序列表
function getParams(params) {
	var sPara = [];
	for(var key in params) {
		if((!params[key]) || key == 'sign' || key == 'sign_type') {
			continue;
		};

		sPara.push([key, params[key]]);
	}

	sPara = sPara.sort();
	var prestr = '';
	for(var i2 = 0; i2 < sPara.length; i2++) {
		var obj = sPara[i2];
		if(i2 == sPara.length - 1) {
			prestr = prestr + obj[0] + '="' + obj[1] + '"';
		} else {
			prestr = prestr + obj[0] + '="' + obj[1] + '"&';
		}
	}

	return prestr;

}
//签名
function getSign(params) {
	try {
		//读取证书秘钥
		var privatePem = fs.readFileSync('./app_private_key.pem');
		var key = privatePem.toString();
		var prestr = getParams(params)
		var sign = crypto.createSign('RSA-SHA1');
		sign.update(prestr);
		sign = sign.sign(key, 'base64');
		return encodeURIComponent(sign)
	} catch(err) {
		console.log('err', err)
	}
}

//将支付宝发来的数据生成有序数列
function getVerifyParams(params) {
	var sPara = [];
	if(!params) return null;
	for(var key in params) {
		if((!params[key]) || key == "sign" || key == "sign_type") {
			continue;
		};
		sPara.push([key, params[key]]);
	}
	sPara = sPara.sort();
	var prestr = '';
	for(var i2 = 0; i2 < sPara.length; i2++) {
		var obj = sPara[i2];
		if(i2 == sPara.length - 1) {
			prestr = prestr + obj[0] + '=' + obj[1] + '';
		} else {
			prestr = prestr + obj[0] + '=' + obj[1] + '&';
		}
	}
	return prestr;
}
//验签
function veriySign(params) {
	try {
		var publicPem = fs.readFileSync('./rsa_public_key.pem');
		var publicKey = publicPem.toString();
		var prestr = getVerifyParams(params);
		var sign = params['sign'] ? params['sign'] : "";
		var verify = crypto.createVerify('RSA-SHA1');
		verify.update(prestr);
		return verify.verify(publicKey, sign, 'base64')

	} catch(err) {
		console.log('veriSign err', err)
	}
}

module.exports = {
	//生成支付订单
	alipay: function(options, done) {
		var code = ""
		for(var i = 0; i < 4; i++) {
			code += Math.floor(Math.random() * 10);
		}

		//订单号暂时由时间戳与四位随机码生成
		AlipayConfig.out_trade_no = options.out_trade_no ? options.out_trade_no : Date.now().toString() + code;
		AlipayConfig.body = options.body ? options.body : "这是测试商品";
		AlipayConfig.total_fee = options.total_fee ? options.total_fee : 0.01;
		AlipayConfig.subject = options.subject ? options.subject : "测试商品"
		var myParam = getParams(AlipayConfig);
		var mySign = getSign(AlipayConfig)
		var last = myParam + '&sign="' + mySign + '"&sign_type="RSA"';
		return done(last)
	},
	//回调验签
	getAlipay: function(options, done) {

		var params = options.params
		var mysign = veriySign(params);
		//验证支付宝签名mysign为true表示签名正确

		try {
			//验签成功
			if(mysign) {
				//				res.ok('success')
				if(params['trade_status'] == 'TRADE_SUCCESS' || params['trade_status'] == 'TRADE_FINISHED') {
					var partner = AlipayConfig.partner;
					//生成验证支付宝通知的url
					var url = 'https://mapi.alipay.com/gateway.do?service=notify_verify&' + 'partner=' + partner + '&notify_id=' + params['notify_id'];

					//验证是否是支付宝发来的通知
					https.get(url, function(res) {
						//data如果是true代表是支付宝发来的信息

						if(res.statusCode === 200) {
							var body = '';
							res.on('data', function(data) {
								body += data;
							}).on('end', function() {
								console.log('是否是支付宝发来的请求:' + body)
								return done(true)
							});
						}
					})
				}
			} else {
				return done(false)
			}
		} catch(err) {
			return done(false)

		}
	},

}