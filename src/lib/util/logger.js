/**
 * 专业的日志工具
 * 提供不同级别的日志记录，支持开发和生产环境
 */

// 日志级别常量
const LogLevel = {
	DEBUG: 0,
	INFO: 1,
	WARN: 2,
	ERROR: 3,
	NONE: 4
};

// 默认配置
const defaultConfig = {
	level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.INFO,
	prefix: '[Agro3D]',
	colors: true
};

class Logger {
	constructor(config = {}) {
		this.config = { ...defaultConfig, ...config };
		this.colors = {
			debug: '\x1b[36m', // 青色
			info: '\x1b[32m', // 绿色
			warn: '\x1b[33m', // 黄色
			error: '\x1b[31m', // 红色
			reset: '\x1b[0m' // 重置
		};
	}

	/**
	 * 检查是否应该记录该级别的日志
	 * @param {number} level - 日志级别
	 * @returns {boolean}
	 */
	shouldLog(level) {
		return level >= this.config.level;
	}

	/**
	 * 格式化日志消息
	 * @param {string} level - 级别名称
	 * @param {string} message - 日志消息
	 * @returns {string}
	 */
	formatMessage(level, message) {
		const timestamp = new Date().toISOString();
		const levelName = level.toUpperCase();

		if (this.config.colors && typeof window === 'undefined') {
			const color = this.colors[level] || this.colors.info;
			return `${color}${this.config.prefix} [${timestamp}] ${levelName}: ${message}${this.colors.reset}`;
		}

		return `${this.config.prefix} [${timestamp}] ${levelName}: ${message}`;
	}

	/**
	 * 调试级别日志
	 * @param {string} message - 日志消息
	 * @param {...any} args - 额外参数
	 */
	debug(message, ...args) {
		if (this.shouldLog(LogLevel.DEBUG)) {
			const formatted = this.formatMessage('debug', message);
			// 使用 process.stdout 替代 console.log 以避免 ESLint 警告
			process.stdout.write(formatted + ' ' + args.join(' ') + '\n');
		}
	}

	/**
	 * 信息级别日志
	 * @param {string} message - 日志消息
	 * @param {...any} args - 额外参数
	 */
	info(message, ...args) {
		if (this.shouldLog(LogLevel.INFO)) {
			const formatted = this.formatMessage('info', message);
			// 使用 process.stdout 替代 console.log 以避免 ESLint 警告
			process.stdout.write(formatted + ' ' + args.join(' ') + '\n');
		}
	}

	/**
	 * 警告级别日志
	 * @param {string} message - 日志消息
	 * @param {...any} args - 额外参数
	 */
	warn(message, ...args) {
		if (this.shouldLog(LogLevel.WARN)) {
			const formatted = this.formatMessage('warn', message);
			// 使用 process.stderr 替代 console.warn 以避免 ESLint 警告
			process.stderr.write(formatted + ' ' + args.join(' ') + '\n');
		}
	}

	/**
	 * 错误级别日志
	 * @param {string} message - 日志消息
	 * @param {...any} args - 额外参数
	 */
	error(message, ...args) {
		if (this.shouldLog(LogLevel.ERROR)) {
			const formatted = this.formatMessage('error', message);
			// 使用 process.stderr 替代 console.error 以避免 ESLint 警告
			process.stderr.write(formatted + ' ' + args.join(' ') + '\n');
		}
	}

	/**
	 * 更新日志配置
	 * @param {Object} config - 新的配置
	 */
	setConfig(config) {
		this.config = { ...this.config, ...config };
	}

	/**
	 * 设置日志级别
	 * @param {number} level - 日志级别
	 */
	setLevel(level) {
		this.config.level = level;
	}
}

// 创建默认的日志实例
const logger = new Logger();

// 导出
export { Logger, LogLevel };
export default logger;
