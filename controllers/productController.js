'use strict';

var TopClient = require('top-client-taobao').TopClient;
var crypto = require('crypto');
var dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc');
var timezone = require('dayjs/plugin/timezone');

const axios = require('axios').default;

dayjs.extend(utc);
dayjs.extend(timezone);

const hash = (method, s, format) => {
  const sum = crypto.createHash(method);
  const isBuffer = Buffer.isBuffer(s);
  if (!isBuffer && typeof s === 'object') {
    s = JSON.stringify(sortObject(s));
  }
  sum.update(s, 'utf8');
  return sum.digest(format || 'hex');
};

const sortObject = (obj) => {
  return Object.keys(obj)
    .sort()
    .reduce(function (result, key) {
      result[key] = obj[key];
      return result;
    }, {});
};

const signRequest = (parameters) => {
  const sortedParams = sortObject(parameters);
  const sortedString = Object.keys(sortedParams).reduce((acc, objKey) => {
    return `${acc}${objKey}${sortedParams[objKey]}`;
  }, '');

  const bookstandString = `${process.env.APPSERECT}${sortedString}${process.env.APPSERECT}`;
  const signedString = hash('md5', bookstandString, 'hex');
  return signedString.toUpperCase();
};

exports.getProductById = async (req, res) => {
  const timestamp = dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');

  const payload = {
    method: 'aliexpress.affiliate.productdetail.get',
    app_key: process.env.APPKEY,
    sign_method: 'md5',
    timestamp,
    format: 'json',
    v: '2.0',
    product_ids: req.params.id,
    target_currency: 'USD',
    target_language: 'EN',
  };

  const sign = signRequest(payload);

  const allParams = {
    ...payload,
    sign,
  };

  const response = await axios({
    method: 'POST',
    url: process.env.RESTURL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    data: new URLSearchParams(allParams),
  });
  const productResult =
    response.data.aliexpress_affiliate_productdetail_get_response.resp_result
      .result.products.product;

  res.send(productResult);
};

exports.products = async (req, res) => {
  const category_id = req.params.cat_id;
  const pageNumber = req.params.page_no;
  console.log('id:', req.params.cat_id);
  console.log('page:', req.params.page_no);

  if (pageNumber == undefined) {
    pageNumber = 1;
  }
  const timestamp = dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');

  const payload = {
    method: 'aliexpress.affiliate.product.query',
    app_key: process.env.APPKEY,
    sign_method: 'md5',
    timestamp,
    page_no: pageNumber,
    category_ids: category_id,
    format: 'json',
    v: '2.0',
  };

  console.log({ payload });

  const sign = signRequest(payload);
  console.log({ sign });

  const allParams = {
    ...payload,
    sign,
  };

  console.log({ allParams });

  const response = await axios({
    method: 'POST',
    url: process.env.RESTURL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    data: new URLSearchParams(allParams),
  });
  const productResult =
    response.data.aliexpress_affiliate_product_query_response.resp_result
      .result;

  //productResult.products
  // productResult.current_page_no
  // productResult.current_record_count
  // productResult.total_record_count
  res.send(productResult);
};

exports.categories = async (req, res) => {
  const timestamp = dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');

  const payload = {
    method: 'aliexpress.affiliate.category.get',
    app_key: process.env.APPKEY,
    sign_method: 'md5',
    timestamp,
    format: 'json',
    v: '2.0',
    target_currency: 'USD',
    target_language: 'EN',
  };

  const sign = signRequest(payload);

  const allParams = {
    ...payload,
    sign,
  };

  const response = await axios({
    method: 'POST',
    url: process.env.RESTURL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    data: new URLSearchParams(allParams),
  });
  const categories =
    response.data.aliexpress_affiliate_category_get_response.resp_result.result
      .categories;
  res.send(categories);
};
