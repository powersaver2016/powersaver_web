#-*- coding:utf8 -*-

import os

from _module._lib.log import Log

ROOT_PATH = os.path.dirname(__file__)
RESOURCE_PATH = os.path.dirname(__file__)+'/'

setting = {
    'static': os.path.join(ROOT_PATH, 'static'),
    'template': os.path.join(ROOT_PATH, 'template'),
    'uploads': os.path.join(RESOURCE_PATH, 'uploads'),
    'upload_image': os.path.join(RESOURCE_PATH, 'uploads/image/'),
}

sessoin_except_urls = [
    ""
]

log = {
    'level' : Log.DEBUG,
    'path' : os.path.join(os.path.dirname(__file__), 'logs/web'),
}

listen_port = 1987
session_user = "user_web"

store = {
    'db_master' : {
        'host': 'rm-bp189kk1uam8p9kne.mysql.rds.aliyuncs.com',
        'port': 3306,
        'name': 'mw_test',  # database
        'uname': 'mw',
        'pwd': '92THGl1HSljQ34',
        'time_out': 3,
        'debug': True
    },
    # 'db_slaves' : [{
    #     'host': '127.0.0.1',
    #     'port': 3306,
    #     'name': 'coco',
    #     'uname': 'coco',
    #     'pwd': 'coco123456',
    #     'time_out': 3,
    #     'debug': True
    # }],
    # 'redis' : {
    #     'host': '127.0.0.1',
    #     'port': 6379,
    #     'pwd' : 'KJFlL82SDFD'
    # },
    # 用户登录存储的MC
    'memcached_user': {
        'host': '127.0.0.1', # 测试机部署的MC
        'port': 11211,
        'user' : None,
        'pwd' : None,
        'session' : {
            'time_out': 90000, #1 * 30 * 60
            'app_time_out': 1728000, #20d
            'app_auth_key': 'coco@app'
        }
    },
    'mongodb' : {
        'host': '127.0.0.1',
        'port': 27017
    },
}

# 线下配置
domain = {
    'static' : '/static',
    'static_public' : 'http://coco-static.91yummy.com/public', # 公共静态文件路径
    'image' : 'http://coco-image.91yummy.com',
}

""" 线上配置
domain = {
    'static' : 'http://coco-static.91yummy.com',
    'resource' : 'http://coco-resource.91yummy.com'
}
"""

api = {
    "host" : 'http://127.0.0.1:5656',
    "items" : {

    }
}

aly = {
    "user": {
        "coco_platform": {
            "accessKeyId": "vxvpTByNKtDSwng9",
            "secretAccessKey": "7bezv4GTz1MvFY8BxADUR1dtAmFwoU"
        }
    },
    "oss" : {
        "endpoint" : 'http://oss-cn-hangzhou.aliyuncs.com',
        "region" : 'oss-cn-hangzhou',
        "bucket": {
            "image": 'coco-image-1',
            "video": 'coco-video-1',
            "other": 'coco-other-1'
        },
        "bucket_url" : {
            "image": 'http://coco-image.91yummy.com',
            "video": 'http://coco-video.91yummy.com',
            "other": 'http://coco-image.91yummy.com'
        }
    }

}

