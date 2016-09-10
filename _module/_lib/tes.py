#!/usr/bin/env python2.7
#-*- coding:utf8 -*-
#
# 2016-9-10 by shane
# Copyright 2016 powersaver

import base64
import random

"""
Func: Coco Encryption Standard 自定义加密标准

Eg.
   if __name__ == '__main__':

      a = TES().encode(",./&8d")
      print a
      print "*" * 80
      b = TES().decode(a)
      print b

   Output:

   3LC4DvXJjKhk
   ********************************************************************************
   ,./&8d

"""
class TES(object):

    def __init__(self, key=None):
        self._key = key

    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

    positions = [
        [0, 2, 4, 5],
        [0, 2, 5, 6],
        [1, 2, 5, 7],
        [3, 4, 6, 8],
        [0, 2, 3, 6],
        [0, 1, 2, 6],
        [1, 2, 4, 7],
        [2, 5, 6, 8]
    ]

    new_posionts = [
        [0, 3, 6, 8],
        [0, 3, 7, 9],
        [1, 3, 7, 10],
        [3, 5, 8, 11],
        [0, 3, 5, 9],
        [0, 2, 4, 9],
        [1, 3, 6, 10],
        [2, 6, 8, 11]
    ]

    def encode(self, s):
        # 对原信息进行base64加密
        raw = list(base64.b64encode(s))
        # 随机获取需要变动的位置索引数组
        index = random.randint(0, 7)
        ps = self.positions[index]

        # 在相应位置前面补随机字符串
        result = ''
        i = 0
        for c in raw:
            if i in ps:
                result = result + list(self.chars)[random.randint(0, 25)]
            result = result + c
            i = i+1

        return str(index)+result


    def decode(self, s):
        try:
            if not s or len(s) < 2:
                return None
            # 解析获取位置索引
            index = int(s[0])
            ps = self.new_posionts[index]
            # 获取带混淆的加密字段
            raw = s[1:]
            result = ''
            raw_arr = list(raw)
            for i in range(0, len(raw_arr)):
                if i not in ps:
                    result = result + raw_arr[i]
            return base64.b64decode(result)
        except Exception as e:
            return None



if __name__ == '__main__':
    """
    a = TES().encode("15911025590")
    print a
    print "*" * 80
    b = TES().decode(a)
    print b
    """
    #print TES().decode("2dGHvViYamFzuMTIz")

    print TES().encode("test")
    print TES().encode("test1234")