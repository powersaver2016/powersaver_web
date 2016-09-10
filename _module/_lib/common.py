#!/usr/bin/env python2.7
#-*- coding:utf8 -*-
#
# 2016-9-10 by shane

# Copyright 2016 powersaver

from calendar import monthrange
from _module import const
from _module._lib.smtpemail import SmtpEmail
import xml.etree.ElementTree as ET
from time import gmtime
import base64
import datetime
import hashlib
import math
import os

import random
import time
import urllib
import urllib2
import uuid
import re

"""
Common Library.

Authors: shane(lxxgreat@163.com)
Date:    2016/09/10
"""

class Common:
    @staticmethod
    def getVersion():
        return 'v0.0.1'

    @staticmethod
    def remove_none_value(query):
        for key in query.keys():
            if query[key] is None:
                del query[key]
        return query

    @staticmethod
    def jsOut(data,code=1,error=None):
        return dict(data=data, code=code, message=error)

    @staticmethod
    def jsSuc(handler,data='操作成功'):
        handler.write(Common.jsOut(data, 0))

    @staticmethod
    def jsErr(handler,info='操作失败',code=1):
        handler.write(Common.jsOut(None, code,info))

    @staticmethod
    def split_to_int(_str, _split):
        if not _str:
            return []
        strs = _str.split(_split)
        _arr = []
        for one in strs:
            try:
                _tmp = int(one)
            except Exception as e:
                continue
            _arr.append(_tmp)
        return _arr

    @staticmethod
    def format_to_string_arr(arr):
        if not arr:
            return []

        try:
            for one in arr:
                one = str(one)
            return arr
        except Exception as e:
            return []

    @staticmethod
    def filter_comma_ids(ids):
        id_arr = ids.split(',')
        _arr = []
        for id in id_arr:
            if id <> '':
                _arr.append(id)
        return ','.join(_arr)

    @staticmethod
    def add_comma_ids(ids_str):
        if ids_str.strip() == '':
            return ''
        return ',%s,' % ids_str.lstrip(',').rstrip(',')

    @staticmethod
    def get_file_size_str(size):
        sizeKB = int(size/1024)
        if sizeKB < 1024:
            return str(sizeKB)+' K'
        else:
            return str("%.2f" % (float(sizeKB)/float(1024))) + ' M'

    @staticmethod
    def _md5(arg):
        return hashlib.new("md5", arg).hexdigest()

    @staticmethod
    def md5(arg):
        return Common._md5(arg)

    @staticmethod
    def encryp_password(password):
        if not password:
            return False
        nike = base64.b16encode(password)
        password = Common._md5(nike)
        return {"nike": nike, "password": password}


    @staticmethod
    def str_to_strdate(dataStr, parse_str = const.Date_Format.DATETIME, format_str = const.Date_Format.DATETIME):
        if dataStr is None:
            return ''
        else:
            return Common.str_to_date(dataStr, parse_str).strftime(format_str)

    '''
    @param dataStr: 要转换的字符串
    @param format_str: 要转换的字符串所匹配的格式串
    @return: 返回时间
    '''
    @staticmethod
    def str_to_datetime(dataStr, parse_format = const.Date_Format.DATETIME):
        if dataStr is None:
            return None
        else:
            return datetime.datetime.strptime(dataStr, parse_format)

    '''
    @param ym: year month
    @param format_str: 要转换的字符串所匹配的格式串
    @return: 返回时间
    '''
    @staticmethod
    def get_month_range_secs(year_month, format_str="%Y%m"):
        sec = Common.str_to_seconds(year_month, format_str)
        start = Common.str_to_datetime(year_month, format_str)
        days = monthrange(start.year,start.month)[1]
        #print Common.seconds_to_str(sec)
        #print Common.seconds_to_str(sec+24*60*60*days)
        return [sec, sec+24*60*60*days]

    '''
    @param date: 要转换的日期
    @param format_str: 要转换的字符串所匹配的格式串
    @return: 返回时间
    Eg.
    str_to_strdate('2013-06-08', _Const._Date_Format_Str.DATE)
       返回：2013-06-08 00:00:00
    '''
    @staticmethod
    def datetime_to_str(date, format_str = const.Date_Format.DATETIME):
        if date is None:
            return ''
        else:
            return date.strftime(format_str)

    @staticmethod
    def str_to_html(_str):
        return _str.replace('&', '&amp;').replace(' ', '&nbsp;').replace('\\', '&#92;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&#39;').replace("/", '&#47;').replace('\r\n', '<br>').replace('\n', '<br>')

    #把字符串转成时间秒数形式
    @staticmethod
    def str_to_seconds(strTime, format_str=const.Date_Format.DATETIME):
        if strTime is None or strTime == '' or strTime <= '1970-01-01':
            return None
        dateTime = datetime.datetime.strptime(strTime, format_str)
        _time = time.mktime(dateTime.timetuple())
        return int(_time)

    #把时间秒数转成字符串形式
    @staticmethod
    def seconds_to_str(stamp, format_str = const.Date_Format.DATETIME):
        if stamp is None or stamp == 0:
            return None
        return time.strftime(format_str, time.localtime(float(stamp)))
    '''
            函数：格式化日期
            参数：date 以YYYY-MM-DD的日期字符串
            输出：
             前后两天：前天 昨天 今天 明天 后天
             一周内：显示星期
              一年内：显示MM-DD
              其他: 显示YYYY-MM-DD
    '''
    @staticmethod
    def formate_date(str_date):
        if str_date == None or str_date ==0:
            return '未来'
        t1 = datetime.datetime.strptime(str_date, "%Y-%m-%d")
        d1 = datetime.date(t1.year, t1.month, t1.day)
        today = datetime.date.today()
        days = (d1 - today).days
        if days == 0:
            return '今天';
        elif days == 1:
            return '明天';
        elif days == 2:
            return '后天';
        elif days == -1:
            return '昨日';
        elif days == -2:
            return '前天';
        elif days > 2 and days < 7:
            week = d1.weekday()
            if week == 0:
                return '周日';
            elif week == 1:
                return '周一';
            elif week == 2:
                return '周二';
            elif week == 3:
                return '周三';
            elif week == 4:
                return '周四';
            elif week == 5:
                return '周五';
            elif week == 6:
                return '周六';

        if today.year == d1.year:
            return d1.strftime("%m-%d");
        return str_date;

    @staticmethod
    def generate_token():
        return Common._md5(str(uuid.uuid1()))#base64.b64encode(uuid.uuid4().bytes + uuid.uuid4().bytes)

    @staticmethod
    def get_image_dir_index(uuid):
        if not str(uuid).isdigit():
            return None
        dir_index = int(int(uuid) / 10000) + 1
        return str(dir_index)


    @staticmethod
    def generate_short_uuid(length=4, lower=True, upper=True, number=True):
        lower_chars = [ "a", "b", "c", "d", "e", "f",
            "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s",
            "t", "u", "v", "w", "x", "y", "z"]
        upper_chars = ["A", "B", "C", "D", "E", "F", "G", "H", "I",
            "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V",
            "W", "X", "Y", "Z" ]
        number_chars = ["0", "1", "2", "3", "4", "5",
            "6", "7", "8", "9"]

        chars = []

        if lower:
            chars[0:0] = lower_chars
        if upper:
            chars[0:0] = upper_chars
        if number:
            chars[0:0] = number_chars

        short = []
        _uuid = str(uuid.uuid1()).replace("-", "")
        for i in range(length):
            short.append(chars[random.randint(0, len(chars)-1) ]);
        return ''.join(short)


    @staticmethod
    def get_current_datestr(formatStr = const.Date_Format.DATETIME):
        return time.strftime(formatStr,time.localtime(time.time()))

    @staticmethod
    def get_current_time():
        return int(time.time())

    @staticmethod
    def get_date(delta = 0, formatStr = const.Date_Format.DATE):
        now = datetime.datetime.now()
        delta = datetime.timedelta(delta)
        n_days = now + delta
        return n_days.strftime(formatStr)

    @staticmethod
    def get_delta_days(stime, etime):
        delta = etime-stime
        return  delta.days

    #formatStr = '%H:%M'
    @staticmethod
    def str_to_cur_daytime_sec(dateStr):
        dateStr = '2000-01-01 '+dateStr+':00'
        t1 = Common.str_to_seconds('2000-01-01 00:00:00')
        t2 = Common.str_to_seconds(dateStr)
        return t2-t1

    @staticmethod
    def sec_to_cur_daytime_str(sec):
        return Common.seconds_to_str(Common.get_0clock_time()+sec, '%H:%M')

    @staticmethod
    def get_0clock_time(seconds=0):
        if seconds== 0:
            seconds = Common.get_current_time()
        return Common.str_to_seconds(Common.seconds_to_str(seconds, const.Date_Format.DATE), const.Date_Format.DATE)

    @staticmethod
    def get_0clock_time_by_str(_str=''):
        if not _str or _str == '':
            _str = Common.get_current_datestr(const.Date_Format.DATE)
        return Common.str_to_seconds(_str, const.Date_Format.DATE)

    @staticmethod
    def isnum(value):
        if isinstance(value, int) or isinstance(value, float) or isinstance(value, long):
            return True
        return False
    @staticmethod
    def accessProcess(taskAccess):
        if taskAccess is None:
            return None
        ret = {}
        for item in taskAccess:
            if item['type'] not in ret:
                ret.setdefault(item['type'],[])
            ret[item['type']].append(item['tid'])
        return ret
    @staticmethod
    def permission_check(secret,taskAccess,tid):
        if secret is 0 or ( taskAccess is not None and tid in taskAccess):
            return True
        else:
            return False

    @staticmethod
    def secretProcess(src):
        if src is None or src == '':
            return None
        ret = {}
        for item in src:
            ret.setdefault(item['tid'],'')
            ret[item['tid']] = item['secret']
        return ret

    @staticmethod
    def get_current_weekday(date_str):
        weeks = {'0': '周天', '1': '周一', '2': '周二', '3': '周三', '4': '周四', '5': '周五', '6': '周六'}
        return weeks[time.strftime('%w', time.localtime(date_str))]
    @staticmethod
    def gen_order_id(predex=''):
        now = predex+datetime.datetime.utcnow().strftime('%y%m')
        timestamp = str(int(time.time())) + str(random.randint(10000,99999))
        return now+timestamp

    @staticmethod
    def gen_random_int(length=4):
        start = math.pow(10, length-1)
        end = math.pow(10, length) - 1
        return random.randint(start, end)

    @staticmethod
    def remove_file(file_uuid):
        dir_path = Common.get_image_path(file_uuid)
        file = dir_path+file_uuid+'.jpg'
        if os.path.isfile(file):
            os.remove(file)

        file_120 = dir_path+file_uuid+'_120.jpg'
        if os.path.isfile(file_120):
            os.remove(file_120)

        file_400 = dir_path+file_uuid+'_400.jpg'
        if os.path.isfile(file_400):
            os.remove(file_400)

    @staticmethod
    def remove_file_by_path(path):
        if os.path.isfile(path):
            os.remove(path)

    @staticmethod
    def _get_rad(d):
        return d * math.pi / 180.0
    # 获取距离，/km
    @staticmethod
    def get_distance(lat1, lng1, lat2, lng2):
        EARTH_RADIUS = 6378.137
        radLat1 = Common._get_rad(lat1)
        radLat2 = Common._get_rad(lat2)
        a = radLat1 - radLat2
        b = Common._get_rad(lng1) - Common._get_rad(lng2)

        s = 2 * math.asin(math.sqrt(math.pow(math.sin(a/2),2) + math.cos(radLat1)*math.cos(radLat2)*math.pow(math.sin(b/2),2)))
        s = s * EARTH_RADIUS
        s = round(s*10000)/10000
        return s

    ######################调试工具类##########################

    @staticmethod
    def print_row(row):
        for (k,v) in row.items():
            print "'%s': %s" % (k,v)
        return

    @staticmethod
    def print_rows(rows):
        i = 1
        for r in rows:
            print "row[%d]" % i
            for (k,v) in r.items():
                print "'%s': %s" % (k,v)
            print ""
        return

    @staticmethod
    def send_mail(sender, password, realname, array_to, subject, content, attachment = {}, replace_data = None, html_images = None):
        emailer = SmtpEmail('smtp.exmail.qq.com', sender, password) # smtp.exmail.qq.com
        emailer.subject(subject)
        emailer.sender(sender, realname)
        emailer.receivers(array_to)
        emailer.body_html(content, replace_data, html_images)
        for att in attachment:
            emailer.add_attach(attachment[att], att)

        return emailer.send()

    @staticmethod
    def arry_join(arr, seperator=','):
        _arr = []
        for one in arr:
            _arr.append(str(one))
        return seperator.join(_arr)

    @staticmethod
    def get_formate_size(bytes):
        if not bytes:
            return '0 KB'
        if bytes<1024:
            return str(bytes)+" B"
        elif bytes/1024.0<1024:
            return "%.2f KB" % (bytes/1024.0)
        else:
            return "%.2f M" % (bytes/1024.0/1024.0)


    @staticmethod
    def get_age(birthday):
        try:
            arr = birthday.split('-')
            d = int(arr[2])
            m = int(arr[1])
            y = int(arr[0])
            #get the current time in tuple format
            a = gmtime()
            #difference in day
            dd=a[2]-d
            #difference in month
            dm=a[1]-m
            #difference in year
            dy=a[0]-y
            #checks if difference in day is negative
            if dd<0:
                dd=dd+30
                dm=dm-1
                #checks if difference in month is negative when difference in day is also negative
                if dm<0:
                    dm=dm+12
                    dy=dy-1
            #checks if difference in month is negative when difference in day is positive
            if dm<0:
                dm=dm+12
                dy=dy-1
        except Exception as e:
            print e
            return None

        return (dy,dm,dd)


    @staticmethod
    def sendPostBodyRequst(url, post_body, second=3):
        return  urllib2.urlopen(url, post_body, timeout=second).read()

    #### 请求相关
    @staticmethod
    def sendPostRequest(url, param = {}):
        data = urllib.urlencode(param)
        request = urllib2.Request(url, data)
        response = urllib2.urlopen(request, timeout=3)
        ret = response.read()
        return ret

    @staticmethod
    def sendGetRequest(url, param = {}):
        data = urllib.urlencode(param)
        request = urllib2.Request(url + "?" + data)
        response = urllib2.urlopen(request, timeout=3)
        ret = response.read()
        return ret

    @staticmethod
    def sendPutRequest(url, param = {}):

        request = urllib2.Request(url, data=json.dumps(param))
        request.add_header('Content-Type', 'application/json')
        request.get_method = lambda: 'PUT'
        response = urllib2.urlopen(request, timeout=3)
        return response.read()

    @staticmethod
    def sendDeleteRequest(url):
        request = urllib2.Request(url)
        request.get_method = lambda: 'DELETE'
        response = urllib2.urlopen(request, timeout=3)
        return response.read()


    @staticmethod
    def sendRequest(method, url, param = {}):
        if method == 'POST':
            return Common.sendPostRequest(url, param)
        return Common.sendGetRequest(url, param)

    @staticmethod
    def arrayToXml(arr):
        """array转xml"""
        xml = ["<xml>"]
        for k, v in arr.iteritems():
            if v.isdigit():
                xml.append("<{0}>{1}</{0}>".format(k, v))
            else:
                xml.append("<{0}><![CDATA[{1}]]></{0}>".format(k, v))
        xml.append("</xml>")
        return "".join(xml)

    @staticmethod
    def xmlToArray(xml):
        """将xml转为array"""
        array_data = {}
        root = ET.fromstring(xml)
        for child in root:
            value = child.text
            array_data[child.tag] = value
        return array_data

    ########### 文件操作 ############
    @staticmethod
    def writeFile(filename, content = ""):
        f = open(filename, "w+")
        f.write(content.encode("utf-8"))
        f.close()

    # 系统自身
    @staticmethod
    def get_host_name():
        sys = os.name
        if sys == 'nt':
            hostname = os.getenv('computername').strip()
            return hostname
        elif sys == 'posix':
            host = os.popen('echo $HOSTNAME')
            try:
                hostname = host.read().strip()
                return hostname
            finally:
                host.close()
        else:
            return None

if __name__ == "__main__":
    #Common.get_month_range_secs("201405")
    #print Common.str_to_seconds("2014-11-03 10:30", const.Date_Format.DATETIME2)

    #print Common.seconds_to_str(1438369202, const.Date_Format.DATETIME)

    #print Common.encryp_password('')

    #print Common.seconds_to_str(Common.get_current_time(), '%Y%m%d%H%M%S')

    #ids_str= ',44,'
    #print ',%s,' % ids_str.lstrip(',').rstrip(',')

    #print Common.get_0clock_time()

    print Common.seconds_to_str(1438714802, const.Date_Format.DATETIME)

    arr = ["a", "b"]
    print arr.remove("a")
    print arr.append("a")
    print arr[:-3]
    print arr[-3:]
