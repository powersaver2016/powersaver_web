#-*- coding:utf8 -*-

'''
Created on 2013-6-8

@author: shane

Notes:

Email工具类，功能：邮件发送.(待补充)

Example:

    if __name__ == '__main__':

        sender = '445625198@qq.com'
        receivers = ["lxxgreat@163.com"]
        subject = '主题'
        plain_text = '我测试一下'
        realname = '刘小宪'

        html_text = """
            <html>
              <head></head>
              <body>
                <B>我测试一下</B>
                <p>Hi!<br>
                   How are you?<br>
                   Here is the <a href="http://www.python.org">link</a> you wanted.
                   <br><img src="cid:image1"><br>
                </p>
              </body>
            </html>
            """
        attachments = ['test.tar.gz','测试.jpg']
        html_images = {'image1':'test.jpg'}

        host = 'smtp.163.com' #'smtp.163.com'
        username = 'XXX@163.com'
        password = 'XXX'

        emailer = SmtpEmail(host, username, password)

        emailer.sender(sender,'刘')
        emailer.receivers(receivers)
        emailer.subject(subject)
        emailer.body_text(plain_text)
        emailer.body_html(html_text, html_images)
        emailer.add_attach('test.tar.gz','新的.tar.gz')
        emailer.add_attach('测试.jpg')
        emailer.send()

'''
from email.header import Header
import email
import os
import smtplib
import sys


class SmtpEmail:

    def __init__(self, smtp_host, smtp_user, smtp_psd, smtp_port = 25) :
        self.smtp_host = smtp_host
        self.smtp_user = smtp_user
        self.smtp_psd = smtp_psd
        self.smtp_port = smtp_port
        self.mail = email.MIMEMultipart.MIMEMultipart('related')
        self.alter = email.MIMEMultipart.MIMEMultipart('alternative')
        self.mail.attach(self.alter)
        self.attachments = []

    def sender(self, mail_from, alias = '') :
        self._from = mail_from
        self.mail['from'] = unicode(alias+'<'+mail_from+'>','utf-8')

    def receivers(self, mail_to) :
        """
        mail_to : comma separated emails
        """
        self._to = mail_to
        if isinstance(mail_to, list):
            self.mail['to'] = ','.join(mail_to)
        elif isinstance(mail_to, basestring):
            self.mail['to'] = mail_to
        else :
            raise Exception('invalid mail to')
    def subject(self, mail_subject) :
        self.mail['subject'] = unicode(mail_subject,'utf-8')

    def body_text(self, body, encoding = 'utf-8') :
        self.alter.attach(email.MIMEText.MIMEText(body, 'plain', encoding))

    def body_html(self, body, replace_data = None, html_images=None, encoding = 'utf-8'):

        #替换html中变量
        if replace_data:
            for d in replace_data:
                body = body.replace(d, str(replace_data[d]))

        self.alter.attach(email.MIMEText.MIMEText(body, 'html', encoding))
        #设定Hmtl内置图片信息
        if html_images:
            for content_id in html_images:
                fp = open(unicode(html_images[content_id], encoding), 'rb')
                msgImage = email.MIMEImage.MIMEImage(fp.read())
                fp.close()
                msgImage.add_header('Content-ID', content_id)
                self.alter.attach(msgImage)

    def add_attach(self, filepath, rename = None, mime_type = 'octect-stream', encoding = 'utf-8') :

        f = open(unicode(filepath,encoding), 'rb')
        filecontent = f.read()
        f.close()
        mb = email.MIMEBase.MIMEBase('application', mime_type)
        mb.set_payload(filecontent)
        email.Encoders.encode_base64(mb)
        if rename:
            filename = Header(rename,encoding)
        else:
            filename = Header(os.path.basename(filepath),encoding)
        mb.add_header('Content-Disposition', 'attachment;filename="%s"' % filename)
        self.mail.attach(mb)

    def send(self):
        self.mail['Date'] = email.Utils.formatdate()
        smtp = False
        try:
            smtp = smtplib.SMTP()
            #smtp.set_debuglevel(1)
            smtp.connect(self.smtp_host, self.smtp_port)
            #smtp.ehlo()
            #smtp.starttls()
            smtp.login(self.smtp_user, self.smtp_psd)
            smtp.sendmail(self._from, self._to, self.mail.as_string())
            return  True
        except Exception, e:
            import traceback
            print traceback.format_exc()
            return False
        finally :
            smtp and smtp.quit()

