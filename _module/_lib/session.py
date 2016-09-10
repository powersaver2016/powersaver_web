#!/usr/bin/env python2.7
#-*- coding:utf8 -*-
#
# 2016-9-10 by shane
# Copyright 2016 powersaver

from _module._lib.mem import Mem
import base64
import hashlib
import tornado.escape
import uuid

"""
Session 工具类
"""

class Session:
    #Session过期时间（单位：秒）
    _time_out = None
    _request = None
    _session_id = None

    def __init__(self, request, time_out = 0, from_url=False):
        self._request = request
        self._time_out = time_out
        self._session_id = None
        if not from_url:
            self._session_id = self._request.get_secure_cookie("SESSIONID", None)
        uri_session_id = self._request.get_argument("SESSIONID", None)
        if uri_session_id is not None and uri_session_id.strip() <> '' \
            and len(uri_session_id.strip()) > 0:
            self._session_id = tornado.escape.native_str(uri_session_id)
            self._request.set_secure_cookie("SESSIONID", self._session_id, None)

        if self._session_id is None:
            self._session_id = self._generate_session_id()
            self._request.set_secure_cookie("SESSIONID", self._session_id, None)

    def get(self, key):
        val = Mem.get(self._session_id)
        if val is not None:
            Mem.set(self._session_id, val, self._time_out)
            if val.has_key(key):
                return val[key]
        return None

    def set(self, key, value):
        ret = False
        val = Mem.get(self._session_id)
        if val is None or isinstance(val, dict) == False:
            val = dict()
        val[key] = value
        ret = Mem.set(self._session_id, val, self._time_out)
        return ret

    def destroy(self):
        Mem.delete(self._session_id)

    def _generate_session_id(self):
        return hashlib.new("md5", base64.b64encode(uuid.uuid4().bytes + uuid.uuid4().bytes)).hexdigest()

    def get_sessionid(self):
        return self._session_id
