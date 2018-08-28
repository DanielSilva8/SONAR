/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


;

(function() {
  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(this);

  var Rails = this.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (typeof options.beforeSend === "function") {
          options.beforeSend(xhr, options);
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        } else {
          return fire(document, 'ajaxStop');
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return xhr.abort();
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
Turbolinks 5.0.3
Copyright © 2017 Basecamp, LLC
 */

(function(){(function(){(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(e,r){return t.controller.visit(e,r)},clearCache:function(){return t.controller.clearCache()}}}).call(this)}).call(this);var t=this.Turbolinks;(function(){(function(){var e,r,n=[].slice;t.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},t.closest=function(t,r){return e.call(t,r)},e=function(){var t,e;return t=document.documentElement,null!=(e=t.closest)?e:function(t){var e;for(e=this;e;){if(e.nodeType===Node.ELEMENT_NODE&&r.call(e,t))return e;e=e.parentNode}}}(),t.defer=function(t){return setTimeout(t,1)},t.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?n.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},t.dispatch=function(t,e){var r,n,o,i,s;return i=null!=e?e:{},s=i.target,r=i.cancelable,n=i.data,o=document.createEvent("Events"),o.initEvent(t,!0,r===!0),o.data=null!=n?n:{},(null!=s?s:document).dispatchEvent(o),o},t.match=function(t,e){return r.call(t,e)},r=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),t.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}).call(this),function(){t.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.absoluteURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.HttpRequest=function(){function r(r,n,o){this.delegate=r,this.requestCanceled=e(this.requestCanceled,this),this.requestTimedOut=e(this.requestTimedOut,this),this.requestFailed=e(this.requestFailed,this),this.requestLoaded=e(this.requestLoaded,this),this.requestProgressed=e(this.requestProgressed,this),this.url=t.Location.wrap(n).requestURL,this.referrer=t.Location.wrap(o).absoluteURL,this.createXHR()}return r.NETWORK_FAILURE=0,r.TIMEOUT_FAILURE=-1,r.timeout=60,r.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},r.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},r.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},r.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},r.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},r.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},r.prototype.requestCanceled=function(){return this.endRequest()},r.prototype.notifyApplicationBeforeRequestStart=function(){return t.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},r.prototype.notifyApplicationAfterRequestEnd=function(){return t.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},r.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},r.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},r.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},r.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.ProgressBar=function(){function t(){this.trickle=e(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,t.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",t.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},t.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},t.prototype.setValue=function(t){return this.value=t,this.refresh()},t.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},t.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},t.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},t.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},t.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},t.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},t.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},t.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},t.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},t.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},t}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.BrowserAdapter=function(){function r(r){this.controller=r,this.showProgressBar=e(this.showProgressBar,this),this.progressBar=new t.ProgressBar}var n,o,i,s;return s=t.HttpRequest,n=s.NETWORK_FAILURE,i=s.TIMEOUT_FAILURE,o=500,r.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},r.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},r.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},r.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},r.prototype.visitRequestCompleted=function(t){return t.loadResponse()},r.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case n:case i:return this.reload();default:return t.loadResponse()}},r.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},r.prototype.visitCompleted=function(t){return t.followRedirect()},r.prototype.pageInvalidated=function(){return this.reload()},r.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,o)},r.prototype.showProgressBar=function(){return this.progressBar.show()},r.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},r.prototype.reload=function(){return window.location.reload()},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.History=function(){function r(t){this.delegate=t,this.onPageLoad=e(this.onPageLoad,this),this.onPopState=e(this.onPopState,this)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},r.prototype.push=function(e,r){return e=t.Location.wrap(e),this.update("push",e,r)},r.prototype.replace=function(e,r){return e=t.Location.wrap(e),this.update("replace",e,r)},r.prototype.onPopState=function(e){var r,n,o,i;return this.shouldHandlePopState()&&(i=null!=(n=e.state)?n.turbolinks:void 0)?(r=t.Location.wrap(window.location),o=i.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(r,o)):void 0},r.prototype.onPageLoad=function(e){return t.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},r.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},r.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},r.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},r}()}.call(this),function(){t.Snapshot=function(){function e(t){var e,r;r=t.head,e=t.body,this.head=null!=r?r:document.createElement("head"),this.body=null!=e?e:document.createElement("body")}return e.wrap=function(t){return t instanceof this?t:this.fromHTML(t)},e.fromHTML=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromElement(e)},e.fromElement=function(t){return new this({head:t.querySelector("head"),body:t.querySelector("body")})},e.prototype.clone=function(){return new e({head:this.head.cloneNode(!0),body:this.body.cloneNode(!0)})},e.prototype.getRootLocation=function(){var e,r;return r=null!=(e=this.getSetting("root"))?e:"/",new t.Location(r)},e.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},e.prototype.hasAnchor=function(t){try{return null!=this.body.querySelector("[id='"+t+"']")}catch(e){}},e.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},e.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},e.prototype.getSetting=function(t){var e,r;return r=this.head.querySelectorAll("meta[name='turbolinks-"+t+"']"),e=r[r.length-1],null!=e?e.getAttribute("content"):void 0},e}()}.call(this),function(){var e=[].slice;t.Renderer=function(){function t(){}var r;return t.render=function(){var t,r,n,o;return n=arguments[0],r=arguments[1],t=3<=arguments.length?e.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,t,function(){}),o.delegate=n,o.render(r),o},t.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},t.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},t.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},t}()}.call(this),function(){t.HeadDetails=function(){function t(t){var e,r,i,s,a,u,l;for(this.element=t,this.elements={},l=this.element.childNodes,s=0,u=l.length;u>s;s++)i=l[s],i.nodeType===Node.ELEMENT_NODE&&(a=i.outerHTML,r=null!=(e=this.elements)[a]?e[a]:e[a]={type:o(i),tracked:n(i),elements:[]},r.elements.push(i))}var e,r,n,o;return t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},o=function(t){return e(t)?"script":r(t)?"stylesheet":void 0},n=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},e=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},r=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},t}()}.call(this),function(){var e=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;t.SnapshotRenderer=function(r){function n(e,r){this.currentSnapshot=e,this.newSnapshot=r,this.currentHeadDetails=new t.HeadDetails(this.currentSnapshot.head),this.newHeadDetails=new t.HeadDetails(this.newSnapshot.head),this.newBody=this.newSnapshot.body}return e(n,r),n.prototype.render=function(t){return this.trackedElementsAreIdentical()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},n.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},n.prototype.replaceBody=function(){return this.activateBodyScriptElements(),this.importBodyPermanentElements(),this.assignNewBody()},n.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},n.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},n.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},n.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},n.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},n.prototype.importBodyPermanentElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyPermanentElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],(t=this.findCurrentBodyPermanentElement(o))?i.push(o.parentNode.replaceChild(t,o)):i.push(void 0);return i},n.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},n.prototype.assignNewBody=function(){return document.body=this.newBody},n.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.findFirstAutofocusableElement())?t.focus():void 0},n.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},n.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},n.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},n.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},n.prototype.getNewBodyPermanentElements=function(){return this.newBody.querySelectorAll("[id][data-turbolinks-permanent]")},n.prototype.findCurrentBodyPermanentElement=function(t){return document.body.querySelector("#"+t.id+"[data-turbolinks-permanent]")},n.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},n.prototype.findFirstAutofocusableElement=function(){return document.body.querySelector("[autofocus]")},n}(t.Renderer)}.call(this),function(){var e=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;t.ErrorRenderer=function(t){function r(t){this.html=t}return e(r,t),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceDocumentHTML(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceDocumentHTML=function(){return document.documentElement.innerHTML=this.html},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(t.Renderer)}.call(this),function(){t.View=function(){function e(t){this.delegate=t,this.element=document.documentElement}return e.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},e.prototype.getSnapshot=function(){return t.Snapshot.fromElement(this.element)},e.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,e):this.renderError(r,e)},e.prototype.markAsPreview=function(t){return t?this.element.setAttribute("data-turbolinks-preview",""):this.element.removeAttribute("data-turbolinks-preview")},e.prototype.renderSnapshot=function(e,r){return t.SnapshotRenderer.render(this.delegate,r,this.getSnapshot(),t.Snapshot.wrap(e))},e.prototype.renderError=function(e,r){return t.ErrorRenderer.render(this.delegate,r,e)},e}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.ScrollManager=function(){function r(r){this.delegate=r,this.onScroll=e(this.onScroll,this),this.onScroll=t.throttle(this.onScroll)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},r.prototype.scrollToElement=function(t){return t.scrollIntoView()},r.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},r.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},r.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},r}()}.call(this),function(){t.SnapshotCache=function(){function e(t){this.size=t,this.keys=[],this.snapshots={}}var r;return e.prototype.has=function(t){var e;return e=r(t),e in this.snapshots},e.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},e.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},e.prototype.read=function(t){var e;return e=r(t),this.snapshots[e]},e.prototype.write=function(t,e){var n;return n=r(t),this.snapshots[n]=e},e.prototype.touch=function(t){var e,n;return n=r(t),e=this.keys.indexOf(n),e>-1&&this.keys.splice(e,1),this.keys.unshift(n),this.trim()},e.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},r=function(e){return t.Location.wrap(e).toCacheKey()},e}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.Visit=function(){function r(r,n,o){this.controller=r,this.action=o,this.performScroll=e(this.performScroll,this),this.identifier=t.uuid(),this.location=t.Location.wrap(n),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var n;return r.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},r.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},r.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},r.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},r.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=n(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},r.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new t.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},r.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},r.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},r.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},r.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},r.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},r.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},r.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},r.prototype.requestCompletedWithResponse=function(e,r){return this.response=e,null!=r&&(this.redirectedToLocation=t.Location.wrap(r)),this.adapter.visitRequestCompleted(this)},r.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},r.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},r.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},r.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},r.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},r.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},r.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},r.prototype.getTimingMetrics=function(){return t.copyObject(this.timingMetrics)},n=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},r.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},r.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},r.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},r.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.Controller=function(){function r(){this.clickBubbled=e(this.clickBubbled,this),this.clickCaptured=e(this.clickCaptured,this),this.pageLoaded=e(this.pageLoaded,this),this.history=new t.History(this),this.view=new t.View(this),this.scrollManager=new t.ScrollManager(this),this.restorationData={},this.clearCache()}return r.prototype.start=function(){return t.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},r.prototype.disable=function(){return this.enabled=!1},r.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},r.prototype.clearCache=function(){return this.cache=new t.SnapshotCache(10)},r.prototype.visit=function(e,r){var n,o;return null==r&&(r={}),e=t.Location.wrap(e),this.applicationAllowsVisitingLocation(e)?this.locationIsVisitable(e)?(n=null!=(o=r.action)?o:"advance",this.adapter.visitProposedToLocationWithAction(e,n)):window.location=e:void 0},r.prototype.startVisitToLocationWithAction=function(e,r,n){var o;return t.supported?(o=this.getRestorationDataForIdentifier(n),this.startVisit(e,r,{restorationData:o})):window.location=e},r.prototype.startHistory=function(){return this.location=t.Location.wrap(window.location),this.restorationIdentifier=t.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.stopHistory=function(){return this.history.stop()},r.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(e,r){return this.restorationIdentifier=r,this.location=t.Location.wrap(e),this.history.push(this.location,this.restorationIdentifier)},r.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(e,r){return this.restorationIdentifier=r,this.location=t.Location.wrap(e),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.historyPoppedToLocationWithRestorationIdentifier=function(e,r){var n;return this.restorationIdentifier=r,this.enabled?(n=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(e,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:n,historyChanged:!0}),this.location=t.Location.wrap(e)):this.adapter.pageInvalidated()},r.prototype.getCachedSnapshotForLocation=function(t){var e;return e=this.cache.get(t),e?e.clone():void 0},r.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable()},r.prototype.cacheSnapshot=function(){var t;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),t=this.view.getSnapshot(),this.cache.put(this.lastRenderedLocation,t.clone())):void 0},r.prototype.scrollToAnchor=function(t){var e;return(e=document.getElementById(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},r.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},r.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},r.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},r.prototype.render=function(t,e){return this.view.render(t,e)},r.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},r.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},r.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},r.prototype.pageLoaded=function(){return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},r.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},r.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},r.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},r.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},r.prototype.notifyApplicationAfterClickingLinkToLocation=function(e,r){return t.dispatch("turbolinks:click",{target:e,data:{url:r.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationBeforeVisitingLocation=function(e){return t.dispatch("turbolinks:before-visit",{data:{url:e.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationAfterVisitingLocation=function(e){return t.dispatch("turbolinks:visit",{data:{url:e.absoluteURL}})},r.prototype.notifyApplicationBeforeCachingSnapshot=function(){return t.dispatch("turbolinks:before-cache")},r.prototype.notifyApplicationBeforeRender=function(e){
return t.dispatch("turbolinks:before-render",{data:{newBody:e}})},r.prototype.notifyApplicationAfterRender=function(){return t.dispatch("turbolinks:render")},r.prototype.notifyApplicationAfterPageLoad=function(e){return null==e&&(e={}),t.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:e}})},r.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},r.prototype.createVisit=function(e,r,n){var o,i,s,a,u;return i=null!=n?n:{},a=i.restorationIdentifier,s=i.restorationData,o=i.historyChanged,u=new t.Visit(this,e,r),u.restorationIdentifier=null!=a?a:t.uuid(),u.restorationData=t.copyObject(s),u.historyChanged=o,u.referrer=this.location,u},r.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},r.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},r.prototype.getVisitableLinkForNode=function(e){return this.nodeIsVisitable(e)?t.closest(e,"a[href]:not([target]):not([download])"):void 0},r.prototype.getVisitableLocationForLink=function(e){var r;return r=new t.Location(e.getAttribute("href")),this.locationIsVisitable(r)?r:void 0},r.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},r.prototype.nodeIsVisitable=function(e){var r;return(r=t.closest(e,"[data-turbolinks]"))?"false"!==r.getAttribute("data-turbolinks"):!0},r.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},r.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},r.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},r}()}.call(this),function(){var e,r,n;t.start=function(){return r()?(null==t.controller&&(t.controller=e()),t.controller.start()):void 0},r=function(){return null==window.Turbolinks&&(window.Turbolinks=t),n()},e=function(){var e;return e=new t.Controller,e.adapter=new t.BrowserAdapter(e),e},n=function(){return window.Turbolinks===t},n()&&t.start()}.call(this)}).call(this),"object"==typeof module&&module.exports?module.exports=t:"function"==typeof define&&define.amd&&define(t)}).call(this);
/* ========================================================================
 * Bootstrap: affix.js v3.2.0
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      =
    this.unpin        =
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.2.0'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.unpin   != null && (scrollTop + this.unpin <= position.top) ? false :
                offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' :
                offsetTop    != null && (scrollTop <= offsetTop) ? 'top' : false

    if (this.affixed === affix) return
    if (this.unpin != null) this.$element.css('top', '')

    var affixType = 'affix' + (affix ? '-' + affix : '')
    var e         = $.Event(affixType + '.bs.affix')

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    this.affixed = affix
    this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

    this.$element
      .removeClass(Affix.RESET)
      .addClass(affixType)
      .trigger($.Event(affixType.replace('affix', 'affixed')))

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - this.$element.height() - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom) data.offset.bottom = data.offsetBottom
      if (data.offsetTop)    data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);
/* ========================================================================
 * Bootstrap: alert.js v3.2.0
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.2.0'

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.hasClass('alert') ? $this : $this.parent()
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(150) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);
/* ========================================================================
 * Bootstrap: button.js v3.2.0
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION  = '3.2.0'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    $el[val](data[state] == null ? this.options[state] : data[state])

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked') && this.$element.hasClass('active')) changed = false
        else $parent.find('.active').removeClass('active')
      }
      if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change')
    }

    if (changed) this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    Plugin.call($btn, 'toggle')
    e.preventDefault()
  })

}(jQuery);
/* ========================================================================
 * Bootstrap: carousel.js v3.2.0
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element).on('keydown.bs.carousel', $.proxy(this.keydown, this))
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    =
    this.$active     =
    this.$items      = null

    this.options.pause == 'hover' && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.2.0'

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true
  }

  Carousel.prototype.keydown = function (e) {
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this

    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.item')[fallback]()
    }

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  })

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);
/* ========================================================================
 * Bootstrap: collapse.js v3.2.0
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null

    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.2.0'

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var actives = this.$parent && this.$parent.find('> .panel > .in')

    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      Plugin.call(actives, 'hide')
      hasData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && option == 'show') option = !option
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var href
    var $this   = $(this)
    var target  = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7
    var $target = $(target)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)

    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle="collapse"][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }

    Plugin.call($target, option)
  })

}(jQuery);
/* ========================================================================
 * Bootstrap: dropdown.js v3.2.0
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.2.0'

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.trigger('focus')

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27)/.test(e.keyCode)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.divider):visible a'
    var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc)

    if (!$items.length) return

    var index = $items.index($items.filter(':focus'))

    if (e.keyCode == 38 && index > 0)                 index--                        // up
    if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index = 0

    $items.eq(index).trigger('focus')
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $parent = getParent($(this))
      var relatedTarget = { relatedTarget: this }
      if (!$parent.hasClass('open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
      if (e.isDefaultPrevented()) return
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle + ', [role="menu"], [role="listbox"]', Dropdown.prototype.keydown)

}(jQuery);
/* ========================================================================
 * Bootstrap: tab.js v3.2.0
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.VERSION = '3.2.0'

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  })

}(jQuery);
/* ========================================================================
 * Bootstrap: transition.js v3.2.0
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);
/* ========================================================================
 * Bootstrap: scrollspy.js v3.2.0
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    var process  = $.proxy(this.process, this)

    this.$body          = $('body')
    this.$scrollElement = $(element).is('body') ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', process)
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.2.0'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var offsetMethod = 'offset'
    var offsetBase   = 0

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.offsets = []
    this.targets = []
    this.scrollHeight = this.getScrollHeight()

    var self     = this

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        self.offsets.push(this[0])
        self.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop <= offsets[0]) {
      return activeTarget != (i = targets[0]) && this.activate(i)
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')

    var selector = this.selector +
        '[data-target="' + target + '"],' +
        this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);
/* ========================================================================
 * Bootstrap: modal.js v3.2.0
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options        = options
    this.$body          = $(document.body)
    this.$element       = $(element)
    this.$backdrop      =
    this.isShown        = null
    this.scrollbarWidth = 0

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.2.0'

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.$body.addClass('modal-open')

    this.setScrollbar()
    this.escape()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.$body.removeClass('modal-open')

    this.resetScrollbar()
    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(150) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  Modal.prototype.checkScrollbar = function () {
    if (document.body.clientWidth >= window.innerWidth) return
    this.scrollbarWidth = this.scrollbarWidth || this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    if (this.scrollbarWidth) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', '')
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);
/* ========================================================================
 * Bootstrap: tooltip.js v3.2.0
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.2.0'

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $(this.options.viewport.selector || this.options.viewport)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(document.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var $parent      = this.$element.parent()
        var parentDim    = this.getPosition($parent)

        placement = placement == 'bottom' && pos.top   + pos.height       + actualHeight - parentDim.scroll > parentDim.height ? 'top'    :
                    placement == 'top'    && pos.top   - parentDim.scroll - actualHeight < 0                                   ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth      > parentDim.width                                    ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth      < parentDim.left                                     ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(150) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var arrowDelta          = delta.left ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowPosition       = delta.left ? 'left'        : 'top'
    var arrowOffsetPosition = delta.left ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], arrowPosition)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    this.$element.removeAttr('aria-describedby')

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element.trigger('hidden.bs.' + that.type)
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(150) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof ($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element
    var el     = $element[0]
    var isBody = el.tagName == 'BODY'
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : null, {
      scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop(),
      width:  isBody ? $(window).width()  : $element.outerWidth(),
      height: isBody ? $(window).height() : $element.outerHeight()
    }, isBody ? { top: 0, left: 0 } : $element.offset())
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.width) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    return (this.$tip = this.$tip || $(this.options.template))
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    clearTimeout(this.timeout)
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);
/* ========================================================================
 * Bootstrap: popover.js v3.2.0
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.2.0'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').empty()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }

  Popover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);












/*!
 * Bootstrap v3.3.0 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function(a){var b=a.fn.jquery.split(" ")[0].split(".");if(b[0]<2&&b[1]<9||1==b[0]&&9==b[1]&&b[2]<1)throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher")}(jQuery),+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one("bsTransitionEnd",function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b(),a.support.transition&&(a.event.special.bsTransitionEnd={bindType:a.support.transition.end,delegateType:a.support.transition.end,handle:function(b){return a(b.target).is(this)?b.handleObj.handler.apply(this,arguments):void 0}})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var c=a(this),e=c.data("bs.alert");e||c.data("bs.alert",e=new d(this)),"string"==typeof b&&e[b].call(c)})}var c='[data-dismiss="alert"]',d=function(b){a(b).on("click",c,this.close)};d.VERSION="3.3.0",d.TRANSITION_DURATION=150,d.prototype.close=function(b){function c(){g.detach().trigger("closed.bs.alert").remove()}var e=a(this),f=e.attr("data-target");f||(f=e.attr("href"),f=f&&f.replace(/.*(?=#[^\s]*$)/,""));var g=a(f);b&&b.preventDefault(),g.length||(g=e.closest(".alert")),g.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(g.removeClass("in"),a.support.transition&&g.hasClass("fade")?g.one("bsTransitionEnd",c).emulateTransitionEnd(d.TRANSITION_DURATION):c())};var e=a.fn.alert;a.fn.alert=b,a.fn.alert.Constructor=d,a.fn.alert.noConflict=function(){return a.fn.alert=e,this},a(document).on("click.bs.alert.data-api",c,d.prototype.close)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof b&&b;e||d.data("bs.button",e=new c(this,f)),"toggle"==b?e.toggle():b&&e.setState(b)})}var c=function(b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.isLoading=!1};c.VERSION="3.3.0",c.DEFAULTS={loadingText:"loading..."},c.prototype.setState=function(b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",null==f.resetText&&d.data("resetText",d[e]()),setTimeout(a.proxy(function(){d[e](null==f[b]?this.options[b]:f[b]),"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c))},this),0)},c.prototype.toggle=function(){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")&&(c.prop("checked")&&this.$element.hasClass("active")?a=!1:b.find(".active").removeClass("active")),a&&c.prop("checked",!this.$element.hasClass("active")).trigger("change")}else this.$element.attr("aria-pressed",!this.$element.hasClass("active"));a&&this.$element.toggleClass("active")};var d=a.fn.button;a.fn.button=b,a.fn.button.Constructor=c,a.fn.button.noConflict=function(){return a.fn.button=d,this},a(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function(c){var d=a(c.target);d.hasClass("btn")||(d=d.closest(".btn")),b.call(d,"toggle"),c.preventDefault()}).on("focus.bs.button.data-api blur.bs.button.data-api",'[data-toggle^="button"]',function(b){a(b.target).closest(".btn").toggleClass("focus","focus"==b.type)})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b),g="string"==typeof b?b:f.slide;e||d.data("bs.carousel",e=new c(this,f)),"number"==typeof b?e.to(b):g?e[g]():f.interval&&e.pause().cycle()})}var c=function(b,c){this.$element=a(b),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=this.sliding=this.interval=this.$active=this.$items=null,this.options.keyboard&&this.$element.on("keydown.bs.carousel",a.proxy(this.keydown,this)),"hover"==this.options.pause&&!("ontouchstart"in document.documentElement)&&this.$element.on("mouseenter.bs.carousel",a.proxy(this.pause,this)).on("mouseleave.bs.carousel",a.proxy(this.cycle,this))};c.VERSION="3.3.0",c.TRANSITION_DURATION=600,c.DEFAULTS={interval:5e3,pause:"hover",wrap:!0,keyboard:!0},c.prototype.keydown=function(a){switch(a.which){case 37:this.prev();break;case 39:this.next();break;default:return}a.preventDefault()},c.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},c.prototype.getItemIndex=function(a){return this.$items=a.parent().children(".item"),this.$items.index(a||this.$active)},c.prototype.getItemForDirection=function(a,b){var c="prev"==a?-1:1,d=this.getItemIndex(b),e=(d+c)%this.$items.length;return this.$items.eq(e)},c.prototype.to=function(a){var b=this,c=this.getItemIndex(this.$active=this.$element.find(".item.active"));return a>this.$items.length-1||0>a?void 0:this.sliding?this.$element.one("slid.bs.carousel",function(){b.to(a)}):c==a?this.pause().cycle():this.slide(a>c?"next":"prev",this.$items.eq(a))},c.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},c.prototype.next=function(){return this.sliding?void 0:this.slide("next")},c.prototype.prev=function(){return this.sliding?void 0:this.slide("prev")},c.prototype.slide=function(b,d){var e=this.$element.find(".item.active"),f=d||this.getItemForDirection(b,e),g=this.interval,h="next"==b?"left":"right",i="next"==b?"first":"last",j=this;if(!f.length){if(!this.options.wrap)return;f=this.$element.find(".item")[i]()}if(f.hasClass("active"))return this.sliding=!1;var k=f[0],l=a.Event("slide.bs.carousel",{relatedTarget:k,direction:h});if(this.$element.trigger(l),!l.isDefaultPrevented()){if(this.sliding=!0,g&&this.pause(),this.$indicators.length){this.$indicators.find(".active").removeClass("active");var m=a(this.$indicators.children()[this.getItemIndex(f)]);m&&m.addClass("active")}var n=a.Event("slid.bs.carousel",{relatedTarget:k,direction:h});return a.support.transition&&this.$element.hasClass("slide")?(f.addClass(b),f[0].offsetWidth,e.addClass(h),f.addClass(h),e.one("bsTransitionEnd",function(){f.removeClass([b,h].join(" ")).addClass("active"),e.removeClass(["active",h].join(" ")),j.sliding=!1,setTimeout(function(){j.$element.trigger(n)},0)}).emulateTransitionEnd(c.TRANSITION_DURATION)):(e.removeClass("active"),f.addClass("active"),this.sliding=!1,this.$element.trigger(n)),g&&this.cycle(),this}};var d=a.fn.carousel;a.fn.carousel=b,a.fn.carousel.Constructor=c,a.fn.carousel.noConflict=function(){return a.fn.carousel=d,this};var e=function(c){var d,e=a(this),f=a(e.attr("data-target")||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""));if(f.hasClass("carousel")){var g=a.extend({},f.data(),e.data()),h=e.attr("data-slide-to");h&&(g.interval=!1),b.call(f,g),h&&f.data("bs.carousel").to(h),c.preventDefault()}};a(document).on("click.bs.carousel.data-api","[data-slide]",e).on("click.bs.carousel.data-api","[data-slide-to]",e),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var c=a(this);b.call(c,c.data())})})}(jQuery),+function(a){"use strict";function b(b){var c,d=b.attr("data-target")||(c=b.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,"");return a(d)}function c(b){return this.each(function(){var c=a(this),e=c.data("bs.collapse"),f=a.extend({},d.DEFAULTS,c.data(),"object"==typeof b&&b);!e&&f.toggle&&"show"==b&&(f.toggle=!1),e||c.data("bs.collapse",e=new d(this,f)),"string"==typeof b&&e[b]()})}var d=function(b,c){this.$element=a(b),this.options=a.extend({},d.DEFAULTS,c),this.$trigger=a(this.options.trigger).filter('[href="#'+b.id+'"], [data-target="#'+b.id+'"]'),this.transitioning=null,this.options.parent?this.$parent=this.getParent():this.addAriaAndCollapsedClass(this.$element,this.$trigger),this.options.toggle&&this.toggle()};d.VERSION="3.3.0",d.TRANSITION_DURATION=350,d.DEFAULTS={toggle:!0,trigger:'[data-toggle="collapse"]'},d.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},d.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var b,e=this.$parent&&this.$parent.find("> .panel").children(".in, .collapsing");if(!(e&&e.length&&(b=e.data("bs.collapse"),b&&b.transitioning))){var f=a.Event("show.bs.collapse");if(this.$element.trigger(f),!f.isDefaultPrevented()){e&&e.length&&(c.call(e,"hide"),b||e.data("bs.collapse",null));var g=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[g](0).attr("aria-expanded",!0),this.$trigger.removeClass("collapsed").attr("aria-expanded",!0),this.transitioning=1;var h=function(){this.$element.removeClass("collapsing").addClass("collapse in")[g](""),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return h.call(this);var i=a.camelCase(["scroll",g].join("-"));this.$element.one("bsTransitionEnd",a.proxy(h,this)).emulateTransitionEnd(d.TRANSITION_DURATION)[g](this.$element[0][i])}}}},d.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded",!1),this.$trigger.addClass("collapsed").attr("aria-expanded",!1),this.transitioning=1;var e=function(){this.transitioning=0,this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse")};return a.support.transition?void this.$element[c](0).one("bsTransitionEnd",a.proxy(e,this)).emulateTransitionEnd(d.TRANSITION_DURATION):e.call(this)}}},d.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()},d.prototype.getParent=function(){return a(this.options.parent).find('[data-toggle="collapse"][data-parent="'+this.options.parent+'"]').each(a.proxy(function(c,d){var e=a(d);this.addAriaAndCollapsedClass(b(e),e)},this)).end()},d.prototype.addAriaAndCollapsedClass=function(a,b){var c=a.hasClass("in");a.attr("aria-expanded",c),b.toggleClass("collapsed",!c).attr("aria-expanded",c)};var e=a.fn.collapse;a.fn.collapse=c,a.fn.collapse.Constructor=d,a.fn.collapse.noConflict=function(){return a.fn.collapse=e,this},a(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',function(d){var e=a(this);e.attr("data-target")||d.preventDefault();var f=b(e),g=f.data("bs.collapse"),h=g?"toggle":a.extend({},e.data(),{trigger:this});c.call(f,h)})}(jQuery),+function(a){"use strict";function b(b){b&&3===b.which||(a(e).remove(),a(f).each(function(){var d=a(this),e=c(d),f={relatedTarget:this};e.hasClass("open")&&(e.trigger(b=a.Event("hide.bs.dropdown",f)),b.isDefaultPrevented()||(d.attr("aria-expanded","false"),e.removeClass("open").trigger("hidden.bs.dropdown",f)))}))}function c(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}function d(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new g(this)),"string"==typeof b&&d[b].call(c)})}var e=".dropdown-backdrop",f='[data-toggle="dropdown"]',g=function(b){a(b).on("click.bs.dropdown",this.toggle)};g.VERSION="3.3.0",g.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=c(e),g=f.hasClass("open");if(b(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a('<div class="dropdown-backdrop"/>').insertAfter(a(this)).on("click",b);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;e.trigger("focus").attr("aria-expanded","true"),f.toggleClass("open").trigger("shown.bs.dropdown",h)}return!1}},g.prototype.keydown=function(b){if(/(38|40|27|32)/.test(b.which)){var d=a(this);if(b.preventDefault(),b.stopPropagation(),!d.is(".disabled, :disabled")){var e=c(d),g=e.hasClass("open");if(!g&&27!=b.which||g&&27==b.which)return 27==b.which&&e.find(f).trigger("focus"),d.trigger("click");var h=" li:not(.divider):visible a",i=e.find('[role="menu"]'+h+', [role="listbox"]'+h);if(i.length){var j=i.index(b.target);38==b.which&&j>0&&j--,40==b.which&&j<i.length-1&&j++,~j||(j=0),i.eq(j).trigger("focus")}}}};var h=a.fn.dropdown;a.fn.dropdown=d,a.fn.dropdown.Constructor=g,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=h,this},a(document).on("click.bs.dropdown.data-api",b).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",f,g.prototype.toggle).on("keydown.bs.dropdown.data-api",f,g.prototype.keydown).on("keydown.bs.dropdown.data-api",'[role="menu"]',g.prototype.keydown).on("keydown.bs.dropdown.data-api",'[role="listbox"]',g.prototype.keydown)}(jQuery),+function(a){"use strict";function b(b,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},c.DEFAULTS,e.data(),"object"==typeof b&&b);f||e.data("bs.modal",f=new c(this,g)),"string"==typeof b?f[b](d):g.show&&f.show(d)})}var c=function(b,c){this.options=c,this.$body=a(document.body),this.$element=a(b),this.$backdrop=this.isShown=null,this.scrollbarWidth=0,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};c.VERSION="3.3.0",c.TRANSITION_DURATION=300,c.BACKDROP_TRANSITION_DURATION=150,c.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},c.prototype.toggle=function(a){return this.isShown?this.hide():this.show(a)},c.prototype.show=function(b){var d=this,e=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(e),this.isShown||e.isDefaultPrevented()||(this.isShown=!0,this.checkScrollbar(),this.$body.addClass("modal-open"),this.setScrollbar(),this.escape(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.backdrop(function(){var e=a.support.transition&&d.$element.hasClass("fade");d.$element.parent().length||d.$element.appendTo(d.$body),d.$element.show().scrollTop(0),e&&d.$element[0].offsetWidth,d.$element.addClass("in").attr("aria-hidden",!1),d.enforceFocus();var f=a.Event("shown.bs.modal",{relatedTarget:b});e?d.$element.find(".modal-dialog").one("bsTransitionEnd",function(){d.$element.trigger("focus").trigger(f)}).emulateTransitionEnd(c.TRANSITION_DURATION):d.$element.trigger("focus").trigger(f)}))},c.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.escape(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").attr("aria-hidden",!0).off("click.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",a.proxy(this.hideModal,this)).emulateTransitionEnd(c.TRANSITION_DURATION):this.hideModal())},c.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.trigger("focus")},this))},c.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keydown.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keydown.dismiss.bs.modal")},c.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.$body.removeClass("modal-open"),a.resetScrollbar(),a.$element.trigger("hidden.bs.modal")})},c.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},c.prototype.backdrop=function(b){var d=this,e=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var f=a.support.transition&&e;if(this.$backdrop=a('<div class="modal-backdrop '+e+'" />').prependTo(this.$element).on("click.dismiss.bs.modal",a.proxy(function(a){a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus.call(this.$element[0]):this.hide.call(this))},this)),f&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;f?this.$backdrop.one("bsTransitionEnd",b).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):b()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");var g=function(){d.removeBackdrop(),b&&b()};a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one("bsTransitionEnd",g).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):g()}else b&&b()},c.prototype.checkScrollbar=function(){this.scrollbarWidth=this.measureScrollbar()},c.prototype.setScrollbar=function(){var a=parseInt(this.$body.css("padding-right")||0,10);this.scrollbarWidth&&this.$body.css("padding-right",a+this.scrollbarWidth)},c.prototype.resetScrollbar=function(){this.$body.css("padding-right","")},c.prototype.measureScrollbar=function(){if(document.body.clientWidth>=window.innerWidth)return 0;var a=document.createElement("div");a.className="modal-scrollbar-measure",this.$body.append(a);var b=a.offsetWidth-a.clientWidth;return this.$body[0].removeChild(a),b};var d=a.fn.modal;a.fn.modal=b,a.fn.modal.Constructor=c,a.fn.modal.noConflict=function(){return a.fn.modal=d,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(c){var d=a(this),e=d.attr("href"),f=a(d.attr("data-target")||e&&e.replace(/.*(?=#[^\s]+$)/,"")),g=f.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(e)&&e},f.data(),d.data());d.is("a")&&c.preventDefault(),f.one("show.bs.modal",function(a){a.isDefaultPrevented()||f.one("hidden.bs.modal",function(){d.is(":visible")&&d.trigger("focus")})}),b.call(f,g,this)})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof b&&b,g=f&&f.selector;(e||"destroy"!=b)&&(g?(e||d.data("bs.tooltip",e={}),e[g]||(e[g]=new c(this,f))):e||d.data("bs.tooltip",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null,this.init("tooltip",a,b)};c.VERSION="3.3.0",c.TRANSITION_DURATION=150,c.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0}},c.prototype.init=function(b,c,d){this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d),this.$viewport=this.options.viewport&&a(this.options.viewport.selector||this.options.viewport);for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},c.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},c.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c&&c.$tip&&c.$tip.is(":visible")?void(c.hoverState="in"):(c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show())},c.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide()},c.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(b);var d=a.contains(this.$element[0].ownerDocument.documentElement,this.$element[0]);if(b.isDefaultPrevented()||!d)return;var e=this,f=this.tip(),g=this.getUID(this.type);this.setContent(),f.attr("id",g),this.$element.attr("aria-describedby",g),this.options.animation&&f.addClass("fade");var h="function"==typeof this.options.placement?this.options.placement.call(this,f[0],this.$element[0]):this.options.placement,i=/\s?auto?\s?/i,j=i.test(h);j&&(h=h.replace(i,"")||"top"),f.detach().css({top:0,left:0,display:"block"}).addClass(h).data("bs."+this.type,this),this.options.container?f.appendTo(this.options.container):f.insertAfter(this.$element);var k=this.getPosition(),l=f[0].offsetWidth,m=f[0].offsetHeight;if(j){var n=h,o=this.options.container?a(this.options.container):this.$element.parent(),p=this.getPosition(o);h="bottom"==h&&k.bottom+m>p.bottom?"top":"top"==h&&k.top-m<p.top?"bottom":"right"==h&&k.right+l>p.width?"left":"left"==h&&k.left-l<p.left?"right":h,f.removeClass(n).addClass(h)}var q=this.getCalculatedOffset(h,k,l,m);this.applyPlacement(q,h);var r=function(){var a=e.hoverState;e.$element.trigger("shown.bs."+e.type),e.hoverState=null,"out"==a&&e.leave(e)};a.support.transition&&this.$tip.hasClass("fade")?f.one("bsTransitionEnd",r).emulateTransitionEnd(c.TRANSITION_DURATION):r()}},c.prototype.applyPlacement=function(b,c){var d=this.tip(),e=d[0].offsetWidth,f=d[0].offsetHeight,g=parseInt(d.css("margin-top"),10),h=parseInt(d.css("margin-left"),10);isNaN(g)&&(g=0),isNaN(h)&&(h=0),b.top=b.top+g,b.left=b.left+h,a.offset.setOffset(d[0],a.extend({using:function(a){d.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),d.addClass("in");var i=d[0].offsetWidth,j=d[0].offsetHeight;"top"==c&&j!=f&&(b.top=b.top+f-j);var k=this.getViewportAdjustedDelta(c,b,i,j);k.left?b.left+=k.left:b.top+=k.top;var l=/top|bottom/.test(c),m=l?2*k.left-e+i:2*k.top-f+j,n=l?"offsetWidth":"offsetHeight";d.offset(b),this.replaceArrow(m,d[0][n],l)},c.prototype.replaceArrow=function(a,b,c){this.arrow().css(c?"left":"top",50*(1-a/b)+"%").css(c?"top":"left","")},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},c.prototype.hide=function(b){function d(){"in"!=e.hoverState&&f.detach(),e.$element.removeAttr("aria-describedby").trigger("hidden.bs."+e.type),b&&b()}var e=this,f=this.tip(),g=a.Event("hide.bs."+this.type);return this.$element.trigger(g),g.isDefaultPrevented()?void 0:(f.removeClass("in"),a.support.transition&&this.$tip.hasClass("fade")?f.one("bsTransitionEnd",d).emulateTransitionEnd(c.TRANSITION_DURATION):d(),this.hoverState=null,this)},c.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},c.prototype.hasContent=function(){return this.getTitle()},c.prototype.getPosition=function(b){b=b||this.$element;var c=b[0],d="BODY"==c.tagName,e=c.getBoundingClientRect();null==e.width&&(e=a.extend({},e,{width:e.right-e.left,height:e.bottom-e.top}));var f=d?{top:0,left:0}:b.offset(),g={scroll:d?document.documentElement.scrollTop||document.body.scrollTop:b.scrollTop()},h=d?{width:a(window).width(),height:a(window).height()}:null;return a.extend({},e,g,h,f)},c.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},c.prototype.getViewportAdjustedDelta=function(a,b,c,d){var e={top:0,left:0};if(!this.$viewport)return e;var f=this.options.viewport&&this.options.viewport.padding||0,g=this.getPosition(this.$viewport);if(/right|left/.test(a)){var h=b.top-f-g.scroll,i=b.top+f-g.scroll+d;h<g.top?e.top=g.top-h:i>g.top+g.height&&(e.top=g.top+g.height-i)}else{var j=b.left-f,k=b.left+f+c;j<g.left?e.left=g.left-j:k>g.width&&(e.left=g.left+g.width-k)}return e},c.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},c.prototype.getUID=function(a){do a+=~~(1e6*Math.random());while(document.getElementById(a));return a},c.prototype.tip=function(){return this.$tip=this.$tip||a(this.options.template)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},c.prototype.enable=function(){this.enabled=!0},c.prototype.disable=function(){this.enabled=!1},c.prototype.toggleEnabled=function(){this.enabled=!this.enabled},c.prototype.toggle=function(b){var c=this;b&&(c=a(b.currentTarget).data("bs."+this.type),c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c))),c.tip().hasClass("in")?c.leave(c):c.enter(c)},c.prototype.destroy=function(){var a=this;clearTimeout(this.timeout),this.hide(function(){a.$element.off("."+a.type).removeData("bs."+a.type)})};var d=a.fn.tooltip;a.fn.tooltip=b,a.fn.tooltip.Constructor=c,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=d,this}}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof b&&b,g=f&&f.selector;(e||"destroy"!=b)&&(g?(e||d.data("bs.popover",e={}),e[g]||(e[g]=new c(this,f))):e||d.data("bs.popover",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");c.VERSION="3.3.0",c.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),c.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),c.prototype.constructor=c,c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content").children().detach().end()[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},c.prototype.hasContent=function(){return this.getTitle()||this.getContent()},c.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")},c.prototype.tip=function(){return this.$tip||(this.$tip=a(this.options.template)),this.$tip};var d=a.fn.popover;a.fn.popover=b,a.fn.popover.Constructor=c,a.fn.popover.noConflict=function(){return a.fn.popover=d,this}}(jQuery),+function(a){"use strict";function b(c,d){var e=a.proxy(this.process,this);this.$body=a("body"),this.$scrollElement=a(a(c).is("body")?window:c),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",e),this.refresh(),this.process()}function c(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})}b.VERSION="3.3.0",b.DEFAULTS={offset:10},b.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},b.prototype.refresh=function(){var b="offset",c=0;a.isWindow(this.$scrollElement[0])||(b="position",c=this.$scrollElement.scrollTop()),this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight();var d=this;this.$body.find(this.selector).map(function(){var d=a(this),e=d.data("target")||d.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[b]().top+c,e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){d.offsets.push(this[0]),d.targets.push(this[1])})},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.getScrollHeight(),d=this.options.offset+c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(this.scrollHeight!=c&&this.refresh(),b>=d)return g!=(a=f[f.length-1])&&this.activate(a);if(g&&b<e[0])return this.activeTarget=null,this.clear();for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(!e[a+1]||b<=e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){this.activeTarget=b,this.clear();var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")},b.prototype.clear=function(){a(this.selector).parentsUntil(this.options.target,".active").removeClass("active")};var d=a.fn.scrollspy;a.fn.scrollspy=c,a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=d,this},a(window).on("load.bs.scrollspy.data-api",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);c.call(b,b.data())})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new c(this)),"string"==typeof b&&e[b]()})}var c=function(b){this.element=a(b)};c.VERSION="3.3.0",c.TRANSITION_DURATION=150,c.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a"),f=a.Event("hide.bs.tab",{relatedTarget:b[0]}),g=a.Event("show.bs.tab",{relatedTarget:e[0]});if(e.trigger(f),b.trigger(g),!g.isDefaultPrevented()&&!f.isDefaultPrevented()){var h=a(d);this.activate(b.closest("li"),c),this.activate(h,h.parent(),function(){e.trigger({type:"hidden.bs.tab",relatedTarget:b[0]}),b.trigger({type:"shown.bs.tab",relatedTarget:e[0]})})}}},c.prototype.activate=function(b,d,e){function f(){g.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),b.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),h?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu")&&b.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),e&&e()}var g=d.find("> .active"),h=e&&a.support.transition&&(g.length&&g.hasClass("fade")||!!d.find("> .fade").length);g.length&&h?g.one("bsTransitionEnd",f).emulateTransitionEnd(c.TRANSITION_DURATION):f(),g.removeClass("in")};var d=a.fn.tab;a.fn.tab=b,a.fn.tab.Constructor=c,a.fn.tab.noConflict=function(){return a.fn.tab=d,this};var e=function(c){c.preventDefault(),b.call(a(this),"show")};a(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',e).on("click.bs.tab.data-api",'[data-toggle="pill"]',e)
}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof b&&b;e||d.data("bs.affix",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function(b,d){this.options=a.extend({},c.DEFAULTS,d),this.$target=a(this.options.target).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(b),this.affixed=this.unpin=this.pinnedOffset=null,this.checkPosition()};c.VERSION="3.3.0",c.RESET="affix affix-top affix-bottom",c.DEFAULTS={offset:0,target:window},c.prototype.getState=function(a,b,c,d){var e=this.$target.scrollTop(),f=this.$element.offset(),g=this.$target.height();if(null!=c&&"top"==this.affixed)return c>e?"top":!1;if("bottom"==this.affixed)return null!=c?e+this.unpin<=f.top?!1:"bottom":a-d>=e+g?!1:"bottom";var h=null==this.affixed,i=h?e:f.top,j=h?g:b;return null!=c&&c>=i?"top":null!=d&&i+j>=a-d?"bottom":!1},c.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(c.RESET).addClass("affix");var a=this.$target.scrollTop(),b=this.$element.offset();return this.pinnedOffset=b.top-a},c.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},c.prototype.checkPosition=function(){if(this.$element.is(":visible")){var b=this.$element.height(),d=this.options.offset,e=d.top,f=d.bottom,g=a("body").height();"object"!=typeof d&&(f=e=d),"function"==typeof e&&(e=d.top(this.$element)),"function"==typeof f&&(f=d.bottom(this.$element));var h=this.getState(g,b,e,f);if(this.affixed!=h){null!=this.unpin&&this.$element.css("top","");var i="affix"+(h?"-"+h:""),j=a.Event(i+".bs.affix");if(this.$element.trigger(j),j.isDefaultPrevented())return;this.affixed=h,this.unpin="bottom"==h?this.getPinnedOffset():null,this.$element.removeClass(c.RESET).addClass(i).trigger(i.replace("affix","affixed")+".bs.affix")}"bottom"==h&&this.$element.offset({top:g-b-f})}};var d=a.fn.affix;a.fn.affix=b,a.fn.affix.Constructor=c,a.fn.affix.noConflict=function(){return a.fn.affix=d,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var c=a(this),d=c.data();d.offset=d.offset||{},null!=d.offsetBottom&&(d.offset.bottom=d.offsetBottom),null!=d.offsetTop&&(d.offset.top=d.offsetTop),b.call(c,d)})})}(jQuery);
(function() {
  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(this);

  var ActionCable = this.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
(function() {


}).call(this);
/*
 CanvasJS HTML5 & JavaScript Charts - v1.9.8.1 GA - http://canvasjs.com/ 
 Copyright 2017 fenopix

  --------------------- License Information --------------------
 CanvasJS is a commercial product which requires purchase of license. Without a commercial license you can use it for evaluation purposes for upto 30 days. Please refer to the following link for further details.
     http://canvasjs.com/license-canvasjs/

*/

(function(){function T(a,c){a.prototype=Pa(c.prototype);a.prototype.constructor=a;a.base=c.prototype}function Pa(a){function c(){}c.prototype=a;return new c}function Ha(a,c,b){"millisecond"===b?a.setMilliseconds(a.getMilliseconds()+1*c):"second"===b?a.setSeconds(a.getSeconds()+1*c):"minute"===b?a.setMinutes(a.getMinutes()+1*c):"hour"===b?a.setHours(a.getHours()+1*c):"day"===b?a.setDate(a.getDate()+1*c):"week"===b?a.setDate(a.getDate()+7*c):"month"===b?a.setMonth(a.getMonth()+1*c):"year"===b&&a.setFullYear(a.getFullYear()+
1*c);return a}function O(a,c){var b=!1;0>a&&(b=!0,a*=-1);a=""+a;for(c=c?c:1;a.length<c;)a="0"+a;return b?"-"+a:a}function ka(a){if(!a)return a;a=a.replace(/^\s\s*/,"");for(var c=/\s/,b=a.length;c.test(a.charAt(--b)););return a.slice(0,b+1)}function Ia(a){a.roundRect=function(a,b,d,f,g,k,h,l){h&&(this.fillStyle=h);l&&(this.strokeStyle=l);"undefined"===typeof g&&(g=5);this.lineWidth=k;this.beginPath();this.moveTo(a+g,b);this.lineTo(a+d-g,b);this.quadraticCurveTo(a+d,b,a+d,b+g);this.lineTo(a+d,b+f-g);
this.quadraticCurveTo(a+d,b+f,a+d-g,b+f);this.lineTo(a+g,b+f);this.quadraticCurveTo(a,b+f,a,b+f-g);this.lineTo(a,b+g);this.quadraticCurveTo(a,b,a+g,b);this.closePath();h&&this.fill();l&&0<k&&this.stroke()}}function ya(a,c){return a-c}function Ja(a,c){return a.x-c.x}function E(a){var c=((a&16711680)>>16).toString(16),b=((a&65280)>>8).toString(16);a=((a&255)>>0).toString(16);c=2>c.length?"0"+c:c;b=2>b.length?"0"+b:b;a=2>a.length?"0"+a:a;return"#"+c+b+a}function Qa(a,c){var b=this.length>>>0,d=Number(c)||
0,d=0>d?Math.ceil(d):Math.floor(d);for(0>d&&(d+=b);d<b;d++)if(d in this&&this[d]===a)return d;return-1}function x(a){return null===a||"undefined"===typeof a}function qa(a){a.indexOf||(a.indexOf=Qa);return a}function Ka(a,c,b){b=b||"normal";var d=a+"_"+c+"_"+b,f=La[d];if(isNaN(f)){try{a="position:absolute; left:0px; top:-20000px; padding:0px;margin:0px;border:none;white-space:pre;line-height:normal;font-family:"+a+"; font-size:"+c+"px; font-weight:"+b+";";if(!$){var g=document.body;$=document.createElement("span");
$.innerHTML="";var k=document.createTextNode("Mpgyi");$.appendChild(k);g.appendChild($)}$.style.display="";$.setAttribute("style",a);f=Math.round($.offsetHeight);$.style.display="none"}catch(h){f=Math.ceil(1.1*c)}f=Math.max(f,c);La[d]=f}return f}function G(a,c){var b=[];if(b={solid:[],shortDash:[3,1],shortDot:[1,1],shortDashDot:[3,1,1,1],shortDashDotDot:[3,1,1,1,1,1],dot:[1,2],dash:[4,2],dashDot:[4,2,1,2],longDash:[8,2],longDashDot:[8,2,1,2],longDashDotDot:[8,2,1,2,1,2]}[a||"solid"])for(var d=0;d<
b.length;d++)b[d]*=c;else b=[];return b}function J(a,c,b,d){return a.addEventListener?(a.addEventListener(c,b,d||!1),b):a.attachEvent?(d=function(d){d=d||window.event;d.preventDefault=d.preventDefault||function(){d.returnValue=!1};d.stopPropagation=d.stopPropagation||function(){d.cancelBubble=!0};b.call(a,d)},a.attachEvent("on"+c,d),d):!1}function Ma(a,c,b){a*=Q;c*=Q;a=b.getImageData(a,c,2,2).data;c=!0;for(b=0;4>b;b++)if(a[b]!==a[b+4]|a[b]!==a[b+8]|a[b]!==a[b+12]){c=!1;break}return c?a[0]<<16|a[1]<<
8|a[2]:0}function K(a,c,b){return a in c?c[a]:b[a]}function ra(a,c,b){if(u&&Na){var d=a.getContext("2d");sa=d.webkitBackingStorePixelRatio||d.mozBackingStorePixelRatio||d.msBackingStorePixelRatio||d.oBackingStorePixelRatio||d.backingStorePixelRatio||1;Q=za/sa;a.width=c*Q;a.height=b*Q;za!==sa&&(a.style.width=c+"px",a.style.height=b+"px",d.scale(Q,Q))}else a.width=c,a.height=b}function Ra(a){if(!Aa){var c=!1,b=!1;"undefined"===typeof aa.Chart.creditHref?(a.creditHref="http://canvasjs.com/",a.creditText=
"CanvasJS.com"):(c=a.updateOption("creditText"),b=a.updateOption("creditHref"));if(a.creditHref&&a.creditText){a._creditLink||(a._creditLink=document.createElement("a"),a._creditLink.setAttribute("class","canvasjs-chart-credit"),a._creditLink.setAttribute("style","outline:none;margin:0px;position:absolute;right:2px;top:"+(a.height-14)+"px;color:dimgrey;text-decoration:none;font-size:11px;font-family: Calibri, Lucida Grande, Lucida Sans Unicode, Arial, sans-serif"),a._creditLink.setAttribute("tabIndex",
-1),a._creditLink.setAttribute("target","_blank"));if(0===a.renderCount||c||b)a._creditLink.setAttribute("href",a.creditHref),a._creditLink.innerHTML=a.creditText;a._creditLink&&a.creditHref&&a.creditText?(a._creditLink.parentElement||a._canvasJSContainer.appendChild(a._creditLink),a._creditLink.style.top=a.height-14+"px"):a._creditLink.parentElement&&a._canvasJSContainer.removeChild(a._creditLink)}}}function ea(a,c){var b=document.createElement("canvas");b.setAttribute("class","canvasjs-chart-canvas");
ra(b,a,c);u||"undefined"===typeof G_vmlCanvasManager||G_vmlCanvasManager.initElement(b);return b}function Ba(a,c,b){if(a&&c&&b){b=b+"."+c;var d="image/"+c;a=a.toDataURL(d);var f=!1,g=document.createElement("a");g.download=b;g.href=a;g.target="_blank";if("undefined"!==typeof Blob&&new Blob){for(var k=a.replace(/^data:[a-z/]*;base64,/,""),k=atob(k),h=new ArrayBuffer(k.length),h=new Uint8Array(h),l=0;l<k.length;l++)h[l]=k.charCodeAt(l);c=new Blob([h.buffer],{type:"image/"+c});try{window.navigator.msSaveBlob(c,
b),f=!0}catch(m){g.dataset.downloadurl=[d,g.download,g.href].join(":"),g.href=window.URL.createObjectURL(c)}}if(!f)try{event=document.createEvent("MouseEvents"),event.initMouseEvent("click",!0,!1,window,0,0,0,0,0,!1,!1,!1,!1,0,null),g.dispatchEvent?g.dispatchEvent(event):g.fireEvent&&g.fireEvent("onclick")}catch(p){c=window.open(),c.document.write("<img src='"+a+"'></img><div>Please right click on the image and save it to your device</div>"),c.document.close()}}}function S(a,c,b){c.getAttribute("state")!==
b&&(c.setAttribute("state",b),c.setAttribute("type","button"),c.style.position="relative",c.style.margin="0px 0px 0px 0px",c.style.padding="3px 4px 0px 4px",c.style.cssFloat="left",c.setAttribute("title",a._cultureInfo[b+"Text"]),c.innerHTML="<img style='height:16px;' src='"+Sa[b].image+"' alt='"+a._cultureInfo[b+"Text"]+"' />")}function ta(){for(var a=null,c=0;c<arguments.length;c++)a=arguments[c],a.style&&(a.style.display="inline")}function X(){for(var a=null,c=0;c<arguments.length;c++)(a=arguments[c])&&
a.style&&(a.style.display="none")}function L(a,c,b,d){this._defaultsKey=a;this.parent=d;this._eventListeners=[];d={};b&&(ga[b]&&ga[b][a])&&(d=ga[b][a]);this.options=c?c:{_isPlaceholder:!0};this.setOptions(this.options,d)}function A(a,c){c=c||{};A.base.constructor.call(this,"Chart",c,c.theme?c.theme:"theme1");var b=this;this._containerId=a;this._objectsInitialized=!1;this.overlaidCanvasCtx=this.ctx=null;this._indexLabels=[];this._panTimerId=0;this._lastTouchEventType="";this._lastTouchData=null;this.isAnimating=
!1;this.renderCount=0;this.panEnabled=this.disableToolTip=this.animatedRender=!1;this._defaultCursor="default";this.plotArea={canvas:null,ctx:null,x1:0,y1:0,x2:0,y2:0,width:0,height:0};this._dataInRenderedOrder=[];if(this.container="string"===typeof this._containerId?document.getElementById(this._containerId):this._containerId){this.container.innerHTML="";var d=0,f=0,d=this.options.width?this.width:0<this.container.clientWidth?this.container.clientWidth:this.width,f=this.options.height?this.height:
0<this.container.clientHeight?this.container.clientHeight:this.height;this.width=d;this.height=f;this.x1=this.y1=0;this.x2=this.width;this.y2=this.height;this._selectedColorSet="undefined"!==typeof fa[this.colorSet]?fa[this.colorSet]:fa.colorSet1;this._canvasJSContainer=document.createElement("div");this._canvasJSContainer.setAttribute("class","canvasjs-chart-container");this._canvasJSContainer.style.position="relative";this._canvasJSContainer.style.textAlign="left";this._canvasJSContainer.style.cursor=
"auto";u||(this._canvasJSContainer.style.height="0px");this.container.appendChild(this._canvasJSContainer);this.canvas=ea(d,f);this.canvas.style.position="absolute";this.canvas.getContext&&(this._canvasJSContainer.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d"),this.ctx.textBaseline="top",Ia(this.ctx),u?this.plotArea.ctx=this.ctx:(this.plotArea.canvas=ea(d,f),this.plotArea.canvas.style.position="absolute",this.plotArea.canvas.setAttribute("class","plotAreaCanvas"),this._canvasJSContainer.appendChild(this.plotArea.canvas),
this.plotArea.ctx=this.plotArea.canvas.getContext("2d")),this.overlaidCanvas=ea(d,f),this.overlaidCanvas.style.position="absolute",this._canvasJSContainer.appendChild(this.overlaidCanvas),this.overlaidCanvasCtx=this.overlaidCanvas.getContext("2d"),this.overlaidCanvasCtx.textBaseline="top",this._eventManager=new la(this),this.windowResizeHandler=J(window,"resize",function(){b._updateSize()&&b.render()}),this._toolBar=document.createElement("div"),this._toolBar.setAttribute("class","canvasjs-chart-toolbar"),
this._toolBar.style.cssText="position: absolute; right: 1px; top: 1px;",this._canvasJSContainer.appendChild(this._toolBar),this.bounds={x1:0,y1:0,x2:this.width,y2:this.height},J(this.overlaidCanvas,"click",function(a){b._mouseEventHandler(a)}),J(this.overlaidCanvas,"mousemove",function(a){b._mouseEventHandler(a)}),J(this.overlaidCanvas,"mouseup",function(a){b._mouseEventHandler(a)}),J(this.overlaidCanvas,"mousedown",function(a){b._mouseEventHandler(a);X(b._dropdownMenu)}),J(this.overlaidCanvas,"mouseout",
function(a){b._mouseEventHandler(a)}),J(this.overlaidCanvas,window.navigator.msPointerEnabled?"MSPointerDown":"touchstart",function(a){b._touchEventHandler(a)}),J(this.overlaidCanvas,window.navigator.msPointerEnabled?"MSPointerMove":"touchmove",function(a){b._touchEventHandler(a)}),J(this.overlaidCanvas,window.navigator.msPointerEnabled?"MSPointerUp":"touchend",function(a){b._touchEventHandler(a)}),J(this.overlaidCanvas,window.navigator.msPointerEnabled?"MSPointerCancel":"touchcancel",function(a){b._touchEventHandler(a)}),
this.toolTip=new R(this,this.options.toolTip),this.data=null,this.axisX=[],this.axisX2=[],this.axisY=[],this.axisY2=[],this.sessionVariables={axisX:[],axisX2:[],axisY:[],axisY2:[]})}else window.console&&window.console.log('CanvasJS Error: Chart Container with id "'+this._containerId+'" was not found')}function ua(a,c){for(var b=[],d,f=0;f<a.length;f++)if(0==f)b.push(a[0]);else{var g,k,h;h=f-1;g=0===h?0:h-1;k=h===a.length-1?h:h+1;d=Math.abs((a[k].x-a[g].x)/(0===a[k].x-a[h].x?0.01:a[k].x-a[h].x))*(c-
1)/2+1;var l=(a[k].x-a[g].x)/d;d=(a[k].y-a[g].y)/d;b[b.length]=a[h].x>a[g].x&&0<l||a[h].x<a[g].x&&0>l?{x:a[h].x+l/3,y:a[h].y+d/3}:{x:a[h].x,y:a[h].y+d/9};h=f;g=0===h?0:h-1;k=h===a.length-1?h:h+1;d=Math.abs((a[k].x-a[g].x)/(0===a[h].x-a[g].x?0.01:a[h].x-a[g].x))*(c-1)/2+1;l=(a[k].x-a[g].x)/d;d=(a[k].y-a[g].y)/d;b[b.length]=a[h].x>a[g].x&&0<l||a[h].x<a[g].x&&0>l?{x:a[h].x-l/3,y:a[h].y-d/3}:{x:a[h].x,y:a[h].y-d/9};b[b.length]=a[f]}return b}function Oa(a,c){if(null===a||"undefined"===typeof a)return c;
var b=parseFloat(a.toString())*(0<=a.toString().indexOf("%")?c/100:1);return!isNaN(b)&&b<=c&&0<=b?b:c}function ha(a,c,b,d,f){"undefined"===typeof f&&(f=0);this._padding=f;this._x1=a;this._y1=c;this._x2=b;this._y2=d;this._rightOccupied=this._leftOccupied=this._bottomOccupied=this._topOccupied=this._padding}function V(a,c){V.base.constructor.call(this,"TextBlock",c);this.ctx=a;this._isDirty=!0;this._wrappedText=null}function ma(a,c){ma.base.constructor.call(this,"Title",c,a.theme,a);this.chart=a;this.canvas=
a.canvas;this.ctx=this.chart.ctx;this.optionsName="title";if(x(this.options.margin)&&a.options.subtitles)for(var b=a.options.subtitles,d=0;d<b.length;d++)if((x(b[d].horizontalAlign)&&"center"===this.horizontalAlign||b[d].horizontalAlign===this.horizontalAlign)&&(x(b[d].verticalAlign)&&"top"===this.verticalAlign||b[d].verticalAlign===this.verticalAlign)&&!b[d].dockInsidePlotArea===!this.dockInsidePlotArea){this.margin=0;break}"undefined"===typeof this.options.fontSize&&(this.fontSize=this.chart.getAutoFontSize(this.fontSize));
this.height=this.width=null;this.bounds={x1:null,y1:null,x2:null,y2:null}}function va(a,c){va.base.constructor.call(this,"Subtitle",c,a.theme,a);this.chart=a;this.canvas=a.canvas;this.ctx=this.chart.ctx;this.optionsName="subtitles";this.isOptionsInArray=!0;"undefined"===typeof this.options.fontSize&&(this.fontSize=this.chart.getAutoFontSize(this.fontSize));this.height=this.width=null;this.bounds={x1:null,y1:null,x2:null,y2:null}}function wa(a,c){wa.base.constructor.call(this,"Legend",c,a.theme,a);
this.chart=a;this.canvas=a.canvas;this.ctx=this.chart.ctx;this.ghostCtx=this.chart._eventManager.ghostCtx;this.items=[];this.optionsName="legend";this.height=this.width=0;this.orientation=null;this.dataSeries=[];this.bounds={x1:null,y1:null,x2:null,y2:null};"undefined"===typeof this.options.fontSize&&(this.fontSize=this.chart.getAutoFontSize(this.fontSize));this.lineHeight=Ka(this.fontFamily,this.fontSize,this.fontWeight);this.horizontalSpacing=this.fontSize}function Ca(a,c){Ca.base.constructor.call(this,
c);this.chart=a;this.canvas=a.canvas;this.ctx=this.chart.ctx}function Z(a,c,b,d){Z.base.constructor.call(this,"DataSeries",c,a.theme,a);this.chart=a;this.canvas=a.canvas;this._ctx=a.canvas.ctx;this.index=b;this.noDataPointsInPlotArea=0;this.id=d;this.chart._eventManager.objectMap[d]={id:d,objectType:"dataSeries",dataSeriesIndex:b};this.dataPointIds=[];this.plotUnit=[];this.axisY=this.axisX=null;this.optionsName="data";this.isOptionsInArray=!0;null===this.fillOpacity&&(this.type.match(/area/i)?this.fillOpacity=
0.7:this.fillOpacity=1);this.axisPlacement=this.getDefaultAxisPlacement();"undefined"===typeof this.options.indexLabelFontSize&&(this.indexLabelFontSize=this.chart.getAutoFontSize(this.indexLabelFontSize))}function C(a,c,b,d,f){C.base.constructor.call(this,"Axis",c,a.theme,a);this.chart=a;this.canvas=a.canvas;this.ctx=a.ctx;this.intervalStartPosition=this.maxHeight=this.maxWidth=0;this.labels=[];this.dataSeries=[];this._stripLineLabels=this._ticks=this._labels=null;this.dataInfo={min:Infinity,max:-Infinity,
viewPortMin:Infinity,viewPortMax:-Infinity,minDiff:Infinity};this.isOptionsInArray=!0;"axisX"===b?("left"===d||"bottom"===d?(this.optionsName="axisX",x(this.chart.sessionVariables.axisX[f])&&(this.chart.sessionVariables.axisX[f]={}),this.sessionVariables=this.chart.sessionVariables.axisX[f]):(this.optionsName="axisX2",x(this.chart.sessionVariables.axisX2[f])&&(this.chart.sessionVariables.axisX2[f]={}),this.sessionVariables=this.chart.sessionVariables.axisX2[f]),this.options.interval||(this.intervalType=
null),"theme2"===this.chart.theme&&x(this.options.lineThickness)&&(this.lineThickness=2)):"left"===d||"top"===d?(this.optionsName="axisY",x(this.chart.sessionVariables.axisY[f])&&(this.chart.sessionVariables.axisY[f]={}),this.sessionVariables=this.chart.sessionVariables.axisY[f]):(this.optionsName="axisY2",x(this.chart.sessionVariables.axisY2[f])&&(this.chart.sessionVariables.axisY2[f]={}),this.sessionVariables=this.chart.sessionVariables.axisY2[f]);"undefined"===typeof this.options.titleFontSize&&
(this.titleFontSize=this.chart.getAutoFontSize(this.titleFontSize));"undefined"===typeof this.options.labelFontSize&&(this.labelFontSize=this.chart.getAutoFontSize(this.labelFontSize));this.type=b;"axisX"!==b||c&&"undefined"!==typeof c.gridThickness||(this.gridThickness=0);this._position=d;this.lineCoordinates={x1:null,y1:null,x2:null,y2:null,width:null};this.labelAngle=(this.labelAngle%360+360)%360;90<this.labelAngle&&270>this.labelAngle?this.labelAngle-=180:270<=this.labelAngle&&360>=this.labelAngle&&
(this.labelAngle-=360);if(this.options.stripLines&&0<this.options.stripLines.length)for(this.stripLines=[],c=0;c<this.options.stripLines.length;c++)this.stripLines.push(new na(this.chart,this.options.stripLines[c],a.theme,++this.chart._eventManager.lastObjectId,this));this._titleTextBlock=null;this.hasOptionChanged("viewportMinimum")&&null===this.viewportMinimum&&(this.options.viewportMinimum=void 0,this.sessionVariables.viewportMinimum=null);this.hasOptionChanged("viewportMinimum")||isNaN(this.sessionVariables.newViewportMinimum)||
null===this.sessionVariables.newViewportMinimum?this.sessionVariables.newViewportMinimum=null:this.viewportMinimum=this.sessionVariables.newViewportMinimum;this.hasOptionChanged("viewportMaximum")&&null===this.viewportMaximum&&(this.options.viewportMaximum=void 0,this.sessionVariables.viewportMaximum=null);this.hasOptionChanged("viewportMaximum")||isNaN(this.sessionVariables.newViewportMaximum)||null===this.sessionVariables.newViewportMaximum?this.sessionVariables.newViewportMaximum=null:this.viewportMaximum=
this.sessionVariables.newViewportMaximum;null!==this.minimum&&null!==this.viewportMinimum&&(this.viewportMinimum=Math.max(this.viewportMinimum,this.minimum));null!==this.maximum&&null!==this.viewportMaximum&&(this.viewportMaximum=Math.min(this.viewportMaximum,this.maximum));this.trackChanges("viewportMinimum");this.trackChanges("viewportMaximum")}function na(a,c,b,d,f){na.base.constructor.call(this,"StripLine",c,b,f);this.id=d;this.chart=a;this.ctx=this.chart.ctx;this.label=this.label;this.axis=f;
this.optionsName="stripLines";this.isOptionsInArray=!0;this._thicknessType="pixel";null!==this.startValue&&null!==this.endValue&&(this.value=f.logarithmic?Math.sqrt((this.startValue.getTime?this.startValue.getTime():this.startValue)*(this.endValue.getTime?this.endValue.getTime():this.endValue)):((this.startValue.getTime?this.startValue.getTime():this.startValue)+(this.endValue.getTime?this.endValue.getTime():this.endValue))/2,this.thickness=f.logarithmic?Math.log(this.endValue/this.startValue)/Math.log(f.logarithmBase):
Math.max(this.endValue-this.startValue),this._thicknessType="value")}function R(a,c){R.base.constructor.call(this,"ToolTip",c,a.theme,a);this.chart=a;this.canvas=a.canvas;this.ctx=this.chart.ctx;this.currentDataPointIndex=this.currentSeriesIndex=-1;this._timerId=0;this._prevY=this._prevX=NaN;this.optionsName="toolTip";this._initialize()}function la(a){this.chart=a;this.lastObjectId=0;this.objectMap=[];this.rectangularRegionEventSubscriptions=[];this.previousDataPointEventObject=null;this.ghostCanvas=
ea(this.chart.width,this.chart.height);this.ghostCtx=this.ghostCanvas.getContext("2d");this.mouseoveredObjectMaps=[]}function oa(a){var c;a&&pa[a]&&(c=pa[a]);oa.base.constructor.call(this,"CultureInfo",c)}function Da(a){this.chart=a;this.ctx=this.chart.plotArea.ctx;this.animations=[];this.animationRequestId=null}var y={},u=!!document.createElement("canvas").getContext,aa={Chart:{width:500,height:400,zoomEnabled:!1,zoomType:"x",backgroundColor:"white",theme:"theme1",animationEnabled:!1,animationDuration:1200,
dataPointWidth:null,dataPointMinWidth:null,dataPointMaxWidth:null,colorSet:"colorSet1",culture:"en",creditText:"CanvasJS",interactivityEnabled:!0,exportEnabled:!1,exportFileName:"Chart",rangeChanging:null,rangeChanged:null,publicProperties:{title:"readWrite",subtitles:"readWrite",toolTip:"readWrite",legend:"readWrite",axisX:"readWrite",axisY:"readWrite",axisX2:"readWrite",axisY2:"readWrite",data:"readWrite",options:"readWrite",bounds:"readOnly",container:"readOnly"}},Title:{padding:0,text:null,verticalAlign:"top",
horizontalAlign:"center",fontSize:20,fontFamily:"Calibri",fontWeight:"normal",fontColor:"black",fontStyle:"normal",borderThickness:0,borderColor:"black",cornerRadius:0,backgroundColor:u?"transparent":null,margin:5,wrap:!0,maxWidth:null,dockInsidePlotArea:!1,publicProperties:{options:"readWrite",bounds:"readOnly",chart:"readOnly"}},Subtitle:{padding:0,text:null,verticalAlign:"top",horizontalAlign:"center",fontSize:14,fontFamily:"Calibri",fontWeight:"normal",fontColor:"black",fontStyle:"normal",borderThickness:0,
borderColor:"black",cornerRadius:0,backgroundColor:null,margin:2,wrap:!0,maxWidth:null,dockInsidePlotArea:!1,publicProperties:{options:"readWrite",bounds:"readOnly",chart:"readOnly"}},Legend:{name:null,verticalAlign:"center",horizontalAlign:"right",fontSize:14,fontFamily:"calibri",fontWeight:"normal",fontColor:"black",fontStyle:"normal",cursor:null,itemmouseover:null,itemmouseout:null,itemmousemove:null,itemclick:null,dockInsidePlotArea:!1,reversed:!1,backgroundColor:u?"transparent":null,borderColor:u?
"transparent":null,borderThickness:0,cornerRadius:0,maxWidth:null,maxHeight:null,markerMargin:null,itemMaxWidth:null,itemWidth:null,itemWrap:!0,itemTextFormatter:null,publicProperties:{options:"readWrite",bounds:"readOnly",chart:"readOnly"}},ToolTip:{enabled:!0,shared:!1,animationEnabled:!0,content:null,contentFormatter:null,reversed:!1,backgroundColor:u?"rgba(255,255,255,.9)":"rgb(255,255,255)",borderColor:null,borderThickness:2,cornerRadius:5,fontSize:14,fontColor:"black",fontFamily:"Calibri, Arial, Georgia, serif;",
fontWeight:"normal",fontStyle:"italic",publicProperties:{options:"readWrite",chart:"readOnly"}},Axis:{minimum:null,maximum:null,viewportMinimum:null,viewportMaximum:null,interval:null,intervalType:null,reversed:!1,logarithmic:!1,logarithmBase:10,title:null,titleFontColor:"black",titleFontSize:20,titleFontFamily:"arial",titleFontWeight:"normal",titleFontStyle:"normal",titleWrap:!0,titleMaxWidth:null,titleBackgroundColor:u?"transparent":null,titleBorderColor:u?"transparent":null,titleBorderThickness:0,
titleCornerRadius:0,labelAngle:0,labelFontFamily:"arial",labelFontColor:"black",labelFontSize:12,labelFontWeight:"normal",labelFontStyle:"normal",labelAutoFit:!0,labelWrap:!0,labelMaxWidth:null,labelFormatter:null,labelBackgroundColor:u?"transparent":null,labelBorderColor:u?"transparent":null,labelBorderThickness:0,labelCornerRadius:0,prefix:"",suffix:"",includeZero:!0,tickLength:5,tickColor:"black",tickThickness:1,lineColor:"black",lineThickness:1,lineDashType:"solid",gridColor:"A0A0A0",gridThickness:0,
gridDashType:"solid",interlacedColor:u?"transparent":null,valueFormatString:null,margin:2,stripLines:[],publicProperties:{options:"readWrite",bounds:"readOnly",chart:"readOnly"}},StripLine:{value:null,startValue:null,endValue:null,color:"orange",opacity:null,thickness:2,lineDashType:"solid",label:"",labelPlacement:"inside",labelAlign:"far",labelWrap:!0,labelMaxWidth:null,labelBackgroundColor:u?"transparent":null,labelBorderColor:u?"transparent":null,labelBorderThickness:0,labelCornerRadius:0,labelFontFamily:"arial",
labelFontColor:"orange",labelFontSize:12,labelFontWeight:"normal",labelFontStyle:"normal",labelFormatter:null,showOnTop:!1,publicProperties:{options:"readWrite",axis:"readOnly",bounds:"readOnly",chart:"readOnly"}},DataSeries:{name:null,dataPoints:null,label:"",bevelEnabled:!1,highlightEnabled:!0,cursor:"default",indexLabel:"",indexLabelPlacement:"auto",indexLabelOrientation:"horizontal",indexLabelFontColor:"black",indexLabelFontSize:12,indexLabelFontStyle:"normal",indexLabelFontFamily:"Arial",indexLabelFontWeight:"normal",
indexLabelBackgroundColor:null,indexLabelLineColor:"gray",indexLabelLineThickness:1,indexLabelLineDashType:"solid",indexLabelMaxWidth:null,indexLabelWrap:!0,indexLabelFormatter:null,lineThickness:2,lineDashType:"solid",connectNullData:!1,nullDataLineDashType:"dash",color:null,lineColor:null,risingColor:"white",fillOpacity:null,startAngle:0,radius:null,innerRadius:null,type:"column",xValueType:"number",axisXType:"primary",axisYType:"primary",axisXIndex:0,axisYIndex:0,xValueFormatString:null,yValueFormatString:null,
zValueFormatString:null,percentFormatString:null,showInLegend:null,legendMarkerType:null,legendMarkerColor:null,legendText:null,legendMarkerBorderColor:u?"transparent":null,legendMarkerBorderThickness:0,markerType:"circle",markerColor:null,markerSize:null,markerBorderColor:u?"transparent":null,markerBorderThickness:0,mouseover:null,mouseout:null,mousemove:null,click:null,toolTipContent:null,visible:!0,publicProperties:{options:"readWrite",axisX:"readWrite",axisY:"readWrite",chart:"readOnly"}},TextBlock:{x:0,
y:0,width:null,height:null,maxWidth:null,maxHeight:null,padding:0,angle:0,text:"",horizontalAlign:"center",fontSize:12,fontFamily:"calibri",fontWeight:"normal",fontColor:"black",fontStyle:"normal",borderThickness:0,borderColor:"black",cornerRadius:0,backgroundColor:null,textBaseline:"top"},CultureInfo:{decimalSeparator:".",digitGroupSeparator:",",zoomText:"Zoom",panText:"Pan",resetText:"Reset",menuText:"More Options",saveJPGText:"Save as JPEG",savePNGText:"Save as PNG",printText:"Print",days:"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),
shortDays:"Sun Mon Tue Wed Thu Fri Sat".split(" "),months:"January February March April May June July August September October November December".split(" "),shortMonths:"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")}},pa={en:{}},fa={colorSet1:"#369EAD #C24642 #7F6084 #86B402 #A2D1CF #C8B631 #6DBCEB #52514E #4F81BC #A064A1 #F79647".split(" "),colorSet2:"#4F81BC #C0504E #9BBB58 #23BFAA #8064A1 #4AACC5 #F79647 #33558B".split(" "),colorSet3:"#8CA1BC #36845C #017E82 #8CB9D0 #708C98 #94838D #F08891 #0366A7 #008276 #EE7757 #E5BA3A #F2990B #03557B #782970".split(" ")},
ga={theme1:{Chart:{colorSet:"colorSet1"},Title:{fontFamily:u?"Calibri, Optima, Candara, Verdana, Geneva, sans-serif":"calibri",fontSize:33,fontColor:"#3A3A3A",fontWeight:"bold",verticalAlign:"top",margin:5},Subtitle:{fontFamily:u?"Calibri, Optima, Candara, Verdana, Geneva, sans-serif":"calibri",fontSize:16,fontColor:"#3A3A3A",fontWeight:"bold",verticalAlign:"top",margin:5},Axis:{titleFontSize:26,titleFontColor:"#666666",titleFontFamily:u?"Calibri, Optima, Candara, Verdana, Geneva, sans-serif":"calibri",
labelFontFamily:u?"Calibri, Optima, Candara, Verdana, Geneva, sans-serif":"calibri",labelFontSize:18,labelFontColor:"grey",tickColor:"#BBBBBB",tickThickness:2,gridThickness:2,gridColor:"#BBBBBB",lineThickness:2,lineColor:"#BBBBBB"},Legend:{verticalAlign:"bottom",horizontalAlign:"center",fontFamily:u?"monospace, sans-serif,arial black":"calibri"},DataSeries:{indexLabelFontColor:"grey",indexLabelFontFamily:u?"Calibri, Optima, Candara, Verdana, Geneva, sans-serif":"calibri",indexLabelFontSize:18,indexLabelLineThickness:1}},
theme2:{Chart:{colorSet:"colorSet2"},Title:{fontFamily:"impact, charcoal, arial black, sans-serif",fontSize:32,fontColor:"#333333",verticalAlign:"top",margin:5},Subtitle:{fontFamily:"impact, charcoal, arial black, sans-serif",fontSize:14,fontColor:"#333333",verticalAlign:"top",margin:5},Axis:{titleFontSize:22,titleFontColor:"rgb(98,98,98)",titleFontFamily:u?"monospace, sans-serif,arial black":"arial",titleFontWeight:"bold",labelFontFamily:u?"monospace, Courier New, Courier":"arial",labelFontSize:16,
labelFontColor:"grey",labelFontWeight:"bold",tickColor:"grey",tickThickness:2,gridThickness:2,gridColor:"grey",lineColor:"grey",lineThickness:0},Legend:{verticalAlign:"bottom",horizontalAlign:"center",fontFamily:u?"monospace, sans-serif,arial black":"arial"},DataSeries:{indexLabelFontColor:"grey",indexLabelFontFamily:u?"Courier New, Courier, monospace":"arial",indexLabelFontWeight:"bold",indexLabelFontSize:18,indexLabelLineThickness:1}},theme3:{Chart:{colorSet:"colorSet1"},Title:{fontFamily:u?"Candara, Optima, Trebuchet MS, Helvetica Neue, Helvetica, Trebuchet MS, serif":
"calibri",fontSize:32,fontColor:"#3A3A3A",fontWeight:"bold",verticalAlign:"top",margin:5},Subtitle:{fontFamily:u?"Candara, Optima, Trebuchet MS, Helvetica Neue, Helvetica, Trebuchet MS, serif":"calibri",fontSize:16,fontColor:"#3A3A3A",fontWeight:"bold",verticalAlign:"top",margin:5},Axis:{titleFontSize:22,titleFontColor:"rgb(98,98,98)",titleFontFamily:u?"Verdana, Geneva, Calibri, sans-serif":"calibri",labelFontFamily:u?"Calibri, Optima, Candara, Verdana, Geneva, sans-serif":"calibri",labelFontSize:18,
labelFontColor:"grey",tickColor:"grey",tickThickness:2,gridThickness:2,gridColor:"grey",lineThickness:2,lineColor:"grey"},Legend:{verticalAlign:"bottom",horizontalAlign:"center",fontFamily:u?"monospace, sans-serif,arial black":"calibri"},DataSeries:{bevelEnabled:!0,indexLabelFontColor:"grey",indexLabelFontFamily:u?"Candara, Optima, Calibri, Verdana, Geneva, sans-serif":"calibri",indexLabelFontSize:18,indexLabelLineColor:"lightgrey",indexLabelLineThickness:2}}},I={numberDuration:1,yearDuration:314496E5,
monthDuration:2592E6,weekDuration:6048E5,dayDuration:864E5,hourDuration:36E5,minuteDuration:6E4,secondDuration:1E3,millisecondDuration:1,dayOfWeekFromInt:"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ")},La={},$=null,Ea=function(){var a=/D{1,4}|M{1,4}|Y{1,4}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|f{1,3}|t{1,2}|T{1,2}|K|z{1,3}|"[^"]*"|'[^']*'/g,c="Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),b="Sun Mon Tue Wed Thu Fri Sat".split(" "),d="January February March April May June July August September October November December".split(" "),
f="Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),g=/\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,k=/[^-+\dA-Z]/g;return function(h,l,m){var p=m?m.days:c,n=m?m.months:d,e=m?m.shortDays:b,q=m?m.shortMonths:f;m="";var r=!1;h=h&&h.getTime?h:h?new Date(h):new Date;if(isNaN(h))throw SyntaxError("invalid date");"UTC:"===l.slice(0,4)&&(l=l.slice(4),r=!0);m=r?"getUTC":"get";var s=h[m+"Date"](),z=h[m+"Day"](),
v=h[m+"Month"](),t=h[m+"FullYear"](),w=h[m+"Hours"](),u=h[m+"Minutes"](),Y=h[m+"Seconds"](),B=h[m+"Milliseconds"](),x=r?0:h.getTimezoneOffset();return m=l.replace(a,function(a){switch(a){case "D":return s;case "DD":return O(s,2);case "DDD":return e[z];case "DDDD":return p[z];case "M":return v+1;case "MM":return O(v+1,2);case "MMM":return q[v];case "MMMM":return n[v];case "Y":return parseInt(String(t).slice(-2));case "YY":return O(String(t).slice(-2),2);case "YYY":return O(String(t).slice(-3),3);case "YYYY":return O(t,
4);case "h":return w%12||12;case "hh":return O(w%12||12,2);case "H":return w;case "HH":return O(w,2);case "m":return u;case "mm":return O(u,2);case "s":return Y;case "ss":return O(Y,2);case "f":return String(B).slice(0,1);case "ff":return O(String(B).slice(0,2),2);case "fff":return O(String(B).slice(0,3),3);case "t":return 12>w?"a":"p";case "tt":return 12>w?"am":"pm";case "T":return 12>w?"A":"P";case "TT":return 12>w?"AM":"PM";case "K":return r?"UTC":(String(h).match(g)||[""]).pop().replace(k,"");
case "z":return(0<x?"-":"+")+Math.floor(Math.abs(x)/60);case "zz":return(0<x?"-":"+")+O(Math.floor(Math.abs(x)/60),2);case "zzz":return(0<x?"-":"+")+O(Math.floor(Math.abs(x)/60),2)+O(Math.abs(x)%60,2);default:return a.slice(1,a.length-1)}})}}(),ba=function(a,c,b){if(null===a)return"";a=Number(a);var d=0>a?!0:!1;d&&(a*=-1);var f=b?b.decimalSeparator:".",g=b?b.digitGroupSeparator:",",k="";c=String(c);var k=1,h=b="",l=-1,m=[],p=[],n=0,e=0,q=0,r=!1,s=0,h=c.match(/"[^"]*"|'[^']*'|[eE][+-]*[0]+|[,]+[.]|\u2030|./g);
c=null;for(var z=0;h&&z<h.length;z++)if(c=h[z],"."===c&&0>l)l=z;else{if("%"===c)k*=100;else if("\u2030"===c){k*=1E3;continue}else if(","===c[0]&&"."===c[c.length-1]){k/=Math.pow(1E3,c.length-1);l=z+c.length-1;continue}else"E"!==c[0]&&"e"!==c[0]||"0"!==c[c.length-1]||(r=!0);0>l?(m.push(c),"#"===c||"0"===c?n++:","===c&&q++):(p.push(c),"#"!==c&&"0"!==c||e++)}r&&(c=Math.floor(a),h=-Math.floor(Math.log(a)/Math.LN10+1),s=0===a?0:0===c?-(n+h):String(c).length-n,k/=Math.pow(10,s));0>l&&(l=z);k=(a*k).toFixed(e);
c=k.split(".");k=(c[0]+"").split("");a=(c[1]+"").split("");k&&"0"===k[0]&&k.shift();for(r=h=z=e=l=0;0<m.length;)if(c=m.pop(),"#"===c||"0"===c)if(l++,l===n){var v=k,k=[];if("0"===c)for(c=n-e-(v?v.length:0);0<c;)v.unshift("0"),c--;for(;0<v.length;)b=v.pop()+b,r++,0===r%h&&(z===q&&0<v.length)&&(b=g+b)}else 0<k.length?(b=k.pop()+b,e++,r++):"0"===c&&(b="0"+b,e++,r++),0===r%h&&(z===q&&0<k.length)&&(b=g+b);else"E"!==c[0]&&"e"!==c[0]||"0"!==c[c.length-1]||!/[eE][+-]*[0]+/.test(c)?","===c?(z++,h=r,r=0,0<k.length&&
(b=g+b)):b=1<c.length&&('"'===c[0]&&'"'===c[c.length-1]||"'"===c[0]&&"'"===c[c.length-1])?c.slice(1,c.length-1)+b:c+b:(c=0>s?c.replace("+","").replace("-",""):c.replace("-",""),b+=c.replace(/[0]+/,function(a){return O(s,a.length)}));g="";for(m=!1;0<p.length;)c=p.shift(),"#"===c||"0"===c?0<a.length&&0!==Number(a.join(""))?(g+=a.shift(),m=!0):"0"===c&&(g+="0",m=!0):1<c.length&&('"'===c[0]&&'"'===c[c.length-1]||"'"===c[0]&&"'"===c[c.length-1])?g+=c.slice(1,c.length-1):"E"!==c[0]&&"e"!==c[0]||"0"!==c[c.length-
1]||!/[eE][+-]*[0]+/.test(c)?g+=c:(c=0>s?c.replace("+","").replace("-",""):c.replace("-",""),g+=c.replace(/[0]+/,function(a){return O(s,a.length)}));b+=(m?f:"")+g;return d?"-"+b:b},xa=function(a){var c=0,b=0;a=a||window.event;a.offsetX||0===a.offsetX?(c=a.offsetX,b=a.offsetY):a.layerX||0==a.layerX?(c=a.layerX,b=a.layerY):(c=a.pageX-a.target.offsetLeft,b=a.pageY-a.target.offsetTop);return{x:c,y:b}},Na=!0,za=window.devicePixelRatio||1,sa=1,Q=Na?za/sa:1,Aa=window&&window.location&&window.location.href&&
window.location.href.indexOf&&(-1!==window.location.href.indexOf("canvasjs.com")||-1!==window.location.href.indexOf("fenopix.com")||-1!==window.location.href.indexOf("fiddle")),Sa={reset:{image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAcCAYAAAAAwr0iAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAKRSURBVEiJrdY/iF1FFMfxzwnZrGISUSR/JLGIhoh/QiRNBLWxMLIWEkwbgiAoFgoW2mhlY6dgpY2IlRBRxBSKhSAKIklWJRYuMZKAhiyopAiaTY7FvRtmZ+/ed9/zHRjezLw5v/O9d86cuZGZpmURAfdn5o9DfdZNLXpjz+LziPgyIl6MiG0jPTJzZBuyDrP4BVm0P/AKbljTb4ToY/gGewYA7KyCl+1b3DUYANvwbiHw0gCAGRzBOzjTAXEOu0cC4Ch+r5x/HrpdrcZmvIDFSucMtnYCYC++6HmNDw8FKDT34ETrf639/azOr5vwRk/g5fbeuABtgC04XWk9VQLciMP4EH/3AFzErRNC7MXlQmsesSoHsGPE23hmEoBW+61K66HMXFmIMvN8myilXS36R01ub+KfYvw43ZXwYDX+AHP4BAci4pFJomfmr/ihmNofESsBImJGk7mlncrM45n5JPbhz0kAWpsv+juxaX21YIPmVJS2uNzJMS6ZNexC0d+I7fUWXLFyz2kSZlpWPvASlmqAf/FXNXf3FAF2F/1LuFifAlionB6dRuSI2IwHi6lzmXmp6xR8XY0fiIh7psAwh+3FuDkRHQVjl+a8lkXjo0kLUKH7XaV5oO86PmZ1FTzyP4K/XGl9v/zwfbW7BriiuETGCP5ch9bc9f97HF/vcFzCa5gdEPgWq+t/4v0V63oE1uF4h0DiFJ7HnSWMppDdh1dxtsPvJ2wcBNAKbsJXa0Ck5opdaBPsRNu/usba09i1KsaAVzmLt3sghrRjuK1Tf4xkegInxwy8gKf7dKMVH2QRsV5zXR/Cftyu+aKaKbbkQrsdH+PTzLzcqzkOQAVzM+7FHdiqqe2/YT4zF/t8S/sPmawyvC974vcAAAAASUVORK5CYII="},
pan:{image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAJVSURBVFiFvZe7a1RBGMV/x2hWI4JpfKCIiSBKOoOCkID/wP4BFqIIFkE02ChIiC8QDKlSiI3YqRBsBVGwUNAUdiIEUgjiAzQIIsuKJsfizsXr5t7d+8jmwLDfzHz3nLOzc7+ZxTZlGyDgZiWOCuJ9wH2gCUyuqQFgF/AGcKJNrYkBYBj40CIet+muGQi/96kM4WS7C/Tm5VUg7whJg8BkEGkCR4BDYfodsADUgP6wErO5iCtswsuJb32hdbXy8qzL5TIdmzJinHdZoZIBZcSFkGlAKs1Z3YCketZcBtouuaQNkrblMiBpBrhme7mAgU4wMCvpcFsDkq4C54DFVRTH9h+i6vlE0r5UA5ImgCuh28jB28iIs7BIVCOeStoZD64P4uPAjUTygKSx2FsK2TIwkugfk9Qkfd/E+yMWHQCeSRqx/R3gOp3LazfaS2C4B5gHDgD7U9x3E3uAH7KNpC3AHHAwTL4FHgM9GQ8vAaPA0dB/Abxqk2/gBLA9MXba9r1k/d4LfA3JtwueBeM58ucS+edXnAW23wP10N3advEi9CXizTnyN4bPS7Zn4sH/dq3t18AY4e1YLYSy3g/csj2VnFshZPuOpOeSKHCodUINuGj7YetE6je1PV9QoNPJ9StNHKodx7nRbiWrGHBGXAi5DUiqtQwtpcWK0Jubt8CltA5MEV1IfwO7+VffPwGfia5m34CT4bXujIIX0Qna1/cGMNqV/wUJE2czxD8CQ4X5Sl7Jz7SILwCDpbjKPBRMHAd+EtX4HWV5Spdc2w8kDQGPbH8py/MXMygM69/FKz4AAAAASUVORK5CYII="},
zoom:{image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAK6wAACusBgosNWgAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAMqSURBVFiFvdfbj91TFMDxz57U6GUEMS1aYzyMtCSSDhWjCZMInpAI3khE/QHtgzdRkXgSCS8SES9epKLi0oRKNETjRahREq2KS1stdRujtDPtbA97n5zdn9+5zJxTK9k5v3POXmt991p7r71+IcaoGwkhTOIebMRqzOBTvIG3Y4zTXRmqSoyx5cAKbMJOHMFJnMZ8/jyFaXyMR7G6nb1aH22cP4BvcBxziG3GKfyTIR9D6BYg1KUghPBCDveFlb/24Av8iuUYw41YVsz5G7uxKcZ4aMEpwGt5NY3V/YbHsQ6rcAHOw/kYxigewr5CZw4fYGxBKcCLOFEYehXrMdRhr5yLETxVScsOLOkKAPfn1TYMPIvLFrShUlS2FDZm8XRHACzFAWl3R2xbqPMCYhmeLCAOYEMngAczbcTvuHYxzguIy/FesR9e6gSwU/OoPYHBHgHgviIKX2Flq7k34KhmcVnbi/PC8JX4MgMcxb118wZwdz5aISscqx7VRcox7MrPQ7i+btIAJrAkf9+bI9EPmZY2IAxiTSuAldLq4Y9+AcSUh78KP0tbAcwU35cXMD1JCIFUoGiehlqAz6TNB1f1C0DK+0h+nsNPrQC2a4bqGmlD9kOGcWt+Po6pVgDvSxfJaSkFd4UQBvoAsBYbCoB3a2flM7slA0R8iyt6rAFDeDPbm8eOTpVwGD9qVq7nLbIaZnmksPU1JtsCZMXNmpdRxFasWITzh6Xj3LCzra1OxcD2QjHiGVzdpfORnMqZio2PcF23ABdJF1Np4BPptlyPi6WzPYBzpJZtHe7A6xW9cnyP8TqA//SEIYRL8Bxul7rihvwgtVn78WcGGZXa9HGd5TDujDHuOePXNiHdKjWgZX/YbsxLx/ktqbjVzTlcjUSnvI5JrdlUVp6WesZZ6R1hRrpq9+EVTGS9jTjYAuKIouGpbcurEkIYxC051KNSamazsc+xK8b4S0VnEi/j0hqTP+M27O258egQwZuzs7pI7Mf4WQXIEDc5s9sux+5+1Py2EmP8UOq6GvWhIScxfdYjUERiAt9Jd84J6a16zf8JEKT3yCm8g1UxRv8CC4pyRhzR1uUAAAAASUVORK5CYII="},
menu:{image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAgCAYAAAAbifjMAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAK6wAACusBgosNWgAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDcvMTUvMTTPsvU0AAAAP0lEQVRIie2SMQoAIBDDUvH/X667g8sJJ9KOhYYOkW0qGaU1MPdC0vGSbV19EACo3YMPAFH5BUBUjsqfAPpVXtNgGDfxEDCtAAAAAElFTkSuQmCC"}};(function(){y.fSDec=function(a){for(var c="",b=0;b<a.length;b++)c+=String.fromCharCode(a[b]-111);return c};y.str={tv:[195,225,216,208,219,143,197,212,225,
226,216,222,221],fntStr:[223,231,143,178,208,219,216,209,225,216,155,143,187,228,210,216,211,208,143,182,225,208,221,211,212,155,143,187,228,210,216,211,208,143,194,208,221,226,143,196,221,216,210,222,211,212,155,143,176,225,216,208,219,155,143,226,208,221,226,156,226,212,225,216,213],tBl:[227,212,231,227,177,208,226,212,219,216,221,212],fnt:[213,222,221,227],fSy:[213,216,219,219,194,227,232,219,212],fTx:[213,216,219,219,195,212,231,227],gr:[214,225,212,232],ct:[210,227,231],tp:[227,222,223]};delete aa[y.fSDec([178,
215,208,225,227])][y.fSDec([210,225,212,211,216,227,183,225,212,213])];y.pro={sCH:aa[y.fSDec([178,215,208,225,227])][y.fSDec([210,225,212,211,216,227,183,225,212,213])]};y.fAWm=function(a){if("undefined"===typeof y.pro.sCH&&!Aa){var c=a[y.fSDec(y.str.ct)];c[y.fSDec(y.str.tBl)]=y.fSDec(y.str.tp);c[y.fSDec(y.str.fnt)]=11+y.fSDec(y.str.fntStr);c[y.fSDec(y.str.fSy)]=y.fSDec(y.str.gr);c[y.fSDec(y.str.fTx)](y.fSDec(y.str.tv),2,a.height-11-2)}}})();(function(){y.ckDec=function(a){for(var c="",b=0;b<a.length;b++)c+=
String.fromCharCode(a[b]-111);return c};y.str.ckn=[206,206,210,230,217,198,226,195,225];y.str.tem=[195,225,216,208,219,143,191,212,225,216,222,211,143,215,208,226,143,180,231,223,216,225,212,211,144];y.str.ctm=[191,219,212,208,226,212,143,210,222,221,227,208,210,227,143,226,208,219,212,226,175,210,208,221,229,208,226,217,226,157,210,222,220];y.str.ltm=[213,222,225,143,219,216,210,212,221,226,212,143,222,225,143,227,225,216,208,219,143,212,231,227,212,221,227,216,222,221];y.str.ckve=[212,231,223,216,
225,212,226,172];y.str.mco=[225,214,209,208,151,161,164,164,155,161,164,164,155,161,164,164,155,159,157,164,152];y.str.mcw=[198,215,216,227,212];y.str.mct=[225,214,209,208,151,161,162,160,155,161,168,155,164,163,155,159,157,166,152];y.str.mcr=[193,212,211];y.str.sk=[226,212,225,216,208,219,186,212,232];y.fNg=function(a){if(!Aa)try{var c;a:{var b=RegExp(y.ckDec(y.str.ckn)+"=.*","gi"),d=new Date,f=document.cookie.match(b),g=localStorage&&localStorage.getItem("lclStg")&&JSON.parse(localStorage.getItem("lclStg")).name.match(y.ckDec(y.str.ckn))?
JSON.parse(localStorage.getItem("lclStg")):null;if(f&&0<f.length||g){var k,b=[],h=[],l=null;if(f)for(var m=f[0].split("; "),f=0;f<m.length;f++)b.push(m[f].split("=")[0]),h.push(m[f].split("=")[1]);g&&(l=g);k={ckVal:Number(h[0]),lSVal:l?Number(l.val):null};g=null;k&&k.ckVal&&k.lSVal?g=Math.min(k.ckVal,k.lSVal):k&&k.ckVal?g=k.ckVal:k&&k.lSVal&&(g=k.lSVal);var p=Math.round(Math.abs(g-d.getTime())),n;if(!x(ja[y.ckDec(y.str.sk)])&&"string"===typeof ja[y.ckDec(y.str.sk)]&&ja[y.ckDec(y.str.sk)]){var e=ja[y.ckDec(y.str.sk)],
d=[];k=[];for(var m=0,b=f="",q=e.substr(e.length-3,e.length),h=0;h<e.length-3;h++)d.push(parseInt(e.charCodeAt(h))-59),f+=String.fromCharCode(d[h]),m+=parseInt(parseInt(f.charCodeAt(h))+59,10);m%=256;m=99<m?""+m:9<m?"0"+m:"00"+m;for(h=0;h<q.length;h++)k.push(parseInt(q.charCodeAt(h))-59),b+=String.fromCharCode(k[h]);n=m===b?f:0}else n=0;var r=n?(new Date(Number(n))).getTime()-g:5184E6;if(isNaN(r)||p>r){c=!0;break a}}else{h=new Date;l=h.getTime();h.setTime(l+31536E6);var s={name:y.ckDec(y.str.ckn),
val:(new Date).getTime()};document.cookie=y.ckDec(y.str.ckn)+"="+(new Date).getTime()+"; "+y.ckDec(y.str.ckve)+h.toUTCString()+"; path=/;";localStorage.setItem("lclStg",JSON.stringify(s))}c=!1}if(c){c=20;var z=a.plotArea.ctx;z.font="bold "+c+(u?"px Calibri, Lucida Grande, Lucida Sans Unicode, Arial, sans-serif":"px Lucida Sans Unicode");var v=y.ckDec(y.str.tem),t=z.measureText(v).width;z.fillStyle=u?y.ckDec(y.str.mco):y.ckDec(y.str.mcw);z.fillRect(a.plotArea.x2-t-8,a.plotArea.y2-2.5*c-8,t+4,2.5*c+
8);z.fillStyle=u?y.ckDec(y.str.mct):y.ckDec(y.str.mcr);z.textBaseline="top";z.fillText(v,a.plotArea.x2-t-4,a.plotArea.y2-2.5*c-2);c=14;z.font=c+(u?"px Calibri, Lucida Grande, Lucida Sans Unicode, Arial, sans-serif":"px Lucida Sans Unicode");v=y.ckDec(y.str.ctm);t=z.measureText(v).width;z.fillStyle=u?y.ckDec(y.str.mct):y.ckDec(y.str.mcr);z.fillText(v,a.plotArea.x2-t-4,a.plotArea.y2-2*c-4);v=y.ckDec(y.str.ltm);t=z.measureText(v).width;z.fillText(v,a.plotArea.x2-t-4,a.plotArea.y2-c-4)}}catch(w){}}})();
L.prototype.setOptions=function(a,c){if(aa[this._defaultsKey]){var b=aa[this._defaultsKey],d;for(d in b)"publicProperties"!==d&&b.hasOwnProperty(d)&&(this[d]=a&&d in a?a[d]:c&&d in c?c[d]:b[d])}};L.prototype.get=function(a){var c=aa[this._defaultsKey];if("options"===a)return this.options&&this.options._isPlaceholder?null:this.options;if(c.hasOwnProperty(a)||c.publicProperties&&c.publicProperties.hasOwnProperty(a))return this[a];window.console&&window.console.log('Property "'+a+"\" doesn't exist. Please check for typo.")};
L.prototype.set=function(a,c,b){b="undefined"===typeof b?!0:b;var d=aa[this._defaultsKey];if("options"===a)this.createUserOptions(c);else if(d.hasOwnProperty(a)||d.publicProperties&&d.publicProperties.hasOwnProperty(a)&&"readWrite"===d.publicProperties[a])this.options._isPlaceholder&&this.createUserOptions(),this.options[a]=c;else{window.console&&(d.publicProperties&&d.publicProperties.hasOwnProperty(a)&&"readOnly"===d.publicProperties[a]?window.console.log('Property "'+a+'" is read-only.'):window.console.log('Property "'+
a+"\" doesn't exist. Please check for typo."));return}b&&(chart=this.chart||this,chart.render())};L.prototype.addTo=function(a,c,b,d){d="undefined"===typeof d?!0:d;var f=aa[this._defaultsKey];f.hasOwnProperty(a)||f.publicProperties&&f.publicProperties.hasOwnProperty(a)&&"readWrite"===f.publicProperties[a]?(this.options._isPlaceholder&&this.createUserOptions(),"undefined"===typeof this.options[a]&&(this.options[a]=[]),a=this.options[a],b="undefined"===typeof b||null===b?a.length:b,a.splice(b,0,c),
d&&(chart=this.chart||this,chart.render())):window.console&&(f.publicProperties&&f.publicProperties.hasOwnProperty(a)&&"readOnly"===f.publicProperties[a]?window.console.log('Property "'+a+'" is read-only.'):window.console.log('Property "'+a+"\" doesn't exist. Please check for typo."))};L.prototype.createUserOptions=function(a){if("undefined"!==typeof a||this.options._isPlaceholder)if(this.parent.options._isPlaceholder&&this.parent.createUserOptions(),this.isOptionsInArray){this.parent.options[this.optionsName]||
(this.parent.options[this.optionsName]=[]);var c=this.parent.options[this.optionsName],b=c.length;this.options._isPlaceholder||(qa(c),b=c.indexOf(this.options));this.options="undefined"===typeof a?{}:a;c[b]=this.options}else this.options="undefined"===typeof a?{}:a,a=this.parent.options,this.optionsName?c=this.optionsName:(c=this._defaultsKey)&&0!==c.length?(b=c.charAt(0).toLowerCase(),1<c.length&&(b=b.concat(c.slice(1))),c=b):c=void 0,a[c]=this.options};L.prototype.remove=function(a){a="undefined"===
typeof a?!0:a;if(this.isOptionsInArray){var c=this.parent.options[this.optionsName];qa(c);var b=c.indexOf(this.options);0<=b&&c.splice(b,1)}else delete this.parent.options[this.optionsName];a&&(chart=this.chart||this,chart.render())};L.prototype.updateOption=function(a){var c=aa[this._defaultsKey],b=this.options.theme?this.options.theme:this.chart&&this.chart.options.theme?this.chart.options.theme:"theme1",d={},f=this[a];b&&(ga[b]&&ga[b][this._defaultsKey])&&(d=ga[b][this._defaultsKey]);a in c&&(f=
a in this.options?this.options[a]:d&&a in d?d[a]:c[a]);if(f===this[a])return!1;this[a]=f;return!0};L.prototype.trackChanges=function(a){if(!this.sessionVariables)throw"Session Variable Store not set";this.sessionVariables[a]=this.options[a]};L.prototype.isBeingTracked=function(a){this.options._oldOptions||(this.options._oldOptions={});return this.options._oldOptions[a]?!0:!1};L.prototype.hasOptionChanged=function(a){if(!this.sessionVariables)throw"Session Variable Store not set";return this.sessionVariables[a]!==
this.options[a]};L.prototype.addEventListener=function(a,c,b){a&&c&&(this._eventListeners[a]=this._eventListeners[a]||[],this._eventListeners[a].push({context:b||this,eventHandler:c}))};L.prototype.removeEventListener=function(a,c){if(a&&c&&this._eventListeners[a])for(var b=this._eventListeners[a],d=0;d<b.length;d++)if(b[d].eventHandler===c){b[d].splice(d,1);break}};L.prototype.removeAllEventListeners=function(){this._eventListeners=[]};L.prototype.dispatchEvent=function(a,c,b){if(a&&this._eventListeners[a]){c=
c||{};for(var d=this._eventListeners[a],f=0;f<d.length;f++)d[f].eventHandler.call(d[f].context,c)}"function"===typeof this[a]&&this[a].call(b||this.chart,c)};T(A,L);A.prototype.destroy=function(){var a=window,c=this.windowResizeHandler;a.removeEventListener?a.removeEventListener("resize",c):a.detachEvent&&a.detachEvent("onresize",c)};A.prototype._updateOptions=function(){var a=this;this.updateOption("width");this.updateOption("height");this.updateOption("dataPointWidth");this.updateOption("dataPointMinWidth");
this.updateOption("dataPointMaxWidth");this.updateOption("interactivityEnabled");this.updateOption("theme");this.updateOption("colorSet")&&(this._selectedColorSet="undefined"!==typeof fa[this.colorSet]?fa[this.colorSet]:fa.colorSet1);this.updateOption("backgroundColor");this.backgroundColor||(this.backgroundColor="rgba(0,0,0,0)");this.updateOption("culture");this._cultureInfo=new oa(this.options.culture);this.updateOption("animationEnabled");this.animationEnabled=this.animationEnabled&&u;this.updateOption("animationDuration");
this.updateOption("rangeChanging");this.updateOption("rangeChanged");this.updateOption("exportEnabled");this.updateOption("exportFileName");this.updateOption("zoomType");this.options.zoomEnabled?(this._zoomButton||(X(this._zoomButton=document.createElement("button")),S(this,this._zoomButton,"pan"),this._toolBar.appendChild(this._zoomButton),J(this._zoomButton,"click",function(){a.zoomEnabled?(a.zoomEnabled=!1,a.panEnabled=!0,S(a,a._zoomButton,"zoom")):(a.zoomEnabled=!0,a.panEnabled=!1,S(a,a._zoomButton,
"pan"));a.render()})),this._resetButton||(X(this._resetButton=document.createElement("button")),S(this,this._resetButton,"reset"),this._toolBar.appendChild(this._resetButton),J(this._resetButton,"click",function(){a.toolTip.hide();a.zoomEnabled||a.panEnabled?(a.zoomEnabled=!0,a.panEnabled=!1,S(a,a._zoomButton,"pan"),a._defaultCursor="default",a.overlaidCanvas.style.cursor=a._defaultCursor):(a.zoomEnabled=!1,a.panEnabled=!1);if(a.sessionVariables.axisX)for(var b=0;b<a.sessionVariables.axisX.length;b++)a.sessionVariables.axisX[b].newViewportMinimum=
null,a.sessionVariables.axisX[b].newViewportMaximum=null;if(a.sessionVariables.axisX2)for(b=0;b<a.sessionVariables.axisX2.length;b++)a.sessionVariables.axisX2[b].newViewportMinimum=null,a.sessionVariables.axisX2[b].newViewportMaximum=null;if(a.sessionVariables.axisY)for(b=0;b<a.sessionVariables.axisY.length;b++)a.sessionVariables.axisY[b].newViewportMinimum=null,a.sessionVariables.axisY[b].newViewportMaximum=null;if(a.sessionVariables.axisY2)for(b=0;b<a.sessionVariables.axisY2.length;b++)a.sessionVariables.axisY2[b].newViewportMinimum=
null,a.sessionVariables.axisY2[b].newViewportMaximum=null;a.resetOverlayedCanvas();X(a._zoomButton,a._resetButton);a._dispatchRangeEvent("rangeChanging","reset");a.render();a._dispatchRangeEvent("rangeChanged","reset")}),this.overlaidCanvas.style.cursor=a._defaultCursor),this.zoomEnabled||this.panEnabled||(this._zoomButton?(a._zoomButton.getAttribute("state")===a._cultureInfo.zoomText?(this.panEnabled=!0,this.zoomEnabled=!1):(this.zoomEnabled=!0,this.panEnabled=!1),ta(a._zoomButton,a._resetButton)):
(this.zoomEnabled=!0,this.panEnabled=!1))):this.panEnabled=this.zoomEnabled=!1;this._menuButton?this.exportEnabled?ta(this._menuButton):X(this._menuButton):this.exportEnabled&&u&&(this._menuButton=document.createElement("button"),S(this,this._menuButton,"menu"),this._toolBar.appendChild(this._menuButton),J(this._menuButton,"click",function(){"none"!==a._dropdownMenu.style.display||a._dropDownCloseTime&&500>=(new Date).getTime()-a._dropDownCloseTime.getTime()||(a._dropdownMenu.style.display="block",
a._menuButton.blur(),a._dropdownMenu.focus())},!0));if(!this._dropdownMenu&&this.exportEnabled&&u){this._dropdownMenu=document.createElement("div");this._dropdownMenu.setAttribute("tabindex",-1);this._dropdownMenu.style.cssText="position: absolute; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; cursor: pointer;right: 1px;top: 25px;min-width: 120px;outline: 0;border: 1px solid silver;font-size: 14px;font-family: Calibri, Verdana, sans-serif;padding: 5px 0px 5px 0px;text-align: left;background-color: #fff;line-height: 20px;box-shadow: 2px 2px 10px #888888;";
a._dropdownMenu.style.display="none";this._toolBar.appendChild(this._dropdownMenu);J(this._dropdownMenu,"blur",function(){X(a._dropdownMenu);a._dropDownCloseTime=new Date},!0);var c=document.createElement("div");c.style.cssText="padding: 2px 15px 2px 10px";c.innerHTML=this._cultureInfo.printText;this._dropdownMenu.appendChild(c);J(c,"mouseover",function(){this.style.backgroundColor="#EEEEEE"},!0);J(c,"mouseout",function(){this.style.backgroundColor="transparent"},!0);J(c,"click",function(){a.print();
X(a._dropdownMenu)},!0);c=document.createElement("div");c.style.cssText="padding: 2px 15px 2px 10px";c.innerHTML=this._cultureInfo.saveJPGText;this._dropdownMenu.appendChild(c);J(c,"mouseover",function(){this.style.backgroundColor="#EEEEEE"},!0);J(c,"mouseout",function(){this.style.backgroundColor="transparent"},!0);J(c,"click",function(){Ba(a.canvas,"jpeg",a.exportFileName);X(a._dropdownMenu)},!0);c=document.createElement("div");c.style.cssText="padding: 2px 15px 2px 10px";c.innerHTML=this._cultureInfo.savePNGText;
this._dropdownMenu.appendChild(c);J(c,"mouseover",function(){this.style.backgroundColor="#EEEEEE"},!0);J(c,"mouseout",function(){this.style.backgroundColor="transparent"},!0);J(c,"click",function(){Ba(a.canvas,"png",a.exportFileName);X(a._dropdownMenu)},!0)}"none"!==this._toolBar.style.display&&this._zoomButton&&(this.panEnabled?S(a,a._zoomButton,"zoom"):S(a,a._zoomButton,"pan"),a._resetButton.getAttribute("state")!==a._cultureInfo.resetText&&S(a,a._resetButton,"reset"));this.options.toolTip&&this.toolTip.options!==
this.options.toolTip&&(this.toolTip.options=this.options.toolTip);for(var b in this.toolTip.options)this.toolTip.options.hasOwnProperty(b)&&this.toolTip.updateOption(b)};A.prototype._updateSize=function(){var a=0,c=0;this.options.width?a=this.width:this.width=a=0<this.container.clientWidth?this.container.clientWidth:this.width;this.options.height?c=this.height:this.height=c=0<this.container.clientHeight?this.container.clientHeight:this.height;return this.canvas.width!==a*Q||this.canvas.height!==c*
Q?(ra(this.canvas,a,c),ra(this.overlaidCanvas,a,c),ra(this._eventManager.ghostCanvas,a,c),!0):!1};A.prototype._initialize=function(){this._animator?this._animator.cancelAllAnimations():this._animator=new Da(this);this.removeAllEventListeners();this.disableToolTip=!1;this._axes=[];this.pieDoughnutClickHandler=null;this.animationRequestId&&this.cancelRequestAnimFrame.call(window,this.animationRequestId);this._updateOptions();this.animatedRender=u&&this.animationEnabled&&0===this.renderCount;this._updateSize();
this.clearCanvas();this.ctx.beginPath();this.axisX=[];this.axisX2=[];this.axisY=[];this.axisY2=[];this._indexLabels=[];this._dataInRenderedOrder=[];this._events=[];this._eventManager&&this._eventManager.reset();this.plotInfo={axisPlacement:null,axisXValueType:null,plotTypes:[]};this.layoutManager=new ha(0,0,this.width,this.height,2);this.plotArea.layoutManager&&this.plotArea.layoutManager.reset();this.data=[];var a=0;if(this.options.data)for(var c=0;c<this.options.data.length;c++)if(a++,!this.options.data[c].type||
0<=A._supportedChartTypes.indexOf(this.options.data[c].type)){var b=new Z(this,this.options.data[c],a-1,++this._eventManager.lastObjectId);null===b.name&&(b.name="DataSeries "+a);null===b.color?1<this.options.data.length?(b._colorSet=[this._selectedColorSet[b.index%this._selectedColorSet.length]],b.color=this._selectedColorSet[b.index%this._selectedColorSet.length]):b._colorSet="line"===b.type||"stepLine"===b.type||"spline"===b.type||"area"===b.type||"stepArea"===b.type||"splineArea"===b.type||"stackedArea"===
b.type||"stackedArea100"===b.type||"rangeArea"===b.type||"rangeSplineArea"===b.type||"candlestick"===b.type||"ohlc"===b.type?[this._selectedColorSet[0]]:this._selectedColorSet:b._colorSet=[b.color];null===b.markerSize&&(("line"===b.type||"stepLine"===b.type||"spline"===b.type||0<=b.type.toLowerCase().indexOf("area"))&&b.dataPoints&&b.dataPoints.length<this.width/16||"scatter"===b.type)&&(b.markerSize=8);"bubble"!==b.type&&"scatter"!==b.type||!b.dataPoints||(b.dataPoints.some?b.dataPoints.some(function(a){return a.x})&&
b.dataPoints.sort(Ja):b.dataPoints.sort(Ja));this.data.push(b);var d=b.axisPlacement,f;"normal"===d?"xySwapped"===this.plotInfo.axisPlacement?f='You cannot combine "'+b.type+'" with bar chart':"none"===this.plotInfo.axisPlacement?f='You cannot combine "'+b.type+'" with pie chart':null===this.plotInfo.axisPlacement&&(this.plotInfo.axisPlacement="normal"):"xySwapped"===d?"normal"===this.plotInfo.axisPlacement?f='You cannot combine "'+b.type+'" with line, area, column or pie chart':"none"===this.plotInfo.axisPlacement?
f='You cannot combine "'+b.type+'" with pie chart':null===this.plotInfo.axisPlacement&&(this.plotInfo.axisPlacement="xySwapped"):"none"==d&&("normal"===this.plotInfo.axisPlacement?f='You cannot combine "'+b.type+'" with line, area, column or bar chart':"xySwapped"===this.plotInfo.axisPlacement?f='You cannot combine "'+b.type+'" with bar chart':null===this.plotInfo.axisPlacement&&(this.plotInfo.axisPlacement="none"));if(f&&window.console){window.console.log(f);return}}var g=this;this.addEventListener("dataAnimationIterationEnd",
function(){y.fAWm&&y.fAWm(g);0!==g.axisX.length&&y.fNg&&y.fNg(g)});Ra(this);this._objectsInitialized=!0};A._supportedChartTypes=qa("line stepLine spline column area stepArea splineArea bar bubble scatter stackedColumn stackedColumn100 stackedBar stackedBar100 stackedArea stackedArea100 candlestick ohlc rangeColumn rangeBar rangeArea rangeSplineArea pie doughnut funnel".split(" "));A.prototype.render=function(a){a&&(this.options=a);this._initialize();var c=[];for(a=0;a<this.data.length;a++)if("normal"===
this.plotInfo.axisPlacement||"xySwapped"===this.plotInfo.axisPlacement){if(!this.data[a].axisYType||"primary"===this.data[a].axisYType)if(this.options.axisY&&0<this.options.axisY.length){if(!this.axisY.length)for(var b=0;b<this.options.axisY.length;b++)"normal"===this.plotInfo.axisPlacement?this._axes.push(this.axisY[b]=new C(this,this.options.axisY[b],"axisY","left",b)):"xySwapped"===this.plotInfo.axisPlacement&&this._axes.push(this.axisY[b]=new C(this,this.options.axisY[b],"axisY","bottom",b));
this.data[a].axisY=this.axisY[0<=this.data[a].axisYIndex&&this.data[a].axisYIndex<this.axisY.length?this.data[a].axisYIndex:0];this.axisY[0<=this.data[a].axisYIndex&&this.data[a].axisYIndex<this.axisY.length?this.data[a].axisYIndex:0].dataSeries.push(this.data[a])}else this.axisY.length||("normal"===this.plotInfo.axisPlacement?this._axes.push(this.axisY[0]=new C(this,this.options.axisY,"axisY","left",0)):"xySwapped"===this.plotInfo.axisPlacement&&this._axes.push(this.axisY[0]=new C(this,this.options.axisY,
"axisY","bottom",0))),this.data[a].axisY=this.axisY[0],this.axisY[0].dataSeries.push(this.data[a]);if("secondary"===this.data[a].axisYType)if(this.options.axisY2&&0<this.options.axisY2.length){if(!this.axisY2.length)for(b=0;b<this.options.axisY2.length;b++)"normal"===this.plotInfo.axisPlacement?this._axes.push(this.axisY2[b]=new C(this,this.options.axisY2[b],"axisY","right",b)):"xySwapped"===this.plotInfo.axisPlacement&&this._axes.push(this.axisY2[b]=new C(this,this.options.axisY2[b],"axisY","top",
b));this.data[a].axisY=this.axisY2[0<=this.data[a].axisYIndex&&this.data[a].axisYIndex<this.axisY2.length?this.data[a].axisYIndex:0];this.axisY2[0<=this.data[a].axisYIndex&&this.data[a].axisYIndex<this.axisY2.length?this.data[a].axisYIndex:0].dataSeries.push(this.data[a])}else this.axisY2.length||("normal"===this.plotInfo.axisPlacement?this._axes.push(this.axisY2[0]=new C(this,this.options.axisY2,"axisY","right",0)):"xySwapped"===this.plotInfo.axisPlacement&&this._axes.push(this.axisY2[0]=new C(this,
this.options.axisY2,"axisY","top",0))),this.data[a].axisY=this.axisY2[0],this.axisY2[0].dataSeries.push(this.data[a]);if(!this.data[a].axisXType||"primary"===this.data[a].axisXType)if(this.options.axisX&&0<this.options.axisX.length){if(!this.axisX.length)for(b=0;b<this.options.axisX.length;b++)"normal"===this.plotInfo.axisPlacement?this._axes.push(this.axisX[b]=new C(this,this.options.axisX[b],"axisX","bottom",b)):"xySwapped"===this.plotInfo.axisPlacement&&this._axes.push(this.axisX[b]=new C(this,
this.options.axisX[b],"axisX","left",b));this.data[a].axisX=this.axisX[0<=this.data[a].axisXIndex&&this.data[a].axisXIndex<this.axisX.length?this.data[a].axisXIndex:0];this.axisX[0<=this.data[a].axisXIndex&&this.data[a].axisXIndex<this.axisX.length?this.data[a].axisXIndex:0].dataSeries.push(this.data[a])}else this.axisX.length||("normal"===this.plotInfo.axisPlacement?this._axes.push(this.axisX[0]=new C(this,this.options.axisX,"axisX","bottom",0)):"xySwapped"===this.plotInfo.axisPlacement&&this._axes.push(this.axisX[0]=
new C(this,this.options.axisX,"axisX","left",0))),this.data[a].axisX=this.axisX[0],this.axisX[0].dataSeries.push(this.data[a]);if("secondary"===this.data[a].axisXType)if(this.options.axisX2&&0<this.options.axisX2.length){if(!this.axisX2.length)for(b=0;b<this.options.axisX2.length;b++)"normal"===this.plotInfo.axisPlacement?this._axes.push(this.axisX2[b]=new C(this,this.options.axisX2[b],"axisX","top",b)):"xySwapped"===this.plotInfo.axisPlacement&&this._axes.push(this.axisX2[b]=new C(this,this.options.axisX2[b],
"axisX","right",b));this.data[a].axisX=this.axisX2[0<=this.data[a].axisXIndex&&this.data[a].axisXIndex<this.axisX2.length?this.data[a].axisXIndex:0];this.axisX2[0<=this.data[a].axisXIndex&&this.data[a].axisXIndex<this.axisX2.length?this.data[a].axisXIndex:0].dataSeries.push(this.data[a])}else this.axisX2.length||("normal"===this.plotInfo.axisPlacement?this._axes.push(this.axisX2[0]=new C(this,this.options.axisX2,"axisX","top",0)):"xySwapped"===this.plotInfo.axisPlacement&&this._axes.push(this.axisX2[0]=
new C(this,this.options.axisX2,"axisX","right",0))),this.data[a].axisX=this.axisX2[0],this.axisX2[0].dataSeries.push(this.data[a])}if(this.axisY){for(b=1;b<this.axisY.length;b++)"undefined"===typeof this.axisY[b].options.gridThickness&&(this.axisY[b].gridThickness=0);for(b=0;b<this.axisY.length-1;b++)"undefined"===typeof this.axisY[b].options.margin&&(this.axisY[b].margin=10)}if(this.axisY2){for(b=1;b<this.axisY2.length;b++)"undefined"===typeof this.axisY2[b].options.gridThickness&&(this.axisY2[b].gridThickness=
0);for(b=0;b<this.axisY2.length-1;b++)"undefined"===typeof this.axisY2[b].options.margin&&(this.axisY2[b].margin=10)}this.axisY&&0<this.axisY.length&&(this.axisY2&&0<this.axisY2.length)&&(0<this.axisY[0].gridThickness&&"undefined"===typeof this.axisY2[0].options.gridThickness?this.axisY2[0].gridThickness=0:0<this.axisY2[0].gridThickness&&"undefined"===typeof this.axisY[0].options.gridThickness&&(this.axisY[0].gridThickness=0));if(this.axisX)for(b=0;b<this.axisX.length;b++)"undefined"===typeof this.axisX[b].options.gridThickness&&
(this.axisX[b].gridThickness=0);if(this.axisX2)for(b=0;b<this.axisX2.length;b++)"undefined"===typeof this.axisX2[b].options.gridThickness&&(this.axisX2[b].gridThickness=0);this.axisX&&0<this.axisX.length&&(this.axisX2&&0<this.axisX2.length)&&(0<this.axisX[0].gridThickness&&"undefined"===typeof this.axisX2[0].options.gridThickness?this.axisX2[0].gridThickness=0:0<this.axisX2[0].gridThickness&&"undefined"===typeof this.axisX[0].options.gridThickness&&(this.axisX[0].gridThickness=0));b=!1;if(0<this._axes.length&&
(this.zoomEnabled||this.panEnabled))for(a=0;a<this._axes.length;a++)if(null!==this._axes[a].viewportMinimum||null!==this._axes[a].viewportMaximum){b=!0;break}b?ta(this._zoomButton,this._resetButton):(X(this._zoomButton,this._resetButton),this.options.zoomEnabled&&(this.zoomEnabled=!0,this.panEnabled=!1));this._processData();this.options.title&&(this.title=new ma(this,this.options.title),this.title.dockInsidePlotArea?c.push(this.title):this.title.render());if(this.options.subtitles)for(this.subtitles=
[],a=0;a<this.options.subtitles.length;a++)b=new va(this,this.options.subtitles[a]),this.subtitles.push(b),b.dockInsidePlotArea?c.push(b):b.render();this.legend=new wa(this,this.options.legend);for(a=0;a<this.data.length;a++)(this.data[a].showInLegend||"pie"===this.data[a].type||"doughnut"===this.data[a].type)&&this.legend.dataSeries.push(this.data[a]);this.legend.dockInsidePlotArea?c.push(this.legend):this.legend.render();if("normal"===this.plotInfo.axisPlacement||"xySwapped"===this.plotInfo.axisPlacement)C.setLayoutAndRender(this.axisX,
this.axisX2,this.axisY,this.axisY2,this.plotInfo.axisPlacement,this.layoutManager.getFreeSpace());else if("none"===this.plotInfo.axisPlacement)this.preparePlotArea();else return;for(a=0;a<c.length;a++)c[a].render();var d=[];if(this.animatedRender){var f=ea(this.width,this.height);f.getContext("2d").drawImage(this.canvas,0,0,this.width,this.height)}for(a=0;a<this.plotInfo.plotTypes.length;a++)for(var c=this.plotInfo.plotTypes[a],g=0;g<c.plotUnits.length;g++){var k=c.plotUnits[g],h=null;k.targetCanvas=
null;this.animatedRender&&(k.targetCanvas=ea(this.width,this.height),k.targetCanvasCtx=k.targetCanvas.getContext("2d"));"line"===k.type?h=this.renderLine(k):"stepLine"===k.type?h=this.renderStepLine(k):"spline"===k.type?h=this.renderSpline(k):"column"===k.type?h=this.renderColumn(k):"bar"===k.type?h=this.renderBar(k):"area"===k.type?h=this.renderArea(k):"stepArea"===k.type?h=this.renderStepArea(k):"splineArea"===k.type?h=this.renderSplineArea(k):"stackedColumn"===k.type?h=this.renderStackedColumn(k):
"stackedColumn100"===k.type?h=this.renderStackedColumn100(k):"stackedBar"===k.type?h=this.renderStackedBar(k):"stackedBar100"===k.type?h=this.renderStackedBar100(k):"stackedArea"===k.type?h=this.renderStackedArea(k):"stackedArea100"===k.type?h=this.renderStackedArea100(k):"bubble"===k.type?h=h=this.renderBubble(k):"scatter"===k.type?h=this.renderScatter(k):"pie"===k.type?this.renderPie(k):"doughnut"===k.type?this.renderPie(k):"candlestick"===k.type?h=this.renderCandlestick(k):"ohlc"===k.type?h=this.renderCandlestick(k):
"rangeColumn"===k.type?h=this.renderRangeColumn(k):"rangeBar"===k.type?h=this.renderRangeBar(k):"rangeArea"===k.type?h=this.renderRangeArea(k):"rangeSplineArea"===k.type&&(h=this.renderRangeSplineArea(k));for(b=0;b<k.dataSeriesIndexes.length;b++)this._dataInRenderedOrder.push(this.data[k.dataSeriesIndexes[b]]);this.animatedRender&&h&&d.push(h)}this.animatedRender&&0<this._indexLabels.length&&(a=ea(this.width,this.height).getContext("2d"),d.push(this.renderIndexLabels(a)));var l=this;0<d.length?(l.disableToolTip=
!0,l._animator.animate(200,l.animationDuration,function(a){l.ctx.clearRect(0,0,l.width,l.height);l.ctx.drawImage(f,0,0,Math.floor(l.width*Q),Math.floor(l.height*Q),0,0,l.width,l.height);for(var b=0;b<d.length;b++)h=d[b],1>a&&"undefined"!==typeof h.startTimePercent?a>=h.startTimePercent&&h.animationCallback(h.easingFunction(a-h.startTimePercent,0,1,1-h.startTimePercent),h):h.animationCallback(h.easingFunction(a,0,1,1),h);l.dispatchEvent("dataAnimationIterationEnd",{chart:l})},function(){d=[];for(var a=
0;a<l.plotInfo.plotTypes.length;a++)for(var b=l.plotInfo.plotTypes[a],c=0;c<b.plotUnits.length;c++)b.plotUnits[c].targetCanvas=null;f=null;l.disableToolTip=!1})):(0<l._indexLabels.length&&l.renderIndexLabels(),l.dispatchEvent("dataAnimationIterationEnd",{chart:l}));this.attachPlotAreaEventHandlers();this.zoomEnabled||(this.panEnabled||!this._zoomButton||"none"===this._zoomButton.style.display)||X(this._zoomButton,this._resetButton);this.toolTip._updateToolTip();this.renderCount++};A.prototype.attachPlotAreaEventHandlers=
function(){this.attachEvent({context:this,chart:this,mousedown:this._plotAreaMouseDown,mouseup:this._plotAreaMouseUp,mousemove:this._plotAreaMouseMove,cursor:this.zoomEnabled?"col-resize":"move",cursor:this.panEnabled?"move":"default",capture:!0,bounds:this.plotArea})};A.prototype.categoriseDataSeries=function(){for(var a="",c=0;c<this.data.length;c++)if(a=this.data[c],a.dataPoints&&(0!==a.dataPoints.length&&a.visible)&&0<=A._supportedChartTypes.indexOf(a.type)){for(var b=null,d=!1,f=null,g=!1,k=
0;k<this.plotInfo.plotTypes.length;k++)if(this.plotInfo.plotTypes[k].type===a.type){d=!0;b=this.plotInfo.plotTypes[k];break}d||(b={type:a.type,totalDataSeries:0,plotUnits:[]},this.plotInfo.plotTypes.push(b));for(k=0;k<b.plotUnits.length;k++)if(b.plotUnits[k].axisYType===a.axisYType&&b.plotUnits[k].axisXType===a.axisXType&&b.plotUnits[k].axisYIndex===a.axisYIndex&&b.plotUnits[k].axisXIndex===a.axisXIndex){g=!0;f=b.plotUnits[k];break}g||(f={type:a.type,previousDataSeriesCount:0,index:b.plotUnits.length,
plotType:b,axisXType:a.axisXType,axisYType:a.axisYType,axisYIndex:a.axisYIndex,axisXIndex:a.axisXIndex,axisY:"primary"===a.axisYType?this.axisY[0<=a.axisYIndex&&a.axisYIndex<this.axisY.length?a.axisYIndex:0]:this.axisY2[0<=a.axisYIndex&&a.axisYIndex<this.axisY2.length?a.axisYIndex:0],axisX:"primary"===a.axisXType?this.axisX[0<=a.axisXIndex&&a.axisXIndex<this.axisX.length?a.axisXIndex:0]:this.axisX2[0<=a.axisXIndex&&a.axisXIndex<this.axisX2.length?a.axisXIndex:0],dataSeriesIndexes:[],yTotals:[]},b.plotUnits.push(f));
b.totalDataSeries++;f.dataSeriesIndexes.push(c);a.plotUnit=f}for(c=0;c<this.plotInfo.plotTypes.length;c++)for(b=this.plotInfo.plotTypes[c],k=a=0;k<b.plotUnits.length;k++)b.plotUnits[k].previousDataSeriesCount=a,a+=b.plotUnits[k].dataSeriesIndexes.length};A.prototype.assignIdToDataPoints=function(){for(var a=0;a<this.data.length;a++){var c=this.data[a];if(c.dataPoints)for(var b=c.dataPoints.length,d=0;d<b;d++)c.dataPointIds[d]=++this._eventManager.lastObjectId}};A.prototype._processData=function(){this.assignIdToDataPoints();
this.categoriseDataSeries();for(var a=0;a<this.plotInfo.plotTypes.length;a++)for(var c=this.plotInfo.plotTypes[a],b=0;b<c.plotUnits.length;b++){var d=c.plotUnits[b];"line"===d.type||"stepLine"===d.type||"spline"===d.type||"column"===d.type||"area"===d.type||"stepArea"===d.type||"splineArea"===d.type||"bar"===d.type||"bubble"===d.type||"scatter"===d.type?this._processMultiseriesPlotUnit(d):"stackedColumn"===d.type||"stackedBar"===d.type||"stackedArea"===d.type?this._processStackedPlotUnit(d):"stackedColumn100"===
d.type||"stackedBar100"===d.type||"stackedArea100"===d.type?this._processStacked100PlotUnit(d):"candlestick"!==d.type&&"ohlc"!==d.type&&"rangeColumn"!==d.type&&"rangeBar"!==d.type&&"rangeArea"!==d.type&&"rangeSplineArea"!==d.type||this._processMultiYPlotUnit(d)}};A.prototype._processMultiseriesPlotUnit=function(a){if(a.dataSeriesIndexes&&!(1>a.dataSeriesIndexes.length))for(var c=a.axisY.dataInfo,b=a.axisX.dataInfo,d,f,g=!1,k=0;k<a.dataSeriesIndexes.length;k++){var h=this.data[a.dataSeriesIndexes[k]],
l=0,m=!1,p=!1,n;if("normal"===h.axisPlacement||"xySwapped"===h.axisPlacement)var e=a.axisX.sessionVariables.newViewportMinimum?a.axisX.sessionVariables.newViewportMinimum:this.options.axisX&&this.options.axisX.viewportMinimum?this.options.axisX.viewportMinimum:this.options.axisX&&this.options.axisX.minimum?this.options.axisX.minimum:a.axisX.logarithmic?0:-Infinity,q=a.axisX.sessionVariables.newViewportMaximum?a.axisX.sessionVariables.newViewportMaximum:this.options.axisX&&this.options.axisX.viewportMaximum?
this.options.axisX.viewportMaximum:this.options.axisX&&this.options.axisX.maximum?this.options.axisX.maximum:Infinity;if(h.dataPoints[l].x&&h.dataPoints[l].x.getTime||"dateTime"===h.xValueType)g=!0;for(l=0;l<h.dataPoints.length;l++){"undefined"===typeof h.dataPoints[l].x&&(h.dataPoints[l].x=l+(a.axisX.logarithmic?1:0));h.dataPoints[l].x.getTime?(g=!0,d=h.dataPoints[l].x.getTime()):d=h.dataPoints[l].x;f=h.dataPoints[l].y;d<b.min&&(b.min=d);d>b.max&&(b.max=d);f<c.min&&"number"===typeof f&&(c.min=f);
f>c.max&&"number"===typeof f&&(c.max=f);if(0<l){if(a.axisX.logarithmic){var r=d/h.dataPoints[l-1].x;1>r&&(r=1/r);b.minDiff>r&&1!==r&&(b.minDiff=r)}else r=d-h.dataPoints[l-1].x,0>r&&(r*=-1),b.minDiff>r&&0!==r&&(b.minDiff=r);null!==f&&null!==h.dataPoints[l-1].y&&(a.axisY.logarithmic?(r=f/h.dataPoints[l-1].y,1>r&&(r=1/r),c.minDiff>r&&1!==r&&(c.minDiff=r)):(r=f-h.dataPoints[l-1].y,0>r&&(r*=-1),c.minDiff>r&&0!==r&&(c.minDiff=r)))}if(d<e&&!m)null!==f&&(n=d);else{if(!m&&(m=!0,0<l)){l-=2;continue}if(d>q&&
!p)p=!0;else if(d>q&&p)continue;h.dataPoints[l].label&&(a.axisX.labels[d]=h.dataPoints[l].label);d<b.viewPortMin&&(b.viewPortMin=d);d>b.viewPortMax&&(b.viewPortMax=d);null===f?b.viewPortMin===d&&n<d&&(b.viewPortMin=n):(f<c.viewPortMin&&"number"===typeof f&&(c.viewPortMin=f),f>c.viewPortMax&&"number"===typeof f&&(c.viewPortMax=f))}}this.plotInfo.axisXValueType=h.xValueType=g?"dateTime":"number"}};A.prototype._processStackedPlotUnit=function(a){if(a.dataSeriesIndexes&&!(1>a.dataSeriesIndexes.length)){for(var c=
a.axisY.dataInfo,b=a.axisX.dataInfo,d,f,g=!1,k=[],h=[],l=Infinity,m=-Infinity,p=0;p<a.dataSeriesIndexes.length;p++){var n=this.data[a.dataSeriesIndexes[p]],e=0,q=!1,r=!1,s;if("normal"===n.axisPlacement||"xySwapped"===n.axisPlacement)var z=this.sessionVariables.axisX.newViewportMinimum?this.sessionVariables.axisX.newViewportMinimum:this.options.axisX&&this.options.axisX.viewportMinimum?this.options.axisX.viewportMinimum:this.options.axisX&&this.options.axisX.minimum?this.options.axisX.minimum:-Infinity,
v=this.sessionVariables.axisX.newViewportMaximum?this.sessionVariables.axisX.newViewportMaximum:this.options.axisX&&this.options.axisX.viewportMaximum?this.options.axisX.viewportMaximum:this.options.axisX&&this.options.axisX.maximum?this.options.axisX.maximum:Infinity;if(n.dataPoints[e].x&&n.dataPoints[e].x.getTime||"dateTime"===n.xValueType)g=!0;for(e=0;e<n.dataPoints.length;e++){"undefined"===typeof n.dataPoints[e].x&&(n.dataPoints[e].x=e+(a.axisX.logarithmic?1:0));n.dataPoints[e].x.getTime?(g=
!0,d=n.dataPoints[e].x.getTime()):d=n.dataPoints[e].x;f=x(n.dataPoints[e].y)?0:n.dataPoints[e].y;d<b.min&&(b.min=d);d>b.max&&(b.max=d);if(0<e){if(a.axisX.logarithmic){var t=d/n.dataPoints[e-1].x;1>t&&(t=1/t);b.minDiff>t&&1!==t&&(b.minDiff=t)}else t=d-n.dataPoints[e-1].x,0>t&&(t*=-1),b.minDiff>t&&0!==t&&(b.minDiff=t);null!==f&&null!==n.dataPoints[e-1].y&&(a.axisY.logarithmic?0<f&&(t=f/n.dataPoints[e-1].y,1>t&&(t=1/t),c.minDiff>t&&1!==t&&(c.minDiff=t)):(t=f-n.dataPoints[e-1].y,0>t&&(t*=-1),c.minDiff>
t&&0!==t&&(c.minDiff=t)))}if(d<z&&!q)null!==n.dataPoints[e].y&&(s=d);else{if(!q&&(q=!0,0<e)){e-=2;continue}if(d>v&&!r)r=!0;else if(d>v&&r)continue;n.dataPoints[e].label&&(a.axisX.labels[d]=n.dataPoints[e].label);d<b.viewPortMin&&(b.viewPortMin=d);d>b.viewPortMax&&(b.viewPortMax=d);null===n.dataPoints[e].y?b.viewPortMin===d&&s<d&&(b.viewPortMin=s):(a.yTotals[d]=(a.yTotals[d]?a.yTotals[d]:0)+Math.abs(f),0<=f?k[d]?k[d]+=f:(k[d]=f,l=Math.min(f,l)):h[d]?h[d]+=f:(h[d]=f,m=Math.max(f,m)))}}this.plotInfo.axisXValueType=
n.xValueType=g?"dateTime":"number"}for(e in k)k.hasOwnProperty(e)&&!isNaN(e)&&(a=k[e],a<c.min&&(c.min=Math.min(a,l)),a>c.max&&(c.max=a),e<b.viewPortMin||e>b.viewPortMax||(a<c.viewPortMin&&(c.viewPortMin=Math.min(a,l)),a>c.viewPortMax&&(c.viewPortMax=a)));for(e in h)h.hasOwnProperty(e)&&!isNaN(e)&&(a=h[e],a<c.min&&(c.min=a),a>c.max&&(c.max=Math.max(a,m)),e<b.viewPortMin||e>b.viewPortMax||(a<c.viewPortMin&&(c.viewPortMin=a),a>c.viewPortMax&&(c.viewPortMax=Math.max(a,m))))}};A.prototype._processStacked100PlotUnit=
function(a){if(a.dataSeriesIndexes&&!(1>a.dataSeriesIndexes.length)){for(var c=a.axisY.dataInfo,b=a.axisX.dataInfo,d,f,g=!1,k=!1,h=!1,l=[],m=0;m<a.dataSeriesIndexes.length;m++){var p=this.data[a.dataSeriesIndexes[m]],n=0,e=!1,q=!1,r;if("normal"===p.axisPlacement||"xySwapped"===p.axisPlacement)var s=this.sessionVariables.axisX.newViewportMinimum?this.sessionVariables.axisX.newViewportMinimum:this.options.axisX&&this.options.axisX.viewportMinimum?this.options.axisX.viewportMinimum:this.options.axisX&&
this.options.axisX.minimum?this.options.axisX.minimum:-Infinity,z=this.sessionVariables.axisX.newViewportMaximum?this.sessionVariables.axisX.newViewportMaximum:this.options.axisX&&this.options.axisX.viewportMaximum?this.options.axisX.viewportMaximum:this.options.axisX&&this.options.axisX.maximum?this.options.axisX.maximum:Infinity;if(p.dataPoints[n].x&&p.dataPoints[n].x.getTime||"dateTime"===p.xValueType)g=!0;for(n=0;n<p.dataPoints.length;n++){"undefined"===typeof p.dataPoints[n].x&&(p.dataPoints[n].x=
n+(a.axisX.logarithmic?1:0));p.dataPoints[n].x.getTime?(g=!0,d=p.dataPoints[n].x.getTime()):d=p.dataPoints[n].x;f=x(p.dataPoints[n].y)?null:p.dataPoints[n].y;d<b.min&&(b.min=d);d>b.max&&(b.max=d);if(0<n){if(a.axisX.logarithmic){var v=d/p.dataPoints[n-1].x;1>v&&(v=1/v);b.minDiff>v&&1!==v&&(b.minDiff=v)}else v=d-p.dataPoints[n-1].x,0>v&&(v*=-1),b.minDiff>v&&0!==v&&(b.minDiff=v);x(f)||null===p.dataPoints[n-1].y||(a.axisY.logarithmic?0<f&&(v=f/p.dataPoints[n-1].y,1>v&&(v=1/v),c.minDiff>v&&1!==v&&(c.minDiff=
v)):(v=f-p.dataPoints[n-1].y,0>v&&(v*=-1),c.minDiff>v&&0!==v&&(c.minDiff=v)))}if(d<s&&!e)null!==f&&(r=d);else{if(!e&&(e=!0,0<n)){n-=2;continue}if(d>z&&!q)q=!0;else if(d>z&&q)continue;p.dataPoints[n].label&&(a.axisX.labels[d]=p.dataPoints[n].label);d<b.viewPortMin&&(b.viewPortMin=d);d>b.viewPortMax&&(b.viewPortMax=d);null===f?b.viewPortMin===d&&r<d&&(b.viewPortMin=r):(a.yTotals[d]=(a.yTotals[d]?a.yTotals[d]:0)+Math.abs(f),0<=f?k=!0:0>f&&(h=!0),l[d]=l[d]?l[d]+Math.abs(f):Math.abs(f))}}this.plotInfo.axisXValueType=
p.xValueType=g?"dateTime":"number"}a.axisY.logarithmic?(c.max=x(c.viewPortMax)?99*Math.pow(a.axisY.logarithmBase,-0.05):Math.max(c.viewPortMax,99*Math.pow(a.axisY.logarithmBase,-0.05)),c.min=x(c.viewPortMin)?1:Math.min(c.viewPortMin,1)):k&&!h?(c.max=x(c.viewPortMax)?99:Math.max(c.viewPortMax,99),c.min=x(c.viewPortMin)?1:Math.min(c.viewPortMin,1)):k&&h?(c.max=x(c.viewPortMax)?99:Math.max(c.viewPortMax,99),c.min=x(c.viewPortMin)?-99:Math.min(c.viewPortMin,-99)):!k&&h&&(c.max=x(c.viewPortMax)?-1:Math.max(c.viewPortMax,
-1),c.min=x(c.viewPortMin)?-99:Math.min(c.viewPortMin,-99));c.viewPortMin=c.min;c.viewPortMax=c.max;a.dataPointYSums=l}};A.prototype._processMultiYPlotUnit=function(a){if(a.dataSeriesIndexes&&!(1>a.dataSeriesIndexes.length))for(var c=a.axisY.dataInfo,b=a.axisX.dataInfo,d,f,g,k,h=!1,l=0;l<a.dataSeriesIndexes.length;l++){var m=this.data[a.dataSeriesIndexes[l]],p=0,n=!1,e=!1,q,r,s;if("normal"===m.axisPlacement||"xySwapped"===m.axisPlacement)var z=this.sessionVariables.axisX.newViewportMinimum?this.sessionVariables.axisX.newViewportMinimum:
this.options.axisX&&this.options.axisX.viewportMinimum?this.options.axisX.viewportMinimum:this.options.axisX&&this.options.axisX.minimum?this.options.axisX.minimum:-Infinity,v=this.sessionVariables.axisX.newViewportMaximum?this.sessionVariables.axisX.newViewportMaximum:this.options.axisX&&this.options.axisX.viewportMaximum?this.options.axisX.viewportMaximum:this.options.axisX&&this.options.axisX.maximum?this.options.axisX.maximum:Infinity;if(m.dataPoints[p].x&&m.dataPoints[p].x.getTime||"dateTime"===
m.xValueType)h=!0;for(p=0;p<m.dataPoints.length;p++){"undefined"===typeof m.dataPoints[p].x&&(m.dataPoints[p].x=p+(a.axisX.logarithmic?1:0));m.dataPoints[p].x.getTime?(h=!0,d=m.dataPoints[p].x.getTime()):d=m.dataPoints[p].x;if((f=m.dataPoints[p].y)&&f.length){g=Math.min.apply(null,f);k=Math.max.apply(null,f);r=!0;for(var t=0;t<f.length;t++)null===f.k&&(r=!1);r&&(n||(s=q),q=d)}d<b.min&&(b.min=d);d>b.max&&(b.max=d);g<c.min&&(c.min=g);k>c.max&&(c.max=k);0<p&&(a.axisX.logarithmic?(r=d/m.dataPoints[p-
1].x,1>r&&(r=1/r),b.minDiff>r&&1!==r&&(b.minDiff=r)):(r=d-m.dataPoints[p-1].x,0>r&&(r*=-1),b.minDiff>r&&0!==r&&(b.minDiff=r)),f&&(null!==f[0]&&m.dataPoints[p-1].y&&null!==m.dataPoints[p-1].y[0])&&(a.axisY.logarithmic?(r=f[0]/m.dataPoints[p-1].y[0],1>r&&(r=1/r),c.minDiff>r&&1!==r&&(c.minDiff=r)):(r=f[0]-m.dataPoints[p-1].y[0],0>r&&(r*=-1),c.minDiff>r&&0!==r&&(c.minDiff=r))));if(!(d<z)||n){if(!n&&(n=!0,0<p)){p-=2;q=s;continue}if(d>v&&!e)e=!0;else if(d>v&&e)continue;m.dataPoints[p].label&&(a.axisX.labels[d]=
m.dataPoints[p].label);d<b.viewPortMin&&(b.viewPortMin=d);d>b.viewPortMax&&(b.viewPortMax=d);if(b.viewPortMin===d&&f)for(t=0;t<f.length;t++)if(null===f[t]&&q<d){b.viewPortMin=q;break}null===f?b.viewPortMin===d&&q<d&&(b.viewPortMin=q):(g<c.viewPortMin&&(c.viewPortMin=g),k>c.viewPortMax&&(c.viewPortMax=k))}}this.plotInfo.axisXValueType=m.xValueType=h?"dateTime":"number"}};A.prototype.getDataPointAtXY=function(a,c,b){b=b||!1;for(var d=[],f=this._dataInRenderedOrder.length-1;0<=f;f--){var g=null;(g=this._dataInRenderedOrder[f].getDataPointAtXY(a,
c,b))&&d.push(g)}a=null;c=!1;for(b=0;b<d.length;b++)if("line"===d[b].dataSeries.type||"stepLine"===d[b].dataSeries.type||"area"===d[b].dataSeries.type||"stepArea"===d[b].dataSeries.type)if(f=K("markerSize",d[b].dataPoint,d[b].dataSeries)||8,d[b].distance<=f/2){c=!0;break}for(b=0;b<d.length;b++)c&&"line"!==d[b].dataSeries.type&&"stepLine"!==d[b].dataSeries.type&&"area"!==d[b].dataSeries.type&&"stepArea"!==d[b].dataSeries.type||(a?d[b].distance<=a.distance&&(a=d[b]):a=d[b]);return a};A.prototype.getObjectAtXY=
function(a,c,b){var d=null;if(b=this.getDataPointAtXY(a,c,b||!1))d=b.dataSeries.dataPointIds[b.dataPointIndex];else if(u)d=Ma(a,c,this._eventManager.ghostCtx);else for(b=0;b<this.legend.items.length;b++){var f=this.legend.items[b];a>=f.x1&&(a<=f.x2&&c>=f.y1&&c<=f.y2)&&(d=f.id)}return d};A.prototype.getAutoFontSize=function(a,c,b){a/=400;return Math.max(10,Math.round(Math.min(this.width,this.height)*a))};A.prototype.resetOverlayedCanvas=function(){this.overlaidCanvasCtx.clearRect(0,0,this.width,this.height)};
A.prototype.clearCanvas=function(){this.ctx.clearRect(0,0,this.width,this.height);this.backgroundColor&&(this.ctx.fillStyle=this.backgroundColor,this.ctx.fillRect(0,0,this.width,this.height))};A.prototype.attachEvent=function(a){this._events.push(a)};A.prototype._touchEventHandler=function(a){if(a.changedTouches&&this.interactivityEnabled){var c=[],b=a.changedTouches,d=b?b[0]:a,f=null;switch(a.type){case "touchstart":case "MSPointerDown":c=["mousemove","mousedown"];this._lastTouchData=xa(d);this._lastTouchData.time=
new Date;break;case "touchmove":case "MSPointerMove":c=["mousemove"];break;case "touchend":case "MSPointerUp":c="touchstart"===this._lastTouchEventType||"MSPointerDown"===this._lastTouchEventType?["mouseup","click"]:["mouseup"];break;default:return}if(!(b&&1<b.length)){f=xa(d);f.time=new Date;try{var g=f.y-this._lastTouchData.y,k=f.time-this._lastTouchData.time;if(15<Math.abs(g)&&(this._lastTouchData.scroll||200>k)){this._lastTouchData.scroll=!0;var h=window.parent||window;h&&h.scrollBy&&h.scrollBy(0,
-g)}}catch(l){}this._lastTouchEventType=a.type;if(this._lastTouchData.scroll&&this.zoomEnabled)this.isDrag&&this.resetOverlayedCanvas(),this.isDrag=!1;else for(b=0;b<c.length;b++)f=c[b],g=document.createEvent("MouseEvent"),g.initMouseEvent(f,!0,!0,window,1,d.screenX,d.screenY,d.clientX,d.clientY,!1,!1,!1,!1,0,null),d.target.dispatchEvent(g),a.preventManipulation&&a.preventManipulation(),a.preventDefault&&a.preventDefault()}}};A.prototype._dispatchRangeEvent=function(a,c){var b={chart:this};b.type=
a;b.trigger=c;var d=[];this.axisX&&0<this.axisX.length&&d.push("axisX");this.axisX2&&0<this.axisX2.length&&d.push("axisX2");this.axisY&&0<this.axisY.length&&d.push("axisY");this.axisY2&&0<this.axisY2.length&&d.push("axisY2");for(var f=0;f<d.length;f++)if(x(b[d[f]])&&(b[d[f]]=[]),"axisY"===d[f])for(var g=0;g<this.axisY.length;g++)b[d[f]].push({viewportMinimum:this[d[f]][g].sessionVariables.newViewportMinimum,viewportMaximum:this[d[f]][g].sessionVariables.newViewportMaximum});else if("axisY2"===d[f])for(g=
0;g<this.axisY2.length;g++)b[d[f]].push({viewportMinimum:this[d[f]][g].sessionVariables.newViewportMinimum,viewportMaximum:this[d[f]][g].sessionVariables.newViewportMaximum});else if("axisX"===d[f])for(g=0;g<this.axisX.length;g++)b[d[f]].push({viewportMinimum:this[d[f]][g].sessionVariables.newViewportMinimum,viewportMaximum:this[d[f]][g].sessionVariables.newViewportMaximum});else if("axisX2"===d[f])for(g=0;g<this.axisX2.length;g++)b[d[f]].push({viewportMinimum:this[d[f]][g].sessionVariables.newViewportMinimum,
viewportMaximum:this[d[f]][g].sessionVariables.newViewportMaximum});this.dispatchEvent(a,b,this)};A.prototype._mouseEventHandler=function(a){"undefined"===typeof a.target&&a.srcElement&&(a.target=a.srcElement);var c=xa(a),b=a.type,d,f;a.which?f=3==a.which:a.button&&(f=2==a.button);A.capturedEventParam&&(d=A.capturedEventParam,"mouseup"===b&&(A.capturedEventParam=null,d.chart.overlaidCanvas.releaseCapture?d.chart.overlaidCanvas.releaseCapture():document.documentElement.removeEventListener("mouseup",
d.chart._mouseEventHandler,!1)),d.hasOwnProperty(b)&&("mouseup"!==b||d.chart.overlaidCanvas.releaseCapture?a.target===d.chart.overlaidCanvas&&d[b].call(d.context,c.x,c.y):a.target!==d.chart.overlaidCanvas&&(d.chart.isDrag=!1)));if(this.interactivityEnabled)if(this._ignoreNextEvent)this._ignoreNextEvent=!1;else if(a.preventManipulation&&a.preventManipulation(),a.preventDefault&&a.preventDefault(),!f){if(!A.capturedEventParam&&this._events){for(var g=0;g<this._events.length;g++)if(this._events[g].hasOwnProperty(b))if(d=
this._events[g],f=d.bounds,c.x>=f.x1&&c.x<=f.x2&&c.y>=f.y1&&c.y<=f.y2){d[b].call(d.context,c.x,c.y);"mousedown"===b&&!0===d.capture?(A.capturedEventParam=d,this.overlaidCanvas.setCapture?this.overlaidCanvas.setCapture():document.documentElement.addEventListener("mouseup",this._mouseEventHandler,!1)):"mouseup"===b&&(d.chart.overlaidCanvas.releaseCapture?d.chart.overlaidCanvas.releaseCapture():document.documentElement.removeEventListener("mouseup",this._mouseEventHandler,!1));break}else d=null;a.target.style.cursor=
d&&d.cursor?d.cursor:this._defaultCursor}b=this.plotArea;if(c.x<b.x1||c.x>b.x2||c.y<b.y1||c.y>b.y2)this.toolTip&&this.toolTip.enabled?this.toolTip.hide():this.resetOverlayedCanvas();this.isDrag&&this.zoomEnabled||!this._eventManager||this._eventManager.mouseEventHandler(a)}};A.prototype._plotAreaMouseDown=function(a,c){this.isDrag=!0;this.dragStartPoint={x:a,y:c}};A.prototype._plotAreaMouseUp=function(a,c){if(("normal"===this.plotInfo.axisPlacement||"xySwapped"===this.plotInfo.axisPlacement)&&this.isDrag){var b=
c-this.dragStartPoint.y,d=a-this.dragStartPoint.x,f=0<=this.zoomType.indexOf("x"),g=0<=this.zoomType.indexOf("y"),k=!1;this.resetOverlayedCanvas();if("xySwapped"===this.plotInfo.axisPlacement)var h=g,g=f,f=h;if(this.panEnabled||this.zoomEnabled){if(this.panEnabled)for(f=g=0;f<this._axes.length;f++)b=this._axes[f],b.logarithmic?b.viewportMinimum<b.minimum?(g=b.minimum/b.viewportMinimum,b.sessionVariables.newViewportMinimum=b.viewportMinimum*g,b.sessionVariables.newViewportMaximum=b.viewportMaximum*
g,k=!0):b.viewportMaximum>b.maximum&&(g=b.viewportMaximum/b.maximum,b.sessionVariables.newViewportMinimum=b.viewportMinimum/g,b.sessionVariables.newViewportMaximum=b.viewportMaximum/g,k=!0):b.viewportMinimum<b.minimum?(g=b.minimum-b.viewportMinimum,b.sessionVariables.newViewportMinimum=b.viewportMinimum+g,b.sessionVariables.newViewportMaximum=b.viewportMaximum+g,k=!0):b.viewportMaximum>b.maximum&&(g=b.viewportMaximum-b.maximum,b.sessionVariables.newViewportMinimum=b.viewportMinimum-g,b.sessionVariables.newViewportMaximum=
b.viewportMaximum-g,k=!0);else if((!f||2<Math.abs(d))&&(!g||2<Math.abs(b))&&this.zoomEnabled){if(!this.dragStartPoint)return;b=f?this.dragStartPoint.x:this.plotArea.x1;d=g?this.dragStartPoint.y:this.plotArea.y1;f=f?a:this.plotArea.x2;g=g?c:this.plotArea.y2;2<Math.abs(b-f)&&2<Math.abs(d-g)&&this._zoomPanToSelectedRegion(b,d,f,g)&&(k=!0)}k&&(this._ignoreNextEvent=!0,this._dispatchRangeEvent("rangeChanging","zoom"),this.render(),this._dispatchRangeEvent("rangeChanged","zoom"),k&&(this.zoomEnabled&&"none"===
this._zoomButton.style.display)&&(ta(this._zoomButton,this._resetButton),S(this,this._zoomButton,"pan"),S(this,this._resetButton,"reset")))}}this.isDrag=!1};A.prototype._plotAreaMouseMove=function(a,c){if(this.isDrag&&"none"!==this.plotInfo.axisPlacement){var b=0,d=0,f=b=null,f=0<=this.zoomType.indexOf("x"),g=0<=this.zoomType.indexOf("y"),k=this;"xySwapped"===this.plotInfo.axisPlacement&&(b=g,g=f,f=b);b=this.dragStartPoint.x-a;d=this.dragStartPoint.y-c;2<Math.abs(b)&&8>Math.abs(b)&&(this.panEnabled||
this.zoomEnabled)?this.toolTip.hide():this.panEnabled||this.zoomEnabled||this.toolTip.mouseMoveHandler(a,c);if((!f||2<Math.abs(b)||!g||2<Math.abs(d))&&(this.panEnabled||this.zoomEnabled))if(this.panEnabled)f={x1:f?this.plotArea.x1+b:this.plotArea.x1,y1:g?this.plotArea.y1+d:this.plotArea.y1,x2:f?this.plotArea.x2+b:this.plotArea.x2,y2:g?this.plotArea.y2+d:this.plotArea.y2},clearTimeout(k._panTimerId),k._panTimerId=setTimeout(function(b,d,e,f){return function(){k._zoomPanToSelectedRegion(b,d,e,f,!0)&&
(k._dispatchRangeEvent("rangeChanging","pan"),k.render(),k._dispatchRangeEvent("rangeChanged","pan"),k.dragStartPoint.x=a,k.dragStartPoint.y=c)}}(f.x1,f.y1,f.x2,f.y2),0);else if(this.zoomEnabled){this.resetOverlayedCanvas();b=this.overlaidCanvasCtx.globalAlpha;this.overlaidCanvasCtx.fillStyle="#A89896";var d=f?this.dragStartPoint.x:this.plotArea.x1,h=g?this.dragStartPoint.y:this.plotArea.y1,l=f?a-this.dragStartPoint.x:this.plotArea.x2-this.plotArea.x1,m=g?c-this.dragStartPoint.y:this.plotArea.y2-
this.plotArea.y1;this.validateRegion(d,h,f?a:this.plotArea.x2-this.plotArea.x1,g?c:this.plotArea.y2-this.plotArea.y1,"xy"!==this.zoomType).isValid&&(this.resetOverlayedCanvas(),this.overlaidCanvasCtx.fillStyle="#99B2B5");this.overlaidCanvasCtx.globalAlpha=0.7;this.overlaidCanvasCtx.fillRect(d,h,l,m);this.overlaidCanvasCtx.globalAlpha=b}}else this.toolTip.mouseMoveHandler(a,c)};A.prototype._zoomPanToSelectedRegion=function(a,c,b,d,f){a=this.validateRegion(a,c,b,d,f);c=a.axesWithValidRange;b=a.axesRanges;
if(a.isValid)for(d=0;d<c.length;d++)f=b[d],c[d].setViewPortRange(f.val1,f.val2);return a.isValid};A.prototype.validateRegion=function(a,c,b,d,f){f=f||!1;for(var g=0<=this.zoomType.indexOf("x"),k=0<=this.zoomType.indexOf("y"),h=!1,l=[],m=[],p=[],n=0;n<this.axisX.length;n++)this.axisX[n]&&g&&m.push(this.axisX[n]);for(n=0;n<this.axisX2.length;n++)this.axisX2[n]&&g&&m.push(this.axisX2[n]);for(n=0;n<this.axisY.length;n++)this.axisY[n]&&k&&m.push(this.axisY[n]);for(n=0;n<this.axisY2.length;n++)this.axisY2[n]&&
k&&m.push(this.axisY2[n]);for(g=0;g<m.length;g++){var k=m[g],n=k.convertPixelToValue({x:a,y:c}),e=k.convertPixelToValue({x:b,y:d});if(n>e)var q=e,e=n,n=q;if(isFinite(k.dataInfo.minDiff))if(!(k.logarithmic&&e/n<Math.pow(k.dataInfo.minDiff,3)||!k.logarithmic&&Math.abs(e-n)<3*Math.abs(k.dataInfo.minDiff)||n<k.minimum||e>k.maximum))l.push(k),p.push({val1:n,val2:e}),h=!0;else if(!f){h=!1;break}}return{isValid:h,axesWithValidRange:l,axesRanges:p}};A.prototype.preparePlotArea=function(){var a=this.plotArea;
!u&&(0<a.x1||0<a.y1)&&a.ctx.translate(a.x1,a.y1);if((this.axisX[0]||this.axisX2[0])&&(this.axisY[0]||this.axisY2[0])){var c=this.axisX[0]?this.axisX[0].lineCoordinates:this.axisX2[0].lineCoordinates;if(this.axisY&&0<this.axisY.length&&this.axisY[0]){var b=this.axisY[0];a.x1=c.x1<c.x2?c.x1:b.lineCoordinates.x1;a.y1=c.y1<b.lineCoordinates.y1?c.y1:b.lineCoordinates.y1;a.x2=c.x2>b.lineCoordinates.x2?c.x2:b.lineCoordinates.x2;a.y2=c.y2>c.y1?c.y2:b.lineCoordinates.y2;a.width=a.x2-a.x1;a.height=a.y2-a.y1}this.axisY2&&
0<this.axisY2.length&&this.axisY2[0]&&(b=this.axisY2[0],a.x1=c.x1<c.x2?c.x1:b.lineCoordinates.x1,a.y1=c.y1<b.lineCoordinates.y1?c.y1:b.lineCoordinates.y1,a.x2=c.x2>b.lineCoordinates.x2?c.x2:b.lineCoordinates.x2,a.y2=c.y2>c.y1?c.y2:b.lineCoordinates.y2,a.width=a.x2-a.x1,a.height=a.y2-a.y1)}else c=this.layoutManager.getFreeSpace(),a.x1=c.x1,a.x2=c.x2,a.y1=c.y1,a.y2=c.y2,a.width=c.width,a.height=c.height;u||(a.canvas.width=a.width,a.canvas.height=a.height,a.canvas.style.left=a.x1+"px",a.canvas.style.top=
a.y1+"px",(0<a.x1||0<a.y1)&&a.ctx.translate(-a.x1,-a.y1));a.layoutManager=new ha(a.x1,a.y1,a.x2,a.y2,2)};A.prototype.renderIndexLabels=function(a){var c=a||this.plotArea.ctx,b=this.plotArea,d=0,f=0,g=0,k=0,h=d=k=f=g=0,l=0;for(a=0;a<this._indexLabels.length;a++){var m=this._indexLabels[a],p=m.chartType.toLowerCase(),n,e,h=K("indexLabelFontColor",m.dataPoint,m.dataSeries),l=K("indexLabelFontSize",m.dataPoint,m.dataSeries);n=K("indexLabelFontFamily",m.dataPoint,m.dataSeries);e=K("indexLabelFontStyle",
m.dataPoint,m.dataSeries);var k=K("indexLabelFontWeight",m.dataPoint,m.dataSeries),q=K("indexLabelBackgroundColor",m.dataPoint,m.dataSeries),f=K("indexLabelMaxWidth",m.dataPoint,m.dataSeries),g=K("indexLabelWrap",m.dataPoint,m.dataSeries),r=K("indexLabelLineDashType",m.dataPoint,m.dataSeries),s=K("indexLabelLineColor",m.dataPoint,m.dataSeries),z=x(m.dataPoint.indexLabelLineThickness)?x(m.dataSeries.options.indexLabelLineThickness)?0:m.dataSeries.options.indexLabelLineThickness:m.dataPoint.indexLabelLineThickness,
d=0<z?Math.min(10,("normal"===this.plotInfo.axisPlacement?this.plotArea.height:this.plotArea.width)<<0):0,v={percent:null,total:null},t=null;if(0<=m.dataSeries.type.indexOf("stacked")||"pie"===m.dataSeries.type||"doughnut"===m.dataSeries.type)v=this.getPercentAndTotal(m.dataSeries,m.dataPoint);if(m.dataSeries.indexLabelFormatter||m.dataPoint.indexLabelFormatter)t={chart:this,dataSeries:m.dataSeries,dataPoint:m.dataPoint,index:m.indexKeyword,total:v.total,percent:v.percent};var w=m.dataPoint.indexLabelFormatter?
m.dataPoint.indexLabelFormatter(t):m.dataPoint.indexLabel?this.replaceKeywordsWithValue(m.dataPoint.indexLabel,m.dataPoint,m.dataSeries,null,m.indexKeyword):m.dataSeries.indexLabelFormatter?m.dataSeries.indexLabelFormatter(t):m.dataSeries.indexLabel?this.replaceKeywordsWithValue(m.dataSeries.indexLabel,m.dataPoint,m.dataSeries,null,m.indexKeyword):null;if(null!==w&&""!==w){var v=K("indexLabelPlacement",m.dataPoint,m.dataSeries),t=K("indexLabelOrientation",m.dataPoint,m.dataSeries),ia=m.direction,
Y=m.dataSeries.axisX,B=m.dataSeries.axisY,y=!1,q=new V(c,{x:0,y:0,maxWidth:f?f:0.5*this.width,maxHeight:g?5*l:1.5*l,angle:"horizontal"===t?0:-90,text:w,padding:0,backgroundColor:q,horizontalAlign:"left",fontSize:l,fontFamily:n,fontWeight:k,fontColor:h,fontStyle:e,textBaseline:"top"});q.measureText();m.dataSeries.indexLabelMaxWidth=q.maxWidth;if(0<=p.indexOf("stackedarea100")){if(m.point.x<b.x1||m.point.x>b.x2||m.point.y<b.y1-1||m.point.y>b.y2+1)continue}else if(0<=p.indexOf("line")||0<=p.indexOf("area")||
0<=p.indexOf("bubble")||0<=p.indexOf("scatter")){if(m.dataPoint.x<Y.viewportMinimum||m.dataPoint.x>Y.viewportMaximum||m.dataPoint.y<B.viewportMinimum||m.dataPoint.y>B.viewportMaximum)continue}else if(0<=p.indexOf("column")){if(m.dataPoint.x<Y.viewportMinimum||m.dataPoint.x>Y.viewportMaximum||m.bounds.y1>b.y2||m.bounds.y2<b.y1)continue}else if(0<=p.indexOf("bar")){if(m.dataPoint.x<Y.viewportMinimum||m.dataPoint.x>Y.viewportMaximum||m.bounds.x1>b.x2||m.bounds.x2<b.x1)continue}else if(m.dataPoint.x<
Y.viewportMinimum||m.dataPoint.x>Y.viewportMaximum)continue;f=k=2;"horizontal"===t?(h=q.width,l=q.height):(l=q.width,h=q.height);if("normal"===this.plotInfo.axisPlacement){if(0<=p.indexOf("line")||0<=p.indexOf("area"))v="auto",k=4;else if(0<=p.indexOf("stacked"))"auto"===v&&(v="inside");else if("bubble"===p||"scatter"===p)v="inside";n=m.point.x-h/2;"inside"!==v?(f=b.y1,g=b.y2,0<ia?(e=m.point.y-l-k-d,e<f&&(e="auto"===v?Math.max(m.point.y,f)+k+d:f+k+d,y=e+l>m.point.y)):(e=m.point.y+k+d,e>g-l-k-d&&(e=
"auto"===v?Math.min(m.point.y,g)-l-k-d:g-l-k-d,y=e<m.point.y))):(f=Math.max(m.bounds.y1,b.y1),g=Math.min(m.bounds.y2,b.y2),d=0<=p.indexOf("range")?0<ia?Math.max(m.bounds.y1,b.y1)+l/2+k:Math.min(m.bounds.y2,b.y2)-l/2-k:(Math.max(m.bounds.y1,b.y1)+Math.min(m.bounds.y2,b.y2))/2,0<ia?(e=Math.max(m.point.y,d)-l/2,e<f&&("bubble"===p||"scatter"===p)&&(e=Math.max(m.point.y-l-k,b.y1+k))):(e=Math.min(m.point.y,d)-l/2,e>g-l-k&&("bubble"===p||"scatter"===p)&&(e=Math.min(m.point.y+k,b.y2-l-k))),e=Math.min(e,g-
l))}else 0<=p.indexOf("line")||0<=p.indexOf("area")||0<=p.indexOf("scatter")?(v="auto",f=4):0<=p.indexOf("stacked")?"auto"===v&&(v="inside"):"bubble"===p&&(v="inside"),e=m.point.y-l/2,"inside"!==v?(k=b.x1,g=b.x2,0>ia?(n=m.point.x-h-f-d,n<k&&(n="auto"===v?Math.max(m.point.x,k)+f+d:k+f+d,y=n+h>m.point.x)):(n=m.point.x+f+d,n>g-h-f-d&&(n="auto"===v?Math.min(m.point.x,g)-h-f-d:g-h-f-d,y=n<m.point.x))):(k=Math.max(m.bounds.x1,b.x1),Math.min(m.bounds.x2,b.x2),d=0<=p.indexOf("range")?0>ia?Math.max(m.bounds.x1,
b.x1)+h/2+f:Math.min(m.bounds.x2,b.x2)-h/2-f:(Math.max(m.bounds.x1,b.x1)+Math.min(m.bounds.x2,b.x2))/2,n=0>ia?Math.max(m.point.x,d)-h/2:Math.min(m.point.x,d)-h/2,n=Math.max(n,k));"vertical"===t&&(e+=l);q.x=n;q.y=e;q.render(!0);z&&("inside"!==v&&(0>p.indexOf("bar")&&m.point.x>b.x1&&m.point.x<b.x2||!y)&&(0>p.indexOf("column")&&m.point.y>b.y1&&m.point.y<b.y2||!y))&&(c.lineWidth=z,c.strokeStyle=s?s:"gray",c.setLineDash&&c.setLineDash(G(r,z)),c.beginPath(),c.moveTo(m.point.x,m.point.y),0<=p.indexOf("bar")?
c.lineTo(n+(0<m.direction?0:h),e+("horizontal"===t?l:-l)/2):0<=p.indexOf("column")?c.lineTo(n+h/2,e+((0<m.direction?l:-l)+("horizontal"===t?l:-l))/2):c.lineTo(n+h/2,e+((e<m.point.y?l:-l)+("horizontal"===t?l:-l))/2),c.stroke())}}c={source:c,dest:this.plotArea.ctx,animationCallback:F.fadeInAnimation,easingFunction:F.easing.easeInQuad,animationBase:0,startTimePercent:0.7};for(a=0;a<this._indexLabels.length;a++)m=this._indexLabels[a],q=K("indexLabelBackgroundColor",m.dataPoint,m.dataSeries),m.dataSeries.indexLabelBackgroundColor=
x(q)?u?"transparent":null:q;return c};A.prototype.renderLine=function(a){var c=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var b=this._eventManager.ghostCtx;c.save();var d=this.plotArea;c.beginPath();c.rect(d.x1,d.y1,d.width,d.height);c.clip();for(var d=[],f=0;f<a.dataSeriesIndexes.length;f++){var g=a.dataSeriesIndexes[f],k=this.data[g];c.lineWidth=k.lineThickness;var h=k.dataPoints,l="solid";if(c.setLineDash){var m=G(k.nullDataLineDashType,k.lineThickness),l=k.lineDashType,
p=G(l,k.lineThickness);c.setLineDash(p)}var n=k.id;this._eventManager.objectMap[n]={objectType:"dataSeries",dataSeriesIndex:g};n=E(n);b.strokeStyle=n;b.lineWidth=0<k.lineThickness?Math.max(k.lineThickness,4):0;var n=k._colorSet,e=n=k.lineColor=k.options.lineColor?k.options.lineColor:n[0];c.strokeStyle=n;var q=!0,r=0,s,z;c.beginPath();if(0<h.length){for(var v=!1,r=0;r<h.length;r++)if(s=h[r].x.getTime?h[r].x.getTime():h[r].x,!(s<a.axisX.dataInfo.viewPortMin||s>a.axisX.dataInfo.viewPortMax&&(!k.connectNullData||
!v)))if("number"!==typeof h[r].y)0<r&&!(k.connectNullData||v||q)&&(c.stroke(),u&&b.stroke()),v=!0;else{s=a.axisX.convertValueToPixel(s);z=a.axisY.convertValueToPixel(h[r].y);var t=k.dataPointIds[r];this._eventManager.objectMap[t]={id:t,objectType:"dataPoint",dataSeriesIndex:g,dataPointIndex:r,x1:s,y1:z};q||v?(!q&&k.connectNullData?(c.setLineDash&&(k.options.nullDataLineDashType||l===k.lineDashType&&k.lineDashType!==k.nullDataLineDashType)&&(c.stroke(),l=k.nullDataLineDashType,c.setLineDash(m)),c.lineTo(s,
z),u&&b.lineTo(s,z)):(c.beginPath(),c.moveTo(s,z),u&&(b.beginPath(),b.moveTo(s,z))),v=q=!1):(c.lineTo(s,z),u&&b.lineTo(s,z),0==r%500&&(c.stroke(),c.beginPath(),c.moveTo(s,z),u&&(b.stroke(),b.beginPath(),b.moveTo(s,z))));r<h.length-1&&(e!==(h[r].lineColor||n)||l!==(h[r].lineDashType||k.lineDashType))&&(c.stroke(),c.beginPath(),c.moveTo(s,z),e=h[r].lineColor||n,c.strokeStyle=e,c.setLineDash&&(h[r].lineDashType?(l=h[r].lineDashType,c.setLineDash(G(l,k.lineThickness))):(l=k.lineDashType,c.setLineDash(p))));
if(0<h[r].markerSize||0<k.markerSize){var w=k.getMarkerProperties(r,s,z,c);d.push(w);t=E(t);u&&d.push({x:s,y:z,ctx:b,type:w.type,size:w.size,color:t,borderColor:t,borderThickness:w.borderThickness})}(h[r].indexLabel||k.indexLabel||h[r].indexLabelFormatter||k.indexLabelFormatter)&&this._indexLabels.push({chartType:"line",dataPoint:h[r],dataSeries:k,point:{x:s,y:z},direction:0>h[r].y===a.axisY.reversed?1:-1,color:n})}c.stroke();u&&b.stroke()}}P.drawMarkers(d);c.restore();c.beginPath();u&&b.beginPath();
return{source:c,dest:this.plotArea.ctx,animationCallback:F.xClipAnimation,easingFunction:F.easing.linear,animationBase:0}}};A.prototype.renderStepLine=function(a){var c=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var b=this._eventManager.ghostCtx;c.save();var d=this.plotArea;c.beginPath();c.rect(d.x1,d.y1,d.width,d.height);c.clip();for(var d=[],f=0;f<a.dataSeriesIndexes.length;f++){var g=a.dataSeriesIndexes[f],k=this.data[g];c.lineWidth=k.lineThickness;var h=k.dataPoints,
l="solid";if(c.setLineDash){var m=G(k.nullDataLineDashType,k.lineThickness),l=k.lineDashType,p=G(l,k.lineThickness);c.setLineDash(p)}var n=k.id;this._eventManager.objectMap[n]={objectType:"dataSeries",dataSeriesIndex:g};n=E(n);b.strokeStyle=n;b.lineWidth=0<k.lineThickness?Math.max(k.lineThickness,4):0;var n=k._colorSet,e=n=k.lineColor=k.options.lineColor?k.options.lineColor:n[0];c.strokeStyle=n;var q=!0,r=0,s,z;c.beginPath();if(0<h.length){for(var v=!1,r=0;r<h.length;r++)if(s=h[r].getTime?h[r].x.getTime():
h[r].x,!(s<a.axisX.dataInfo.viewPortMin||s>a.axisX.dataInfo.viewPortMax&&(!k.connectNullData||!v)))if("number"!==typeof h[r].y)0<r&&!(k.connectNullData||v||q)&&(c.stroke(),u&&b.stroke()),v=!0;else{var t=z;s=a.axisX.convertValueToPixel(s);z=a.axisY.convertValueToPixel(h[r].y);var w=k.dataPointIds[r];this._eventManager.objectMap[w]={id:w,objectType:"dataPoint",dataSeriesIndex:g,dataPointIndex:r,x1:s,y1:z};q||v?(!q&&k.connectNullData?(c.setLineDash&&(k.options.nullDataLineDashType||l===k.lineDashType&&
k.lineDashType!==k.nullDataLineDashType)&&(c.stroke(),l=k.nullDataLineDashType,c.setLineDash(m)),c.lineTo(s,t),c.lineTo(s,z),u&&(b.lineTo(s,t),b.lineTo(s,z))):(c.beginPath(),c.moveTo(s,z),u&&(b.beginPath(),b.moveTo(s,z))),v=q=!1):(c.lineTo(s,t),u&&b.lineTo(s,t),c.lineTo(s,z),u&&b.lineTo(s,z),0==r%500&&(c.stroke(),c.beginPath(),c.moveTo(s,z),u&&(b.stroke(),b.beginPath(),b.moveTo(s,z))));r<h.length-1&&(e!==(h[r].lineColor||n)||l!==(h[r].lineDashType||k.lineDashType))&&(c.stroke(),c.beginPath(),c.moveTo(s,
z),e=h[r].lineColor||n,c.strokeStyle=e,c.setLineDash&&(h[r].lineDashType?(l=h[r].lineDashType,c.setLineDash(G(l,k.lineThickness))):(l=k.lineDashType,c.setLineDash(p))));if(0<h[r].markerSize||0<k.markerSize)t=k.getMarkerProperties(r,s,z,c),d.push(t),w=E(w),u&&d.push({x:s,y:z,ctx:b,type:t.type,size:t.size,color:w,borderColor:w,borderThickness:t.borderThickness});(h[r].indexLabel||k.indexLabel||h[r].indexLabelFormatter||k.indexLabelFormatter)&&this._indexLabels.push({chartType:"stepLine",dataPoint:h[r],
dataSeries:k,point:{x:s,y:z},direction:0>h[r].y===a.axisY.reversed?1:-1,color:n})}c.stroke();u&&b.stroke()}}P.drawMarkers(d);c.restore();c.beginPath();u&&b.beginPath();return{source:c,dest:this.plotArea.ctx,animationCallback:F.xClipAnimation,easingFunction:F.easing.linear,animationBase:0}}};A.prototype.renderSpline=function(a){function c(a){a=ua(a,2);if(0<a.length){b.beginPath();u&&d.beginPath();b.moveTo(a[0].x,a[0].y);a[0].newStrokeStyle&&(b.strokeStyle=a[0].newStrokeStyle);a[0].newLineDashArray&&
b.setLineDash(a[0].newLineDashArray);u&&d.moveTo(a[0].x,a[0].y);for(var c=0;c<a.length-3;c+=3)if(b.bezierCurveTo(a[c+1].x,a[c+1].y,a[c+2].x,a[c+2].y,a[c+3].x,a[c+3].y),u&&d.bezierCurveTo(a[c+1].x,a[c+1].y,a[c+2].x,a[c+2].y,a[c+3].x,a[c+3].y),0<c&&0===c%3E3||a[c+3].newStrokeStyle||a[c+3].newLineDashArray)b.stroke(),b.beginPath(),b.moveTo(a[c+3].x,a[c+3].y),a[c+3].newStrokeStyle&&(b.strokeStyle=a[c+3].newStrokeStyle),a[c+3].newLineDashArray&&b.setLineDash(a[c+3].newLineDashArray),u&&(d.stroke(),d.beginPath(),
d.moveTo(a[c+3].x,a[c+3].y));b.stroke();u&&d.stroke()}}var b=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var d=this._eventManager.ghostCtx;b.save();var f=this.plotArea;b.beginPath();b.rect(f.x1,f.y1,f.width,f.height);b.clip();for(var f=[],g=0;g<a.dataSeriesIndexes.length;g++){var k=a.dataSeriesIndexes[g],h=this.data[k];b.lineWidth=h.lineThickness;var l=h.dataPoints,m="solid";if(b.setLineDash){var p=G(h.nullDataLineDashType,h.lineThickness),m=h.lineDashType,n=G(m,h.lineThickness);
b.setLineDash(n)}var e=h.id;this._eventManager.objectMap[e]={objectType:"dataSeries",dataSeriesIndex:k};e=E(e);d.strokeStyle=e;d.lineWidth=0<h.lineThickness?Math.max(h.lineThickness,4):0;var e=h._colorSet,q=e=h.lineColor=h.options.lineColor?h.options.lineColor:e[0];b.strokeStyle=e;var r=0,s,z,v=[];b.beginPath();if(0<l.length)for(z=!1,r=0;r<l.length;r++)if(s=l[r].getTime?l[r].x.getTime():l[r].x,!(s<a.axisX.dataInfo.viewPortMin||s>a.axisX.dataInfo.viewPortMax&&(!h.connectNullData||!z)))if("number"!==
typeof l[r].y)0<r&&!z&&(h.connectNullData?b.setLineDash&&(0<v.length&&(h.options.nullDataLineDashType||!l[r-1].lineDashType))&&(v[v.length-1].newLineDashArray=p,m=h.nullDataLineDashType):(c(v),v=[])),z=!0;else{s=a.axisX.convertValueToPixel(s);z=a.axisY.convertValueToPixel(l[r].y);var t=h.dataPointIds[r];this._eventManager.objectMap[t]={id:t,objectType:"dataPoint",dataSeriesIndex:k,dataPointIndex:r,x1:s,y1:z};v[v.length]={x:s,y:z};r<l.length-1&&(q!==(l[r].lineColor||e)||m!==(l[r].lineDashType||h.lineDashType))&&
(q=l[r].lineColor||e,v[v.length-1].newStrokeStyle=q,b.setLineDash&&(l[r].lineDashType?(m=l[r].lineDashType,v[v.length-1].newLineDashArray=G(m,h.lineThickness)):(m=h.lineDashType,v[v.length-1].newLineDashArray=n)));if(0<l[r].markerSize||0<h.markerSize){var w=h.getMarkerProperties(r,s,z,b);f.push(w);t=E(t);u&&f.push({x:s,y:z,ctx:d,type:w.type,size:w.size,color:t,borderColor:t,borderThickness:w.borderThickness})}(l[r].indexLabel||h.indexLabel||l[r].indexLabelFormatter||h.indexLabelFormatter)&&this._indexLabels.push({chartType:"spline",
dataPoint:l[r],dataSeries:h,point:{x:s,y:z},direction:0>l[r].y===a.axisY.reversed?1:-1,color:e});z=!1}c(v)}P.drawMarkers(f);b.restore();b.beginPath();u&&d.beginPath();return{source:b,dest:this.plotArea.ctx,animationCallback:F.xClipAnimation,easingFunction:F.easing.linear,animationBase:0}}};var M=function(a,c,b,d,f,g,k,h,l,m,p,n,e){"undefined"===typeof e&&(e=1);k=k||0;h=h||"black";var q=15<d-c&&15<f-b?8:0.35*Math.min(d-c,f-b);a.beginPath();a.moveTo(c,b);a.save();a.fillStyle=g;a.globalAlpha=e;a.fillRect(c,
b,d-c,f-b);a.globalAlpha=1;0<k&&(e=0===k%2?0:0.5,a.beginPath(),a.lineWidth=k,a.strokeStyle=h,a.moveTo(c,b),a.rect(c-e,b-e,d-c+2*e,f-b+2*e),a.stroke());a.restore();!0===l&&(a.save(),a.beginPath(),a.moveTo(c,b),a.lineTo(c+q,b+q),a.lineTo(d-q,b+q),a.lineTo(d,b),a.closePath(),k=a.createLinearGradient((d+c)/2,b+q,(d+c)/2,b),k.addColorStop(0,g),k.addColorStop(1,"rgba(255, 255, 255, .4)"),a.fillStyle=k,a.fill(),a.restore());!0===m&&(a.save(),a.beginPath(),a.moveTo(c,f),a.lineTo(c+q,f-q),a.lineTo(d-q,f-q),
a.lineTo(d,f),a.closePath(),k=a.createLinearGradient((d+c)/2,f-q,(d+c)/2,f),k.addColorStop(0,g),k.addColorStop(1,"rgba(255, 255, 255, .4)"),a.fillStyle=k,a.fill(),a.restore());!0===p&&(a.save(),a.beginPath(),a.moveTo(c,b),a.lineTo(c+q,b+q),a.lineTo(c+q,f-q),a.lineTo(c,f),a.closePath(),k=a.createLinearGradient(c+q,(f+b)/2,c,(f+b)/2),k.addColorStop(0,g),k.addColorStop(1,"rgba(255, 255, 255, 0.1)"),a.fillStyle=k,a.fill(),a.restore());!0===n&&(a.save(),a.beginPath(),a.moveTo(d,b),a.lineTo(d-q,b+q),a.lineTo(d-
q,f-q),a.lineTo(d,f),k=a.createLinearGradient(d-q,(f+b)/2,d,(f+b)/2),k.addColorStop(0,g),k.addColorStop(1,"rgba(255, 255, 255, 0.1)"),a.fillStyle=k,k.addColorStop(0,g),k.addColorStop(1,"rgba(255, 255, 255, 0.1)"),a.fillStyle=k,a.fill(),a.closePath(),a.restore())};A.prototype.renderColumn=function(a){var c=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var b=null,d=this.plotArea,f=0,g,k,h,l=a.axisY.convertValueToPixel(a.axisY.logarithmic?a.axisY.viewportMinimum:0),f=this.dataPointMinWidth=
this.dataPointMinWidth?this.dataPointMinWidth:this.dataPointWidth?this.dataPointWidth:1,m=this.dataPointMaxWidth=this.dataPointMaxWidth?this.dataPointMaxWidth:this.dataPointWidth?this.dataPointWidth:Math.min(0.15*this.width,0.9*(this.plotArea.width/a.plotType.totalDataSeries))<<0,p=a.axisX.dataInfo.minDiff;isFinite(p)||(p=0.3*Math.abs(a.axisX.range));p=this.dataPointWidth=this.dataPointWidth?this.dataPointWidth:0.9*(d.width*(a.axisX.logarithmic?Math.log(p)/Math.log(a.axisX.range):Math.abs(p)/Math.abs(a.axisX.range))/
a.plotType.totalDataSeries)<<0;this.dataPointMaxWidth&&f>m&&(f=Math.min(this.dataPointWidth?this.dataPointWidth:Infinity,m));!this.dataPointMaxWidth&&(this.dataPointMinWidth&&m<f)&&(m=Math.max(this.dataPointWidth?this.dataPointWidth:-Infinity,f));p<f&&(p=f);p>m&&(p=m);c.save();u&&this._eventManager.ghostCtx.save();c.beginPath();c.rect(d.x1,d.y1,d.width,d.height);c.clip();u&&(this._eventManager.ghostCtx.beginPath(),this._eventManager.ghostCtx.rect(d.x1,d.y1,d.width,d.height),this._eventManager.ghostCtx.clip());
for(d=0;d<a.dataSeriesIndexes.length;d++){var m=a.dataSeriesIndexes[d],n=this.data[m],e=n.dataPoints;if(0<e.length)for(var q=5<p&&n.bevelEnabled?!0:!1,f=0;f<e.length;f++)if(e[f].getTime?h=e[f].x.getTime():h=e[f].x,!(h<a.axisX.dataInfo.viewPortMin||h>a.axisX.dataInfo.viewPortMax)&&"number"===typeof e[f].y){g=a.axisX.convertValueToPixel(h);k=a.axisY.convertValueToPixel(e[f].y);g=a.axisX.reversed?g+a.plotType.totalDataSeries*p/2-(a.previousDataSeriesCount+d)*p<<0:g-a.plotType.totalDataSeries*p/2+(a.previousDataSeriesCount+
d)*p<<0;var r=a.axisX.reversed?g-p<<0:g+p<<0,s;0<=e[f].y?s=l:(s=k,k=l);k>s&&(b=k,k=s,s=b);b=e[f].color?e[f].color:n._colorSet[f%n._colorSet.length];M(c,g,k,r,s,b,0,null,q&&0<=e[f].y,0>e[f].y&&q,!1,!1,n.fillOpacity);b=n.dataPointIds[f];this._eventManager.objectMap[b]={id:b,objectType:"dataPoint",dataSeriesIndex:m,dataPointIndex:f,x1:g,y1:k,x2:r,y2:s};b=E(b);u&&M(this._eventManager.ghostCtx,g,k,r,s,b,0,null,!1,!1,!1,!1);(e[f].indexLabel||n.indexLabel||e[f].indexLabelFormatter||n.indexLabelFormatter)&&
this._indexLabels.push({chartType:"column",dataPoint:e[f],dataSeries:n,point:{x:g+(r-g)/2,y:0>e[f].y===a.axisY.reversed?k:s},direction:0>e[f].y===a.axisY.reversed?1:-1,bounds:{x1:g,y1:Math.min(k,s),x2:r,y2:Math.max(k,s)},color:b})}}c.restore();u&&this._eventManager.ghostCtx.restore();a=Math.min(l,a.axisY.bounds.y2);return{source:c,dest:this.plotArea.ctx,animationCallback:F.yScaleAnimation,easingFunction:F.easing.easeOutQuart,animationBase:a}}};A.prototype.renderStackedColumn=function(a){var c=a.targetCanvasCtx||
this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var b=null,d=this.plotArea,f=[],g=[],k=[],h=0,l,m=a.axisY.convertValueToPixel(a.axisY.logarithmic?a.axisY.viewportMinimum:0),h=this.dataPointMinWidth?this.dataPointMinWidth:this.dataPointWidth?this.dataPointWidth:1,p=this.dataPointMaxWidth?this.dataPointMaxWidth:this.dataPointWidth?this.dataPointWidth:0.15*this.width<<0,n=a.axisX.dataInfo.minDiff;isFinite(n)||(n=0.3*Math.abs(a.axisX.range));n=this.dataPointWidth?this.dataPointWidth:0.9*(d.width*
(a.axisX.logarithmic?Math.log(n)/Math.log(a.axisX.range):Math.abs(n)/Math.abs(a.axisX.range))/a.plotType.plotUnits.length)<<0;this.dataPointMaxWidth&&h>p&&(h=Math.min(this.dataPointWidth?this.dataPointWidth:Infinity,p));!this.dataPointMaxWidth&&(this.dataPointMinWidth&&p<h)&&(p=Math.max(this.dataPointWidth?this.dataPointWidth:-Infinity,h));n<h&&(n=h);n>p&&(n=p);c.save();u&&this._eventManager.ghostCtx.save();c.beginPath();c.rect(d.x1,d.y1,d.width,d.height);c.clip();u&&(this._eventManager.ghostCtx.beginPath(),
this._eventManager.ghostCtx.rect(d.x1,d.y1,d.width,d.height),this._eventManager.ghostCtx.clip());for(p=0;p<a.dataSeriesIndexes.length;p++){var e=a.dataSeriesIndexes[p],q=this.data[e],r=q.dataPoints;if(0<r.length){var s=5<n&&q.bevelEnabled?!0:!1;c.strokeStyle="#4572A7 ";for(h=0;h<r.length;h++)if(b=r[h].x.getTime?r[h].x.getTime():r[h].x,!(b<a.axisX.dataInfo.viewPortMin||b>a.axisX.dataInfo.viewPortMax)&&"number"===typeof r[h].y){var d=a.axisX.convertValueToPixel(b),z=d-a.plotType.plotUnits.length*n/
2+a.index*n<<0,v=z+n<<0,t;if(a.axisY.logarithmic)k[b]=r[h].y+(k[b]?k[b]:0),0<k[b]&&(l=a.axisY.convertValueToPixel(k[b]),t=f[b]?f[b]:m,f[b]=l);else if(l=a.axisY.convertValueToPixel(r[h].y),0<=r[h].y){var w=f[b]?f[b]:0;l-=w;t=m-w;f[b]=w+(t-l)}else w=g[b]?g[b]:0,t=l+w,l=m+w,g[b]=w+(t-l);b=r[h].color?r[h].color:q._colorSet[h%q._colorSet.length];M(c,z,l,v,t,b,0,null,s&&0<=r[h].y,0>r[h].y&&s,!1,!1,q.fillOpacity);b=q.dataPointIds[h];this._eventManager.objectMap[b]={id:b,objectType:"dataPoint",dataSeriesIndex:e,
dataPointIndex:h,x1:z,y1:l,x2:v,y2:t};b=E(b);u&&M(this._eventManager.ghostCtx,z,l,v,t,b,0,null,!1,!1,!1,!1);(r[h].indexLabel||q.indexLabel||r[h].indexLabelFormatter||q.indexLabelFormatter)&&this._indexLabels.push({chartType:"stackedColumn",dataPoint:r[h],dataSeries:q,point:{x:d,y:0<=r[h].y?l:t},direction:0>r[h].y===a.axisY.reversed?1:-1,bounds:{x1:z,y1:Math.min(l,t),x2:v,y2:Math.max(l,t)},color:b})}}}c.restore();u&&this._eventManager.ghostCtx.restore();a=Math.min(m,a.axisY.bounds.y2);return{source:c,
dest:this.plotArea.ctx,animationCallback:F.yScaleAnimation,easingFunction:F.easing.easeOutQuart,animationBase:a}}};A.prototype.renderStackedColumn100=function(a){var c=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var b=null,d=this.plotArea,f=[],g=[],k=[],h=0,l,m=a.axisY.convertValueToPixel(a.axisY.logarithmic?a.axisY.viewportMinimum:0),h=this.dataPointMinWidth?this.dataPointMinWidth:this.dataPointWidth?this.dataPointWidth:1,p=this.dataPointMaxWidth?this.dataPointMaxWidth:
this.dataPointWidth?this.dataPointWidth:0.15*this.width<<0,n=a.axisX.dataInfo.minDiff;isFinite(n)||(n=0.3*Math.abs(a.axisX.range));n=this.dataPointWidth?this.dataPointWidth:0.9*(d.width*(a.axisX.logarithmic?Math.log(n)/Math.log(a.axisX.range):Math.abs(n)/Math.abs(a.axisX.range))/a.plotType.plotUnits.length)<<0;this.dataPointMaxWidth&&h>p&&(h=Math.min(this.dataPointWidth?this.dataPointWidth:Infinity,p));!this.dataPointMaxWidth&&(this.dataPointMinWidth&&p<h)&&(p=Math.max(this.dataPointWidth?this.dataPointWidth:
-Infinity,h));n<h&&(n=h);n>p&&(n=p);c.save();u&&this._eventManager.ghostCtx.save();c.beginPath();c.rect(d.x1,d.y1,d.width,d.height);c.clip();u&&(this._eventManager.ghostCtx.beginPath(),this._eventManager.ghostCtx.rect(d.x1,d.y1,d.width,d.height),this._eventManager.ghostCtx.clip());for(p=0;p<a.dataSeriesIndexes.length;p++){var e=a.dataSeriesIndexes[p],q=this.data[e],r=q.dataPoints;if(0<r.length)for(var s=5<n&&q.bevelEnabled?!0:!1,h=0;h<r.length;h++)if(b=r[h].x.getTime?r[h].x.getTime():r[h].x,!(b<a.axisX.dataInfo.viewPortMin||
b>a.axisX.dataInfo.viewPortMax)&&"number"===typeof r[h].y){d=a.axisX.convertValueToPixel(b);l=0!==a.dataPointYSums[b]?100*(r[h].y/a.dataPointYSums[b]):0;var z=d-a.plotType.plotUnits.length*n/2+a.index*n<<0,v=z+n<<0,t;if(a.axisY.logarithmic){k[b]=l+(k[b]?k[b]:0);if(0>=k[b])continue;l=a.axisY.convertValueToPixel(k[b]);t=f[b]?f[b]:m;f[b]=l}else if(l=a.axisY.convertValueToPixel(l),0<=r[h].y){var w=f[b]?f[b]:0;l-=w;t=m-w;f[b]=w+(t-l)}else w=g[b]?g[b]:0,t=l+w,l=m+w,g[b]=w+(t-l);b=r[h].color?r[h].color:
q._colorSet[h%q._colorSet.length];M(c,z,l,v,t,b,0,null,s&&0<=r[h].y,0>r[h].y&&s,!1,!1,q.fillOpacity);b=q.dataPointIds[h];this._eventManager.objectMap[b]={id:b,objectType:"dataPoint",dataSeriesIndex:e,dataPointIndex:h,x1:z,y1:l,x2:v,y2:t};b=E(b);u&&M(this._eventManager.ghostCtx,z,l,v,t,b,0,null,!1,!1,!1,!1);(r[h].indexLabel||q.indexLabel||r[h].indexLabelFormatter||q.indexLabelFormatter)&&this._indexLabels.push({chartType:"stackedColumn100",dataPoint:r[h],dataSeries:q,point:{x:d,y:0<=r[h].y?l:t},direction:0>
r[h].y===a.axisY.reversed?1:-1,bounds:{x1:z,y1:Math.min(l,t),x2:v,y2:Math.max(l,t)},color:b})}}c.restore();u&&this._eventManager.ghostCtx.restore();a=Math.min(m,a.axisY.bounds.y2);return{source:c,dest:this.plotArea.ctx,animationCallback:F.yScaleAnimation,easingFunction:F.easing.easeOutQuart,animationBase:a}}};A.prototype.renderBar=function(a){var c=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var b=null,d=this.plotArea,f=0,g,k,h,l=a.axisY.convertValueToPixel(a.axisY.logarithmic?
a.axisY.viewportMinimum:0),f=this.dataPointMinWidth?this.dataPointMinWidth:this.dataPointWidth?this.dataPointWidth:1,m=this.dataPointMaxWidth?this.dataPointMaxWidth:this.dataPointWidth?this.dataPointWidth:Math.min(0.15*this.height,0.9*(this.plotArea.height/a.plotType.totalDataSeries))<<0,p=a.axisX.dataInfo.minDiff;isFinite(p)||(p=0.3*Math.abs(a.axisX.range));p=this.dataPointWidth?this.dataPointWidth:0.9*(d.height*(a.axisX.logarithmic?Math.log(p)/Math.log(a.axisX.range):Math.abs(p)/Math.abs(a.axisX.range))/
a.plotType.totalDataSeries)<<0;this.dataPointMaxWidth&&f>m&&(f=Math.min(this.dataPointWidth?this.dataPointWidth:Infinity,m));!this.dataPointMaxWidth&&(this.dataPointMinWidth&&m<f)&&(m=Math.max(this.dataPointWidth?this.dataPointWidth:-Infinity,f));p<f&&(p=f);p>m&&(p=m);c.save();u&&this._eventManager.ghostCtx.save();c.beginPath();c.rect(d.x1,d.y1,d.width,d.height);c.clip();u&&(this._eventManager.ghostCtx.beginPath(),this._eventManager.ghostCtx.rect(d.x1,d.y1,d.width,d.height),this._eventManager.ghostCtx.clip());
for(d=0;d<a.dataSeriesIndexes.length;d++){var m=a.dataSeriesIndexes[d],n=this.data[m],e=n.dataPoints;if(0<e.length){var q=5<p&&n.bevelEnabled?!0:!1;c.strokeStyle="#4572A7 ";for(f=0;f<e.length;f++)if(e[f].getTime?h=e[f].x.getTime():h=e[f].x,!(h<a.axisX.dataInfo.viewPortMin||h>a.axisX.dataInfo.viewPortMax)&&"number"===typeof e[f].y){k=a.axisX.convertValueToPixel(h);g=a.axisY.convertValueToPixel(e[f].y);k=a.axisX.reversed?k+a.plotType.totalDataSeries*p/2-(a.previousDataSeriesCount+d)*p<<0:k-a.plotType.totalDataSeries*
p/2+(a.previousDataSeriesCount+d)*p<<0;var r=a.axisX.reversed?k-p<<0:k+p<<0,s;0<=e[f].y?s=l:(s=g,g=l);b=e[f].color?e[f].color:n._colorSet[f%n._colorSet.length];M(c,s,k,g,r,b,0,null,q,!1,!1,!1,n.fillOpacity);b=n.dataPointIds[f];this._eventManager.objectMap[b]={id:b,objectType:"dataPoint",dataSeriesIndex:m,dataPointIndex:f,x1:s,y1:k,x2:g,y2:r};b=E(b);u&&M(this._eventManager.ghostCtx,s,k,g,r,b,0,null,!1,!1,!1,!1);(e[f].indexLabel||n.indexLabel||e[f].indexLabelFormatter||n.indexLabelFormatter)&&this._indexLabels.push({chartType:"bar",
dataPoint:e[f],dataSeries:n,point:{x:0<=e[f].y?g:s,y:k+(r-k)/2},direction:0>e[f].y===a.axisY.reversed?1:-1,bounds:{x1:Math.min(s,g),y1:k,x2:Math.max(s,g),y2:r},color:b})}}}c.restore();u&&this._eventManager.ghostCtx.restore();a=Math.max(l,a.axisX.bounds.x2);return{source:c,dest:this.plotArea.ctx,animationCallback:F.xScaleAnimation,easingFunction:F.easing.easeOutQuart,animationBase:a}}};A.prototype.renderStackedBar=function(a){var c=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var b=
null,d=this.plotArea,f=[],g=[],k=[],h=0,l,m=a.axisY.convertValueToPixel(a.axisY.logarithmic?a.axisY.viewportMinimum:0),h=this.dataPointMinWidth?this.dataPointMinWidth:this.dataPointWidth?this.dataPointWidth:1,p=this.dataPointMaxWidth?this.dataPointMaxWidth:this.dataPointWidth?this.dataPointWidth:0.15*this.height<<0,n=a.axisX.dataInfo.minDiff;isFinite(n)||(n=0.3*Math.abs(a.axisX.range));n=this.dataPointWidth?this.dataPointWidth:0.9*(d.height*(a.axisX.logarithmic?Math.log(n)/Math.log(a.axisX.range):
Math.abs(n)/Math.abs(a.axisX.range))/a.plotType.plotUnits.length)<<0;this.dataPointMaxWidth&&h>p&&(h=Math.min(this.dataPointWidth?this.dataPointWidth:Infinity,p));!this.dataPointMaxWidth&&(this.dataPointMinWidth&&p<h)&&(p=Math.max(this.dataPointWidth?this.dataPointWidth:-Infinity,h));n<h&&(n=h);n>p&&(n=p);c.save();u&&this._eventManager.ghostCtx.save();c.beginPath();c.rect(d.x1,d.y1,d.width,d.height);c.clip();u&&(this._eventManager.ghostCtx.beginPath(),this._eventManager.ghostCtx.rect(d.x1,d.y1,d.width,
d.height),this._eventManager.ghostCtx.clip());for(p=0;p<a.dataSeriesIndexes.length;p++){var e=a.dataSeriesIndexes[p],q=this.data[e],r=q.dataPoints;if(0<r.length){var s=5<n&&q.bevelEnabled?!0:!1;c.strokeStyle="#4572A7 ";for(h=0;h<r.length;h++)if(b=r[h].x.getTime?r[h].x.getTime():r[h].x,!(b<a.axisX.dataInfo.viewPortMin||b>a.axisX.dataInfo.viewPortMax)&&"number"===typeof r[h].y){var d=a.axisX.convertValueToPixel(b),z=d-a.plotType.plotUnits.length*n/2+a.index*n<<0,v=z+n<<0,t;if(a.axisY.logarithmic)k[b]=
r[h].y+(k[b]?k[b]:0),0<k[b]&&(t=f[b]?f[b]:m,f[b]=l=a.axisY.convertValueToPixel(k[b]));else if(l=a.axisY.convertValueToPixel(r[h].y),0<=r[h].y){var w=f[b]?f[b]:0;t=m+w;l+=w;f[b]=w+(l-t)}else w=g[b]?g[b]:0,t=l-w,l=m-w,g[b]=w+(l-t);b=r[h].color?r[h].color:q._colorSet[h%q._colorSet.length];M(c,t,z,l,v,b,0,null,s,!1,!1,!1,q.fillOpacity);b=q.dataPointIds[h];this._eventManager.objectMap[b]={id:b,objectType:"dataPoint",dataSeriesIndex:e,dataPointIndex:h,x1:t,y1:z,x2:l,y2:v};b=E(b);u&&M(this._eventManager.ghostCtx,
t,z,l,v,b,0,null,!1,!1,!1,!1);(r[h].indexLabel||q.indexLabel||r[h].indexLabelFormatter||q.indexLabelFormatter)&&this._indexLabels.push({chartType:"stackedBar",dataPoint:r[h],dataSeries:q,point:{x:0<=r[h].y?l:t,y:d},direction:0>r[h].y===a.axisY.reversed?1:-1,bounds:{x1:Math.min(t,l),y1:z,x2:Math.max(t,l),y2:v},color:b})}}}c.restore();u&&this._eventManager.ghostCtx.restore();a=Math.max(m,a.axisX.bounds.x2);return{source:c,dest:this.plotArea.ctx,animationCallback:F.xScaleAnimation,easingFunction:F.easing.easeOutQuart,
animationBase:a}}};A.prototype.renderStackedBar100=function(a){var c=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var b=null,d=this.plotArea,f=[],g=[],k=[],h=0,l,m=a.axisY.convertValueToPixel(a.axisY.logarithmic?a.axisY.viewportMinimum:0),h=this.dataPointMinWidth?this.dataPointMinWidth:this.dataPointWidth?this.dataPointWidth:1,p=this.dataPointMaxWidth?this.dataPointMaxWidth:this.dataPointWidth?this.dataPointWidth:0.15*this.height<<0,n=a.axisX.dataInfo.minDiff;isFinite(n)||
(n=0.3*Math.abs(a.axisX.range));n=this.dataPointWidth?this.dataPointWidth:0.9*(d.height*(a.axisX.logarithmic?Math.log(n)/Math.log(a.axisX.range):Math.abs(n)/Math.abs(a.axisX.range))/a.plotType.plotUnits.length)<<0;this.dataPointMaxWidth&&h>p&&(h=Math.min(this.dataPointWidth?this.dataPointWidth:Infinity,p));!this.dataPointMaxWidth&&(this.dataPointMinWidth&&p<h)&&(p=Math.max(this.dataPointWidth?this.dataPointWidth:-Infinity,h));n<h&&(n=h);n>p&&(n=p);c.save();u&&this._eventManager.ghostCtx.save();c.beginPath();
c.rect(d.x1,d.y1,d.width,d.height);c.clip();u&&(this._eventManager.ghostCtx.beginPath(),this._eventManager.ghostCtx.rect(d.x1,d.y1,d.width,d.height),this._eventManager.ghostCtx.clip());for(p=0;p<a.dataSeriesIndexes.length;p++){var e=a.dataSeriesIndexes[p],q=this.data[e],r=q.dataPoints;if(0<r.length){var s=5<n&&q.bevelEnabled?!0:!1;c.strokeStyle="#4572A7 ";for(h=0;h<r.length;h++)if(b=r[h].x.getTime?r[h].x.getTime():r[h].x,!(b<a.axisX.dataInfo.viewPortMin||b>a.axisX.dataInfo.viewPortMax)&&"number"===
typeof r[h].y){var d=a.axisX.convertValueToPixel(b),z;z=0!==a.dataPointYSums[b]?100*(r[h].y/a.dataPointYSums[b]):0;var v=d-a.plotType.plotUnits.length*n/2+a.index*n<<0,t=v+n<<0;if(a.axisY.logarithmic){k[b]=z+(k[b]?k[b]:0);if(0>=k[b])continue;z=f[b]?f[b]:m;f[b]=l=a.axisY.convertValueToPixel(k[b])}else if(l=a.axisY.convertValueToPixel(z),0<=r[h].y){var w=f[b]?f[b]:0;z=m+w;l+=w;f[b]=w+(l-z)}else w=g[b]?g[b]:0,z=l-w,l=m-w,g[b]=w+(l-z);b=r[h].color?r[h].color:q._colorSet[h%q._colorSet.length];M(c,z,v,
l,t,b,0,null,s,!1,!1,!1,q.fillOpacity);b=q.dataPointIds[h];this._eventManager.objectMap[b]={id:b,objectType:"dataPoint",dataSeriesIndex:e,dataPointIndex:h,x1:z,y1:v,x2:l,y2:t};b=E(b);u&&M(this._eventManager.ghostCtx,z,v,l,t,b,0,null,!1,!1,!1,!1);(r[h].indexLabel||q.indexLabel||r[h].indexLabelFormatter||q.indexLabelFormatter)&&this._indexLabels.push({chartType:"stackedBar100",dataPoint:r[h],dataSeries:q,point:{x:0<=r[h].y?l:z,y:d},direction:0>r[h].y===a.axisY.reversed?1:-1,bounds:{x1:Math.min(z,l),
y1:v,x2:Math.max(z,l),y2:t},color:b})}}}c.restore();u&&this._eventManager.ghostCtx.restore();a=Math.max(m,a.axisX.bounds.x2);return{source:c,dest:this.plotArea.ctx,animationCallback:F.xScaleAnimation,easingFunction:F.easing.easeOutQuart,animationBase:a}}};A.prototype.renderArea=function(a){function c(){t&&(0<m.lineThickness&&b.stroke(),a.axisY.logarithmic||0>=a.axisY.viewportMinimum&&0<=a.axisY.viewportMaximum?v=z:0>a.axisY.viewportMaximum?v=g.y1:0<a.axisY.viewportMinimum&&(v=f.y2),b.lineTo(q,v),
b.lineTo(t.x,v),b.closePath(),b.globalAlpha=m.fillOpacity,b.fill(),b.globalAlpha=1,u&&(d.lineTo(q,v),d.lineTo(t.x,v),d.closePath(),d.fill()),b.beginPath(),b.moveTo(q,r),d.beginPath(),d.moveTo(q,r),t={x:q,y:r})}var b=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var d=this._eventManager.ghostCtx,f=a.axisX.lineCoordinates,g=a.axisY.lineCoordinates,k=[],h=this.plotArea;b.save();u&&d.save();b.beginPath();b.rect(h.x1,h.y1,h.width,h.height);b.clip();u&&(d.beginPath(),d.rect(h.x1,
h.y1,h.width,h.height),d.clip());for(h=0;h<a.dataSeriesIndexes.length;h++){var l=a.dataSeriesIndexes[h],m=this.data[l],p=m.dataPoints,k=m.id;this._eventManager.objectMap[k]={objectType:"dataSeries",dataSeriesIndex:l};k=E(k);d.fillStyle=k;var k=[],n=!0,e=0,q,r,s,z=a.axisY.convertValueToPixel(a.axisY.logarithmic?a.axisY.viewportMinimum:0),v,t=null;if(0<p.length){var w=m._colorSet[e%m._colorSet.length],x=m.lineColor=m.options.lineColor||w,y=x;b.fillStyle=w;b.strokeStyle=x;b.lineWidth=m.lineThickness;
var B="solid";if(b.setLineDash){var A=G(m.nullDataLineDashType,m.lineThickness),B=m.lineDashType,C=G(B,m.lineThickness);b.setLineDash(C)}for(var N=!0;e<p.length;e++)if(s=p[e].x.getTime?p[e].x.getTime():p[e].x,!(s<a.axisX.dataInfo.viewPortMin||s>a.axisX.dataInfo.viewPortMax&&(!m.connectNullData||!N)))if("number"!==typeof p[e].y)m.connectNullData||(N||n)||c(),N=!0;else{q=a.axisX.convertValueToPixel(s);r=a.axisY.convertValueToPixel(p[e].y);n||N?(!n&&m.connectNullData?(b.setLineDash&&(m.options.nullDataLineDashType||
B===m.lineDashType&&m.lineDashType!==m.nullDataLineDashType)&&(b.stroke(),B=m.nullDataLineDashType,b.setLineDash(A)),b.lineTo(q,r),u&&d.lineTo(q,r)):(b.beginPath(),b.moveTo(q,r),u&&(d.beginPath(),d.moveTo(q,r)),t={x:q,y:r}),N=n=!1):(b.lineTo(q,r),u&&d.lineTo(q,r),0==e%250&&c());e<p.length-1&&(y!==(p[e].lineColor||x)||B!==(p[e].lineDashType||m.lineDashType))&&(c(),y=p[e].lineColor||x,b.strokeStyle=y,b.setLineDash&&(p[e].lineDashType?(B=p[e].lineDashType,b.setLineDash(G(B,m.lineThickness))):(B=m.lineDashType,
b.setLineDash(C))));var H=m.dataPointIds[e];this._eventManager.objectMap[H]={id:H,objectType:"dataPoint",dataSeriesIndex:l,dataPointIndex:e,x1:q,y1:r};0!==p[e].markerSize&&(0<p[e].markerSize||0<m.markerSize)&&(s=m.getMarkerProperties(e,q,r,b),k.push(s),H=E(H),u&&k.push({x:q,y:r,ctx:d,type:s.type,size:s.size,color:H,borderColor:H,borderThickness:s.borderThickness}));(p[e].indexLabel||m.indexLabel||p[e].indexLabelFormatter||m.indexLabelFormatter)&&this._indexLabels.push({chartType:"area",dataPoint:p[e],
dataSeries:m,point:{x:q,y:r},direction:0>p[e].y===a.axisY.reversed?1:-1,color:w})}c();P.drawMarkers(k)}}b.restore();u&&this._eventManager.ghostCtx.restore();return{source:b,dest:this.plotArea.ctx,animationCallback:F.xClipAnimation,easingFunction:F.easing.linear,animationBase:0}}};A.prototype.renderSplineArea=function(a){function c(){var c=ua(v,2);if(0<c.length){if(0<m.lineThickness){b.beginPath();b.moveTo(c[0].x,c[0].y);c[0].newStrokeStyle&&(b.strokeStyle=c[0].newStrokeStyle);c[0].newLineDashArray&&
b.setLineDash(c[0].newLineDashArray);for(var e=0;e<c.length-3;e+=3)if(b.bezierCurveTo(c[e+1].x,c[e+1].y,c[e+2].x,c[e+2].y,c[e+3].x,c[e+3].y),u&&d.bezierCurveTo(c[e+1].x,c[e+1].y,c[e+2].x,c[e+2].y,c[e+3].x,c[e+3].y),c[e+3].newStrokeStyle||c[e+3].newLineDashArray)b.stroke(),b.beginPath(),b.moveTo(c[e+3].x,c[e+3].y),c[e+3].newStrokeStyle&&(b.strokeStyle=c[e+3].newStrokeStyle),c[e+3].newLineDashArray&&b.setLineDash(c[e+3].newLineDashArray);b.stroke()}b.beginPath();b.moveTo(c[0].x,c[0].y);u&&(d.beginPath(),
d.moveTo(c[0].x,c[0].y));for(e=0;e<c.length-3;e+=3)b.bezierCurveTo(c[e+1].x,c[e+1].y,c[e+2].x,c[e+2].y,c[e+3].x,c[e+3].y),u&&d.bezierCurveTo(c[e+1].x,c[e+1].y,c[e+2].x,c[e+2].y,c[e+3].x,c[e+3].y);a.axisY.logarithmic||0>=a.axisY.viewportMinimum&&0<=a.axisY.viewportMaximum?s=r:0>a.axisY.viewportMaximum?s=g.y1:0<a.axisY.viewportMinimum&&(s=f.y2);z={x:c[0].x,y:c[0].y};b.lineTo(c[c.length-1].x,s);b.lineTo(z.x,s);b.closePath();b.globalAlpha=m.fillOpacity;b.fill();b.globalAlpha=1;u&&(d.lineTo(c[c.length-
1].x,s),d.lineTo(z.x,s),d.closePath(),d.fill())}}var b=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var d=this._eventManager.ghostCtx,f=a.axisX.lineCoordinates,g=a.axisY.lineCoordinates,k=[],h=this.plotArea;b.save();u&&d.save();b.beginPath();b.rect(h.x1,h.y1,h.width,h.height);b.clip();u&&(d.beginPath(),d.rect(h.x1,h.y1,h.width,h.height),d.clip());for(h=0;h<a.dataSeriesIndexes.length;h++){var l=a.dataSeriesIndexes[h],m=this.data[l],p=m.dataPoints,k=m.id;this._eventManager.objectMap[k]=
{objectType:"dataSeries",dataSeriesIndex:l};k=E(k);d.fillStyle=k;var k=[],n=0,e,q,r=a.axisY.convertValueToPixel(a.axisY.logarithmic?a.axisY.viewportMinimum:0),s,z=null,v=[];if(0<p.length){var t=m._colorSet[n%m._colorSet.length],w=m.lineColor=m.options.lineColor||t,x=w;b.fillStyle=t;b.strokeStyle=w;b.lineWidth=m.lineThickness;var y="solid";if(b.setLineDash){var B=G(m.nullDataLineDashType,m.lineThickness),y=m.lineDashType,A=G(y,m.lineThickness);b.setLineDash(A)}for(q=!1;n<p.length;n++)if(e=p[n].x.getTime?
p[n].x.getTime():p[n].x,!(e<a.axisX.dataInfo.viewPortMin||e>a.axisX.dataInfo.viewPortMax&&(!m.connectNullData||!q)))if("number"!==typeof p[n].y)0<n&&!q&&(m.connectNullData?b.setLineDash&&(0<v.length&&(m.options.nullDataLineDashType||!p[n-1].lineDashType))&&(v[v.length-1].newLineDashArray=B,y=m.nullDataLineDashType):(c(),v=[])),q=!0;else{e=a.axisX.convertValueToPixel(e);q=a.axisY.convertValueToPixel(p[n].y);var C=m.dataPointIds[n];this._eventManager.objectMap[C]={id:C,objectType:"dataPoint",dataSeriesIndex:l,
dataPointIndex:n,x1:e,y1:q};v[v.length]={x:e,y:q};n<p.length-1&&(x!==(p[n].lineColor||w)||y!==(p[n].lineDashType||m.lineDashType))&&(x=p[n].lineColor||w,v[v.length-1].newStrokeStyle=x,b.setLineDash&&(p[n].lineDashType?(y=p[n].lineDashType,v[v.length-1].newLineDashArray=G(y,m.lineThickness)):(y=m.lineDashType,v[v.length-1].newLineDashArray=A)));if(0!==p[n].markerSize&&(0<p[n].markerSize||0<m.markerSize)){var N=m.getMarkerProperties(n,e,q,b);k.push(N);C=E(C);u&&k.push({x:e,y:q,ctx:d,type:N.type,size:N.size,
color:C,borderColor:C,borderThickness:N.borderThickness})}(p[n].indexLabel||m.indexLabel||p[n].indexLabelFormatter||m.indexLabelFormatter)&&this._indexLabels.push({chartType:"splineArea",dataPoint:p[n],dataSeries:m,point:{x:e,y:q},direction:0>p[n].y===a.axisY.reversed?1:-1,color:t});q=!1}c();P.drawMarkers(k)}}b.restore();u&&this._eventManager.ghostCtx.restore();return{source:b,dest:this.plotArea.ctx,animationCallback:F.xClipAnimation,easingFunction:F.easing.linear,animationBase:0}}};A.prototype.renderStepArea=
function(a){function c(){t&&(0<m.lineThickness&&b.stroke(),a.axisY.logarithmic||0>=a.axisY.viewportMinimum&&0<=a.axisY.viewportMaximum?v=z:0>a.axisY.viewportMaximum?v=g.y1:0<a.axisY.viewportMinimum&&(v=f.y2),b.lineTo(q,v),b.lineTo(t.x,v),b.closePath(),b.globalAlpha=m.fillOpacity,b.fill(),b.globalAlpha=1,u&&(d.lineTo(q,v),d.lineTo(t.x,v),d.closePath(),d.fill()),b.beginPath(),b.moveTo(q,r),d.beginPath(),d.moveTo(q,r),t={x:q,y:r})}var b=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var d=
this._eventManager.ghostCtx,f=a.axisX.lineCoordinates,g=a.axisY.lineCoordinates,k=[],h=this.plotArea;b.save();u&&d.save();b.beginPath();b.rect(h.x1,h.y1,h.width,h.height);b.clip();u&&(d.beginPath(),d.rect(h.x1,h.y1,h.width,h.height),d.clip());for(h=0;h<a.dataSeriesIndexes.length;h++){var l=a.dataSeriesIndexes[h],m=this.data[l],p=m.dataPoints,k=m.id;this._eventManager.objectMap[k]={objectType:"dataSeries",dataSeriesIndex:l};k=E(k);d.fillStyle=k;var k=[],n=!0,e=0,q,r,s,z=a.axisY.convertValueToPixel(a.axisY.logarithmic?
a.axisY.viewportMinimum:0),v,t=null,w=!1;if(0<p.length){var x=m._colorSet[e%m._colorSet.length],y=m.lineColor=m.options.lineColor||x,B=y;b.fillStyle=x;b.strokeStyle=y;b.lineWidth=m.lineThickness;var A="solid";if(b.setLineDash){var C=G(m.nullDataLineDashType,m.lineThickness),A=m.lineDashType,N=G(A,m.lineThickness);b.setLineDash(N)}for(;e<p.length;e++)if(s=p[e].x.getTime?p[e].x.getTime():p[e].x,!(s<a.axisX.dataInfo.viewPortMin||s>a.axisX.dataInfo.viewPortMax&&(!m.connectNullData||!w))){var H=r;"number"!==
typeof p[e].y?(m.connectNullData||(w||n)||c(),w=!0):(q=a.axisX.convertValueToPixel(s),r=a.axisY.convertValueToPixel(p[e].y),n||w?(!n&&m.connectNullData?(b.setLineDash&&(m.options.nullDataLineDashType||A===m.lineDashType&&m.lineDashType!==m.nullDataLineDashType)&&(b.stroke(),A=m.nullDataLineDashType,b.setLineDash(C)),b.lineTo(q,H),b.lineTo(q,r),u&&(d.lineTo(q,H),d.lineTo(q,r))):(b.beginPath(),b.moveTo(q,r),u&&(d.beginPath(),d.moveTo(q,r)),t={x:q,y:r}),w=n=!1):(b.lineTo(q,H),u&&d.lineTo(q,H),b.lineTo(q,
r),u&&d.lineTo(q,r),0==e%250&&c()),e<p.length-1&&(B!==(p[e].lineColor||y)||A!==(p[e].lineDashType||m.lineDashType))&&(c(),B=p[e].lineColor||y,b.strokeStyle=B,b.setLineDash&&(p[e].lineDashType?(A=p[e].lineDashType,b.setLineDash(G(A,m.lineThickness))):(A=m.lineDashType,b.setLineDash(N)))),H=m.dataPointIds[e],this._eventManager.objectMap[H]={id:H,objectType:"dataPoint",dataSeriesIndex:l,dataPointIndex:e,x1:q,y1:r},0!==p[e].markerSize&&(0<p[e].markerSize||0<m.markerSize)&&(s=m.getMarkerProperties(e,q,
r,b),k.push(s),H=E(H),u&&k.push({x:q,y:r,ctx:d,type:s.type,size:s.size,color:H,borderColor:H,borderThickness:s.borderThickness})),(p[e].indexLabel||m.indexLabel||p[e].indexLabelFormatter||m.indexLabelFormatter)&&this._indexLabels.push({chartType:"stepArea",dataPoint:p[e],dataSeries:m,point:{x:q,y:r},direction:0>p[e].y===a.axisY.reversed?1:-1,color:x}))}c();P.drawMarkers(k)}}b.restore();u&&this._eventManager.ghostCtx.restore();return{source:b,dest:this.plotArea.ctx,animationCallback:F.xClipAnimation,
easingFunction:F.easing.linear,animationBase:0}}};A.prototype.renderStackedArea=function(a){function c(){if(!(1>h.length)){for(0<t.lineThickness&&b.stroke();0<h.length;){var a=h.pop();b.lineTo(a.x,a.y);u&&s.lineTo(a.x,a.y)}b.closePath();b.globalAlpha=t.fillOpacity;b.fill();b.globalAlpha=1;b.beginPath();u&&(s.closePath(),s.fill(),s.beginPath());h=[]}}var b=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var d=null,f=[],g=this.plotArea,k=[],h=[],l=[],m=[],p=0,n,e,q,r=a.axisY.convertValueToPixel(a.axisY.logarithmic?
a.axisY.viewportMinimum:0),s=this._eventManager.ghostCtx;u&&s.beginPath();b.save();u&&s.save();b.beginPath();b.rect(g.x1,g.y1,g.width,g.height);b.clip();u&&(s.beginPath(),s.rect(g.x1,g.y1,g.width,g.height),s.clip());for(var z=[],g=0;g<a.dataSeriesIndexes.length;g++){var v=a.dataSeriesIndexes[g],t=this.data[v],w=t.dataPoints;t.dataPointIndexes=[];for(p=0;p<w.length;p++)v=w[p].x.getTime?w[p].x.getTime():w[p].x,t.dataPointIndexes[v]=p,z[v]||(l.push(v),z[v]=!0);l.sort(ya)}for(g=0;g<a.dataSeriesIndexes.length;g++){v=
a.dataSeriesIndexes[g];t=this.data[v];w=t.dataPoints;z=!0;h=[];p=t.id;this._eventManager.objectMap[p]={objectType:"dataSeries",dataSeriesIndex:v};p=E(p);s.fillStyle=p;if(0<l.length){var d=t._colorSet[0],x=t.lineColor=t.options.lineColor||d,y=x;b.fillStyle=d;b.strokeStyle=x;b.lineWidth=t.lineThickness;var B="solid";if(b.setLineDash){var A=G(t.nullDataLineDashType,t.lineThickness),B=t.lineDashType,C=G(B,t.lineThickness);b.setLineDash(C)}for(var N=!0,p=0;p<l.length;p++){q=l[p];var H=null,H=0<=t.dataPointIndexes[q]?
w[t.dataPointIndexes[q]]:{x:q,y:null};if(!(q<a.axisX.dataInfo.viewPortMin||q>a.axisX.dataInfo.viewPortMax&&(!t.connectNullData||!N)))if("number"!==typeof H.y)t.connectNullData||(N||z)||c(),N=!0;else{n=a.axisX.convertValueToPixel(q);var ca=k[q]?k[q]:0;if(a.axisY.logarithmic){m[q]=H.y+(m[q]?m[q]:0);if(0>=m[q])continue;e=a.axisY.convertValueToPixel(m[q])}else e=a.axisY.convertValueToPixel(H.y),e-=ca;h.push({x:n,y:r-ca});k[q]=r-e;z||N?(!z&&t.connectNullData?(b.setLineDash&&(t.options.nullDataLineDashType||
B===t.lineDashType&&t.lineDashType!==t.nullDataLineDashType)&&(b.stroke(),B=t.nullDataLineDashType,b.setLineDash(A)),b.lineTo(n,e),u&&s.lineTo(n,e)):(b.beginPath(),b.moveTo(n,e),u&&(s.beginPath(),s.moveTo(n,e))),N=z=!1):(b.lineTo(n,e),u&&s.lineTo(n,e),0==p%250&&(c(),b.moveTo(n,e),u&&s.moveTo(n,e),h.push({x:n,y:r-ca})));p<w.length-1&&(y!==(w[p].lineColor||x)||B!==(w[p].lineDashType||t.lineDashType))&&(c(),b.beginPath(),b.moveTo(n,e),h.push({x:n,y:r-ca}),y=w[p].lineColor||x,b.strokeStyle=y,b.setLineDash&&
(w[p].lineDashType?(B=w[p].lineDashType,b.setLineDash(G(B,t.lineThickness))):(B=t.lineDashType,b.setLineDash(C))));if(0<=t.dataPointIndexes[q]){var da=t.dataPointIds[t.dataPointIndexes[q]];this._eventManager.objectMap[da]={id:da,objectType:"dataPoint",dataSeriesIndex:v,dataPointIndex:t.dataPointIndexes[q],x1:n,y1:e}}0<=t.dataPointIndexes[q]&&0!==H.markerSize&&(0<H.markerSize||0<t.markerSize)&&(q=t.getMarkerProperties(t.dataPointIndexes[q],n,e,b),f.push(q),markerColor=E(da),u&&f.push({x:n,y:e,ctx:s,
type:q.type,size:q.size,color:markerColor,borderColor:markerColor,borderThickness:q.borderThickness}));(H.indexLabel||t.indexLabel||H.indexLabelFormatter||t.indexLabelFormatter)&&this._indexLabels.push({chartType:"stackedArea",dataPoint:H,dataSeries:t,point:{x:n,y:e},direction:0>w[p].y===a.axisY.reversed?1:-1,color:d})}}c();b.moveTo(n,e);u&&s.moveTo(n,e)}delete t.dataPointIndexes}P.drawMarkers(f);b.restore();u&&s.restore();return{source:b,dest:this.plotArea.ctx,animationCallback:F.xClipAnimation,
easingFunction:F.easing.linear,animationBase:0}}};A.prototype.renderStackedArea100=function(a){function c(){for(0<t.lineThickness&&b.stroke();0<h.length;){var a=h.pop();b.lineTo(a.x,a.y);u&&s.lineTo(a.x,a.y)}b.closePath();b.globalAlpha=t.fillOpacity;b.fill();b.globalAlpha=1;b.beginPath();u&&(s.closePath(),s.fill(),s.beginPath());h=[]}var b=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var d=null,f=this.plotArea,g=[],k=[],h=[],l=[],m=[],p=0,n,e,q,r=a.axisY.convertValueToPixel(a.axisY.logarithmic?
a.axisY.viewportMinimum:0),s=this._eventManager.ghostCtx;b.save();u&&s.save();b.beginPath();b.rect(f.x1,f.y1,f.width,f.height);b.clip();u&&(s.beginPath(),s.rect(f.x1,f.y1,f.width,f.height),s.clip());for(var z=[],f=0;f<a.dataSeriesIndexes.length;f++){var v=a.dataSeriesIndexes[f],t=this.data[v],w=t.dataPoints;t.dataPointIndexes=[];for(p=0;p<w.length;p++)v=w[p].x.getTime?w[p].x.getTime():w[p].x,t.dataPointIndexes[v]=p,z[v]||(l.push(v),z[v]=!0);l.sort(ya)}for(f=0;f<a.dataSeriesIndexes.length;f++){v=a.dataSeriesIndexes[f];
t=this.data[v];w=t.dataPoints;z=!0;d=t.id;this._eventManager.objectMap[d]={objectType:"dataSeries",dataSeriesIndex:v};d=E(d);s.fillStyle=d;h=[];if(0<l.length){var d=t._colorSet[p%t._colorSet.length],x=t.lineColor=t.options.lineColor||d,y=x;b.fillStyle=d;b.strokeStyle=x;b.lineWidth=t.lineThickness;var B="solid";if(b.setLineDash){var A=G(t.nullDataLineDashType,t.lineThickness),B=t.lineDashType,C=G(B,t.lineThickness);b.setLineDash(C)}for(var N=!0,p=0;p<l.length;p++){q=l[p];var H=null,H=0<=t.dataPointIndexes[q]?
w[t.dataPointIndexes[q]]:{x:q,y:null};if(!(q<a.axisX.dataInfo.viewPortMin||q>a.axisX.dataInfo.viewPortMax&&(!t.connectNullData||!N)))if("number"!==typeof H.y)t.connectNullData||(N||z)||c(),N=!0;else{var ca;ca=0!==a.dataPointYSums[q]?100*(H.y/a.dataPointYSums[q]):0;n=a.axisX.convertValueToPixel(q);var da=k[q]?k[q]:0;if(a.axisY.logarithmic){m[q]=ca+(m[q]?m[q]:0);if(0>=m[q])continue;e=a.axisY.convertValueToPixel(m[q])}else e=a.axisY.convertValueToPixel(ca),e-=da;h.push({x:n,y:r-da});k[q]=r-e;z||N?(!z&&
t.connectNullData?(b.setLineDash&&(t.options.nullDataLineDashType||B===t.lineDashType&&t.lineDashType!==t.nullDataLineDashType)&&(b.stroke(),B=t.nullDataLineDashType,b.setLineDash(A)),b.lineTo(n,e),u&&s.lineTo(n,e)):(b.beginPath(),b.moveTo(n,e),u&&(s.beginPath(),s.moveTo(n,e))),N=z=!1):(b.lineTo(n,e),u&&s.lineTo(n,e),0==p%250&&(c(),b.moveTo(n,e),u&&s.moveTo(n,e),h.push({x:n,y:r-da})));p<w.length-1&&(y!==(w[p].lineColor||x)||B!==(w[p].lineDashType||t.lineDashType))&&(c(),b.beginPath(),b.moveTo(n,e),
h.push({x:n,y:r-da}),y=w[p].lineColor||x,b.strokeStyle=y,b.setLineDash&&(w[p].lineDashType?(B=w[p].lineDashType,b.setLineDash(G(B,t.lineThickness))):(B=t.lineDashType,b.setLineDash(C))));if(0<=t.dataPointIndexes[q]){var Fa=t.dataPointIds[t.dataPointIndexes[q]];this._eventManager.objectMap[Fa]={id:Fa,objectType:"dataPoint",dataSeriesIndex:v,dataPointIndex:t.dataPointIndexes[q],x1:n,y1:e}}0<=t.dataPointIndexes[q]&&0!==H.markerSize&&(0<H.markerSize||0<t.markerSize)&&(q=t.getMarkerProperties(p,n,e,b),
g.push(q),markerColor=E(Fa),u&&g.push({x:n,y:e,ctx:s,type:q.type,size:q.size,color:markerColor,borderColor:markerColor,borderThickness:q.borderThickness}));(H.indexLabel||t.indexLabel||H.indexLabelFormatter||t.indexLabelFormatter)&&this._indexLabels.push({chartType:"stackedArea100",dataPoint:H,dataSeries:t,point:{x:n,y:e},direction:0>w[p].y===a.axisY.reversed?1:-1,color:d})}}c();b.moveTo(n,e);u&&s.moveTo(n,e)}delete t.dataPointIndexes}P.drawMarkers(g);b.restore();u&&s.restore();return{source:b,dest:this.plotArea.ctx,
animationCallback:F.xClipAnimation,easingFunction:F.easing.linear,animationBase:0}}};A.prototype.renderBubble=function(a){var c=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var b=this.plotArea,d=0,f,g;c.save();u&&this._eventManager.ghostCtx.save();c.beginPath();c.rect(b.x1,b.y1,b.width,b.height);c.clip();u&&(this._eventManager.ghostCtx.beginPath(),this._eventManager.ghostCtx.rect(b.x1,b.y1,b.width,b.height),this._eventManager.ghostCtx.clip());for(var k=-Infinity,h=Infinity,
l=0;l<a.dataSeriesIndexes.length;l++)for(var m=a.dataSeriesIndexes[l],p=this.data[m],n=p.dataPoints,e=0,d=0;d<n.length;d++)f=n[d].getTime?f=n[d].x.getTime():f=n[d].x,f<a.axisX.dataInfo.viewPortMin||f>a.axisX.dataInfo.viewPortMax||"undefined"===typeof n[d].z||(e=n[d].z,e>k&&(k=e),e<h&&(h=e));for(var q=25*Math.PI,b=Math.max(Math.pow(0.25*Math.min(b.height,b.width)/2,2)*Math.PI,q),l=0;l<a.dataSeriesIndexes.length;l++)if(m=a.dataSeriesIndexes[l],p=this.data[m],n=p.dataPoints,0<n.length)for(c.strokeStyle=
"#4572A7 ",d=0;d<n.length;d++)if(f=n[d].getTime?f=n[d].x.getTime():f=n[d].x,!(f<a.axisX.dataInfo.viewPortMin||f>a.axisX.dataInfo.viewPortMax)&&"number"===typeof n[d].y){f=a.axisX.convertValueToPixel(f);g=a.axisY.convertValueToPixel(n[d].y);var e=n[d].z,r=2*Math.max(Math.sqrt((k===h?b/2:q+(b-q)/(k-h)*(e-h))/Math.PI)<<0,1),e=p.getMarkerProperties(d,c);e.size=r;c.globalAlpha=p.fillOpacity;P.drawMarker(f,g,c,e.type,e.size,e.color,e.borderColor,e.borderThickness);c.globalAlpha=1;var s=p.dataPointIds[d];
this._eventManager.objectMap[s]={id:s,objectType:"dataPoint",dataSeriesIndex:m,dataPointIndex:d,x1:f,y1:g,size:r};r=E(s);u&&P.drawMarker(f,g,this._eventManager.ghostCtx,e.type,e.size,r,r,e.borderThickness);(n[d].indexLabel||p.indexLabel||n[d].indexLabelFormatter||p.indexLabelFormatter)&&this._indexLabels.push({chartType:"bubble",dataPoint:n[d],dataSeries:p,point:{x:f,y:g},direction:1,bounds:{x1:f-e.size/2,y1:g-e.size/2,x2:f+e.size/2,y2:g+e.size/2},color:null})}c.restore();u&&this._eventManager.ghostCtx.restore();
return{source:c,dest:this.plotArea.ctx,animationCallback:F.fadeInAnimation,easingFunction:F.easing.easeInQuad,animationBase:0}}};A.prototype.renderScatter=function(a){var c=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var b=this.plotArea,d=0,f,g;c.save();u&&this._eventManager.ghostCtx.save();c.beginPath();c.rect(b.x1,b.y1,b.width,b.height);c.clip();u&&(this._eventManager.ghostCtx.beginPath(),this._eventManager.ghostCtx.rect(b.x1,b.y1,b.width,b.height),this._eventManager.ghostCtx.clip());
for(var k=0;k<a.dataSeriesIndexes.length;k++){var h=a.dataSeriesIndexes[k],l=this.data[h],m=l.dataPoints;if(0<m.length){c.strokeStyle="#4572A7 ";Math.pow(0.3*Math.min(b.height,b.width)/2,2);for(var p=0,n=0,d=0;d<m.length;d++)if(f=m[d].getTime?f=m[d].x.getTime():f=m[d].x,!(f<a.axisX.dataInfo.viewPortMin||f>a.axisX.dataInfo.viewPortMax)&&"number"===typeof m[d].y){f=a.axisX.convertValueToPixel(f);g=a.axisY.convertValueToPixel(m[d].y);var e=l.getMarkerProperties(d,f,g,c);c.globalAlpha=l.fillOpacity;P.drawMarker(e.x,
e.y,e.ctx,e.type,e.size,e.color,e.borderColor,e.borderThickness);c.globalAlpha=1;Math.sqrt((p-f)*(p-f)+(n-g)*(n-g))<Math.min(e.size,5)&&m.length>Math.min(this.plotArea.width,this.plotArea.height)||(p=l.dataPointIds[d],this._eventManager.objectMap[p]={id:p,objectType:"dataPoint",dataSeriesIndex:h,dataPointIndex:d,x1:f,y1:g},p=E(p),u&&P.drawMarker(e.x,e.y,this._eventManager.ghostCtx,e.type,e.size,p,p,e.borderThickness),(m[d].indexLabel||l.indexLabel||m[d].indexLabelFormatter||l.indexLabelFormatter)&&
this._indexLabels.push({chartType:"scatter",dataPoint:m[d],dataSeries:l,point:{x:f,y:g},direction:1,bounds:{x1:f-e.size/2,y1:g-e.size/2,x2:f+e.size/2,y2:g+e.size/2},color:null}),p=f,n=g)}}}c.restore();u&&this._eventManager.ghostCtx.restore();return{source:c,dest:this.plotArea.ctx,animationCallback:F.fadeInAnimation,easingFunction:F.easing.easeInQuad,animationBase:0}}};A.prototype.renderCandlestick=function(a){var c=a.targetCanvasCtx||this.plotArea.ctx,b=this._eventManager.ghostCtx;if(!(0>=a.dataSeriesIndexes.length)){var d=
null,d=this.plotArea,f=0,g,k,h,l,m,p,f=this.dataPointMinWidth?this.dataPointMinWidth:this.dataPointWidth?this.dataPointWidth:1;g=this.dataPointMaxWidth?this.dataPointMaxWidth:this.dataPointWidth?this.dataPointWidth:0.015*this.width;var n=a.axisX.dataInfo.minDiff;isFinite(n)||(n=0.3*Math.abs(a.axisX.range));n=this.dataPointWidth?this.dataPointWidth:0.7*d.width*(a.axisX.logarithmic?Math.log(n)/Math.log(a.axisX.range):Math.abs(n)/Math.abs(a.axisX.range))<<0;this.dataPointMaxWidth&&f>g&&(f=Math.min(this.dataPointWidth?
this.dataPointWidth:Infinity,g));!this.dataPointMaxWidth&&(this.dataPointMinWidth&&g<f)&&(g=Math.max(this.dataPointWidth?this.dataPointWidth:-Infinity,f));n<f&&(n=f);n>g&&(n=g);c.save();u&&b.save();c.beginPath();c.rect(d.x1,d.y1,d.width,d.height);c.clip();u&&(b.beginPath(),b.rect(d.x1,d.y1,d.width,d.height),b.clip());for(var e=0;e<a.dataSeriesIndexes.length;e++){var q=a.dataSeriesIndexes[e],r=this.data[q],s=r.dataPoints;if(0<s.length)for(var z=5<n&&r.bevelEnabled?!0:!1,f=0;f<s.length;f++)if(s[f].getTime?
p=s[f].x.getTime():p=s[f].x,!(p<a.axisX.dataInfo.viewPortMin||p>a.axisX.dataInfo.viewPortMax)&&null!==s[f].y&&s[f].y.length&&"number"===typeof s[f].y[0]&&"number"===typeof s[f].y[1]&&"number"===typeof s[f].y[2]&&"number"===typeof s[f].y[3]){g=a.axisX.convertValueToPixel(p);k=a.axisY.convertValueToPixel(s[f].y[0]);h=a.axisY.convertValueToPixel(s[f].y[1]);l=a.axisY.convertValueToPixel(s[f].y[2]);m=a.axisY.convertValueToPixel(s[f].y[3]);var v=g-n/2<<0,t=v+n<<0,d=s[f].color?s[f].color:r._colorSet[0],
w=Math.round(Math.max(1,0.15*n)),x=0===w%2?0:0.5,y=r.dataPointIds[f];this._eventManager.objectMap[y]={id:y,objectType:"dataPoint",dataSeriesIndex:q,dataPointIndex:f,x1:v,y1:k,x2:t,y2:h,x3:g,y3:l,x4:g,y4:m,borderThickness:w,color:d};c.strokeStyle=d;c.beginPath();c.lineWidth=w;b.lineWidth=Math.max(w,4);"candlestick"===r.type?(c.moveTo(g-x,h),c.lineTo(g-x,Math.min(k,m)),c.stroke(),c.moveTo(g-x,Math.max(k,m)),c.lineTo(g-x,l),c.stroke(),M(c,v,Math.min(k,m),t,Math.max(k,m),s[f].y[0]<=s[f].y[3]?r.risingColor:
d,w,d,z,z,!1,!1,r.fillOpacity),u&&(d=E(y),b.strokeStyle=d,b.moveTo(g-x,h),b.lineTo(g-x,Math.min(k,m)),b.stroke(),b.moveTo(g-x,Math.max(k,m)),b.lineTo(g-x,l),b.stroke(),M(b,v,Math.min(k,m),t,Math.max(k,m),d,0,null,!1,!1,!1,!1))):"ohlc"===r.type&&(c.moveTo(g-x,h),c.lineTo(g-x,l),c.stroke(),c.beginPath(),c.moveTo(g,k),c.lineTo(v,k),c.stroke(),c.beginPath(),c.moveTo(g,m),c.lineTo(t,m),c.stroke(),u&&(d=E(y),b.strokeStyle=d,b.moveTo(g-x,h),b.lineTo(g-x,l),b.stroke(),b.beginPath(),b.moveTo(g,k),b.lineTo(v,
k),b.stroke(),b.beginPath(),b.moveTo(g,m),b.lineTo(t,m),b.stroke()));(s[f].indexLabel||r.indexLabel||s[f].indexLabelFormatter||r.indexLabelFormatter)&&this._indexLabels.push({chartType:r.type,dataPoint:s[f],dataSeries:r,point:{x:v+(t-v)/2,y:a.axisY.reversed?l:h},direction:1,bounds:{x1:v,y1:Math.min(h,l),x2:t,y2:Math.max(h,l)},color:d})}}c.restore();u&&b.restore();return{source:c,dest:this.plotArea.ctx,animationCallback:F.fadeInAnimation,easingFunction:F.easing.easeInQuad,animationBase:0}}};A.prototype.renderRangeColumn=
function(a){var c=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var b=null,d=this.plotArea,f=0,g,k,f=this.dataPointMinWidth?this.dataPointMinWidth:this.dataPointWidth?this.dataPointWidth:1;g=this.dataPointMaxWidth?this.dataPointMaxWidth:this.dataPointWidth?this.dataPointWidth:0.03*this.width;var h=a.axisX.dataInfo.minDiff;isFinite(h)||(h=0.3*Math.abs(a.axisX.range));h=this.dataPointWidth?this.dataPointWidth:0.9*(d.width*(a.axisX.logarithmic?Math.log(h)/Math.log(a.axisX.range):
Math.abs(h)/Math.abs(a.axisX.range))/a.plotType.totalDataSeries)<<0;this.dataPointMaxWidth&&f>g&&(f=Math.min(this.dataPointWidth?this.dataPointWidth:Infinity,g));!this.dataPointMaxWidth&&(this.dataPointMinWidth&&g<f)&&(g=Math.max(this.dataPointWidth?this.dataPointWidth:-Infinity,f));h<f&&(h=f);h>g&&(h=g);c.save();u&&this._eventManager.ghostCtx.save();c.beginPath();c.rect(d.x1,d.y1,d.width,d.height);c.clip();u&&(this._eventManager.ghostCtx.beginPath(),this._eventManager.ghostCtx.rect(d.x1,d.y1,d.width,
d.height),this._eventManager.ghostCtx.clip());for(var l=0;l<a.dataSeriesIndexes.length;l++){var m=a.dataSeriesIndexes[l],p=this.data[m],n=p.dataPoints;if(0<n.length)for(var e=5<h&&p.bevelEnabled?!0:!1,f=0;f<n.length;f++)if(n[f].getTime?k=n[f].x.getTime():k=n[f].x,!(k<a.axisX.dataInfo.viewPortMin||k>a.axisX.dataInfo.viewPortMax)&&null!==n[f].y&&n[f].y.length&&"number"===typeof n[f].y[0]&&"number"===typeof n[f].y[1]){b=a.axisX.convertValueToPixel(k);d=a.axisY.convertValueToPixel(n[f].y[0]);g=a.axisY.convertValueToPixel(n[f].y[1]);
var q=a.axisX.reversed?b+a.plotType.totalDataSeries*h/2-(a.previousDataSeriesCount+l)*h<<0:b-a.plotType.totalDataSeries*h/2+(a.previousDataSeriesCount+l)*h<<0,r=a.axisX.reversed?q-h<<0:q+h<<0,b=n[f].color?n[f].color:p._colorSet[f%p._colorSet.length];if(d>g){var s=d,d=g;g=s}s=p.dataPointIds[f];this._eventManager.objectMap[s]={id:s,objectType:"dataPoint",dataSeriesIndex:m,dataPointIndex:f,x1:q,y1:d,x2:r,y2:g};M(c,q,d,r,g,b,0,b,e,e,!1,!1,p.fillOpacity);b=E(s);u&&M(this._eventManager.ghostCtx,q,d,r,g,
b,0,null,!1,!1,!1,!1);if(n[f].indexLabel||p.indexLabel||n[f].indexLabelFormatter||p.indexLabelFormatter)this._indexLabels.push({chartType:"rangeColumn",dataPoint:n[f],dataSeries:p,indexKeyword:0,point:{x:q+(r-q)/2,y:n[f].y[1]>=n[f].y[0]?g:d},direction:n[f].y[1]>=n[f].y[0]?-1:1,bounds:{x1:q,y1:Math.min(d,g),x2:r,y2:Math.max(d,g)},color:b}),this._indexLabels.push({chartType:"rangeColumn",dataPoint:n[f],dataSeries:p,indexKeyword:1,point:{x:q+(r-q)/2,y:n[f].y[1]>=n[f].y[0]?d:g},direction:n[f].y[1]>=n[f].y[0]?
1:-1,bounds:{x1:q,y1:Math.min(d,g),x2:r,y2:Math.max(d,g)},color:b})}}c.restore();u&&this._eventManager.ghostCtx.restore();return{source:c,dest:this.plotArea.ctx,animationCallback:F.fadeInAnimation,easingFunction:F.easing.easeInQuad,animationBase:0}}};A.prototype.renderRangeBar=function(a){var c=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var b=null,d=this.plotArea,f=0,g,k,h,f=this.dataPointMinWidth?this.dataPointMinWidth:this.dataPointWidth?this.dataPointWidth:1;g=this.dataPointMaxWidth?
this.dataPointMaxWidth:this.dataPointWidth?this.dataPointWidth:Math.min(0.15*this.height,0.9*(this.plotArea.height/a.plotType.totalDataSeries))<<0;var l=a.axisX.dataInfo.minDiff;isFinite(l)||(l=0.3*Math.abs(a.axisX.range));l=this.dataPointWidth?this.dataPointWidth:0.9*(d.height*(a.axisX.logarithmic?Math.log(l)/Math.log(a.axisX.range):Math.abs(l)/Math.abs(a.axisX.range))/a.plotType.totalDataSeries)<<0;this.dataPointMaxWidth&&f>g&&(f=Math.min(this.dataPointWidth?this.dataPointWidth:Infinity,g));!this.dataPointMaxWidth&&
(this.dataPointMinWidth&&g<f)&&(g=Math.max(this.dataPointWidth?this.dataPointWidth:-Infinity,f));l<f&&(l=f);l>g&&(l=g);c.save();u&&this._eventManager.ghostCtx.save();c.beginPath();c.rect(d.x1,d.y1,d.width,d.height);c.clip();u&&(this._eventManager.ghostCtx.beginPath(),this._eventManager.ghostCtx.rect(d.x1,d.y1,d.width,d.height),this._eventManager.ghostCtx.clip());for(var m=0;m<a.dataSeriesIndexes.length;m++){var p=a.dataSeriesIndexes[m],n=this.data[p],e=n.dataPoints;if(0<e.length){var q=5<l&&n.bevelEnabled?
!0:!1;c.strokeStyle="#4572A7 ";for(f=0;f<e.length;f++)if(e[f].getTime?h=e[f].x.getTime():h=e[f].x,!(h<a.axisX.dataInfo.viewPortMin||h>a.axisX.dataInfo.viewPortMax)&&null!==e[f].y&&e[f].y.length&&"number"===typeof e[f].y[0]&&"number"===typeof e[f].y[1]){d=a.axisY.convertValueToPixel(e[f].y[0]);g=a.axisY.convertValueToPixel(e[f].y[1]);k=a.axisX.convertValueToPixel(h);k=a.axisX.reversed?k+a.plotType.totalDataSeries*l/2-(a.previousDataSeriesCount+m)*l<<0:k-a.plotType.totalDataSeries*l/2+(a.previousDataSeriesCount+
m)*l<<0;var r=a.axisX.reversed?k-l<<0:k+l<<0;d>g&&(b=d,d=g,g=b);b=e[f].color?e[f].color:n._colorSet[f%n._colorSet.length];M(c,d,k,g,r,b,0,null,q,!1,!1,!1,n.fillOpacity);b=n.dataPointIds[f];this._eventManager.objectMap[b]={id:b,objectType:"dataPoint",dataSeriesIndex:p,dataPointIndex:f,x1:d,y1:k,x2:g,y2:r};b=E(b);u&&M(this._eventManager.ghostCtx,d,k,g,r,b,0,null,!1,!1,!1,!1);if(e[f].indexLabel||n.indexLabel||e[f].indexLabelFormatter||n.indexLabelFormatter)this._indexLabels.push({chartType:"rangeBar",
dataPoint:e[f],dataSeries:n,indexKeyword:0,point:{x:e[f].y[1]>=e[f].y[0]?d:g,y:k+(r-k)/2},direction:e[f].y[1]>=e[f].y[0]?-1:1,bounds:{x1:Math.min(d,g),y1:k,x2:Math.max(d,g),y2:r},color:b}),this._indexLabels.push({chartType:"rangeBar",dataPoint:e[f],dataSeries:n,indexKeyword:1,point:{x:e[f].y[1]>=e[f].y[0]?g:d,y:k+(r-k)/2},direction:e[f].y[1]>=e[f].y[0]?1:-1,bounds:{x1:Math.min(d,g),y1:k,x2:Math.max(d,g),y2:r},color:b})}}}c.restore();u&&this._eventManager.ghostCtx.restore();return{source:c,dest:this.plotArea.ctx,
animationCallback:F.fadeInAnimation,easingFunction:F.easing.easeInQuad,animationBase:0}}};A.prototype.renderRangeArea=function(a){function c(){if(z){var a=null;0<l.lineThickness&&b.stroke();for(var c=k.length-1;0<=c;c--)a=k[c],b.lineTo(a.x,a.y),d.lineTo(a.x,a.y);b.closePath();b.globalAlpha=l.fillOpacity;b.fill();b.globalAlpha=1;d.fill();if(0<l.lineThickness){b.beginPath();b.moveTo(a.x,a.y);for(c=0;c<k.length;c++)a=k[c],b.lineTo(a.x,a.y);b.stroke()}b.beginPath();b.moveTo(e,q);d.beginPath();d.moveTo(e,
q);z={x:e,y:q};k=[];k.push({x:e,y:r})}}var b=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var d=this._eventManager.ghostCtx,f=[],g=this.plotArea;b.save();u&&d.save();b.beginPath();b.rect(g.x1,g.y1,g.width,g.height);b.clip();u&&(d.beginPath(),d.rect(g.x1,g.y1,g.width,g.height),d.clip());for(g=0;g<a.dataSeriesIndexes.length;g++){var k=[],h=a.dataSeriesIndexes[g],l=this.data[h],m=l.dataPoints,f=l.id;this._eventManager.objectMap[f]={objectType:"dataSeries",dataSeriesIndex:h};
f=E(f);d.fillStyle=f;var f=[],p=!0,n=0,e,q,r,s,z=null;if(0<m.length){var v=l._colorSet[n%l._colorSet.length],t=l.lineColor=l.options.lineColor||v,w=t;b.fillStyle=v;b.strokeStyle=t;b.lineWidth=l.lineThickness;var x="solid";if(b.setLineDash){var y=G(l.nullDataLineDashType,l.lineThickness),x=l.lineDashType,B=G(x,l.lineThickness);b.setLineDash(B)}for(var A=!0;n<m.length;n++)if(s=m[n].x.getTime?m[n].x.getTime():m[n].x,!(s<a.axisX.dataInfo.viewPortMin||s>a.axisX.dataInfo.viewPortMax&&(!l.connectNullData||
!A)))if(null!==m[n].y&&m[n].y.length&&"number"===typeof m[n].y[0]&&"number"===typeof m[n].y[1]){e=a.axisX.convertValueToPixel(s);q=a.axisY.convertValueToPixel(m[n].y[0]);r=a.axisY.convertValueToPixel(m[n].y[1]);p||A?(l.connectNullData&&!p?(b.setLineDash&&(l.options.nullDataLineDashType||x===l.lineDashType&&l.lineDashType!==l.nullDataLineDashType)&&(k[k.length-1].newLineDashArray=B,x=l.nullDataLineDashType,b.setLineDash(y)),b.lineTo(e,q),u&&d.lineTo(e,q),k.push({x:e,y:r})):(b.beginPath(),b.moveTo(e,
q),z={x:e,y:q},k=[],k.push({x:e,y:r}),u&&(d.beginPath(),d.moveTo(e,q))),A=p=!1):(b.lineTo(e,q),k.push({x:e,y:r}),u&&d.lineTo(e,q),0==n%250&&c());s=l.dataPointIds[n];this._eventManager.objectMap[s]={id:s,objectType:"dataPoint",dataSeriesIndex:h,dataPointIndex:n,x1:e,y1:q,y2:r};n<m.length-1&&(w!==(m[n].lineColor||t)||x!==(m[n].lineDashType||l.lineDashType))&&(c(),w=m[n].lineColor||t,k[k.length-1].newStrokeStyle=w,b.strokeStyle=w,b.setLineDash&&(m[n].lineDashType?(x=m[n].lineDashType,k[k.length-1].newLineDashArray=
G(x,l.lineThickness),b.setLineDash(k[k.length-1].newLineDashArray)):(x=l.lineDashType,k[k.length-1].newLineDashArray=B,b.setLineDash(B))));if(0!==m[n].markerSize&&(0<m[n].markerSize||0<l.markerSize)){var C=l.getMarkerProperties(n,e,r,b);f.push(C);var N=E(s);u&&f.push({x:e,y:r,ctx:d,type:C.type,size:C.size,color:N,borderColor:N,borderThickness:C.borderThickness});C=l.getMarkerProperties(n,e,q,b);f.push(C);N=E(s);u&&f.push({x:e,y:q,ctx:d,type:C.type,size:C.size,color:N,borderColor:N,borderThickness:C.borderThickness})}if(m[n].indexLabel||
l.indexLabel||m[n].indexLabelFormatter||l.indexLabelFormatter)this._indexLabels.push({chartType:"rangeArea",dataPoint:m[n],dataSeries:l,indexKeyword:0,point:{x:e,y:q},direction:m[n].y[0]>m[n].y[1]===a.axisY.reversed?-1:1,color:v}),this._indexLabels.push({chartType:"rangeArea",dataPoint:m[n],dataSeries:l,indexKeyword:1,point:{x:e,y:r},direction:m[n].y[0]>m[n].y[1]===a.axisY.reversed?1:-1,color:v})}else A||p||c(),A=!0;c();P.drawMarkers(f)}}b.restore();u&&this._eventManager.ghostCtx.restore();return{source:b,
dest:this.plotArea.ctx,animationCallback:F.xClipAnimation,easingFunction:F.easing.linear,animationBase:0}}};A.prototype.renderRangeSplineArea=function(a){function c(a,c){var e=ua(q,2);if(0<e.length){if(0<h.lineThickness){b.strokeStyle=c;b.setLineDash&&b.setLineDash(a);b.beginPath();b.moveTo(e[0].x,e[0].y);for(var f=0;f<e.length-3;f+=3){if(e[f].newStrokeStyle||e[f].newLineDashArray)b.stroke(),b.beginPath(),b.moveTo(e[f].x,e[f].y),e[f].newStrokeStyle&&(b.strokeStyle=e[f].newStrokeStyle),e[f].newLineDashArray&&
b.setLineDash(e[f].newLineDashArray);b.bezierCurveTo(e[f+1].x,e[f+1].y,e[f+2].x,e[f+2].y,e[f+3].x,e[f+3].y)}b.stroke()}b.beginPath();b.moveTo(e[0].x,e[0].y);u&&(d.beginPath(),d.moveTo(e[0].x,e[0].y));for(f=0;f<e.length-3;f+=3)b.bezierCurveTo(e[f+1].x,e[f+1].y,e[f+2].x,e[f+2].y,e[f+3].x,e[f+3].y),u&&d.bezierCurveTo(e[f+1].x,e[f+1].y,e[f+2].x,e[f+2].y,e[f+3].x,e[f+3].y);e=ua(r,2);b.lineTo(r[r.length-1].x,r[r.length-1].y);for(f=e.length-1;2<f;f-=3)b.bezierCurveTo(e[f-1].x,e[f-1].y,e[f-2].x,e[f-2].y,
e[f-3].x,e[f-3].y),u&&d.bezierCurveTo(e[f-1].x,e[f-1].y,e[f-2].x,e[f-2].y,e[f-3].x,e[f-3].y);b.closePath();b.globalAlpha=h.fillOpacity;b.fill();u&&(d.closePath(),d.fill());b.globalAlpha=1;if(0<h.lineThickness){b.strokeStyle=c;b.setLineDash&&b.setLineDash(a);b.beginPath();b.moveTo(e[0].x,e[0].y);for(var g=f=0;f<e.length-3;f+=3,g++){if(q[g].newStrokeStyle||q[g].newLineDashArray)b.stroke(),b.beginPath(),b.moveTo(e[f].x,e[f].y),q[g].newStrokeStyle&&(b.strokeStyle=q[g].newStrokeStyle),q[g].newLineDashArray&&
b.setLineDash(q[g].newLineDashArray);b.bezierCurveTo(e[f+1].x,e[f+1].y,e[f+2].x,e[f+2].y,e[f+3].x,e[f+3].y)}b.stroke()}b.beginPath()}}var b=a.targetCanvasCtx||this.plotArea.ctx;if(!(0>=a.dataSeriesIndexes.length)){var d=this._eventManager.ghostCtx,f=[],g=this.plotArea;b.save();u&&d.save();b.beginPath();b.rect(g.x1,g.y1,g.width,g.height);b.clip();u&&(d.beginPath(),d.rect(g.x1,g.y1,g.width,g.height),d.clip());for(g=0;g<a.dataSeriesIndexes.length;g++){var k=a.dataSeriesIndexes[g],h=this.data[k],l=h.dataPoints,
f=h.id;this._eventManager.objectMap[f]={objectType:"dataSeries",dataSeriesIndex:k};f=E(f);d.fillStyle=f;var f=[],m=0,p,n,e,q=[],r=[];if(0<l.length){var s=h._colorSet[m%h._colorSet.length],z=h.lineColor=h.options.lineColor||s,v=z;b.fillStyle=s;b.lineWidth=h.lineThickness;var t="solid",w;if(b.setLineDash){var x=G(h.nullDataLineDashType,h.lineThickness),t=h.lineDashType;w=G(t,h.lineThickness)}for(n=!1;m<l.length;m++)if(p=l[m].x.getTime?l[m].x.getTime():l[m].x,!(p<a.axisX.dataInfo.viewPortMin||p>a.axisX.dataInfo.viewPortMax&&
(!h.connectNullData||!n)))if(null!==l[m].y&&l[m].y.length&&"number"===typeof l[m].y[0]&&"number"===typeof l[m].y[1]){p=a.axisX.convertValueToPixel(p);n=a.axisY.convertValueToPixel(l[m].y[0]);e=a.axisY.convertValueToPixel(l[m].y[1]);var y=h.dataPointIds[m];this._eventManager.objectMap[y]={id:y,objectType:"dataPoint",dataSeriesIndex:k,dataPointIndex:m,x1:p,y1:n,y2:e};q[q.length]={x:p,y:n};r[r.length]={x:p,y:e};m<l.length-1&&(v!==(l[m].lineColor||z)||t!==(l[m].lineDashType||h.lineDashType))&&(v=l[m].lineColor||
z,q[q.length-1].newStrokeStyle=v,b.setLineDash&&(l[m].lineDashType?(t=l[m].lineDashType,q[q.length-1].newLineDashArray=G(t,h.lineThickness)):(t=h.lineDashType,q[q.length-1].newLineDashArray=w)));if(0!==l[m].markerSize&&(0<l[m].markerSize||0<h.markerSize)){var B=h.getMarkerProperties(m,p,n,b);f.push(B);var A=E(y);u&&f.push({x:p,y:n,ctx:d,type:B.type,size:B.size,color:A,borderColor:A,borderThickness:B.borderThickness});B=h.getMarkerProperties(m,p,e,b);f.push(B);A=E(y);u&&f.push({x:p,y:e,ctx:d,type:B.type,
size:B.size,color:A,borderColor:A,borderThickness:B.borderThickness})}if(l[m].indexLabel||h.indexLabel||l[m].indexLabelFormatter||h.indexLabelFormatter)this._indexLabels.push({chartType:"splineArea",dataPoint:l[m],dataSeries:h,indexKeyword:0,point:{x:p,y:n},direction:l[m].y[0]<=l[m].y[1]?-1:1,color:s}),this._indexLabels.push({chartType:"splineArea",dataPoint:l[m],dataSeries:h,indexKeyword:1,point:{x:p,y:e},direction:l[m].y[0]<=l[m].y[1]?1:-1,color:s});n=!1}else 0<m&&!n&&(h.connectNullData?b.setLineDash&&
(0<q.length&&(h.options.nullDataLineDashType||!l[m-1].lineDashType))&&(q[q.length-1].newLineDashArray=x,t=h.nullDataLineDashType):(c(w,z),q=[],r=[])),n=!0;c(w,z);P.drawMarkers(f)}}b.restore();u&&this._eventManager.ghostCtx.restore();return{source:b,dest:this.plotArea.ctx,animationCallback:F.xClipAnimation,easingFunction:F.easing.linear,animationBase:0}}};var Ga=function(a,c,b,d,f,g,k,h,l){if(!(0>b)){"undefined"===typeof h&&(h=1);if(!u){var m=Number((k%(2*Math.PI)).toFixed(8));Number((g%(2*Math.PI)).toFixed(8))===
m&&(k-=1E-4)}a.save();a.globalAlpha=h;"pie"===f?(a.beginPath(),a.moveTo(c.x,c.y),a.arc(c.x,c.y,b,g,k,!1),a.fillStyle=d,a.strokeStyle="white",a.lineWidth=2,a.closePath(),a.fill()):"doughnut"===f&&(a.beginPath(),a.arc(c.x,c.y,b,g,k,!1),0<=l&&a.arc(c.x,c.y,l*b,k,g,!0),a.closePath(),a.fillStyle=d,a.strokeStyle="white",a.lineWidth=2,a.fill());a.globalAlpha=1;a.restore()}};A.prototype.renderPie=function(a){function c(){if(m&&p){for(var a=0,b=0,c=0,d=0,f=0;f<p.length;f++){var g=p[f],k=m.dataPointIds[f],
h={id:k,objectType:"dataPoint",dataPointIndex:f,dataSeriesIndex:0};q.push(h);var n={percent:null,total:null},r=null,n=l.getPercentAndTotal(m,g);if(m.indexLabelFormatter||g.indexLabelFormatter)r={chart:l.options,dataSeries:m,dataPoint:g,total:n.total,percent:n.percent};n=g.indexLabelFormatter?g.indexLabelFormatter(r):g.indexLabel?l.replaceKeywordsWithValue(g.indexLabel,g,m,f):m.indexLabelFormatter?m.indexLabelFormatter(r):m.indexLabel?l.replaceKeywordsWithValue(m.indexLabel,g,m,f):g.label?g.label:
"";l._eventManager.objectMap[k]=h;h.center={x:w.x,y:w.y};h.y=g.y;h.radius=B;h.percentInnerRadius=F;h.indexLabelText=n;h.indexLabelPlacement=m.indexLabelPlacement;h.indexLabelLineColor=g.indexLabelLineColor?g.indexLabelLineColor:m.options.indexLabelLineColor?m.options.indexLabelLineColor:g.color?g.color:m._colorSet[f%m._colorSet.length];h.indexLabelLineThickness=x(g.indexLabelLineThickness)?m.indexLabelLineThickness:g.indexLabelLineThickness;h.indexLabelLineDashType=g.indexLabelLineDashType?g.indexLabelLineDashType:
m.indexLabelLineDashType;h.indexLabelFontColor=g.indexLabelFontColor?g.indexLabelFontColor:m.indexLabelFontColor;h.indexLabelFontStyle=g.indexLabelFontStyle?g.indexLabelFontStyle:m.indexLabelFontStyle;h.indexLabelFontWeight=g.indexLabelFontWeight?g.indexLabelFontWeight:m.indexLabelFontWeight;h.indexLabelFontSize=x(g.indexLabelFontSize)?m.indexLabelFontSize:g.indexLabelFontSize;h.indexLabelFontFamily=g.indexLabelFontFamily?g.indexLabelFontFamily:m.indexLabelFontFamily;h.indexLabelBackgroundColor=g.indexLabelBackgroundColor?
g.indexLabelBackgroundColor:m.options.indexLabelBackgroundColor?m.options.indexLabelBackgroundColor:m.indexLabelBackgroundColor;h.indexLabelMaxWidth=g.indexLabelMaxWidth?g.indexLabelMaxWidth:m.indexLabelMaxWidth?m.indexLabelMaxWidth:0.33*e.width;h.indexLabelWrap="undefined"!==typeof g.indexLabelWrap?g.indexLabelWrap:m.indexLabelWrap;h.startAngle=0===f?m.startAngle?m.startAngle/180*Math.PI:0:q[f-1].endAngle;h.startAngle=(h.startAngle+2*Math.PI)%(2*Math.PI);h.endAngle=h.startAngle+2*Math.PI/u*Math.abs(g.y);
g=(h.endAngle+h.startAngle)/2;g=(g+2*Math.PI)%(2*Math.PI);h.midAngle=g;if(h.midAngle>Math.PI/2-v&&h.midAngle<Math.PI/2+v){if(0===a||q[c].midAngle>h.midAngle)c=f;a++}else if(h.midAngle>3*Math.PI/2-v&&h.midAngle<3*Math.PI/2+v){if(0===b||q[d].midAngle>h.midAngle)d=f;b++}h.hemisphere=g>Math.PI/2&&g<=3*Math.PI/2?"left":"right";h.indexLabelTextBlock=new V(l.plotArea.ctx,{fontSize:h.indexLabelFontSize,fontFamily:h.indexLabelFontFamily,fontColor:h.indexLabelFontColor,fontStyle:h.indexLabelFontStyle,fontWeight:h.indexLabelFontWeight,
horizontalAlign:"left",backgroundColor:h.indexLabelBackgroundColor,maxWidth:h.indexLabelMaxWidth,maxHeight:h.indexLabelWrap?5*h.indexLabelFontSize:1.5*h.indexLabelFontSize,text:h.indexLabelText,padding:0,textBaseline:"top"});h.indexLabelTextBlock.measureText()}k=g=0;n=!1;for(f=0;f<p.length;f++)h=q[(c+f)%p.length],1<a&&(h.midAngle>Math.PI/2-v&&h.midAngle<Math.PI/2+v)&&(g<=a/2&&!n?(h.hemisphere="right",g++):(h.hemisphere="left",n=!0));n=!1;for(f=0;f<p.length;f++)h=q[(d+f)%p.length],1<b&&(h.midAngle>
3*Math.PI/2-v&&h.midAngle<3*Math.PI/2+v)&&(k<=b/2&&!n?(h.hemisphere="left",k++):(h.hemisphere="right",n=!0))}}function b(a){var b=l.plotArea.ctx;b.clearRect(e.x1,e.y1,e.width,e.height);b.fillStyle=l.backgroundColor;b.fillRect(e.x1,e.y1,e.width,e.height);for(b=0;b<p.length;b++){var c=q[b].startAngle,d=q[b].endAngle;if(d>c){var f=0.07*B*Math.cos(q[b].midAngle),g=0.07*B*Math.sin(q[b].midAngle),h=!1;if(p[b].exploded){if(1E-9<Math.abs(q[b].center.x-(w.x+f))||1E-9<Math.abs(q[b].center.y-(w.y+g)))q[b].center.x=
w.x+f*a,q[b].center.y=w.y+g*a,h=!0}else if(0<Math.abs(q[b].center.x-w.x)||0<Math.abs(q[b].center.y-w.y))q[b].center.x=w.x+f*(1-a),q[b].center.y=w.y+g*(1-a),h=!0;h&&(f={},f.dataSeries=m,f.dataPoint=m.dataPoints[b],f.index=b,l.toolTip.highlightObjects([f]));Ga(l.plotArea.ctx,q[b].center,q[b].radius,p[b].color?p[b].color:m._colorSet[b%m._colorSet.length],m.type,c,d,m.fillOpacity,q[b].percentInnerRadius)}}a=l.plotArea.ctx;a.save();a.fillStyle="black";a.strokeStyle="grey";a.textBaseline="middle";a.lineJoin=
"round";for(b=b=0;b<p.length;b++)c=q[b],c.indexLabelText&&(c.indexLabelTextBlock.y-=c.indexLabelTextBlock.height/2,d=0,d="left"===c.hemisphere?"inside"!==m.indexLabelPlacement?-(c.indexLabelTextBlock.width+n):-c.indexLabelTextBlock.width/2:"inside"!==m.indexLabelPlacement?n:-c.indexLabelTextBlock.width/2,c.indexLabelTextBlock.x+=d,c.indexLabelTextBlock.render(!0),c.indexLabelTextBlock.x-=d,c.indexLabelTextBlock.y+=c.indexLabelTextBlock.height/2,"inside"!==c.indexLabelPlacement&&0<c.indexLabelLineThickness&&
(d=c.center.x+B*Math.cos(c.midAngle),f=c.center.y+B*Math.sin(c.midAngle),a.strokeStyle=c.indexLabelLineColor,a.lineWidth=c.indexLabelLineThickness,a.setLineDash&&a.setLineDash(G(c.indexLabelLineDashType,c.indexLabelLineThickness)),a.beginPath(),a.moveTo(d,f),a.lineTo(c.indexLabelTextBlock.x,c.indexLabelTextBlock.y),a.lineTo(c.indexLabelTextBlock.x+("left"===c.hemisphere?-n:n),c.indexLabelTextBlock.y),a.stroke()),a.lineJoin="miter");a.save()}function d(a,b){var c=0,c=a.indexLabelTextBlock.y-a.indexLabelTextBlock.height/
2,d=a.indexLabelTextBlock.y+a.indexLabelTextBlock.height/2,e=b.indexLabelTextBlock.y-b.indexLabelTextBlock.height/2,f=b.indexLabelTextBlock.y+b.indexLabelTextBlock.height/2;return c=b.indexLabelTextBlock.y>a.indexLabelTextBlock.y?e-d:c-f}function f(a){for(var b=null,c=1;c<p.length;c++)if(b=(a+c+q.length)%q.length,q[b].hemisphere!==q[a].hemisphere){b=null;break}else if(q[b].indexLabelText&&b!==a&&(0>d(q[b],q[a])||("right"===q[a].hemisphere?q[b].indexLabelTextBlock.y>=q[a].indexLabelTextBlock.y:q[b].indexLabelTextBlock.y<=
q[a].indexLabelTextBlock.y)))break;else b=null;return b}function g(a,b,c){c=(c||0)+1;if(1E3<c)return 0;b=b||0;var e=0,h=w.y-1*s,k=w.y+1*s;if(0<=a&&a<p.length){var l=q[a];if(0>b&&l.indexLabelTextBlock.y<h||0<b&&l.indexLabelTextBlock.y>k)return 0;var m=0,n=0,n=m=m=0;0>b?l.indexLabelTextBlock.y-l.indexLabelTextBlock.height/2>h&&l.indexLabelTextBlock.y-l.indexLabelTextBlock.height/2+b<h&&(b=-(h-(l.indexLabelTextBlock.y-l.indexLabelTextBlock.height/2+b))):l.indexLabelTextBlock.y+l.indexLabelTextBlock.height/
2<h&&l.indexLabelTextBlock.y+l.indexLabelTextBlock.height/2+b>k&&(b=l.indexLabelTextBlock.y+l.indexLabelTextBlock.height/2+b-k);b=l.indexLabelTextBlock.y+b;h=0;h="right"===l.hemisphere?w.x+Math.sqrt(Math.pow(s,2)-Math.pow(b-w.y,2)):w.x-Math.sqrt(Math.pow(s,2)-Math.pow(b-w.y,2));n=w.x+B*Math.cos(l.midAngle);m=w.y+B*Math.sin(l.midAngle);m=Math.sqrt(Math.pow(h-n,2)+Math.pow(b-m,2));n=Math.acos(B/s);m=Math.acos((s*s+B*B-m*m)/(2*B*s));b=m<n?b-l.indexLabelTextBlock.y:0;h=null;for(k=1;k<p.length;k++)if(h=
(a-k+q.length)%q.length,q[h].hemisphere!==q[a].hemisphere){h=null;break}else if(q[h].indexLabelText&&q[h].hemisphere===q[a].hemisphere&&h!==a&&(0>d(q[h],q[a])||("right"===q[a].hemisphere?q[h].indexLabelTextBlock.y<=q[a].indexLabelTextBlock.y:q[h].indexLabelTextBlock.y>=q[a].indexLabelTextBlock.y)))break;else h=null;n=h;m=f(a);k=h=0;0>b?(k="right"===l.hemisphere?n:m,e=b,null!==k&&(n=-b,b=l.indexLabelTextBlock.y-l.indexLabelTextBlock.height/2-(q[k].indexLabelTextBlock.y+q[k].indexLabelTextBlock.height/
2),b-n<r&&(h=-n,k=g(k,h,c+1),+k.toFixed(t)>+h.toFixed(t)&&(e=b>r?-(b-r):-(n-(k-h)))))):0<b&&(k="right"===l.hemisphere?m:n,e=b,null!==k&&(n=b,b=q[k].indexLabelTextBlock.y-q[k].indexLabelTextBlock.height/2-(l.indexLabelTextBlock.y+l.indexLabelTextBlock.height/2),b-n<r&&(h=n,k=g(k,h,c+1),+k.toFixed(t)<+h.toFixed(t)&&(e=b>r?b-r:n-(h-k)))));e&&(c=l.indexLabelTextBlock.y+e,b=0,b="right"===l.hemisphere?w.x+Math.sqrt(Math.pow(s,2)-Math.pow(c-w.y,2)):w.x-Math.sqrt(Math.pow(s,2)-Math.pow(c-w.y,2)),l.midAngle>
Math.PI/2-v&&l.midAngle<Math.PI/2+v?(h=(a-1+q.length)%q.length,h=q[h],a=q[(a+1+q.length)%q.length],"left"===l.hemisphere&&"right"===h.hemisphere&&b>h.indexLabelTextBlock.x?b=h.indexLabelTextBlock.x-15:"right"===l.hemisphere&&("left"===a.hemisphere&&b<a.indexLabelTextBlock.x)&&(b=a.indexLabelTextBlock.x+15)):l.midAngle>3*Math.PI/2-v&&l.midAngle<3*Math.PI/2+v&&(h=(a-1+q.length)%q.length,h=q[h],a=q[(a+1+q.length)%q.length],"right"===l.hemisphere&&"left"===h.hemisphere&&b<h.indexLabelTextBlock.x?b=h.indexLabelTextBlock.x+
15:"left"===l.hemisphere&&("right"===a.hemisphere&&b>a.indexLabelTextBlock.x)&&(b=a.indexLabelTextBlock.x-15)),l.indexLabelTextBlock.y=c,l.indexLabelTextBlock.x=b,l.indexLabelAngle=Math.atan2(l.indexLabelTextBlock.y-w.y,l.indexLabelTextBlock.x-w.x))}return e}function k(){var a=l.plotArea.ctx;a.fillStyle="grey";a.strokeStyle="grey";a.font="16px Arial";a.textBaseline="middle";for(var b=a=0,c=0,h=!0,b=0;10>b&&(1>b||0<c);b++){if(m.radius||!m.radius&&"undefined"!==typeof m.innerRadius&&null!==m.innerRadius&&
B-c<=C)h=!1;h&&(B-=c);c=0;if("inside"!==m.indexLabelPlacement){s=B*z;for(a=0;a<p.length;a++){var k=q[a];k.indexLabelTextBlock.x=w.x+s*Math.cos(k.midAngle);k.indexLabelTextBlock.y=w.y+s*Math.sin(k.midAngle);k.indexLabelAngle=k.midAngle;k.radius=B;k.percentInnerRadius=F}for(var v,u,a=0;a<p.length;a++){var k=q[a],x=f(a);if(null!==x){v=q[a];u=q[x];var y=0,y=d(v,u)-r;if(0>y){for(var A=u=0,E=0;E<p.length;E++)E!==a&&q[E].hemisphere===k.hemisphere&&(q[E].indexLabelTextBlock.y<k.indexLabelTextBlock.y?u++:
A++);u=y/(u+A||1)*A;var A=-1*(y-u),D=E=0;"right"===k.hemisphere?(E=g(a,u),A=-1*(y-E),D=g(x,A),+D.toFixed(t)<+A.toFixed(t)&&+E.toFixed(t)<=+u.toFixed(t)&&g(a,-(A-D))):(E=g(x,u),A=-1*(y-E),D=g(a,A),+D.toFixed(t)<+A.toFixed(t)&&+E.toFixed(t)<=+u.toFixed(t)&&g(x,-(A-D)))}}}}else for(a=0;a<p.length;a++)k=q[a],s="pie"===m.type?0.7*B:0.8*B,x=w.x+s*Math.cos(k.midAngle),u=w.y+s*Math.sin(k.midAngle),k.indexLabelTextBlock.x=x,k.indexLabelTextBlock.y=u;for(a=0;a<p.length;a++)if(k=q[a],x=k.indexLabelTextBlock.measureText(),
0!==x.height&&0!==x.width)x=x=0,"right"===k.hemisphere?(x=e.x2-(k.indexLabelTextBlock.x+k.indexLabelTextBlock.width+n),x*=-1):x=e.x1-(k.indexLabelTextBlock.x-k.indexLabelTextBlock.width-n),0<x&&(!h&&k.indexLabelText&&(u="right"===k.hemisphere?e.x2-k.indexLabelTextBlock.x:k.indexLabelTextBlock.x-e.x1,0.3*k.indexLabelTextBlock.maxWidth>u?k.indexLabelText="":k.indexLabelTextBlock.maxWidth=0.85*u,0.3*k.indexLabelTextBlock.maxWidth<u&&(k.indexLabelTextBlock.x-="right"===k.hemisphere?2:-2)),Math.abs(k.indexLabelTextBlock.y-
k.indexLabelTextBlock.height/2-w.y)<B||Math.abs(k.indexLabelTextBlock.y+k.indexLabelTextBlock.height/2-w.y)<B)&&(x/=Math.abs(Math.cos(k.indexLabelAngle)),9<x&&(x*=0.3),x>c&&(c=x)),x=x=0,0<k.indexLabelAngle&&k.indexLabelAngle<Math.PI?(x=e.y2-(k.indexLabelTextBlock.y+k.indexLabelTextBlock.height/2+5),x*=-1):x=e.y1-(k.indexLabelTextBlock.y-k.indexLabelTextBlock.height/2-5),0<x&&(!h&&k.indexLabelText&&(u=0<k.indexLabelAngle&&k.indexLabelAngle<Math.PI?-1:1,0===g(a,x*u)&&g(a,2*u)),Math.abs(k.indexLabelTextBlock.x-
w.x)<B&&(x/=Math.abs(Math.sin(k.indexLabelAngle)),9<x&&(x*=0.3),x>c&&(c=x)));var G=function(a,b,c){for(var d=[],e=0;d.push(q[b]),b!==c;b=(b+1+p.length)%p.length);d.sort(function(a,b){return a.y-b.y});for(b=0;b<d.length;b++)if(c=d[b],e<0.7*a)e+=c.indexLabelTextBlock.height,c.indexLabelTextBlock.text="",c.indexLabelText="",c.indexLabelTextBlock.measureText();else break};(function(){for(var a=-1,b=-1,c=0,e=!1,g=0;g<p.length;g++)if(e=!1,v=q[g],v.indexLabelText){var k=f(g);if(null!==k){var h=q[k];y=0;
y=d(v,h);var l;if(l=0>y){l=v.indexLabelTextBlock.x;var m=v.indexLabelTextBlock.y-v.indexLabelTextBlock.height/2,r=v.indexLabelTextBlock.y+v.indexLabelTextBlock.height/2,s=h.indexLabelTextBlock.y-h.indexLabelTextBlock.height/2,t=h.indexLabelTextBlock.x+h.indexLabelTextBlock.width,u=h.indexLabelTextBlock.y+h.indexLabelTextBlock.height/2;l=v.indexLabelTextBlock.x+v.indexLabelTextBlock.width<h.indexLabelTextBlock.x-n||l>t+n||m>u+n||r<s-n?!1:!0}l?(0>a&&(a=g),k!==a&&(b=k,c+=-y),0===g%Math.max(p.length/
10,3)&&(e=!0)):e=!0;e&&(0<c&&0<=a&&0<=b)&&(G(c,a,b),b=a=-1,c=0)}}0<c&&G(c,a,b)})()}}function h(){l.plotArea.layoutManager.reset();l.title&&(l.title.dockInsidePlotArea||"center"===l.title.horizontalAlign&&"center"===l.title.verticalAlign)&&l.title.render();if(l.subtitles)for(var a=0;a<l.subtitles.length;a++){var b=l.subtitles[a];(b.dockInsidePlotArea||"center"===b.horizontalAlign&&"center"===b.verticalAlign)&&b.render()}l.legend&&(l.legend.dockInsidePlotArea||"center"===l.legend.horizontalAlign&&"center"===
l.legend.verticalAlign)&&l.legend.render();y.fNg&&y.fNg(l)}var l=this;if(!(0>=a.dataSeriesIndexes.length)){var m=this.data[a.dataSeriesIndexes[0]],p=m.dataPoints,n=10,e=this.plotArea,q=[],r=2,s,z=1.3,v=20/180*Math.PI,t=6,w={x:(e.x2+e.x1)/2,y:(e.y2+e.y1)/2},u=0;a=!1;for(var A=0;A<p.length;A++)u+=Math.abs(p[A].y),!a&&("undefined"!==typeof p[A].indexLabel&&null!==p[A].indexLabel&&0<p[A].indexLabel.toString().length)&&(a=!0),!a&&("undefined"!==typeof p[A].label&&null!==p[A].label&&0<p[A].label.toString().length)&&
(a=!0);if(0!==u){a=a||"undefined"!==typeof m.indexLabel&&null!==m.indexLabel&&0<m.indexLabel.toString().length;var B="inside"!==m.indexLabelPlacement&&a?0.75*Math.min(e.width,e.height)/2:0.92*Math.min(e.width,e.height)/2;m.radius&&(B=Oa(m.radius,B));var C="undefined"!==typeof m.innerRadius&&null!==m.innerRadius?Oa(m.innerRadius,B):0.7*B;m.radius=B;"doughnut"===m.type&&(m.innerRadius=C);var F=Math.min(C/B,(B-1)/B);this.pieDoughnutClickHandler=function(a){l.isAnimating||!x(a.dataSeries.explodeOnClick)&&
!a.dataSeries.explodeOnClick||(a=a.dataPoint,a.exploded=a.exploded?!1:!0,1<this.dataPoints.length&&l._animator.animate(0,500,function(a){b(a);h()}))};c();k();k();k();k();this.disableToolTip=!0;this._animator.animate(0,this.animatedRender?this.animationDuration:0,function(a){var b=l.plotArea.ctx;b.clearRect(e.x1,e.y1,e.width,e.height);b.fillStyle=l.backgroundColor;b.fillRect(e.x1,e.y1,e.width,e.height);a=q[0].startAngle+2*Math.PI*a;for(b=0;b<p.length;b++){var c=0===b?q[b].startAngle:d,d=c+(q[b].endAngle-
q[b].startAngle),f=!1;d>a&&(d=a,f=!0);var g=p[b].color?p[b].color:m._colorSet[b%m._colorSet.length];d>c&&Ga(l.plotArea.ctx,q[b].center,q[b].radius,g,m.type,c,d,m.fillOpacity,q[b].percentInnerRadius);if(f)break}h()},function(){l.disableToolTip=!1;l._animator.animate(0,l.animatedRender?500:0,function(a){b(a);h()})})}}};A.prototype.animationRequestId=null;A.prototype.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||
window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1E3/60)}}();A.prototype.cancelRequestAnimFrame=window.cancelAnimationFrame||window.webkitCancelRequestAnimationFrame||window.mozCancelRequestAnimationFrame||window.oCancelRequestAnimationFrame||window.msCancelRequestAnimationFrame||clearTimeout;A.prototype.set=function(a,c,b){b="undefined"===typeof b?!0:b;"options"===a?(this.options=c,b&&this.render()):A.base.set.call(this,a,c,b)};A.prototype.exportChart=
function(a){a="undefined"===typeof a?{}:a;var c=a.format?a.format:"png",b=a.fileName?a.fileName:this.exportFileName;if(a.toDataURL)return this.canvas.toDataURL("image/"+c);Ba(this.canvas,c,b)};A.prototype.print=function(){var a=this.exportChart({toDataURL:!0}),c=document.createElement("iframe");c.setAttribute("class","canvasjs-chart-print-frame");c.setAttribute("style","position:absolute; width:100%; border: 0px; margin: 0px 0px 0px 0px; padding 0px 0px 0px 0px;");c.style.height=this.height+"px";
this._canvasJSContainer.appendChild(c);var b=this,d=c.contentWindow||c.contentDocument.document||c.contentDocument;d.document.open();d.document.write('<!DOCTYPE HTML>\n<html><body style="margin: 0px 0px 0px 0px; padding: 0px 0px 0px 0px;"><img src="'+a+'"/><body/></html>');d.document.close();setTimeout(function(){d.focus();d.print();setTimeout(function(){b._canvasJSContainer.removeChild(c)},1E3)},500)};ha.prototype.registerSpace=function(a,c){"top"===a?this._topOccupied+=c.height:"bottom"===a?this._bottomOccupied+=
c.height:"left"===a?this._leftOccupied+=c.width:"right"===a&&(this._rightOccupied+=c.width)};ha.prototype.unRegisterSpace=function(a,c){"top"===a?this._topOccupied-=c.height:"bottom"===a?this._bottomOccupied-=c.height:"left"===a?this._leftOccupied-=c.width:"right"===a&&(this._rightOccupied-=c.width)};ha.prototype.getFreeSpace=function(){return{x1:this._x1+this._leftOccupied,y1:this._y1+this._topOccupied,x2:this._x2-this._rightOccupied,y2:this._y2-this._bottomOccupied,width:this._x2-this._x1-this._rightOccupied-
this._leftOccupied,height:this._y2-this._y1-this._bottomOccupied-this._topOccupied}};ha.prototype.reset=function(){this._rightOccupied=this._leftOccupied=this._bottomOccupied=this._topOccupied=this._padding};T(V,L);V.prototype.render=function(a){if(0!==this.fontSize){a&&this.ctx.save();var c=this.ctx.font;this.ctx.textBaseline=this.textBaseline;var b=0;this._isDirty&&this.measureText(this.ctx);this.ctx.translate(this.x,this.y+b);"middle"===this.textBaseline&&(b=-this._lineHeight/2);this.ctx.font=
this._getFontString();this.ctx.rotate(Math.PI/180*this.angle);var d=0,f=this.padding,g=null;this.ctx.roundRect||Ia(this.ctx);(0<this.borderThickness&&this.borderColor||this.backgroundColor)&&this.ctx.roundRect(0,b,this.width,this.height,this.cornerRadius,this.borderThickness,this.backgroundColor,this.borderColor);this.ctx.fillStyle=this.fontColor;for(b=0;b<this._wrappedText.lines.length;b++)g=this._wrappedText.lines[b],"right"===this.horizontalAlign?d=this.width-g.width-this.padding:"left"===this.horizontalAlign?
d=this.padding:"center"===this.horizontalAlign&&(d=(this.width-2*this.padding)/2-g.width/2+this.padding),this.ctx.fillText(g.text,d,f),f+=g.height;this.ctx.font=c;a&&this.ctx.restore()}};V.prototype.setText=function(a){this.text=a;this._isDirty=!0;this._wrappedText=null};V.prototype.measureText=function(){this._lineHeight=Ka(this.fontFamily,this.fontSize,this.fontWeight);if(null===this.maxWidth)throw"Please set maxWidth and height for TextBlock";this._wrapText(this.ctx);this._isDirty=!1;return{width:this.width,
height:this.height}};V.prototype._getLineWithWidth=function(a,c,b){a=String(a);if(!a)return{text:"",width:0};var d=b=0,f=a.length-1,g=Infinity;for(this.ctx.font=this._getFontString();d<=f;){var g=Math.floor((d+f)/2),k=a.substr(0,g+1);b=this.ctx.measureText(k).width;if(b<c)d=g+1;else if(b>c)f=g-1;else break}b>c&&1<k.length&&(k=k.substr(0,k.length-1),b=this.ctx.measureText(k).width);c=!0;if(k.length===a.length||" "===a[k.length])c=!1;c&&(a=k.split(" "),1<a.length&&a.pop(),k=a.join(" "),b=this.ctx.measureText(k).width);
return{text:k,width:b}};V.prototype._wrapText=function(){var a=new String(ka(String(this.text))),c=[],b=this.ctx.font,d=0,f=0;this.ctx.font=this._getFontString();if(0===this.frontSize)f=d=0;else for(;0<a.length;){var g=this.maxHeight-2*this.padding,k=this._getLineWithWidth(a,this.maxWidth-2*this.padding,!1);k.height=this._lineHeight;c.push(k);var h=f,f=Math.max(f,k.width),d=d+k.height,a=ka(a.slice(k.text.length,a.length));g&&d>g&&(k=c.pop(),d-=k.height,f=h)}this._wrappedText={lines:c,width:f,height:d};
this.width=f+2*this.padding;this.height=d+2*this.padding;this.ctx.font=b};V.prototype._getFontString=function(){var a;a=""+(this.fontStyle?this.fontStyle+" ":"");a+=this.fontWeight?this.fontWeight+" ":"";a+=this.fontSize?this.fontSize+"px ":"";var c=this.fontFamily?this.fontFamily+"":"";!u&&c&&(c=c.split(",")[0],"'"!==c[0]&&'"'!==c[0]&&(c="'"+c+"'"));return a+=c};T(ma,L);ma.prototype.render=function(){if(this.text){var a=this.dockInsidePlotArea?this.chart.plotArea:this.chart,c=a.layoutManager.getFreeSpace(),
b=c.x1,d=c.y1,f=0,g=0,k=this.chart._menuButton&&this.chart.exportEnabled&&"top"===this.verticalAlign?22:0,h,l;"top"===this.verticalAlign||"bottom"===this.verticalAlign?(null===this.maxWidth&&(this.maxWidth=c.width-4-k*("center"===this.horizontalAlign?2:1)),g=0.5*c.height-this.margin-2,f=0):"center"===this.verticalAlign&&("left"===this.horizontalAlign||"right"===this.horizontalAlign?(null===this.maxWidth&&(this.maxWidth=c.height-4),g=0.5*c.width-this.margin-2):"center"===this.horizontalAlign&&(null===
this.maxWidth&&(this.maxWidth=c.width-4),g=0.5*c.height-4));this.wrap||(g=Math.min(g,Math.max(1.5*this.fontSize,this.fontSize+2.5*this.padding)));var g=new V(this.ctx,{fontSize:this.fontSize,fontFamily:this.fontFamily,fontColor:this.fontColor,fontStyle:this.fontStyle,fontWeight:this.fontWeight,horizontalAlign:this.horizontalAlign,verticalAlign:this.verticalAlign,borderColor:this.borderColor,borderThickness:this.borderThickness,backgroundColor:this.backgroundColor,maxWidth:this.maxWidth,maxHeight:g,
cornerRadius:this.cornerRadius,text:this.text,padding:this.padding,textBaseline:"top"}),m=g.measureText();"top"===this.verticalAlign||"bottom"===this.verticalAlign?("top"===this.verticalAlign?(d=c.y1+2,l="top"):"bottom"===this.verticalAlign&&(d=c.y2-2-m.height,l="bottom"),"left"===this.horizontalAlign?b=c.x1+2:"center"===this.horizontalAlign?b=c.x1+c.width/2-m.width/2:"right"===this.horizontalAlign&&(b=c.x2-2-m.width-k),h=this.horizontalAlign,this.width=m.width,this.height=m.height):"center"===this.verticalAlign&&
("left"===this.horizontalAlign?(b=c.x1+2,d=c.y2-2-(this.maxWidth/2-m.width/2),f=-90,l="left",this.width=m.height,this.height=m.width):"right"===this.horizontalAlign?(b=c.x2-2,d=c.y1+2+(this.maxWidth/2-m.width/2),f=90,l="right",this.width=m.height,this.height=m.width):"center"===this.horizontalAlign&&(d=a.y1+(a.height/2-m.height/2),b=a.x1+(a.width/2-m.width/2),l="center",this.width=m.width,this.height=m.height),h="center");g.x=b;g.y=d;g.angle=f;g.horizontalAlign=h;g.render(!0);a.layoutManager.registerSpace(l,
{width:this.width+("left"===l||"right"===l?this.margin+2:0),height:this.height+("top"===l||"bottom"===l?this.margin+2:0)});this.bounds={x1:b,y1:d,x2:b+this.width,y2:d+this.height};this.ctx.textBaseline="top"}};T(va,L);va.prototype.render=ma.prototype.render;T(wa,L);wa.prototype.render=function(){var a=this.dockInsidePlotArea?this.chart.plotArea:this.chart,c=a.layoutManager.getFreeSpace(),b=null,d=0,f=0,g=0,k=0,h=this.markerMargin=this.chart.options.legend&&!x(this.chart.options.legend.markerMargin)?
this.chart.options.legend.markerMargin:0.3*this.fontSize;this.height=0;var l=[],m=[];"top"===this.verticalAlign||"bottom"===this.verticalAlign?(this.orientation="horizontal",b=this.verticalAlign,g=this.maxWidth=null!==this.maxWidth?this.maxWidth:c.width,k=this.maxHeight=null!==this.maxHeight?this.maxHeight:0.5*c.height):"center"===this.verticalAlign&&(this.orientation="vertical",b=this.horizontalAlign,g=this.maxWidth=null!==this.maxWidth?this.maxWidth:0.5*c.width,k=this.maxHeight=null!==this.maxHeight?
this.maxHeight:c.height);for(var p=0;p<this.dataSeries.length;p++){var n=this.dataSeries[p];if("pie"!==n.type&&"doughnut"!==n.type&&"funnel"!==n.type){var e=n.legendMarkerType=n.legendMarkerType?n.legendMarkerType:"line"!==n.type&&"stepLine"!==n.type&&"spline"!==n.type&&"scatter"!==n.type&&"bubble"!==n.type||!n.markerType?Z.getDefaultLegendMarker(n.type):n.markerType,q=n.legendText?n.legendText:this.itemTextFormatter?this.itemTextFormatter({chart:this.chart,legend:this.options,dataSeries:n,dataPoint:null}):
n.name,r=n.legendMarkerColor=n.legendMarkerColor?n.legendMarkerColor:n.markerColor?n.markerColor:n._colorSet[0],s=n.markerSize||"line"!==n.type&&"stepLine"!==n.type&&"spline"!==n.type?0.75*this.lineHeight:0,u=n.legendMarkerBorderColor?n.legendMarkerBorderColor:n.markerBorderColor,v=n.legendMarkerBorderThickness?n.legendMarkerBorderThickness:n.markerBorderThickness?Math.max(1,Math.round(0.2*s)):0,q=this.chart.replaceKeywordsWithValue(q,n.dataPoints[0],n,p),e={markerType:e,markerColor:r,text:q,textBlock:null,
chartType:n.type,markerSize:s,lineColor:n._colorSet[0],dataSeriesIndex:n.index,dataPointIndex:null,markerBorderColor:u,markerBorderThickness:v};l.push(e)}else for(var t=0;t<n.dataPoints.length;t++){var w=n.dataPoints[t],e=w.legendMarkerType?w.legendMarkerType:n.legendMarkerType?n.legendMarkerType:Z.getDefaultLegendMarker(n.type),q=w.legendText?w.legendText:n.legendText?n.legendText:this.itemTextFormatter?this.itemTextFormatter({chart:this.chart,legend:this.options,dataSeries:n,dataPoint:w}):w.name?
w.name:"DataPoint: "+(t+1),r=w.legendMarkerColor?w.legendMarkerColor:n.legendMarkerColor?n.legendMarkerColor:w.color?w.color:n.color?n.color:n._colorSet[t%n._colorSet.length],s=0.75*this.lineHeight,u=w.legendMarkerBorderColor?w.legendMarkerBorderColor:n.legendMarkerBorderColor?n.legendMarkerBorderColor:w.markerBorderColor?w.markerBorderColor:n.markerBorderColor,v=w.legendMarkerBorderThickness?w.legendMarkerBorderThickness:n.legendMarkerBorderThickness?n.legendMarkerBorderThickness:w.markerBorderThickness||
n.markerBorderThickness?Math.max(1,Math.round(0.2*s)):0,q=this.chart.replaceKeywordsWithValue(q,w,n,t),e={markerType:e,markerColor:r,text:q,textBlock:null,chartType:n.type,markerSize:s,dataSeriesIndex:p,dataPointIndex:t,markerBorderColor:u,markerBorderThickness:v};(w.showInLegend||n.showInLegend&&!1!==w.showInLegend)&&l.push(e)}}!0===this.reversed&&l.reverse();if(0<l.length){n=null;r=t=q=w=0;q=null!==this.itemWidth?null!==this.itemMaxWidth?Math.min(this.itemWidth,this.itemMaxWidth,g):this.itemMaxWidth=
Math.min(this.itemWidth,g):null!==this.itemMaxWidth?Math.min(this.itemMaxWidth,g):this.itemMaxWidth=g;s=0===s?0.75*this.lineHeight:s;q-=s+h;for(p=0;p<l.length;p++){e=l[p];if("line"===e.chartType||"spline"===e.chartType||"stepLine"===e.chartType)q-=2*0.1*this.lineHeight;if(!(0>=k||"undefined"===typeof k||0>=q||"undefined"===typeof q)){if("horizontal"===this.orientation){e.textBlock=new V(this.ctx,{x:0,y:0,maxWidth:q,maxHeight:this.itemWrap?k:this.lineHeight,angle:0,text:e.text,horizontalAlign:"left",
fontSize:this.fontSize,fontFamily:this.fontFamily,fontWeight:this.fontWeight,fontColor:this.fontColor,fontStyle:this.fontStyle,textBaseline:"middle"});e.textBlock.measureText();null!==this.itemWidth&&(e.textBlock.width=this.itemWidth-(s+h+("line"===e.chartType||"spline"===e.chartType||"stepLine"===e.chartType?2*0.1*this.lineHeight:0)));if(!n||n.width+Math.round(e.textBlock.width+s+h+(0===n.width?0:this.horizontalSpacing)+("line"===e.chartType||"spline"===e.chartType||"stepLine"===e.chartType?2*0.1*
this.lineHeight:0))>g)n={items:[],width:0},m.push(n),this.height+=t,t=0;t=Math.max(t,e.textBlock.height)}else e.textBlock=new V(this.ctx,{x:0,y:0,maxWidth:q,maxHeight:!0===this.itemWrap?k:1.5*this.fontSize,angle:0,text:e.text,horizontalAlign:"left",fontSize:this.fontSize,fontFamily:this.fontFamily,fontWeight:this.fontWeight,fontColor:this.fontColor,fontStyle:this.fontStyle,textBaseline:"middle"}),e.textBlock.measureText(),null!==this.itemWidth&&(e.textBlock.width=this.itemWidth-(s+h+("line"===e.chartType||
"spline"===e.chartType||"stepLine"===e.chartType?2*0.1*this.lineHeight:0))),this.height<k-this.lineHeight?(n={items:[],width:0},m.push(n)):(n=m[w],w=(w+1)%m.length),this.height+=e.textBlock.height;e.textBlock.x=n.width;e.textBlock.y=0;n.width+=Math.round(e.textBlock.width+s+h+(0===n.width?0:this.horizontalSpacing)+("line"===e.chartType||"spline"===e.chartType||"stepLine"===e.chartType?2*0.1*this.lineHeight:0));n.items.push(e);this.width=Math.max(n.width,this.width);r=e.textBlock.width+(s+h+("line"===
e.chartType||"spline"===e.chartType||"stepLine"===e.chartType?2*0.1*this.lineHeight:0))}}this.itemWidth=r;this.height=!1===this.itemWrap?m.length*this.lineHeight:this.height+t;this.height=Math.min(k,this.height);this.width=Math.min(g,this.width)}"top"===this.verticalAlign?(f="left"===this.horizontalAlign?c.x1:"right"===this.horizontalAlign?c.x2-this.width:c.x1+c.width/2-this.width/2,d=c.y1):"center"===this.verticalAlign?(f="left"===this.horizontalAlign?c.x1:"right"===this.horizontalAlign?c.x2-this.width:
c.x1+c.width/2-this.width/2,d=c.y1+c.height/2-this.height/2):"bottom"===this.verticalAlign&&(f="left"===this.horizontalAlign?c.x1:"right"===this.horizontalAlign?c.x2-this.width:c.x1+c.width/2-this.width/2,d=c.y2-this.height);this.items=l;for(p=0;p<this.items.length;p++)e=l[p],e.id=++this.chart._eventManager.lastObjectId,this.chart._eventManager.objectMap[e.id]={id:e.id,objectType:"legendItem",legendItemIndex:p,dataSeriesIndex:e.dataSeriesIndex,dataPointIndex:e.dataPointIndex};(0<this.borderThickness&&
this.borderColor||this.backgroundColor)&&this.ctx.roundRect(f,d,this.width,this.height,this.cornerRadius,this.borderThickness,this.backgroundColor,this.borderColor);for(p=c=0;p<m.length;p++){n=m[p];for(w=t=0;w<n.items.length;w++){e=n.items[w];r=e.textBlock.x+f+(0===w?0.2*s:this.horizontalSpacing);u=d+c;q=r;this.chart.data[e.dataSeriesIndex].visible||(this.ctx.globalAlpha=0.5);this.ctx.save();this.ctx.beginPath();this.ctx.rect(f,d,g,Math.max(k-k%this.lineHeight,0));this.ctx.clip();if("line"===e.chartType||
"stepLine"===e.chartType||"spline"===e.chartType)this.ctx.strokeStyle=e.lineColor,this.ctx.lineWidth=Math.ceil(this.lineHeight/8),this.ctx.beginPath(),this.ctx.moveTo(r-0.1*this.lineHeight,u+this.lineHeight/2),this.ctx.lineTo(r+0.85*this.lineHeight,u+this.lineHeight/2),this.ctx.stroke(),q-=0.1*this.lineHeight;P.drawMarker(r+s/2,u+this.lineHeight/2,this.ctx,e.markerType,e.markerSize,e.markerColor,e.markerBorderColor,e.markerBorderThickness);e.textBlock.x=r+h+s;if("line"===e.chartType||"stepLine"===
e.chartType||"spline"===e.chartType)e.textBlock.x+=0.1*this.lineHeight;e.textBlock.y=Math.round(u+this.lineHeight/2);e.textBlock.render(!0);this.ctx.restore();t=0<w?Math.max(t,e.textBlock.height):e.textBlock.height;this.chart.data[e.dataSeriesIndex].visible||(this.ctx.globalAlpha=1);r=E(e.id);this.ghostCtx.fillStyle=r;this.ghostCtx.beginPath();this.ghostCtx.fillRect(q,e.textBlock.y-this.lineHeight/2,e.textBlock.x+e.textBlock.width-q,e.textBlock.height);e.x1=this.chart._eventManager.objectMap[e.id].x1=
q;e.y1=this.chart._eventManager.objectMap[e.id].y1=e.textBlock.y-this.lineHeight/2;e.x2=this.chart._eventManager.objectMap[e.id].x2=e.textBlock.x+e.textBlock.width;e.y2=this.chart._eventManager.objectMap[e.id].y2=e.textBlock.y+e.textBlock.height-this.lineHeight/2}c+=t}0<l.length&&a.layoutManager.registerSpace(b,{width:this.width+2+2,height:this.height+5+5});this.bounds={x1:f,y1:d,x2:f+this.width,y2:d+this.height}};T(Ca,L);Ca.prototype.render=function(){var a=this.chart.layoutManager.getFreeSpace();
this.ctx.fillStyle="red";this.ctx.fillRect(a.x1,a.y1,a.x2,a.y2)};T(Z,L);Z.prototype.getDefaultAxisPlacement=function(){var a=this.type;if("column"===a||"line"===a||"stepLine"===a||"spline"===a||"area"===a||"stepArea"===a||"splineArea"===a||"stackedColumn"===a||"stackedLine"===a||"bubble"===a||"scatter"===a||"stackedArea"===a||"stackedColumn100"===a||"stackedLine100"===a||"stackedArea100"===a||"candlestick"===a||"ohlc"===a||"rangeColumn"===a||"rangeArea"===a||"rangeSplineArea"===a)return"normal";if("bar"===
a||"stackedBar"===a||"stackedBar100"===a||"rangeBar"===a)return"xySwapped";if("pie"===a||"doughnut"===a||"funnel"===a)return"none";window.console.log("Unknown Chart Type: "+a);return null};Z.getDefaultLegendMarker=function(a){if("column"===a||"stackedColumn"===a||"stackedLine"===a||"bar"===a||"stackedBar"===a||"stackedBar100"===a||"bubble"===a||"scatter"===a||"stackedColumn100"===a||"stackedLine100"===a||"stepArea"===a||"candlestick"===a||"ohlc"===a||"rangeColumn"===a||"rangeBar"===a||"rangeArea"===
a||"rangeSplineArea"===a)return"square";if("line"===a||"stepLine"===a||"spline"===a||"pie"===a||"doughnut"===a||"funnel"===a)return"circle";if("area"===a||"splineArea"===a||"stackedArea"===a||"stackedArea100"===a)return"triangle";window.console.log("Unknown Chart Type: "+a);return null};Z.prototype.getDataPointAtX=function(a,c){if(!this.dataPoints||0===this.dataPoints.length)return null;var b={dataPoint:null,distance:Infinity,index:NaN},d=null,f=0,g=0,k=1,h=Infinity,l=0,m=0,p=0;"none"!==this.chart.plotInfo.axisPlacement&&
(this.axisX.logarithmic?(p=Math.log(this.dataPoints[this.dataPoints.length-1].x/this.dataPoints[0].x),p=1<p?Math.min(Math.max((this.dataPoints.length-1)/p*Math.log(a/this.dataPoints[0].x)>>0,0),this.dataPoints.length):0):(p=this.dataPoints[this.dataPoints.length-1].x-this.dataPoints[0].x,p=0<p?Math.min(Math.max((this.dataPoints.length-1)/p*(a-this.dataPoints[0].x)>>0,0),this.dataPoints.length):0));for(;;){g=0<k?p+f:p-f;if(0<=g&&g<this.dataPoints.length){var d=this.dataPoints[g],n=this.axisX.logarithmic?
d.x>a?d.x/a:a/d.x:Math.abs(d.x-a);n<b.distance&&(b.dataPoint=d,b.distance=n,b.index=g);d=n;d<=h?h=d:0<k?l++:m++;if(1E3<l&&1E3<m)break}else if(0>p-f&&p+f>=this.dataPoints.length)break;-1===k?(f++,k=1):k=-1}return c||b.dataPoint.x!==a?c&&null!==b.dataPoint?b:null:b};Z.prototype.getDataPointAtXY=function(a,c,b){if(!this.dataPoints||0===this.dataPoints.length||a<this.chart.plotArea.x1||a>this.chart.plotArea.x2||c<this.chart.plotArea.y1||c>this.chart.plotArea.y2)return null;b=b||!1;var d=[],f=0,g=0,k=
1,h=!1,l=Infinity,m=0,p=0,n=0;"none"!==this.chart.plotInfo.axisPlacement&&(n=(this.chart.axisX[0]?this.chart.axisX[0]:this.chart.axisX2[0]).getXValueAt({x:a,y:c}),this.axisX.logarithmic?(g=Math.log(this.dataPoints[this.dataPoints.length-1].x/this.dataPoints[0].x),n=1<g?Math.min(Math.max((this.dataPoints.length-1)/g*Math.log(n/this.dataPoints[0].x)>>0,0),this.dataPoints.length):0):(g=this.dataPoints[this.dataPoints.length-1].x-this.dataPoints[0].x,n=0<g?Math.min(Math.max((this.dataPoints.length-1)/
g*(n-this.dataPoints[0].x)>>0,0),this.dataPoints.length):0));for(;;){g=0<k?n+f:n-f;if(0<=g&&g<this.dataPoints.length){var e=this.chart._eventManager.objectMap[this.dataPointIds[g]],q=this.dataPoints[g],r=null;if(e){switch(this.type){case "column":case "stackedColumn":case "stackedColumn100":case "bar":case "stackedBar":case "stackedBar100":case "rangeColumn":case "rangeBar":a>=e.x1&&(a<=e.x2&&c>=e.y1&&c<=e.y2)&&(d.push({dataPoint:q,dataPointIndex:g,dataSeries:this,distance:Math.min(Math.abs(e.x1-
a),Math.abs(e.x2-a),Math.abs(e.y1-c),Math.abs(e.y2-c))}),h=!0);break;case "line":case "stepLine":case "spline":case "area":case "stepArea":case "stackedArea":case "stackedArea100":case "splineArea":case "scatter":var s=K("markerSize",q,this)||4,u=b?20:s,r=Math.sqrt(Math.pow(e.x1-a,2)+Math.pow(e.y1-c,2));r<=u&&d.push({dataPoint:q,dataPointIndex:g,dataSeries:this,distance:r});g=Math.abs(e.x1-a);g<=l?l=g:0<k?m++:p++;r<=s/2&&(h=!0);break;case "rangeArea":case "rangeSplineArea":s=K("markerSize",q,this)||
4;u=b?20:s;r=Math.min(Math.sqrt(Math.pow(e.x1-a,2)+Math.pow(e.y1-c,2)),Math.sqrt(Math.pow(e.x1-a,2)+Math.pow(e.y2-c,2)));r<=u&&d.push({dataPoint:q,dataPointIndex:g,dataSeries:this,distance:r});g=Math.abs(e.x1-a);g<=l?l=g:0<k?m++:p++;r<=s/2&&(h=!0);break;case "bubble":s=e.size;r=Math.sqrt(Math.pow(e.x1-a,2)+Math.pow(e.y1-c,2));r<=s/2&&(d.push({dataPoint:q,dataPointIndex:g,dataSeries:this,distance:r}),h=!0);break;case "pie":case "doughnut":s=e.center;u="doughnut"===this.type?e.percentInnerRadius*e.radius:
0;r=Math.sqrt(Math.pow(s.x-a,2)+Math.pow(s.y-c,2));r<e.radius&&r>u&&(r=Math.atan2(c-s.y,a-s.x),0>r&&(r+=2*Math.PI),r=Number(((180*(r/Math.PI)%360+360)%360).toFixed(12)),s=Number(((180*(e.startAngle/Math.PI)%360+360)%360).toFixed(12)),u=Number(((180*(e.endAngle/Math.PI)%360+360)%360).toFixed(12)),0===u&&1<e.endAngle&&(u=360),s>=u&&0!==q.y&&(u+=360,r<s&&(r+=360)),r>s&&r<u&&(d.push({dataPoint:q,dataPointIndex:g,dataSeries:this,distance:0}),h=!0));break;case "candlestick":if(a>=e.x1-e.borderThickness/
2&&a<=e.x2+e.borderThickness/2&&c>=e.y2-e.borderThickness/2&&c<=e.y3+e.borderThickness/2||Math.abs(e.x2-a+e.x1-a)<e.borderThickness&&c>=e.y1&&c<=e.y4)d.push({dataPoint:q,dataPointIndex:g,dataSeries:this,distance:Math.min(Math.abs(e.x1-a),Math.abs(e.x2-a),Math.abs(e.y2-c),Math.abs(e.y3-c))}),h=!0;break;case "ohlc":if(Math.abs(e.x2-a+e.x1-a)<e.borderThickness&&c>=e.y2&&c<=e.y3||a>=e.x1&&a<=(e.x2+e.x1)/2&&c>=e.y1-e.borderThickness/2&&c<=e.y1+e.borderThickness/2||a>=(e.x1+e.x2)/2&&a<=e.x2&&c>=e.y4-e.borderThickness/
2&&c<=e.y4+e.borderThickness/2)d.push({dataPoint:q,dataPointIndex:g,dataSeries:this,distance:Math.min(Math.abs(e.x1-a),Math.abs(e.x2-a),Math.abs(e.y2-c),Math.abs(e.y3-c))}),h=!0}if(h||1E3<m&&1E3<p)break}}else if(0>n-f&&n+f>=this.dataPoints.length)break;-1===k?(f++,k=1):k=-1}a=null;for(c=0;c<d.length;c++)a?d[c].distance<=a.distance&&(a=d[c]):a=d[c];return a};Z.prototype.getMarkerProperties=function(a,c,b,d){var f=this.dataPoints;return{x:c,y:b,ctx:d,type:f[a].markerType?f[a].markerType:this.markerType,
size:f[a].markerSize?f[a].markerSize:this.markerSize,color:f[a].markerColor?f[a].markerColor:this.markerColor?this.markerColor:f[a].color?f[a].color:this.color?this.color:this._colorSet[a%this._colorSet.length],borderColor:f[a].markerBorderColor?f[a].markerBorderColor:this.markerBorderColor?this.markerBorderColor:null,borderThickness:f[a].markerBorderThickness?f[a].markerBorderThickness:this.markerBorderThickness?this.markerBorderThickness:null}};T(C,L);C.prototype.createExtraLabelsForLog=function(a){a=
(a||0)+1;if(!(5<a)){var c=this.logLabelValues[0]||this.intervalStartPosition;if(Math.log(this.range)/Math.log(c/this.viewportMinimum)<this.noTicks-1){for(var b=C.getNiceNumber((c-this.viewportMinimum)/Math.min(Math.max(2,this.noTicks-this.logLabelValues.length),3),!0),d=Math.ceil(this.viewportMinimum/b)*b;d<c;d+=b)d<this.viewportMinimum||this.logLabelValues.push(d);this.logLabelValues.sort(ya);this.createExtraLabelsForLog(a)}}};C.prototype.createLabels=function(){var a,c,b=0,d=0,f,g=0,k=0,d=0,h=this.interval,
l=0,m,p=0.6*this.chart.height,b=!1;if(this.dataSeries&&0<this.dataSeries.length)for(d=0;d<this.dataSeries.length;d++)"dateTime"===this.dataSeries[d].xValueType&&(b=!0);if("axisX"===this.type&&b&&!this.logarithmic)for(this.intervalStartPosition=this.getLabelStartPoint(new Date(this.viewportMinimum),this.intervalType,this.interval),f=Ha(new Date(this.viewportMaximum),this.interval,this.intervalType),b=this.intervalStartPosition;b<f;Ha(b,h,this.intervalType))a=b.getTime(),a=this.labelFormatter?this.labelFormatter({chart:this.chart,
axis:this.options,value:b,label:this.labels[b]?this.labels[b]:null}):"axisX"===this.type&&this.labels[a]?this.labels[a]:Ea(b,this.valueFormatString,this.chart._cultureInfo),a=new V(this.ctx,{x:0,y:0,maxWidth:g,backgroundColor:this.labelBackgroundColor,borderColor:this.labelBorderColor,borderThickness:this.labelBorderThickness,cornerRadius:this.labelCornerRadius,maxHeight:k,angle:this.labelAngle,text:this.prefix+a+this.suffix,horizontalAlign:"left",fontSize:this.labelFontSize,fontFamily:this.labelFontFamily,
fontWeight:this.labelFontWeight,fontColor:this.labelFontColor,fontStyle:this.labelFontStyle,textBaseline:"middle"}),this._labels.push({position:b.getTime(),textBlock:a,effectiveHeight:null});else{f=this.viewportMaximum;if(this.labels){a=Math.ceil(h);for(var h=Math.ceil(this.intervalStartPosition),n=!1,b=h;b<this.viewportMaximum;b+=a)if(this.labels[b])n=!0;else{n=!1;break}n&&(this.interval=a,this.intervalStartPosition=h)}if(this.logarithmic&&!this.equidistantInterval){this.logLabelValues||(this.logLabelValues=
[],this.createExtraLabelsForLog());for(var e=0;e<this.logLabelValues.length;e++)b=this.logLabelValues[e],b<this.viewportMinimum||(a=this.labelFormatter?this.labelFormatter({chart:this.chart,axis:this.options,value:b,label:this.labels[b]?this.labels[b]:null}):"axisX"===this.type&&this.labels[b]?this.labels[b]:ba(b,this.valueFormatString,this.chart._cultureInfo),a=new V(this.ctx,{x:0,y:0,maxWidth:g,maxHeight:k,angle:this.labelAngle,text:this.prefix+a+this.suffix,backgroundColor:this.labelBackgroundColor,
borderColor:this.labelBorderColor,borderThickness:this.labelBorderThickness,cornerRadius:this.labelCornerRadius,horizontalAlign:"left",fontSize:this.labelFontSize,fontFamily:this.labelFontFamily,fontWeight:this.labelFontWeight,fontColor:this.labelFontColor,fontStyle:this.labelFontStyle,textBaseline:"middle",borderThickness:0}),this._labels.push({position:b,textBlock:a,effectiveHeight:null}))}for(b=this.intervalStartPosition;b<=f;b=parseFloat((this.logarithmic&&this.equidistantInterval?b*Math.pow(this.logarithmBase,
this.interval):b+this.interval).toFixed(14)))a=this.labelFormatter?this.labelFormatter({chart:this.chart,axis:this.options,value:b,label:this.labels[b]?this.labels[b]:null}):"axisX"===this.type&&this.labels[b]?this.labels[b]:ba(b,this.valueFormatString,this.chart._cultureInfo),a=new V(this.ctx,{x:0,y:0,maxWidth:g,maxHeight:k,angle:this.labelAngle,text:this.prefix+a+this.suffix,horizontalAlign:"left",backgroundColor:this.labelBackgroundColor,borderColor:this.labelBorderColor,borderThickness:this.labelBorderThickness,
cornerRadius:this.labelCornerRadius,fontSize:this.labelFontSize,fontFamily:this.labelFontFamily,fontWeight:this.labelFontWeight,fontColor:this.labelFontColor,fontStyle:this.labelFontStyle,textBaseline:"middle"}),this._labels.push({position:b,textBlock:a,effectiveHeight:null})}if("bottom"===this._position||"top"===this._position)l=this.logarithmic&&!this.equidistantInterval&&2<=this._labels.length?this.lineCoordinates.width*Math.log(Math.min(this._labels[this._labels.length-1].position/this._labels[this._labels.length-
2].position,this._labels[1].position/this._labels[0].position))/Math.log(this.range):this.lineCoordinates.width/(this.logarithmic&&this.equidistantInterval?Math.log(this.range)/Math.log(this.logarithmBase):Math.abs(this.range))*I[this.intervalType+"Duration"]*this.interval,g="undefined"===typeof this.options.labelMaxWidth?0.5*this.chart.width>>0:this.options.labelMaxWidth,this.chart.panEnabled||(k="undefined"===typeof this.options.labelWrap||this.labelWrap?0.8*this.chart.height>>0:1.5*this.labelFontSize);
else if("left"===this._position||"right"===this._position)l=this.logarithmic&&!this.equidistantInterval&&2<=this._labels.length?this.lineCoordinates.height*Math.log(Math.min(this._labels[this._labels.length-1].position/this._labels[this._labels.length-2].position,this._labels[1].position/this._labels[0].position))/Math.log(this.range):this.lineCoordinates.height/(this.logarithmic&&this.equidistantInterval?Math.log(this.range)/Math.log(this.logarithmBase):Math.abs(this.range))*I[this.intervalType+
"Duration"]*this.interval,this.chart.panEnabled||(g="undefined"===typeof this.options.labelMaxWidth?0.3*this.chart.width>>0:this.options.labelMaxWidth),k="undefined"===typeof this.options.labelWrap||this.labelWrap?0.3*this.chart.height>>0:1.5*this.labelFontSize;for(d=0;d<this._labels.length;d++){a=this._labels[d].textBlock;a.maxWidth=g;a.maxHeight=k;var q=a.measureText();m=q.height}f=[];n=h=0;if(this.labelAutoFit||this.options.labelAutoFit)if(x(this.labelAngle)||(this.labelAngle=(this.labelAngle%
360+360)%360,90<this.labelAngle&&270>this.labelAngle?this.labelAngle-=180:270<=this.labelAngle&&360>=this.labelAngle&&(this.labelAngle-=360)),"bottom"===this._position||"top"===this._position)if(g=0.9*l>>0,n=0,!this.chart.panEnabled&&1<=this._labels.length){this.sessionVariables.labelFontSize=this.labelFontSize;this.sessionVariables.labelMaxWidth=g;this.sessionVariables.labelMaxHeight=k;this.sessionVariables.labelAngle=this.labelAngle;this.sessionVariables.labelWrap=this.labelWrap;for(b=0;b<this._labels.length;b++){a=
this._labels[b].textBlock;for(var r,s=a.text.split(" "),d=0;d<s.length;d++)e=s[d],this.ctx.font=a.fontStyle+" "+a.fontWeight+" "+a.fontSize+"px "+a.fontFamily,e=this.ctx.measureText(e),e.width>n&&(r=b,n=e.width)}b=0;for(b=this.intervalStartPosition<this.viewportMinimum?1:0;b<this._labels.length;b++)if(a=this._labels[b].textBlock,q=a.measureText(),b<this._labels.length-1&&(e=b+1,c=this._labels[e].textBlock,c=c.measureText()),f.push(a.height),this.sessionVariables.labelMaxHeight=Math.max.apply(Math,
f),Math.cos(Math.PI/180*Math.abs(this.labelAngle)),Math.sin(Math.PI/180*Math.abs(this.labelAngle)),d=g*Math.sin(Math.PI/180*Math.abs(this.labelAngle))+(k-a.fontSize/2)*Math.cos(Math.PI/180*Math.abs(this.labelAngle)),x(this.options.labelAngle)&&isNaN(this.options.labelAngle)&&0!==this.options.labelAngle)if(this.sessionVariables.labelMaxHeight=0===this.labelAngle?k:Math.min((d-g*Math.cos(Math.PI/180*Math.abs(this.labelAngle)))/Math.sin(Math.PI/180*Math.abs(this.labelAngle)),d),s=(p-(m+a.fontSize/2)*
Math.cos(Math.PI/180*Math.abs(-25)))/Math.sin(Math.PI/180*Math.abs(-25)),!x(this.options.labelWrap))this.labelWrap?x(this.options.labelMaxWidth)?(this.sessionVariables.labelMaxWidth=Math.min(Math.max(g,n),s),this.sessionVariables.labelWrap=this.labelWrap,q.width+c.width>>0>2*g&&(this.sessionVariables.labelAngle=-25)):(this.sessionVariables.labelWrap=this.labelWrap,this.sessionVariables.labelMaxWidth=this.options.labelMaxWidth,this.sessionVariables.labelAngle=this.sessionVariables.labelMaxWidth>g?
-25:this.sessionVariables.labelAngle):x(this.options.labelMaxWidth)?(this.sessionVariables.labelWrap=this.labelWrap,this.sessionVariables.labelMaxHeight=k,this.sessionVariables.labelMaxWidth=g,q.width+c.width>>0>2*g&&(this.sessionVariables.labelAngle=-25,this.sessionVariables.labelMaxWidth=s)):(this.sessionVariables.labelAngle=this.sessionVariables.labelMaxWidth>g?-25:this.sessionVariables.labelAngle,this.sessionVariables.labelMaxWidth=this.options.labelMaxWidth,this.sessionVariables.labelMaxHeight=
k,this.sessionVariables.labelWrap=this.labelWrap);else{if(x(this.options.labelWrap))if(!x(this.options.labelMaxWidth))this.options.labelMaxWidth<g?(this.sessionVariables.labelMaxWidth=this.options.labelMaxWidth,this.sessionVariables.labelMaxHeight=d):(this.sessionVariables.labelAngle=-25,this.sessionVariables.labelMaxWidth=this.options.labelMaxWidth,this.sessionVariables.labelMaxHeight=k);else if(!x(c))if(d=q.width+c.width>>0,e=this.labelFontSize,n<g)d-2*g>h&&(h=d-2*g,d>=2*g&&d<2.2*g?(this.sessionVariables.labelMaxWidth=
g,x(this.options.labelFontSize)&&12<e&&(e=Math.floor(12/13*e),a.measureText()),this.sessionVariables.labelFontSize=x(this.options.labelFontSize)?e:this.options.labelFontSize,this.sessionVariables.labelAngle=this.labelAngle):d>=2.2*g&&d<2.8*g?(this.sessionVariables.labelAngle=-25,this.sessionVariables.labelMaxWidth=s,this.sessionVariables.labelFontSize=e):d>=2.8*g&&d<3.2*g?(this.sessionVariables.labelMaxWidth=Math.max(g,n),this.sessionVariables.labelWrap=!0,x(this.options.labelFontSize)&&12<this.labelFontSize&&
(this.labelFontSize=Math.floor(12/13*this.labelFontSize),a.measureText()),this.sessionVariables.labelFontSize=x(this.options.labelFontSize)?e:this.options.labelFontSize,this.sessionVariables.labelAngle=this.labelAngle):d>=3.2*g&&d<3.6*g?(this.sessionVariables.labelAngle=-25,this.sessionVariables.labelWrap=!0,this.sessionVariables.labelMaxWidth=s,this.sessionVariables.labelFontSize=this.labelFontSize):d>3.6*g&&d<5*g?(x(this.options.labelFontSize)&&12<e&&(e=Math.floor(12/13*e),a.measureText()),this.sessionVariables.labelFontSize=
x(this.options.labelFontSize)?e:this.options.labelFontSize,this.sessionVariables.labelWrap=!0,this.sessionVariables.labelAngle=-25,this.sessionVariables.labelMaxWidth=s):d>5*g&&(this.sessionVariables.labelWrap=!0,this.sessionVariables.labelMaxWidth=g,this.sessionVariables.labelFontSize=e,this.sessionVariables.labelMaxHeight=k,this.sessionVariables.labelAngle=this.labelAngle));else if(r===b&&(0===r&&n+this._labels[r+1].textBlock.measureText().width-2*g>h||r===this._labels.length-1&&n+this._labels[r-
1].textBlock.measureText().width-2*g>h||0<r&&r<this._labels.length-1&&n+this._labels[r+1].textBlock.measureText().width-2*g>h&&n+this._labels[r-1].textBlock.measureText().width-2*g>h))h=0===r?n+this._labels[r+1].textBlock.measureText().width-2*g:n+this._labels[r-1].textBlock.measureText().width-2*g,this.sessionVariables.labelFontSize=x(this.options.labelFontSize)?e:this.options.labelFontSize,this.sessionVariables.labelWrap=!0,this.sessionVariables.labelAngle=-25,this.sessionVariables.labelMaxWidth=
s;else if(0===h)for(this.sessionVariables.labelFontSize=x(this.options.labelFontSize)?e:this.options.labelFontSize,this.sessionVariables.labelWrap=!0,d=0;d<this._labels.length;d++)a=this._labels[d].textBlock,a.maxWidth=this.sessionVariables.labelMaxWidth=Math.min(Math.max(g,n),s),q=a.measureText(),d<this._labels.length-1&&(e=d+1,c=this._labels[e].textBlock,c.maxWidth=this.sessionVariables.labelMaxWidth=Math.min(Math.max(g,n),s),c=c.measureText(),q.width+c.width>>0>2*g&&(this.sessionVariables.labelAngle=
-25))}else(this.sessionVariables.labelAngle=this.labelAngle,this.sessionVariables.labelMaxHeight=0===this.labelAngle?k:Math.min((d-g*Math.cos(Math.PI/180*Math.abs(this.labelAngle)))/Math.sin(Math.PI/180*Math.abs(this.labelAngle)),d),s=0!=this.labelAngle?(p-(m+a.fontSize/2)*Math.cos(Math.PI/180*Math.abs(this.labelAngle)))/Math.sin(Math.PI/180*Math.abs(this.labelAngle)):g,this.sessionVariables.labelMaxHeight=k=this.labelWrap?(p-s*Math.sin(Math.PI/180*Math.abs(this.labelAngle)))/Math.cos(Math.PI/180*
Math.abs(this.labelAngle)):1.5*this.labelFontSize,x(this.options.labelWrap))?x(this.options.labelWrap)&&(this.labelWrap&&!x(this.options.labelMaxWidth)?(this.sessionVariables.labelWrap=this.labelWrap,this.sessionVariables.labelMaxWidth=this.options.labelMaxWidth?this.options.labelMaxWidth:s,this.sessionVariables.labelMaxHeight=k):(this.sessionVariables.labelAngle=this.labelAngle,this.sessionVariables.labelMaxWidth=s,this.sessionVariables.labelMaxHeight=d<0.9*l?0.9*l:d,this.sessionVariables.labelWrap=
this.labelWrap)):(this.options.labelWrap?(this.sessionVariables.labelWrap=this.labelWrap,this.sessionVariables.labelMaxWidth=this.options.labelMaxWidth?this.options.labelMaxWidth:s):(x(this.options.labelMaxWidth),this.sessionVariables.labelMaxWidth=this.options.labelMaxWidth?this.options.labelMaxWidth:s,this.sessionVariables.labelWrap=this.labelWrap),this.sessionVariables.labelMaxHeight=k);for(d=0;d<this._labels.length;d++)a=this._labels[d].textBlock,a.maxWidth=this.labelMaxWidth=this.sessionVariables.labelMaxWidth,
a.fontSize=this.sessionVariables.labelFontSize,a.angle=this.labelAngle=this.sessionVariables.labelAngle,a.wrap=this.labelWrap=this.sessionVariables.labelWrap,a.maxHeight=this.sessionVariables.labelMaxHeight,a.measureText()}else for(b=0;b<this._labels.length;b++)a=this._labels[b].textBlock,a.maxWidth=this.labelMaxWidth=x(this.options.labelMaxWidth)?this.sessionVariables.labelMaxWidth:this.options.labelMaxWidth,a.fontSize=this.labelFontSize=x(this.options.labelFontSize)?this.sessionVariables.labelFontSize:
this.options.labelFontSize,a.angle=this.labelAngle=x(this.options.labelAngle)?this.sessionVariables.labelAngle:this.labelAngle,a.wrap=this.labelWrap=x(this.options.labelWrap)?this.sessionVariables.labelWrap:this.options.labelWrap,a.maxHeight=this.sessionVariables.labelMaxHeight,a.measureText();else if("left"===this._position||"right"===this._position)if(g=x(this.options.labelMaxWidth)?0.3*this.chart.width>>0:this.options.labelMaxWidth,k="undefined"===typeof this.options.labelWrap||this.labelWrap?
0.3*this.chart.height>>0:1.5*this.labelFontSize,!this.chart.panEnabled&&1<=this._labels.length){this.sessionVariables.labelFontSize=this.labelFontSize;this.sessionVariables.labelMaxWidth=g;this.sessionVariables.labelMaxHeight=k;this.sessionVariables.labelAngle=x(this.sessionVariables.labelAngle)?0:this.sessionVariables.labelAngle;this.sessionVariables.labelWrap=this.labelWrap;for(b=0;b<this._labels.length;b++)(a=this._labels[b].textBlock,q=a.measureText(),b<this._labels.length-1&&(e=b+1,c=this._labels[e].textBlock,
c=c.measureText()),f.push(a.height),this.sessionVariables.labelMaxHeight=Math.max.apply(Math,f),d=g*Math.sin(Math.PI/180*Math.abs(this.labelAngle))+(k-a.fontSize/2)*Math.cos(Math.PI/180*Math.abs(this.labelAngle)),Math.cos(Math.PI/180*Math.abs(this.labelAngle)),Math.sin(Math.PI/180*Math.abs(this.labelAngle)),x(this.options.labelAngle)&&isNaN(this.options.labelAngle)&&0!==this.options.labelAngle)?x(this.options.labelWrap)?x(this.options.labelWrap)&&(x(this.options.labelMaxWidth)?x(c)||(l=q.height+c.height>>
0,l-2*k>n&&(n=l-2*k,l>=2*k&&l<2.4*k?(x(this.options.labelFontSize)&&12<this.labelFontSize&&(this.labelFontSize=Math.floor(12/13*this.labelFontSize),a.measureText()),this.sessionVariables.labelMaxHeight=k,this.sessionVariables.labelFontSize=x(this.options.labelFontSize)?this.labelFontSize:this.options.labelFontSize):l>=2.4*k&&l<2.8*k?(this.sessionVariables.labelMaxHeight=d,this.sessionVariables.labelFontSize=this.labelFontSize,this.sessionVariables.labelWrap=!0):l>=2.8*k&&l<3.2*k?(this.sessionVariables.labelMaxHeight=
k,this.sessionVariables.labelWrap=!0,x(this.options.labelFontSize)&&12<this.labelFontSize&&(this.labelFontSize=Math.floor(12/13*this.labelFontSize),a.measureText()),this.sessionVariables.labelFontSize=x(this.options.labelFontSize)?this.labelFontSize:this.options.labelFontSize,this.sessionVariables.labelAngle=x(this.sessionVariables.labelAngle)?0:this.sessionVariables.labelAngle):l>=3.2*k&&l<3.6*k?(this.sessionVariables.labelMaxHeight=d,this.sessionVariables.labelWrap=!0,this.sessionVariables.labelFontSize=
this.labelFontSize):l>3.6*k&&l<10*k?(x(this.options.labelFontSize)&&12<this.labelFontSize&&(this.labelFontSize=Math.floor(12/13*this.labelFontSize),a.measureText()),this.sessionVariables.labelFontSize=x(this.options.labelFontSize)?this.labelFontSize:this.options.labelFontSize,this.sessionVariables.labelMaxWidth=g,this.sessionVariables.labelMaxHeight=k,this.sessionVariables.labelAngle=x(this.sessionVariables.labelAngle)?0:this.sessionVariables.labelAngle):l>10*k&&l<50*k&&(x(this.options.labelFontSize)&&
12<this.labelFontSize&&(this.labelFontSize=Math.floor(12/13*this.labelFontSize),a.measureText()),this.sessionVariables.labelFontSize=x(this.options.labelFontSize)?this.labelFontSize:this.options.labelFontSize,this.sessionVariables.labelMaxHeight=k,this.sessionVariables.labelMaxWidth=g,this.sessionVariables.labelAngle=x(this.sessionVariables.labelAngle)?0:this.sessionVariables.labelAngle))):(this.sessionVariables.labelMaxHeight=k,this.sessionVariables.labelMaxWidth=this.options.labelMaxWidth?this.options.labelMaxWidth:
this.sessionVariables.labelMaxWidth)):(this.sessionVariables.labelMaxWidth=this.labelWrap?this.options.labelMaxWidth?this.options.labelMaxWidth:this.sessionVariables.labelMaxWidth:this.labelMaxWidth?this.options.labelMaxWidth?this.options.labelMaxWidth:this.sessionVariables.labelMaxWidth:g,this.sessionVariables.labelMaxHeight=k):(this.sessionVariables.labelAngle=this.labelAngle,this.sessionVariables.labelMaxWidth=0===this.labelAngle?g:Math.min((d-k*Math.sin(Math.PI/180*Math.abs(this.labelAngle)))/
Math.cos(Math.PI/180*Math.abs(this.labelAngle)),k),x(this.options.labelWrap))?x(this.options.labelWrap)&&(this.labelWrap&&!x(this.options.labelMaxWidth)?(this.sessionVariables.labelMaxWidth=this.options.labelMaxWidth?this.options.labelMaxWidth>this.options.labelMaxWidth:this.sessionVariables.labelMaxWidth,this.sessionVariables.labelWrap=this.labelWrap,this.sessionVariables.labelMaxHeight=d):(this.sessionVariables.labelMaxWidth=this.options.labelMaxWidth?this.options.labelMaxWidth:g,this.sessionVariables.labelMaxHeight=
0===this.labelAngle?k:d,x(this.options.labelMaxWidth)&&(this.sessionVariables.labelAngle=this.labelAngle))):this.options.labelWrap?(this.sessionVariables.labelMaxHeight=0===this.labelAngle?k:d,this.sessionVariables.labelWrap=this.labelWrap,this.sessionVariables.labelMaxWidth=g):(this.sessionVariables.labelMaxHeight=k,x(this.options.labelMaxWidth),this.sessionVariables.labelMaxWidth=this.options.labelMaxWidth?this.options.labelMaxWidth:this.sessionVariables.labelMaxWidth,this.sessionVariables.labelWrap=
this.labelWrap);for(d=0;d<this._labels.length;d++)a=this._labels[d].textBlock,a.maxWidth=this.labelMaxWidth=this.sessionVariables.labelMaxWidth,a.fontSize=this.labelFontSize=this.sessionVariables.labelFontSize,a.angle=this.labelAngle=this.sessionVariables.labelAngle,a.wrap=this.labelWrap=this.sessionVariables.labelWrap,a.maxHeight=this.sessionVariables.labelMaxHeight,a.measureText()}else for(b=0;b<this._labels.length;b++)a=this._labels[b].textBlock,a.maxWidth=this.labelMaxWidth=x(this.options.labelMaxWidth)?
this.sessionVariables.labelMaxWidth:this.options.labelMaxWidth,a.fontSize=this.labelFontSize=x(this.options.labelFontSize)?this.sessionVariables.labelFontSize:this.options.labelFontSize,a.angle=this.labelAngle=x(this.options.labelAngle)?this.sessionVariables.labelAngle:this.labelAngle,a.wrap=this.labelWrap=x(this.options.labelWrap)?this.sessionVariables.labelWrap:this.options.labelWrap,a.maxHeight=this.sessionVariables.labelMaxHeight,a.measureText();for(b=0;b<this.stripLines.length;b++){var g=this.stripLines[b],
z;if("outside"===g.labelPlacement){k=this.sessionVariables.labelMaxWidth;if("bottom"===this._position||"top"===this._position)z="undefined"===typeof g.options.labelWrap?this.sessionVariables.labelMaxHeight:g.labelWrap?0.8*this.chart.height>>0:1.5*this.labelFontSize;if("left"===this._position||"right"===this._position)z="undefined"===typeof g.options.labelWrap?this.sessionVariables.labelMaxHeight:g.labelWrap?0.8*this.chart.width>>0:1.5*this.labelFontSize;c=x(g.options.labelBackgroundColor)?"#EEEEEE":
g.options.labelBackgroundColor}else k="bottom"===this._position||"top"===this._position?0.9*this.chart.width>>0:0.9*this.chart.height>>0,z="undefined"===typeof g.options.labelWrap||g.labelWrap?"bottom"===this._position||"top"===this._position?0.8*this.chart.width>>0:0.8*this.chart.height>>0:1.5*this.labelFontSize,c=x(g.options.labelBackgroundColor)?x(g.startValue)&&0!==g.startValue?u?"transparent":null:"#EEEEEE":g.options.labelBackgroundColor;a=new V(this.ctx,{x:0,y:0,backgroundColor:c,borderColor:g.labelBorderColor,
borderThickness:g.labelBorderThickness,cornerRadius:g.labelCornerRadius,maxWidth:g.options.labelMaxWidth?g.options.labelMaxWidth:k,maxHeight:z,angle:this.labelAngle,text:g.labelFormatter?g.labelFormatter({chart:this.chart,axis:this,stripLine:g}):g.label,horizontalAlign:"left",fontSize:"outside"===g.labelPlacement?g.options.labelFontSize?g.options.labelFontSize:this.labelFontSize:g.labelFontSize,fontFamily:"outside"===g.labelPlacement?g.options.labelFontFamily?g.options.labelFontFamily:this.labelFontFamily:
g.labelFontFamily,fontWeight:"outside"===g.labelPlacement?g.options.fontWeight?g.options.fontWeight:this.fontWeight:g.fontWeight,fontColor:g.options.labelFontColor||g.color,fontStyle:"outside"===g.labelPlacement?g.options.fontStyle?g.options.fontStyle:this.fontWeight:g.fontStyle,textBaseline:"middle"});this._stripLineLabels.push({position:g.value,textBlock:a,effectiveHeight:null,stripLine:g})}};C.prototype.createLabelsAndCalculateWidth=function(){var a=0,c=0;this._labels=[];this._stripLineLabels=
[];if("left"===this._position||"right"===this._position){this.createLabels();for(c=0;c<this._labels.length;c++){var b=this._labels[c].textBlock,d=b.measureText(),f=0,f=0===this.labelAngle?d.width:d.width*Math.cos(Math.PI/180*Math.abs(this.labelAngle))+(d.height-b.fontSize/2)*Math.sin(Math.PI/180*Math.abs(this.labelAngle));a<f&&(a=f);this._labels[c].effectiveWidth=f}for(c=0;c<this._stripLineLabels.length;c++)"outside"===this._stripLineLabels[c].stripLine.labelPlacement&&(this._stripLineLabels[c].stripLine.value>
this.viewportMinimum&&this._stripLineLabels[c].stripLine.value<this.viewportMaximum)&&(b=this._stripLineLabels[c].textBlock,d=b.measureText(),f=0===this.labelAngle?d.width:d.width*Math.cos(Math.PI/180*Math.abs(this.labelAngle))+(d.height-b.fontSize/2)*Math.sin(Math.PI/180*Math.abs(this.labelAngle)),a<f&&(a=f),this._stripLineLabels[c].effectiveWidth=f)}return(this.title?this._titleTextBlock.measureText().height+2:0)+a+this.tickLength+5};C.prototype.createLabelsAndCalculateHeight=function(){var a=0;
this._labels=[];this._stripLineLabels=[];var c,b=0;this.createLabels();if("bottom"===this._position||"top"===this._position){for(b=0;b<this._labels.length;b++){c=this._labels[b].textBlock;var d=c.measureText(),f=0,f=0===this.labelAngle?d.height:d.width*Math.sin(Math.PI/180*Math.abs(this.labelAngle))+(d.height-c.fontSize/2)*Math.cos(Math.PI/180*Math.abs(this.labelAngle));a<f&&(a=f);this._labels[b].effectiveHeight=f}for(b=0;b<this._stripLineLabels.length;b++)"outside"===this._stripLineLabels[b].stripLine.labelPlacement&&
(c=this._stripLineLabels[b].textBlock,d=c.measureText(),f=0===this.labelAngle?d.height:d.width*Math.sin(Math.PI/180*Math.abs(this.labelAngle))+(d.height-c.fontSize/2)*Math.cos(Math.PI/180*Math.abs(this.labelAngle)),a<f&&(a=f),this._stripLineLabels[b].effectiveHeight=f)}return(this.title?this._titleTextBlock.measureText().height+2:0)+a+this.tickLength+5};C.setLayoutAndRender=function(a,c,b,d,f,g){var k,h,l,m,p=a[0]?a[0].chart:c[0].chart,n=p.ctx;if(a&&0<a.length)for(var e=0;e<a.length;e++)a[e]&&a[e].calculateAxisParameters();
if(c&&0<c.length)for(e=0;e<c.length;e++)c[e].calculateAxisParameters();if(b&&0<b.length)for(e=0;e<b.length;e++)b[e].calculateAxisParameters();if(d&&0<d.length)for(e=0;e<d.length;e++)d[e].calculateAxisParameters();var q=0,r=0,s=0,u=0,v=0,t=0,w=0,y,A,B=h=0,C,E,F,H;C=E=F=H=!1;if(a&&0<a.length)for(e=0;e<a.length;e++)a[e]&&a[e].title&&(a[e]._titleTextBlock=new V(a[e].ctx,{text:a[e].title,horizontalAlign:"center",fontSize:a[e].titleFontSize,fontFamily:a[e].titleFontFamily,fontWeight:a[e].titleFontWeight,
fontColor:a[e].titleFontColor,fontStyle:a[e].titleFontStyle,borderColor:a[e].titleBorderColor,borderThickness:a[e].titleBorderThickness,backgroundColor:a[e].titleBackgroundColor,cornerRadius:a[e].titleCornerRadius,textBaseline:"top"}));if(c&&0<c.length)for(e=0;e<c.length;e++)c[e]&&c[e].title&&(c[e]._titleTextBlock=new V(c[e].ctx,{text:c[e].title,horizontalAlign:"center",fontSize:c[e].titleFontSize,fontFamily:c[e].titleFontFamily,fontWeight:c[e].titleFontWeight,fontColor:c[e].titleFontColor,fontStyle:c[e].titleFontStyle,
borderColor:c[e].titleBorderColor,borderThickness:c[e].titleBorderThickness,backgroundColor:c[e].titleBackgroundColor,cornerRadius:c[e].titleCornerRadius,textBaseline:"top"}));if(b&&0<b.length)for(e=0;e<b.length;e++)b[e]&&b[e].title&&(b[e]._titleTextBlock=new V(b[e].ctx,{text:b[e].title,horizontalAlign:"center",fontSize:b[e].titleFontSize,fontFamily:b[e].titleFontFamily,fontWeight:b[e].titleFontWeight,fontColor:b[e].titleFontColor,fontStyle:b[e].titleFontStyle,borderColor:b[e].titleBorderColor,borderThickness:b[e].titleBorderThickness,
backgroundColor:b[e].titleBackgroundColor,cornerRadius:b[e].titleCornerRadius,textBaseline:"top"}));if(d&&0<d.length)for(e=0;e<d.length;e++)d[e]&&d[e].title&&(d[e]._titleTextBlock=new V(d[e].ctx,{text:d[e].title,horizontalAlign:"center",fontSize:d[e].titleFontSize,fontFamily:d[e].titleFontFamily,fontWeight:d[e].titleFontWeight,fontColor:d[e].titleFontColor,fontStyle:d[e].titleFontStyle,borderColor:d[e].titleBorderColor,borderThickness:d[e].titleBorderThickness,backgroundColor:d[e].titleBackgroundColor,
cornerRadius:d[e].titleCornerRadius,textBaseline:"top"}));if("normal"===f){var u=[],v=[],t=[],w=[],G=[],I=[],L=[],J=[];if(a&&0<a.length)for(e=0;e<a.length;e++)a[e]&&a[e].title&&(a[e]._titleTextBlock.maxWidth=a[e].titleMaxWidth||g.width,a[e]._titleTextBlock.maxHeight=a[e].titleWrap?0.8*g.height:1.5*a[e].titleFontSize,a[e]._titleTextBlock.angle=0);if(c&&0<c.length)for(e=0;e<c[e].length;e++)c[e]&&c[e].title&&(c[e]._titleTextBlock.maxWidth=c[e].titleMaxWidth||g.width,c[e]._titleTextBlock.maxHeight=c[e].titleWrap?
0.8*g.height:1.5*c[e].titleFontSize,c[e]._titleTextBlock.angle=0);if(b&&0<b.length)for(e=0;e<b.length;e++)b[e]&&b[e].title&&(b[e]._titleTextBlock.maxWidth=b[e].titleMaxWidth||g.height,b[e]._titleTextBlock.maxHeight=b[e].titleWrap?0.8*g.width:1.5*b[e].titleFontSize,b[e]._titleTextBlock.angle=-90);if(d&&0<d.length)for(e=0;e<d.length;e++)d[e]&&d[e].title&&(d[e]._titleTextBlock.maxWidth=d[e].titleMaxWidth||g.height,d[e]._titleTextBlock.maxHeight=d[e].titleWrap?0.8*g.width:1.5*d[e].titleFontSize,d[e]._titleTextBlock.angle=
90);for(;4>q;){var M=0,Q=0,P=0,O=0,K=f=0,D=0,R=0,W=0,U=0,T=0,S=0;if(b&&0<b.length)for(t=[],e=T=0;e<b.length;e++)t.push(Math.ceil(b[e]?b[e].createLabelsAndCalculateWidth():0)),T+=t[e],D+=b[e]?b[e].margin:0;else t.push(Math.ceil(b[0]?b[0].createLabelsAndCalculateWidth():0));L.push(t);if(d&&0<d.length)for(w=[],e=S=0;e<d.length;e++)w.push(Math.ceil(d[e]?d[e].createLabelsAndCalculateWidth():0)),S+=w[e],R+=d[e]?d[e].margin:0;else w.push(Math.ceil(d[0]?d[0].createLabelsAndCalculateWidth():0));J.push(w);
k=Math.round(g.x1+T+D);l=Math.round(g.x2-S-R>p.width-10?p.width-10:g.x2-S-R);if(a&&0<a.length)for(u=[],e=W=0;e<a.length;e++)a[e]&&(a[e].lineCoordinates={}),a[e].lineCoordinates.width=Math.abs(l-k),a[e].title&&(a[e]._titleTextBlock.maxWidth=0<a[e].titleMaxWidth&&a[e].titleMaxWidth<a[e].lineCoordinates.width?a[e].titleMaxWidth:a[e].lineCoordinates.width),u.push(Math.ceil(a[e]?a[e].createLabelsAndCalculateHeight():0)),W+=u[e],f+=a[e]?a[e].margin:0;else u.push(Math.ceil(a[0]?a[0].createLabelsAndCalculateHeight():
0));G.push(u);if(c&&0<c.length)for(v=[],e=U=0;e<c.length;e++)c[e]&&(c[e].lineCoordinates={}),c[e].lineCoordinates.width=Math.abs(l-k),c[e].title&&(c[e]._titleTextBlock.maxWidth=0<c[e].titleMaxWidth&&c[e].titleMaxWidth<c[e].lineCoordinates.width?c[e].titleMaxWidth:c[e].lineCoordinates.width),v.push(Math.ceil(c[e]?c[e].createLabelsAndCalculateHeight():0)),U+=v[e],K+=c[e]?c[e].margin:0;else v.push(Math.ceil(c[0]?c[0].createLabelsAndCalculateHeight():0));I.push(v);if(a&&0<a.length)for(e=0;e<a.length;e++)a[e]&&
(a[e].lineCoordinates.x1=k,l=Math.round(g.x2-S-R>p.width-10?p.width-10:g.x2-S-R),a[e]._labels&&1<a[e]._labels.length&&(h=m=0,m=a[e]._labels[1],h="dateTime"===a[e].chart.plotInfo.axisXValueType?a[e]._labels[a[e]._labels.length-2]:a[e]._labels[a[e]._labels.length-1],r=m.textBlock.width*Math.cos(Math.PI/180*Math.abs(m.textBlock.angle))+(m.textBlock.height-h.textBlock.fontSize/2)*Math.sin(Math.PI/180*Math.abs(m.textBlock.angle)),s=h.textBlock.width*Math.cos(Math.PI/180*Math.abs(h.textBlock.angle))+(h.textBlock.height-
h.textBlock.fontSize/2)*Math.sin(Math.PI/180*Math.abs(h.textBlock.angle))),a[e]&&(a[e].labelAutoFit&&!x(y)&&!x(A))&&(h=0,0<a[e].labelAngle?A+s>l&&(h+=0<a[e].labelAngle?A+s-l-S:0):0>a[e].labelAngle?y-r<k&&y-r<a[e].viewportMinimum&&(B=k-(D+a[e].tickLength+t+y-r+a[e].labelFontSize/2)):0===a[e].labelAngle&&(A+s>l&&(h=A+s/2-l-S),y-r<k&&y-r<a[e].viewportMinimum&&(B=k-D-a[e].tickLength-t-y+r/2)),a[e].viewportMaximum===a[e].maximum&&a[e].viewportMinimum===a[e].minimum&&0<a[e].labelAngle&&0<h?l-=h:a[e].viewportMaximum===
a[e].maximum&&a[e].viewportMinimum===a[e].minimum&&0>a[e].labelAngle&&0<B?k+=B:a[e].viewportMaximum===a[e].maximum&&a[e].viewportMinimum===a[e].minimum&&0===a[e].labelAngle&&(0<B&&(k+=B),0<h&&(l-=h))),p.panEnabled?W=p.sessionVariables.axisX.height:p.sessionVariables.axisX.height=W,h=Math.round(g.y2-W-f+M),m=Math.round(g.y2),a[e].lineCoordinates.x2=l,a[e].lineCoordinates.width=l-k,a[e].lineCoordinates.y1=h,a[e].lineCoordinates.y2=h,a[e].bounds={x1:k,y1:h,x2:l,y2:m-(W+f-u[e]-M),width:l-k,height:m-h}),
M+=u[e]+a[e].margin;if(c&&0<c.length)for(e=0;e<c.length;e++)c[e].lineCoordinates.x1=Math.round(g.x1+T+D),c[e].lineCoordinates.x2=Math.round(g.x2-S-R>p.width-10?p.width-10:g.x2-S-R),c[e].lineCoordinates.width=Math.abs(l-k),c[e]._labels&&1<c[e]._labels.length&&(m=c[e]._labels[1],h="dateTime"===c[e].chart.plotInfo.axisXValueType?c[e]._labels[c[e]._labels.length-2]:c[e]._labels[c[e]._labels.length-1],r=m.textBlock.width*Math.cos(Math.PI/180*Math.abs(m.textBlock.angle))+(m.textBlock.height-h.textBlock.fontSize/
2)*Math.sin(Math.PI/180*Math.abs(m.textBlock.angle)),s=h.textBlock.width*Math.cos(Math.PI/180*Math.abs(h.textBlock.angle))+(h.textBlock.height-h.textBlock.fontSize/2)*Math.sin(Math.PI/180*Math.abs(h.textBlock.angle))),p.panEnabled?U=p.sessionVariables.axisX2.height:p.sessionVariables.axisX2.height=U,h=Math.round(g.y1),m=Math.round(g.y2+c[e].margin),c[e].lineCoordinates.y1=h+U+K-Q,c[e].lineCoordinates.y2=h,c[e].bounds={x1:k,y1:h+(U+K-v[e]-Q),x2:l,y2:m,width:l-k,height:m-h},Q+=v[e]+c[e].margin;if(b&&
0<b.length)for(e=0;e<b.length;e++)D=10,b[e]&&(k=Math.round(a[0]?a[0].lineCoordinates.x1:c[0].lineCoordinates.x1),D=b[e]._labels&&0<b[e]._labels.length?b[e]._labels[b[e]._labels.length-1].textBlock.height/2:10,h=Math.round(g.y1+U+K<Math.max(D,10)?Math.max(D,10):g.y1+U+K),l=Math.round(a[0]?a[0].lineCoordinates.x1:c[0].lineCoordinates.x1),D=0<a.length?0:b[e]._labels[0].textBlock.height/2,m=Math.round(g.y2-W-f-D),b[e].lineCoordinates={x1:l-P,y1:h,x2:l-P,y2:m,height:Math.abs(m-h)},b[e].bounds={x1:k-(t[e]+
P),y1:h,x2:l,y2:m,width:l-k,height:m-h},b[e].title&&(b[e]._titleTextBlock.maxWidth=0<b[e].titleMaxWidth&&b[e].titleMaxWidth<b[e].lineCoordinates.height?b[e].titleMaxWidth:b[e].lineCoordinates.height),P+=t[e]+b[e].margin);if(d&&0<d.length)for(e=0;e<d.length;e++)d[e]&&(k=Math.round(a[0]?a[0].lineCoordinates.x2:c[0].lineCoordinates.x2),l=Math.round(k),D=d[e]._labels&&0<d[e]._labels.length?d[e]._labels[d[e]._labels.length-1].textBlock.height/2:0,h=Math.round(g.y1+U+K<Math.max(D,10)?Math.max(D,10):g.y1+
U+K),D=0<a.length?0:d[e]._labels[0].textBlock.height/2,m=Math.round(g.y2-(W+f+D)),d[e].lineCoordinates={x1:k+O,y1:h,x2:k+O,y2:m,height:Math.abs(m-h)},d[e].bounds={x1:k,y1:h,x2:l+(w[e]+O),y2:m,width:l-k,height:m-h},d[e].title&&(d[e]._titleTextBlock.maxWidth=0<d[e].titleMaxWidth&&d[e].titleMaxWidth<d[e].lineCoordinates.height?d[e].titleMaxWidth:d[e].lineCoordinates.height),O+=w[e]+d[e].margin);if(a&&0<a.length)for(e=0;e<a.length;e++)a[e]&&(a[e].calculateValueToPixelConversionParameters(),a[e]._labels&&
1<a[e]._labels.length&&(y=(a[e].logarithmic?Math.log(a[e]._labels[1].position/a[e].viewportMinimum)/a[e].conversionParameters.lnLogarithmBase:a[e]._labels[1].position-a[e].viewportMinimum)*Math.abs(a[e].conversionParameters.pixelPerUnit)+a[e].lineCoordinates.x1,A="dateTime"===a[e].chart.plotInfo.axisXValueType?(a[e].logarithmic?Math.log(a[e]._labels[a[e]._labels.length-2].position/a[e].viewportMinimum)/a[e].conversionParameters.lnLogarithmBase:a[e]._labels[a[e]._labels.length-2].position-a[e].viewportMinimum)*
Math.abs(a[e].conversionParameters.pixelPerUnit)+a[e].lineCoordinates.x1:(a[e].logarithmic?Math.log(a[e]._labels[a[e]._labels.length-1].position/a[e].viewportMinimum)/a[e].conversionParameters.lnLogarithmBase:a[e]._labels[a[e]._labels.length-1].position-a[e].viewportMinimum)*Math.abs(a[e].conversionParameters.pixelPerUnit)+a[e].lineCoordinates.x1));if(c&&0<c.length)for(e=0;e<c.length;e++)c[e].calculateValueToPixelConversionParameters(),c[e]._labels&&1<c[e]._labels.length&&(y=(c[e].logarithmic?Math.log(c[e]._labels[1].position/
c[e].viewportMinimum)/c[e].conversionParameters.lnLogarithmBase:c[e]._labels[1].position-c[e].viewportMinimum)*Math.abs(c[e].conversionParameters.pixelPerUnit)+c[e].lineCoordinates.x1,A="dateTime"===c[e].chart.plotInfo.axisXValueType?(c[e].logarithmic?Math.log(c[e]._labels[c[e]._labels.length-2].position/c[e].viewportMinimum)/c[e].conversionParameters.lnLogarithmBase:c[e]._labels[c[e]._labels.length-2].position-c[e].viewportMinimum)*Math.abs(c[e].conversionParameters.pixelPerUnit)+c[e].lineCoordinates.x1:
(c[e].logarithmic?Math.log(c[e]._labels[c[e]._labels.length-1].position/c[e].viewportMinimum)/c[e].conversionParameters.lnLogarithmBase:c[e]._labels[c[e]._labels.length-1].position-c[e].viewportMinimum)*Math.abs(c[e].conversionParameters.pixelPerUnit)+c[e].lineCoordinates.x1);if(b&&0<b.length)for(e=0;e<b.length;e++)b[e].calculateValueToPixelConversionParameters();if(d&&0<d.length)for(e=0;e<d.length;e++)d[e].calculateValueToPixelConversionParameters();if(0<q){if(a&&0<a.length)for(e=0;e<a.length;e++)C=
G[q-1][e]===G[q][e]?!0:!1;else C=!0;if(c&&0<c.length)for(e=0;e<c.length;e++)E=I[q-1][e]===I[q][e]?!0:!1;else E=!0;if(b&&0<b.length)for(e=0;e<b.length;e++)F=L[q-1][e]===L[q][e]?!0:!1;else F=!0;if(d&&0<d.length)for(e=0;e<d.length;e++)H=J[q-1][e]===J[q][e]?!0:!1;else H=!0}if(C&&E&&F&&H)break;q++}n.save();n.beginPath();a[0]&&n.rect(5,a[0].bounds.y1,a[0].chart.width-10,a[0].bounds.height);c[0]&&n.rect(5,c[c.length-1].bounds.y1,c[0].chart.width-10,c[0].bounds.height);n.clip();if(a&&0<a.length)for(e=0;e<
a.length;e++)a[e].renderLabelsTicksAndTitle();if(c&&0<c.length)for(e=0;e<c.length;e++)c[e].renderLabelsTicksAndTitle();n.restore();if(b&&0<b.length)for(e=0;e<b.length;e++)b[e].renderLabelsTicksAndTitle();if(d&&0<d.length)for(e=0;e<d.length;e++)d[e].renderLabelsTicksAndTitle()}else{y=[];A=[];B=[];r=[];s=[];G=[];I=[];L=[];if(a&&0<a.length)for(e=0;e<a.length;e++)a[e]&&a[e].title&&(a[e]._titleTextBlock.maxWidth=a[e].titleMaxWidth||g.width,a[e]._titleTextBlock.maxHeight=a[e].titleWrap?0.8*g.height:1.5*
a[e].titleFontSize,a[e]._titleTextBlock.angle=-90);if(c&&0<c.length)for(e=0;e<c.length;e++)c[e]&&c[e].title&&(c[e]._titleTextBlock.maxWidth=c[e].titleMaxWidth||g.width,c[e]._titleTextBlock.maxHeight=c[e].titleWrap?0.8*g.height:1.5*c[e].titleFontSize,c[e]._titleTextBlock.angle=90);if(b&&0<b.length)for(e=0;e<b.length;e++)b[e]&&b[e].title&&(b[e]._titleTextBlock.maxWidth=b[e].titleMaxWidth||g.width,b[e]._titleTextBlock.maxHeight=b[e].titleWrap?0.8*g.height:1.5*b[e].titleFontSize,b[e]._titleTextBlock.angle=
0);if(d&&0<d.length)for(e=0;e<d.length;e++)d[e]&&d[e].title&&(d[e]._titleTextBlock.maxWidth=d[e].titleMaxWidth||g.width,d[e]._titleTextBlock.maxHeight=d[e].titleWrap?0.8*g.height:1.5*d[e].titleFontSize,d[e]._titleTextBlock.angle=0);for(;4>q;){U=W=T=O=R=D=K=f=P=J=Q=M=0;if(a&&0<a.length)for(B=[],e=W=0;e<a.length;e++)B.push(Math.ceil(a[e]?a[e].createLabelsAndCalculateWidth():0)),W+=B[e],f+=a[e]?a[e].margin:0;else B.push(Math.ceil(a[0]?a[0].createLabelsAndCalculateWidth():0));I.push(B);if(c&&0<c.length)for(r=
[],e=U=0;e<c.length;e++)r.push(Math.ceil(c[e]?c[e].createLabelsAndCalculateWidth():0)),U+=r[e],K+=c[e]?c[e].margin:0;else r.push(Math.ceil(c[0]?c[0].createLabelsAndCalculateWidth():0));L.push(r);if(b&&0<b.length)for(e=0;e<b.length;e++)b[e].lineCoordinates={},k=Math.round(g.x1+W+f),l=Math.round(g.x2-U-K>p.width-10?p.width-10:g.x2-U-K),b[e].labelAutoFit&&!x(u)&&(0<!a.length&&(k=0>b[e].labelAngle?Math.max(k,u):0===b[e].labelAngle?Math.max(k,u/2):k),0<!c.length&&(l=0<b[e].labelAngle?l-v/2:0===b[e].labelAngle?
l-v/2:l)),b[e].lineCoordinates.x1=k,b[e].lineCoordinates.x2=l,b[e].lineCoordinates.width=Math.abs(l-k),b[e].title&&(b[e]._titleTextBlock.maxWidth=0<b[e].titleMaxWidth&&b[e].titleMaxWidth<b[e].lineCoordinates.width?b[e].titleMaxWidth:b[e].lineCoordinates.width);if(d&&0<d.length)for(e=0;e<d.length;e++)d[e].lineCoordinates={},k=Math.round(g.x1+W+f),l=Math.round(g.x2-U-K>d[e].chart.width-10?d[e].chart.width-10:g.x2-U-K),d[e]&&d[e].labelAutoFit&&!x(t)&&(0<!a.length&&(k=0<d[e].labelAngle?Math.max(k,t):
0===d[e].labelAngle?Math.max(k,t/2):k),0<!c.length&&(l-=w/2)),d[e].lineCoordinates.x1=k,d[e].lineCoordinates.x2=l,d[e].lineCoordinates.width=Math.abs(l-k),d[e].title&&(d[e]._titleTextBlock.maxWidth=0<d[e].titleMaxWidth&&d[e].titleMaxWidth<d[e].lineCoordinates.width?d[e].titleMaxWidth:d[e].lineCoordinates.width);if(b&&0<b.length)for(y=[],e=O=0;e<b.length;e++)y.push(Math.ceil(b[e]?b[e].createLabelsAndCalculateHeight():0)),O+=y[e]+b[e].margin,D+=b[e].margin;else y.push(Math.ceil(b[0]?b[0].createLabelsAndCalculateHeight():
0));s.push(y);if(d&&0<d.length)for(A=[],e=T=0;e<d.length;e++)A.push(Math.ceil(d[e]?d[e].createLabelsAndCalculateHeight():0)),T+=A[e],R+=d[e].margin;else A.push(Math.ceil(d[0]?d[0].createLabelsAndCalculateHeight():0));G.push(A);if(b&&0<b.length)for(e=0;e<b.length;e++)0<b[e]._labels.length&&(m=b[e]._labels[0],h=b[e]._labels[b[e]._labels.length-1],u=m.textBlock.width*Math.cos(Math.PI/180*Math.abs(m.textBlock.angle))+(m.textBlock.height-h.textBlock.fontSize/2)*Math.sin(Math.PI/180*Math.abs(m.textBlock.angle)),
v=h.textBlock.width*Math.cos(Math.PI/180*Math.abs(h.textBlock.angle))+(h.textBlock.height-h.textBlock.fontSize/2)*Math.sin(Math.PI/180*Math.abs(h.textBlock.angle)));if(d&&0<d.length)for(e=0;e<d.length;e++)d[e]&&0<d[e]._labels.length&&(m=d[e]._labels[0],h=d[e]._labels[d[e]._labels.length-1],t=m.textBlock.width*Math.cos(Math.PI/180*Math.abs(m.textBlock.angle))+(m.textBlock.height-h.textBlock.fontSize/2)*Math.sin(Math.PI/180*Math.abs(m.textBlock.angle)),w=h.textBlock.width*Math.cos(Math.PI/180*Math.abs(h.textBlock.angle))+
(h.textBlock.height-h.textBlock.fontSize/2)*Math.sin(Math.PI/180*Math.abs(h.textBlock.angle)));if(p.panEnabled)for(e=0;e<b.length;e++)y[e]=p.sessionVariables.axisY.height;else for(e=0;e<b.length;e++)p.sessionVariables.axisY.height=y[e];if(b&&0<b.length)for(e=b.length-1;0<=e;e--)h=Math.round(g.y2),m=Math.round(g.y2>b[e].chart.height-10?b[e].chart.height-10:g.y2),b[e].lineCoordinates.y1=h-(y[e]+b[e].margin+M),b[e].lineCoordinates.y2=h-(y[e]+b[e].margin+M),b[e].bounds={x1:k,y1:h-(y[e]+M+b[e].margin),
x2:l,y2:m-(M+b[e].margin),width:l-k,height:y[e]},b[e].title&&(b[e]._titleTextBlock.maxWidth=0<b[e].titleMaxWidth&&b[e].titleMaxWidth<b[e].lineCoordinates.width?b[e].titleMaxWidth:b[e].lineCoordinates.width),M+=y[e]+b[e].margin;if(d&&0<d.length)for(e=d.length-1;0<=e;e--)d[e]&&(h=Math.round(g.y1),m=Math.round(g.y1+(A[e]+d[e].margin+Q)),d[e].lineCoordinates.y1=m,d[e].lineCoordinates.y2=m,d[e].bounds={x1:k,y1:h+(d[e].margin+Q),x2:l,y2:m,width:l-k,height:T},d[e].title&&(d[e]._titleTextBlock.maxWidth=0<
d[e].titleMaxWidth&&d[e].titleMaxWidth<d[e].lineCoordinates.width?d[e].titleMaxWidth:d[e].lineCoordinates.width),Q+=A[e]+d[e].margin);if(a&&0<a.length)for(e=0;e<a.length;e++){D=a[e]._labels&&0<a[e]._labels.length?a[e]._labels[0].textBlock.fontSize/2:0;k=Math.round(g.x1+f);h=d&&0<d.length?Math.round(d[0]?d[0].lineCoordinates.y2:g.y1<Math.max(D,10)?Math.max(D,10):g.y1):g.y1<Math.max(D,10)?Math.max(D,10):g.y1;l=Math.round(g.x1+W+f);m=b&&0<b.length?Math.round(b[0]?b[0].lineCoordinates.y1:g.y2-O>p.height-
Math.max(D,10)?p.height-Math.max(D,10):g.y2-O):g.y2>p.height-Math.max(D,10)?p.height-Math.max(D,10):g.y2;if(b&&0<b.length)for(D=0;D<b.length;D++)b[D]&&b[D].labelAutoFit&&(l=0>b[D].labelAngle?Math.max(l,u):0===b[D].labelAngle?Math.max(l,u/2):l,k=0>b[D].labelAngle||0===b[D].labelAngle?l-W:k);if(d&&0<d.length)for(D=0;D<d.length;D++)d[D]&&d[D].labelAutoFit&&(l=d[D].lineCoordinates.x1,k=l-W);a[e].lineCoordinates={x1:l-J,y1:h,x2:l-J,y2:m,height:Math.abs(m-h)};a[e].bounds={x1:l-(B[e]+J),y1:h,x2:l,y2:m,width:l-
k,height:m-h};a[e].title&&(a[e]._titleTextBlock.maxWidth=0<a[e].titleMaxWidth&&a[e].titleMaxWidth<a[e].lineCoordinates.height?a[e].titleMaxWidth:a[e].lineCoordinates.height);a[e].calculateValueToPixelConversionParameters();J+=B[e]+a[e].margin}if(c&&0<c.length)for(e=0;e<c.length;e++){D=c[e]._labels&&0<c[e]._labels.length?c[e]._labels[0].textBlock.fontSize/2:0;k=Math.round(g.x1-f);h=d&&0<d.length?Math.round(d[0]?d[0].lineCoordinates.y2:g.y1<Math.max(D,10)?Math.max(D,10):g.y1):g.y1<Math.max(D,10)?Math.max(D,
10):g.y1;l=Math.round(g.x2-U-K);m=b&&0<b.length?Math.round(b[0]?b[0].lineCoordinates.y1:g.y2-O>p.height-Math.max(D,10)?p.height-Math.max(D,10):g.y2-O):g.y2>p.height-Math.max(D,10)?p.height-Math.max(D,10):g.y2;if(b&&0<b.length)for(D=0;D<b.length;D++)b[D]&&b[D].labelAutoFit&&(l=0>b[D].labelAngle?Math.max(l,u):0===b[e].labelAngle?Math.max(l,u/2):l,k=0>b[D].labelAngle||0===b[D].labelAngle?l-U:k);if(d&&0<d.length)for(D=0;D<d.length;D++)d[D]&&d[D].labelAutoFit&&(l=d[D].lineCoordinates.x2,k=l-U);c[e].lineCoordinates=
{x1:l+P,y1:h,x2:l+P,y2:m,height:Math.abs(m-h)};c[e].bounds={x1:k,y1:h,x2:l,y2:m,width:l-k,height:m-h};c[e].title&&(c[e]._titleTextBlock.maxWidth=0<c[e].titleMaxWidth&&c[e].titleMaxWidth<c[e].lineCoordinates.height?c[e].titleMaxWidth:c[e].lineCoordinates.height);c[e].calculateValueToPixelConversionParameters();P+=r[e]+c[e].margin}if(b&&0<b.length)for(e=0;e<b.length;e++)b[e].calculateValueToPixelConversionParameters();if(d&&0<d.length)for(e=0;e<d.length;e++)d[e].calculateValueToPixelConversionParameters();
if(0<q){if(a&&0<a.length)for(e=0;e<a.length;e++)C=I[q-1][e]===I[q][e]?!0:!1;else C=!0;if(c&&0<c.length)for(e=0;e<c.length;e++)E=L[q-1][e]===L[q][e]?!0:!1;else E=!0;if(b&&0<b.length)for(e=0;e<b.length;e++)F=s[q-1][e]===s[q][e]?!0:!1;else F=!0;if(d&&0<d.length)for(e=0;e<d.length;e++)H=G[q-1][e]===G[q][e]?!0:!1;else H=!0}if(C&&E&&F&&H)break;q++}if(b&&0<b.length)for(e=0;e<b.length;e++)b[e].renderLabelsTicksAndTitle();if(d&&0<d.length)for(e=0;e<d.length;e++)d[e].renderLabelsTicksAndTitle();if(a&&0<a.length)for(e=
0;e<a.length;e++)a[e].renderLabelsTicksAndTitle();if(c&&0<c.length)for(e=0;e<c.length;e++)c[e].renderLabelsTicksAndTitle()}p.preparePlotArea();g=p.plotArea;n.save();n.beginPath();n.rect(g.x1,g.y1,Math.abs(g.x2-g.x1),Math.abs(g.y2-g.y1));n.clip();if(a&&0<a.length)for(e=0;e<a.length;e++)a[e].renderStripLinesOfThicknessType("value");if(c&&0<c.length)for(e=0;e<c.length;e++)c[e].renderStripLinesOfThicknessType("value");if(b&&0<b.length)for(e=0;e<b.length;e++)b[e].renderStripLinesOfThicknessType("value");
if(d&&0<d.length)for(e=0;e<d.length;e++)d[e].renderStripLinesOfThicknessType("value");if(a&&0<a.length)for(e=0;e<a.length;e++)a[e].renderInterlacedColors();if(c&&0<c.length)for(e=0;e<c.length;e++)c[e].renderInterlacedColors();if(b&&0<b.length)for(e=0;e<b.length;e++)b[e].renderInterlacedColors();if(d&&0<d.length)for(e=0;e<d.length;e++)d[e].renderInterlacedColors();n.restore();if(a&&0<a.length)for(e=0;e<a.length;e++)a[e].renderGrid();if(c&&0<c.length)for(e=0;e<c.length;e++)c[e].renderGrid();if(b&&0<
b.length)for(e=0;e<b.length;e++)b[e].renderGrid();if(d&&0<d.length)for(e=0;e<d.length;e++)d[e].renderGrid();if(a&&0<a.length)for(e=0;e<a.length;e++)a[e].renderAxisLine();if(c&&0<c.length)for(e=0;e<c.length;e++)c[e].renderAxisLine();if(b&&0<b.length)for(e=0;e<b.length;e++)b[e].renderAxisLine();if(d&&0<d.length)for(e=0;e<d.length;e++)d[e].renderAxisLine();if(a&&0<a.length)for(e=0;e<a.length;e++)a[e].renderStripLinesOfThicknessType("pixel");if(c&&0<c.length)for(e=0;e<c.length;e++)c[e].renderStripLinesOfThicknessType("pixel");
if(b&&0<b.length)for(e=0;e<b.length;e++)b[e].renderStripLinesOfThicknessType("pixel");if(d&&0<d.length)for(e=0;e<d.length;e++)d[e].renderStripLinesOfThicknessType("pixel")};C.prototype.renderLabelsTicksAndTitle=function(){var a=!1,c=0,b=0,d=1,f=0;0!==this.labelAngle&&360!==this.labelAngle&&(d=1.2);if("undefined"===typeof this.options.interval){if("bottom"===this._position||"top"===this._position)if(this.logarithmic&&!this.equidistantInterval&&this.labelAutoFit){for(var c=[],d=0!==this.labelAngle&&
360!==this.labelAngle?1:1.2,g,k=this.viewportMaximum,h=this.lineCoordinates.width/Math.log(this.range),l=this._labels.length-1;0<=l;l--){p=this._labels[l];if(p.position<this.viewportMinimum)break;p.position>this.viewportMaximum||!(l===this._labels.length-1||g<Math.log(k/p.position)*h/d)||(c.push(p),k=p.position,g=p.textBlock.width*Math.abs(Math.cos(Math.PI/180*this.labelAngle))+p.textBlock.height*Math.abs(Math.sin(Math.PI/180*this.labelAngle)))}this._labels=c}else{for(l=0;l<this._labels.length;l++)p=
this._labels[l],p.position<this.viewportMinimum||(p=p.textBlock.width*Math.abs(Math.cos(Math.PI/180*this.labelAngle))+p.textBlock.height*Math.abs(Math.sin(Math.PI/180*this.labelAngle)),c+=p);c>this.lineCoordinates.width*d&&this.labelAutoFit&&(a=!0)}if("left"===this._position||"right"===this._position)if(this.logarithmic&&!this.equidistantInterval&&this.labelAutoFit){for(var c=[],m,k=this.viewportMaximum,h=this.lineCoordinates.height/Math.log(this.range),l=this._labels.length-1;0<=l;l--){p=this._labels[l];
if(p.position<this.viewportMinimum)break;p.position>this.viewportMaximum||!(l===this._labels.length-1||m<Math.log(k/p.position)*h)||(c.push(p),k=p.position,m=p.textBlock.height*Math.abs(Math.cos(Math.PI/180*this.labelAngle))+p.textBlock.width*Math.abs(Math.sin(Math.PI/180*this.labelAngle)))}this._labels=c}else{for(l=0;l<this._labels.length;l++)p=this._labels[l],p.position<this.viewportMinimum||(p=p.textBlock.height*Math.abs(Math.cos(Math.PI/180*this.labelAngle))+p.textBlock.width*Math.abs(Math.sin(Math.PI/
180*this.labelAngle)),b+=p);b>this.lineCoordinates.height*d&&this.labelAutoFit&&(a=!0)}}if("bottom"===this._position){for(var p,l=0;l<this._labels.length;l++)p=this._labels[l],p.position<this.viewportMinimum||p.position>this.viewportMaximum||(b=this.getPixelCoordinatesOnAxis(p.position),a&&0!==f++%2&&this.labelAutoFit||(this.tickThickness&&(this.ctx.lineWidth=this.tickThickness,this.ctx.strokeStyle=this.tickColor,d=1===this.ctx.lineWidth%2?(b.x<<0)+0.5:b.x<<0,this.ctx.beginPath(),this.ctx.moveTo(d,
b.y<<0),this.ctx.lineTo(d,b.y+this.tickLength<<0),this.ctx.stroke()),0===p.textBlock.angle?(b.x-=p.textBlock.width/2,b.y+=this.tickLength+p.textBlock.fontSize/2):(b.x-=0>this.labelAngle?p.textBlock.width*Math.cos(Math.PI/180*this.labelAngle):0,b.y+=this.tickLength+Math.abs(0>this.labelAngle?p.textBlock.width*Math.sin(Math.PI/180*this.labelAngle)-5:5)),p.textBlock.x=b.x,p.textBlock.y=b.y,p.textBlock.render(!0)));this.title&&(this._titleTextBlock.measureText(),this._titleTextBlock.x=this.lineCoordinates.x1+
this.lineCoordinates.width/2-this._titleTextBlock.width/2,this._titleTextBlock.y=this.bounds.y2-this._titleTextBlock.height-3,this.titleMaxWidth=this._titleTextBlock.maxWidth,this._titleTextBlock.render(!0))}else if("top"===this._position){for(l=0;l<this._labels.length;l++)p=this._labels[l],p.position<this.viewportMinimum||p.position>this.viewportMaximum||(b=this.getPixelCoordinatesOnAxis(p.position),a&&0!==f++%2&&this.labelAutoFit||(this.tickThickness&&(this.ctx.lineWidth=this.tickThickness,this.ctx.strokeStyle=
this.tickColor,d=1===this.ctx.lineWidth%2?(b.x<<0)+0.5:b.x<<0,this.ctx.beginPath(),this.ctx.moveTo(d,b.y<<0),this.ctx.lineTo(d,b.y-this.tickLength<<0),this.ctx.stroke()),0===p.textBlock.angle?(b.x-=p.textBlock.width/2,b.y-=this.tickLength+p.textBlock.height/2):(b.x+=(p.textBlock.height-this.tickLength-this.labelFontSize/2)*Math.sin(Math.PI/180*this.labelAngle)-(0<this.labelAngle?p.textBlock.width*Math.cos(Math.PI/180*this.labelAngle):0),b.y-=this.tickLength+(p.textBlock.height/2*Math.cos(Math.PI/
180*this.labelAngle)+(0<this.labelAngle?p.textBlock.width*Math.sin(Math.PI/180*this.labelAngle):0))),p.textBlock.x=b.x,p.textBlock.y=b.y,p.textBlock.render(!0)));this.title&&(this._titleTextBlock.measureText(),this._titleTextBlock.x=this.lineCoordinates.x1+this.lineCoordinates.width/2-this._titleTextBlock.width/2,this._titleTextBlock.y=this.bounds.y1+1,this.titleMaxWidth=this._titleTextBlock.maxWidth,this._titleTextBlock.render(!0))}else if("left"===this._position){for(l=0;l<this._labels.length;l++)p=
this._labels[l],p.position<this.viewportMinimum||p.position>this.viewportMaximum||(b=this.getPixelCoordinatesOnAxis(p.position),a&&0!==f++%2&&this.labelAutoFit||(this.tickThickness&&(this.ctx.lineWidth=this.tickThickness,this.ctx.strokeStyle=this.tickColor,d=1===this.ctx.lineWidth%2?(b.y<<0)+0.5:b.y<<0,this.ctx.beginPath(),this.ctx.moveTo(b.x<<0,d),this.ctx.lineTo(b.x-this.tickLength<<0,d),this.ctx.stroke()),0===this.labelAngle?(p.textBlock.y=b.y,p.textBlock.x=b.x-p.textBlock.width*Math.cos(Math.PI/
180*this.labelAngle)-this.tickLength-5):(p.textBlock.y=b.y-p.textBlock.width*Math.sin(Math.PI/180*this.labelAngle),p.textBlock.x=0<this.labelAngle?b.x-p.textBlock.width*Math.cos(Math.PI/180*this.labelAngle)-this.tickLength-5:b.x-p.textBlock.width*Math.cos(Math.PI/180*this.labelAngle)+(p.textBlock.height-p.textBlock.fontSize/2-5)*Math.sin(Math.PI/180*this.labelAngle)-this.tickLength),p.textBlock.render(!0)));this.title&&(this._titleTextBlock.measureText(),this._titleTextBlock.x=this.bounds.x1+1,this._titleTextBlock.y=
this.lineCoordinates.height/2+this._titleTextBlock.width/2+this.lineCoordinates.y1,this.titleMaxWidth=this._titleTextBlock.maxWidth,this._titleTextBlock.render(!0))}else if("right"===this._position){for(l=0;l<this._labels.length;l++)p=this._labels[l],p.position<this.viewportMinimum||p.position>this.viewportMaximum||(b=this.getPixelCoordinatesOnAxis(p.position),a&&0!==f++%2&&this.labelAutoFit||(this.tickThickness&&(this.ctx.lineWidth=this.tickThickness,this.ctx.strokeStyle=this.tickColor,d=1===this.ctx.lineWidth%
2?(b.y<<0)+0.5:b.y<<0,this.ctx.beginPath(),this.ctx.moveTo(b.x<<0,d),this.ctx.lineTo(b.x+this.tickLength<<0,d),this.ctx.stroke()),0===this.labelAngle?(p.textBlock.y=b.y,p.textBlock.x=b.x+this.tickLength+5):(p.textBlock.y=0>this.labelAngle?b.y:b.y-(p.textBlock.height-p.textBlock.fontSize/2-5)*Math.cos(Math.PI/180*this.labelAngle),p.textBlock.x=0<this.labelAngle?b.x+(p.textBlock.height-p.textBlock.fontSize/2-5)*Math.sin(Math.PI/180*this.labelAngle)+this.tickLength:b.x+this.tickLength+5),p.textBlock.render(!0)));
this.title&&(this._titleTextBlock.measureText(),this._titleTextBlock.x=this.bounds.x2-1,this._titleTextBlock.y=this.lineCoordinates.height/2-this._titleTextBlock.width/2+this.lineCoordinates.y1,this.titleMaxWidth=this._titleTextBlock.maxWidth,this._titleTextBlock.render(!0))}};C.prototype.renderInterlacedColors=function(){var a=this.chart.plotArea.ctx,c,b,d=this.chart.plotArea,f=0;c=!0;if(("bottom"===this._position||"top"===this._position)&&this.interlacedColor)for(a.fillStyle=this.interlacedColor,
f=0;f<this._labels.length;f++)c?(c=this.getPixelCoordinatesOnAxis(this._labels[f].position),b=f+1>this._labels.length-1?this.getPixelCoordinatesOnAxis(this.viewportMaximum):this.getPixelCoordinatesOnAxis(this._labels[f+1].position),a.fillRect(Math.min(b.x,c.x),d.y1,Math.abs(b.x-c.x),Math.abs(d.y1-d.y2)),c=!1):c=!0;else if(("left"===this._position||"right"===this._position)&&this.interlacedColor)for(a.fillStyle=this.interlacedColor,f=0;f<this._labels.length;f++)c?(b=this.getPixelCoordinatesOnAxis(this._labels[f].position),
c=f+1>this._labels.length-1?this.getPixelCoordinatesOnAxis(this.viewportMaximum):this.getPixelCoordinatesOnAxis(this._labels[f+1].position),a.fillRect(d.x1,Math.min(b.y,c.y),Math.abs(d.x1-d.x2),Math.abs(c.y-b.y)),c=!1):c=!0;a.beginPath()};C.prototype.renderStripLinesOfThicknessType=function(a){if(this.stripLines&&0<this.stripLines.length&&a){for(var c=this,b,d=0,f=0,g=!1,k=!1,h=[],l=[],k=!1,d=0;d<this.stripLines.length;d++){var m=this.stripLines[d];m._thicknessType===a&&("pixel"===a&&(m.value<this.viewportMinimum||
m.value>this.viewportMaximum||x(m.value)||isNaN(this.range))||h.push(m))}for(d=0;d<this._stripLineLabels.length;d++)if(m=this.stripLines[d],b=this._stripLineLabels[d],!(b.position<this.viewportMinimum||b.position>this.viewportMaximum||isNaN(this.range))){a=this.getPixelCoordinatesOnAxis(b.position);if("outside"===b.stripLine.labelPlacement)if(m&&(this.ctx.strokeStyle=m.color,"pixel"===m._thicknessType&&(this.ctx.lineWidth=m.thickness)),"bottom"===this._position){var p=1===this.ctx.lineWidth%2?(a.x<<
0)+0.5:a.x<<0;this.ctx.beginPath();this.ctx.moveTo(p,a.y<<0);this.ctx.lineTo(p,a.y+this.tickLength<<0);this.ctx.stroke();0===this.labelAngle?(a.x-=b.textBlock.width/2,a.y+=this.tickLength+b.textBlock.fontSize/2):(a.x-=0>this.labelAngle?b.textBlock.width*Math.cos(Math.PI/180*this.labelAngle):0,a.y+=this.tickLength+Math.abs(0>this.labelAngle?b.textBlock.width*Math.sin(Math.PI/180*this.labelAngle)-5:5))}else"top"===this._position?(p=1===this.ctx.lineWidth%2?(a.x<<0)+0.5:a.x<<0,this.ctx.beginPath(),this.ctx.moveTo(p,
a.y<<0),this.ctx.lineTo(p,a.y-this.tickLength<<0),this.ctx.stroke(),0===this.labelAngle?(a.x-=b.textBlock.width/2,a.y-=this.tickLength+b.textBlock.height):(a.x+=(b.textBlock.height-this.tickLength-this.labelFontSize/2)*Math.sin(Math.PI/180*this.labelAngle)-(0<this.labelAngle?b.textBlock.width*Math.cos(Math.PI/180*this.labelAngle):0),a.y-=this.tickLength+(b.textBlock.height*Math.cos(Math.PI/180*this.labelAngle)+(0<this.labelAngle?b.textBlock.width*Math.sin(Math.PI/180*this.labelAngle):0)))):"left"===
this._position?(p=1===this.ctx.lineWidth%2?(a.y<<0)+0.5:a.y<<0,this.ctx.beginPath(),this.ctx.moveTo(a.x<<0,p),this.ctx.lineTo(a.x-this.tickLength<<0,p),this.ctx.stroke(),0===this.labelAngle?a.x=a.x-b.textBlock.width*Math.cos(Math.PI/180*this.labelAngle)-this.tickLength-5:(a.y-=b.textBlock.width*Math.sin(Math.PI/180*this.labelAngle),a.x=0<this.labelAngle?a.x-b.textBlock.width*Math.cos(Math.PI/180*this.labelAngle)-this.tickLength-5:a.x-b.textBlock.width*Math.cos(Math.PI/180*this.labelAngle)+(b.textBlock.height-
b.textBlock.fontSize/2-5)*Math.sin(Math.PI/180*this.labelAngle)-this.tickLength)):"right"===this._position&&(p=1===this.ctx.lineWidth%2?(a.y<<0)+0.5:a.y<<0,this.ctx.beginPath(),this.ctx.moveTo(a.x<<0,p),this.ctx.lineTo(a.x+this.tickLength<<0,p),this.ctx.stroke(),0===this.labelAngle?a.x=a.x+this.tickLength+5:(a.y=0>this.labelAngle?a.y:a.y-(b.textBlock.height-b.textBlock.fontSize/2-5)*Math.cos(Math.PI/180*this.labelAngle),a.x=0<this.labelAngle?a.x+(b.textBlock.height-b.textBlock.fontSize/2-5)*Math.sin(Math.PI/
180*this.labelAngle)+this.tickLength:a.x+this.tickLength+5));else b.textBlock.angle=-90,"bottom"===this._position?(b.textBlock.maxWidth=this.options.stripLines[d].labelMaxWidth?this.options.stripLines[d].labelMaxWidth:this.chart.plotArea.height-3,b.textBlock.measureText(),a.x-b.textBlock.height>this.chart.plotArea.x1?x(m.startValue)?a.x-=b.textBlock.height-b.textBlock.fontSize/2:a.x-=b.textBlock.height/2-b.textBlock.fontSize/2+3:(b.textBlock.angle=90,x(m.startValue)?a.x+=b.textBlock.height-b.textBlock.fontSize/
2:a.x+=b.textBlock.height/2-b.textBlock.fontSize/2+3),a.y=-90===b.textBlock.angle?"near"===b.stripLine.labelAlign?this.chart.plotArea.y2-3:"center"===b.stripLine.labelAlign?(this.chart.plotArea.y2+this.chart.plotArea.y1+b.textBlock.width)/2:this.chart.plotArea.y1+b.textBlock.width+3:"near"===b.stripLine.labelAlign?this.chart.plotArea.y2-b.textBlock.width-3:"center"===b.stripLine.labelAlign?(this.chart.plotArea.y2+this.chart.plotArea.y1-b.textBlock.width)/2:this.chart.plotArea.y1+3):"top"===this._position?
(b.textBlock.maxWidth=this.options.stripLines[d].labelMaxWidth?this.options.stripLines[d].labelMaxWidth:this.chart.plotArea.height-3,b.textBlock.measureText(),a.x-b.textBlock.height>this.chart.plotArea.x1?x(m.startValue)?a.x-=b.textBlock.height-b.textBlock.fontSize/2:a.x-=b.textBlock.height/2-b.textBlock.fontSize/2+3:(b.textBlock.angle=90,x(m.startValue)?a.x+=b.textBlock.height-b.textBlock.fontSize/2:a.x+=b.textBlock.height/2-b.textBlock.fontSize/2+3),a.y=-90===b.textBlock.angle?"near"===b.stripLine.labelAlign?
this.chart.plotArea.y1+b.textBlock.width+3:"center"===b.stripLine.labelAlign?(this.chart.plotArea.y2+this.chart.plotArea.y1+b.textBlock.width)/2:this.chart.plotArea.y2-3:"near"===b.stripLine.labelAlign?this.chart.plotArea.y1+3:"center"===b.stripLine.labelAlign?(this.chart.plotArea.y2+this.chart.plotArea.y1-b.textBlock.width)/2:this.chart.plotArea.y2-b.textBlock.width-3):"left"===this._position?(b.textBlock.maxWidth=this.options.stripLines[d].labelMaxWidth?this.options.stripLines[d].labelMaxWidth:
this.chart.plotArea.width-3,b.textBlock.angle=0,b.textBlock.measureText(),a.y-b.textBlock.height>this.chart.plotArea.y1?x(m.startValue)?a.y-=b.textBlock.height-b.textBlock.fontSize/2:a.y-=b.textBlock.height/2-b.textBlock.fontSize+3:a.y-b.textBlock.height<this.chart.plotArea.y2?a.y+=b.textBlock.fontSize/2+3:x(m.startValue)?a.y-=b.textBlock.height-b.textBlock.fontSize/2:a.y-=b.textBlock.height/2-b.textBlock.fontSize+3,a.x="near"===b.stripLine.labelAlign?this.chart.plotArea.x1+3:"center"===b.stripLine.labelAlign?
(this.chart.plotArea.x2+this.chart.plotArea.x1)/2-b.textBlock.width/2:this.chart.plotArea.x2-b.textBlock.width-3):"right"===this._position&&(b.textBlock.maxWidth=this.options.stripLines[d].labelMaxWidth?this.options.stripLines[d].labelMaxWidth:this.chart.plotArea.width-3,b.textBlock.angle=0,b.textBlock.measureText(),a.y-+b.textBlock.height>this.chart.plotArea.y1?x(m.startValue)?a.y-=b.textBlock.height-b.textBlock.fontSize/2:a.y-=b.textBlock.height/2-b.textBlock.fontSize/2-3:a.y-b.textBlock.height<
this.chart.plotArea.y2?a.y+=b.textBlock.fontSize/2+3:x(m.startValue)?a.y-=b.textBlock.height-b.textBlock.fontSize/2:a.y-=b.textBlock.height/2-b.textBlock.fontSize/2+3,a.x="near"===b.stripLine.labelAlign?this.chart.plotArea.x2-b.textBlock.width-3:"center"===b.stripLine.labelAlign?(this.chart.plotArea.x2+this.chart.plotArea.x1)/2-b.textBlock.width/2:this.chart.plotArea.x1+3);b.textBlock.x=a.x;b.textBlock.y=a.y;l.push(b)}if(!k){k=!1;this.ctx.save();this.ctx.beginPath();this.ctx.rect(this.chart.plotArea.x1,
this.chart.plotArea.y1,this.chart.plotArea.width,this.chart.plotArea.height);this.ctx.clip();for(d=0;d<h.length;d++)m=h[d],m.showOnTop?g||(g=!0,this.chart.addEventListener("dataAnimationIterationEnd",function(){this.ctx.save();this.ctx.beginPath();this.ctx.rect(this.chart.plotArea.x1,this.chart.plotArea.y1,this.chart.plotArea.width,this.chart.plotArea.height);this.ctx.clip();for(f=0;f<h.length;f++)m=h[f],m.showOnTop&&m.render();this.ctx.restore()},m)):m.render();for(d=0;d<l.length;d++)b=l[d],b.stripLine.showOnTop?
k||(k=!0,this.chart.addEventListener("dataAnimationIterationEnd",function(){for(f=0;f<l.length;f++)b=l[f],"inside"===b.stripLine.labelPlacement&&b.stripLine.showOnTop&&(c.ctx.save(),c.ctx.beginPath(),c.ctx.rect(c.chart.plotArea.x1,c.chart.plotArea.y1,c.chart.plotArea.width,c.chart.plotArea.height),c.ctx.clip(),b.textBlock.render(!0),c.ctx.restore())},b.textBlock)):"inside"===b.stripLine.labelPlacement&&b.textBlock.render(!0);this.ctx.restore();k=!0}if(k)for(k=!1,d=0;d<l.length;d++)b=l[d],b.stripLine.showOnTop?
k||(k=!0,this.chart.addEventListener("dataAnimationIterationEnd",function(){for(f=0;f<l.length;f++)b=l[f],"outside"===b.stripLine.labelPlacement&&b.stripLine.showOnTop&&b.textBlock.render(!0)},b.textBlock)):"outside"===b.stripLine.labelPlacement&&b.textBlock.render(!0)}};C.prototype.renderGrid=function(){if(this.gridThickness&&0<this.gridThickness){var a=this.chart.ctx;a.save();var c,b=this.chart.plotArea;a.lineWidth=this.gridThickness;a.strokeStyle=this.gridColor;a.setLineDash&&a.setLineDash(G(this.gridDashType,
this.gridThickness));if("bottom"===this._position||"top"===this._position)for(d=0;d<this._labels.length;d++)this._labels[d].position<this.viewportMinimum||this._labels[d].position>this.viewportMaximum||(a.beginPath(),c=this.getPixelCoordinatesOnAxis(this._labels[d].position),c=1===a.lineWidth%2?(c.x<<0)+0.5:c.x<<0,a.moveTo(c,b.y1<<0),a.lineTo(c,b.y2<<0),a.stroke());else if("left"===this._position||"right"===this._position)for(var d=0;d<this._labels.length;d++)this._labels[d].position<this.viewportMinimum||
this._labels[d].position>this.viewportMaximum||(a.beginPath(),c=this.getPixelCoordinatesOnAxis(this._labels[d].position),c=1===a.lineWidth%2?(c.y<<0)+0.5:c.y<<0,a.moveTo(b.x1<<0,c),a.lineTo(b.x2<<0,c),a.stroke());a.restore()}};C.prototype.renderAxisLine=function(){var a=this.chart.ctx;a.save();if("bottom"===this._position||"top"===this._position){if(this.lineThickness){a.lineWidth=this.lineThickness;a.strokeStyle=this.lineColor?this.lineColor:"black";a.setLineDash&&a.setLineDash(G(this.lineDashType,
this.lineThickness));var c=1===this.lineThickness%2?(this.lineCoordinates.y1<<0)+0.5:this.lineCoordinates.y1<<0;a.beginPath();a.moveTo(this.lineCoordinates.x1,c);a.lineTo(this.lineCoordinates.x2,c);a.stroke()}}else"left"!==this._position&&"right"!==this._position||!this.lineThickness||(a.lineWidth=this.lineThickness,a.strokeStyle=this.lineColor,a.setLineDash&&a.setLineDash(G(this.lineDashType,this.lineThickness)),c=1===this.lineThickness%2?(this.lineCoordinates.x1<<0)+0.5:this.lineCoordinates.x1<<
0,a.beginPath(),a.moveTo(c,this.lineCoordinates.y1),a.lineTo(c,this.lineCoordinates.y2),a.stroke());a.restore()};C.prototype.getPixelCoordinatesOnAxis=function(a){var c={};if("bottom"===this._position||"top"===this._position)c.x=this.convertValueToPixel(a),c.y=this.lineCoordinates.y1;if("left"===this._position||"right"===this._position)c.y=this.convertValueToPixel(a),c.x=this.lineCoordinates.x2;return c};C.prototype.convertPixelToValue=function(a){if("undefined"===typeof a)return null;var c=0,c=0,
c="number"===typeof a?a:"left"===this._position||"right"===this._position?a.y:a.x;return c=this.logarithmic?Math.pow(this.logarithmBase,(c-this.conversionParameters.reference)/this.conversionParameters.pixelPerUnit)*this.viewportMinimum:this.conversionParameters.minimum+(c-this.conversionParameters.reference)/this.conversionParameters.pixelPerUnit};C.prototype.convertValueToPixel=function(a){return this.logarithmic?this.conversionParameters.reference+this.conversionParameters.pixelPerUnit*Math.log(a/
this.conversionParameters.minimum)/this.conversionParameters.lnLogarithmBase+0.5<<0:this.conversionParameters.reference+this.conversionParameters.pixelPerUnit*(a-this.conversionParameters.minimum)+0.5<<0};C.prototype.setViewPortRange=function(a,c){this.sessionVariables.newViewportMinimum=this.viewportMinimum=Math.min(a,c);this.sessionVariables.newViewportMaximum=this.viewportMaximum=Math.max(a,c)};C.prototype.getXValueAt=function(a){if(!a)return null;var c=null;"left"===this._position?c=this.convertPixelToValue(a.y):
"bottom"===this._position&&(c=this.convertPixelToValue(a.x));return c};C.prototype.calculateValueToPixelConversionParameters=function(a){a={pixelPerUnit:null,minimum:null,reference:null};var c=this.lineCoordinates.width,b=this.lineCoordinates.height;a.minimum=this.viewportMinimum;if("bottom"===this._position||"top"===this._position)this.logarithmic?(a.lnLogarithmBase=Math.log(this.logarithmBase),a.pixelPerUnit=(this.reversed?-1:1)*c*a.lnLogarithmBase/Math.log(Math.abs(this.range))):a.pixelPerUnit=
(this.reversed?-1:1)*c/Math.abs(this.range),a.reference=this.reversed?this.lineCoordinates.x2:this.lineCoordinates.x1;if("left"===this._position||"right"===this._position)this.logarithmic?(a.lnLogarithmBase=Math.log(this.logarithmBase),a.pixelPerUnit=(this.reversed?1:-1)*b*a.lnLogarithmBase/Math.log(Math.abs(this.range))):a.pixelPerUnit=(this.reversed?1:-1)*b/Math.abs(this.range),a.reference=this.reversed?this.lineCoordinates.y1:this.lineCoordinates.y2;this.conversionParameters=a};C.prototype.calculateAxisParameters=
function(){if(this.logarithmic)this.calculateLogarithamicAxisParameters();else{var a=this.chart.layoutManager.getFreeSpace(),c=!1,b=!1;"bottom"===this._position||"top"===this._position?(this.maxWidth=a.width,this.maxHeight=a.height):(this.maxWidth=a.height,this.maxHeight=a.width);var a="axisX"===this.type?"xySwapped"===this.chart.plotInfo.axisPlacement?62:70:"xySwapped"===this.chart.plotInfo.axisPlacement?50:40,d=4;"axisX"===this.type&&(d=600>this.maxWidth?8:6);var a=Math.max(d,Math.floor(this.maxWidth/
a)),f,g,k,d=0;if(null===this.viewportMinimum||isNaN(this.viewportMinimum))this.viewportMinimum=this.minimum;if(null===this.viewportMaximum||isNaN(this.viewportMaximum))this.viewportMaximum=this.maximum;if("axisX"===this.type){if(this.dataSeries&&0<this.dataSeries.length)for(f=0;f<this.dataSeries.length;f++)"dateTime"===this.dataSeries[f].xValueType&&(b=!0);f=null!==this.viewportMinimum?this.viewportMinimum:this.dataInfo.viewPortMin;g=null!==this.viewportMaximum?this.viewportMaximum:this.dataInfo.viewPortMax;
0===g-f&&(d="undefined"===typeof this.options.interval?0.4:this.options.interval,g+=d,f-=d);Infinity!==this.dataInfo.minDiff?k=this.dataInfo.minDiff:1<g-f?k=0.5*Math.abs(g-f):(k=1,b&&(c=!0))}else"axisY"===this.type&&(f=null!==this.viewportMinimum?this.viewportMinimum:this.dataInfo.viewPortMin,g=null!==this.viewportMaximum?this.viewportMaximum:this.dataInfo.viewPortMax,isFinite(f)||isFinite(g)?isFinite(f)?isFinite(g)||(g=f):f=g:(g="undefined"===typeof this.options.interval?-Infinity:this.options.interval,
f=0),0===f&&0===g?(g+=9,f=0):0===g-f?(d=Math.min(Math.abs(0.01*Math.abs(g)),5),g+=d,f-=d):f>g?(d=Math.min(Math.abs(0.01*Math.abs(g-f)),5),0<=g?f=g-d:g=f+d):(d=Math.min(Math.abs(0.01*Math.abs(g-f)),0.05),0!==g&&(g+=d),0!==f&&(f-=d)),k=Infinity!==this.dataInfo.minDiff?this.dataInfo.minDiff:1<g-f?0.5*Math.abs(g-f):1,this.includeZero&&(null===this.viewportMinimum||isNaN(this.viewportMinimum))&&0<f&&(f=0),this.includeZero&&(null===this.viewportMaximum||isNaN(this.viewportMaximum))&&0>g&&(g=0));d=(isNaN(this.viewportMaximum)||
null===this.viewportMaximum?g:this.viewportMaximum)-(isNaN(this.viewportMinimum)||null===this.viewportMinimum?f:this.viewportMinimum);if("axisX"===this.type&&b){this.intervalType||(d/1<=a?(this.interval=1,this.intervalType="millisecond"):d/2<=a?(this.interval=2,this.intervalType="millisecond"):d/5<=a?(this.interval=5,this.intervalType="millisecond"):d/10<=a?(this.interval=10,this.intervalType="millisecond"):d/20<=a?(this.interval=20,this.intervalType="millisecond"):d/50<=a?(this.interval=50,this.intervalType=
"millisecond"):d/100<=a?(this.interval=100,this.intervalType="millisecond"):d/200<=a?(this.interval=200,this.intervalType="millisecond"):d/250<=a?(this.interval=250,this.intervalType="millisecond"):d/300<=a?(this.interval=300,this.intervalType="millisecond"):d/400<=a?(this.interval=400,this.intervalType="millisecond"):d/500<=a?(this.interval=500,this.intervalType="millisecond"):d/(1*I.secondDuration)<=a?(this.interval=1,this.intervalType="second"):d/(2*I.secondDuration)<=a?(this.interval=2,this.intervalType=
"second"):d/(5*I.secondDuration)<=a?(this.interval=5,this.intervalType="second"):d/(10*I.secondDuration)<=a?(this.interval=10,this.intervalType="second"):d/(15*I.secondDuration)<=a?(this.interval=15,this.intervalType="second"):d/(20*I.secondDuration)<=a?(this.interval=20,this.intervalType="second"):d/(30*I.secondDuration)<=a?(this.interval=30,this.intervalType="second"):d/(1*I.minuteDuration)<=a?(this.interval=1,this.intervalType="minute"):d/(2*I.minuteDuration)<=a?(this.interval=2,this.intervalType=
"minute"):d/(5*I.minuteDuration)<=a?(this.interval=5,this.intervalType="minute"):d/(10*I.minuteDuration)<=a?(this.interval=10,this.intervalType="minute"):d/(15*I.minuteDuration)<=a?(this.interval=15,this.intervalType="minute"):d/(20*I.minuteDuration)<=a?(this.interval=20,this.intervalType="minute"):d/(30*I.minuteDuration)<=a?(this.interval=30,this.intervalType="minute"):d/(1*I.hourDuration)<=a?(this.interval=1,this.intervalType="hour"):d/(2*I.hourDuration)<=a?(this.interval=2,this.intervalType="hour"):
d/(3*I.hourDuration)<=a?(this.interval=3,this.intervalType="hour"):d/(6*I.hourDuration)<=a?(this.interval=6,this.intervalType="hour"):d/(1*I.dayDuration)<=a?(this.interval=1,this.intervalType="day"):d/(2*I.dayDuration)<=a?(this.interval=2,this.intervalType="day"):d/(4*I.dayDuration)<=a?(this.interval=4,this.intervalType="day"):d/(1*I.weekDuration)<=a?(this.interval=1,this.intervalType="week"):d/(2*I.weekDuration)<=a?(this.interval=2,this.intervalType="week"):d/(3*I.weekDuration)<=a?(this.interval=
3,this.intervalType="week"):d/(1*I.monthDuration)<=a?(this.interval=1,this.intervalType="month"):d/(2*I.monthDuration)<=a?(this.interval=2,this.intervalType="month"):d/(3*I.monthDuration)<=a?(this.interval=3,this.intervalType="month"):d/(6*I.monthDuration)<=a?(this.interval=6,this.intervalType="month"):(this.interval=d/(1*I.yearDuration)<=a?1:d/(2*I.yearDuration)<=a?2:d/(4*I.yearDuration)<=a?4:Math.floor(C.getNiceNumber(d/(a-1),!0)/I.yearDuration),this.intervalType="year"));if(null===this.viewportMinimum||
isNaN(this.viewportMinimum))this.viewportMinimum=f-k/2;if(null===this.viewportMaximum||isNaN(this.viewportMaximum))this.viewportMaximum=g+k/2;c?this.autoValueFormatString="MMM DD YYYY HH:mm":"year"===this.intervalType?this.autoValueFormatString="YYYY":"month"===this.intervalType?this.autoValueFormatString="MMM YYYY":"week"===this.intervalType?this.autoValueFormatString="MMM DD YYYY":"day"===this.intervalType?this.autoValueFormatString="MMM DD YYYY":"hour"===this.intervalType?this.autoValueFormatString=
"hh:mm TT":"minute"===this.intervalType?this.autoValueFormatString="hh:mm TT":"second"===this.intervalType?this.autoValueFormatString="hh:mm:ss TT":"millisecond"===this.intervalType&&(this.autoValueFormatString="fff'ms'");this.valueFormatString||(this.valueFormatString=this.autoValueFormatString)}else{this.intervalType="number";d=C.getNiceNumber(d,!1);this.interval=this.options&&0<this.options.interval?this.options.interval:C.getNiceNumber(d/(a-1),!0);if(null===this.viewportMinimum||isNaN(this.viewportMinimum))this.viewportMinimum=
"axisX"===this.type?f-k/2:Math.floor(f/this.interval)*this.interval;if(null===this.viewportMaximum||isNaN(this.viewportMaximum))this.viewportMaximum="axisX"===this.type?g+k/2:Math.ceil(g/this.interval)*this.interval;0===this.viewportMaximum&&0===this.viewportMinimum&&(0===this.options.viewportMinimum?this.viewportMaximum+=10:0===this.options.viewportMaximum&&(this.viewportMinimum-=10),this.options&&"undefined"===typeof this.options.interval&&(this.interval=C.getNiceNumber((this.viewportMaximum-this.viewportMinimum)/
(a-1),!0)))}if(null===this.minimum||null===this.maximum)if("axisX"===this.type?(f=null!==this.minimum?this.minimum:this.dataInfo.min,g=null!==this.maximum?this.maximum:this.dataInfo.max,0===g-f&&(d="undefined"===typeof this.options.interval?0.4:this.options.interval,g+=d,f-=d),k=Infinity!==this.dataInfo.minDiff?this.dataInfo.minDiff:1<g-f?0.5*Math.abs(g-f):1):"axisY"===this.type&&(f=null!==this.minimum?this.minimum:this.dataInfo.min,g=null!==this.maximum?this.maximum:this.dataInfo.max,isFinite(f)||
isFinite(g)?0===f&&0===g?(g+=9,f=0):0===g-f?(d=Math.min(Math.abs(0.01*Math.abs(g)),5),g+=d,f-=d):f>g?(d=Math.min(Math.abs(0.01*Math.abs(g-f)),5),0<=g?f=g-d:g=f+d):(d=Math.min(Math.abs(0.01*Math.abs(g-f)),0.05),0!==g&&(g+=d),0!==f&&(f-=d)):(g="undefined"===typeof this.options.interval?-Infinity:this.options.interval,f=0),k=Infinity!==this.dataInfo.minDiff?this.dataInfo.minDiff:1<g-f?0.5*Math.abs(g-f):1,this.includeZero&&(null===this.minimum||isNaN(this.minimum))&&0<f&&(f=0),this.includeZero&&(null===
this.maximum||isNaN(this.maximum))&&0>g&&(g=0)),"axisX"===this.type&&b){if(null===this.minimum||isNaN(this.minimum))this.minimum=f-k/2;if(null===this.maximum||isNaN(this.maximum))this.maximum=g+k/2}else this.intervalType="number",null===this.minimum&&(this.minimum="axisX"===this.type?f-k/2:Math.floor(f/this.interval)*this.interval,this.minimum=Math.min(this.minimum,null===this.sessionVariables.viewportMinimum||isNaN(this.sessionVariables.viewportMinimum)?Infinity:this.sessionVariables.viewportMinimum)),
null===this.maximum&&(this.maximum="axisX"===this.type?g+k/2:Math.ceil(g/this.interval)*this.interval,this.maximum=Math.max(this.maximum,null===this.sessionVariables.viewportMaximum||isNaN(this.sessionVariables.viewportMaximum)?-Infinity:this.sessionVariables.viewportMaximum)),0===this.maximum&&0===this.minimum&&(0===this.options.minimum?this.maximum+=10:0===this.options.maximum&&(this.minimum-=10));this.viewportMinimum=Math.max(this.viewportMinimum,this.minimum);this.viewportMaximum=Math.min(this.viewportMaximum,
this.maximum);this.range=this.viewportMaximum-this.viewportMinimum;this.intervalStartPosition="axisX"===this.type&&b?this.getLabelStartPoint(new Date(this.viewportMinimum),this.intervalType,this.interval):Math.floor((this.viewportMinimum+0.2*this.interval)/this.interval)*this.interval;if(!this.valueFormatString&&(this.valueFormatString="#,##0.##",1>this.range)){c=Math.floor(Math.abs(Math.log(this.range)/Math.LN10))+2;if(isNaN(c)||!isFinite(c))c=2;if(2<c)for(b=0;b<c-2;b++)this.valueFormatString+="#"}}};
C.prototype.calculateLogarithamicAxisParameters=function(){var a=this.chart.layoutManager.getFreeSpace(),c=Math.log(this.logarithmBase),b;"bottom"===this._position||"top"===this._position?(this.maxWidth=a.width,this.maxHeight=a.height):(this.maxWidth=a.height,this.maxHeight=a.width);var a="axisX"===this.type?500>this.maxWidth?7:Math.max(7,Math.floor(this.maxWidth/100)):Math.max(Math.floor(this.maxWidth/50),3),d,f,g,k;k=1;if(null===this.viewportMinimum||isNaN(this.viewportMinimum))this.viewportMinimum=
this.minimum;if(null===this.viewportMaximum||isNaN(this.viewportMaximum))this.viewportMaximum=this.maximum;"axisX"===this.type?(d=null!==this.viewportMinimum?this.viewportMinimum:this.dataInfo.viewPortMin,f=null!==this.viewportMaximum?this.viewportMaximum:this.dataInfo.viewPortMax,1===f/d&&(k=Math.pow(this.logarithmBase,"undefined"===typeof this.options.interval?0.4:this.options.interval),f*=k,d/=k),g=Infinity!==this.dataInfo.minDiff?this.dataInfo.minDiff:f/d>this.logarithmBase?f/d*Math.pow(this.logarithmBase,
0.5):this.logarithmBase):"axisY"===this.type&&(d=null!==this.viewportMinimum?this.viewportMinimum:this.dataInfo.viewPortMin,f=null!==this.viewportMaximum?this.viewportMaximum:this.dataInfo.viewPortMax,0>=d&&!isFinite(f)?(f="undefined"===typeof this.options.interval?0:this.options.interval,d=1):0>=d?d=f:isFinite(f)||(f=d),1===d&&1===f?(f*=this.logarithmBase-1/this.logarithmBase,d=1):1===f/d?(k=Math.min(f*Math.pow(this.logarithmBase,0.01),Math.pow(this.logarithmBase,5)),f*=k,d/=k):d>f?(k=Math.min(d/
f*Math.pow(this.logarithmBase,0.01),Math.pow(this.logarithmBase,5)),1<=f?d=f/k:f=d*k):(k=Math.min(f/d*Math.pow(this.logarithmBase,0.01),Math.pow(this.logarithmBase,0.04)),1!==f&&(f*=k),1!==d&&(d/=k)),g=Infinity!==this.dataInfo.minDiff?this.dataInfo.minDiff:f/d>this.logarithmBase?f/d*Math.pow(this.logarithmBase,0.5):this.logarithmBase,this.includeZero&&(null===this.viewportMinimum||isNaN(this.viewportMinimum))&&1<d&&(d=1),this.includeZero&&(null===this.viewportMaximum||isNaN(this.viewportMaximum))&&
1>f&&(f=1));k=(isNaN(this.viewportMaximum)||null===this.viewportMaximum?f:this.viewportMaximum)/(isNaN(this.viewportMinimum)||null===this.viewportMinimum?d:this.viewportMinimum);linearRange=(isNaN(this.viewportMaximum)||null===this.viewportMaximum?f:this.viewportMaximum)-(isNaN(this.viewportMinimum)||null===this.viewportMinimum?d:this.viewportMinimum);this.intervalType="number";k=Math.pow(this.logarithmBase,C.getNiceNumber(Math.abs(Math.log(k)/c),!1));this.options&&0<this.options.interval?this.interval=
this.options.interval:(this.interval=C.getNiceExponent(Math.log(k)/c/(a-1),!0),b=C.getNiceNumber(linearRange/(a-1),!0));if(null===this.viewportMinimum||isNaN(this.viewportMinimum))this.viewportMinimum="axisX"===this.type?d/Math.sqrt(g):Math.pow(this.logarithmBase,this.interval*Math.floor(Math.log(d)/c/this.interval));if(null===this.viewportMaximum||isNaN(this.viewportMaximum))this.viewportMaximum="axisX"===this.type?f*Math.sqrt(g):Math.pow(this.logarithmBase,this.interval*Math.ceil(Math.log(f)/c/
this.interval));1===this.viewportMaximum&&1===this.viewportMinimum&&(1===this.options.viewportMinimum?this.viewportMaximum*=this.logarithmBase-1/this.logarithmBase:1===this.options.viewportMaximum&&(this.viewportMinimum/=this.logarithmBase-1/this.logarithmBase),this.options&&"undefined"===typeof this.options.interval&&(this.interval=C.getNiceExponent(Math.ceil(Math.log(k)/c)/(a-1)),b=C.getNiceNumber((this.viewportMaximum-this.viewportMinimum)/(a-1),!0)));if(null===this.minimum||null===this.maximum)"axisX"===
this.type?(d=null!==this.minimum?this.minimum:this.dataInfo.min,f=null!==this.maximum?this.maximum:this.dataInfo.max,1===f/d&&(k=Math.pow(this.logarithmBase,"undefined"===typeof this.options.interval?0.4:this.options.interval),f*=k,d/=k),g=Infinity!==this.dataInfo.minDiff?this.dataInfo.minDiff:f/d>this.logarithmBase?f/d*Math.pow(this.logarithmBase,0.5):this.logarithmBase):"axisY"===this.type&&(d=null!==this.minimum?this.minimum:this.dataInfo.min,f=null!==this.maximum?this.maximum:this.dataInfo.max,
isFinite(d)||isFinite(f)?1===d&&1===f?(f*=this.logarithmBase,d/=this.logarithmBase):1===f/d?(k=Math.pow(this.logarithmBase,this.interval),f*=k,d/=k):d>f?(k=Math.min(0.01*(d/f),5),1<=f?d=f/k:f=d*k):(k=Math.min(f/d*Math.pow(this.logarithmBase,0.01),Math.pow(this.logarithmBase,0.04)),1!==f&&(f*=k),1!==d&&(d/=k)):(f="undefined"===typeof this.options.interval?0:this.options.interval,d=1),g=Infinity!==this.dataInfo.minDiff?this.dataInfo.minDiff:f/d>this.logarithmBase?f/d*Math.pow(this.logarithmBase,0.5):
this.logarithmBase,this.includeZero&&(null===this.minimum||isNaN(this.minimum))&&1<d&&(d=1),this.includeZero&&(null===this.maximum||isNaN(this.maximum))&&1>f&&(f=1)),this.intervalType="number",null===this.minimum&&(this.minimum="axisX"===this.type?d/Math.sqrt(g):Math.pow(this.logarithmBase,this.interval*Math.floor(Math.log(d)/c/this.interval)),this.minimum=Math.min(this.minimum,null===this.sessionVariables.viewportMinimum||isNaN(this.sessionVariables.viewportMinimum)?"undefined"===typeof this.sessionVariables.newViewportMinimum?
Infinity:this.sessionVariables.newViewportMinimum:this.sessionVariables.viewportMinimum)),null===this.maximum&&(this.maximum="axisX"===this.type?f*Math.sqrt(g):Math.pow(this.logarithmBase,this.interval*Math.ceil(Math.log(f)/c/this.interval)),this.maximum=Math.max(this.maximum,null===this.sessionVariables.viewportMaximum||isNaN(this.sessionVariables.viewportMaximum)?"undefined"===typeof this.sessionVariables.newViewportMaximum?0:this.sessionVariables.newViewportMaximum:this.sessionVariables.viewportMaximum)),
1===this.maximum&&1===this.minimum&&(1===this.options.minimum?this.maximum*=this.logarithmBase-1/this.logarithmBase:1===this.options.maximum&&(this.minimum/=this.logarithmBase-1/this.logarithmBase));this.viewportMinimum=Math.max(this.viewportMinimum,this.minimum);this.viewportMaximum=Math.min(this.viewportMaximum,this.maximum);this.viewportMinimum>this.viewportMaximum&&(!this.options.viewportMinimum&&!this.options.minimum||this.options.viewportMaximum||this.options.maximum?this.options.viewportMinimum||
this.options.minimum||!this.options.viewportMaximum&&!this.options.maximum||(this.viewportMinimum=this.minimum=(this.options.viewportMaximum||this.options.maximum)/Math.pow(this.logarithmBase,2*Math.ceil(this.interval))):this.viewportMaximum=this.maximum=this.options.viewportMinimum||this.options.minimum);d=Math.pow(this.logarithmBase,Math.floor(Math.log(this.viewportMinimum)/(c*this.interval)+0.2)*this.interval);this.range=this.viewportMaximum/this.viewportMinimum;this.noTicks=a;if(!this.options.interval&&
this.range<Math.pow(this.logarithmBase,8>this.viewportMaximum||3>a?2:3)){for(c=Math.floor(this.viewportMinimum/b+0.5)*b;c<this.viewportMinimum;)c+=b;this.equidistantInterval=!1;this.intervalStartPosition=c;this.interval=b}else this.options.interval||(b=Math.ceil(this.interval),this.range>this.interval&&(this.interval=b,d=Math.pow(this.logarithmBase,Math.floor(Math.log(this.viewportMinimum)/(c*this.interval)+0.2)*this.interval))),this.equidistantInterval=!0,this.intervalStartPosition=d;if(!this.valueFormatString&&
(this.valueFormatString="#,##0.##",1>this.viewportMinimum)){c=Math.floor(Math.abs(Math.log(this.viewportMinimum)/Math.LN10))+2;if(isNaN(c)||!isFinite(c))c=2;if(2<c)for(b=0;b<c-2;b++)this.valueFormatString+="#"}};C.getNiceExponent=function(a,c){var b=Math.floor(Math.log(a)/Math.LN10),d=a/Math.pow(10,b),d=0>b?1>=d?1:5>=d?5:10:Math.max(Math.floor(d),1);return Number((d*Math.pow(10,b)).toFixed(20))};C.getNiceNumber=function(a,c){var b=Math.floor(Math.log(a)/Math.LN10),d=a/Math.pow(10,b);return Number(((c?
1.5>d?1:3>d?2:7>d?5:10:1>=d?1:2>=d?2:5>=d?5:10)*Math.pow(10,b)).toFixed(20))};C.prototype.getLabelStartPoint=function(){var a=I[this.intervalType+"Duration"]*this.interval,a=new Date(Math.floor(this.viewportMinimum/a)*a);if("millisecond"!==this.intervalType)if("second"===this.intervalType)0<a.getMilliseconds()&&(a.setSeconds(a.getSeconds()+1),a.setMilliseconds(0));else if("minute"===this.intervalType){if(0<a.getSeconds()||0<a.getMilliseconds())a.setMinutes(a.getMinutes()+1),a.setSeconds(0),a.setMilliseconds(0)}else if("hour"===
this.intervalType){if(0<a.getMinutes()||0<a.getSeconds()||0<a.getMilliseconds())a.setHours(a.getHours()+1),a.setMinutes(0),a.setSeconds(0),a.setMilliseconds(0)}else if("day"===this.intervalType){if(0<a.getHours()||0<a.getMinutes()||0<a.getSeconds()||0<a.getMilliseconds())a.setDate(a.getDate()+1),a.setHours(0),a.setMinutes(0),a.setSeconds(0),a.setMilliseconds(0)}else if("week"===this.intervalType){if(0<a.getDay()||0<a.getHours()||0<a.getMinutes()||0<a.getSeconds()||0<a.getMilliseconds())a.setDate(a.getDate()+
(7-a.getDay())),a.setHours(0),a.setMinutes(0),a.setSeconds(0),a.setMilliseconds(0)}else if("month"===this.intervalType){if(1<a.getDate()||0<a.getHours()||0<a.getMinutes()||0<a.getSeconds()||0<a.getMilliseconds())a.setMonth(a.getMonth()+1),a.setDate(1),a.setHours(0),a.setMinutes(0),a.setSeconds(0),a.setMilliseconds(0)}else"year"===this.intervalType&&(0<a.getMonth()||1<a.getDate()||0<a.getHours()||0<a.getMinutes()||0<a.getSeconds()||0<a.getMilliseconds())&&(a.setFullYear(a.getFullYear()+1),a.setMonth(0),
a.setDate(1),a.setHours(0),a.setMinutes(0),a.setSeconds(0),a.setMilliseconds(0));return a};T(na,L);na.prototype.createUserOptions=function(a){if("undefined"!==typeof a||this.options._isPlaceholder){var c=0;this.parent.options._isPlaceholder&&this.parent.createUserOptions();this.options._isPlaceholder||(qa(this.parent.stripLines),c=this.parent.options.stripLines.indexOf(this.options));this.options="undefined"===typeof a?{}:a;this.parent.options.stripLines[c]=this.options}};na.prototype.render=function(){this.ctx.save();
var a=this.parent.getPixelCoordinatesOnAxis(this.value),c=Math.abs("pixel"===this._thicknessType?this.thickness:this.parent.conversionParameters.pixelPerUnit*this.thickness);if(0<c){var b=null===this.opacity?1:this.opacity;this.ctx.strokeStyle=this.color;this.ctx.beginPath();var d=this.ctx.globalAlpha;this.ctx.globalAlpha=b;E(this.id);var f,g,k,h;this.ctx.lineWidth=c;this.ctx.setLineDash&&this.ctx.setLineDash(G(this.lineDashType,c));if("bottom"===this.parent._position||"top"===this.parent._position)f=
g=1===this.ctx.lineWidth%2?(a.x<<0)+0.5:a.x<<0,k=this.chart.plotArea.y1,h=this.chart.plotArea.y2,this.bounds={x1:f-c/2,y1:k,x2:g+c/2,y2:h};else if("left"===this.parent._position||"right"===this.parent._position)k=h=1===this.ctx.lineWidth%2?(a.y<<0)+0.5:a.y<<0,f=this.chart.plotArea.x1,g=this.chart.plotArea.x2,this.bounds={x1:f,y1:k-c/2,x2:g,y2:h+c/2};this.ctx.moveTo(f,k);this.ctx.lineTo(g,h);this.ctx.stroke();this.ctx.globalAlpha=d}this.ctx.restore()};T(R,L);R.prototype._initialize=function(){if(this.enabled){this.container=
document.createElement("div");this.container.setAttribute("class","canvasjs-chart-tooltip");this.container.style.position="absolute";this.container.style.height="auto";this.container.style.boxShadow="1px 1px 2px 2px rgba(0,0,0,0.1)";this.container.style.zIndex="1000";this.container.style.display="none";var a;a='<div style=" width: auto;height: auto;min-width: 50px;';a+="line-height: auto;";a+="margin: 0px 0px 0px 0px;";a+="padding: 5px;";a+="font-family: Calibri, Arial, Georgia, serif;";a+="font-weight: normal;";
a+="font-style: "+(u?"italic;":"normal;");a+="font-size: 14px;";a+="color: #000000;";a+="text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);";a+="text-align: left;";a+="border: 2px solid gray;";a+=u?"background: rgba(255,255,255,.9);":"background: rgb(255,255,255);";a+="text-indent: 0px;";a+="white-space: nowrap;";a+="border-radius: 5px;";a+="-moz-user-select:none;";a+="-khtml-user-select: none;";a+="-webkit-user-select: none;";a+="-ms-user-select: none;";a+="user-select: none;";u||(a+="filter: alpha(opacity = 90);",
a+="filter: progid:DXImageTransform.Microsoft.Shadow(Strength=3, Direction=135, Color='#666666');");a+='} "> Sample Tooltip</div>';this.container.innerHTML=a;this.contentDiv=this.container.firstChild;this.container.style.borderRadius=this.contentDiv.style.borderRadius;this.chart._canvasJSContainer.appendChild(this.container)}};R.prototype.mouseMoveHandler=function(a,c){this._lastUpdated&&40>(new Date).getTime()-this._lastUpdated||(this._lastUpdated=(new Date).getTime(),this._updateToolTip(a,c))};
R.prototype._updateToolTip=function(a,c,b){b="undefined"===typeof b?!0:b;this.container||this._initialize();this.enabled||this.hide();if(!this.chart.disableToolTip){if("undefined"===typeof a||"undefined"===typeof c){if(isNaN(this._prevX)||isNaN(this._prevY))return;a=this._prevX;c=this._prevY}else this._prevX=a,this._prevY=c;var d=null,f=null,g=[],k=0;if(this.shared&&this.enabled&&"none"!==this.chart.plotInfo.axisPlacement){if("xySwapped"===this.chart.plotInfo.axisPlacement){f=[];if(this.chart.axisX)for(var h=
0;h<this.chart.axisX.length;h++){for(var k=this.chart.axisX[h].convertPixelToValue({y:c}),l=null,d=0;d<this.chart.axisX[h].dataSeries.length;d++)(l=this.chart.axisX[h].dataSeries[d].getDataPointAtX(k,b))&&0<=l.index&&(l.dataSeries=this.chart.axisX[h].dataSeries[d],null!==l.dataPoint.y&&f.push(l));l=null}if(this.chart.axisX2)for(h=0;h<this.chart.axisX2.length;h++){k=this.chart.axisX2[h].convertPixelToValue({y:c});l=null;for(d=0;d<this.chart.axisX2[h].dataSeries.length;d++)(l=this.chart.axisX2[h].dataSeries[d].getDataPointAtX(k,
b))&&0<=l.index&&(l.dataSeries=this.chart.axisX2[h].dataSeries[d],null!==l.dataPoint.y&&f.push(l));l=null}}else{f=[];if(this.chart.axisX)for(h=0;h<this.chart.axisX.length;h++)for(k=this.chart.axisX[h].convertPixelToValue({x:a}),l=null,d=0;d<this.chart.axisX[h].dataSeries.length;d++)(l=this.chart.axisX[h].dataSeries[d].getDataPointAtX(k,b))&&0<=l.index&&(l.dataSeries=this.chart.axisX[h].dataSeries[d],null!==l.dataPoint.y&&f.push(l));if(this.chart.axisX2)for(h=0;h<this.chart.axisX2.length;h++)for(k=
this.chart.axisX2[h].convertPixelToValue({x:a}),l=null,d=0;d<this.chart.axisX2[h].dataSeries.length;d++)(l=this.chart.axisX2[h].dataSeries[d].getDataPointAtX(k,b))&&0<=l.index&&(l.dataSeries=this.chart.axisX2[h].dataSeries[d],null!==l.dataPoint.y&&f.push(l))}if(0===f.length)return;f.sort(function(a,b){return a.distance-b.distance});b=f[0];for(d=0;d<f.length;d++)f[d].dataPoint.x.valueOf()===b.dataPoint.x.valueOf()&&g.push(f[d]);f=null}else{if(l=this.chart.getDataPointAtXY(a,c,b))this.currentDataPointIndex=
l.dataPointIndex,this.currentSeriesIndex=l.dataSeries.index;else if(u)if(l=Ma(a,c,this.chart._eventManager.ghostCtx),0<l&&"undefined"!==typeof this.chart._eventManager.objectMap[l]){l=this.chart._eventManager.objectMap[l];if("legendItem"===l.objectType)return;this.currentSeriesIndex=l.dataSeriesIndex;this.currentDataPointIndex=0<=l.dataPointIndex?l.dataPointIndex:-1}else this.currentDataPointIndex=-1;else this.currentDataPointIndex=-1;if(0<=this.currentSeriesIndex){f=this.chart.data[this.currentSeriesIndex];
l={};if(0<=this.currentDataPointIndex)d=f.dataPoints[this.currentDataPointIndex],l.dataSeries=f,l.dataPoint=d,l.index=this.currentDataPointIndex,l.distance=Math.abs(d.x-k);else{if(!this.enabled||"line"!==f.type&&"stepLine"!==f.type&&"spline"!==f.type&&"area"!==f.type&&"stepArea"!==f.type&&"splineArea"!==f.type&&"stackedArea"!==f.type&&"stackedArea100"!==f.type&&"rangeArea"!==f.type&&"rangeSplineArea"!==f.type&&"candlestick"!==f.type&&"ohlc"!==f.type)return;k=f.axisX.convertPixelToValue({x:a});l=f.getDataPointAtX(k,
b);l.dataSeries=f;this.currentDataPointIndex=l.index;d=l.dataPoint}if(!x(l.dataPoint.y))if(l.dataSeries.axisY)if(0<l.dataPoint.y.length){for(d=b=0;d<l.dataPoint.y.length;d++)l.dataPoint.y[d]<l.dataSeries.axisY.viewportMinimum?b--:l.dataPoint.y[d]>l.dataSeries.axisY.viewportMaximum&&b++;b<l.dataPoint.y.length&&b>-l.dataPoint.y.length&&g.push(l)}else"column"===f.type||"bar"===f.type?0>l.dataPoint.y?0>l.dataSeries.axisY.viewportMinimum&&l.dataSeries.axisY.viewportMaximum>=l.dataPoint.y&&g.push(l):l.dataSeries.axisY.viewportMinimum<=
l.dataPoint.y&&0<=l.dataSeries.axisY.viewportMaximum&&g.push(l):"bubble"===f.type?(b=this.chart._eventManager.objectMap[f.dataPointIds[l.index]].size/2,l.dataPoint.y>=l.dataSeries.axisY.viewportMinimum-b&&l.dataPoint.y<=l.dataSeries.axisY.viewportMaximum+b&&g.push(l)):(0<=l.dataSeries.type.indexOf("100")||"stackedColumn"===f.type||"stackedBar"===f.type||l.dataPoint.y>=l.dataSeries.axisY.viewportMinimum&&l.dataPoint.y<=l.dataSeries.axisY.viewportMaximum)&&g.push(l);else g.push(l)}}if(0<g.length&&(this.highlightObjects(g),
this.enabled))if(b="",b=this.getToolTipInnerHTML({entries:g}),null!==b){this.contentDiv.innerHTML=b;this.contentDiv.innerHTML=b;b=!1;"none"===this.container.style.display&&(b=!0,this.container.style.display="block");try{this.contentDiv.style.background=this.backgroundColor?this.backgroundColor:u?"rgba(255,255,255,.9)":"rgb(255,255,255)",this.borderColor=this.contentDiv.style.borderRightColor=this.contentDiv.style.borderLeftColor=this.contentDiv.style.borderColor=this.options.borderColor?this.options.borderColor:
g[0].dataPoint.color?g[0].dataPoint.color:g[0].dataSeries.color?g[0].dataSeries.color:g[0].dataSeries._colorSet[g[0].index%g[0].dataSeries._colorSet.length],this.contentDiv.style.borderWidth=this.borderThickness||0===this.borderThickness?this.borderThickness+"px":"2px",this.contentDiv.style.borderRadius=this.cornerRadius||0===this.cornerRadius?this.cornerRadius+"px":"5px",this.container.style.borderRadius=this.contentDiv.style.borderRadius,this.contentDiv.style.fontSize=this.fontSize||0===this.fontSize?
this.fontSize+"px":"14px",this.contentDiv.style.color=this.fontColor?this.fontColor:"#000000",this.contentDiv.style.fontFamily=this.fontFamily?this.fontFamily:"Calibri, Arial, Georgia, serif;",this.contentDiv.style.fontWeight=this.fontWeight?this.fontWeight:"normal",this.contentDiv.style.fontStyle=this.fontStyle?this.fontStyle:u?"italic":"normal"}catch(m){}"pie"===g[0].dataSeries.type||"doughnut"===g[0].dataSeries.type||"funnel"===g[0].dataSeries.type||"bar"===g[0].dataSeries.type||"rangeBar"===g[0].dataSeries.type||
"stackedBar"===g[0].dataSeries.type||"stackedBar100"===g[0].dataSeries.type?a=a-10-this.container.clientWidth:(a=g[0].dataSeries.axisX.convertValueToPixel(g[0].dataPoint.x)-this.container.clientWidth<<0,a-=10);0>a&&(a+=this.container.clientWidth+20);a+this.container.clientWidth>Math.max(this.chart.container.clientWidth,this.chart.width)&&(a=Math.max(0,Math.max(this.chart.container.clientWidth,this.chart.width)-this.container.clientWidth));a+="px";c=1!==g.length||this.shared||"line"!==g[0].dataSeries.type&&
"stepLine"!==g[0].dataSeries.type&&"spline"!==g[0].dataSeries.type&&"area"!==g[0].dataSeries.type&&"stepArea"!==g[0].dataSeries.type&&"splineArea"!==g[0].dataSeries.type?"bar"===g[0].dataSeries.type||"rangeBar"===g[0].dataSeries.type||"stackedBar"===g[0].dataSeries.type||"stackedBar100"===g[0].dataSeries.type?g[0].dataSeries.axisX.convertValueToPixel(g[0].dataPoint.x):c:g[0].dataSeries.axisY.convertValueToPixel(g[0].dataPoint.y);c=-c+10;0<c+this.container.clientHeight+5&&(c-=c+this.container.clientHeight+
5-0);this.container.style.left=a;this.container.style.bottom=c+"px";!this.animationEnabled||b?this.disableAnimation():this.enableAnimation()}else this.hide(!1)}};R.prototype.highlightObjects=function(a){var c=this.chart.overlaidCanvasCtx;this.chart.resetOverlayedCanvas();c.clearRect(0,0,this.chart.width,this.chart.height);c.save();var b=this.chart.plotArea,d=0;c.beginPath();c.rect(b.x1,b.y1,b.x2-b.x1,b.y2-b.y1);c.clip();for(b=0;b<a.length;b++){var f=a[b];if((f=this.chart._eventManager.objectMap[f.dataSeries.dataPointIds[f.index]])&&
f.objectType&&"dataPoint"===f.objectType){var d=this.chart.data[f.dataSeriesIndex],g=d.dataPoints[f.dataPointIndex],k=f.dataPointIndex;!1===g.highlightEnabled||!0!==d.highlightEnabled&&!0!==g.highlightEnabled||("line"===d.type||"stepLine"===d.type||"spline"===d.type||"scatter"===d.type||"area"===d.type||"stepArea"===d.type||"splineArea"===d.type||"stackedArea"===d.type||"stackedArea100"===d.type||"rangeArea"===d.type||"rangeSplineArea"===d.type?(g=d.getMarkerProperties(k,f.x1,f.y1,this.chart.overlaidCanvasCtx),
g.size=Math.max(1.5*g.size<<0,10),g.borderColor=g.borderColor||"#FFFFFF",g.borderThickness=g.borderThickness||Math.ceil(0.1*g.size),P.drawMarkers([g]),"undefined"!==typeof f.y2&&(g=d.getMarkerProperties(k,f.x1,f.y2,this.chart.overlaidCanvasCtx),g.size=Math.max(1.5*g.size<<0,10),g.borderColor=g.borderColor||"#FFFFFF",g.borderThickness=g.borderThickness||Math.ceil(0.1*g.size),P.drawMarkers([g]))):"bubble"===d.type?(g=d.getMarkerProperties(k,f.x1,f.y1,this.chart.overlaidCanvasCtx),g.size=f.size,g.color=
"white",g.borderColor="white",c.globalAlpha=0.3,P.drawMarkers([g]),c.globalAlpha=1):"column"===d.type||"stackedColumn"===d.type||"stackedColumn100"===d.type||"bar"===d.type||"rangeBar"===d.type||"stackedBar"===d.type||"stackedBar100"===d.type||"rangeColumn"===d.type?M(c,f.x1,f.y1,f.x2,f.y2,"white",0,null,!1,!1,!1,!1,0.3):"pie"===d.type||"doughnut"===d.type?Ga(c,f.center,f.radius,"white",d.type,f.startAngle,f.endAngle,0.3,f.percentInnerRadius):"candlestick"===d.type?(c.globalAlpha=1,c.strokeStyle=
f.color,c.lineWidth=2*f.borderThickness,d=0===c.lineWidth%2?0:0.5,c.beginPath(),c.moveTo(f.x3-d,Math.min(f.y2,f.y3)),c.lineTo(f.x3-d,Math.min(f.y1,f.y4)),c.stroke(),c.beginPath(),c.moveTo(f.x3-d,Math.max(f.y1,f.y4)),c.lineTo(f.x3-d,Math.max(f.y2,f.y3)),c.stroke(),M(c,f.x1,Math.min(f.y1,f.y4),f.x2,Math.max(f.y1,f.y4),"transparent",2*f.borderThickness,f.color,!1,!1,!1,!1),c.globalAlpha=1):"ohlc"===d.type&&(c.globalAlpha=1,c.strokeStyle=f.color,c.lineWidth=2*f.borderThickness,d=0===c.lineWidth%2?0:0.5,
c.beginPath(),c.moveTo(f.x3-d,f.y2),c.lineTo(f.x3-d,f.y3),c.stroke(),c.beginPath(),c.moveTo(f.x3,f.y1),c.lineTo(f.x1,f.y1),c.stroke(),c.beginPath(),c.moveTo(f.x3,f.y4),c.lineTo(f.x2,f.y4),c.stroke(),c.globalAlpha=1))}}c.restore();c.globalAlpha=1;c.beginPath()};R.prototype.getToolTipInnerHTML=function(a){a=a.entries;for(var c=null,b=null,d=null,f=0,g="",k=!0,h=0;h<a.length;h++)if(a[h].dataSeries.toolTipContent||a[h].dataPoint.toolTipContent){k=!1;break}if(k&&(this.content&&"function"===typeof this.content||
this.contentFormatter))a={chart:this.chart,toolTip:this.options,entries:a},c=this.contentFormatter?this.contentFormatter(a):this.content(a);else if(this.shared&&"none"!==this.chart.plotInfo.axisPlacement){for(var l=null,m="",h=0;h<a.length;h++)if(b=a[h].dataSeries,d=a[h].dataPoint,f=a[h].index,g="",0===h&&(k&&!this.content)&&(this.chart.axisX&&0<this.chart.axisX.length?m+="undefined"!==typeof this.chart.axisX[0].labels[d.x]?this.chart.axisX[0].labels[d.x]:"{x}":this.chart.axisX2&&0<this.chart.axisX2.length&&
(m+="undefined"!==typeof this.chart.axisX2[0].labels[d.x]?this.chart.axisX2[0].labels[d.x]:"{x}"),m+="</br>",m=this.chart.replaceKeywordsWithValue(m,d,b,f)),null!==d.toolTipContent&&("undefined"!==typeof d.toolTipContent||null!==b.options.toolTipContent)){if("line"===b.type||"stepLine"===b.type||"spline"===b.type||"area"===b.type||"stepArea"===b.type||"splineArea"===b.type||"column"===b.type||"bar"===b.type||"scatter"===b.type||"stackedColumn"===b.type||"stackedColumn100"===b.type||"stackedBar"===
b.type||"stackedBar100"===b.type||"stackedArea"===b.type||"stackedArea100"===b.type)this.chart.axisX&&1<this.chart.axisX.length&&(g+=l!=b.axisXIndex?b.axisX.title?b.axisX.title+"<br/>":"X:{axisXIndex}<br/>":""),g+=d.toolTipContent?d.toolTipContent:b.toolTipContent?b.toolTipContent:this.content&&"function"!==typeof this.content?this.content:"<span style='\""+(this.options.fontColor?"":"'color:{color};'")+"\"'>{name}:</span>&nbsp;&nbsp;{y}",l=b.axisXIndex;else if("bubble"===b.type)this.chart.axisX&&
1<this.chart.axisX.length&&(g+=l!=b.axisXIndex?b.axisX.title?b.axisX.title+"<br/>":"X:{axisXIndex}<br/>":""),g+=d.toolTipContent?d.toolTipContent:b.toolTipContent?b.toolTipContent:this.content&&"function"!==typeof this.content?this.content:"<span style='\""+(this.options.fontColor?"":"'color:{color};'")+"\"'>{name}:</span>&nbsp;&nbsp;{y}, &nbsp;&nbsp;{z}";else if("rangeColumn"===b.type||"rangeBar"===b.type||"rangeArea"===b.type||"rangeSplineArea"===b.type)this.chart.axisX&&1<this.chart.axisX.length&&
(g+=l!=b.axisXIndex?b.axisX.title?b.axisX.title+"<br/>":"X:{axisXIndex}<br/>":""),g+=d.toolTipContent?d.toolTipContent:b.toolTipContent?b.toolTipContent:this.content&&"function"!==typeof this.content?this.content:"<span style='\""+(this.options.fontColor?"":"'color:{color};'")+"\"'>{name}:</span>&nbsp;&nbsp;{y[0]},&nbsp;{y[1]}";else if("candlestick"===b.type||"ohlc"===b.type)this.chart.axisX&&1<this.chart.axisX.length&&(g+=l!=b.axisXIndex?b.axisX.title?b.axisX.title+"<br/>":"X:{axisXIndex}<br/>":
""),g+=d.toolTipContent?d.toolTipContent:b.toolTipContent?b.toolTipContent:this.content&&"function"!==typeof this.content?this.content:"<span style='\""+(this.options.fontColor?"":"'color:{color};'")+"\"'>{name}:</span><br/>Open: &nbsp;&nbsp;{y[0]}<br/>High: &nbsp;&nbsp;&nbsp;{y[1]}<br/>Low:&nbsp;&nbsp;&nbsp;{y[2]}<br/>Close: &nbsp;&nbsp;{y[3]}";null===c&&(c="");!0===this.reversed?(c=this.chart.replaceKeywordsWithValue(g,d,b,f)+c,h<a.length-1&&(c="</br>"+c)):(c+=this.chart.replaceKeywordsWithValue(g,
d,b,f),h<a.length-1&&(c+="</br>"))}null!==c&&(c=m+c)}else{b=a[0].dataSeries;d=a[0].dataPoint;f=a[0].index;if(null===d.toolTipContent||"undefined"===typeof d.toolTipContent&&null===b.options.toolTipContent)return null;if("line"===b.type||"stepLine"===b.type||"spline"===b.type||"area"===b.type||"stepArea"===b.type||"splineArea"===b.type||"column"===b.type||"bar"===b.type||"scatter"===b.type||"stackedColumn"===b.type||"stackedColumn100"===b.type||"stackedBar"===b.type||"stackedBar100"===b.type||"stackedArea"===
b.type||"stackedArea100"===b.type)g=d.toolTipContent?d.toolTipContent:b.toolTipContent?b.toolTipContent:this.content&&"function"!==typeof this.content?this.content:"<span style='\""+(this.options.fontColor?"":"'color:{color};'")+"\"'>"+(d.label?"{label}":"{x}")+":</span>&nbsp;&nbsp;{y}";else if("bubble"===b.type)g=d.toolTipContent?d.toolTipContent:b.toolTipContent?b.toolTipContent:this.content&&"function"!==typeof this.content?this.content:"<span style='\""+(this.options.fontColor?"":"'color:{color};'")+
"\"'>"+(d.label?"{label}":"{x}")+":</span>&nbsp;&nbsp;{y}, &nbsp;&nbsp;{z}";else if("pie"===b.type||"doughnut"===b.type||"funnel"===b.type)g=d.toolTipContent?d.toolTipContent:b.toolTipContent?b.toolTipContent:this.content&&"function"!==typeof this.content?this.content:"<span style='\""+(this.options.fontColor?"":"'color:{color};'")+"\"'>"+(d.name?"{name}:</span>&nbsp;&nbsp;":d.label?"{label}:</span>&nbsp;&nbsp;":"</span>")+"{y}";else if("rangeColumn"===b.type||"rangeBar"===b.type||"rangeArea"===b.type||
"rangeSplineArea"===b.type)g=d.toolTipContent?d.toolTipContent:b.toolTipContent?b.toolTipContent:this.content&&"function"!==typeof this.content?this.content:"<span style='\""+(this.options.fontColor?"":"'color:{color};'")+"\"'>"+(d.label?"{label}":"{x}")+" :</span>&nbsp;&nbsp;{y[0]}, &nbsp;{y[1]}";else if("candlestick"===b.type||"ohlc"===b.type)g=d.toolTipContent?d.toolTipContent:b.toolTipContent?b.toolTipContent:this.content&&"function"!==typeof this.content?this.content:"<span style='\""+(this.options.fontColor?
"":"'color:{color};'")+"\"'>"+(d.label?"{label}":"{x}")+"</span><br/>Open: &nbsp;&nbsp;{y[0]}<br/>High: &nbsp;&nbsp;&nbsp;{y[1]}<br/>Low: &nbsp;&nbsp;&nbsp;&nbsp;{y[2]}<br/>Close: &nbsp;&nbsp;{y[3]}";null===c&&(c="");c+=this.chart.replaceKeywordsWithValue(g,d,b,f)}return c};R.prototype.enableAnimation=function(){this.container.style.WebkitTransition||(this.container.style.WebkitTransition="left .2s ease-out, bottom .2s ease-out",this.container.style.MozTransition="left .2s ease-out, bottom .2s ease-out",
this.container.style.MsTransition="left .2s ease-out, bottom .2s ease-out",this.container.style.transition="left .2s ease-out, bottom .2s ease-out")};R.prototype.disableAnimation=function(){this.container.style.WebkitTransition&&(this.container.style.WebkitTransition="",this.container.style.MozTransition="",this.container.style.MsTransition="",this.container.style.transition="")};R.prototype.hide=function(a){this.container&&(this.container.style.display="none",this.currentSeriesIndex=-1,this._prevY=
this._prevX=NaN,("undefined"===typeof a||a)&&this.chart.resetOverlayedCanvas())};R.prototype.show=function(a,c,b){this._updateToolTip(a,c,"undefined"===typeof b?!1:b)};A.prototype.getPercentAndTotal=function(a,c){var b=null,d=null,f=null;if(0<=a.type.indexOf("stacked"))d=0,b=c.x.getTime?c.x.getTime():c.x,b in a.plotUnit.yTotals&&(d=a.plotUnit.yTotals[b],f=isNaN(c.y)?0:0===d?0:100*(c.y/d));else if("pie"===a.type||"doughnut"===a.type){for(i=d=0;i<a.dataPoints.length;i++)isNaN(a.dataPoints[i].y)||(d+=
a.dataPoints[i].y);f=isNaN(c.y)?0:100*(c.y/d)}return{percent:f,total:d}};A.prototype.replaceKeywordsWithValue=function(a,c,b,d,f){var g=this;f="undefined"===typeof f?0:f;if((0<=b.type.indexOf("stacked")||"pie"===b.type||"doughnut"===b.type)&&(0<=a.indexOf("#percent")||0<=a.indexOf("#total"))){var k="#percent",h="#total",l=this.getPercentAndTotal(b,c),h=isNaN(l.total)?h:l.total,k=isNaN(l.percent)?k:l.percent;do{l="";if(b.percentFormatString)l=b.percentFormatString;else{var l="#,##0.",m=Math.max(Math.ceil(Math.log(1/
Math.abs(k))/Math.LN10),2);if(isNaN(m)||!isFinite(m))m=2;for(var p=0;p<m;p++)l+="#";b.percentFormatString=l}a=a.replace("#percent",ba(k,l,g._cultureInfo));a=a.replace("#total",ba(h,b.yValueFormatString?b.yValueFormatString:"#,##0.########",g._cultureInfo))}while(0<=a.indexOf("#percent")||0<=a.indexOf("#total"))}return a.replace(/\{.*?\}|"[^"]*"|'[^']*'/g,function(a){if('"'===a[0]&&'"'===a[a.length-1]||"'"===a[0]&&"'"===a[a.length-1])return a.slice(1,a.length-1);a=ka(a.slice(1,a.length-1));a=a.replace("#index",
f);var e=null;try{var h=a.match(/(.*?)\s*\[\s*(.*?)\s*\]/);h&&0<h.length&&(e=ka(h[2]),a=ka(h[1]))}catch(k){}h=null;if("color"===a)return c.color?c.color:b.color?b.color:b._colorSet[d%b._colorSet.length];if(c.hasOwnProperty(a))h=c;else if(b.hasOwnProperty(a))h=b;else return"";h=h[a];null!==e&&(h=h[e]);if("x"===a)if("dateTime"===g.plotInfo.axisXValueType||"dateTime"===b.xValueType||c.x&&c.x.getTime){if(g.plotInfo.plotTypes[0].plotUnits[0].axisX&&!g.plotInfo.plotTypes[0].plotUnits[0].axisX.logarithmic)return Ea(h,
c.xValueFormatString?c.xValueFormatString:b.xValueFormatString?b.xValueFormatString:b.xValueFormatString=g.axisX&&g.axisX.autoValueFormatString?g.axisX.autoValueFormatString:"DD MMM YY",g._cultureInfo)}else return ba(h,c.xValueFormatString?c.xValueFormatString:b.xValueFormatString?b.xValueFormatString:b.xValueFormatString="#,##0.########",g._cultureInfo);else return"y"===a?ba(h,c.yValueFormatString?c.yValueFormatString:b.yValueFormatString?b.yValueFormatString:b.yValueFormatString="#,##0.########",
g._cultureInfo):"z"===a?ba(h,c.zValueFormatString?c.zValueFormatString:b.zValueFormatString?b.zValueFormatString:b.zValueFormatString="#,##0.########",g._cultureInfo):h})};la.prototype.reset=function(){this.lastObjectId=0;this.objectMap=[];this.rectangularRegionEventSubscriptions=[];this.previousDataPointEventObject=null;this.eventObjects=[];u&&(this.ghostCtx.clearRect(0,0,this.chart.width,this.chart.height),this.ghostCtx.beginPath())};la.prototype.getNewObjectTrackingId=function(){return++this.lastObjectId};
la.prototype.mouseEventHandler=function(a){if("mousemove"===a.type||"click"===a.type){var c=[],b=xa(a),d=null;if((d=this.chart.getObjectAtXY(b.x,b.y,!1))&&"undefined"!==typeof this.objectMap[d])if(d=this.objectMap[d],"dataPoint"===d.objectType){var f=this.chart.data[d.dataSeriesIndex],g=f.dataPoints[d.dataPointIndex],k=d.dataPointIndex;d.eventParameter={x:b.x,y:b.y,dataPoint:g,dataSeries:f.options,dataPointIndex:k,dataSeriesIndex:f.index,chart:this.chart};d.eventContext={context:g,userContext:g,mouseover:"mouseover",
mousemove:"mousemove",mouseout:"mouseout",click:"click"};c.push(d);d=this.objectMap[f.id];d.eventParameter={x:b.x,y:b.y,dataPoint:g,dataSeries:f.options,dataPointIndex:k,dataSeriesIndex:f.index,chart:this.chart};d.eventContext={context:f,userContext:f.options,mouseover:"mouseover",mousemove:"mousemove",mouseout:"mouseout",click:"click"};c.push(this.objectMap[f.id])}else"legendItem"===d.objectType&&(f=this.chart.data[d.dataSeriesIndex],g=null!==d.dataPointIndex?f.dataPoints[d.dataPointIndex]:null,
d.eventParameter={x:b.x,y:b.y,dataSeries:f.options,dataPoint:g,dataPointIndex:d.dataPointIndex,dataSeriesIndex:d.dataSeriesIndex,chart:this.chart},d.eventContext={context:this.chart.legend,userContext:this.chart.legend.options,mouseover:"itemmouseover",mousemove:"itemmousemove",mouseout:"itemmouseout",click:"itemclick"},c.push(d));f=[];for(b=0;b<this.mouseoveredObjectMaps.length;b++){g=!0;for(d=0;d<c.length;d++)if(c[d].id===this.mouseoveredObjectMaps[b].id){g=!1;break}g?this.fireEvent(this.mouseoveredObjectMaps[b],
"mouseout",a):f.push(this.mouseoveredObjectMaps[b])}this.mouseoveredObjectMaps=f;for(b=0;b<c.length;b++){f=!1;for(d=0;d<this.mouseoveredObjectMaps.length;d++)if(c[b].id===this.mouseoveredObjectMaps[d].id){f=!0;break}f||(this.fireEvent(c[b],"mouseover",a),this.mouseoveredObjectMaps.push(c[b]));"click"===a.type?this.fireEvent(c[b],"click",a):"mousemove"===a.type&&this.fireEvent(c[b],"mousemove",a)}}};la.prototype.fireEvent=function(a,c,b){if(a&&c){var d=a.eventParameter,f=a.eventContext,g=a.eventContext.userContext;
g&&(f&&g[f[c]])&&g[f[c]].call(g,d);"mouseout"!==c?g.cursor&&g.cursor!==b.target.style.cursor&&(b.target.style.cursor=g.cursor):(b.target.style.cursor=this.chart._defaultCursor,delete a.eventParameter,delete a.eventContext);"click"===c&&("dataPoint"===a.objectType&&this.chart.pieDoughnutClickHandler)&&this.chart.pieDoughnutClickHandler.call(this.chart.data[a.dataSeriesIndex],d)}};T(oa,L);Da.prototype.animate=function(a,c,b,d,f){var g=this;this.chart.isAnimating=!0;f=f||F.easing.linear;b&&this.animations.push({startTime:(new Date).getTime()+
(a?a:0),duration:c,animationCallback:b,onComplete:d});for(a=[];0<this.animations.length;)if(c=this.animations.shift(),b=(new Date).getTime(),d=0,c.startTime<=b&&(d=f(Math.min(b-c.startTime,c.duration),0,1,c.duration),d=Math.min(d,1),isNaN(d)||!isFinite(d))&&(d=1),1>d&&a.push(c),c.animationCallback(d),1<=d&&c.onComplete)c.onComplete();this.animations=a;0<this.animations.length?this.animationRequestId=this.chart.requestAnimFrame.call(window,function(){g.animate.call(g)}):this.chart.isAnimating=!1};
Da.prototype.cancelAllAnimations=function(){this.animations=[];this.animationRequestId&&this.chart.cancelRequestAnimFrame.call(window,this.animationRequestId);this.animationRequestId=null;this.chart.isAnimating=!1};var F={yScaleAnimation:function(a,c){if(0!==a){var b=c.dest,d=c.source.canvas,f=c.animationBase;b.drawImage(d,0,0,d.width,d.height,0,f-f*a,b.canvas.width/Q,a*b.canvas.height/Q)}},xScaleAnimation:function(a,c){if(0!==a){var b=c.dest,d=c.source.canvas,f=c.animationBase;b.drawImage(d,0,0,
d.width,d.height,f-f*a,0,a*b.canvas.width/Q,b.canvas.height/Q)}},xClipAnimation:function(a,c){if(0!==a){var b=c.dest,d=c.source.canvas;b.save();0<a&&b.drawImage(d,0,0,d.width*a,d.height,0,0,d.width*a/Q,d.height/Q);b.restore()}},fadeInAnimation:function(a,c){if(0!==a){var b=c.dest,d=c.source.canvas;b.save();b.globalAlpha=a;b.drawImage(d,0,0,d.width,d.height,0,0,b.canvas.width/Q,b.canvas.height/Q);b.restore()}},easing:{linear:function(a,c,b,d){return b*a/d+c},easeOutQuad:function(a,c,b,d){return-b*
(a/=d)*(a-2)+c},easeOutQuart:function(a,c,b,d){return-b*((a=a/d-1)*a*a*a-1)+c},easeInQuad:function(a,c,b,d){return b*(a/=d)*a+c},easeInQuart:function(a,c,b,d){return b*(a/=d)*a*a*a+c}}},P={drawMarker:function(a,c,b,d,f,g,k,h){if(b){var l=1;b.fillStyle=g?g:"#000000";b.strokeStyle=k?k:"#000000";b.lineWidth=h?h:0;"circle"===d?(b.moveTo(a,c),b.beginPath(),b.arc(a,c,f/2,0,2*Math.PI,!1),g&&b.fill(),h&&(k?b.stroke():(l=b.globalAlpha,b.globalAlpha=0.15,b.strokeStyle="black",b.stroke(),b.globalAlpha=l))):
"square"===d?(b.beginPath(),b.rect(a-f/2,c-f/2,f,f),g&&b.fill(),h&&(k?b.stroke():(l=b.globalAlpha,b.globalAlpha=0.15,b.strokeStyle="black",b.stroke(),b.globalAlpha=l))):"triangle"===d?(b.beginPath(),b.moveTo(a-f/2,c+f/2),b.lineTo(a+f/2,c+f/2),b.lineTo(a,c-f/2),b.closePath(),g&&b.fill(),h&&(k?b.stroke():(l=b.globalAlpha,b.globalAlpha=0.15,b.strokeStyle="black",b.stroke(),b.globalAlpha=l)),b.beginPath()):"cross"===d&&(b.strokeStyle=g,b.lineWidth=f/4,b.beginPath(),b.moveTo(a-f/2,c-f/2),b.lineTo(a+f/
2,c+f/2),b.stroke(),b.moveTo(a+f/2,c-f/2),b.lineTo(a-f/2,c+f/2),b.stroke())}},drawMarkers:function(a){for(var c=0;c<a.length;c++){var b=a[c];P.drawMarker(b.x,b.y,b.ctx,b.type,b.size,b.color,b.borderColor,b.borderThickness)}}},ja={Chart:A,addColorSet:function(a,c){fa[a]=c},addCultureInfo:function(a,c){pa[a]=c},formatNumber:function(a,c,b){b=b||"en";if(pa[b])return ba(a,c||"#,##0.##",new oa(b));throw"Unknown Culture Name";},formatDate:function(a,c,b){b=b||"en";if(pa[b])return Ea(a,c||"DD MMM YYYY",
new oa(b));throw"Unknown Culture Name";}};ja.Chart.version="v1.9.8.1 GA";window.CanvasJS=ja})();
/*
  excanvas is used to support IE678 which do not implement HTML5 Canvas Element. You can safely remove the following excanvas code if you don't need to support older browsers.

  Copyright 2006 Google Inc. https://code.google.com/p/explorercanvas/
  Licensed under the Apache License, Version 2.0
*/
document.createElement("canvas").getContext||function(){function V(){return this.context_||(this.context_=new C(this))}function W(a,b,c){var g=M.call(arguments,2);return function(){return a.apply(b,g.concat(M.call(arguments)))}}function N(a){return String(a).replace(/&/g,"&amp;").replace(/"/g,"&quot;")}function O(a){a.namespaces.g_vml_||a.namespaces.add("g_vml_","urn:schemas-microsoft-com:vml","#default#VML");a.namespaces.g_o_||a.namespaces.add("g_o_","urn:schemas-microsoft-com:office:office","#default#VML");
a.styleSheets.ex_canvas_||(a=a.createStyleSheet(),a.owningElement.id="ex_canvas_",a.cssText="canvas{display:inline-block;overflow:hidden;text-align:left;width:300px;height:150px}")}function X(a){var b=a.srcElement;switch(a.propertyName){case "width":b.getContext().clearRect();b.style.width=b.attributes.width.nodeValue+"px";b.firstChild.style.width=b.clientWidth+"px";break;case "height":b.getContext().clearRect(),b.style.height=b.attributes.height.nodeValue+"px",b.firstChild.style.height=b.clientHeight+
"px"}}function Y(a){a=a.srcElement;a.firstChild&&(a.firstChild.style.width=a.clientWidth+"px",a.firstChild.style.height=a.clientHeight+"px")}function D(){return[[1,0,0],[0,1,0],[0,0,1]]}function t(a,b){for(var c=D(),g=0;3>g;g++)for(var e=0;3>e;e++){for(var f=0,d=0;3>d;d++)f+=a[g][d]*b[d][e];c[g][e]=f}return c}function P(a,b){b.fillStyle=a.fillStyle;b.lineCap=a.lineCap;b.lineJoin=a.lineJoin;b.lineWidth=a.lineWidth;b.miterLimit=a.miterLimit;b.shadowBlur=a.shadowBlur;b.shadowColor=a.shadowColor;b.shadowOffsetX=
a.shadowOffsetX;b.shadowOffsetY=a.shadowOffsetY;b.strokeStyle=a.strokeStyle;b.globalAlpha=a.globalAlpha;b.font=a.font;b.textAlign=a.textAlign;b.textBaseline=a.textBaseline;b.arcScaleX_=a.arcScaleX_;b.arcScaleY_=a.arcScaleY_;b.lineScale_=a.lineScale_}function Q(a){var b=a.indexOf("(",3),c=a.indexOf(")",b+1),b=a.substring(b+1,c).split(",");if(4!=b.length||"a"!=a.charAt(3))b[3]=1;return b}function E(a,b,c){return Math.min(c,Math.max(b,a))}function F(a,b,c){0>c&&c++;1<c&&c--;return 1>6*c?a+6*(b-a)*c:
1>2*c?b:2>3*c?a+6*(b-a)*(2/3-c):a}function G(a){if(a in H)return H[a];var b,c=1;a=String(a);if("#"==a.charAt(0))b=a;else if(/^rgb/.test(a)){c=Q(a);b="#";for(var g,e=0;3>e;e++)g=-1!=c[e].indexOf("%")?Math.floor(255*(parseFloat(c[e])/100)):+c[e],b+=v[E(g,0,255)];c=+c[3]}else if(/^hsl/.test(a)){e=c=Q(a);b=parseFloat(e[0])/360%360;0>b&&b++;g=E(parseFloat(e[1])/100,0,1);e=E(parseFloat(e[2])/100,0,1);if(0==g)g=e=b=e;else{var f=0.5>e?e*(1+g):e+g-e*g,d=2*e-f;g=F(d,f,b+1/3);e=F(d,f,b);b=F(d,f,b-1/3)}b="#"+
v[Math.floor(255*g)]+v[Math.floor(255*e)]+v[Math.floor(255*b)];c=c[3]}else b=Z[a]||a;return H[a]={color:b,alpha:c}}function C(a){this.m_=D();this.mStack_=[];this.aStack_=[];this.currentPath_=[];this.fillStyle=this.strokeStyle="#000";this.lineWidth=1;this.lineJoin="miter";this.lineCap="butt";this.miterLimit=1*q;this.globalAlpha=1;this.font="10px sans-serif";this.textAlign="left";this.textBaseline="alphabetic";this.canvas=a;var b="width:"+a.clientWidth+"px;height:"+a.clientHeight+"px;overflow:hidden;position:absolute",
c=a.ownerDocument.createElement("div");c.style.cssText=b;a.appendChild(c);b=c.cloneNode(!1);b.style.backgroundColor="red";b.style.filter="alpha(opacity=0)";a.appendChild(b);this.element_=c;this.lineScale_=this.arcScaleY_=this.arcScaleX_=1}function R(a,b,c,g){a.currentPath_.push({type:"bezierCurveTo",cp1x:b.x,cp1y:b.y,cp2x:c.x,cp2y:c.y,x:g.x,y:g.y});a.currentX_=g.x;a.currentY_=g.y}function S(a,b){var c=G(a.strokeStyle),g=c.color,c=c.alpha*a.globalAlpha,e=a.lineScale_*a.lineWidth;1>e&&(c*=e);b.push("<g_vml_:stroke",
' opacity="',c,'"',' joinstyle="',a.lineJoin,'"',' miterlimit="',a.miterLimit,'"',' endcap="',$[a.lineCap]||"square",'"',' weight="',e,'px"',' color="',g,'" />')}function T(a,b,c,g){var e=a.fillStyle,f=a.arcScaleX_,d=a.arcScaleY_,k=g.x-c.x,n=g.y-c.y;if(e instanceof w){var h=0,l=g=0,u=0,m=1;if("gradient"==e.type_){h=e.x1_/f;c=e.y1_/d;var p=s(a,e.x0_/f,e.y0_/d),h=s(a,h,c),h=180*Math.atan2(h.x-p.x,h.y-p.y)/Math.PI;0>h&&(h+=360);1E-6>h&&(h=0)}else p=s(a,e.x0_,e.y0_),g=(p.x-c.x)/k,l=(p.y-c.y)/n,k/=f*q,
n/=d*q,m=x.max(k,n),u=2*e.r0_/m,m=2*e.r1_/m-u;f=e.colors_;f.sort(function(a,b){return a.offset-b.offset});d=f.length;p=f[0].color;c=f[d-1].color;k=f[0].alpha*a.globalAlpha;a=f[d-1].alpha*a.globalAlpha;for(var n=[],r=0;r<d;r++){var t=f[r];n.push(t.offset*m+u+" "+t.color)}b.push('<g_vml_:fill type="',e.type_,'"',' method="none" focus="100%"',' color="',p,'"',' color2="',c,'"',' colors="',n.join(","),'"',' opacity="',a,'"',' g_o_:opacity2="',k,'"',' angle="',h,'"',' focusposition="',g,",",l,'" />')}else e instanceof
I?k&&n&&b.push("<g_vml_:fill",' position="',-c.x/k*f*f,",",-c.y/n*d*d,'"',' type="tile"',' src="',e.src_,'" />'):(e=G(a.fillStyle),b.push('<g_vml_:fill color="',e.color,'" opacity="',e.alpha*a.globalAlpha,'" />'))}function s(a,b,c){a=a.m_;return{x:q*(b*a[0][0]+c*a[1][0]+a[2][0])-r,y:q*(b*a[0][1]+c*a[1][1]+a[2][1])-r}}function z(a,b,c){isFinite(b[0][0])&&(isFinite(b[0][1])&&isFinite(b[1][0])&&isFinite(b[1][1])&&isFinite(b[2][0])&&isFinite(b[2][1]))&&(a.m_=b,c&&(a.lineScale_=aa(ba(b[0][0]*b[1][1]-b[0][1]*
b[1][0]))))}function w(a){this.type_=a;this.r1_=this.y1_=this.x1_=this.r0_=this.y0_=this.x0_=0;this.colors_=[]}function I(a,b){if(!a||1!=a.nodeType||"IMG"!=a.tagName)throw new A("TYPE_MISMATCH_ERR");if("complete"!=a.readyState)throw new A("INVALID_STATE_ERR");switch(b){case "repeat":case null:case "":this.repetition_="repeat";break;case "repeat-x":case "repeat-y":case "no-repeat":this.repetition_=b;break;default:throw new A("SYNTAX_ERR");}this.src_=a.src;this.width_=a.width;this.height_=a.height}
function A(a){this.code=this[a];this.message=a+": DOM Exception "+this.code}var x=Math,k=x.round,J=x.sin,K=x.cos,ba=x.abs,aa=x.sqrt,q=10,r=q/2;navigator.userAgent.match(/MSIE ([\d.]+)?/);var M=Array.prototype.slice;O(document);var U={init:function(a){a=a||document;a.createElement("canvas");a.attachEvent("onreadystatechange",W(this.init_,this,a))},init_:function(a){a=a.getElementsByTagName("canvas");for(var b=0;b<a.length;b++)this.initElement(a[b])},initElement:function(a){if(!a.getContext){a.getContext=
V;O(a.ownerDocument);a.innerHTML="";a.attachEvent("onpropertychange",X);a.attachEvent("onresize",Y);var b=a.attributes;b.width&&b.width.specified?a.style.width=b.width.nodeValue+"px":a.width=a.clientWidth;b.height&&b.height.specified?a.style.height=b.height.nodeValue+"px":a.height=a.clientHeight}return a}};U.init();for(var v=[],d=0;16>d;d++)for(var B=0;16>B;B++)v[16*d+B]=d.toString(16)+B.toString(16);var Z={aliceblue:"#F0F8FF",antiquewhite:"#FAEBD7",aquamarine:"#7FFFD4",azure:"#F0FFFF",beige:"#F5F5DC",
bisque:"#FFE4C4",black:"#000000",blanchedalmond:"#FFEBCD",blueviolet:"#8A2BE2",brown:"#A52A2A",burlywood:"#DEB887",cadetblue:"#5F9EA0",chartreuse:"#7FFF00",chocolate:"#D2691E",coral:"#FF7F50",cornflowerblue:"#6495ED",cornsilk:"#FFF8DC",crimson:"#DC143C",cyan:"#00FFFF",darkblue:"#00008B",darkcyan:"#008B8B",darkgoldenrod:"#B8860B",darkgray:"#A9A9A9",darkgreen:"#006400",darkgrey:"#A9A9A9",darkkhaki:"#BDB76B",darkmagenta:"#8B008B",darkolivegreen:"#556B2F",darkorange:"#FF8C00",darkorchid:"#9932CC",darkred:"#8B0000",
darksalmon:"#E9967A",darkseagreen:"#8FBC8F",darkslateblue:"#483D8B",darkslategray:"#2F4F4F",darkslategrey:"#2F4F4F",darkturquoise:"#00CED1",darkviolet:"#9400D3",deeppink:"#FF1493",deepskyblue:"#00BFFF",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1E90FF",firebrick:"#B22222",floralwhite:"#FFFAF0",forestgreen:"#228B22",gainsboro:"#DCDCDC",ghostwhite:"#F8F8FF",gold:"#FFD700",goldenrod:"#DAA520",grey:"#808080",greenyellow:"#ADFF2F",honeydew:"#F0FFF0",hotpink:"#FF69B4",indianred:"#CD5C5C",indigo:"#4B0082",
ivory:"#FFFFF0",khaki:"#F0E68C",lavender:"#E6E6FA",lavenderblush:"#FFF0F5",lawngreen:"#7CFC00",lemonchiffon:"#FFFACD",lightblue:"#ADD8E6",lightcoral:"#F08080",lightcyan:"#E0FFFF",lightgoldenrodyellow:"#FAFAD2",lightgreen:"#90EE90",lightgrey:"#D3D3D3",lightpink:"#FFB6C1",lightsalmon:"#FFA07A",lightseagreen:"#20B2AA",lightskyblue:"#87CEFA",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#B0C4DE",lightyellow:"#FFFFE0",limegreen:"#32CD32",linen:"#FAF0E6",magenta:"#FF00FF",mediumaquamarine:"#66CDAA",
mediumblue:"#0000CD",mediumorchid:"#BA55D3",mediumpurple:"#9370DB",mediumseagreen:"#3CB371",mediumslateblue:"#7B68EE",mediumspringgreen:"#00FA9A",mediumturquoise:"#48D1CC",mediumvioletred:"#C71585",midnightblue:"#191970",mintcream:"#F5FFFA",mistyrose:"#FFE4E1",moccasin:"#FFE4B5",navajowhite:"#FFDEAD",oldlace:"#FDF5E6",olivedrab:"#6B8E23",orange:"#FFA500",orangered:"#FF4500",orchid:"#DA70D6",palegoldenrod:"#EEE8AA",palegreen:"#98FB98",paleturquoise:"#AFEEEE",palevioletred:"#DB7093",papayawhip:"#FFEFD5",
peachpuff:"#FFDAB9",peru:"#CD853F",pink:"#FFC0CB",plum:"#DDA0DD",powderblue:"#B0E0E6",rosybrown:"#BC8F8F",royalblue:"#4169E1",saddlebrown:"#8B4513",salmon:"#FA8072",sandybrown:"#F4A460",seagreen:"#2E8B57",seashell:"#FFF5EE",sienna:"#A0522D",skyblue:"#87CEEB",slateblue:"#6A5ACD",slategray:"#708090",slategrey:"#708090",snow:"#FFFAFA",springgreen:"#00FF7F",steelblue:"#4682B4",tan:"#D2B48C",thistle:"#D8BFD8",tomato:"#FF6347",turquoise:"#40E0D0",violet:"#EE82EE",wheat:"#F5DEB3",whitesmoke:"#F5F5F5",yellowgreen:"#9ACD32"},
H={},L={},$={butt:"flat",round:"round"},d=C.prototype;d.clearRect=function(){this.textMeasureEl_&&(this.textMeasureEl_.removeNode(!0),this.textMeasureEl_=null);this.element_.innerHTML=""};d.beginPath=function(){this.currentPath_=[]};d.moveTo=function(a,b){var c=s(this,a,b);this.currentPath_.push({type:"moveTo",x:c.x,y:c.y});this.currentX_=c.x;this.currentY_=c.y};d.lineTo=function(a,b){var c=s(this,a,b);this.currentPath_.push({type:"lineTo",x:c.x,y:c.y});this.currentX_=c.x;this.currentY_=c.y};d.bezierCurveTo=
function(a,b,c,g,e,f){e=s(this,e,f);a=s(this,a,b);c=s(this,c,g);R(this,a,c,e)};d.quadraticCurveTo=function(a,b,c,g){a=s(this,a,b);c=s(this,c,g);g={x:this.currentX_+2/3*(a.x-this.currentX_),y:this.currentY_+2/3*(a.y-this.currentY_)};R(this,g,{x:g.x+(c.x-this.currentX_)/3,y:g.y+(c.y-this.currentY_)/3},c)};d.arc=function(a,b,c,g,e,f){c*=q;var d=f?"at":"wa",k=a+K(g)*c-r,n=b+J(g)*c-r;g=a+K(e)*c-r;e=b+J(e)*c-r;k!=g||f||(k+=0.125);a=s(this,a,b);k=s(this,k,n);g=s(this,g,e);this.currentPath_.push({type:d,
x:a.x,y:a.y,radius:c,xStart:k.x,yStart:k.y,xEnd:g.x,yEnd:g.y})};d.rect=function(a,b,c,g){this.moveTo(a,b);this.lineTo(a+c,b);this.lineTo(a+c,b+g);this.lineTo(a,b+g);this.closePath()};d.strokeRect=function(a,b,c,g){var e=this.currentPath_;this.beginPath();this.moveTo(a,b);this.lineTo(a+c,b);this.lineTo(a+c,b+g);this.lineTo(a,b+g);this.closePath();this.stroke();this.currentPath_=e};d.fillRect=function(a,b,c,g){var e=this.currentPath_;this.beginPath();this.moveTo(a,b);this.lineTo(a+c,b);this.lineTo(a+
c,b+g);this.lineTo(a,b+g);this.closePath();this.fill();this.currentPath_=e};d.createLinearGradient=function(a,b,c,g){var e=new w("gradient");e.x0_=a;e.y0_=b;e.x1_=c;e.y1_=g;return e};d.createRadialGradient=function(a,b,c,g,e,f){var d=new w("gradientradial");d.x0_=a;d.y0_=b;d.r0_=c;d.x1_=g;d.y1_=e;d.r1_=f;return d};d.drawImage=function(a,b){var c,g,e,d,r,y,n,h;e=a.runtimeStyle.width;d=a.runtimeStyle.height;a.runtimeStyle.width="auto";a.runtimeStyle.height="auto";var l=a.width,u=a.height;a.runtimeStyle.width=
e;a.runtimeStyle.height=d;if(3==arguments.length)c=arguments[1],g=arguments[2],r=y=0,n=e=l,h=d=u;else if(5==arguments.length)c=arguments[1],g=arguments[2],e=arguments[3],d=arguments[4],r=y=0,n=l,h=u;else if(9==arguments.length)r=arguments[1],y=arguments[2],n=arguments[3],h=arguments[4],c=arguments[5],g=arguments[6],e=arguments[7],d=arguments[8];else throw Error("Invalid number of arguments");var m=s(this,c,g),p=[];p.push(" <g_vml_:group",' coordsize="',10*q,",",10*q,'"',' coordorigin="0,0"',' style="width:',
10,"px;height:",10,"px;position:absolute;");if(1!=this.m_[0][0]||this.m_[0][1]||1!=this.m_[1][1]||this.m_[1][0]){var t=[];t.push("M11=",this.m_[0][0],",","M12=",this.m_[1][0],",","M21=",this.m_[0][1],",","M22=",this.m_[1][1],",","Dx=",k(m.x/q),",","Dy=",k(m.y/q),"");var v=s(this,c+e,g),w=s(this,c,g+d);c=s(this,c+e,g+d);m.x=x.max(m.x,v.x,w.x,c.x);m.y=x.max(m.y,v.y,w.y,c.y);p.push("padding:0 ",k(m.x/q),"px ",k(m.y/q),"px 0;filter:progid:DXImageTransform.Microsoft.Matrix(",t.join(""),", sizingmethod='clip');")}else p.push("top:",
k(m.y/q),"px;left:",k(m.x/q),"px;");p.push(' ">','<g_vml_:image src="',a.src,'"',' style="width:',q*e,"px;"," height:",q*d,'px"',' cropleft="',r/l,'"',' croptop="',y/u,'"',' cropright="',(l-r-n)/l,'"',' cropbottom="',(u-y-h)/u,'"'," />","</g_vml_:group>");this.element_.insertAdjacentHTML("BeforeEnd",p.join(""))};d.stroke=function(a){var b=[];b.push("<g_vml_:shape",' filled="',!!a,'"',' style="position:absolute;width:',10,"px;height:",10,'px;"',' coordorigin="0,0"',' coordsize="',10*q,",",10*q,'"',
' stroked="',!a,'"',' path="');for(var c={x:null,y:null},d={x:null,y:null},e=0;e<this.currentPath_.length;e++){var f=this.currentPath_[e];switch(f.type){case "moveTo":b.push(" m ",k(f.x),",",k(f.y));break;case "lineTo":b.push(" l ",k(f.x),",",k(f.y));break;case "close":b.push(" x ");f=null;break;case "bezierCurveTo":b.push(" c ",k(f.cp1x),",",k(f.cp1y),",",k(f.cp2x),",",k(f.cp2y),",",k(f.x),",",k(f.y));break;case "at":case "wa":b.push(" ",f.type," ",k(f.x-this.arcScaleX_*f.radius),",",k(f.y-this.arcScaleY_*
f.radius)," ",k(f.x+this.arcScaleX_*f.radius),",",k(f.y+this.arcScaleY_*f.radius)," ",k(f.xStart),",",k(f.yStart)," ",k(f.xEnd),",",k(f.yEnd))}if(f){if(null==c.x||f.x<c.x)c.x=f.x;if(null==d.x||f.x>d.x)d.x=f.x;if(null==c.y||f.y<c.y)c.y=f.y;if(null==d.y||f.y>d.y)d.y=f.y}}b.push(' ">');a?T(this,b,c,d):S(this,b);b.push("</g_vml_:shape>");this.element_.insertAdjacentHTML("beforeEnd",b.join(""))};d.fill=function(){this.stroke(!0)};d.closePath=function(){this.currentPath_.push({type:"close"})};d.save=function(){var a=
{};P(this,a);this.aStack_.push(a);this.mStack_.push(this.m_);this.m_=t(D(),this.m_)};d.restore=function(){this.aStack_.length&&(P(this.aStack_.pop(),this),this.m_=this.mStack_.pop())};d.translate=function(a,b){z(this,t([[1,0,0],[0,1,0],[a,b,1]],this.m_),!1)};d.rotate=function(a){var b=K(a);a=J(a);z(this,t([[b,a,0],[-a,b,0],[0,0,1]],this.m_),!1)};d.scale=function(a,b){this.arcScaleX_*=a;this.arcScaleY_*=b;z(this,t([[a,0,0],[0,b,0],[0,0,1]],this.m_),!0)};d.transform=function(a,b,c,d,e,f){z(this,t([[a,
b,0],[c,d,0],[e,f,1]],this.m_),!0)};d.setTransform=function(a,b,c,d,e,f){z(this,[[a,b,0],[c,d,0],[e,f,1]],!0)};d.drawText_=function(a,b,c,d,e){var f=this.m_;d=0;var r=1E3,t=0,n=[],h;h=this.font;if(L[h])h=L[h];else{var l=document.createElement("div").style;try{l.font=h}catch(u){}h=L[h]={style:l.fontStyle||"normal",variant:l.fontVariant||"normal",weight:l.fontWeight||"normal",size:l.fontSize||10,family:l.fontFamily||"sans-serif"}}var l=h,m=this.element_;h={};for(var p in l)h[p]=l[p];p=parseFloat(m.currentStyle.fontSize);
m=parseFloat(l.size);"number"==typeof l.size?h.size=l.size:-1!=l.size.indexOf("px")?h.size=m:-1!=l.size.indexOf("em")?h.size=p*m:-1!=l.size.indexOf("%")?h.size=p/100*m:-1!=l.size.indexOf("pt")?h.size=m/0.75:h.size=p;h.size*=0.981;p=h.style+" "+h.variant+" "+h.weight+" "+h.size+"px "+h.family;m=this.element_.currentStyle;l=this.textAlign.toLowerCase();switch(l){case "left":case "center":case "right":break;case "end":l="ltr"==m.direction?"right":"left";break;case "start":l="rtl"==m.direction?"right":
"left";break;default:l="left"}switch(this.textBaseline){case "hanging":case "top":t=h.size/1.75;break;case "middle":break;default:case null:case "alphabetic":case "ideographic":case "bottom":t=-h.size/2.25}switch(l){case "right":d=1E3;r=0.05;break;case "center":d=r=500}b=s(this,b+0,c+t);n.push('<g_vml_:line from="',-d,' 0" to="',r,' 0.05" ',' coordsize="100 100" coordorigin="0 0"',' filled="',!e,'" stroked="',!!e,'" style="position:absolute;width:1px;height:1px;">');e?S(this,n):T(this,n,{x:-d,y:0},
{x:r,y:h.size});e=f[0][0].toFixed(3)+","+f[1][0].toFixed(3)+","+f[0][1].toFixed(3)+","+f[1][1].toFixed(3)+",0,0";b=k(b.x/q)+","+k(b.y/q);n.push('<g_vml_:skew on="t" matrix="',e,'" ',' offset="',b,'" origin="',d,' 0" />','<g_vml_:path textpathok="true" />','<g_vml_:textpath on="true" string="',N(a),'" style="v-text-align:',l,";font:",N(p),'" /></g_vml_:line>');this.element_.insertAdjacentHTML("beforeEnd",n.join(""))};d.fillText=function(a,b,c,d){this.drawText_(a,b,c,d,!1)};d.strokeText=function(a,
b,c,d){this.drawText_(a,b,c,d,!0)};d.measureText=function(a){this.textMeasureEl_||(this.element_.insertAdjacentHTML("beforeEnd",'<span style="position:absolute;top:-20000px;left:0;padding:0;margin:0;border:none;white-space:pre;"></span>'),this.textMeasureEl_=this.element_.lastChild);var b=this.element_.ownerDocument;this.textMeasureEl_.innerHTML="";this.textMeasureEl_.style.font=this.font;this.textMeasureEl_.appendChild(b.createTextNode(a));return{width:this.textMeasureEl_.offsetWidth}};d.clip=function(){};
d.arcTo=function(){};d.createPattern=function(a,b){return new I(a,b)};w.prototype.addColorStop=function(a,b){b=G(b);this.colors_.push({offset:a,color:b.color,alpha:b.alpha})};d=A.prototype=Error();d.INDEX_SIZE_ERR=1;d.DOMSTRING_SIZE_ERR=2;d.HIERARCHY_REQUEST_ERR=3;d.WRONG_DOCUMENT_ERR=4;d.INVALID_CHARACTER_ERR=5;d.NO_DATA_ALLOWED_ERR=6;d.NO_MODIFICATION_ALLOWED_ERR=7;d.NOT_FOUND_ERR=8;d.NOT_SUPPORTED_ERR=9;d.INUSE_ATTRIBUTE_ERR=10;d.INVALID_STATE_ERR=11;d.SYNTAX_ERR=12;d.INVALID_MODIFICATION_ERR=
13;d.NAMESPACE_ERR=14;d.INVALID_ACCESS_ERR=15;d.VALIDATION_ERR=16;d.TYPE_MISMATCH_ERR=17;G_vmlCanvasManager=U;CanvasRenderingContext2D=C;CanvasGradient=w;CanvasPattern=I;DOMException=A}();
/*
 CanvasJS jQuery Charting Plugin - http://canvasjs.com/ 
 Copyright 2013 fenopix
*/
(function(b,c,d,e){b.fn.CanvasJSChart=function(a){if(a){var b=this.first();a=new CanvasJS.Chart(this[0],a);b.children(".canvasjs-chart-container").data("canvasjsChartRef",a);a.render();return this}return this.first().children(".canvasjs-chart-container").data("canvasjsChartRef")}})(jQuery,window,document);
(function() {


}).call(this);
(function() {


}).call(this);
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

;
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//





;
