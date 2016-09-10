#!/usr/bin/env python2.7
#-*- coding:utf8 -*-
#
# 2016-09-10 by shane
# Copyright 2016 powersaver

"""
Memcached 工具类
"""
import sys
import bmemcached

from _module._lib.log import Log


class Mem:
    __mc_conn_str = None
    __mc_conn = None

    @classmethod
    def start(cls, host, port, user=None, pwd=None):
        if cls.__mc_conn is None:
            cls.__mc_conn_str = "%s:%s" % (host, port)
            try:
                cls.__mc_conn = bmemcached.Client((cls.__mc_conn_str), user, pwd)
                cls.__mc_conn.get("powersaver")
            except Exception, e:
                print e
                Log.critical('memcache connection error(%s)(%s)', cls.__mc_conn_str, str(e))
                sys.exit()
            Log.critical('Memcatched(%s:%s) Ok.', host, port)

    @classmethod
    def __reconnect(cls):
        if cls.__mc_conn is not None:
            try:
                cls.__mc_conn.disconnect_all()
            except Exception, e:
                Log.warning('memcache disconnect(%s)', str(e))
            cls.__mc_conn = None
        try:
            cls.__mc_conn = bmemcached.Client((cls.__mc_conn_str), user, pwd)
        except Exception, e:
            cls.__mc_conn = None
            Log.critical('memcache re_connection error(%s)(%s)', cls.__mc_conn_str, str(e))

    @classmethod
    def get(cls, key):
        val = None
        try:
            val = cls.__mc_conn.get(key)
        except Exception, e:
            Log.warning('memcache get %s failed(%s)', key, str(e))
            cls.__reconnect()
            try:
                val = cls.__mc_conn.get(key)
            except Exception, e1:
                val = None
                Log.warning('memcache re-get %s failed(%s)', key, str(e1))
        return val

    @classmethod
    def set(cls, key, val, time_out = 0):
        ret = True
        try:
            cls.__mc_conn.set(key, val, time_out)
        except Exception, e:
            Log.warning('memcache set %s failed(%s)', key, str(e))
            cls.__reconnect()
            try:
                cls.__mc_conn.set(key, val, time_out)
            except Exception, e1:
                ret = False
                Log.warning('memcache re-set %s failed(%s)', key, str(e1))
        return ret

    @classmethod
    def delete(cls, key):
        try:
            cls.__mc_conn.delete(key)
        except Exception, e:
            Log.warning('memcache delete %s failed(%s)', key, str(e))
            cls.__reconnect()
            try:
                cls.__mc_conn.delete(key)
            except Exception, e1:
                Log.warning('memcache re-delete %s failed(%s)', key, str(e1))
