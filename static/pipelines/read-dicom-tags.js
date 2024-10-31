var readDicomTags = (() => {
	var _scriptDir = import.meta.url;

	return async function (moduleArg = {}) {
		var Module = moduleArg;
		var readyPromiseResolve, readyPromiseReject;
		Module['ready'] = new Promise((resolve, reject) => {
			readyPromiseResolve = resolve;
			readyPromiseReject = reject;
		});
		var mStdout = null;
		var mStderr = null;
		Module['resetModuleStdout'] = function () {
			mStdout = '';
		};
		Module['resetModuleStderr'] = function () {
			mStderr = '';
		};
		Module['print'] = function (text) {
			console.log(text);
			mStdout += text + '\n';
		};
		Module['printErr'] = function (text) {
			console.error(text);
			mStderr += text + '\n';
		};
		Module['getModuleStdout'] = function () {
			return mStdout;
		};
		Module['getModuleStderr'] = function () {
			return mStderr;
		};
		var moduleOverrides = Object.assign({}, Module);
		var arguments_ = [];
		var thisProgram = './this.program';
		var quit_ = (status, toThrow) => {
			throw toThrow;
		};
		var ENVIRONMENT_IS_WEB = typeof window == 'object';
		var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function';
		var ENVIRONMENT_IS_NODE =
			typeof process == 'object' &&
			typeof process.versions == 'object' &&
			typeof process.versions.node == 'string';
		var scriptDirectory = '';
		function locateFile(path) {
			if (Module['locateFile']) {
				return Module['locateFile'](path, scriptDirectory);
			}
			return scriptDirectory + path;
		}
		var read_, readAsync, readBinary;
		if (ENVIRONMENT_IS_NODE) {
			const { createRequire: createRequire } = await import('module');
			var require = createRequire(import.meta.url);
			var fs = require('fs');
			var nodePath = require('path');
			if (ENVIRONMENT_IS_WORKER) {
				scriptDirectory = nodePath.dirname(scriptDirectory) + '/';
			} else {
				scriptDirectory = require('url').fileURLToPath(new URL('./', import.meta.url));
			}
			read_ = (filename, binary) => {
				filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
				return fs.readFileSync(filename, binary ? undefined : 'utf8');
			};
			readBinary = (filename) => {
				var ret = read_(filename, true);
				if (!ret.buffer) {
					ret = new Uint8Array(ret);
				}
				return ret;
			};
			readAsync = (filename, onload, onerror, binary = true) => {
				filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
				fs.readFile(filename, binary ? undefined : 'utf8', (err, data) => {
					if (err) onerror(err);
					else onload(binary ? data.buffer : data);
				});
			};
			if (!Module['thisProgram'] && process.argv.length > 1) {
				thisProgram = process.argv[1].replace(/\\/g, '/');
			}
			arguments_ = process.argv.slice(2);
			quit_ = (status, toThrow) => {
				process.exitCode = status;
				throw toThrow;
			};
		} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
			if (ENVIRONMENT_IS_WORKER) {
				scriptDirectory = self.location.href;
			} else if (typeof document != 'undefined' && document.currentScript) {
				scriptDirectory = document.currentScript.src;
			}
			if (_scriptDir) {
				scriptDirectory = _scriptDir;
			}
			if (scriptDirectory.startsWith('blob:')) {
				scriptDirectory = '';
			} else {
				scriptDirectory = scriptDirectory.substr(
					0,
					scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1
				);
			}
			{
				read_ = (url) => {
					var xhr = new XMLHttpRequest();
					xhr.open('GET', url, false);
					xhr.send(null);
					return xhr.responseText;
				};
				if (ENVIRONMENT_IS_WORKER) {
					readBinary = (url) => {
						var xhr = new XMLHttpRequest();
						xhr.open('GET', url, false);
						xhr.responseType = 'arraybuffer';
						xhr.send(null);
						return new Uint8Array(xhr.response);
					};
				}
				readAsync = (url, onload, onerror) => {
					var xhr = new XMLHttpRequest();
					xhr.open('GET', url, true);
					xhr.responseType = 'arraybuffer';
					xhr.onload = () => {
						if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
							onload(xhr.response);
							return;
						}
						onerror();
					};
					xhr.onerror = onerror;
					xhr.send(null);
				};
			}
		} else {
		}
		var out = Module['print'] || console.log.bind(console);
		var err = Module['printErr'] || console.error.bind(console);
		Object.assign(Module, moduleOverrides);
		moduleOverrides = null;
		if (Module['arguments']) arguments_ = Module['arguments'];
		if (Module['thisProgram']) thisProgram = Module['thisProgram'];
		if (Module['quit']) quit_ = Module['quit'];
		var wasmBinary;
		if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
		var wasmMemory;
		var ABORT = false;
		var EXITSTATUS;
		function assert(condition, text) {
			if (!condition) {
				abort(text);
			}
		}
		var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
		function updateMemoryViews() {
			var b = wasmMemory.buffer;
			Module['HEAP8'] = HEAP8 = new Int8Array(b);
			Module['HEAP16'] = HEAP16 = new Int16Array(b);
			Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
			Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
			Module['HEAP32'] = HEAP32 = new Int32Array(b);
			Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
			Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
			Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
		}
		var __ATPRERUN__ = [];
		var __ATINIT__ = [];
		var __ATMAIN__ = [];
		var __ATPOSTRUN__ = [];
		var runtimeInitialized = false;
		function preRun() {
			if (Module['preRun']) {
				if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
				while (Module['preRun'].length) {
					addOnPreRun(Module['preRun'].shift());
				}
			}
			callRuntimeCallbacks(__ATPRERUN__);
		}
		function initRuntime() {
			runtimeInitialized = true;
			if (!Module['noFSInit'] && !FS.init.initialized) FS.init();
			FS.ignorePermissions = false;
			TTY.init();
			SOCKFS.root = FS.mount(SOCKFS, {}, null);
			callRuntimeCallbacks(__ATINIT__);
		}
		function preMain() {
			callRuntimeCallbacks(__ATMAIN__);
		}
		function postRun() {
			if (Module['postRun']) {
				if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
				while (Module['postRun'].length) {
					addOnPostRun(Module['postRun'].shift());
				}
			}
			callRuntimeCallbacks(__ATPOSTRUN__);
		}
		function addOnPreRun(cb) {
			__ATPRERUN__.unshift(cb);
		}
		function addOnInit(cb) {
			__ATINIT__.unshift(cb);
		}
		function addOnPostRun(cb) {
			__ATPOSTRUN__.unshift(cb);
		}
		var runDependencies = 0;
		var runDependencyWatcher = null;
		var dependenciesFulfilled = null;
		function getUniqueRunDependency(id) {
			return id;
		}
		function addRunDependency(id) {
			runDependencies++;
			Module['monitorRunDependencies']?.(runDependencies);
		}
		function removeRunDependency(id) {
			runDependencies--;
			Module['monitorRunDependencies']?.(runDependencies);
			if (runDependencies == 0) {
				if (runDependencyWatcher !== null) {
					clearInterval(runDependencyWatcher);
					runDependencyWatcher = null;
				}
				if (dependenciesFulfilled) {
					var callback = dependenciesFulfilled;
					dependenciesFulfilled = null;
					callback();
				}
			}
		}
		function abort(what) {
			Module['onAbort']?.(what);
			what = 'Aborted(' + what + ')';
			err(what);
			ABORT = true;
			EXITSTATUS = 1;
			what += '. Build with -sASSERTIONS for more info.';
			var e = new WebAssembly.RuntimeError(what);
			readyPromiseReject(e);
			throw e;
		}
		var dataURIPrefix = 'data:application/octet-stream;base64,';
		var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
		var isFileURI = (filename) => filename.startsWith('file://');
		var wasmBinaryFile;
		if (Module['locateFile']) {
			wasmBinaryFile = 'read-dicom-tags.wasm';
			if (!isDataURI(wasmBinaryFile)) {
				wasmBinaryFile = locateFile(wasmBinaryFile);
			}
		} else {
			wasmBinaryFile = new URL('read-dicom-tags.wasm', import.meta.url).href;
		}
		function getBinarySync(file) {
			if (file == wasmBinaryFile && wasmBinary) {
				return new Uint8Array(wasmBinary);
			}
			if (readBinary) {
				return readBinary(file);
			}
			throw 'both async and sync fetching of the wasm failed';
		}
		function getBinaryPromise(binaryFile) {
			if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
				if (typeof fetch == 'function' && !isFileURI(binaryFile)) {
					return fetch(binaryFile, { credentials: 'same-origin' })
						.then((response) => {
							if (!response['ok']) {
								throw `failed to load wasm binary file at '${binaryFile}'`;
							}
							return response['arrayBuffer']();
						})
						.catch(() => getBinarySync(binaryFile));
				} else if (readAsync) {
					return new Promise((resolve, reject) => {
						readAsync(binaryFile, (response) => resolve(new Uint8Array(response)), reject);
					});
				}
			}
			return Promise.resolve().then(() => getBinarySync(binaryFile));
		}
		function instantiateArrayBuffer(binaryFile, imports, receiver) {
			return getBinaryPromise(binaryFile)
				.then((binary) => WebAssembly.instantiate(binary, imports))
				.then(receiver, (reason) => {
					err(`failed to asynchronously prepare wasm: ${reason}`);
					abort(reason);
				});
		}
		function instantiateAsync(binary, binaryFile, imports, callback) {
			if (
				!binary &&
				typeof WebAssembly.instantiateStreaming == 'function' &&
				!isDataURI(binaryFile) &&
				!isFileURI(binaryFile) &&
				!ENVIRONMENT_IS_NODE &&
				typeof fetch == 'function'
			) {
				return fetch(binaryFile, { credentials: 'same-origin' }).then((response) => {
					var result = WebAssembly.instantiateStreaming(response, imports);
					return result.then(callback, function (reason) {
						err(`wasm streaming compile failed: ${reason}`);
						err('falling back to ArrayBuffer instantiation');
						return instantiateArrayBuffer(binaryFile, imports, callback);
					});
				});
			}
			return instantiateArrayBuffer(binaryFile, imports, callback);
		}
		function createWasm() {
			var info = { a: wasmImports };
			function receiveInstance(instance, module) {
				wasmExports = instance.exports;
				wasmExports = applySignatureConversions(wasmExports);
				wasmMemory = wasmExports['I'];
				updateMemoryViews();
				wasmTable = wasmExports['S'];
				addOnInit(wasmExports['J']);
				removeRunDependency('wasm-instantiate');
				return wasmExports;
			}
			addRunDependency('wasm-instantiate');
			function receiveInstantiationResult(result) {
				receiveInstance(result['instance']);
			}
			if (Module['instantiateWasm']) {
				try {
					return Module['instantiateWasm'](info, receiveInstance);
				} catch (e) {
					err(`Module.instantiateWasm callback failed with error: ${e}`);
					readyPromiseReject(e);
				}
			}
			instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(
				readyPromiseReject
			);
			return {};
		}
		var tempDouble;
		var tempI64;
		function ExitStatus(status) {
			this.name = 'ExitStatus';
			this.message = `Program terminated with exit(${status})`;
			this.status = status;
		}
		var callRuntimeCallbacks = (callbacks) => {
			while (callbacks.length > 0) {
				callbacks.shift()(Module);
			}
		};
		var noExitRuntime = Module['noExitRuntime'] || true;
		class ExceptionInfo {
			constructor(excPtr) {
				this.excPtr = excPtr;
				this.ptr = excPtr - 24;
			}
			set_type(type) {
				HEAPU32[((this.ptr + 4) >>> 2) >>> 0] = type;
			}
			get_type() {
				return HEAPU32[((this.ptr + 4) >>> 2) >>> 0];
			}
			set_destructor(destructor) {
				HEAPU32[((this.ptr + 8) >>> 2) >>> 0] = destructor;
			}
			get_destructor() {
				return HEAPU32[((this.ptr + 8) >>> 2) >>> 0];
			}
			set_caught(caught) {
				caught = caught ? 1 : 0;
				HEAP8[(this.ptr + 12) >>> 0] = caught;
			}
			get_caught() {
				return HEAP8[(this.ptr + 12) >>> 0] != 0;
			}
			set_rethrown(rethrown) {
				rethrown = rethrown ? 1 : 0;
				HEAP8[(this.ptr + 13) >>> 0] = rethrown;
			}
			get_rethrown() {
				return HEAP8[(this.ptr + 13) >>> 0] != 0;
			}
			init(type, destructor) {
				this.set_adjusted_ptr(0);
				this.set_type(type);
				this.set_destructor(destructor);
			}
			set_adjusted_ptr(adjustedPtr) {
				HEAPU32[((this.ptr + 16) >>> 2) >>> 0] = adjustedPtr;
			}
			get_adjusted_ptr() {
				return HEAPU32[((this.ptr + 16) >>> 2) >>> 0];
			}
			get_exception_ptr() {
				var isPointer = ___cxa_is_pointer_type(this.get_type());
				if (isPointer) {
					return HEAPU32[(this.excPtr >>> 2) >>> 0];
				}
				var adjusted = this.get_adjusted_ptr();
				if (adjusted !== 0) return adjusted;
				return this.excPtr;
			}
		}
		var exceptionLast = 0;
		var uncaughtExceptionCount = 0;
		var convertI32PairToI53Checked = (lo, hi) =>
			(hi + 2097152) >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
		function ___cxa_throw(ptr, type, destructor) {
			ptr >>>= 0;
			type >>>= 0;
			destructor >>>= 0;
			var info = new ExceptionInfo(ptr);
			info.init(type, destructor);
			exceptionLast = ptr;
			uncaughtExceptionCount++;
			throw exceptionLast;
		}
		var PATH = {
			isAbs: (path) => path.charAt(0) === '/',
			splitPath: (filename) => {
				var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
				return splitPathRe.exec(filename).slice(1);
			},
			normalizeArray: (parts, allowAboveRoot) => {
				var up = 0;
				for (var i = parts.length - 1; i >= 0; i--) {
					var last = parts[i];
					if (last === '.') {
						parts.splice(i, 1);
					} else if (last === '..') {
						parts.splice(i, 1);
						up++;
					} else if (up) {
						parts.splice(i, 1);
						up--;
					}
				}
				if (allowAboveRoot) {
					for (; up; up--) {
						parts.unshift('..');
					}
				}
				return parts;
			},
			normalize: (path) => {
				var isAbsolute = PATH.isAbs(path),
					trailingSlash = path.substr(-1) === '/';
				path = PATH.normalizeArray(
					path.split('/').filter((p) => !!p),
					!isAbsolute
				).join('/');
				if (!path && !isAbsolute) {
					path = '.';
				}
				if (path && trailingSlash) {
					path += '/';
				}
				return (isAbsolute ? '/' : '') + path;
			},
			dirname: (path) => {
				var result = PATH.splitPath(path),
					root = result[0],
					dir = result[1];
				if (!root && !dir) {
					return '.';
				}
				if (dir) {
					dir = dir.substr(0, dir.length - 1);
				}
				return root + dir;
			},
			basename: (path) => {
				if (path === '/') return '/';
				path = PATH.normalize(path);
				path = path.replace(/\/$/, '');
				var lastSlash = path.lastIndexOf('/');
				if (lastSlash === -1) return path;
				return path.substr(lastSlash + 1);
			},
			join: (...paths) => PATH.normalize(paths.join('/')),
			join2: (l, r) => PATH.normalize(l + '/' + r)
		};
		var initRandomFill = () => {
			if (typeof crypto == 'object' && typeof crypto['getRandomValues'] == 'function') {
				return (view) => crypto.getRandomValues(view);
			} else if (ENVIRONMENT_IS_NODE) {
				try {
					var crypto_module = require('crypto');
					var randomFillSync = crypto_module['randomFillSync'];
					if (randomFillSync) {
						return (view) => crypto_module['randomFillSync'](view);
					}
					var randomBytes = crypto_module['randomBytes'];
					return (view) => (view.set(randomBytes(view.byteLength)), view);
				} catch (e) {}
			}
			abort('initRandomDevice');
		};
		var randomFill = (view) => (randomFill = initRandomFill())(view);
		var PATH_FS = {
			resolve: (...args) => {
				var resolvedPath = '',
					resolvedAbsolute = false;
				for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
					var path = i >= 0 ? args[i] : FS.cwd();
					if (typeof path != 'string') {
						throw new TypeError('Arguments to path.resolve must be strings');
					} else if (!path) {
						return '';
					}
					resolvedPath = path + '/' + resolvedPath;
					resolvedAbsolute = PATH.isAbs(path);
				}
				resolvedPath = PATH.normalizeArray(
					resolvedPath.split('/').filter((p) => !!p),
					!resolvedAbsolute
				).join('/');
				return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
			},
			relative: (from, to) => {
				from = PATH_FS.resolve(from).substr(1);
				to = PATH_FS.resolve(to).substr(1);
				function trim(arr) {
					var start = 0;
					for (; start < arr.length; start++) {
						if (arr[start] !== '') break;
					}
					var end = arr.length - 1;
					for (; end >= 0; end--) {
						if (arr[end] !== '') break;
					}
					if (start > end) return [];
					return arr.slice(start, end - start + 1);
				}
				var fromParts = trim(from.split('/'));
				var toParts = trim(to.split('/'));
				var length = Math.min(fromParts.length, toParts.length);
				var samePartsLength = length;
				for (var i = 0; i < length; i++) {
					if (fromParts[i] !== toParts[i]) {
						samePartsLength = i;
						break;
					}
				}
				var outputParts = [];
				for (var i = samePartsLength; i < fromParts.length; i++) {
					outputParts.push('..');
				}
				outputParts = outputParts.concat(toParts.slice(samePartsLength));
				return outputParts.join('/');
			}
		};
		var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
		var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
			idx >>>= 0;
			var endIdx = idx + maxBytesToRead;
			var endPtr = idx;
			while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
			if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
				return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
			}
			var str = '';
			while (idx < endPtr) {
				var u0 = heapOrArray[idx++];
				if (!(u0 & 128)) {
					str += String.fromCharCode(u0);
					continue;
				}
				var u1 = heapOrArray[idx++] & 63;
				if ((u0 & 224) == 192) {
					str += String.fromCharCode(((u0 & 31) << 6) | u1);
					continue;
				}
				var u2 = heapOrArray[idx++] & 63;
				if ((u0 & 240) == 224) {
					u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
				} else {
					u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
				}
				if (u0 < 65536) {
					str += String.fromCharCode(u0);
				} else {
					var ch = u0 - 65536;
					str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
				}
			}
			return str;
		};
		var FS_stdin_getChar_buffer = [];
		var lengthBytesUTF8 = (str) => {
			var len = 0;
			for (var i = 0; i < str.length; ++i) {
				var c = str.charCodeAt(i);
				if (c <= 127) {
					len++;
				} else if (c <= 2047) {
					len += 2;
				} else if (c >= 55296 && c <= 57343) {
					len += 4;
					++i;
				} else {
					len += 3;
				}
			}
			return len;
		};
		var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
			outIdx >>>= 0;
			if (!(maxBytesToWrite > 0)) return 0;
			var startIdx = outIdx;
			var endIdx = outIdx + maxBytesToWrite - 1;
			for (var i = 0; i < str.length; ++i) {
				var u = str.charCodeAt(i);
				if (u >= 55296 && u <= 57343) {
					var u1 = str.charCodeAt(++i);
					u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
				}
				if (u <= 127) {
					if (outIdx >= endIdx) break;
					heap[outIdx++ >>> 0] = u;
				} else if (u <= 2047) {
					if (outIdx + 1 >= endIdx) break;
					heap[outIdx++ >>> 0] = 192 | (u >> 6);
					heap[outIdx++ >>> 0] = 128 | (u & 63);
				} else if (u <= 65535) {
					if (outIdx + 2 >= endIdx) break;
					heap[outIdx++ >>> 0] = 224 | (u >> 12);
					heap[outIdx++ >>> 0] = 128 | ((u >> 6) & 63);
					heap[outIdx++ >>> 0] = 128 | (u & 63);
				} else {
					if (outIdx + 3 >= endIdx) break;
					heap[outIdx++ >>> 0] = 240 | (u >> 18);
					heap[outIdx++ >>> 0] = 128 | ((u >> 12) & 63);
					heap[outIdx++ >>> 0] = 128 | ((u >> 6) & 63);
					heap[outIdx++ >>> 0] = 128 | (u & 63);
				}
			}
			heap[outIdx >>> 0] = 0;
			return outIdx - startIdx;
		};
		function intArrayFromString(stringy, dontAddNull, length) {
			var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
			var u8array = new Array(len);
			var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
			if (dontAddNull) u8array.length = numBytesWritten;
			return u8array;
		}
		var FS_stdin_getChar = () => {
			if (!FS_stdin_getChar_buffer.length) {
				var result = null;
				if (ENVIRONMENT_IS_NODE) {
					var BUFSIZE = 256;
					var buf = Buffer.alloc(BUFSIZE);
					var bytesRead = 0;
					var fd = process.stdin.fd;
					try {
						bytesRead = fs.readSync(fd, buf);
					} catch (e) {
						if (e.toString().includes('EOF')) bytesRead = 0;
						else throw e;
					}
					if (bytesRead > 0) {
						result = buf.slice(0, bytesRead).toString('utf-8');
					} else {
						result = null;
					}
				} else if (typeof window != 'undefined' && typeof window.prompt == 'function') {
					result = window.prompt('Input: ');
					if (result !== null) {
						result += '\n';
					}
				} else if (typeof readline == 'function') {
					result = readline();
					if (result !== null) {
						result += '\n';
					}
				}
				if (!result) {
					return null;
				}
				FS_stdin_getChar_buffer = intArrayFromString(result, true);
			}
			return FS_stdin_getChar_buffer.shift();
		};
		var TTY = {
			ttys: [],
			init() {},
			shutdown() {},
			register(dev, ops) {
				TTY.ttys[dev] = { input: [], output: [], ops: ops };
				FS.registerDevice(dev, TTY.stream_ops);
			},
			stream_ops: {
				open(stream) {
					var tty = TTY.ttys[stream.node.rdev];
					if (!tty) {
						throw new FS.ErrnoError(43);
					}
					stream.tty = tty;
					stream.seekable = false;
				},
				close(stream) {
					stream.tty.ops.fsync(stream.tty);
				},
				fsync(stream) {
					stream.tty.ops.fsync(stream.tty);
				},
				read(stream, buffer, offset, length, pos) {
					if (!stream.tty || !stream.tty.ops.get_char) {
						throw new FS.ErrnoError(60);
					}
					var bytesRead = 0;
					for (var i = 0; i < length; i++) {
						var result;
						try {
							result = stream.tty.ops.get_char(stream.tty);
						} catch (e) {
							throw new FS.ErrnoError(29);
						}
						if (result === undefined && bytesRead === 0) {
							throw new FS.ErrnoError(6);
						}
						if (result === null || result === undefined) break;
						bytesRead++;
						buffer[offset + i] = result;
					}
					if (bytesRead) {
						stream.node.timestamp = Date.now();
					}
					return bytesRead;
				},
				write(stream, buffer, offset, length, pos) {
					if (!stream.tty || !stream.tty.ops.put_char) {
						throw new FS.ErrnoError(60);
					}
					try {
						for (var i = 0; i < length; i++) {
							stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
						}
					} catch (e) {
						throw new FS.ErrnoError(29);
					}
					if (length) {
						stream.node.timestamp = Date.now();
					}
					return i;
				}
			},
			default_tty_ops: {
				get_char(tty) {
					return FS_stdin_getChar();
				},
				put_char(tty, val) {
					if (val === null || val === 10) {
						out(UTF8ArrayToString(tty.output, 0));
						tty.output = [];
					} else {
						if (val != 0) tty.output.push(val);
					}
				},
				fsync(tty) {
					if (tty.output && tty.output.length > 0) {
						out(UTF8ArrayToString(tty.output, 0));
						tty.output = [];
					}
				},
				ioctl_tcgets(tty) {
					return {
						c_iflag: 25856,
						c_oflag: 5,
						c_cflag: 191,
						c_lflag: 35387,
						c_cc: [
							3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0,
							0, 0, 0, 0, 0, 0, 0
						]
					};
				},
				ioctl_tcsets(tty, optional_actions, data) {
					return 0;
				},
				ioctl_tiocgwinsz(tty) {
					return [24, 80];
				}
			},
			default_tty1_ops: {
				put_char(tty, val) {
					if (val === null || val === 10) {
						err(UTF8ArrayToString(tty.output, 0));
						tty.output = [];
					} else {
						if (val != 0) tty.output.push(val);
					}
				},
				fsync(tty) {
					if (tty.output && tty.output.length > 0) {
						err(UTF8ArrayToString(tty.output, 0));
						tty.output = [];
					}
				}
			}
		};
		var mmapAlloc = (size) => {
			abort();
		};
		var MEMFS = {
			ops_table: null,
			mount(mount) {
				return MEMFS.createNode(null, '/', 16384 | 511, 0);
			},
			createNode(parent, name, mode, dev) {
				if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
					throw new FS.ErrnoError(63);
				}
				MEMFS.ops_table ||= {
					dir: {
						node: {
							getattr: MEMFS.node_ops.getattr,
							setattr: MEMFS.node_ops.setattr,
							lookup: MEMFS.node_ops.lookup,
							mknod: MEMFS.node_ops.mknod,
							rename: MEMFS.node_ops.rename,
							unlink: MEMFS.node_ops.unlink,
							rmdir: MEMFS.node_ops.rmdir,
							readdir: MEMFS.node_ops.readdir,
							symlink: MEMFS.node_ops.symlink
						},
						stream: { llseek: MEMFS.stream_ops.llseek }
					},
					file: {
						node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
						stream: {
							llseek: MEMFS.stream_ops.llseek,
							read: MEMFS.stream_ops.read,
							write: MEMFS.stream_ops.write,
							allocate: MEMFS.stream_ops.allocate,
							mmap: MEMFS.stream_ops.mmap,
							msync: MEMFS.stream_ops.msync
						}
					},
					link: {
						node: {
							getattr: MEMFS.node_ops.getattr,
							setattr: MEMFS.node_ops.setattr,
							readlink: MEMFS.node_ops.readlink
						},
						stream: {}
					},
					chrdev: {
						node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
						stream: FS.chrdev_stream_ops
					}
				};
				var node = FS.createNode(parent, name, mode, dev);
				if (FS.isDir(node.mode)) {
					node.node_ops = MEMFS.ops_table.dir.node;
					node.stream_ops = MEMFS.ops_table.dir.stream;
					node.contents = {};
				} else if (FS.isFile(node.mode)) {
					node.node_ops = MEMFS.ops_table.file.node;
					node.stream_ops = MEMFS.ops_table.file.stream;
					node.usedBytes = 0;
					node.contents = null;
				} else if (FS.isLink(node.mode)) {
					node.node_ops = MEMFS.ops_table.link.node;
					node.stream_ops = MEMFS.ops_table.link.stream;
				} else if (FS.isChrdev(node.mode)) {
					node.node_ops = MEMFS.ops_table.chrdev.node;
					node.stream_ops = MEMFS.ops_table.chrdev.stream;
				}
				node.timestamp = Date.now();
				if (parent) {
					parent.contents[name] = node;
					parent.timestamp = node.timestamp;
				}
				return node;
			},
			getFileDataAsTypedArray(node) {
				if (!node.contents) return new Uint8Array(0);
				if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
				return new Uint8Array(node.contents);
			},
			expandFileStorage(node, newCapacity) {
				var prevCapacity = node.contents ? node.contents.length : 0;
				if (prevCapacity >= newCapacity) return;
				var CAPACITY_DOUBLING_MAX = 1024 * 1024;
				newCapacity = Math.max(
					newCapacity,
					(prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0
				);
				if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
				var oldContents = node.contents;
				node.contents = new Uint8Array(newCapacity);
				if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
			},
			resizeFileStorage(node, newSize) {
				if (node.usedBytes == newSize) return;
				if (newSize == 0) {
					node.contents = null;
					node.usedBytes = 0;
				} else {
					var oldContents = node.contents;
					node.contents = new Uint8Array(newSize);
					if (oldContents) {
						node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
					}
					node.usedBytes = newSize;
				}
			},
			node_ops: {
				getattr(node) {
					var attr = {};
					attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
					attr.ino = node.id;
					attr.mode = node.mode;
					attr.nlink = 1;
					attr.uid = 0;
					attr.gid = 0;
					attr.rdev = node.rdev;
					if (FS.isDir(node.mode)) {
						attr.size = 4096;
					} else if (FS.isFile(node.mode)) {
						attr.size = node.usedBytes;
					} else if (FS.isLink(node.mode)) {
						attr.size = node.link.length;
					} else {
						attr.size = 0;
					}
					attr.atime = new Date(node.timestamp);
					attr.mtime = new Date(node.timestamp);
					attr.ctime = new Date(node.timestamp);
					attr.blksize = 4096;
					attr.blocks = Math.ceil(attr.size / attr.blksize);
					return attr;
				},
				setattr(node, attr) {
					if (attr.mode !== undefined) {
						node.mode = attr.mode;
					}
					if (attr.timestamp !== undefined) {
						node.timestamp = attr.timestamp;
					}
					if (attr.size !== undefined) {
						MEMFS.resizeFileStorage(node, attr.size);
					}
				},
				lookup(parent, name) {
					throw FS.genericErrors[44];
				},
				mknod(parent, name, mode, dev) {
					return MEMFS.createNode(parent, name, mode, dev);
				},
				rename(old_node, new_dir, new_name) {
					if (FS.isDir(old_node.mode)) {
						var new_node;
						try {
							new_node = FS.lookupNode(new_dir, new_name);
						} catch (e) {}
						if (new_node) {
							for (var i in new_node.contents) {
								throw new FS.ErrnoError(55);
							}
						}
					}
					delete old_node.parent.contents[old_node.name];
					old_node.parent.timestamp = Date.now();
					old_node.name = new_name;
					new_dir.contents[new_name] = old_node;
					new_dir.timestamp = old_node.parent.timestamp;
					old_node.parent = new_dir;
				},
				unlink(parent, name) {
					delete parent.contents[name];
					parent.timestamp = Date.now();
				},
				rmdir(parent, name) {
					var node = FS.lookupNode(parent, name);
					for (var i in node.contents) {
						throw new FS.ErrnoError(55);
					}
					delete parent.contents[name];
					parent.timestamp = Date.now();
				},
				readdir(node) {
					var entries = ['.', '..'];
					for (var key of Object.keys(node.contents)) {
						entries.push(key);
					}
					return entries;
				},
				symlink(parent, newname, oldpath) {
					var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
					node.link = oldpath;
					return node;
				},
				readlink(node) {
					if (!FS.isLink(node.mode)) {
						throw new FS.ErrnoError(28);
					}
					return node.link;
				}
			},
			stream_ops: {
				read(stream, buffer, offset, length, position) {
					var contents = stream.node.contents;
					if (position >= stream.node.usedBytes) return 0;
					var size = Math.min(stream.node.usedBytes - position, length);
					if (size > 8 && contents.subarray) {
						buffer.set(contents.subarray(position, position + size), offset);
					} else {
						for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
					}
					return size;
				},
				write(stream, buffer, offset, length, position, canOwn) {
					if (buffer.buffer === HEAP8.buffer) {
						canOwn = false;
					}
					if (!length) return 0;
					var node = stream.node;
					node.timestamp = Date.now();
					if (buffer.subarray && (!node.contents || node.contents.subarray)) {
						if (canOwn) {
							node.contents = buffer.subarray(offset, offset + length);
							node.usedBytes = length;
							return length;
						} else if (node.usedBytes === 0 && position === 0) {
							node.contents = buffer.slice(offset, offset + length);
							node.usedBytes = length;
							return length;
						} else if (position + length <= node.usedBytes) {
							node.contents.set(buffer.subarray(offset, offset + length), position);
							return length;
						}
					}
					MEMFS.expandFileStorage(node, position + length);
					if (node.contents.subarray && buffer.subarray) {
						node.contents.set(buffer.subarray(offset, offset + length), position);
					} else {
						for (var i = 0; i < length; i++) {
							node.contents[position + i] = buffer[offset + i];
						}
					}
					node.usedBytes = Math.max(node.usedBytes, position + length);
					return length;
				},
				llseek(stream, offset, whence) {
					var position = offset;
					if (whence === 1) {
						position += stream.position;
					} else if (whence === 2) {
						if (FS.isFile(stream.node.mode)) {
							position += stream.node.usedBytes;
						}
					}
					if (position < 0) {
						throw new FS.ErrnoError(28);
					}
					return position;
				},
				allocate(stream, offset, length) {
					MEMFS.expandFileStorage(stream.node, offset + length);
					stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
				},
				mmap(stream, length, position, prot, flags) {
					if (!FS.isFile(stream.node.mode)) {
						throw new FS.ErrnoError(43);
					}
					var ptr;
					var allocated;
					var contents = stream.node.contents;
					if (!(flags & 2) && contents.buffer === HEAP8.buffer) {
						allocated = false;
						ptr = contents.byteOffset;
					} else {
						if (position > 0 || position + length < contents.length) {
							if (contents.subarray) {
								contents = contents.subarray(position, position + length);
							} else {
								contents = Array.prototype.slice.call(contents, position, position + length);
							}
						}
						allocated = true;
						ptr = mmapAlloc(length);
						if (!ptr) {
							throw new FS.ErrnoError(48);
						}
						HEAP8.set(contents, ptr >>> 0);
					}
					return { ptr: ptr, allocated: allocated };
				},
				msync(stream, buffer, offset, length, mmapFlags) {
					MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
					return 0;
				}
			}
		};
		var asyncLoad = (url, onload, onerror, noRunDep) => {
			var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : '';
			readAsync(
				url,
				(arrayBuffer) => {
					onload(new Uint8Array(arrayBuffer));
					if (dep) removeRunDependency(dep);
				},
				(event) => {
					if (onerror) {
						onerror();
					} else {
						throw `Loading data file "${url}" failed.`;
					}
				}
			);
			if (dep) addRunDependency(dep);
		};
		var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
			FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
		};
		var preloadPlugins = Module['preloadPlugins'] || [];
		var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
			if (typeof Browser != 'undefined') Browser.init();
			var handled = false;
			preloadPlugins.forEach((plugin) => {
				if (handled) return;
				if (plugin['canHandle'](fullname)) {
					plugin['handle'](byteArray, fullname, finish, onerror);
					handled = true;
				}
			});
			return handled;
		};
		var FS_createPreloadedFile = (
			parent,
			name,
			url,
			canRead,
			canWrite,
			onload,
			onerror,
			dontCreateFile,
			canOwn,
			preFinish
		) => {
			var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
			var dep = getUniqueRunDependency(`cp ${fullname}`);
			function processData(byteArray) {
				function finish(byteArray) {
					preFinish?.();
					if (!dontCreateFile) {
						FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
					}
					onload?.();
					removeRunDependency(dep);
				}
				if (
					FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
						onerror?.();
						removeRunDependency(dep);
					})
				) {
					return;
				}
				finish(byteArray);
			}
			addRunDependency(dep);
			if (typeof url == 'string') {
				asyncLoad(url, processData, onerror);
			} else {
				processData(url);
			}
		};
		var FS_modeStringToFlags = (str) => {
			var flagModes = {
				r: 0,
				'r+': 2,
				w: 512 | 64 | 1,
				'w+': 512 | 64 | 2,
				a: 1024 | 64 | 1,
				'a+': 1024 | 64 | 2
			};
			var flags = flagModes[str];
			if (typeof flags == 'undefined') {
				throw new Error(`Unknown file open mode: ${str}`);
			}
			return flags;
		};
		var FS_getMode = (canRead, canWrite) => {
			var mode = 0;
			if (canRead) mode |= 292 | 73;
			if (canWrite) mode |= 146;
			return mode;
		};
		var ERRNO_CODES = {
			EPERM: 63,
			ENOENT: 44,
			ESRCH: 71,
			EINTR: 27,
			EIO: 29,
			ENXIO: 60,
			E2BIG: 1,
			ENOEXEC: 45,
			EBADF: 8,
			ECHILD: 12,
			EAGAIN: 6,
			EWOULDBLOCK: 6,
			ENOMEM: 48,
			EACCES: 2,
			EFAULT: 21,
			ENOTBLK: 105,
			EBUSY: 10,
			EEXIST: 20,
			EXDEV: 75,
			ENODEV: 43,
			ENOTDIR: 54,
			EISDIR: 31,
			EINVAL: 28,
			ENFILE: 41,
			EMFILE: 33,
			ENOTTY: 59,
			ETXTBSY: 74,
			EFBIG: 22,
			ENOSPC: 51,
			ESPIPE: 70,
			EROFS: 69,
			EMLINK: 34,
			EPIPE: 64,
			EDOM: 18,
			ERANGE: 68,
			ENOMSG: 49,
			EIDRM: 24,
			ECHRNG: 106,
			EL2NSYNC: 156,
			EL3HLT: 107,
			EL3RST: 108,
			ELNRNG: 109,
			EUNATCH: 110,
			ENOCSI: 111,
			EL2HLT: 112,
			EDEADLK: 16,
			ENOLCK: 46,
			EBADE: 113,
			EBADR: 114,
			EXFULL: 115,
			ENOANO: 104,
			EBADRQC: 103,
			EBADSLT: 102,
			EDEADLOCK: 16,
			EBFONT: 101,
			ENOSTR: 100,
			ENODATA: 116,
			ETIME: 117,
			ENOSR: 118,
			ENONET: 119,
			ENOPKG: 120,
			EREMOTE: 121,
			ENOLINK: 47,
			EADV: 122,
			ESRMNT: 123,
			ECOMM: 124,
			EPROTO: 65,
			EMULTIHOP: 36,
			EDOTDOT: 125,
			EBADMSG: 9,
			ENOTUNIQ: 126,
			EBADFD: 127,
			EREMCHG: 128,
			ELIBACC: 129,
			ELIBBAD: 130,
			ELIBSCN: 131,
			ELIBMAX: 132,
			ELIBEXEC: 133,
			ENOSYS: 52,
			ENOTEMPTY: 55,
			ENAMETOOLONG: 37,
			ELOOP: 32,
			EOPNOTSUPP: 138,
			EPFNOSUPPORT: 139,
			ECONNRESET: 15,
			ENOBUFS: 42,
			EAFNOSUPPORT: 5,
			EPROTOTYPE: 67,
			ENOTSOCK: 57,
			ENOPROTOOPT: 50,
			ESHUTDOWN: 140,
			ECONNREFUSED: 14,
			EADDRINUSE: 3,
			ECONNABORTED: 13,
			ENETUNREACH: 40,
			ENETDOWN: 38,
			ETIMEDOUT: 73,
			EHOSTDOWN: 142,
			EHOSTUNREACH: 23,
			EINPROGRESS: 26,
			EALREADY: 7,
			EDESTADDRREQ: 17,
			EMSGSIZE: 35,
			EPROTONOSUPPORT: 66,
			ESOCKTNOSUPPORT: 137,
			EADDRNOTAVAIL: 4,
			ENETRESET: 39,
			EISCONN: 30,
			ENOTCONN: 53,
			ETOOMANYREFS: 141,
			EUSERS: 136,
			EDQUOT: 19,
			ESTALE: 72,
			ENOTSUP: 138,
			ENOMEDIUM: 148,
			EILSEQ: 25,
			EOVERFLOW: 61,
			ECANCELED: 11,
			ENOTRECOVERABLE: 56,
			EOWNERDEAD: 62,
			ESTRPIPE: 135
		};
		var NODEFS = {
			isWindows: false,
			staticInit() {
				NODEFS.isWindows = !!process.platform.match(/^win/);
				var flags = process.binding('constants');
				if (flags['fs']) {
					flags = flags['fs'];
				}
				NODEFS.flagsForNodeMap = {
					1024: flags['O_APPEND'],
					64: flags['O_CREAT'],
					128: flags['O_EXCL'],
					256: flags['O_NOCTTY'],
					0: flags['O_RDONLY'],
					2: flags['O_RDWR'],
					4096: flags['O_SYNC'],
					512: flags['O_TRUNC'],
					1: flags['O_WRONLY'],
					131072: flags['O_NOFOLLOW']
				};
			},
			convertNodeCode(e) {
				var code = e.code;
				return ERRNO_CODES[code];
			},
			mount(mount) {
				return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
			},
			createNode(parent, name, mode, dev) {
				if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
					throw new FS.ErrnoError(28);
				}
				var node = FS.createNode(parent, name, mode);
				node.node_ops = NODEFS.node_ops;
				node.stream_ops = NODEFS.stream_ops;
				return node;
			},
			getMode(path) {
				var stat;
				try {
					stat = fs.lstatSync(path);
					if (NODEFS.isWindows) {
						stat.mode = stat.mode | ((stat.mode & 292) >> 2);
					}
				} catch (e) {
					if (!e.code) throw e;
					throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
				}
				return stat.mode;
			},
			realPath(node) {
				var parts = [];
				while (node.parent !== node) {
					parts.push(node.name);
					node = node.parent;
				}
				parts.push(node.mount.opts.root);
				parts.reverse();
				return PATH.join(...parts);
			},
			flagsForNode(flags) {
				flags &= ~2097152;
				flags &= ~2048;
				flags &= ~32768;
				flags &= ~524288;
				flags &= ~65536;
				var newFlags = 0;
				for (var k in NODEFS.flagsForNodeMap) {
					if (flags & k) {
						newFlags |= NODEFS.flagsForNodeMap[k];
						flags ^= k;
					}
				}
				if (flags) {
					throw new FS.ErrnoError(28);
				}
				return newFlags;
			},
			node_ops: {
				getattr(node) {
					var path = NODEFS.realPath(node);
					var stat;
					try {
						stat = fs.lstatSync(path);
					} catch (e) {
						if (!e.code) throw e;
						throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
					}
					if (NODEFS.isWindows && !stat.blksize) {
						stat.blksize = 4096;
					}
					if (NODEFS.isWindows && !stat.blocks) {
						stat.blocks = ((stat.size + stat.blksize - 1) / stat.blksize) | 0;
					}
					return {
						dev: stat.dev,
						ino: stat.ino,
						mode: stat.mode,
						nlink: stat.nlink,
						uid: stat.uid,
						gid: stat.gid,
						rdev: stat.rdev,
						size: stat.size,
						atime: stat.atime,
						mtime: stat.mtime,
						ctime: stat.ctime,
						blksize: stat.blksize,
						blocks: stat.blocks
					};
				},
				setattr(node, attr) {
					var path = NODEFS.realPath(node);
					try {
						if (attr.mode !== undefined) {
							fs.chmodSync(path, attr.mode);
							node.mode = attr.mode;
						}
						if (attr.timestamp !== undefined) {
							var date = new Date(attr.timestamp);
							fs.utimesSync(path, date, date);
						}
						if (attr.size !== undefined) {
							fs.truncateSync(path, attr.size);
						}
					} catch (e) {
						if (!e.code) throw e;
						throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
					}
				},
				lookup(parent, name) {
					var path = PATH.join2(NODEFS.realPath(parent), name);
					var mode = NODEFS.getMode(path);
					return NODEFS.createNode(parent, name, mode);
				},
				mknod(parent, name, mode, dev) {
					var node = NODEFS.createNode(parent, name, mode, dev);
					var path = NODEFS.realPath(node);
					try {
						if (FS.isDir(node.mode)) {
							fs.mkdirSync(path, node.mode);
						} else {
							fs.writeFileSync(path, '', { mode: node.mode });
						}
					} catch (e) {
						if (!e.code) throw e;
						throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
					}
					return node;
				},
				rename(oldNode, newDir, newName) {
					var oldPath = NODEFS.realPath(oldNode);
					var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
					try {
						fs.renameSync(oldPath, newPath);
					} catch (e) {
						if (!e.code) throw e;
						throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
					}
					oldNode.name = newName;
				},
				unlink(parent, name) {
					var path = PATH.join2(NODEFS.realPath(parent), name);
					try {
						fs.unlinkSync(path);
					} catch (e) {
						if (!e.code) throw e;
						throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
					}
				},
				rmdir(parent, name) {
					var path = PATH.join2(NODEFS.realPath(parent), name);
					try {
						fs.rmdirSync(path);
					} catch (e) {
						if (!e.code) throw e;
						throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
					}
				},
				readdir(node) {
					var path = NODEFS.realPath(node);
					try {
						return fs.readdirSync(path);
					} catch (e) {
						if (!e.code) throw e;
						throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
					}
				},
				symlink(parent, newName, oldPath) {
					var newPath = PATH.join2(NODEFS.realPath(parent), newName);
					try {
						fs.symlinkSync(oldPath, newPath);
					} catch (e) {
						if (!e.code) throw e;
						throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
					}
				},
				readlink(node) {
					var path = NODEFS.realPath(node);
					try {
						path = fs.readlinkSync(path);
						path = nodePath.relative(nodePath.resolve(node.mount.opts.root), path);
						return path;
					} catch (e) {
						if (!e.code) throw e;
						if (e.code === 'UNKNOWN') throw new FS.ErrnoError(28);
						throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
					}
				}
			},
			stream_ops: {
				open(stream) {
					var path = NODEFS.realPath(stream.node);
					try {
						if (FS.isFile(stream.node.mode)) {
							stream.shared.refcount = 1;
							stream.nfd = fs.openSync(path, NODEFS.flagsForNode(stream.flags));
						}
					} catch (e) {
						if (!e.code) throw e;
						throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
					}
				},
				close(stream) {
					try {
						if (FS.isFile(stream.node.mode) && stream.nfd && --stream.shared.refcount === 0) {
							fs.closeSync(stream.nfd);
						}
					} catch (e) {
						if (!e.code) throw e;
						throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
					}
				},
				dup(stream) {
					stream.shared.refcount++;
				},
				read(stream, buffer, offset, length, position) {
					if (length === 0) return 0;
					try {
						return fs.readSync(stream.nfd, new Int8Array(buffer.buffer, offset, length), {
							position: position
						});
					} catch (e) {
						throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
					}
				},
				write(stream, buffer, offset, length, position) {
					try {
						return fs.writeSync(stream.nfd, new Int8Array(buffer.buffer, offset, length), {
							position: position
						});
					} catch (e) {
						throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
					}
				},
				llseek(stream, offset, whence) {
					var position = offset;
					if (whence === 1) {
						position += stream.position;
					} else if (whence === 2) {
						if (FS.isFile(stream.node.mode)) {
							try {
								var stat = fs.fstatSync(stream.nfd);
								position += stat.size;
							} catch (e) {
								throw new FS.ErrnoError(NODEFS.convertNodeCode(e));
							}
						}
					}
					if (position < 0) {
						throw new FS.ErrnoError(28);
					}
					return position;
				},
				mmap(stream, length, position, prot, flags) {
					if (!FS.isFile(stream.node.mode)) {
						throw new FS.ErrnoError(43);
					}
					var ptr = mmapAlloc(length);
					NODEFS.stream_ops.read(stream, HEAP8, ptr, length, position);
					return { ptr: ptr, allocated: true };
				},
				msync(stream, buffer, offset, length, mmapFlags) {
					NODEFS.stream_ops.write(stream, buffer, 0, length, offset, false);
					return 0;
				}
			}
		};
		var FS = {
			root: null,
			mounts: [],
			devices: {},
			streams: [],
			nextInode: 1,
			nameTable: null,
			currentPath: '/',
			initialized: false,
			ignorePermissions: true,
			ErrnoError: class {
				constructor(errno) {
					this.name = 'ErrnoError';
					this.errno = errno;
				}
			},
			genericErrors: {},
			filesystems: null,
			syncFSRequests: 0,
			FSStream: class {
				constructor() {
					this.shared = {};
				}
				get object() {
					return this.node;
				}
				set object(val) {
					this.node = val;
				}
				get isRead() {
					return (this.flags & 2097155) !== 1;
				}
				get isWrite() {
					return (this.flags & 2097155) !== 0;
				}
				get isAppend() {
					return this.flags & 1024;
				}
				get flags() {
					return this.shared.flags;
				}
				set flags(val) {
					this.shared.flags = val;
				}
				get position() {
					return this.shared.position;
				}
				set position(val) {
					this.shared.position = val;
				}
			},
			FSNode: class {
				constructor(parent, name, mode, rdev) {
					if (!parent) {
						parent = this;
					}
					this.parent = parent;
					this.mount = parent.mount;
					this.mounted = null;
					this.id = FS.nextInode++;
					this.name = name;
					this.mode = mode;
					this.node_ops = {};
					this.stream_ops = {};
					this.rdev = rdev;
					this.readMode = 292 | 73;
					this.writeMode = 146;
				}
				get read() {
					return (this.mode & this.readMode) === this.readMode;
				}
				set read(val) {
					val ? (this.mode |= this.readMode) : (this.mode &= ~this.readMode);
				}
				get write() {
					return (this.mode & this.writeMode) === this.writeMode;
				}
				set write(val) {
					val ? (this.mode |= this.writeMode) : (this.mode &= ~this.writeMode);
				}
				get isFolder() {
					return FS.isDir(this.mode);
				}
				get isDevice() {
					return FS.isChrdev(this.mode);
				}
			},
			lookupPath(path, opts = {}) {
				path = PATH_FS.resolve(path);
				if (!path) return { path: '', node: null };
				var defaults = { follow_mount: true, recurse_count: 0 };
				opts = Object.assign(defaults, opts);
				if (opts.recurse_count > 8) {
					throw new FS.ErrnoError(32);
				}
				var parts = path.split('/').filter((p) => !!p);
				var current = FS.root;
				var current_path = '/';
				for (var i = 0; i < parts.length; i++) {
					var islast = i === parts.length - 1;
					if (islast && opts.parent) {
						break;
					}
					current = FS.lookupNode(current, parts[i]);
					current_path = PATH.join2(current_path, parts[i]);
					if (FS.isMountpoint(current)) {
						if (!islast || (islast && opts.follow_mount)) {
							current = current.mounted.root;
						}
					}
					if (!islast || opts.follow) {
						var count = 0;
						while (FS.isLink(current.mode)) {
							var link = FS.readlink(current_path);
							current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
							var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count + 1 });
							current = lookup.node;
							if (count++ > 40) {
								throw new FS.ErrnoError(32);
							}
						}
					}
				}
				return { path: current_path, node: current };
			},
			getPath(node) {
				var path;
				while (true) {
					if (FS.isRoot(node)) {
						var mount = node.mount.mountpoint;
						if (!path) return mount;
						return mount[mount.length - 1] !== '/' ? `${mount}/${path}` : mount + path;
					}
					path = path ? `${node.name}/${path}` : node.name;
					node = node.parent;
				}
			},
			hashName(parentid, name) {
				var hash = 0;
				for (var i = 0; i < name.length; i++) {
					hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
				}
				return ((parentid + hash) >>> 0) % FS.nameTable.length;
			},
			hashAddNode(node) {
				var hash = FS.hashName(node.parent.id, node.name);
				node.name_next = FS.nameTable[hash];
				FS.nameTable[hash] = node;
			},
			hashRemoveNode(node) {
				var hash = FS.hashName(node.parent.id, node.name);
				if (FS.nameTable[hash] === node) {
					FS.nameTable[hash] = node.name_next;
				} else {
					var current = FS.nameTable[hash];
					while (current) {
						if (current.name_next === node) {
							current.name_next = node.name_next;
							break;
						}
						current = current.name_next;
					}
				}
			},
			lookupNode(parent, name) {
				var errCode = FS.mayLookup(parent);
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				var hash = FS.hashName(parent.id, name);
				for (var node = FS.nameTable[hash]; node; node = node.name_next) {
					var nodeName = node.name;
					if (node.parent.id === parent.id && nodeName === name) {
						return node;
					}
				}
				return FS.lookup(parent, name);
			},
			createNode(parent, name, mode, rdev) {
				var node = new FS.FSNode(parent, name, mode, rdev);
				FS.hashAddNode(node);
				return node;
			},
			destroyNode(node) {
				FS.hashRemoveNode(node);
			},
			isRoot(node) {
				return node === node.parent;
			},
			isMountpoint(node) {
				return !!node.mounted;
			},
			isFile(mode) {
				return (mode & 61440) === 32768;
			},
			isDir(mode) {
				return (mode & 61440) === 16384;
			},
			isLink(mode) {
				return (mode & 61440) === 40960;
			},
			isChrdev(mode) {
				return (mode & 61440) === 8192;
			},
			isBlkdev(mode) {
				return (mode & 61440) === 24576;
			},
			isFIFO(mode) {
				return (mode & 61440) === 4096;
			},
			isSocket(mode) {
				return (mode & 49152) === 49152;
			},
			flagsToPermissionString(flag) {
				var perms = ['r', 'w', 'rw'][flag & 3];
				if (flag & 512) {
					perms += 'w';
				}
				return perms;
			},
			nodePermissions(node, perms) {
				if (FS.ignorePermissions) {
					return 0;
				}
				if (perms.includes('r') && !(node.mode & 292)) {
					return 2;
				} else if (perms.includes('w') && !(node.mode & 146)) {
					return 2;
				} else if (perms.includes('x') && !(node.mode & 73)) {
					return 2;
				}
				return 0;
			},
			mayLookup(dir) {
				if (!FS.isDir(dir.mode)) return 54;
				var errCode = FS.nodePermissions(dir, 'x');
				if (errCode) return errCode;
				if (!dir.node_ops.lookup) return 2;
				return 0;
			},
			mayCreate(dir, name) {
				try {
					var node = FS.lookupNode(dir, name);
					return 20;
				} catch (e) {}
				return FS.nodePermissions(dir, 'wx');
			},
			mayDelete(dir, name, isdir) {
				var node;
				try {
					node = FS.lookupNode(dir, name);
				} catch (e) {
					return e.errno;
				}
				var errCode = FS.nodePermissions(dir, 'wx');
				if (errCode) {
					return errCode;
				}
				if (isdir) {
					if (!FS.isDir(node.mode)) {
						return 54;
					}
					if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
						return 10;
					}
				} else {
					if (FS.isDir(node.mode)) {
						return 31;
					}
				}
				return 0;
			},
			mayOpen(node, flags) {
				if (!node) {
					return 44;
				}
				if (FS.isLink(node.mode)) {
					return 32;
				} else if (FS.isDir(node.mode)) {
					if (FS.flagsToPermissionString(flags) !== 'r' || flags & 512) {
						return 31;
					}
				}
				return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
			},
			MAX_OPEN_FDS: 4096,
			nextfd() {
				for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
					if (!FS.streams[fd]) {
						return fd;
					}
				}
				throw new FS.ErrnoError(33);
			},
			getStreamChecked(fd) {
				var stream = FS.getStream(fd);
				if (!stream) {
					throw new FS.ErrnoError(8);
				}
				return stream;
			},
			getStream: (fd) => FS.streams[fd],
			createStream(stream, fd = -1) {
				stream = Object.assign(new FS.FSStream(), stream);
				if (fd == -1) {
					fd = FS.nextfd();
				}
				stream.fd = fd;
				FS.streams[fd] = stream;
				return stream;
			},
			closeStream(fd) {
				FS.streams[fd] = null;
			},
			dupStream(origStream, fd = -1) {
				var stream = FS.createStream(origStream, fd);
				stream.stream_ops?.dup?.(stream);
				return stream;
			},
			chrdev_stream_ops: {
				open(stream) {
					var device = FS.getDevice(stream.node.rdev);
					stream.stream_ops = device.stream_ops;
					stream.stream_ops.open?.(stream);
				},
				llseek() {
					throw new FS.ErrnoError(70);
				}
			},
			major: (dev) => dev >> 8,
			minor: (dev) => dev & 255,
			makedev: (ma, mi) => (ma << 8) | mi,
			registerDevice(dev, ops) {
				FS.devices[dev] = { stream_ops: ops };
			},
			getDevice: (dev) => FS.devices[dev],
			getMounts(mount) {
				var mounts = [];
				var check = [mount];
				while (check.length) {
					var m = check.pop();
					mounts.push(m);
					check.push(...m.mounts);
				}
				return mounts;
			},
			syncfs(populate, callback) {
				if (typeof populate == 'function') {
					callback = populate;
					populate = false;
				}
				FS.syncFSRequests++;
				if (FS.syncFSRequests > 1) {
					err(
						`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`
					);
				}
				var mounts = FS.getMounts(FS.root.mount);
				var completed = 0;
				function doCallback(errCode) {
					FS.syncFSRequests--;
					return callback(errCode);
				}
				function done(errCode) {
					if (errCode) {
						if (!done.errored) {
							done.errored = true;
							return doCallback(errCode);
						}
						return;
					}
					if (++completed >= mounts.length) {
						doCallback(null);
					}
				}
				mounts.forEach((mount) => {
					if (!mount.type.syncfs) {
						return done(null);
					}
					mount.type.syncfs(mount, populate, done);
				});
			},
			mount(type, opts, mountpoint) {
				var root = mountpoint === '/';
				var pseudo = !mountpoint;
				var node;
				if (root && FS.root) {
					throw new FS.ErrnoError(10);
				} else if (!root && !pseudo) {
					var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
					mountpoint = lookup.path;
					node = lookup.node;
					if (FS.isMountpoint(node)) {
						throw new FS.ErrnoError(10);
					}
					if (!FS.isDir(node.mode)) {
						throw new FS.ErrnoError(54);
					}
				}
				var mount = { type: type, opts: opts, mountpoint: mountpoint, mounts: [] };
				var mountRoot = type.mount(mount);
				mountRoot.mount = mount;
				mount.root = mountRoot;
				if (root) {
					FS.root = mountRoot;
				} else if (node) {
					node.mounted = mount;
					if (node.mount) {
						node.mount.mounts.push(mount);
					}
				}
				return mountRoot;
			},
			unmount(mountpoint) {
				var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
				if (!FS.isMountpoint(lookup.node)) {
					throw new FS.ErrnoError(28);
				}
				var node = lookup.node;
				var mount = node.mounted;
				var mounts = FS.getMounts(mount);
				Object.keys(FS.nameTable).forEach((hash) => {
					var current = FS.nameTable[hash];
					while (current) {
						var next = current.name_next;
						if (mounts.includes(current.mount)) {
							FS.destroyNode(current);
						}
						current = next;
					}
				});
				node.mounted = null;
				var idx = node.mount.mounts.indexOf(mount);
				node.mount.mounts.splice(idx, 1);
			},
			lookup(parent, name) {
				return parent.node_ops.lookup(parent, name);
			},
			mknod(path, mode, dev) {
				var lookup = FS.lookupPath(path, { parent: true });
				var parent = lookup.node;
				var name = PATH.basename(path);
				if (!name || name === '.' || name === '..') {
					throw new FS.ErrnoError(28);
				}
				var errCode = FS.mayCreate(parent, name);
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				if (!parent.node_ops.mknod) {
					throw new FS.ErrnoError(63);
				}
				return parent.node_ops.mknod(parent, name, mode, dev);
			},
			create(path, mode) {
				mode = mode !== undefined ? mode : 438;
				mode &= 4095;
				mode |= 32768;
				return FS.mknod(path, mode, 0);
			},
			mkdir(path, mode) {
				mode = mode !== undefined ? mode : 511;
				mode &= 511 | 512;
				mode |= 16384;
				return FS.mknod(path, mode, 0);
			},
			mkdirTree(path, mode) {
				var dirs = path.split('/');
				var d = '';
				for (var i = 0; i < dirs.length; ++i) {
					if (!dirs[i]) continue;
					d += '/' + dirs[i];
					try {
						FS.mkdir(d, mode);
					} catch (e) {
						if (e.errno != 20) throw e;
					}
				}
			},
			mkdev(path, mode, dev) {
				if (typeof dev == 'undefined') {
					dev = mode;
					mode = 438;
				}
				mode |= 8192;
				return FS.mknod(path, mode, dev);
			},
			symlink(oldpath, newpath) {
				if (!PATH_FS.resolve(oldpath)) {
					throw new FS.ErrnoError(44);
				}
				var lookup = FS.lookupPath(newpath, { parent: true });
				var parent = lookup.node;
				if (!parent) {
					throw new FS.ErrnoError(44);
				}
				var newname = PATH.basename(newpath);
				var errCode = FS.mayCreate(parent, newname);
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				if (!parent.node_ops.symlink) {
					throw new FS.ErrnoError(63);
				}
				return parent.node_ops.symlink(parent, newname, oldpath);
			},
			rename(old_path, new_path) {
				var old_dirname = PATH.dirname(old_path);
				var new_dirname = PATH.dirname(new_path);
				var old_name = PATH.basename(old_path);
				var new_name = PATH.basename(new_path);
				var lookup, old_dir, new_dir;
				lookup = FS.lookupPath(old_path, { parent: true });
				old_dir = lookup.node;
				lookup = FS.lookupPath(new_path, { parent: true });
				new_dir = lookup.node;
				if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
				if (old_dir.mount !== new_dir.mount) {
					throw new FS.ErrnoError(75);
				}
				var old_node = FS.lookupNode(old_dir, old_name);
				var relative = PATH_FS.relative(old_path, new_dirname);
				if (relative.charAt(0) !== '.') {
					throw new FS.ErrnoError(28);
				}
				relative = PATH_FS.relative(new_path, old_dirname);
				if (relative.charAt(0) !== '.') {
					throw new FS.ErrnoError(55);
				}
				var new_node;
				try {
					new_node = FS.lookupNode(new_dir, new_name);
				} catch (e) {}
				if (old_node === new_node) {
					return;
				}
				var isdir = FS.isDir(old_node.mode);
				var errCode = FS.mayDelete(old_dir, old_name, isdir);
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				errCode = new_node
					? FS.mayDelete(new_dir, new_name, isdir)
					: FS.mayCreate(new_dir, new_name);
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				if (!old_dir.node_ops.rename) {
					throw new FS.ErrnoError(63);
				}
				if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
					throw new FS.ErrnoError(10);
				}
				if (new_dir !== old_dir) {
					errCode = FS.nodePermissions(old_dir, 'w');
					if (errCode) {
						throw new FS.ErrnoError(errCode);
					}
				}
				FS.hashRemoveNode(old_node);
				try {
					old_dir.node_ops.rename(old_node, new_dir, new_name);
				} catch (e) {
					throw e;
				} finally {
					FS.hashAddNode(old_node);
				}
			},
			rmdir(path) {
				var lookup = FS.lookupPath(path, { parent: true });
				var parent = lookup.node;
				var name = PATH.basename(path);
				var node = FS.lookupNode(parent, name);
				var errCode = FS.mayDelete(parent, name, true);
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				if (!parent.node_ops.rmdir) {
					throw new FS.ErrnoError(63);
				}
				if (FS.isMountpoint(node)) {
					throw new FS.ErrnoError(10);
				}
				parent.node_ops.rmdir(parent, name);
				FS.destroyNode(node);
			},
			readdir(path) {
				var lookup = FS.lookupPath(path, { follow: true });
				var node = lookup.node;
				if (!node.node_ops.readdir) {
					throw new FS.ErrnoError(54);
				}
				return node.node_ops.readdir(node);
			},
			unlink(path) {
				var lookup = FS.lookupPath(path, { parent: true });
				var parent = lookup.node;
				if (!parent) {
					throw new FS.ErrnoError(44);
				}
				var name = PATH.basename(path);
				var node = FS.lookupNode(parent, name);
				var errCode = FS.mayDelete(parent, name, false);
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				if (!parent.node_ops.unlink) {
					throw new FS.ErrnoError(63);
				}
				if (FS.isMountpoint(node)) {
					throw new FS.ErrnoError(10);
				}
				parent.node_ops.unlink(parent, name);
				FS.destroyNode(node);
			},
			readlink(path) {
				var lookup = FS.lookupPath(path);
				var link = lookup.node;
				if (!link) {
					throw new FS.ErrnoError(44);
				}
				if (!link.node_ops.readlink) {
					throw new FS.ErrnoError(28);
				}
				return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
			},
			stat(path, dontFollow) {
				var lookup = FS.lookupPath(path, { follow: !dontFollow });
				var node = lookup.node;
				if (!node) {
					throw new FS.ErrnoError(44);
				}
				if (!node.node_ops.getattr) {
					throw new FS.ErrnoError(63);
				}
				return node.node_ops.getattr(node);
			},
			lstat(path) {
				return FS.stat(path, true);
			},
			chmod(path, mode, dontFollow) {
				var node;
				if (typeof path == 'string') {
					var lookup = FS.lookupPath(path, { follow: !dontFollow });
					node = lookup.node;
				} else {
					node = path;
				}
				if (!node.node_ops.setattr) {
					throw new FS.ErrnoError(63);
				}
				node.node_ops.setattr(node, {
					mode: (mode & 4095) | (node.mode & ~4095),
					timestamp: Date.now()
				});
			},
			lchmod(path, mode) {
				FS.chmod(path, mode, true);
			},
			fchmod(fd, mode) {
				var stream = FS.getStreamChecked(fd);
				FS.chmod(stream.node, mode);
			},
			chown(path, uid, gid, dontFollow) {
				var node;
				if (typeof path == 'string') {
					var lookup = FS.lookupPath(path, { follow: !dontFollow });
					node = lookup.node;
				} else {
					node = path;
				}
				if (!node.node_ops.setattr) {
					throw new FS.ErrnoError(63);
				}
				node.node_ops.setattr(node, { timestamp: Date.now() });
			},
			lchown(path, uid, gid) {
				FS.chown(path, uid, gid, true);
			},
			fchown(fd, uid, gid) {
				var stream = FS.getStreamChecked(fd);
				FS.chown(stream.node, uid, gid);
			},
			truncate(path, len) {
				if (len < 0) {
					throw new FS.ErrnoError(28);
				}
				var node;
				if (typeof path == 'string') {
					var lookup = FS.lookupPath(path, { follow: true });
					node = lookup.node;
				} else {
					node = path;
				}
				if (!node.node_ops.setattr) {
					throw new FS.ErrnoError(63);
				}
				if (FS.isDir(node.mode)) {
					throw new FS.ErrnoError(31);
				}
				if (!FS.isFile(node.mode)) {
					throw new FS.ErrnoError(28);
				}
				var errCode = FS.nodePermissions(node, 'w');
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				node.node_ops.setattr(node, { size: len, timestamp: Date.now() });
			},
			ftruncate(fd, len) {
				var stream = FS.getStreamChecked(fd);
				if ((stream.flags & 2097155) === 0) {
					throw new FS.ErrnoError(28);
				}
				FS.truncate(stream.node, len);
			},
			utime(path, atime, mtime) {
				var lookup = FS.lookupPath(path, { follow: true });
				var node = lookup.node;
				node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
			},
			open(path, flags, mode) {
				if (path === '') {
					throw new FS.ErrnoError(44);
				}
				flags = typeof flags == 'string' ? FS_modeStringToFlags(flags) : flags;
				mode = typeof mode == 'undefined' ? 438 : mode;
				if (flags & 64) {
					mode = (mode & 4095) | 32768;
				} else {
					mode = 0;
				}
				var node;
				if (typeof path == 'object') {
					node = path;
				} else {
					path = PATH.normalize(path);
					try {
						var lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
						node = lookup.node;
					} catch (e) {}
				}
				var created = false;
				if (flags & 64) {
					if (node) {
						if (flags & 128) {
							throw new FS.ErrnoError(20);
						}
					} else {
						node = FS.mknod(path, mode, 0);
						created = true;
					}
				}
				if (!node) {
					throw new FS.ErrnoError(44);
				}
				if (FS.isChrdev(node.mode)) {
					flags &= ~512;
				}
				if (flags & 65536 && !FS.isDir(node.mode)) {
					throw new FS.ErrnoError(54);
				}
				if (!created) {
					var errCode = FS.mayOpen(node, flags);
					if (errCode) {
						throw new FS.ErrnoError(errCode);
					}
				}
				if (flags & 512 && !created) {
					FS.truncate(node, 0);
				}
				flags &= ~(128 | 512 | 131072);
				var stream = FS.createStream({
					node: node,
					path: FS.getPath(node),
					flags: flags,
					seekable: true,
					position: 0,
					stream_ops: node.stream_ops,
					ungotten: [],
					error: false
				});
				if (stream.stream_ops.open) {
					stream.stream_ops.open(stream);
				}
				if (Module['logReadFiles'] && !(flags & 1)) {
					if (!FS.readFiles) FS.readFiles = {};
					if (!(path in FS.readFiles)) {
						FS.readFiles[path] = 1;
					}
				}
				return stream;
			},
			close(stream) {
				if (FS.isClosed(stream)) {
					throw new FS.ErrnoError(8);
				}
				if (stream.getdents) stream.getdents = null;
				try {
					if (stream.stream_ops.close) {
						stream.stream_ops.close(stream);
					}
				} catch (e) {
					throw e;
				} finally {
					FS.closeStream(stream.fd);
				}
				stream.fd = null;
			},
			isClosed(stream) {
				return stream.fd === null;
			},
			llseek(stream, offset, whence) {
				if (FS.isClosed(stream)) {
					throw new FS.ErrnoError(8);
				}
				if (!stream.seekable || !stream.stream_ops.llseek) {
					throw new FS.ErrnoError(70);
				}
				if (whence != 0 && whence != 1 && whence != 2) {
					throw new FS.ErrnoError(28);
				}
				stream.position = stream.stream_ops.llseek(stream, offset, whence);
				stream.ungotten = [];
				return stream.position;
			},
			read(stream, buffer, offset, length, position) {
				if (length < 0 || position < 0) {
					throw new FS.ErrnoError(28);
				}
				if (FS.isClosed(stream)) {
					throw new FS.ErrnoError(8);
				}
				if ((stream.flags & 2097155) === 1) {
					throw new FS.ErrnoError(8);
				}
				if (FS.isDir(stream.node.mode)) {
					throw new FS.ErrnoError(31);
				}
				if (!stream.stream_ops.read) {
					throw new FS.ErrnoError(28);
				}
				var seeking = typeof position != 'undefined';
				if (!seeking) {
					position = stream.position;
				} else if (!stream.seekable) {
					throw new FS.ErrnoError(70);
				}
				var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
				if (!seeking) stream.position += bytesRead;
				return bytesRead;
			},
			write(stream, buffer, offset, length, position, canOwn) {
				if (length < 0 || position < 0) {
					throw new FS.ErrnoError(28);
				}
				if (FS.isClosed(stream)) {
					throw new FS.ErrnoError(8);
				}
				if ((stream.flags & 2097155) === 0) {
					throw new FS.ErrnoError(8);
				}
				if (FS.isDir(stream.node.mode)) {
					throw new FS.ErrnoError(31);
				}
				if (!stream.stream_ops.write) {
					throw new FS.ErrnoError(28);
				}
				if (stream.seekable && stream.flags & 1024) {
					FS.llseek(stream, 0, 2);
				}
				var seeking = typeof position != 'undefined';
				if (!seeking) {
					position = stream.position;
				} else if (!stream.seekable) {
					throw new FS.ErrnoError(70);
				}
				var bytesWritten = stream.stream_ops.write(
					stream,
					buffer,
					offset,
					length,
					position,
					canOwn
				);
				if (!seeking) stream.position += bytesWritten;
				return bytesWritten;
			},
			allocate(stream, offset, length) {
				if (FS.isClosed(stream)) {
					throw new FS.ErrnoError(8);
				}
				if (offset < 0 || length <= 0) {
					throw new FS.ErrnoError(28);
				}
				if ((stream.flags & 2097155) === 0) {
					throw new FS.ErrnoError(8);
				}
				if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
					throw new FS.ErrnoError(43);
				}
				if (!stream.stream_ops.allocate) {
					throw new FS.ErrnoError(138);
				}
				stream.stream_ops.allocate(stream, offset, length);
			},
			mmap(stream, length, position, prot, flags) {
				if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
					throw new FS.ErrnoError(2);
				}
				if ((stream.flags & 2097155) === 1) {
					throw new FS.ErrnoError(2);
				}
				if (!stream.stream_ops.mmap) {
					throw new FS.ErrnoError(43);
				}
				return stream.stream_ops.mmap(stream, length, position, prot, flags);
			},
			msync(stream, buffer, offset, length, mmapFlags) {
				if (!stream.stream_ops.msync) {
					return 0;
				}
				return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
			},
			ioctl(stream, cmd, arg) {
				if (!stream.stream_ops.ioctl) {
					throw new FS.ErrnoError(59);
				}
				return stream.stream_ops.ioctl(stream, cmd, arg);
			},
			readFile(path, opts = {}) {
				opts.flags = opts.flags || 0;
				opts.encoding = opts.encoding || 'binary';
				if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
					throw new Error(`Invalid encoding type "${opts.encoding}"`);
				}
				var ret;
				var stream = FS.open(path, opts.flags);
				var stat = FS.stat(path);
				var length = stat.size;
				var buf = new Uint8Array(length);
				FS.read(stream, buf, 0, length, 0);
				if (opts.encoding === 'utf8') {
					ret = UTF8ArrayToString(buf, 0);
				} else if (opts.encoding === 'binary') {
					ret = buf;
				}
				FS.close(stream);
				return ret;
			},
			writeFile(path, data, opts = {}) {
				opts.flags = opts.flags || 577;
				var stream = FS.open(path, opts.flags, opts.mode);
				if (typeof data == 'string') {
					var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
					var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
					FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
				} else if (ArrayBuffer.isView(data)) {
					FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
				} else {
					throw new Error('Unsupported data type');
				}
				FS.close(stream);
			},
			cwd: () => FS.currentPath,
			chdir(path) {
				var lookup = FS.lookupPath(path, { follow: true });
				if (lookup.node === null) {
					throw new FS.ErrnoError(44);
				}
				if (!FS.isDir(lookup.node.mode)) {
					throw new FS.ErrnoError(54);
				}
				var errCode = FS.nodePermissions(lookup.node, 'x');
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				FS.currentPath = lookup.path;
			},
			createDefaultDirectories() {
				FS.mkdir('/tmp');
				FS.mkdir('/home');
				FS.mkdir('/home/web_user');
			},
			createDefaultDevices() {
				FS.mkdir('/dev');
				FS.registerDevice(FS.makedev(1, 3), {
					read: () => 0,
					write: (stream, buffer, offset, length, pos) => length
				});
				FS.mkdev('/dev/null', FS.makedev(1, 3));
				TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
				TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
				FS.mkdev('/dev/tty', FS.makedev(5, 0));
				FS.mkdev('/dev/tty1', FS.makedev(6, 0));
				var randomBuffer = new Uint8Array(1024),
					randomLeft = 0;
				var randomByte = () => {
					if (randomLeft === 0) {
						randomLeft = randomFill(randomBuffer).byteLength;
					}
					return randomBuffer[--randomLeft];
				};
				FS.createDevice('/dev', 'random', randomByte);
				FS.createDevice('/dev', 'urandom', randomByte);
				FS.mkdir('/dev/shm');
				FS.mkdir('/dev/shm/tmp');
			},
			createSpecialDirectories() {
				FS.mkdir('/proc');
				var proc_self = FS.mkdir('/proc/self');
				FS.mkdir('/proc/self/fd');
				FS.mount(
					{
						mount() {
							var node = FS.createNode(proc_self, 'fd', 16384 | 511, 73);
							node.node_ops = {
								lookup(parent, name) {
									var fd = +name;
									var stream = FS.getStreamChecked(fd);
									var ret = {
										parent: null,
										mount: { mountpoint: 'fake' },
										node_ops: { readlink: () => stream.path }
									};
									ret.parent = ret;
									return ret;
								}
							};
							return node;
						}
					},
					{},
					'/proc/self/fd'
				);
			},
			createStandardStreams() {
				if (Module['stdin']) {
					FS.createDevice('/dev', 'stdin', Module['stdin']);
				} else {
					FS.symlink('/dev/tty', '/dev/stdin');
				}
				if (Module['stdout']) {
					FS.createDevice('/dev', 'stdout', null, Module['stdout']);
				} else {
					FS.symlink('/dev/tty', '/dev/stdout');
				}
				if (Module['stderr']) {
					FS.createDevice('/dev', 'stderr', null, Module['stderr']);
				} else {
					FS.symlink('/dev/tty1', '/dev/stderr');
				}
				var stdin = FS.open('/dev/stdin', 0);
				var stdout = FS.open('/dev/stdout', 1);
				var stderr = FS.open('/dev/stderr', 1);
			},
			staticInit() {
				[44].forEach((code) => {
					FS.genericErrors[code] = new FS.ErrnoError(code);
					FS.genericErrors[code].stack = '<generic error, no stack>';
				});
				FS.nameTable = new Array(4096);
				FS.mount(MEMFS, {}, '/');
				FS.createDefaultDirectories();
				FS.createDefaultDevices();
				FS.createSpecialDirectories();
				FS.filesystems = { MEMFS: MEMFS, NODEFS: NODEFS };
			},
			init(input, output, error) {
				FS.init.initialized = true;
				Module['stdin'] = input || Module['stdin'];
				Module['stdout'] = output || Module['stdout'];
				Module['stderr'] = error || Module['stderr'];
				FS.createStandardStreams();
			},
			quit() {
				FS.init.initialized = false;
				for (var i = 0; i < FS.streams.length; i++) {
					var stream = FS.streams[i];
					if (!stream) {
						continue;
					}
					FS.close(stream);
				}
			},
			findObject(path, dontResolveLastLink) {
				var ret = FS.analyzePath(path, dontResolveLastLink);
				if (!ret.exists) {
					return null;
				}
				return ret.object;
			},
			analyzePath(path, dontResolveLastLink) {
				try {
					var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
					path = lookup.path;
				} catch (e) {}
				var ret = {
					isRoot: false,
					exists: false,
					error: 0,
					name: null,
					path: null,
					object: null,
					parentExists: false,
					parentPath: null,
					parentObject: null
				};
				try {
					var lookup = FS.lookupPath(path, { parent: true });
					ret.parentExists = true;
					ret.parentPath = lookup.path;
					ret.parentObject = lookup.node;
					ret.name = PATH.basename(path);
					lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
					ret.exists = true;
					ret.path = lookup.path;
					ret.object = lookup.node;
					ret.name = lookup.node.name;
					ret.isRoot = lookup.path === '/';
				} catch (e) {
					ret.error = e.errno;
				}
				return ret;
			},
			createPath(parent, path, canRead, canWrite) {
				parent = typeof parent == 'string' ? parent : FS.getPath(parent);
				var parts = path.split('/').reverse();
				while (parts.length) {
					var part = parts.pop();
					if (!part) continue;
					var current = PATH.join2(parent, part);
					try {
						FS.mkdir(current);
					} catch (e) {}
					parent = current;
				}
				return current;
			},
			createFile(parent, name, properties, canRead, canWrite) {
				var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
				var mode = FS_getMode(canRead, canWrite);
				return FS.create(path, mode);
			},
			createDataFile(parent, name, data, canRead, canWrite, canOwn) {
				var path = name;
				if (parent) {
					parent = typeof parent == 'string' ? parent : FS.getPath(parent);
					path = name ? PATH.join2(parent, name) : parent;
				}
				var mode = FS_getMode(canRead, canWrite);
				var node = FS.create(path, mode);
				if (data) {
					if (typeof data == 'string') {
						var arr = new Array(data.length);
						for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
						data = arr;
					}
					FS.chmod(node, mode | 146);
					var stream = FS.open(node, 577);
					FS.write(stream, data, 0, data.length, 0, canOwn);
					FS.close(stream);
					FS.chmod(node, mode);
				}
			},
			createDevice(parent, name, input, output) {
				var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
				var mode = FS_getMode(!!input, !!output);
				if (!FS.createDevice.major) FS.createDevice.major = 64;
				var dev = FS.makedev(FS.createDevice.major++, 0);
				FS.registerDevice(dev, {
					open(stream) {
						stream.seekable = false;
					},
					close(stream) {
						if (output?.buffer?.length) {
							output(10);
						}
					},
					read(stream, buffer, offset, length, pos) {
						var bytesRead = 0;
						for (var i = 0; i < length; i++) {
							var result;
							try {
								result = input();
							} catch (e) {
								throw new FS.ErrnoError(29);
							}
							if (result === undefined && bytesRead === 0) {
								throw new FS.ErrnoError(6);
							}
							if (result === null || result === undefined) break;
							bytesRead++;
							buffer[offset + i] = result;
						}
						if (bytesRead) {
							stream.node.timestamp = Date.now();
						}
						return bytesRead;
					},
					write(stream, buffer, offset, length, pos) {
						for (var i = 0; i < length; i++) {
							try {
								output(buffer[offset + i]);
							} catch (e) {
								throw new FS.ErrnoError(29);
							}
						}
						if (length) {
							stream.node.timestamp = Date.now();
						}
						return i;
					}
				});
				return FS.mkdev(path, mode, dev);
			},
			forceLoadFile(obj) {
				if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
				if (typeof XMLHttpRequest != 'undefined') {
					throw new Error(
						'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.'
					);
				} else if (read_) {
					try {
						obj.contents = intArrayFromString(read_(obj.url), true);
						obj.usedBytes = obj.contents.length;
					} catch (e) {
						throw new FS.ErrnoError(29);
					}
				} else {
					throw new Error('Cannot load without read() or XMLHttpRequest.');
				}
			},
			createLazyFile(parent, name, url, canRead, canWrite) {
				class LazyUint8Array {
					constructor() {
						this.lengthKnown = false;
						this.chunks = [];
					}
					get(idx) {
						if (idx > this.length - 1 || idx < 0) {
							return undefined;
						}
						var chunkOffset = idx % this.chunkSize;
						var chunkNum = (idx / this.chunkSize) | 0;
						return this.getter(chunkNum)[chunkOffset];
					}
					setDataGetter(getter) {
						this.getter = getter;
					}
					cacheLength() {
						var xhr = new XMLHttpRequest();
						xhr.open('HEAD', url, false);
						xhr.send(null);
						if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
							throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
						var datalength = Number(xhr.getResponseHeader('Content-length'));
						var header;
						var hasByteServing =
							(header = xhr.getResponseHeader('Accept-Ranges')) && header === 'bytes';
						var usesGzip =
							(header = xhr.getResponseHeader('Content-Encoding')) && header === 'gzip';
						var chunkSize = 1024 * 1024;
						if (!hasByteServing) chunkSize = datalength;
						var doXHR = (from, to) => {
							if (from > to)
								throw new Error('invalid range (' + from + ', ' + to + ') or no bytes requested!');
							if (to > datalength - 1)
								throw new Error('only ' + datalength + ' bytes available! programmer error!');
							var xhr = new XMLHttpRequest();
							xhr.open('GET', url, false);
							if (datalength !== chunkSize)
								xhr.setRequestHeader('Range', 'bytes=' + from + '-' + to);
							xhr.responseType = 'arraybuffer';
							if (xhr.overrideMimeType) {
								xhr.overrideMimeType('text/plain; charset=x-user-defined');
							}
							xhr.send(null);
							if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
								throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
							if (xhr.response !== undefined) {
								return new Uint8Array(xhr.response || []);
							}
							return intArrayFromString(xhr.responseText || '', true);
						};
						var lazyArray = this;
						lazyArray.setDataGetter((chunkNum) => {
							var start = chunkNum * chunkSize;
							var end = (chunkNum + 1) * chunkSize - 1;
							end = Math.min(end, datalength - 1);
							if (typeof lazyArray.chunks[chunkNum] == 'undefined') {
								lazyArray.chunks[chunkNum] = doXHR(start, end);
							}
							if (typeof lazyArray.chunks[chunkNum] == 'undefined')
								throw new Error('doXHR failed!');
							return lazyArray.chunks[chunkNum];
						});
						if (usesGzip || !datalength) {
							chunkSize = datalength = 1;
							datalength = this.getter(0).length;
							chunkSize = datalength;
							out('LazyFiles on gzip forces download of the whole file when length is accessed');
						}
						this._length = datalength;
						this._chunkSize = chunkSize;
						this.lengthKnown = true;
					}
					get length() {
						if (!this.lengthKnown) {
							this.cacheLength();
						}
						return this._length;
					}
					get chunkSize() {
						if (!this.lengthKnown) {
							this.cacheLength();
						}
						return this._chunkSize;
					}
				}
				if (typeof XMLHttpRequest != 'undefined') {
					if (!ENVIRONMENT_IS_WORKER)
						throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
					var lazyArray = new LazyUint8Array();
					var properties = { isDevice: false, contents: lazyArray };
				} else {
					var properties = { isDevice: false, url: url };
				}
				var node = FS.createFile(parent, name, properties, canRead, canWrite);
				if (properties.contents) {
					node.contents = properties.contents;
				} else if (properties.url) {
					node.contents = null;
					node.url = properties.url;
				}
				Object.defineProperties(node, {
					usedBytes: {
						get: function () {
							return this.contents.length;
						}
					}
				});
				var stream_ops = {};
				var keys = Object.keys(node.stream_ops);
				keys.forEach((key) => {
					var fn = node.stream_ops[key];
					stream_ops[key] = (...args) => {
						FS.forceLoadFile(node);
						return fn(...args);
					};
				});
				function writeChunks(stream, buffer, offset, length, position) {
					var contents = stream.node.contents;
					if (position >= contents.length) return 0;
					var size = Math.min(contents.length - position, length);
					if (contents.slice) {
						for (var i = 0; i < size; i++) {
							buffer[offset + i] = contents[position + i];
						}
					} else {
						for (var i = 0; i < size; i++) {
							buffer[offset + i] = contents.get(position + i);
						}
					}
					return size;
				}
				stream_ops.read = (stream, buffer, offset, length, position) => {
					FS.forceLoadFile(node);
					return writeChunks(stream, buffer, offset, length, position);
				};
				stream_ops.mmap = (stream, length, position, prot, flags) => {
					FS.forceLoadFile(node);
					var ptr = mmapAlloc(length);
					if (!ptr) {
						throw new FS.ErrnoError(48);
					}
					writeChunks(stream, HEAP8, ptr, length, position);
					return { ptr: ptr, allocated: true };
				};
				node.stream_ops = stream_ops;
				return node;
			}
		};
		var UTF8ToString = (ptr, maxBytesToRead) => {
			ptr >>>= 0;
			return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
		};
		var SYSCALLS = {
			DEFAULT_POLLMASK: 5,
			calculateAt(dirfd, path, allowEmpty) {
				if (PATH.isAbs(path)) {
					return path;
				}
				var dir;
				if (dirfd === -100) {
					dir = FS.cwd();
				} else {
					var dirstream = SYSCALLS.getStreamFromFD(dirfd);
					dir = dirstream.path;
				}
				if (path.length == 0) {
					if (!allowEmpty) {
						throw new FS.ErrnoError(44);
					}
					return dir;
				}
				return PATH.join2(dir, path);
			},
			doStat(func, path, buf) {
				var stat = func(path);
				HEAP32[(buf >>> 2) >>> 0] = stat.dev;
				HEAP32[((buf + 4) >>> 2) >>> 0] = stat.mode;
				HEAPU32[((buf + 8) >>> 2) >>> 0] = stat.nlink;
				HEAP32[((buf + 12) >>> 2) >>> 0] = stat.uid;
				HEAP32[((buf + 16) >>> 2) >>> 0] = stat.gid;
				HEAP32[((buf + 20) >>> 2) >>> 0] = stat.rdev;
				(tempI64 = [
					stat.size >>> 0,
					((tempDouble = stat.size),
					+Math.abs(tempDouble) >= 1
						? tempDouble > 0
							? +Math.floor(tempDouble / 4294967296) >>> 0
							: ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
						: 0)
				]),
					(HEAP32[((buf + 24) >>> 2) >>> 0] = tempI64[0]),
					(HEAP32[((buf + 28) >>> 2) >>> 0] = tempI64[1]);
				HEAP32[((buf + 32) >>> 2) >>> 0] = 4096;
				HEAP32[((buf + 36) >>> 2) >>> 0] = stat.blocks;
				var atime = stat.atime.getTime();
				var mtime = stat.mtime.getTime();
				var ctime = stat.ctime.getTime();
				(tempI64 = [
					Math.floor(atime / 1e3) >>> 0,
					((tempDouble = Math.floor(atime / 1e3)),
					+Math.abs(tempDouble) >= 1
						? tempDouble > 0
							? +Math.floor(tempDouble / 4294967296) >>> 0
							: ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
						: 0)
				]),
					(HEAP32[((buf + 40) >>> 2) >>> 0] = tempI64[0]),
					(HEAP32[((buf + 44) >>> 2) >>> 0] = tempI64[1]);
				HEAPU32[((buf + 48) >>> 2) >>> 0] = (atime % 1e3) * 1e3;
				(tempI64 = [
					Math.floor(mtime / 1e3) >>> 0,
					((tempDouble = Math.floor(mtime / 1e3)),
					+Math.abs(tempDouble) >= 1
						? tempDouble > 0
							? +Math.floor(tempDouble / 4294967296) >>> 0
							: ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
						: 0)
				]),
					(HEAP32[((buf + 56) >>> 2) >>> 0] = tempI64[0]),
					(HEAP32[((buf + 60) >>> 2) >>> 0] = tempI64[1]);
				HEAPU32[((buf + 64) >>> 2) >>> 0] = (mtime % 1e3) * 1e3;
				(tempI64 = [
					Math.floor(ctime / 1e3) >>> 0,
					((tempDouble = Math.floor(ctime / 1e3)),
					+Math.abs(tempDouble) >= 1
						? tempDouble > 0
							? +Math.floor(tempDouble / 4294967296) >>> 0
							: ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
						: 0)
				]),
					(HEAP32[((buf + 72) >>> 2) >>> 0] = tempI64[0]),
					(HEAP32[((buf + 76) >>> 2) >>> 0] = tempI64[1]);
				HEAPU32[((buf + 80) >>> 2) >>> 0] = (ctime % 1e3) * 1e3;
				(tempI64 = [
					stat.ino >>> 0,
					((tempDouble = stat.ino),
					+Math.abs(tempDouble) >= 1
						? tempDouble > 0
							? +Math.floor(tempDouble / 4294967296) >>> 0
							: ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
						: 0)
				]),
					(HEAP32[((buf + 88) >>> 2) >>> 0] = tempI64[0]),
					(HEAP32[((buf + 92) >>> 2) >>> 0] = tempI64[1]);
				return 0;
			},
			doMsync(addr, stream, len, flags, offset) {
				if (!FS.isFile(stream.node.mode)) {
					throw new FS.ErrnoError(43);
				}
				if (flags & 2) {
					return 0;
				}
				var buffer = HEAPU8.slice(addr, addr + len);
				FS.msync(stream, buffer, offset, len, flags);
			},
			varargs: undefined,
			get() {
				var ret = HEAP32[(+SYSCALLS.varargs >>> 2) >>> 0];
				SYSCALLS.varargs += 4;
				return ret;
			},
			getp() {
				return SYSCALLS.get();
			},
			getStr(ptr) {
				var ret = UTF8ToString(ptr);
				return ret;
			},
			getStreamFromFD(fd) {
				var stream = FS.getStreamChecked(fd);
				return stream;
			}
		};
		function ___syscall_faccessat(dirfd, path, amode, flags) {
			path >>>= 0;
			try {
				path = SYSCALLS.getStr(path);
				path = SYSCALLS.calculateAt(dirfd, path);
				if (amode & ~7) {
					return -28;
				}
				var lookup = FS.lookupPath(path, { follow: true });
				var node = lookup.node;
				if (!node) {
					return -44;
				}
				var perms = '';
				if (amode & 4) perms += 'r';
				if (amode & 2) perms += 'w';
				if (amode & 1) perms += 'x';
				if (perms && FS.nodePermissions(node, perms)) {
					return -2;
				}
				return 0;
			} catch (e) {
				if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
				return -e.errno;
			}
		}
		function ___syscall_fcntl64(fd, cmd, varargs) {
			varargs >>>= 0;
			SYSCALLS.varargs = varargs;
			try {
				var stream = SYSCALLS.getStreamFromFD(fd);
				switch (cmd) {
					case 0: {
						var arg = SYSCALLS.get();
						if (arg < 0) {
							return -28;
						}
						while (FS.streams[arg]) {
							arg++;
						}
						var newStream;
						newStream = FS.dupStream(stream, arg);
						return newStream.fd;
					}
					case 1:
					case 2:
						return 0;
					case 3:
						return stream.flags;
					case 4: {
						var arg = SYSCALLS.get();
						stream.flags |= arg;
						return 0;
					}
					case 12: {
						var arg = SYSCALLS.getp();
						var offset = 0;
						HEAP16[((arg + offset) >>> 1) >>> 0] = 2;
						return 0;
					}
					case 13:
					case 14:
						return 0;
				}
				return -28;
			} catch (e) {
				if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
				return -e.errno;
			}
		}
		function ___syscall_ftruncate64(fd, length_low, length_high) {
			var length = convertI32PairToI53Checked(length_low, length_high);
			try {
				if (isNaN(length)) return 61;
				FS.ftruncate(fd, length);
				return 0;
			} catch (e) {
				if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
				return -e.errno;
			}
		}
		var stringToUTF8 = (str, outPtr, maxBytesToWrite) =>
			stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
		function ___syscall_getcwd(buf, size) {
			buf >>>= 0;
			size >>>= 0;
			try {
				if (size === 0) return -28;
				var cwd = FS.cwd();
				var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
				if (size < cwdLengthInBytes) return -68;
				stringToUTF8(cwd, buf, size);
				return cwdLengthInBytes;
			} catch (e) {
				if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
				return -e.errno;
			}
		}
		function ___syscall_ioctl(fd, op, varargs) {
			varargs >>>= 0;
			SYSCALLS.varargs = varargs;
			try {
				var stream = SYSCALLS.getStreamFromFD(fd);
				switch (op) {
					case 21509: {
						if (!stream.tty) return -59;
						return 0;
					}
					case 21505: {
						if (!stream.tty) return -59;
						if (stream.tty.ops.ioctl_tcgets) {
							var termios = stream.tty.ops.ioctl_tcgets(stream);
							var argp = SYSCALLS.getp();
							HEAP32[(argp >>> 2) >>> 0] = termios.c_iflag || 0;
							HEAP32[((argp + 4) >>> 2) >>> 0] = termios.c_oflag || 0;
							HEAP32[((argp + 8) >>> 2) >>> 0] = termios.c_cflag || 0;
							HEAP32[((argp + 12) >>> 2) >>> 0] = termios.c_lflag || 0;
							for (var i = 0; i < 32; i++) {
								HEAP8[(argp + i + 17) >>> 0] = termios.c_cc[i] || 0;
							}
							return 0;
						}
						return 0;
					}
					case 21510:
					case 21511:
					case 21512: {
						if (!stream.tty) return -59;
						return 0;
					}
					case 21506:
					case 21507:
					case 21508: {
						if (!stream.tty) return -59;
						if (stream.tty.ops.ioctl_tcsets) {
							var argp = SYSCALLS.getp();
							var c_iflag = HEAP32[(argp >>> 2) >>> 0];
							var c_oflag = HEAP32[((argp + 4) >>> 2) >>> 0];
							var c_cflag = HEAP32[((argp + 8) >>> 2) >>> 0];
							var c_lflag = HEAP32[((argp + 12) >>> 2) >>> 0];
							var c_cc = [];
							for (var i = 0; i < 32; i++) {
								c_cc.push(HEAP8[(argp + i + 17) >>> 0]);
							}
							return stream.tty.ops.ioctl_tcsets(stream.tty, op, {
								c_iflag: c_iflag,
								c_oflag: c_oflag,
								c_cflag: c_cflag,
								c_lflag: c_lflag,
								c_cc: c_cc
							});
						}
						return 0;
					}
					case 21519: {
						if (!stream.tty) return -59;
						var argp = SYSCALLS.getp();
						HEAP32[(argp >>> 2) >>> 0] = 0;
						return 0;
					}
					case 21520: {
						if (!stream.tty) return -59;
						return -28;
					}
					case 21531: {
						var argp = SYSCALLS.getp();
						return FS.ioctl(stream, op, argp);
					}
					case 21523: {
						if (!stream.tty) return -59;
						if (stream.tty.ops.ioctl_tiocgwinsz) {
							var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
							var argp = SYSCALLS.getp();
							HEAP16[(argp >>> 1) >>> 0] = winsize[0];
							HEAP16[((argp + 2) >>> 1) >>> 0] = winsize[1];
						}
						return 0;
					}
					case 21524: {
						if (!stream.tty) return -59;
						return 0;
					}
					case 21515: {
						if (!stream.tty) return -59;
						return 0;
					}
					default:
						return -28;
				}
			} catch (e) {
				if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
				return -e.errno;
			}
		}
		function ___syscall_openat(dirfd, path, flags, varargs) {
			path >>>= 0;
			varargs >>>= 0;
			SYSCALLS.varargs = varargs;
			try {
				path = SYSCALLS.getStr(path);
				path = SYSCALLS.calculateAt(dirfd, path);
				var mode = varargs ? SYSCALLS.get() : 0;
				return FS.open(path, flags, mode).fd;
			} catch (e) {
				if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
				return -e.errno;
			}
		}
		function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
			path >>>= 0;
			buf >>>= 0;
			bufsize >>>= 0;
			try {
				path = SYSCALLS.getStr(path);
				path = SYSCALLS.calculateAt(dirfd, path);
				if (bufsize <= 0) return -28;
				var ret = FS.readlink(path);
				var len = Math.min(bufsize, lengthBytesUTF8(ret));
				var endChar = HEAP8[(buf + len) >>> 0];
				stringToUTF8(ret, buf, bufsize + 1);
				HEAP8[(buf + len) >>> 0] = endChar;
				return len;
			} catch (e) {
				if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
				return -e.errno;
			}
		}
		var SOCKFS = {
			mount(mount) {
				Module['websocket'] =
					Module['websocket'] && 'object' === typeof Module['websocket'] ? Module['websocket'] : {};
				Module['websocket']._callbacks = {};
				Module['websocket']['on'] = function (event, callback) {
					if ('function' === typeof callback) {
						this._callbacks[event] = callback;
					}
					return this;
				};
				Module['websocket'].emit = function (event, param) {
					if ('function' === typeof this._callbacks[event]) {
						this._callbacks[event].call(this, param);
					}
				};
				return FS.createNode(null, '/', 16384 | 511, 0);
			},
			createSocket(family, type, protocol) {
				type &= ~526336;
				var streaming = type == 1;
				if (streaming && protocol && protocol != 6) {
					throw new FS.ErrnoError(66);
				}
				var sock = {
					family: family,
					type: type,
					protocol: protocol,
					server: null,
					error: null,
					peers: {},
					pending: [],
					recv_queue: [],
					sock_ops: SOCKFS.websocket_sock_ops
				};
				var name = SOCKFS.nextname();
				var node = FS.createNode(SOCKFS.root, name, 49152, 0);
				node.sock = sock;
				var stream = FS.createStream({
					path: name,
					node: node,
					flags: 2,
					seekable: false,
					stream_ops: SOCKFS.stream_ops
				});
				sock.stream = stream;
				return sock;
			},
			getSocket(fd) {
				var stream = FS.getStream(fd);
				if (!stream || !FS.isSocket(stream.node.mode)) {
					return null;
				}
				return stream.node.sock;
			},
			stream_ops: {
				poll(stream) {
					var sock = stream.node.sock;
					return sock.sock_ops.poll(sock);
				},
				ioctl(stream, request, varargs) {
					var sock = stream.node.sock;
					return sock.sock_ops.ioctl(sock, request, varargs);
				},
				read(stream, buffer, offset, length, position) {
					var sock = stream.node.sock;
					var msg = sock.sock_ops.recvmsg(sock, length);
					if (!msg) {
						return 0;
					}
					buffer.set(msg.buffer, offset);
					return msg.buffer.length;
				},
				write(stream, buffer, offset, length, position) {
					var sock = stream.node.sock;
					return sock.sock_ops.sendmsg(sock, buffer, offset, length);
				},
				close(stream) {
					var sock = stream.node.sock;
					sock.sock_ops.close(sock);
				}
			},
			nextname() {
				if (!SOCKFS.nextname.current) {
					SOCKFS.nextname.current = 0;
				}
				return 'socket[' + SOCKFS.nextname.current++ + ']';
			},
			websocket_sock_ops: {
				createPeer(sock, addr, port) {
					var ws;
					if (typeof addr == 'object') {
						ws = addr;
						addr = null;
						port = null;
					}
					if (ws) {
						if (ws._socket) {
							addr = ws._socket.remoteAddress;
							port = ws._socket.remotePort;
						} else {
							var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
							if (!result) {
								throw new Error('WebSocket URL must be in the format ws(s)://address:port');
							}
							addr = result[1];
							port = parseInt(result[2], 10);
						}
					} else {
						try {
							var runtimeConfig = Module['websocket'] && 'object' === typeof Module['websocket'];
							var url = 'ws:#'.replace('#', '//');
							if (runtimeConfig) {
								if ('string' === typeof Module['websocket']['url']) {
									url = Module['websocket']['url'];
								}
							}
							if (url === 'ws://' || url === 'wss://') {
								var parts = addr.split('/');
								url = url + parts[0] + ':' + port + '/' + parts.slice(1).join('/');
							}
							var subProtocols = 'binary';
							if (runtimeConfig) {
								if ('string' === typeof Module['websocket']['subprotocol']) {
									subProtocols = Module['websocket']['subprotocol'];
								}
							}
							var opts = undefined;
							if (subProtocols !== 'null') {
								subProtocols = subProtocols.replace(/^ +| +$/g, '').split(/ *, */);
								opts = subProtocols;
							}
							if (runtimeConfig && null === Module['websocket']['subprotocol']) {
								subProtocols = 'null';
								opts = undefined;
							}
							var WebSocketConstructor;
							if (ENVIRONMENT_IS_NODE) {
								WebSocketConstructor = require('ws');
							} else {
								WebSocketConstructor = WebSocket;
							}
							ws = new WebSocketConstructor(url, opts);
							ws.binaryType = 'arraybuffer';
						} catch (e) {
							throw new FS.ErrnoError(23);
						}
					}
					var peer = { addr: addr, port: port, socket: ws, dgram_send_queue: [] };
					SOCKFS.websocket_sock_ops.addPeer(sock, peer);
					SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
					if (sock.type === 2 && typeof sock.sport != 'undefined') {
						peer.dgram_send_queue.push(
							new Uint8Array([
								255,
								255,
								255,
								255,
								'p'.charCodeAt(0),
								'o'.charCodeAt(0),
								'r'.charCodeAt(0),
								't'.charCodeAt(0),
								(sock.sport & 65280) >> 8,
								sock.sport & 255
							])
						);
					}
					return peer;
				},
				getPeer(sock, addr, port) {
					return sock.peers[addr + ':' + port];
				},
				addPeer(sock, peer) {
					sock.peers[peer.addr + ':' + peer.port] = peer;
				},
				removePeer(sock, peer) {
					delete sock.peers[peer.addr + ':' + peer.port];
				},
				handlePeerEvents(sock, peer) {
					var first = true;
					var handleOpen = function () {
						Module['websocket'].emit('open', sock.stream.fd);
						try {
							var queued = peer.dgram_send_queue.shift();
							while (queued) {
								peer.socket.send(queued);
								queued = peer.dgram_send_queue.shift();
							}
						} catch (e) {
							peer.socket.close();
						}
					};
					function handleMessage(data) {
						if (typeof data == 'string') {
							var encoder = new TextEncoder();
							data = encoder.encode(data);
						} else {
							assert(data.byteLength !== undefined);
							if (data.byteLength == 0) {
								return;
							}
							data = new Uint8Array(data);
						}
						var wasfirst = first;
						first = false;
						if (
							wasfirst &&
							data.length === 10 &&
							data[0] === 255 &&
							data[1] === 255 &&
							data[2] === 255 &&
							data[3] === 255 &&
							data[4] === 'p'.charCodeAt(0) &&
							data[5] === 'o'.charCodeAt(0) &&
							data[6] === 'r'.charCodeAt(0) &&
							data[7] === 't'.charCodeAt(0)
						) {
							var newport = (data[8] << 8) | data[9];
							SOCKFS.websocket_sock_ops.removePeer(sock, peer);
							peer.port = newport;
							SOCKFS.websocket_sock_ops.addPeer(sock, peer);
							return;
						}
						sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
						Module['websocket'].emit('message', sock.stream.fd);
					}
					if (ENVIRONMENT_IS_NODE) {
						peer.socket.on('open', handleOpen);
						peer.socket.on('message', function (data, isBinary) {
							if (!isBinary) {
								return;
							}
							handleMessage(new Uint8Array(data).buffer);
						});
						peer.socket.on('close', function () {
							Module['websocket'].emit('close', sock.stream.fd);
						});
						peer.socket.on('error', function (error) {
							sock.error = 14;
							Module['websocket'].emit('error', [
								sock.stream.fd,
								sock.error,
								'ECONNREFUSED: Connection refused'
							]);
						});
					} else {
						peer.socket.onopen = handleOpen;
						peer.socket.onclose = function () {
							Module['websocket'].emit('close', sock.stream.fd);
						};
						peer.socket.onmessage = function peer_socket_onmessage(event) {
							handleMessage(event.data);
						};
						peer.socket.onerror = function (error) {
							sock.error = 14;
							Module['websocket'].emit('error', [
								sock.stream.fd,
								sock.error,
								'ECONNREFUSED: Connection refused'
							]);
						};
					}
				},
				poll(sock) {
					if (sock.type === 1 && sock.server) {
						return sock.pending.length ? 64 | 1 : 0;
					}
					var mask = 0;
					var dest =
						sock.type === 1
							? SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport)
							: null;
					if (
						sock.recv_queue.length ||
						!dest ||
						(dest && dest.socket.readyState === dest.socket.CLOSING) ||
						(dest && dest.socket.readyState === dest.socket.CLOSED)
					) {
						mask |= 64 | 1;
					}
					if (!dest || (dest && dest.socket.readyState === dest.socket.OPEN)) {
						mask |= 4;
					}
					if (
						(dest && dest.socket.readyState === dest.socket.CLOSING) ||
						(dest && dest.socket.readyState === dest.socket.CLOSED)
					) {
						mask |= 16;
					}
					return mask;
				},
				ioctl(sock, request, arg) {
					switch (request) {
						case 21531:
							var bytes = 0;
							if (sock.recv_queue.length) {
								bytes = sock.recv_queue[0].data.length;
							}
							HEAP32[(arg >>> 2) >>> 0] = bytes;
							return 0;
						default:
							return 28;
					}
				},
				close(sock) {
					if (sock.server) {
						try {
							sock.server.close();
						} catch (e) {}
						sock.server = null;
					}
					var peers = Object.keys(sock.peers);
					for (var i = 0; i < peers.length; i++) {
						var peer = sock.peers[peers[i]];
						try {
							peer.socket.close();
						} catch (e) {}
						SOCKFS.websocket_sock_ops.removePeer(sock, peer);
					}
					return 0;
				},
				bind(sock, addr, port) {
					if (typeof sock.saddr != 'undefined' || typeof sock.sport != 'undefined') {
						throw new FS.ErrnoError(28);
					}
					sock.saddr = addr;
					sock.sport = port;
					if (sock.type === 2) {
						if (sock.server) {
							sock.server.close();
							sock.server = null;
						}
						try {
							sock.sock_ops.listen(sock, 0);
						} catch (e) {
							if (!(e.name === 'ErrnoError')) throw e;
							if (e.errno !== 138) throw e;
						}
					}
				},
				connect(sock, addr, port) {
					if (sock.server) {
						throw new FS.ErrnoError(138);
					}
					if (typeof sock.daddr != 'undefined' && typeof sock.dport != 'undefined') {
						var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
						if (dest) {
							if (dest.socket.readyState === dest.socket.CONNECTING) {
								throw new FS.ErrnoError(7);
							} else {
								throw new FS.ErrnoError(30);
							}
						}
					}
					var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
					sock.daddr = peer.addr;
					sock.dport = peer.port;
					throw new FS.ErrnoError(26);
				},
				listen(sock, backlog) {
					if (!ENVIRONMENT_IS_NODE) {
						throw new FS.ErrnoError(138);
					}
					if (sock.server) {
						throw new FS.ErrnoError(28);
					}
					var WebSocketServer = require('ws').Server;
					var host = sock.saddr;
					sock.server = new WebSocketServer({ host: host, port: sock.sport });
					Module['websocket'].emit('listen', sock.stream.fd);
					sock.server.on('connection', function (ws) {
						if (sock.type === 1) {
							var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
							var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
							newsock.daddr = peer.addr;
							newsock.dport = peer.port;
							sock.pending.push(newsock);
							Module['websocket'].emit('connection', newsock.stream.fd);
						} else {
							SOCKFS.websocket_sock_ops.createPeer(sock, ws);
							Module['websocket'].emit('connection', sock.stream.fd);
						}
					});
					sock.server.on('close', function () {
						Module['websocket'].emit('close', sock.stream.fd);
						sock.server = null;
					});
					sock.server.on('error', function (error) {
						sock.error = 23;
						Module['websocket'].emit('error', [
							sock.stream.fd,
							sock.error,
							'EHOSTUNREACH: Host is unreachable'
						]);
					});
				},
				accept(listensock) {
					if (!listensock.server || !listensock.pending.length) {
						throw new FS.ErrnoError(28);
					}
					var newsock = listensock.pending.shift();
					newsock.stream.flags = listensock.stream.flags;
					return newsock;
				},
				getname(sock, peer) {
					var addr, port;
					if (peer) {
						if (sock.daddr === undefined || sock.dport === undefined) {
							throw new FS.ErrnoError(53);
						}
						addr = sock.daddr;
						port = sock.dport;
					} else {
						addr = sock.saddr || 0;
						port = sock.sport || 0;
					}
					return { addr: addr, port: port };
				},
				sendmsg(sock, buffer, offset, length, addr, port) {
					if (sock.type === 2) {
						if (addr === undefined || port === undefined) {
							addr = sock.daddr;
							port = sock.dport;
						}
						if (addr === undefined || port === undefined) {
							throw new FS.ErrnoError(17);
						}
					} else {
						addr = sock.daddr;
						port = sock.dport;
					}
					var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
					if (sock.type === 1) {
						if (
							!dest ||
							dest.socket.readyState === dest.socket.CLOSING ||
							dest.socket.readyState === dest.socket.CLOSED
						) {
							throw new FS.ErrnoError(53);
						} else if (dest.socket.readyState === dest.socket.CONNECTING) {
							throw new FS.ErrnoError(6);
						}
					}
					if (ArrayBuffer.isView(buffer)) {
						offset += buffer.byteOffset;
						buffer = buffer.buffer;
					}
					var data;
					data = buffer.slice(offset, offset + length);
					if (sock.type === 2) {
						if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
							if (
								!dest ||
								dest.socket.readyState === dest.socket.CLOSING ||
								dest.socket.readyState === dest.socket.CLOSED
							) {
								dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
							}
							dest.dgram_send_queue.push(data);
							return length;
						}
					}
					try {
						dest.socket.send(data);
						return length;
					} catch (e) {
						throw new FS.ErrnoError(28);
					}
				},
				recvmsg(sock, length) {
					if (sock.type === 1 && sock.server) {
						throw new FS.ErrnoError(53);
					}
					var queued = sock.recv_queue.shift();
					if (!queued) {
						if (sock.type === 1) {
							var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
							if (!dest) {
								throw new FS.ErrnoError(53);
							}
							if (
								dest.socket.readyState === dest.socket.CLOSING ||
								dest.socket.readyState === dest.socket.CLOSED
							) {
								return null;
							}
							throw new FS.ErrnoError(6);
						}
						throw new FS.ErrnoError(6);
					}
					var queuedLength = queued.data.byteLength || queued.data.length;
					var queuedOffset = queued.data.byteOffset || 0;
					var queuedBuffer = queued.data.buffer || queued.data;
					var bytesRead = Math.min(length, queuedLength);
					var res = {
						buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
						addr: queued.addr,
						port: queued.port
					};
					if (sock.type === 1 && bytesRead < queuedLength) {
						var bytesRemaining = queuedLength - bytesRead;
						queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
						sock.recv_queue.unshift(queued);
					}
					return res;
				}
			}
		};
		function ___syscall_socket(domain, type, protocol) {
			try {
				var sock = SOCKFS.createSocket(domain, type, protocol);
				return sock.stream.fd;
			} catch (e) {
				if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
				return -e.errno;
			}
		}
		function ___syscall_stat64(path, buf) {
			path >>>= 0;
			buf >>>= 0;
			try {
				path = SYSCALLS.getStr(path);
				return SYSCALLS.doStat(FS.stat, path, buf);
			} catch (e) {
				if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
				return -e.errno;
			}
		}
		var readI53FromI64 = (ptr) =>
			HEAPU32[(ptr >>> 2) >>> 0] + HEAP32[((ptr + 4) >>> 2) >>> 0] * 4294967296;
		function ___syscall_utimensat(dirfd, path, times, flags) {
			path >>>= 0;
			times >>>= 0;
			try {
				path = SYSCALLS.getStr(path);
				path = SYSCALLS.calculateAt(dirfd, path, true);
				if (!times) {
					var atime = Date.now();
					var mtime = atime;
				} else {
					var seconds = readI53FromI64(times);
					var nanoseconds = HEAP32[((times + 8) >>> 2) >>> 0];
					atime = seconds * 1e3 + nanoseconds / (1e3 * 1e3);
					times += 16;
					seconds = readI53FromI64(times);
					nanoseconds = HEAP32[((times + 8) >>> 2) >>> 0];
					mtime = seconds * 1e3 + nanoseconds / (1e3 * 1e3);
				}
				FS.utime(path, atime, mtime);
				return 0;
			} catch (e) {
				if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
				return -e.errno;
			}
		}
		var __emscripten_throw_longjmp = () => {
			throw Infinity;
		};
		var isLeapYear = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
		var MONTH_DAYS_LEAP_CUMULATIVE = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
		var MONTH_DAYS_REGULAR_CUMULATIVE = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
		var ydayFromDate = (date) => {
			var leap = isLeapYear(date.getFullYear());
			var monthDaysCumulative = leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE;
			var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
			return yday;
		};
		function __localtime_js(time_low, time_high, tmPtr) {
			var time = convertI32PairToI53Checked(time_low, time_high);
			tmPtr >>>= 0;
			var date = new Date(time * 1e3);
			HEAP32[(tmPtr >>> 2) >>> 0] = date.getSeconds();
			HEAP32[((tmPtr + 4) >>> 2) >>> 0] = date.getMinutes();
			HEAP32[((tmPtr + 8) >>> 2) >>> 0] = date.getHours();
			HEAP32[((tmPtr + 12) >>> 2) >>> 0] = date.getDate();
			HEAP32[((tmPtr + 16) >>> 2) >>> 0] = date.getMonth();
			HEAP32[((tmPtr + 20) >>> 2) >>> 0] = date.getFullYear() - 1900;
			HEAP32[((tmPtr + 24) >>> 2) >>> 0] = date.getDay();
			var yday = ydayFromDate(date) | 0;
			HEAP32[((tmPtr + 28) >>> 2) >>> 0] = yday;
			HEAP32[((tmPtr + 36) >>> 2) >>> 0] = -(date.getTimezoneOffset() * 60);
			var start = new Date(date.getFullYear(), 0, 1);
			var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
			var winterOffset = start.getTimezoneOffset();
			var dst =
				(summerOffset != winterOffset &&
					date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
			HEAP32[((tmPtr + 32) >>> 2) >>> 0] = dst;
		}
		function __tzset_js(timezone, daylight, std_name, dst_name) {
			timezone >>>= 0;
			daylight >>>= 0;
			std_name >>>= 0;
			dst_name >>>= 0;
			var currentYear = new Date().getFullYear();
			var winter = new Date(currentYear, 0, 1);
			var summer = new Date(currentYear, 6, 1);
			var winterOffset = winter.getTimezoneOffset();
			var summerOffset = summer.getTimezoneOffset();
			var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
			HEAPU32[(timezone >>> 2) >>> 0] = stdTimezoneOffset * 60;
			HEAP32[(daylight >>> 2) >>> 0] = Number(winterOffset != summerOffset);
			function extractZone(date) {
				var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
				return match ? match[1] : 'GMT';
			}
			var winterName = extractZone(winter);
			var summerName = extractZone(summer);
			if (summerOffset < winterOffset) {
				stringToUTF8(winterName, std_name, 7);
				stringToUTF8(summerName, dst_name, 7);
			} else {
				stringToUTF8(winterName, dst_name, 7);
				stringToUTF8(summerName, std_name, 7);
			}
		}
		var _abort = () => {
			abort('');
		};
		var _emscripten_date_now = () => Date.now();
		function _emscripten_memcpy_js(dest, src, num) {
			dest >>>= 0;
			src >>>= 0;
			num >>>= 0;
			return HEAPU8.copyWithin(dest >>> 0, src >>> 0, (src + num) >>> 0);
		}
		var getHeapMax = () => 4294901760;
		var growMemory = (size) => {
			var b = wasmMemory.buffer;
			var pages = (size - b.byteLength + 65535) / 65536;
			try {
				wasmMemory.grow(pages);
				updateMemoryViews();
				return 1;
			} catch (e) {}
		};
		function _emscripten_resize_heap(requestedSize) {
			requestedSize >>>= 0;
			var oldSize = HEAPU8.length;
			var maxHeapSize = getHeapMax();
			if (requestedSize > maxHeapSize) {
				return false;
			}
			var alignUp = (x, multiple) => x + ((multiple - (x % multiple)) % multiple);
			for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
				var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
				overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
				var newSize = Math.min(
					maxHeapSize,
					alignUp(Math.max(requestedSize, overGrownHeapSize), 65536)
				);
				var replacement = growMemory(newSize);
				if (replacement) {
					return true;
				}
			}
			return false;
		}
		var ENV = {};
		var getExecutableName = () => thisProgram || './this.program';
		var getEnvStrings = () => {
			if (!getEnvStrings.strings) {
				var lang =
					(
						(typeof navigator == 'object' && navigator.languages && navigator.languages[0]) ||
						'C'
					).replace('-', '_') + '.UTF-8';
				var env = {
					USER: 'web_user',
					LOGNAME: 'web_user',
					PATH: '/',
					PWD: '/',
					HOME: '/home/web_user',
					LANG: lang,
					_: getExecutableName()
				};
				for (var x in ENV) {
					if (ENV[x] === undefined) delete env[x];
					else env[x] = ENV[x];
				}
				var strings = [];
				for (var x in env) {
					strings.push(`${x}=${env[x]}`);
				}
				getEnvStrings.strings = strings;
			}
			return getEnvStrings.strings;
		};
		var stringToAscii = (str, buffer) => {
			for (var i = 0; i < str.length; ++i) {
				HEAP8[buffer++ >>> 0] = str.charCodeAt(i);
			}
			HEAP8[buffer >>> 0] = 0;
		};
		var _environ_get = function (__environ, environ_buf) {
			__environ >>>= 0;
			environ_buf >>>= 0;
			var bufSize = 0;
			getEnvStrings().forEach((string, i) => {
				var ptr = environ_buf + bufSize;
				HEAPU32[((__environ + i * 4) >>> 2) >>> 0] = ptr;
				stringToAscii(string, ptr);
				bufSize += string.length + 1;
			});
			return 0;
		};
		var _environ_sizes_get = function (penviron_count, penviron_buf_size) {
			penviron_count >>>= 0;
			penviron_buf_size >>>= 0;
			var strings = getEnvStrings();
			HEAPU32[(penviron_count >>> 2) >>> 0] = strings.length;
			var bufSize = 0;
			strings.forEach((string) => (bufSize += string.length + 1));
			HEAPU32[(penviron_buf_size >>> 2) >>> 0] = bufSize;
			return 0;
		};
		var runtimeKeepaliveCounter = 0;
		var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
		var _proc_exit = (code) => {
			EXITSTATUS = code;
			if (!keepRuntimeAlive()) {
				Module['onExit']?.(code);
				ABORT = true;
			}
			quit_(code, new ExitStatus(code));
		};
		var exitJS = (status, implicit) => {
			EXITSTATUS = status;
			_proc_exit(status);
		};
		var _exit = exitJS;
		function _fd_close(fd) {
			try {
				var stream = SYSCALLS.getStreamFromFD(fd);
				FS.close(stream);
				return 0;
			} catch (e) {
				if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
				return e.errno;
			}
		}
		var doReadv = (stream, iov, iovcnt, offset) => {
			var ret = 0;
			for (var i = 0; i < iovcnt; i++) {
				var ptr = HEAPU32[(iov >>> 2) >>> 0];
				var len = HEAPU32[((iov + 4) >>> 2) >>> 0];
				iov += 8;
				var curr = FS.read(stream, HEAP8, ptr, len, offset);
				if (curr < 0) return -1;
				ret += curr;
				if (curr < len) break;
				if (typeof offset !== 'undefined') {
					offset += curr;
				}
			}
			return ret;
		};
		function _fd_read(fd, iov, iovcnt, pnum) {
			iov >>>= 0;
			iovcnt >>>= 0;
			pnum >>>= 0;
			try {
				var stream = SYSCALLS.getStreamFromFD(fd);
				var num = doReadv(stream, iov, iovcnt);
				HEAPU32[(pnum >>> 2) >>> 0] = num;
				return 0;
			} catch (e) {
				if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
				return e.errno;
			}
		}
		function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
			var offset = convertI32PairToI53Checked(offset_low, offset_high);
			newOffset >>>= 0;
			try {
				if (isNaN(offset)) return 61;
				var stream = SYSCALLS.getStreamFromFD(fd);
				FS.llseek(stream, offset, whence);
				(tempI64 = [
					stream.position >>> 0,
					((tempDouble = stream.position),
					+Math.abs(tempDouble) >= 1
						? tempDouble > 0
							? +Math.floor(tempDouble / 4294967296) >>> 0
							: ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
						: 0)
				]),
					(HEAP32[(newOffset >>> 2) >>> 0] = tempI64[0]),
					(HEAP32[((newOffset + 4) >>> 2) >>> 0] = tempI64[1]);
				if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
				return 0;
			} catch (e) {
				if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
				return e.errno;
			}
		}
		var doWritev = (stream, iov, iovcnt, offset) => {
			var ret = 0;
			for (var i = 0; i < iovcnt; i++) {
				var ptr = HEAPU32[(iov >>> 2) >>> 0];
				var len = HEAPU32[((iov + 4) >>> 2) >>> 0];
				iov += 8;
				var curr = FS.write(stream, HEAP8, ptr, len, offset);
				if (curr < 0) return -1;
				ret += curr;
				if (typeof offset !== 'undefined') {
					offset += curr;
				}
			}
			return ret;
		};
		function _fd_write(fd, iov, iovcnt, pnum) {
			iov >>>= 0;
			iovcnt >>>= 0;
			pnum >>>= 0;
			try {
				var stream = SYSCALLS.getStreamFromFD(fd);
				var num = doWritev(stream, iov, iovcnt);
				HEAPU32[(pnum >>> 2) >>> 0] = num;
				return 0;
			} catch (e) {
				if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
				return e.errno;
			}
		}
		var arraySum = (array, index) => {
			var sum = 0;
			for (var i = 0; i <= index; sum += array[i++]) {}
			return sum;
		};
		var MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		var MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		var addDays = (date, days) => {
			var newDate = new Date(date.getTime());
			while (days > 0) {
				var leap = isLeapYear(newDate.getFullYear());
				var currentMonth = newDate.getMonth();
				var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[currentMonth];
				if (days > daysInCurrentMonth - newDate.getDate()) {
					days -= daysInCurrentMonth - newDate.getDate() + 1;
					newDate.setDate(1);
					if (currentMonth < 11) {
						newDate.setMonth(currentMonth + 1);
					} else {
						newDate.setMonth(0);
						newDate.setFullYear(newDate.getFullYear() + 1);
					}
				} else {
					newDate.setDate(newDate.getDate() + days);
					return newDate;
				}
			}
			return newDate;
		};
		var writeArrayToMemory = (array, buffer) => {
			HEAP8.set(array, buffer >>> 0);
		};
		function _strftime(s, maxsize, format, tm) {
			s >>>= 0;
			maxsize >>>= 0;
			format >>>= 0;
			tm >>>= 0;
			var tm_zone = HEAPU32[((tm + 40) >>> 2) >>> 0];
			var date = {
				tm_sec: HEAP32[(tm >>> 2) >>> 0],
				tm_min: HEAP32[((tm + 4) >>> 2) >>> 0],
				tm_hour: HEAP32[((tm + 8) >>> 2) >>> 0],
				tm_mday: HEAP32[((tm + 12) >>> 2) >>> 0],
				tm_mon: HEAP32[((tm + 16) >>> 2) >>> 0],
				tm_year: HEAP32[((tm + 20) >>> 2) >>> 0],
				tm_wday: HEAP32[((tm + 24) >>> 2) >>> 0],
				tm_yday: HEAP32[((tm + 28) >>> 2) >>> 0],
				tm_isdst: HEAP32[((tm + 32) >>> 2) >>> 0],
				tm_gmtoff: HEAP32[((tm + 36) >>> 2) >>> 0],
				tm_zone: tm_zone ? UTF8ToString(tm_zone) : ''
			};
			var pattern = UTF8ToString(format);
			var EXPANSION_RULES_1 = {
				'%c': '%a %b %d %H:%M:%S %Y',
				'%D': '%m/%d/%y',
				'%F': '%Y-%m-%d',
				'%h': '%b',
				'%r': '%I:%M:%S %p',
				'%R': '%H:%M',
				'%T': '%H:%M:%S',
				'%x': '%m/%d/%y',
				'%X': '%H:%M:%S',
				'%Ec': '%c',
				'%EC': '%C',
				'%Ex': '%m/%d/%y',
				'%EX': '%H:%M:%S',
				'%Ey': '%y',
				'%EY': '%Y',
				'%Od': '%d',
				'%Oe': '%e',
				'%OH': '%H',
				'%OI': '%I',
				'%Om': '%m',
				'%OM': '%M',
				'%OS': '%S',
				'%Ou': '%u',
				'%OU': '%U',
				'%OV': '%V',
				'%Ow': '%w',
				'%OW': '%W',
				'%Oy': '%y'
			};
			for (var rule in EXPANSION_RULES_1) {
				pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
			}
			var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			var MONTHS = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December'
			];
			function leadingSomething(value, digits, character) {
				var str = typeof value == 'number' ? value.toString() : value || '';
				while (str.length < digits) {
					str = character[0] + str;
				}
				return str;
			}
			function leadingNulls(value, digits) {
				return leadingSomething(value, digits, '0');
			}
			function compareByDay(date1, date2) {
				function sgn(value) {
					return value < 0 ? -1 : value > 0 ? 1 : 0;
				}
				var compare;
				if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
					if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
						compare = sgn(date1.getDate() - date2.getDate());
					}
				}
				return compare;
			}
			function getFirstWeekStartDate(janFourth) {
				switch (janFourth.getDay()) {
					case 0:
						return new Date(janFourth.getFullYear() - 1, 11, 29);
					case 1:
						return janFourth;
					case 2:
						return new Date(janFourth.getFullYear(), 0, 3);
					case 3:
						return new Date(janFourth.getFullYear(), 0, 2);
					case 4:
						return new Date(janFourth.getFullYear(), 0, 1);
					case 5:
						return new Date(janFourth.getFullYear() - 1, 11, 31);
					case 6:
						return new Date(janFourth.getFullYear() - 1, 11, 30);
				}
			}
			function getWeekBasedYear(date) {
				var thisDate = addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
				var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
				var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
				var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
				var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
				if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
					if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
						return thisDate.getFullYear() + 1;
					}
					return thisDate.getFullYear();
				}
				return thisDate.getFullYear() - 1;
			}
			var EXPANSION_RULES_2 = {
				'%a': (date) => WEEKDAYS[date.tm_wday].substring(0, 3),
				'%A': (date) => WEEKDAYS[date.tm_wday],
				'%b': (date) => MONTHS[date.tm_mon].substring(0, 3),
				'%B': (date) => MONTHS[date.tm_mon],
				'%C': (date) => {
					var year = date.tm_year + 1900;
					return leadingNulls((year / 100) | 0, 2);
				},
				'%d': (date) => leadingNulls(date.tm_mday, 2),
				'%e': (date) => leadingSomething(date.tm_mday, 2, ' '),
				'%g': (date) => getWeekBasedYear(date).toString().substring(2),
				'%G': getWeekBasedYear,
				'%H': (date) => leadingNulls(date.tm_hour, 2),
				'%I': (date) => {
					var twelveHour = date.tm_hour;
					if (twelveHour == 0) twelveHour = 12;
					else if (twelveHour > 12) twelveHour -= 12;
					return leadingNulls(twelveHour, 2);
				},
				'%j': (date) =>
					leadingNulls(
						date.tm_mday +
							arraySum(
								isLeapYear(date.tm_year + 1900) ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR,
								date.tm_mon - 1
							),
						3
					),
				'%m': (date) => leadingNulls(date.tm_mon + 1, 2),
				'%M': (date) => leadingNulls(date.tm_min, 2),
				'%n': () => '\n',
				'%p': (date) => {
					if (date.tm_hour >= 0 && date.tm_hour < 12) {
						return 'AM';
					}
					return 'PM';
				},
				'%S': (date) => leadingNulls(date.tm_sec, 2),
				'%t': () => '\t',
				'%u': (date) => date.tm_wday || 7,
				'%U': (date) => {
					var days = date.tm_yday + 7 - date.tm_wday;
					return leadingNulls(Math.floor(days / 7), 2);
				},
				'%V': (date) => {
					var val = Math.floor((date.tm_yday + 7 - ((date.tm_wday + 6) % 7)) / 7);
					if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
						val++;
					}
					if (!val) {
						val = 52;
						var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
						if (dec31 == 4 || (dec31 == 5 && isLeapYear((date.tm_year % 400) - 1))) {
							val++;
						}
					} else if (val == 53) {
						var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
						if (jan1 != 4 && (jan1 != 3 || !isLeapYear(date.tm_year))) val = 1;
					}
					return leadingNulls(val, 2);
				},
				'%w': (date) => date.tm_wday,
				'%W': (date) => {
					var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
					return leadingNulls(Math.floor(days / 7), 2);
				},
				'%y': (date) => (date.tm_year + 1900).toString().substring(2),
				'%Y': (date) => date.tm_year + 1900,
				'%z': (date) => {
					var off = date.tm_gmtoff;
					var ahead = off >= 0;
					off = Math.abs(off) / 60;
					off = (off / 60) * 100 + (off % 60);
					return (ahead ? '+' : '-') + String('0000' + off).slice(-4);
				},
				'%Z': (date) => date.tm_zone,
				'%%': () => '%'
			};
			pattern = pattern.replace(/%%/g, '\0\0');
			for (var rule in EXPANSION_RULES_2) {
				if (pattern.includes(rule)) {
					pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
				}
			}
			pattern = pattern.replace(/\0\0/g, '%');
			var bytes = intArrayFromString(pattern, false);
			if (bytes.length > maxsize) {
				return 0;
			}
			writeArrayToMemory(bytes, s);
			return bytes.length - 1;
		}
		function _strftime_l(s, maxsize, format, tm, loc) {
			s >>>= 0;
			maxsize >>>= 0;
			format >>>= 0;
			tm >>>= 0;
			loc >>>= 0;
			return _strftime(s, maxsize, format, tm);
		}
		var handleException = (e) => {
			if (e instanceof ExitStatus || e == 'unwind') {
				return EXITSTATUS;
			}
			quit_(1, e);
		};
		var stringToUTF8OnStack = (str) => {
			var size = lengthBytesUTF8(str) + 1;
			var ret = stackAlloc(size);
			stringToUTF8(str, ret, size);
			return ret;
		};
		var wasmTableMirror = [];
		var wasmTable;
		var getWasmTableEntry = (funcPtr) => {
			var func = wasmTableMirror[funcPtr];
			if (!func) {
				if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
				wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
			}
			return func;
		};
		var getCFunc = (ident) => {
			var func = Module['_' + ident];
			return func;
		};
		var ccall = (ident, returnType, argTypes, args, opts) => {
			var toC = {
				string: (str) => {
					var ret = 0;
					if (str !== null && str !== undefined && str !== 0) {
						ret = stringToUTF8OnStack(str);
					}
					return ret;
				},
				array: (arr) => {
					var ret = stackAlloc(arr.length);
					writeArrayToMemory(arr, ret);
					return ret;
				}
			};
			function convertReturnValue(ret) {
				if (returnType === 'string') {
					return UTF8ToString(ret);
				}
				if (returnType === 'boolean') return Boolean(ret);
				return ret;
			}
			var func = getCFunc(ident);
			var cArgs = [];
			var stack = 0;
			if (args) {
				for (var i = 0; i < args.length; i++) {
					var converter = toC[argTypes[i]];
					if (converter) {
						if (stack === 0) stack = stackSave();
						cArgs[i] = converter(args[i]);
					} else {
						cArgs[i] = args[i];
					}
				}
			}
			var ret = func(...cArgs);
			function onDone(ret) {
				if (stack !== 0) stackRestore(stack);
				return convertReturnValue(ret);
			}
			ret = onDone(ret);
			return ret;
		};
		var cwrap = (ident, returnType, argTypes, opts) => {
			var numericArgs =
				!argTypes || argTypes.every((type) => type === 'number' || type === 'boolean');
			var numericRet = returnType !== 'string';
			if (numericRet && numericArgs && !opts) {
				return getCFunc(ident);
			}
			return (...args) => ccall(ident, returnType, argTypes, args, opts);
		};
		FS.createPreloadedFile = FS_createPreloadedFile;
		FS.staticInit();
		Module['FS_createPath'] = FS.createPath;
		Module['FS_createDataFile'] = FS.createDataFile;
		Module['FS_createPreloadedFile'] = FS.createPreloadedFile;
		Module['FS_unlink'] = FS.unlink;
		Module['FS_createLazyFile'] = FS.createLazyFile;
		Module['FS_createDevice'] = FS.createDevice;
		if (ENVIRONMENT_IS_NODE) {
			NODEFS.staticInit();
		}
		var wasmImports = {
			a: ___cxa_throw,
			p: ___syscall_faccessat,
			h: ___syscall_fcntl64,
			t: ___syscall_ftruncate64,
			F: ___syscall_getcwd,
			k: ___syscall_ioctl,
			o: ___syscall_openat,
			B: ___syscall_readlinkat,
			v: ___syscall_socket,
			C: ___syscall_stat64,
			z: ___syscall_utimensat,
			u: __emscripten_throw_longjmp,
			r: __localtime_js,
			A: __tzset_js,
			d: _abort,
			H: _emscripten_date_now,
			G: _emscripten_memcpy_js,
			x: _emscripten_resize_heap,
			D: _environ_get,
			E: _environ_sizes_get,
			m: _exit,
			j: _fd_close,
			n: _fd_read,
			s: _fd_seek,
			q: _fd_write,
			g: invoke_ii,
			c: invoke_iiii,
			f: invoke_iiiii,
			l: invoke_iiiiiii,
			b: invoke_vi,
			e: invoke_vii,
			i: invoke_viiii,
			y: _strftime,
			w: _strftime_l
		};
		var wasmExports = createWasm();
		var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports['J'])();
		var _main = (Module['_main'] = (a0, a1) =>
			(_main = Module['_main'] = wasmExports['K'])(a0, a1));
		var _itk_wasm_input_array_alloc = (Module['_itk_wasm_input_array_alloc'] = (a0, a1, a2, a3) =>
			(_itk_wasm_input_array_alloc = Module['_itk_wasm_input_array_alloc'] = wasmExports['L'])(
				a0,
				a1,
				a2,
				a3
			));
		var _itk_wasm_input_json_alloc = (Module['_itk_wasm_input_json_alloc'] = (a0, a1, a2) =>
			(_itk_wasm_input_json_alloc = Module['_itk_wasm_input_json_alloc'] = wasmExports['M'])(
				a0,
				a1,
				a2
			));
		var _itk_wasm_output_json_address = (Module['_itk_wasm_output_json_address'] = (a0, a1) =>
			(_itk_wasm_output_json_address = Module['_itk_wasm_output_json_address'] = wasmExports['N'])(
				a0,
				a1
			));
		var _itk_wasm_output_json_size = (Module['_itk_wasm_output_json_size'] = (a0, a1) =>
			(_itk_wasm_output_json_size = Module['_itk_wasm_output_json_size'] = wasmExports['O'])(
				a0,
				a1
			));
		var _itk_wasm_output_array_address = (Module['_itk_wasm_output_array_address'] = (a0, a1, a2) =>
			(_itk_wasm_output_array_address = Module['_itk_wasm_output_array_address'] =
				wasmExports['P'])(a0, a1, a2));
		var _itk_wasm_output_array_size = (Module['_itk_wasm_output_array_size'] = (a0, a1, a2) =>
			(_itk_wasm_output_array_size = Module['_itk_wasm_output_array_size'] = wasmExports['Q'])(
				a0,
				a1,
				a2
			));
		var _itk_wasm_free_all = (Module['_itk_wasm_free_all'] = () =>
			(_itk_wasm_free_all = Module['_itk_wasm_free_all'] = wasmExports['R'])());
		var _setThrew = (a0, a1) => (_setThrew = wasmExports['T'])(a0, a1);
		var stackSave = () => (stackSave = wasmExports['U'])();
		var stackRestore = (a0) => (stackRestore = wasmExports['V'])(a0);
		var stackAlloc = (a0) => (stackAlloc = wasmExports['W'])(a0);
		var ___cxa_increment_exception_refcount = (a0) =>
			(___cxa_increment_exception_refcount = wasmExports['__cxa_increment_exception_refcount'])(a0);
		var ___cxa_is_pointer_type = (a0) => (___cxa_is_pointer_type = wasmExports['X'])(a0);
		function invoke_vi(index, a1) {
			var sp = stackSave();
			try {
				getWasmTableEntry(index)(a1);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_iiii(index, a1, a2, a3) {
			var sp = stackSave();
			try {
				return getWasmTableEntry(index)(a1, a2, a3);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_vii(index, a1, a2) {
			var sp = stackSave();
			try {
				getWasmTableEntry(index)(a1, a2);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_ii(index, a1) {
			var sp = stackSave();
			try {
				return getWasmTableEntry(index)(a1);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_iiiii(index, a1, a2, a3, a4) {
			var sp = stackSave();
			try {
				return getWasmTableEntry(index)(a1, a2, a3, a4);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
			var sp = stackSave();
			try {
				return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function invoke_viiii(index, a1, a2, a3, a4) {
			var sp = stackSave();
			try {
				getWasmTableEntry(index)(a1, a2, a3, a4);
			} catch (e) {
				stackRestore(sp);
				if (e !== e + 0) throw e;
				_setThrew(1, 0);
			}
		}
		function applySignatureConversions(wasmExports) {
			wasmExports = Object.assign({}, wasmExports);
			var makeWrapper_p = (f) => () => f() >>> 0;
			var makeWrapper_pp = (f) => (a0) => f(a0) >>> 0;
			wasmExports['U'] = makeWrapper_p(wasmExports['U']);
			wasmExports['W'] = makeWrapper_pp(wasmExports['W']);
			return wasmExports;
		}
		Module['addRunDependency'] = addRunDependency;
		Module['removeRunDependency'] = removeRunDependency;
		Module['FS_createPath'] = FS.createPath;
		Module['FS_createLazyFile'] = FS.createLazyFile;
		Module['FS_createDevice'] = FS.createDevice;
		Module['callMain'] = callMain;
		Module['stackSave'] = stackSave;
		Module['stackRestore'] = stackRestore;
		Module['ccall'] = ccall;
		Module['cwrap'] = cwrap;
		Module['UTF8ToString'] = UTF8ToString;
		Module['stringToUTF8'] = stringToUTF8;
		Module['lengthBytesUTF8'] = lengthBytesUTF8;
		Module['writeArrayToMemory'] = writeArrayToMemory;
		Module['FS_createPreloadedFile'] = FS.createPreloadedFile;
		Module['FS_createDataFile'] = FS.createDataFile;
		Module['FS_unlink'] = FS.unlink;
		var calledRun;
		dependenciesFulfilled = function runCaller() {
			if (!calledRun) run();
			if (!calledRun) dependenciesFulfilled = runCaller;
		};
		function callMain(args = []) {
			var entryFunction = _main;
			args.unshift(thisProgram);
			var argc = args.length;
			var argv = stackAlloc((argc + 1) * 4);
			var argv_ptr = argv;
			args.forEach((arg) => {
				HEAPU32[(argv_ptr >>> 2) >>> 0] = stringToUTF8OnStack(arg);
				argv_ptr += 4;
			});
			HEAPU32[(argv_ptr >>> 2) >>> 0] = 0;
			try {
				var ret = entryFunction(argc, argv);
				exitJS(ret, true);
				return ret;
			} catch (e) {
				return handleException(e);
			}
		}
		function run(args = arguments_) {
			if (runDependencies > 0) {
				return;
			}
			preRun();
			if (runDependencies > 0) {
				return;
			}
			function doRun() {
				if (calledRun) return;
				calledRun = true;
				Module['calledRun'] = true;
				if (ABORT) return;
				initRuntime();
				preMain();
				readyPromiseResolve(Module);
				if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();
				if (shouldRunNow) callMain(args);
				postRun();
			}
			if (Module['setStatus']) {
				Module['setStatus']('Running...');
				setTimeout(function () {
					setTimeout(function () {
						Module['setStatus']('');
					}, 1);
					doRun();
				}, 1);
			} else {
				doRun();
			}
		}
		if (Module['preInit']) {
			if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
			while (Module['preInit'].length > 0) {
				Module['preInit'].pop()();
			}
		}
		var shouldRunNow = false;
		if (Module['noInitialRun']) shouldRunNow = false;
		run();
		Module.mountContainingDir = function (filePath) {
			if (!ENVIRONMENT_IS_NODE) {
				return;
			}
			var path = require('path');
			var containingDir = path.dirname(filePath);
			if (containingDir === '/') {
				throw new Error('Cannot mount root directory');
			}
			var currentDir = '/';
			var splitContainingDir = containingDir.split(path.sep);
			for (var ii = 1; ii < splitContainingDir.length; ii++) {
				currentDir += splitContainingDir[ii];
				if (!FS.analyzePath(currentDir).exists) {
					FS.mkdir(currentDir);
				}
				currentDir += '/';
			}
			FS.mount(NODEFS, { root: containingDir }, currentDir);
			return currentDir + path.basename(filePath);
		};
		Module.unmountContainingDir = function (filePath) {
			if (!ENVIRONMENT_IS_NODE) {
				return;
			}
			var path = require('path');
			var containingDir = path.dirname(filePath);
			FS.unmount(containingDir);
		};
		Module.mountDir = function (dir) {
			if (!ENVIRONMENT_IS_NODE) {
				return;
			}
			if (dir === '/') {
				throw new Error('Cannot mount root directory');
			}
			var currentDir = '/';
			var path = require('path');
			var splitDir = dir.split(path.sep);
			for (var ii = 1; ii < splitDir.length; ii++) {
				currentDir += splitDir[ii];
				if (!FS.analyzePath(currentDir).exists) {
					FS.mkdir(currentDir);
				}
				currentDir += '/';
			}
			FS.mount(NODEFS, { root: dir }, currentDir);
			return currentDir;
		};
		Module.unmountDir = function (dir) {
			if (!ENVIRONMENT_IS_NODE) {
				return;
			}
			FS.unmount(dir);
		};
		Module.fs_mkdirs = function (dirs) {
			var currentDir = '/';
			var splitDirs = dirs.split('/');
			for (var ii = 1; ii < splitDirs.length; ++ii) {
				currentDir += splitDirs[ii];
				if (!FS.analyzePath(currentDir).exists) {
					FS.mkdir(currentDir);
				}
				currentDir += '/';
			}
		};
		Module.fs_readFile = function (path, opts) {
			return FS.readFile(path, opts);
		};
		Module.fs_writeFile = function (path, data, opts) {
			return FS.writeFile(path, data, opts);
		};
		Module.fs_unlink = function (path) {
			return FS.unlink(path);
		};
		Module.fs_open = function (path, flags, mode) {
			return FS.open(path, flags, mode);
		};
		Module.fs_stat = function (path) {
			return FS.stat(path);
		};
		Module.fs_read = function (stream, buffer, offset, length, position) {
			return FS.read(stream, buffer, offset, length, position);
		};
		Module.fs_close = function (stream) {
			return FS.close(stream);
		};

		return moduleArg.ready;
	};
})();
export default readDicomTags;
