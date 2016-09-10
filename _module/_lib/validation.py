#!/usr/bin/env python2.7
#-*- coding:utf8 -*-
#
# 2016-09-10 by shane
# Copyright 2016 powersaver

import time
import re

"""
Request请求参数验证工具类
"""

class Validation:

    Str = 0
    Int = 1
    Float = 2
    Bool = 3
    Date = 4
    Timestamp = 5

    RE_PHONE = '^[1][358]\d{9}$'

    required = False
    has_def = 0
    def_v = None

    _type = 0
    _max_len = None
    _min_len = None
    _max = None
    _min = None
    _empty = True
    _pattern = None
    _check = False

    _flag = True
    _p = None

    def __init__(self):
        pass

    def __num(self, d, f = 0):
        try:
            return int(d)
        except:
            return f

    def __bool(self, d, f = False):
        try:
            return bool(d)
        except:
            return f

    def setting(self, kwarg):
        """初始化Validation并验证是否合法"""
        if isinstance(kwarg, dict) == False:
            return False

        if kwarg.has_key('type') == False:
            return False

        self._type = self.__num(kwarg['type'])

        if kwarg.has_key('required'):
            self.required = self.__bool(kwarg['required'])

        if kwarg.has_key('default'):
            self.has_def = 1
            self.def_v = kwarg['default']

        if kwarg.has_key('check'):
            self._check = self.__bool(kwarg['check'])

        if kwarg.has_key('empty'):
            self._empty = self.__bool(kwarg['empty'], True)

        if kwarg.has_key('max_len'):
            self._max_len = self.__num(kwarg['max_len'], None)

        if kwarg.has_key('min_len'):
            self._min_len = self.__num(kwarg['min_len'], None)

        if kwarg.has_key('max'):
            self._max = self.__num(kwarg['max'], None)

        if kwarg.has_key('min'):
            self._min = self.__num(kwarg['min'], None)

        if kwarg.has_key('pattern'):
            self._pattern = str(kwarg['pattern'])

        if self._pattern is not None and len(self._pattern) > 0:
            try:
                self._p = re.compile(self._pattern, re.S)
            except:
                self._p = None
        return True

    def transform(self, data):
        """转换数据为所要求的输入类型"""
        if self._type == self.Int:
            try:
                return int(data)
            except:
                self._flag = False
                if self.has_def == 1:
                    return self.def_v
                return 0
        elif self._type == self.Float:
            try:
                return float(data)
            except:
                self._flag = False
                if self.has_def == 1:
                    return self.def_v
                return 0.0
        elif self._type == self.Bool:
            try:
                return bool(data)
            except:
                self._flag = False
                if self.has_def == 1:
                    return self.def_v
                return False
        elif self._type == self.Date:
            if data is None or len(str(data)) <= 0:
                return 0
            try:
                return int(time.mktime(time.strptime(data, '%Y-%m-%d')))
            except:
                self._flag = False
                return int(time.mktime(time.strptime(time.strftime('%Y-%m-%d', time.localtime(time.time())), '%Y-%m-%d')))
        elif self._type == self.Timestamp:
            if data is None or len(str(data)) <= 0:
                if self.def_v:
                    return self.def_v
                return 0
            try:
                return int(time.mktime(time.strptime(data, '%Y-%m-%d %H:%M:%S')))
            except:
                self._flag = False
                return int(time.time())
        else:
            try:
                if data is None:
                    if self.has_def == 1:
                        return self.def_v
                    return ''
                return str(data)
            except:
                self._flag = False
                return ''

    def valid(self, data):
        """根据配置验证输入是否合法"""
        d = self.transform(data)

        if self._check == True and self._flag == False:
            return False

        if self._type == self.Int or self._type == self.Float:
            if self._max is not None and d > self._max:
                return False

            if self._min is not None and d < self._min:
                return False
        elif self._type != self.Bool and self._type != self.Date \
            and self._type != self.Timestamp:
            if d is None:
                n = 0
            else:
                n = len(d)
            if self._empty == False and n <= 0:
                return False

            if self._max_len is not None and n > self._max_len:
                return False

            if self._min_len is not None and n < self._min_len:
                return False

        if self._p is not None:
            try:
                if self._p.match(d) is None:
                    return False
            except:
                return False
        return True

    @staticmethod
    def match_reg(pattern, val):
        if not re.match(pattern, val):
            return False
        return True
