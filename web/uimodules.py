#!/usr/bin/env python2.7
#-*- coding:utf8 -*-
#
# 2016-09-10 by shane
from math import ceil
import tornado.web

class HeaderBlock(tornado.web.UIModule):
    # cur_nav_1 当前选中的一级菜单 cur_nav_2 当前选中的二级菜单
    def render(self, c, cur_nav_1='', cur_nav_2=''):
        if cur_nav_1=='':
            cur_nav_1 = 'nav_1'
        return self.render_string('uimodule/header.htm', c=c, cur_nav_1=cur_nav_1, cur_nav_2=cur_nav_2)

class FooterBlock(tornado.web.UIModule):
    def render(self):
        return self.render_string('uimodule/footer.htm')

class LeftBarBlock(tornado.web.UIModule):
    # cur_nav 当前选中的一级菜单
    def render(self, c, page, cur_nav):
        return self.render_string('uimodule/left_bar.htm', c=c, page=page, cur_nav=cur_nav)

class PagerBlock(tornado.web.UIModule):
    def render(self, total, current_page, page_size=10, url="/", type=2):
        if total==0:
            return ''
        page_sum = int(ceil(total/float(page_size)))
        _current_page = current_page
        if _current_page < 1:
            _current_page = 1
        elif _current_page > page_sum:
            _current_page = page_sum
        return self.render_string("uimodule/pager.htm", page_sum=page_sum, type=type, total=total, current_page=_current_page, page_size=page_size, url=url)

