#!/usr/bin/env python2.7
#-*- coding:utf8 -*-
#
# 2016-9-10 by shane
# Copyright 2016 powersaver

import string

from _module._base_m_ import BaseModel


class DBUtilModel(BaseModel):

    def __init__(self, uid = None):
        pass

    def get_table_columns(self, table_name, db_name):
        sql = "select COLUMN_NAME from information_schema.COLUMNS " \
                " where table_name = '%s' and table_schema = '%s'" \
                % (table_name, db_name)
        list =  self.get_rows(sql)
        fields = []
        for l in list:
            fields.append(l['COLUMN_NAME'])
        return fields

    """
    tmp = {
            "name":one,
            "type":"varchar(100)",
            "required":1,
            "default":""
        }
    """
    def add_table_columns(self, table_name, columns):
        for one in columns:
            sql = "ALTER TABLE `%s` ADD COLUMN `%s` %s " % (table_name, one['name'], one['type'])
            if one['required'] <> 0:
                sql = sql+" NOT NULL "

            sql = sql+" DEFAULT '%s' " % one['default']
            ret = self.execute(sql)[0]
            ret = True
            if ret:
                print sql + "(Success)"
            else:
                print sql + "(Failed)"
        return True

    def replace_table_data(self, table_name, columns, values):

        _cs = []
        for o in columns:
            _cs.append('`'+str(o).strip()+'`')

        _vs = []
        for o in values:
            if isinstance(o, int):
                _vs.append(str(o))
            else:
                _vs.append("'"+ self.escape_string(str(o).strip())+"'")
        # 这个地方有个BUG，list拼接
        #print _cs
        #print string.join(_cs, ',')
        #print _vs
        #print string.join(_vs, ',')

        #dict(zip(_cs,_vs))

        sql = "REPLACE INTO %s(%s) VALUES(%s)" % (table_name, string.join(_cs, ','), string.join(_vs, ','))
        ret = self.execute(sql)[0]
        ret = True
        if ret:
            print sql + "(Success)"
        else:
            print sql + "(Failed)"
        return True

    """

    columns_str = ''
        for o in columns:
            columns_str = columns_str+'`'+str(o)+'`,'
        values_str = ''
        for o in values:
            if isinstance(o, int):
                values_str = values_str+str(o)+','
            else:
                values_str = values_str+"'"+ self.escape_string(str(o))+"'"+','
        sql = "REPLACE INTO %s(%s) VALUES(%s)" % (table_name, columns_str[:-1], values_str[0:-1])
        ret = self.execute(sql)[0]
        ret = True
        if ret:
            print sql + "(Success)"
        else:
            print sql + "(Failed)"
        return True

    """
