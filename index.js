(function (riot) {
	'use strict';

	riot = 'default' in riot ? riot['default'] : riot;

	var babelHelpers = {};

	babelHelpers.classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	babelHelpers.createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

	babelHelpers.inherits = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};

	babelHelpers.possibleConstructorReturn = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && (typeof call === "object" || typeof call === "function") ? call : self;
	};

	babelHelpers;

	var observable = function observable(el) {

	  /**
	   * Extend the original object or create a new empty one
	   * @type { Object }
	   */

	  el = el || {};

	  /**
	   * Private variables
	   */
	  var callbacks = {},
	      slice = Array.prototype.slice;

	  /**
	   * Private Methods
	   */

	  /**
	   * Helper function needed to get and loop all the events in a string
	   * @param   { String }   e - event string
	   * @param   {Function}   fn - callback
	   */
	  function onEachEvent(e, fn) {
	    var es = e.split(' '),
	        l = es.length,
	        i = 0,
	        name,
	        indx;
	    for (; i < l; i++) {
	      name = es[i];
	      indx = name.indexOf('.');
	      if (name) fn(~indx ? name.substring(0, indx) : name, i, ~indx ? name.slice(indx + 1) : null);
	    }
	  }

	  /**
	   * Public Api
	   */

	  // extend the el object adding the observable methods
	  Object.defineProperties(el, {
	    /**
	     * Listen to the given space separated list of `events` and
	     * execute the `callback` each time an event is triggered.
	     * @param  { String } events - events ids
	     * @param  { Function } fn - callback function
	     * @returns { Object } el
	     */
	    on: {
	      value: function value(events, fn) {
	        if (typeof fn != 'function') return el;

	        onEachEvent(events, function (name, pos, ns) {
	          (callbacks[name] = callbacks[name] || []).push(fn);
	          fn.typed = pos > 0;
	          fn.ns = ns;
	        });

	        return el;
	      },
	      enumerable: false,
	      writable: false,
	      configurable: false
	    },

	    /**
	     * Removes the given space separated list of `events` listeners
	     * @param   { String } events - events ids
	     * @param   { Function } fn - callback function
	     * @returns { Object } el
	     */
	    off: {
	      value: function value(events, fn) {
	        if (events == '*' && !fn) callbacks = {};else {
	          onEachEvent(events, function (name, pos, ns) {
	            if (fn || ns) {
	              var arr = callbacks[name];
	              for (var i = 0, cb; cb = arr && arr[i]; ++i) {
	                if (cb == fn || ns && cb.ns == ns) arr.splice(i--, 1);
	              }
	            } else delete callbacks[name];
	          });
	        }
	        return el;
	      },
	      enumerable: false,
	      writable: false,
	      configurable: false
	    },

	    /**
	     * Listen to the given space separated list of `events` and
	     * execute the `callback` at most once
	     * @param   { String } events - events ids
	     * @param   { Function } fn - callback function
	     * @returns { Object } el
	     */
	    one: {
	      value: function value(events, fn) {
	        function on() {
	          el.off(events, on);
	          fn.apply(el, arguments);
	        }
	        return el.on(events, on);
	      },
	      enumerable: false,
	      writable: false,
	      configurable: false
	    },

	    /**
	     * Execute all callback functions that listen to
	     * the given space separated list of `events`
	     * @param   { String } events - events ids
	     * @returns { Object } el
	     */
	    trigger: {
	      value: function value(events) {

	        // getting the arguments
	        var arglen = arguments.length - 1,
	            args = new Array(arglen),
	            fns;

	        for (var i = 0; i < arglen; i++) {
	          args[i] = arguments[i + 1]; // skip first argument
	        }

	        onEachEvent(events, function (name, pos, ns) {

	          fns = slice.call(callbacks[name] || [], 0);

	          for (var i = 0, fn; fn = fns[i]; ++i) {
	            if (fn.busy) continue;
	            fn.busy = 1;
	            if (!ns || fn.ns == ns) fn.apply(el, fn.typed ? [name].concat(args) : args);
	            if (fns[i] !== fn) {
	              i--;
	            }
	            fn.busy = 0;
	          }

	          if (callbacks['*'] && name != '*') el.trigger.apply(el, ['*', name].concat(args));
	        });

	        return el;
	      },
	      enumerable: false,
	      writable: false,
	      configurable: false
	    }
	  });

	  return el;
	};

	var RE_ORIGIN = /^.+?\/\/+[^\/]+/;
	var EVENT_LISTENER = 'EventListener';
	var REMOVE_EVENT_LISTENER = 'remove' + EVENT_LISTENER;
	var ADD_EVENT_LISTENER = 'add' + EVENT_LISTENER;
	var HAS_ATTRIBUTE = 'hasAttribute';
	var REPLACE = 'replace';
	var POPSTATE = 'popstate';
	var HASHCHANGE = 'hashchange';
	var TRIGGER = 'trigger';
	var MAX_EMIT_STACK_LEVEL = 3;
	var win = typeof window != 'undefined' && window;
	var doc = typeof document != 'undefined' && document;
	var hist = win && history;
	var loc = win && (hist.location || win.location);
	var prot = Router.prototype;
	var clickEvent = doc && doc.ontouchstart ? 'touchstart' : 'click';
	var started = false;
	var central = observable();
	var routeFound = false;
	var debouncedEmit;
	var base;
	var current;
	var parser;
	var secondParser;
	var emitStack = [];
	var emitStackLevel = 0;
	/**
	 * Default parser. You can replace it via router.parser method.
	 * @param {string} path - current path (normalized)
	 * @returns {array} array
	 */
	function DEFAULT_PARSER(path) {
	  return path.split(/[/?#]/);
	}

	/**
	 * Default parser (second). You can replace it via router.parser method.
	 * @param {string} path - current path (normalized)
	 * @param {string} filter - filter string (normalized)
	 * @returns {array} array
	 */
	function DEFAULT_SECOND_PARSER(path, filter) {
	  var re = new RegExp('^' + filter[REPLACE](/\*/g, '([^/?#]+?)')[REPLACE](/\.\./, '.*') + '$'),
	      args = path.match(re);

	  if (args) return args.slice(1);
	}

	/**
	 * Simple/cheap debounce implementation
	 * @param   {function} fn - callback
	 * @param   {number} delay - delay in seconds
	 * @returns {function} debounced function
	 */
	function debounce(fn, delay) {
	  var t;
	  return function () {
	    clearTimeout(t);
	    t = setTimeout(fn, delay);
	  };
	}

	/**
	 * Set the window listeners to trigger the routes
	 * @param {boolean} autoExec - see route.start
	 */
	function start(autoExec) {
	  debouncedEmit = debounce(emit, 1);
	  win[ADD_EVENT_LISTENER](POPSTATE, debouncedEmit);
	  win[ADD_EVENT_LISTENER](HASHCHANGE, debouncedEmit);
	  doc[ADD_EVENT_LISTENER](clickEvent, click);
	  if (autoExec) emit(true);
	}

	/**
	 * Router class
	 */
	function Router() {
	  this.$ = [];
	  observable(this); // make it observable
	  central.on('stop', this.s.bind(this));
	  central.on('emit', this.e.bind(this));
	}

	function normalize(path) {
	  return path[REPLACE](/^\/|\/$/, '');
	}

	function isString(str) {
	  return typeof str == 'string';
	}

	/**
	 * Get the part after domain name
	 * @param {string} href - fullpath
	 * @returns {string} path from root
	 */
	function getPathFromRoot(href) {
	  return (href || loc.href)[REPLACE](RE_ORIGIN, '');
	}

	/**
	 * Get the part after base
	 * @param {string} href - fullpath
	 * @returns {string} path from base
	 */
	function getPathFromBase(href) {
	  return base[0] == '#' ? (href || loc.href || '').split(base)[1] || '' : (loc ? getPathFromRoot(href) : href || '')[REPLACE](base, '');
	}

	function emit(force) {
	  // the stack is needed for redirections
	  var isRoot = emitStackLevel == 0;
	  if (MAX_EMIT_STACK_LEVEL <= emitStackLevel) return;

	  emitStackLevel++;
	  emitStack.push(function () {
	    var path = getPathFromBase();
	    if (force || path != current) {
	      central[TRIGGER]('emit', path);
	      current = path;
	    }
	  });
	  if (isRoot) {
	    while (emitStack.length) {
	      emitStack[0]();
	      emitStack.shift();
	    }
	    emitStackLevel = 0;
	  }
	}

	function click(e) {
	  if (e.which != 1 // not left click
	   || e.metaKey || e.ctrlKey || e.shiftKey // or meta keys
	   || e.defaultPrevented // or default prevented
	  ) return;

	  var el = e.target;
	  while (el && el.nodeName != 'A') {
	    el = el.parentNode;
	  }if (!el || el.nodeName != 'A' // not A tag
	   || el[HAS_ATTRIBUTE]('download') // has download attr
	   || !el[HAS_ATTRIBUTE]('href') // has no href attr
	   || el.target && el.target != '_self' // another window or frame
	   || el.href.indexOf(loc.href.match(RE_ORIGIN)[0]) == -1 // cross origin
	  ) return;

	  if (el.href != loc.href) {
	    if (el.href.split('#')[0] == loc.href.split('#')[0] // internal jump
	     || base != '#' && getPathFromRoot(el.href).indexOf(base) !== 0 // outside of base
	     || !go(getPathFromBase(el.href), el.title || doc.title) // route not found
	    ) return;
	  }

	  e.preventDefault();
	}

	/**
	 * Go to the path
	 * @param {string} path - destination path
	 * @param {string} title - page title
	 * @param {boolean} shouldReplace - use replaceState or pushState
	 * @returns {boolean} - route not found flag
	 */
	function go(path, title, shouldReplace) {
	  if (hist) {
	    // if a browser
	    path = base + normalize(path);
	    title = title || doc.title;
	    // browsers ignores the second parameter `title`
	    shouldReplace ? hist.replaceState(null, title, path) : hist.pushState(null, title, path);
	    // so we need to set it manually
	    doc.title = title;
	    routeFound = false;
	    emit();
	    return routeFound;
	  }

	  // Server-side usage: directly execute handlers for the path
	  return central[TRIGGER]('emit', getPathFromBase(path));
	}

	/**
	 * Go to path or set action
	 * a single string:                go there
	 * two strings:                    go there with setting a title
	 * two strings and boolean:        replace history with setting a title
	 * a single function:              set an action on the default route
	 * a string/RegExp and a function: set an action on the route
	 * @param {(string|function)} first - path / action / filter
	 * @param {(string|RegExp|function)} second - title / action
	 * @param {boolean} third - replace flag
	 */
	prot.m = function (first, second, third) {
	  if (isString(first) && (!second || isString(second))) go(first, second, third || false);else if (second) this.r(first, second);else this.r('@', first);
	};

	/**
	 * Stop routing
	 */
	prot.s = function () {
	  this.off('*');
	  this.$ = [];
	};

	/**
	 * Emit
	 * @param {string} path - path
	 */
	prot.e = function (path) {
	  this.$.concat('@').some(function (filter) {
	    var args = (filter == '@' ? parser : secondParser)(normalize(path), normalize(filter));
	    if (typeof args != 'undefined') {
	      this[TRIGGER].apply(null, [filter].concat(args));
	      return routeFound = true; // exit from loop
	    }
	  }, this);
	};

	/**
	 * Register route
	 * @param {string} filter - filter for matching to url
	 * @param {function} action - action to register
	 */
	prot.r = function (filter, action) {
	  if (filter != '@') {
	    filter = '/' + normalize(filter);
	    this.$.push(filter);
	  }
	  this.on(filter, action);
	};

	var mainRouter = new Router();
	var route = mainRouter.m.bind(mainRouter);

	/**
	 * Create a sub router
	 * @returns {function} the method of a new Router object
	 */
	route.create = function () {
	  var newSubRouter = new Router();
	  // assign sub-router's main method
	  var router = newSubRouter.m.bind(newSubRouter);
	  // stop only this sub-router
	  router.stop = newSubRouter.s.bind(newSubRouter);
	  return router;
	};

	/**
	 * Set the base of url
	 * @param {(str|RegExp)} arg - a new base or '#' or '#!'
	 */
	route.base = function (arg) {
	  base = arg || '#';
	  current = getPathFromBase(); // recalculate current path
	};

	/** Exec routing right now **/
	route.exec = function () {
	  emit(true);
	};

	/**
	 * Replace the default router to yours
	 * @param {function} fn - your parser function
	 * @param {function} fn2 - your secondParser function
	 */
	route.parser = function (fn, fn2) {
	  if (!fn && !fn2) {
	    // reset parser for testing...
	    parser = DEFAULT_PARSER;
	    secondParser = DEFAULT_SECOND_PARSER;
	  }
	  if (fn) parser = fn;
	  if (fn2) secondParser = fn2;
	};

	/**
	 * Helper function to get url query as an object
	 * @returns {object} parsed query
	 */
	route.query = function () {
	  var q = {};
	  var href = loc.href || current;
	  href[REPLACE](/[?&](.+?)=([^&]*)/g, function (_, k, v) {
	    q[k] = v;
	  });
	  return q;
	};

	/** Stop routing **/
	route.stop = function () {
	  if (started) {
	    if (win) {
	      win[REMOVE_EVENT_LISTENER](POPSTATE, debouncedEmit);
	      win[REMOVE_EVENT_LISTENER](HASHCHANGE, debouncedEmit);
	      doc[REMOVE_EVENT_LISTENER](clickEvent, click);
	    }
	    central[TRIGGER]('stop');
	    started = false;
	  }
	};

	/**
	 * Start routing
	 * @param {boolean} autoExec - automatically exec after starting if true
	 */
	route.start = function (autoExec) {
	  if (!started) {
	    if (win) {
	      if (document.readyState == 'complete') start(autoExec);
	      // the timeout is needed to solve
	      // a weird safari bug https://github.com/riot/route/issues/33
	      else win[ADD_EVENT_LISTENER]('load', function () {
	          setTimeout(function () {
	            start(autoExec);
	          }, 1);
	        });
	    }
	    started = true;
	  }
	};

	/** Prepare the router **/
	route.base();
	route.parser();

	var mixin = {
	  /**
	   * Bind the tag to the instance of action class
	   */
	  init: function init() {
	    var Action = this.opts.action;
	    if (Action)
	      // This is private. DO NOT ACCESS FROM TAG INSTANCE.
	      this._action = new Action(this);
	  }
	};

	/**
	 * Action
	 * Extend this class and define your actions (events)
	 */

	var Action = function () {
	  function Action(view) {
	    var _this = this;

	    babelHelpers.classCallCheck(this, Action);

	    this._view = view;
	    this._tag_loading = true;
	    var proto = Object.getPrototypeOf(this);
	    Object.getOwnPropertyNames(proto).filter(function (key) {
	      return key != 'constructor' && typeof _this[key] == 'function';
	    }).forEach(function (key) {
	      _this._view.on(key, _this[key].bind(_this));
	    });
	  }

	  babelHelpers.createClass(Action, [{
	    key: 'update',
	    value: function update(obj) {
	      var _this2 = this;

	      var shouldRedraw = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

	      if (shouldRedraw) this._view.update(obj);else Object.keys(obj).forEach(function (key) {
	        _this2._view[key] = obj[key];
	      });
	    }
	  }, {
	    key: 'route',
	    value: function route() {
	      // override this for custom route action
	    }
	  }]);
	  return Action;
	}();

	/**
	 * Thin wrapper of `mount` and `route`
	 */

	var RiotActionView = function () {
	  function RiotActionView(selector) {
	    babelHelpers.classCallCheck(this, RiotActionView);

	    this.r = route.create();
	    this.selector = selector;
	  }

	  babelHelpers.createClass(RiotActionView, [{
	    key: 'route',
	    value: function route(_route, tag) {
	      var _this = this;

	      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	      this.r(_route, function () {
	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	          args[_key] = arguments[_key];
	        }

	        var t = riot.mount(_this.selector, tag, options)[0];
	        t.trigger.apply(t, ['route'].concat(args));
	      });
	      return this;
	    }
	  }]);
	  return RiotActionView;
	}();

	/**
	 * A factory method for RiotActionView
	 * @param { string } selector - point to mount the tag
	 * @returns { object } RiotActionView
	 */


	function mount(selector) {
	  return new RiotActionView(selector);
	}

	var view = { mount: mount };

	var $ = function (_Action) {
	  babelHelpers.inherits($, _Action);

	  function $() {
	    babelHelpers.classCallCheck(this, $);
	    return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf($).apply(this, arguments));
	  }

	  babelHelpers.createClass($, [{
	    key: 'route',

	    /** ルーティングが処理されたとき */
	    value: function route() {
	      var casts = JSON.parse(localStorage.getItem('broadcaster-casts') || '[]');
	      this.update({ casts: casts, selected: casts[0] });
	    }
	  }, {
	    key: 'edit',
	    value: function edit(casts) {
	      localStorage.setItem('broadcaster-casts', JSON.stringify(casts));
	    }
	  }]);
	  return $;
	}(Action);

	var glass = "f000";
	var music = "f001";
	var search = "f002";
	var heart = "f004";
	var star = "f005";
	var user = "f007";
	var film = "f008";
	var th = "f00a";
	var check = "f00c";
	var times = "f00d";
	var signal = "f012";
	var cog = "f013";
	var home = "f015";
	var road = "f018";
	var download = "f019";
	var inbox = "f01c";
	var repeat = "f01e";
	var refresh = "f021";
	var lock = "f023";
	var flag = "f024";
	var headphones = "f025";
	var qrcode = "f029";
	var barcode = "f02a";
	var tag = "f02b";
	var tags = "f02c";
	var book = "f02d";
	var bookmark = "f02e";
	var print = "f02f";
	var camera = "f030";
	var font = "f031";
	var bold = "f032";
	var italic = "f033";
	var list = "f03a";
	var outdent = "f03b";
	var indent = "f03c";
	var pencil = "f040";
	var adjust = "f042";
	var tint = "f043";
	var arrows = "f047";
	var backward = "f04a";
	var play = "f04b";
	var pause = "f04c";
	var stop = "f04d";
	var forward = "f04e";
	var eject = "f052";
	var crosshairs = "f05b";
	var ban = "f05e";
	var share = "f064";
	var expand = "f065";
	var compress = "f066";
	var plus = "f067";
	var minus = "f068";
	var asterisk = "f069";
	var gift = "f06b";
	var leaf = "f06c";
	var fire = "f06d";
	var eye = "f06e";
	var plane = "f072";
	var calendar = "f073";
	var random = "f074";
	var comment = "f075";
	var magnet = "f076";
	var retweet = "f079";
	var folder = "f07b";
	var key = "f084";
	var cogs = "f085";
	var comments = "f086";
	var trophy = "f091";
	var upload = "f093";
	var phone = "f095";
	var twitter = "f099";
	var facebook = "f09a";
	var github = "f09b";
	var unlock = "f09c";
	var rss = "f09e";
	var bullhorn = "f0a1";
	var bell = "f0f3";
	var certificate = "f0a3";
	var globe = "f0ac";
	var wrench = "f0ad";
	var tasks = "f0ae";
	var filter = "f0b0";
	var briefcase = "f0b1";
	var users = "f0c0";
	var link = "f0c1";
	var cloud = "f0c2";
	var flask = "f0c3";
	var scissors = "f0c4";
	var paperclip = "f0c6";
	var square = "f0c8";
	var bars = "f0c9";
	var strikethrough = "f0cc";
	var underline = "f0cd";
	var table = "f0ce";
	var magic = "f0d0";
	var truck = "f0d1";
	var pinterest = "f0d2";
	var money = "f0d6";
	var columns = "f0db";
	var sort = "f0dc";
	var envelope = "f0e0";
	var linkedin = "f0e1";
	var undo = "f0e2";
	var gavel = "f0e3";
	var tachometer = "f0e4";
	var bolt = "f0e7";
	var sitemap = "f0e8";
	var umbrella = "f0e9";
	var clipboard = "f0ea";
	var exchange = "f0ec";
	var stethoscope = "f0f1";
	var suitcase = "f0f2";
	var coffee = "f0f4";
	var cutlery = "f0f5";
	var ambulance = "f0f9";
	var medkit = "f0fa";
	var beer = "f0fc";
	var desktop = "f108";
	var laptop = "f109";
	var tablet = "f10a";
	var mobile = "f10b";
	var spinner = "f110";
	var circle = "f111";
	var reply = "f112";
	var gamepad = "f11b";
	var terminal = "f120";
	var code = "f121";
	var crop = "f125";
	var question = "f128";
	var info = "f129";
	var exclamation = "f12a";
	var superscript = "f12b";
	var subscript = "f12c";
	var eraser = "f12d";
	var microphone = "f130";
	var shield = "f132";
	var rocket = "f135";
	var maxcdn = "f136";
	var html5 = "f13b";
	var css3 = "f13c";
	var anchor = "f13d";
	var bullseye = "f140";
	var ticket = "f145";
	var compass = "f14e";
	var eur = "f153";
	var gbp = "f154";
	var usd = "f155";
	var inr = "f156";
	var jpy = "f157";
	var rub = "f158";
	var krw = "f159";
	var btc = "f15a";
	var file = "f15b";
	var youtube = "f167";
	var xing = "f168";
	var dropbox = "f16b";
	var instagram = "f16d";
	var flickr = "f16e";
	var adn = "f170";
	var bitbucket = "f171";
	var tumblr = "f173";
	var apple = "f179";
	var windows = "f17a";
	var android = "f17b";
	var linux = "f17c";
	var dribbble = "f17d";
	var skype = "f17e";
	var foursquare = "f180";
	var trello = "f181";
	var female = "f182";
	var male = "f183";
	var gratipay = "f184";
	var archive = "f187";
	var bug = "f188";
	var vk = "f189";
	var weibo = "f18a";
	var renren = "f18b";
	var pagelines = "f18c";
	var wheelchair = "f193";
	var slack = "f198";
	var wordpress = "f19a";
	var openid = "f19b";
	var university = "f19c";
	var yahoo = "f19e";
	var google = "f1a0";
	var reddit = "f1a1";
	var stumbleupon = "f1a4";
	var delicious = "f1a5";
	var digg = "f1a6";
	var drupal = "f1a9";
	var joomla = "f1aa";
	var language = "f1ab";
	var fax = "f1ac";
	var building = "f1ad";
	var child = "f1ae";
	var paw = "f1b0";
	var spoon = "f1b1";
	var cube = "f1b2";
	var cubes = "f1b3";
	var behance = "f1b4";
	var steam = "f1b6";
	var recycle = "f1b8";
	var car = "f1b9";
	var taxi = "f1ba";
	var tree = "f1bb";
	var spotify = "f1bc";
	var deviantart = "f1bd";
	var soundcloud = "f1be";
	var database = "f1c0";
	var vine = "f1ca";
	var codepen = "f1cb";
	var jsfiddle = "f1cc";
	var rebel = "f1d0";
	var empire = "f1d1";
	var git = "f1d3";
	var qq = "f1d6";
	var weixin = "f1d7";
	var history$1 = "f1da";
	var header = "f1dc";
	var paragraph = "f1dd";
	var sliders = "f1de";
	var bomb = "f1e2";
	var tty = "f1e4";
	var binoculars = "f1e5";
	var plug = "f1e6";
	var slideshare = "f1e7";
	var twitch = "f1e8";
	var yelp = "f1e9";
	var wifi = "f1eb";
	var calculator = "f1ec";
	var paypal = "f1ed";
	var trash = "f1f8";
	var copyright = "f1f9";
	var at = "f1fa";
	var eyedropper = "f1fb";
	var lastfm = "f202";
	var bicycle = "f206";
	var bus = "f207";
	var ioxhost = "f208";
	var angellist = "f209";
	var cc = "f20a";
	var ils = "f20b";
	var meanpath = "f20c";
	var buysellads = "f20d";
	var connectdevelop = "f20e";
	var dashcube = "f210";
	var forumbee = "f211";
	var leanpub = "f212";
	var sellsy = "f213";
	var shirtsinbulk = "f214";
	var simplybuilt = "f215";
	var skyatlas = "f216";
	var diamond = "f219";
	var ship = "f21a";
	var motorcycle = "f21c";
	var heartbeat = "f21e";
	var venus = "f221";
	var mars = "f222";
	var mercury = "f223";
	var transgender = "f224";
	var neuter = "f22c";
	var genderless = "f22d";
	var whatsapp = "f232";
	var server = "f233";
	var bed = "f236";
	var viacoin = "f237";
	var train = "f238";
	var subway = "f239";
	var medium = "f23a";
	var opencart = "f23d";
	var expeditedssl = "f23e";
	var clone = "f24d";
	var hourglass = "f254";
	var trademark = "f25c";
	var registered = "f25d";
	var gg = "f260";
	var tripadvisor = "f262";
	var odnoklassniki = "f263";
	var safari = "f267";
	var chrome = "f268";
	var firefox = "f269";
	var opera = "f26a";
	var television = "f26c";
	var contao = "f26d";
	var amazon = "f270";
	var industry = "f275";
	var map = "f279";
	var commenting = "f27a";
	var houzz = "f27c";
	var vimeo = "f27d";
	var fonticons = "f280";
	var edge = "f282";
	var codiepie = "f284";
	var modx = "f285";
	var usb = "f287";
	var mixcloud = "f289";
	var scribd = "f28a";
	var hashtag = "f292";
	var bluetooth = "f293";
	var percent = "f295";
	var gitlab = "f296";
	var wpbeginner = "f297";
	var wpforms = "f298";
	var envira = "f299";
	var blind = "f29d";
	var braille = "f2a1";
	var deaf = "f2a4";
	var glide = "f2a5";
	var viadeo = "f2a9";
	var snapchat = "f2ab";
	var icons = {
		glass: glass,
		music: music,
		search: search,
		heart: heart,
		star: star,
		user: user,
		film: film,
		th: th,
		check: check,
		times: times,
		signal: signal,
		cog: cog,
		home: home,
		road: road,
		download: download,
		inbox: inbox,
		repeat: repeat,
		refresh: refresh,
		lock: lock,
		flag: flag,
		headphones: headphones,
		qrcode: qrcode,
		barcode: barcode,
		tag: tag,
		tags: tags,
		book: book,
		bookmark: bookmark,
		print: print,
		camera: camera,
		font: font,
		bold: bold,
		italic: italic,
		list: list,
		outdent: outdent,
		indent: indent,
		pencil: pencil,
		adjust: adjust,
		tint: tint,
		arrows: arrows,
		backward: backward,
		play: play,
		pause: pause,
		stop: stop,
		forward: forward,
		eject: eject,
		crosshairs: crosshairs,
		ban: ban,
		share: share,
		expand: expand,
		compress: compress,
		plus: plus,
		minus: minus,
		asterisk: asterisk,
		gift: gift,
		leaf: leaf,
		fire: fire,
		eye: eye,
		plane: plane,
		calendar: calendar,
		random: random,
		comment: comment,
		magnet: magnet,
		retweet: retweet,
		folder: folder,
		key: key,
		cogs: cogs,
		comments: comments,
		trophy: trophy,
		upload: upload,
		phone: phone,
		twitter: twitter,
		facebook: facebook,
		github: github,
		unlock: unlock,
		rss: rss,
		bullhorn: bullhorn,
		bell: bell,
		certificate: certificate,
		globe: globe,
		wrench: wrench,
		tasks: tasks,
		filter: filter,
		briefcase: briefcase,
		users: users,
		link: link,
		cloud: cloud,
		flask: flask,
		scissors: scissors,
		paperclip: paperclip,
		square: square,
		bars: bars,
		strikethrough: strikethrough,
		underline: underline,
		table: table,
		magic: magic,
		truck: truck,
		pinterest: pinterest,
		money: money,
		columns: columns,
		sort: sort,
		envelope: envelope,
		linkedin: linkedin,
		undo: undo,
		gavel: gavel,
		tachometer: tachometer,
		bolt: bolt,
		sitemap: sitemap,
		umbrella: umbrella,
		clipboard: clipboard,
		exchange: exchange,
		stethoscope: stethoscope,
		suitcase: suitcase,
		coffee: coffee,
		cutlery: cutlery,
		ambulance: ambulance,
		medkit: medkit,
		beer: beer,
		desktop: desktop,
		laptop: laptop,
		tablet: tablet,
		mobile: mobile,
		spinner: spinner,
		circle: circle,
		reply: reply,
		gamepad: gamepad,
		terminal: terminal,
		code: code,
		crop: crop,
		question: question,
		info: info,
		exclamation: exclamation,
		superscript: superscript,
		subscript: subscript,
		eraser: eraser,
		microphone: microphone,
		shield: shield,
		rocket: rocket,
		maxcdn: maxcdn,
		html5: html5,
		css3: css3,
		anchor: anchor,
		bullseye: bullseye,
		ticket: ticket,
		compass: compass,
		eur: eur,
		gbp: gbp,
		usd: usd,
		inr: inr,
		jpy: jpy,
		rub: rub,
		krw: krw,
		btc: btc,
		file: file,
		youtube: youtube,
		xing: xing,
		dropbox: dropbox,
		instagram: instagram,
		flickr: flickr,
		adn: adn,
		bitbucket: bitbucket,
		tumblr: tumblr,
		apple: apple,
		windows: windows,
		android: android,
		linux: linux,
		dribbble: dribbble,
		skype: skype,
		foursquare: foursquare,
		trello: trello,
		female: female,
		male: male,
		gratipay: gratipay,
		archive: archive,
		bug: bug,
		vk: vk,
		weibo: weibo,
		renren: renren,
		pagelines: pagelines,
		wheelchair: wheelchair,
		slack: slack,
		wordpress: wordpress,
		openid: openid,
		university: university,
		yahoo: yahoo,
		google: google,
		reddit: reddit,
		stumbleupon: stumbleupon,
		delicious: delicious,
		digg: digg,
		drupal: drupal,
		joomla: joomla,
		language: language,
		fax: fax,
		building: building,
		child: child,
		paw: paw,
		spoon: spoon,
		cube: cube,
		cubes: cubes,
		behance: behance,
		steam: steam,
		recycle: recycle,
		car: car,
		taxi: taxi,
		tree: tree,
		spotify: spotify,
		deviantart: deviantart,
		soundcloud: soundcloud,
		database: database,
		vine: vine,
		codepen: codepen,
		jsfiddle: jsfiddle,
		rebel: rebel,
		empire: empire,
		git: git,
		qq: qq,
		weixin: weixin,
		history: history$1,
		header: header,
		paragraph: paragraph,
		sliders: sliders,
		bomb: bomb,
		tty: tty,
		binoculars: binoculars,
		plug: plug,
		slideshare: slideshare,
		twitch: twitch,
		yelp: yelp,
		wifi: wifi,
		calculator: calculator,
		paypal: paypal,
		trash: trash,
		copyright: copyright,
		at: at,
		eyedropper: eyedropper,
		lastfm: lastfm,
		bicycle: bicycle,
		bus: bus,
		ioxhost: ioxhost,
		angellist: angellist,
		cc: cc,
		ils: ils,
		meanpath: meanpath,
		buysellads: buysellads,
		connectdevelop: connectdevelop,
		dashcube: dashcube,
		forumbee: forumbee,
		leanpub: leanpub,
		sellsy: sellsy,
		shirtsinbulk: shirtsinbulk,
		simplybuilt: simplybuilt,
		skyatlas: skyatlas,
		diamond: diamond,
		ship: ship,
		motorcycle: motorcycle,
		heartbeat: heartbeat,
		venus: venus,
		mars: mars,
		mercury: mercury,
		transgender: transgender,
		neuter: neuter,
		genderless: genderless,
		whatsapp: whatsapp,
		server: server,
		bed: bed,
		viacoin: viacoin,
		train: train,
		subway: subway,
		medium: medium,
		opencart: opencart,
		expeditedssl: expeditedssl,
		clone: clone,
		hourglass: hourglass,
		trademark: trademark,
		registered: registered,
		gg: gg,
		tripadvisor: tripadvisor,
		odnoklassniki: odnoklassniki,
		safari: safari,
		chrome: chrome,
		firefox: firefox,
		opera: opera,
		television: television,
		contao: contao,
		amazon: amazon,
		industry: industry,
		map: map,
		commenting: commenting,
		houzz: houzz,
		vimeo: vimeo,
		fonticons: fonticons,
		edge: edge,
		codiepie: codiepie,
		modx: modx,
		usb: usb,
		mixcloud: mixcloud,
		scribd: scribd,
		hashtag: hashtag,
		bluetooth: bluetooth,
		percent: percent,
		gitlab: gitlab,
		wpbeginner: wpbeginner,
		wpforms: wpforms,
		envira: envira,
		blind: blind,
		braille: braille,
		deaf: deaf,
		glide: glide,
		viadeo: viadeo,
		snapchat: snapchat,
		"envelope-o": "f003",
		"star-o": "f006",
		"th-large": "f009",
		"th-list": "f00b",
		"search-plus": "f00e",
		"search-minus": "f010",
		"power-off": "f011",
		"trash-o": "f014",
		"file-o": "f016",
		"clock-o": "f017",
		"arrow-circle-o-down": "f01a",
		"arrow-circle-o-up": "f01b",
		"play-circle-o": "f01d",
		"list-alt": "f022",
		"volume-off": "f026",
		"volume-down": "f027",
		"volume-up": "f028",
		"text-height": "f034",
		"text-width": "f035",
		"align-left": "f036",
		"align-center": "f037",
		"align-right": "f038",
		"align-justify": "f039",
		"video-camera": "f03d",
		"picture-o": "f03e",
		"map-marker": "f041",
		"pencil-square-o": "f044",
		"share-square-o": "f045",
		"check-square-o": "f046",
		"step-backward": "f048",
		"fast-backward": "f049",
		"fast-forward": "f050",
		"step-forward": "f051",
		"chevron-left": "f053",
		"chevron-right": "f054",
		"plus-circle": "f055",
		"minus-circle": "f056",
		"times-circle": "f057",
		"check-circle": "f058",
		"question-circle": "f059",
		"info-circle": "f05a",
		"times-circle-o": "f05c",
		"check-circle-o": "f05d",
		"arrow-left": "f060",
		"arrow-right": "f061",
		"arrow-up": "f062",
		"arrow-down": "f063",
		"exclamation-circle": "f06a",
		"eye-slash": "f070",
		"exclamation-triangle": "f071",
		"chevron-up": "f077",
		"chevron-down": "f078",
		"shopping-cart": "f07a",
		"folder-open": "f07c",
		"arrows-v": "f07d",
		"arrows-h": "f07e",
		"bar-chart": "f080",
		"twitter-square": "f081",
		"facebook-square": "f082",
		"camera-retro": "f083",
		"thumbs-o-up": "f087",
		"thumbs-o-down": "f088",
		"star-half": "f089",
		"heart-o": "f08a",
		"sign-out": "f08b",
		"linkedin-square": "f08c",
		"thumb-tack": "f08d",
		"external-link": "f08e",
		"sign-in": "f090",
		"github-square": "f092",
		"lemon-o": "f094",
		"square-o": "f096",
		"bookmark-o": "f097",
		"phone-square": "f098",
		"credit-card": "f09d",
		"hdd-o": "f0a0",
		"hand-o-right": "f0a4",
		"hand-o-left": "f0a5",
		"hand-o-up": "f0a6",
		"hand-o-down": "f0a7",
		"arrow-circle-left": "f0a8",
		"arrow-circle-right": "f0a9",
		"arrow-circle-up": "f0aa",
		"arrow-circle-down": "f0ab",
		"arrows-alt": "f0b2",
		"files-o": "f0c5",
		"floppy-o": "f0c7",
		"list-ul": "f0ca",
		"list-ol": "f0cb",
		"pinterest-square": "f0d3",
		"google-plus-square": "f0d4",
		"google-plus": "f0d5",
		"caret-down": "f0d7",
		"caret-up": "f0d8",
		"caret-left": "f0d9",
		"caret-right": "f0da",
		"sort-desc": "f0dd",
		"sort-asc": "f0de",
		"comment-o": "f0e5",
		"comments-o": "f0e6",
		"lightbulb-o": "f0eb",
		"cloud-download": "f0ed",
		"cloud-upload": "f0ee",
		"user-md": "f0f0",
		"bell-o": "f0a2",
		"file-text-o": "f0f6",
		"building-o": "f0f7",
		"hospital-o": "f0f8",
		"fighter-jet": "f0fb",
		"h-square": "f0fd",
		"plus-square": "f0fe",
		"angle-double-left": "f100",
		"angle-double-right": "f101",
		"angle-double-up": "f102",
		"angle-double-down": "f103",
		"angle-left": "f104",
		"angle-right": "f105",
		"angle-up": "f106",
		"angle-down": "f107",
		"circle-o": "f10c",
		"quote-left": "f10d",
		"quote-right": "f10e",
		"github-alt": "f113",
		"folder-o": "f114",
		"folder-open-o": "f115",
		"smile-o": "f118",
		"frown-o": "f119",
		"meh-o": "f11a",
		"keyboard-o": "f11c",
		"flag-o": "f11d",
		"flag-checkered": "f11e",
		"reply-all": "f122",
		"star-half-o": "f123",
		"location-arrow": "f124",
		"code-fork": "f126",
		"chain-broken": "f127",
		"puzzle-piece": "f12e",
		"microphone-slash": "f131",
		"calendar-o": "f133",
		"fire-extinguisher": "f134",
		"chevron-circle-left": "f137",
		"chevron-circle-right": "f138",
		"chevron-circle-up": "f139",
		"chevron-circle-down": "f13a",
		"unlock-alt": "f13e",
		"ellipsis-h": "f141",
		"ellipsis-v": "f142",
		"rss-square": "f143",
		"play-circle": "f144",
		"minus-square": "f146",
		"minus-square-o": "f147",
		"level-up": "f148",
		"level-down": "f149",
		"check-square": "f14a",
		"pencil-square": "f14b",
		"external-link-square": "f14c",
		"share-square": "f14d",
		"caret-square-o-down": "f150",
		"caret-square-o-up": "f151",
		"caret-square-o-right": "f152",
		"file-text": "f15c",
		"sort-alpha-asc": "f15d",
		"sort-alpha-desc": "f15e",
		"sort-amount-asc": "f160",
		"sort-amount-desc": "f161",
		"sort-numeric-asc": "f162",
		"sort-numeric-desc": "f163",
		"thumbs-up": "f164",
		"thumbs-down": "f165",
		"youtube-square": "f166",
		"xing-square": "f169",
		"youtube-play": "f16a",
		"stack-overflow": "f16c",
		"bitbucket-square": "f172",
		"tumblr-square": "f174",
		"long-arrow-down": "f175",
		"long-arrow-up": "f176",
		"long-arrow-left": "f177",
		"long-arrow-right": "f178",
		"sun-o": "f185",
		"moon-o": "f186",
		"stack-exchange": "f18d",
		"arrow-circle-o-right": "f18e",
		"arrow-circle-o-left": "f190",
		"caret-square-o-left": "f191",
		"dot-circle-o": "f192",
		"vimeo-square": "f194",
		"try": "f195",
		"plus-square-o": "f196",
		"space-shuttle": "f197",
		"envelope-square": "f199",
		"graduation-cap": "f19d",
		"reddit-square": "f1a2",
		"stumbleupon-circle": "f1a3",
		"pied-piper": "f1a7",
		"pied-piper-alt": "f1a8",
		"behance-square": "f1b5",
		"steam-square": "f1b7",
		"file-pdf-o": "f1c1",
		"file-word-o": "f1c2",
		"file-excel-o": "f1c3",
		"file-powerpoint-o": "f1c4",
		"file-image-o": "f1c5",
		"file-archive-o": "f1c6",
		"file-audio-o": "f1c7",
		"file-video-o": "f1c8",
		"file-code-o": "f1c9",
		"life-ring": "f1cd",
		"circle-o-notch": "f1ce",
		"git-square": "f1d2",
		"hacker-news": "f1d4",
		"tencent-weibo": "f1d5",
		"paper-plane": "f1d8",
		"paper-plane-o": "f1d9",
		"circle-thin": "f1db",
		"share-alt": "f1e0",
		"share-alt-square": "f1e1",
		"futbol-o": "f1e3",
		"newspaper-o": "f1ea",
		"google-wallet": "f1ee",
		"cc-visa": "f1f0",
		"cc-mastercard": "f1f1",
		"cc-discover": "f1f2",
		"cc-amex": "f1f3",
		"cc-paypal": "f1f4",
		"cc-stripe": "f1f5",
		"bell-slash": "f1f6",
		"bell-slash-o": "f1f7",
		"paint-brush": "f1fc",
		"birthday-cake": "f1fd",
		"area-chart": "f1fe",
		"pie-chart": "f200",
		"line-chart": "f201",
		"lastfm-square": "f203",
		"toggle-off": "f204",
		"toggle-on": "f205",
		"cart-plus": "f217",
		"cart-arrow-down": "f218",
		"user-secret": "f21b",
		"street-view": "f21d",
		"transgender-alt": "f225",
		"venus-double": "f226",
		"mars-double": "f227",
		"venus-mars": "f228",
		"mars-stroke": "f229",
		"mars-stroke-v": "f22a",
		"mars-stroke-h": "f22b",
		"facebook-official": "f230",
		"pinterest-p": "f231",
		"user-plus": "f234",
		"user-times": "f235",
		"y-combinator": "f23b",
		"optin-monster": "f23c",
		"battery-full": "f240",
		"battery-three-quarters": "f241",
		"battery-half": "f242",
		"battery-quarter": "f243",
		"battery-empty": "f244",
		"mouse-pointer": "f245",
		"i-cursor": "f246",
		"object-group": "f247",
		"object-ungroup": "f248",
		"sticky-note": "f249",
		"sticky-note-o": "f24a",
		"cc-jcb": "f24b",
		"cc-diners-club": "f24c",
		"balance-scale": "f24e",
		"hourglass-o": "f250",
		"hourglass-start": "f251",
		"hourglass-half": "f252",
		"hourglass-end": "f253",
		"hand-rock-o": "f255",
		"hand-paper-o": "f256",
		"hand-scissors-o": "f257",
		"hand-lizard-o": "f258",
		"hand-spock-o": "f259",
		"hand-pointer-o": "f25a",
		"hand-peace-o": "f25b",
		"creative-commons": "f25e",
		"gg-circle": "f261",
		"odnoklassniki-square": "f264",
		"get-pocket": "f265",
		"wikipedia-w": "f266",
		"internet-explorer": "f26b",
		"500px": "f26e",
		"calendar-plus-o": "f271",
		"calendar-minus-o": "f272",
		"calendar-times-o": "f273",
		"calendar-check-o": "f274",
		"map-pin": "f276",
		"map-signs": "f277",
		"map-o": "f278",
		"commenting-o": "f27b",
		"black-tie": "f27e",
		"reddit-alien": "f281",
		"credit-card-alt": "f283",
		"fort-awesome": "f286",
		"product-hunt": "f288",
		"pause-circle": "f28b",
		"pause-circle-o": "f28c",
		"stop-circle": "f28d",
		"stop-circle-o": "f28e",
		"shopping-bag": "f290",
		"shopping-basket": "f291",
		"bluetooth-b": "f294",
		"universal-access": "f29a",
		"wheelchair-alt": "f29b",
		"question-circle-o": "f29c",
		"audio-description": "f29e",
		"volume-control-phone": "f2a0",
		"assistive-listening-systems": "f2a2",
		"american-sign-language-interpreting": "f2a3",
		"glide-g": "f2a6",
		"sign-language": "f2a7",
		"low-vision": "f2a8",
		"viadeo-square": "f2aa",
		"snapchat-ghost": "f2ac",
		"snapchat-square": "f2ad"
	};

	riot.tag2('fa', '', 'fa,[riot-tag="fa"],[data-is="fa"]{ display: inline-block; font: normal normal normal 14px/1 FontAwesome; font-size: inherit; text-rendering: auto; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; transform: translate(0, 0); }', '', function (opts) {
		this.root.innerHTML = '&#x' + icons[opts.icon] + ';';
	});

	riot.tag2('layout-slide', '<ul> <li each="{casts}"> <fa icon="minus" onclick="{remove}"></fa> <fa if="{editing}" icon="check" onclick="{edit}"></fa> <fa if="{!editing}" icon="pencil" onclick="{edit}"></fa> <span if="{!editing}" onclick="{select}">{org}・{name}</span> <span if="{editing}" class="editing"> <input value="{org}" onchange="{changeOrg}"> <input value="{name}" onchange="{changeName}"> </span> </li> <li><fa icon="plus" onclick="{add}"></fa></li> </ul> <footer> <h1>{selected.org}</h1> <h2>{selected.name}</h2> </footer>', 'layout-slide,[riot-tag="layout-slide"],[data-is="layout-slide"]{ position: absolute; height: 100%; width: 100%; font-family: \'Noto Sans Japanese\', sans-serif; font-size: 3vh; } layout-slide button,[riot-tag="layout-slide"] button,[data-is="layout-slide"] button{ border: none; background: none; } layout-slide ul,[riot-tag="layout-slide"] ul,[data-is="layout-slide"] ul{ margin: 5vh 10vw; padding: 0; list-style: none; } layout-slide li,[riot-tag="layout-slide"] li,[data-is="layout-slide"] li{ margin: .3em 0; } layout-slide li > *,[riot-tag="layout-slide"] li > *,[data-is="layout-slide"] li > *{ line-height: 3em; display: block; padding: 0 1em; background: rgba(255,255,255,.4); color: rgba(0,0,0,.3); } layout-slide li > fa,[riot-tag="layout-slide"] li > fa,[data-is="layout-slide"] li > fa{ text-align: center; width: 1em; float: left; } layout-slide li > fa + fa,[riot-tag="layout-slide"] li > fa + fa,[data-is="layout-slide"] li > fa + fa{ float: right } layout-slide li > span,[riot-tag="layout-slide"] li > span,[data-is="layout-slide"] li > span{ margin: 0 3.3em; } layout-slide li > span.editing,[riot-tag="layout-slide"] li > span.editing,[data-is="layout-slide"] li > span.editing{ padding: 0; display: flex; } layout-slide input,[riot-tag="layout-slide"] input,[data-is="layout-slide"] input{ border: none; box-sizing: border-box; padding: 0 1em; flex-grow: 1; } layout-slide input + input,[riot-tag="layout-slide"] input + input,[data-is="layout-slide"] input + input{ border-left: 1px dashed rgba(0,0,0,.5) } layout-slide footer,[riot-tag="layout-slide"] footer,[data-is="layout-slide"] footer{ font-size: 3vh; height: 3em; padding: .8em 1.6em; background: white; position: absolute; left: 0; right: 0; bottom: 5vh; } layout-slide footer > h1,[riot-tag="layout-slide"] footer > h1,[data-is="layout-slide"] footer > h1{ font-size: 1em; font-weight: 300; margin: 0 0 .4em; padding: 0; line-height: 1em; } layout-slide footer > h2,[riot-tag="layout-slide"] footer > h2,[data-is="layout-slide"] footer > h2{ font-size: 1.5em; font-weight: 600; margin: 0; padding: 0; line-height: 1em; }', '', function (opts) {
	  var _this = this;

	  this.casts = [];
	  this.selected = {};
	  this.add = function (e) {
	    _this.casts.push({ org: 'Something Cool', name: 'John Doe' });
	    _this.trigger('edit', _this.casts);
	  };
	  this.select = function (e) {
	    _this.selected = e.item;
	  };
	  this.remove = function (e) {
	    _this.casts = _this.casts.filter(function (item) {
	      return item != e.item;
	    });
	    _this.trigger('edit', _this.casts);
	  };
	  this.edit = function (e) {
	    e.item.editing = !e.item.editing;
	    _this.trigger('edit', _this.casts);
	  };
	  this.changeOrg = function (e) {
	    e.item.org = e.target.value;
	  };
	  this.changeName = function (e) {
	    e.item.name = e.target.value;
	  };
	});

	// registers riot-action as a middleware
	riot.mixin(mixin);

	// routings
	view.mount('#container').route('/', 'layout-slide', { action: $ });

	route.start(true);

}(riot));