/*
 * SPDX-FileCopyrightText: Simon Gündling and other chiptune2.js contributors
 * SPDX-License-Identifier: MIT
 */

/* eslint-disable */

const ChiptuneAudioContext: typeof AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

let libopenmpt: any;
let libopenmptLoadPromise: Promise<void> | undefined;


export class ChiptuneJsConfig {
	repeatCount: number | undefined;
	context: AudioContext | undefined;

	constructor(repeatCount?: number, context?: AudioContext) {
		this.repeatCount = repeatCount;
		this.context = context;
	}
}

export class ChiptuneJsPlayer {
	config: ChiptuneJsConfig;
	audioContext: AudioContext;
	context: GainNode;
	currentPlayingNode: any = null;
	handlers: { eventName: string; handler: (response?: any) => void }[] = [];
	touchLocked = true;
	volume = 1;
	buffer: any;

	constructor(config: ChiptuneJsConfig) {
		this.config = config;
		this.audioContext = config.context || new ChiptuneAudioContext();
		this.context = this.audioContext.createGain();
	}

	initialize() {
		if (libopenmptLoadPromise) return libopenmptLoadPromise;
		if (libopenmpt) return Promise.resolve();

		libopenmptLoadPromise = new Promise<void>(async (resolve, reject) => {
			try {
				const { Module } = await import('./libopenmpt/libopenmpt.js');
				await new Promise((resolve) => {
					Module['onRuntimeInitialized'] = resolve;
				})
				libopenmpt = Module;
				resolve()
			} catch (e) {
				reject(e)
			} finally {
				libopenmptLoadPromise = undefined;
			}
		})

		return libopenmptLoadPromise;
	}

	fireEvent(eventName: string, response?: any) {
		const handlers = this.handlers;
		if (handlers.length > 0) {
			for(const handler of handlers) {
				if (handler.eventName === eventName) {
					handler.handler(response);
				}
			}
	}
	}

	addHandler(eventName: string, handler: (response?: any) => void) {
		this.handlers.push({ eventName, handler });
	}

	onEnded(handler: (response?: any) => void) {
		this.addHandler('onEnded', handler);
	}

	onError(handler: (response?: any) => void) {
		this.addHandler('onError', handler);
	}

	duration() {
		return libopenmpt._openmpt_module_get_duration_seconds(this.currentPlayingNode.modulePtr);
	}

	position() {
		return libopenmpt._openmpt_module_get_position_seconds(this.currentPlayingNode.modulePtr);
	}

	seek(position: number) {
		if (this.currentPlayingNode) {
			libopenmpt._openmpt_module_set_position_seconds(this.currentPlayingNode.modulePtr, position);
	}
	}

	metadata() {
		const data: Record<string, string> = {};
		const keys = libopenmpt.UTF8ToString(libopenmpt._openmpt_module_get_metadata_keys(this.currentPlayingNode.modulePtr)).split(';');
		let keyNameBuffer = 0;
		for (const key of keys) {
			keyNameBuffer = libopenmpt._malloc(key.length + 1);
			libopenmpt.writeAsciiToMemory(key, keyNameBuffer);
			data[key] = libopenmpt.UTF8ToString(libopenmpt._openmpt_module_get_metadata(this.currentPlayingNode.modulePtr, keyNameBuffer));
			libopenmpt._free(keyNameBuffer);
	}
	return data;
	}

	unlock() {
		const context = this.audioContext;
		const buffer = context.createBuffer(1, 1, 22050);
		const unlockSource = context.createBufferSource();
		unlockSource.buffer = buffer;
		unlockSource.connect(this.context);
		this.context.connect(context.destination);
		unlockSource.start(0);
		this.touchLocked = false;
	}

	load(input: File | string): Promise<ArrayBuffer> {
		return this.initialize().then(() => new Promise<ArrayBuffer>((resolve, reject) => {
			if(this.touchLocked) {
				this.unlock();
			}
			const player = this;
			if (input instanceof File) {
				const reader = new FileReader();
				reader.onload = () => {
					resolve(reader.result as ArrayBuffer);
				};
				reader.readAsArrayBuffer(input);
			} else {
				window.fetch(input).then((response) => {
					response.arrayBuffer().then((arrayBuffer) => {
						resolve(arrayBuffer);
					}).catch((error) => {
						reject(error);
					});
				}).catch((error) => {
					reject(error);
				});
			}
		}));
	}

