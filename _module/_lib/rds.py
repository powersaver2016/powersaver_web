#!/usr/bin/env python2.7
#-*- coding:utf8 -*-
#
# 2016-9-10 by shane
# Copyright 2016 powersaver

import sys
import redis

from _module._lib.log import Log
import config_base


"""
Redis 工具类
"""

class Rds:

    _pool = None
    _db = None

    @classmethod
    def start(cls, host=None, port=None, password=None):

        host = config_base.store['redis']['host']
        port = config_base.store['redis']['port']
        password = config_base.store['redis']['pwd']

        #Log.info('Start connect to Redis server (%s:%s).', host, port)
        if cls._pool is None:
            try:
                cls._pool = redis.ConnectionPool(host=host, port=port, password=password)
                cls._db = redis.Redis(connection_pool=cls._pool)
                cls._db.get("test")
            except Exception, e:
                Log.critical('Redis(%s:%s) connect failed. \n %s', host, port, str(e))
                sys.exit()
            Log.critical('Redis(%s:%s) Ok.', host, port)

    @classmethod
    def get(cls, key):
        val = None
        try:
            val = cls._db.get(key)
        except Exception, e:
            Log.warning('Redis get %s failed(%s)', key, str(e))
            return False
        return val

    @classmethod
    def set(cls, key, val, time_out = 0):
        ret = True
        try:
            cls._db.set(key, val) # TODO time_out
        except Exception, e:
            Log.warning('Redis set %s failed(%s)', key, str(e))
            return False
        return ret

    @classmethod
    def delete(cls, key):
        try:
            cls._db.delete(key)
        except Exception, e:
            Log.warning('Redis delete %s failed(%s)', key, str(e))
            return False

    @classmethod
    def get_size(cls):
        ret = 0
        try:
            ret = cls._db.dbsize()
        except Exception, e:
            Log.warning('Redis get size failed(%s)',str(e))
            return False
        return ret

    @classmethod
    def is_key_exist(cls, key):
        ret = False
        try:
            ret = cls._db.exists(key)
        except Exception, e:
            Log.warning('Redis is key exist %s failed(%s)',key, str(e))
            return False
        return ret

    @classmethod
    def get_all_keys(cls):
        ret = []
        try:
            ret = cls._db.keys()
        except Exception, e:
            Log.warning('Redis get all keys failed(%s)',str(e))
            return False
        return ret

    @classmethod
    def push(cls, key, value):
        ret = False
        try:
            ret = cls._db.rpush(key, value)
        except Exception, e:
            Log.warning('Redis push key %s failed(%s)',key, str(e))
            return False
        return ret

    @classmethod
    def pop(cls, key):
        ret = False
        try:
            ret = cls._db.lpop(key)
        except Exception, e:
            Log.warning('Redis pop key %s failed(%s)',key, str(e))
            return False
        return ret

    @classmethod
    def publish(cls, key, value):
        ret = False
        try:
            ret = cls._db.publish(key, value)
        except Exception, e:
            Log.warning('Redis publish key %s failed(%s)',key, str(e))
            return False
        return ret

    @classmethod
    def get_list_top(cls, key, size=1):
        ret = False
        try:
            ret = cls._db.lrange(key, 0, size-1)
        except Exception, e:
            Log.warning('Redis pop key %s failed(%s)',key, str(e))
            return False
        return ret