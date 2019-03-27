

## Why JWT? Isn't it unsafe?

[Many](https://medium.com/garage-inside-garage/secure-jwt-authentication-against-both-xss-and-xsrf-vue-js-django-rest-b1570b8acf70) [articles](https://medium.com/@yuliaoletskaya/can-jwt-be-used-for-sessions-4164d124fe23) [suggests](https://paragonie.com/blog/2017/03/jwt-json-web-tokens-is-bad-standard-that-everyone-should-avoid) [that](http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/) [we](https://scotch.io/bar-talk/why-jwts-suck-as-session-tokens) [should not](https://stormpath.com/blog/where-to-store-your-jwts-cookies-vs-html5-web-storage) [store jwts](https://dev.to/rdegges/please-stop-using-local-storage-1i04) in local storage. Even some say we must not use JWT. 

After reading a lot of articles about the topic and comments, I concluded that httpOnly cookies are not safer when your website has XSS vulnerability. Because hackers can execute queries directly from your website even when they cannot access the value of session cookies. And it's much better for them because they don't have to expose their own IP address. 

And OAuth and even [Microsoft Azure Active Directory](https://docs.microsoft.com/en-us/azure/active-directory/develop/id-tokens) uses that, too. 

It seems that they're over-worrying about the things that won't easily happen. I'm not a security expert. If you can explain why local storage is bad practice for jwts and cookies are our only hope, feel free to tell me. 