	play(buffer: ArrayBuffer | null) {
		if (buffer === null) return;
		this.unlock();
		this.stop();
		const processNode = this.createLibopenmptNode(buffer, this.buffer);
		if (processNode === null) {
			return;
	}
	libopenmpt._openmpt_module_set_repeat_count(processNode.modulePtr, this.config.repeatCount || 0);
	this.currentPlayingNode = processNode;
	processNode.connect(this.context);
	this.context.connect(this.audioContext.destination);
	}

	stop() {
		if (this.currentPlayingNode != null) {
			this.currentPlayingNode.disconnect();
			this.currentPlayingNode.cleanup();
			this.currentPlayingNode = null;
	}
	}

	togglePause() {
		if (this.currentPlayingNode != null) {
			this.currentPlayingNode.togglePause();
	}
	}

	getPattern() {
		if (this.currentPlayingNode && this.currentPlayingNode.modulePtr) {
			return libopenmpt._openmpt_module_get_current_pattern(this.currentPlayingNode.modulePtr);
	}
	return 0;
	}

	getRow() {
		if (this.currentPlayingNode && this.currentPlayingNode.modulePtr) {
			return libopenmpt._openmpt_module_get_current_row(this.currentPlayingNode.modulePtr);
	}
	return 0;
	}

	getNumPatterns() {
		if (this.currentPlayingNode && this.currentPlayingNode.modulePtr) {
			return libopenmpt._openmpt_module_get_num_patterns(this.currentPlayingNode.modulePtr);
	}
	return 0;
	}

	getCurrentSpeed() {
		if (this.currentPlayingNode && this.currentPlayingNode.modulePtr) {
			return libopenmpt._openmpt_module_get_current_speed(this.currentPlayingNode.modulePtr);
	}
	return 0;
	}

	getCurrentTempo() {
		if (this.currentPlayingNode && this.currentPlayingNode.modulePtr) {
			return libopenmpt._openmpt_module_get_current_tempo(this.currentPlayingNode.modulePtr);
	}
	return 0;
	}

	getPatternNumRows(pattern: number) {
		if (this.currentPlayingNode && this.currentPlayingNode.modulePtr) {
			return libopenmpt._openmpt_module_get_pattern_num_rows(this.currentPlayingNode.modulePtr, pattern);
	}
	return 0;
	}

	getPatternRowChannel(pattern: number, row: number, channel: number) {
		if (this.currentPlayingNode && this.currentPlayingNode.modulePtr) {
			return libopenmpt.UTF8ToString(libopenmpt._openmpt_module_format_pattern_row_channel(this.currentPlayingNode.modulePtr, pattern, row, channel, 0, true));
	}
	return '';
	}

	getCtls() {
		if (this.currentPlayingNode && this.currentPlayingNode.modulePtr) {
			return libopenmpt._openmpt_module_get_ctls(this.currentPlayingNode.modulePtr);
	}
	return 0;
	}

	version() {
		if (this.currentPlayingNode && this.currentPlayingNode.modulePtr) {
			return libopenmpt._openmpt_get_library_version();
	}
	return 0;
	}

