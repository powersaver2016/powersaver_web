#!/usr/bin/env python2.7
#-*- coding:utf8 -*-
#
# author: shane

import tornado
import pprint
import json

from _module._lib.common import Common
from web._base_ import BaseHandler


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
        self.render('profile_power.htm', c=c)