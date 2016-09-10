#!/usr/bin/env python2.7
#-*- coding:utf8 -*-
#
# 2016-9-10 by shane

# Copyright 2016 powersaver

import sys
import time
import logging

"""
日志工具类
"""
class Log:

    NONE = 100
    DEBUG = logging.DEBUG
    INFO = logging.INFO
    WARNING = logging.WARNING
    ERROR = logging.ERROR
    CRITICAL = logging.CRITICAL
    ALL = 0

    __logger = None
    __pathname = None
    __date = None
    __level = None
    __file_handler = None
    __formatter = logging.Formatter('%(levelname)s[%(asctime)s]%(message)s')

    @classmethod
    def start(cls, pathname, level = WARNING, put_tty = True):
        cls.__pathname = pathname
        try:
            cls.__level = int(level)
        except:
            cls.__level = Log.WARNING

        try:
            cls.__logger = logging.getLogger()
            cls.__logger.setLevel(cls.__level)
            if put_tty == True:
                stream_handler = logging.StreamHandler(sys.stdout)
                stream_handler.setFormatter(cls.__formatter)
                cls.__logger.addHandler(stream_handler)
        except:
            cls.__logger = None
        Log.__open()

    @classmethod
    def __open(cls):
        if cls.__logger is None:
            return

        date = time.strftime('%Y-%m-%d')
        if cls.__date is None or date != cls.__date or cls.__file_handler is None:
            try:
                if cls.__file_handler is not None:
                    cls.__logger.removeHandler(cls.__file_handler)
                    cls.__file_handler.close()
                    cls.__file_handler = None

                cls.__date = date
                #filename = "%s/%s.log" % (cls.__pathname, cls.__date)
                filename = "%s/%s.log" % (cls.__pathname, date)
                cls.__file_handler = logging.FileHandler(filename)
                cls.__file_handler.setFormatter(cls.__formatter)
                cls.__logger.addHandler(cls.__file_handler)
            except:
                try:
                    if cls.__file_handler is not None:
                        cls.__logger.removeHandler(cls.__file_handler)
                        cls.__file_handler.close()
                        cls.__file_handler = None
                except:
                    cls.__file_handler = None

    @classmethod
    def __write(cls, level, message, *args, **kwargs):
        if level < cls.__level or cls.__level == Log.NONE or message is None or cls.__logger is None:
            return

        Log.__open()
        try:
            exc_info = 'Trace-exc'
            try:
                if sys.exc_info()[2] is not None:
                    f = sys._getframe().f_back
                    f1 = f.f_back
                    while f1 is not None:
                        f = f1
                        exc_info += '\n(%s:%s:%s)'% (f.f_code.co_filename, f.f_code.co_name, f.f_lineno)
                        f1 = f.f_back
                    sys.exc_clear()
            except:
                pass
            cls.__logger.log(level, message, *args, **kwargs)
            if exc_info != 'Trace-exc':
                cls.__logger.log(level, exc_info)
        except Exception as e:
            print "#Logger Error: %s" % str(e)

    @staticmethod
    def debug(message, *args, **kwargs):
        Log.__write(Log.DEBUG, message, *args, **kwargs)

    @staticmethod
    def info(message, *args, **kwargs):
        Log.__write(Log.INFO, message, *args, **kwargs)

    @staticmethod
    def warning(message, *args, **kwargs):
        Log.__write(Log.WARNING, message, *args, **kwargs)

    @staticmethod
    def error(message, *args, **kwargs):
        Log.__write(Log.ERROR, message, *args, **kwargs)

    @staticmethod
    def critical(message, *args, **kwargs):
        Log.__write(Log.CRITICAL, message, *args, **kwargs)