	createLibopenmptNode(buffer: ArrayBuffer, config: object) {
		const maxFramesPerChunk = 4096;
		const processNode: any = this.audioContext.createScriptProcessor(2048, 0, 2);
		processNode.config = config;
		processNode.player = this;
		const byteArray = new Int8Array(buffer);
		const ptrToFile = libopenmpt._malloc(byteArray.byteLength);
		libopenmpt.HEAPU8.set(byteArray, ptrToFile);
		processNode.modulePtr = libopenmpt._openmpt_module_create_from_memory(ptrToFile, byteArray.byteLength, 0, 0, 0);
		processNode.nbChannels = libopenmpt._openmpt_module_get_num_channels(processNode.modulePtr);
		processNode.patternIndex = -1;
		processNode.paused = false;
		processNode.leftBufferPtr = libopenmpt._malloc(4 * maxFramesPerChunk);
		processNode.rightBufferPtr = libopenmpt._malloc(4 * maxFramesPerChunk);
		processNode.perf = { 'current': 0, 'max': 0 };
		processNode.cleanup = function (this: any) {
			if (this.modulePtr !== 0) {
				libopenmpt._openmpt_module_destroy(this.modulePtr);
				this.modulePtr = 0;
			}
			if (this.leftBufferPtr !== 0) {
				libopenmpt._free(this.leftBufferPtr);
				this.leftBufferPtr = 0;
			}
			if (this.rightBufferPtr !== 0) {
				libopenmpt._free(this.rightBufferPtr);
				this.rightBufferPtr = 0;
			}
		};
		processNode.stop = function (this: any) {
			this.disconnect();
			this.cleanup();
		};
		processNode.pause = function (this: any) {
			this.paused = true;
		};
		processNode.unpause = function (this: any) {
			this.paused = false;
		};
		processNode.togglePause = function (this: any) {
			this.paused = !this.paused;
		};
		processNode.getProcessTime = function (this: any) {
			const max = this.perf.max;
			this.perf.max = 0;
			return { 'current': this.perf.current, 'max': max };
		};
		processNode.onaudioprocess = function (this: any, e: any) {
			let startTimeP1 = performance.now();
			const outputL = e.outputBuffer.getChannelData(0);
			const outputR = e.outputBuffer.getChannelData(1);
			let framesToRender = outputL.length;
			if (this.ModulePtr === 0) {
				for (let i = 0; i < framesToRender; ++i) {
					outputL[i] = 0;
					outputR[i] = 0;
				}
				this.disconnect();
				this.cleanup();
				return;
			}
			if (this.paused) {
				for (let i = 0; i < framesToRender; ++i) {
					outputL[i] = 0;
					outputR[i] = 0;
				}
				return;
			}
			let framesRendered = 0;
			let ended = false;
			let error = false;

			const currentPattern = libopenmpt._openmpt_module_get_current_pattern(this.modulePtr);
			const currentRow = libopenmpt._openmpt_module_get_current_row(this.modulePtr);
			startTimeP1 = startTimeP1 - performance.now();
			if (currentPattern !== this.patternIndex) {
				processNode.player.fireEvent('onPatternChange');
			}
			processNode.player.fireEvent('onRowChange', { index: currentRow });

			const startTimeP2 = performance.now();
			while (framesToRender > 0) {
				const framesPerChunk = Math.min(framesToRender, maxFramesPerChunk);
				const actualFramesPerChunk = libopenmpt._openmpt_module_read_float_stereo(this.modulePtr, this.context.sampleRate, framesPerChunk, this.leftBufferPtr, this.rightBufferPtr);
				if (actualFramesPerChunk === 0) {
					ended = true;
					// modulePtr will be 0 on openmpt: error: openmpt_module_read_float_stereo: ERROR: module * not valid or other openmpt error
					error = !this.modulePtr;
				}
				const rawAudioLeft = libopenmpt.HEAPF32.subarray(this.leftBufferPtr / 4, this.leftBufferPtr / 4 + actualFramesPerChunk);
				const rawAudioRight = libopenmpt.HEAPF32.subarray(this.rightBufferPtr / 4, this.rightBufferPtr / 4 + actualFramesPerChunk);
				for (let i = 0; i < actualFramesPerChunk; ++i) {
					outputL[framesRendered + i] = rawAudioLeft[i];
					outputR[framesRendered + i] = rawAudioRight[i];
				}
				for (let i = actualFramesPerChunk; i < framesPerChunk; ++i) {
					outputL[framesRendered + i] = 0;
					outputR[framesRendered + i] = 0;
				}
				framesToRender -= framesPerChunk;
				framesRendered += framesPerChunk;
			}
			if (ended) {
				this.disconnect();
				this.cleanup();
				error ? processNode.player.fireEvent('onError', { type: 'openmpt' }) : processNode.player.fireEvent('onEnded');
			}
			this.perf.current = performance.now() - startTimeP2 + startTimeP1;
			if (this.perf.current > this.perf.max) this.perf.max = this.perf.current;
		};
		return processNode;
	}
}
