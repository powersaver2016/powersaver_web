#!/usr/bin/env python2.7
#-*- coding:utf8 -*-
################################################################################
#
# Copyright (c) 2016 powersaver
#
################################################################################


from _module._lib.log import Log
import pymongo
import sys

"""
MongoDB 工具类

Authors: shane(lxxgreat@163.com)
Date:    2016/09/10
"""
class MgDB:

    _client = None
    _db = None
    _port = None
    _host = None

    _db_name = 'powersaver'

    @classmethod
    def start(cls, host="127.0.0.1", port=27017):
        cls._host = host
        cls._port = port
        #Log.info('Start connect to MongoDB server (%s:%s).', host, port)
        if cls._client is None:
            try:
                cls._client = pymongo.MongoClient(host,port)
            except Exception, e:
                Log.critical('Mongodb(%s:%s) connect failed. \n %s', host, port, str(e))
                sys.exit()
            Log.info('Mongodb(%s:%s) Ok.', host, port)

    @classmethod
    def get_client(cls):
        if cls._client is None:
            cls._client = pymongo.MongoClient(cls._host, cls._port)
        return cls._client

    @classmethod
    def get_db(cls):
        if cls._client is None:
            cls._client = pymongo.MongoClient(cls._host, cls._port)

        if cls._db is None:
            cls._db = cls._client[cls._db_name]

        return cls._db

    @classmethod
    def insert_common(cls):
        db = cls.get_db()
        posts = db.common
        common = {"common":"result.....123"}
        post_id = posts.insert_one(common).inserted_id
        Log.info('insert_common(%s) Ok.', post_id)
        return post_id
