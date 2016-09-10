#!/usr/bin/env python2.7
#-*- coding:utf8 -*-
# author: shane

# Copyright 2016 powersaver
import os
import sys

import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.locale


from _module._lib.log import Log
import config_base
import web


urls = [
    (r"/login", 'web.index.LoginHandler'),
    (r"/logout", 'web.index.LogoutHandler'),
    (r"/", 'web.index.IndexHandler'),

    ('.*', 'web.index.PageNotFoundHandler'),
]


application = tornado.web.Application(
    urls,
    cookie_secret = "61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o/Vo=",
    login_url = "/login",
    template_path = config_base.setting['template'],
    static_path = config_base.setting['static'],
    debug = True,
    xsrf_cookies = True,
    autoescape = None,
    # ui_modules = web.uimodules,
)


from tornado.options import define, options
define("port", default=int(config_base.listen_port), help="run on the given port", type=int)

if __name__ == "__main__":
    reload(sys)
    sys.setdefaultencoding("utf-8")

    Log.start(config_base.log['path'], config_base.log['level'])

    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(application, xheaders = True)
    http_server.listen(options.port)
    tornado.autoreload.start(tornado.ioloop.IOLoop.instance(), 500)
    tornado.ioloop.IOLoop.instance().start()
