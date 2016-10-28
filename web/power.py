#!/usr/bin/env python2.7
#-*- coding:utf8 -*-
#
# author: shane

import tornado
import pprint
import json

from _module._lib.common import Common
from web._base_ import BaseHandler
from _module._lib.mgdb import MgDB


class ConfigHandler(BaseHandler):
    def get(self, *args, **kwargs):
        c = self.make_tpl_para()
        c['regions'] = json.dumps(['power'])
        buckets = {
        	'power':[ {'bucket':'common', 'region':'power', 'type':'BaseProfile'},
        		{'bucket':'common-hash', 'region':'power', 'type':'BaseProfile'},
        		{'bucket':'md5', 'region':'power', 'type':'BaseProfile'},
        	]
        }
        c['buckets'] = json.dumps(buckets)
        c['username'] = '刘小宪'
        c['power'] = json.dumps(MgDB.get_power())
        self.render('profile_power.htm', c=c)

class IncocoHandler(BaseHandler):
    def get(self, *args, **kwargs):
        c = self.make_tpl_para()
        self.render('incoco.htm', c=c)

class PowerHandler(BaseHandler):
    def post(self, *args, **kwargs):
        c = self.make_tpl_para()
        params = {
            'norm' : {'type':'s', 'required':1}
        }
        ret = self.pack_args(params)
        if not ret[0]:
            Common.jsErr(self, ret[1])

        # pprint.pprint(json.loads(ret[1]['norm']))
        MgDB.save_power(ret[1]['norm'])

        Common.jsSuc(self)


class MD5Handler(BaseHandler):
    def post(self, *args, **kwargs):
        c = self.make_tpl_para()
        params = {
            'norm' : {'type':'s', 'required':1}
        }
        ret = self.pack_args(params)
        if not ret[0]:
            Common.jsErr(self, ret[1])

        pprint.pprint(ret[1])
        MgDB.save_md5(ret[1]['norm'])

        Common.jsSuc(self)
