#!/usr/bin/env python2.7
#-*- coding=utf8 -*-
################################################################################
#
# Copyright (c) 2016 powersaver, Inc. All Rights Reserved
#
################################################################################
class Operation(object):

    DEL = -1
    UPDATE = 0
    ADD = 1

'''
    DB 常量
'''
class DB(object):

    SORT_ASC = 'ASC'
    SORT_DESC = 'DESC'

    OP_LIKE = 'like' #小写
    OP_IN = 'in'#小写
    OP_NOTIN = 'not in'#小写
    OP_GT = '>'
    OP_LT = '<'
    OP_GTEQ = '>='
    OP_LTEQ = '<='
    OP_NOTEQ = '<>'
    OP_AND = '&'

class Date_Format(object):
    DATE = '%Y-%m-%d'
    DATE2 = '%Y/%m/%d'
    TIME = '%H:%M:%S'
    DATETIME = '%Y-%m-%d %H:%M:%S'
    DATETIME2 = '%Y-%m-%d %H:%M'
    DATETIME3 = '%Y%m%d%H%M%S'
    DATETIME4 = '%Y-%m-%d %H:%M'


class Common(object):

    SOURCE_TYPE_CUSTOM = 1 # 商户添加
    SOURCE_TYPE_OPERATE = 2 # 运维添加
    SOURCE_TYPE_CRAWLED = 3 # 爬取
    SOURCE_TYPE_UGC = 4 # UGC

    STATUS_DELETE = -1
    STATUS_VALID = 1


'''
   用户相关常量
'''
class User(object):

    STATUS_UNVERIFY = -1 #未验证
    #STAT_CELLPHONE_UNVERIFY = 0 #手机号未验证
    STATUS_EMAIL_UNVERIFY = 1 #未激活
    STATUS_NORMAL = 2 #状态正常
    STATUS_FORBIDDEN = 3 #封禁
    STATUS_DESTROYED = 4 #删除

    REG_PLAT_WEB = 'Web'  # Web平台注册
    REG_PLAT_IOS = 'IOS' # IOS平台注册
    REG_PLAT_AND = 'Android' # Android平台注册

    SEX_UNKOWN = -1
    SEX_WOMAN = 0
    SEX_MAN = 1

    SOURCE_NORMAL = 1
    SOURCE_CLAIM = 2
    SOURCE_FACEBOOK = 3
    SOURCE_MOBILE_IMPORT = 4
    SOURCE_WEIXIN = 5
    SOURCE_QQ = 6
    SOURCE_SINA_WEIBO = 7




user = {

}
