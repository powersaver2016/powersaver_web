#!/usr/bin/env python2.7
#-*- coding:utf8 -*-
#
# 2016-9-10 by shane

from tornado.web import RequestHandler, HTTPError
import json
import re
import traceback
import pprint

from _module._lib.log import Log
from _module._lib.common import Common
from _module._lib.session import Session
from _module._lib.validation import Validation
import config_base

class BaseHandler(RequestHandler):
    def parse_response(self, ret):
        if ret is None:
            Common.jsErr(self, "无返回值！")
            return ""

        if ret['code'] == 0:
            Common.jsSuc(self)
        else:
            Log.error(self)
            Common.jsErr(self, ret['message'])

    def initialize(self, method = ''):
        #初始化Sesion
        self._method = method
        self._session = Session(self)
        self._user = self._get_current_user()
        self._uid = self.get_current_uid()


    def _prepare_context(self):
        self._context = _Context()
        self._context.dm_static = config_base.domain['static']
        self._context.dm_static_public = config_base.domain['static_public']
        self._context.dm_image= config_base.domain['image']


    def prepare(self):
        self._prepare_context()

    def _get_current_user(self):
        user =  self._session.get('user')
        return user

    def get_current_user(self):
        return self._user

    def get_login_url(self):
        return '/login'

    def get_current_uid(self):
        if self._user is not None and self._user.has_key('id'):
            return self._user['id']
        else:
            return 0

    def get_num(self, param, default = 0):
        num =  self.get_argument(param, default)
        if num is None and default is None:
            return None
        else:
            return int(num)

    def pack_args(self, args):
        in_vals = {}

        for (k,v) in args.items():
            in_vals[k] = self.get_argument(k, None)

        values = {}

        for (k,v) in args.items():
            val = None

            # 如果未传值，验证是否必须传值或者设置默认值
            if in_vals[k] is None:
                if v.has_key('required') and v['required'] == 1:
                    return [False, "key: %s is required" % k]
                if v.has_key('default'):
                    values[k] = v['default']
                    continue
            else:
                if v['type'] == 'd':
                    try:
                        val = int(in_vals[k])
                    except Exception as e:
                        return [False, "key: %s's value is not an integer" % k]

                    try:
                        # 长度验证
                        if v.has_key('max'):
                            if val > v['max']:
                                return [False, "key: %s's larger than %d " % (k, v['max'])]
                        if v.has_key('min'):
                            if val < v['min']:
                                return [False, "key: %s's less than %d " % (k, v['min'])]
                        if v.has_key('range'):
                            if val > v['range'][1] or val < v['range'][0]:
                                return [False, "key: %s's is not in range [%d,%d] " % (k, v['range'][0], v['range'][1])]
                        if v.has_key('in'):
                            if not val in v['in']:
                                return [False, "key: %s's value must be in array %s " % (k, str(v['in']))]
                    except Exception as e:
                        return [False, "key: %s's value unkown error." % k]

                elif v['type'] == 'f':
                    try:
                        val = float(in_vals[k])
                    except Exception as e:
                        return [False, "key: %s's value is not a float" % k]
                elif v['type'] == 'dict':
                    try:
                        if isinstance(in_vals[k], dict):
                            val = in_vals[k]
                        elif isinstance(in_vals[k], str):
                            val = json.loads(in_vals[k])
                    except Exception as e:
                        return [False, "key: %s's value is not a dict or dict json string" % k]
                elif v['type'] == 'list':
                    try:
                        if isinstance(in_vals[k], list):
                            val = in_vals[k]
                        else:
                            val = json.loads(in_vals[k])

                        if not isinstance(val, list):
                            return [False, "key: %s's value is not a list or list json string" % k]
                    except Exception as e:
                        print e
                        return [False, "key: %s's value is not a dict or list json string" % k]
                else:
                    val = str(in_vals[k])
                    length = len(val)

                    try:
                        # 长度验证
                        if v.has_key('maxlen'):
                            if length > v['maxlen']:
                                return [False, "key: %s's length is more than %d " % (k, v['maxlen'])]
                        if v.has_key('minlen'):
                            if length < v['minlen']:
                                return [False, "key: %s's length is less than %d " % (k, v['minlen'])]
                        if v.has_key('range'):
                            if length > v['range'][1] or length<v['range'][0]:
                                return [False, "key: %s's length is not in range [%d,%d] " % (k, v['range'][0], v['range'][1])]
                        if v.has_key('in'):
                            if not val in v['in']:
                                return [False, "key: %s's value must be in array %s " % (k, str(v['in']))]
                    except Exception as e:
                        return [False, "key: %s's value unkown error." % k]

            values[k] = val;

        return [True, values]


    def fetch(self, tpl, **kwargs):
        return self.render_string(tpl, **kwargs)

    def make_tpl_para(self):
        c = {'title':''}
        c['user'] = self._user
        c['pager'] = self.get_pager()
        c['next_url'] = self.request.uri
        c['uri'] = self.safe_pager_uri()
        return c

    #从URL中获取分页和排序参数
    #@param 默认排序字段 sf
    #@param 默认排序类型 st
    #@param 默认当前页 p
    #@param 默认每页显示 ps
    #@return dict('p'=page,'ps'=pagesize,'st'=sorttype,'sf'=sortfield)
    def get_pager(self, p=1,ps=10, sf=None, st=None):
        _pager=dict()

        ret = self.pack_args({
        'p': {'type': 'd', 'default': p},
        'ps': {'type': 'd', 'default': ps},
        })

        if ret[0] == False:
            self.write(u'参数错误！')
            return

        _pager['p']=ret[1]['p']
        _pager['ps']=ret[1]['ps']
        _pager['st']=str(self.get_argument("st",sf))
        _pager['sf']=str(self.get_argument("sf",st))
        _pager['psum'] = 0 # 总共页数
        _pager['total'] =0 # 总数目
        return _pager

    def safe_pager_uri(self):
        uri = self.request.uri;
        uri = re.compile(r"\?ps=[^&]*", re.S).sub('?', uri)
        uri = re.compile(r"\?p=[^&]*", re.S).sub('?', uri)
        uri = re.compile(r"\&ps=[^&]*", re.S).sub('', uri)
        uri = re.compile(r"\&p=[^&]*", re.S).sub('', uri)
        if uri.find('?') < 0:
            uri += '?'
        else:
            uri += '&'

        return uri

    def get(self, *args, **kwargs):
        try:
            self._get(*args, **kwargs)
        except HTTPError as e:
            Log.error(e)
            if e.status_code == 404:
                self.render('web/404.htm')
            elif e.status_code == 405:
                self.render('web/405.htm')
            else:
                self.render('web/500.htm')
            return
        except Exception as e:
            Log.error(e)
            self.render('web/500.htm')

    def post(self, *args, **kwargs):
        try:
            self._post(*args, **kwargs)
        except Exception as e:
            Log.error(e)
            self.write(str(e))

    def _get(self, *args, **kwargs):
        pass

    def _post(self, *args, **kwargs):
        pass

    def get_platform(self):
        _types = ['windows nt', 'iphone', 'ipad', 'android']
        platform = {'windows nt':'Web', 'iphone':'IOS', 'ipad':'IOS', 'android':'Android'}
        agent = self.request.headers['User-Agent'].lower()

        for type in _types:
            index = agent.find(type)
            if index <> -1:
                return platform[type]
        return 'Web'


    @staticmethod
    def checkPermission(allowedKey):
        def _checkPermission(func):
            def _wrapper(request, *args, **kwargs):
                print("before %s called arg:[%s]" % (func.__name__, allowedKey))
                user = request.get_current_user()
                has_err = False
                err_page = None
                try:
                    role_info = user['role_info']
                    if role_info['is_super'] == 1 or role_info['perms'].has_key(allowedKey):
                        func(request, *args, **kwargs)
                    else:
                        # print '=======debug====1====='
                        has_err = True
                        err_page = 'web/403.htm'
                except Exception as e:
                    exstr = traceback.format_exc()
                    Log.error(exstr)
                    has_err = True
                    err_page = 'web/500.htm'
                    # print '=======debug====2=====' + e
                    # request.render('web/500.htm')
                if has_err:
                    print err_page
                    request.render(err_page)

            return  _wrapper
        return  _checkPermission


class _Context():
    def __init__(self):
        self.title = ''
        self.css = []
        self.js = []
        self.external_css = []
        self.external_js = []



