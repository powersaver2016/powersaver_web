#!/usr/bin/env python2.7
#-*- coding:utf8 -*-
#
# author: shane

import tornado
import pprint

from _module._lib.common import Common
from web._base_ import BaseHandler


class IndexHandler(BaseHandler):
    def get(self, *args, **kwargs):
        c = self.make_tpl_para()
        self.render('index.htm', c=c)


class LoginHandler(BaseHandler):
    def get(self, *args, **kwargs):
        pass

    def post(self, *args, **kwargs):
        pass


class LogoutHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self._session.destroy()
        self.redirect(self.get_login_url())


class PageNotFoundHandler(BaseHandler):
    def get(self, *args, **kwargs):
        self.render('404.htm')


