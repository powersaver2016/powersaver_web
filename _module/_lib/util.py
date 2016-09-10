#!/usr/bin/env python2.7
#-*- coding:utf8 -*-
#
# 2016-9-10 by shane
# Copyright 2016 powersaver

import os
import sys
import urllib
import urllib2
import json
import time
import random
import commands

"""
系统工具类
"""

class Util(object):
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

    @staticmethod
    def sendPostRequest(url, param = {}):
        data = urllib.urlencode(param)
        request = urllib2.Request(url, data)
        response = urllib2.urlopen(request)
        ret = response.read()
        return ret

    @staticmethod
    def sendGetRequest(url, param = {}):
        data = urllib.urlencode(param)
        request = urllib2.Request(url + "?" + data)
        response = urllib2.urlopen(request)
        ret = response.read()
        return ret

    @staticmethod
    def writeFile(filename, content = ""):
        f = open(filename, "w+")
        f.write(content.encode("utf-8"))
        f.close()

    @staticmethod
    def validateFtp(url):
        if url.find("ftp://") != 0:
            return False
        else:
            return True

    @staticmethod
    def validateSuffix(filename, suffixs):
        try:
            suffix = filename.split(".").pop()
            if suffix in suffixs:
                return True
            else:
                return False
        except:
            print "Invalid suffix of " + filename + "\n"
            return False

    @staticmethod
    def validateFileType(filepath):
        tmp_file_path = ""
        is_local = False
        if not Util.validateFtp(filepath):
            is_local = True
            if not os.path.isfile(filepath):
                return False
            tmp_file_path = filepath
        else:
            tmp_dir_name = "%d%d" % (int(time.time()), random.randint(0,999))
            tmp_dir_path = os.path.dirname(__file__)+"/"+tmp_dir_name+"/"
            if not os.path.isdir(tmp_dir_path):
                os.mkdir(tmp_dir_path)

            #print "wget -P %s %s" % (tmp_dir_path, filepath)
            cmd = "wget -q %s -P %s" % (filepath, tmp_dir_path)
            if os.system(cmd) <> 0:
                os.system("rm -rf %s" % tmp_dir_path)
                print "[Error] - Wget Error - file not exist. Commond is : \n %s" % cmd
                return False

            file_name = filepath.split('/')[-1]
            tmp_file_path = tmp_dir_path + file_name

        # 判断格式

        cmd = "wc -l %s" % tmp_file_path
        result= commands.getstatusoutput(cmd)[1]
        if int(result.split()[0]) < 1000:
            print '[Warning] - Data num is too small.'
            return False
        try:
            FILE = open(tmp_file_path, 'r')
            head = FILE.readline().strip()
        except Exception as e:
            if not is_local:
                os.system("rm -rf %s" % tmp_dir_path)

        if not is_local:
            os.system("rm -rf %s" % tmp_dir_path)

        if not head or head == '':
            print '[Error] - Data error. file is empty'
            return False
        if len(head.split('\t')) > 1:
            #print "System recognize this data as Final data."
            return 'final'
        elif len(head.split(' ')) > 1:
            #print "System recognize this data as Trans data."
            return 'trans'
